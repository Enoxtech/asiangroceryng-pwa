import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import type { AdminRole } from '@/lib/generated/prisma/client';

const SESSION_COOKIE = 'agng_admin_session';
const PENDING_2FA_COOKIE = 'agng_admin_2fa_pending';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const PENDING_2FA_TTL_SECONDS = 60 * 5; // 5 minutes

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return secret;
}

export interface AdminSession {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
}

interface SessionTokenPayload extends AdminSession {
  sv: number; // sessionVersion at time of issuance
}

// ---------------------------------------------------------------------------
// Passwords
// ---------------------------------------------------------------------------

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** Returns an error message if the password is too weak, or null if it's acceptable. */
export function validatePasswordStrength(password: string): string | null {
  if (!password || password.length < 10) return 'Password must be at least 10 characters';
  if (!/[a-zA-Z]/.test(password)) return 'Password must include at least one letter';
  if (!/[0-9]/.test(password)) return 'Password must include at least one number';
  return null;
}

// ---------------------------------------------------------------------------
// Session cookie (full login)
// ---------------------------------------------------------------------------

function signSessionToken(payload: SessionTokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: SESSION_TTL_SECONDS });
}

export function setSessionCookie(res: NextResponse, session: AdminSession, sessionVersion: number) {
  const token = signSessionToken({ ...session, sv: sessionVersion });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
}

/**
 * Reads + verifies the session JWT, then re-checks the account in the database
 * so a deactivated admin, a role change, or a "log out everywhere" takes effect
 * immediately rather than waiting for the (up to 7-day) token to expire.
 */
export async function getAdminSession(req: NextRequest): Promise<AdminSession | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  let decoded: SessionTokenPayload;
  try {
    decoded = jwt.verify(token, getJwtSecret()) as SessionTokenPayload;
  } catch {
    return null;
  }

  const user = await prisma.adminUser.findUnique({ where: { id: decoded.id } });
  if (!user || !user.active) return null;
  if (user.sessionVersion !== decoded.sv) return null; // revoked via "log out everywhere"

  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

/**
 * Enforces that the request comes from an authenticated admin with one of the
 * allowed roles. Returns the session on success, or a ready-to-return
 * NextResponse (401/403) on failure — callers should check `response` first.
 */
export async function requireRole(
  req: NextRequest,
  allowedRoles: AdminRole[]
): Promise<{ session: AdminSession; response: null } | { session: null; response: NextResponse }> {
  const session = await getAdminSession(req);
  if (!session) {
    return { session: null, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  if (!allowedRoles.includes(session.role)) {
    return { session: null, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { session, response: null };
}

// ---------------------------------------------------------------------------
// Pending-2FA cookie (short-lived, set between password check and TOTP check)
// ---------------------------------------------------------------------------

export function setPending2faCookie(res: NextResponse, userId: string) {
  const token = jwt.sign({ id: userId, pending2fa: true }, getJwtSecret(), { expiresIn: PENDING_2FA_TTL_SECONDS });
  res.cookies.set(PENDING_2FA_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: PENDING_2FA_TTL_SECONDS,
  });
}

export function clearPending2faCookie(res: NextResponse) {
  res.cookies.set(PENDING_2FA_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
}

export function getPending2faUserId(req: NextRequest): string | null {
  const token = req.cookies.get(PENDING_2FA_COOKIE)?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { id: string; pending2fa?: boolean };
    return decoded.pending2fa ? decoded.id : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Brute-force protection
// ---------------------------------------------------------------------------

export function isLockedOut(user: { lockedUntil: Date | null }): boolean {
  return !!user.lockedUntil && user.lockedUntil.getTime() > Date.now();
}

export async function recordFailedLogin(userId: string, currentAttempts: number) {
  const attempts = currentAttempts + 1;
  const data: { failedLoginAttempts: number; lockedUntil?: Date } = { failedLoginAttempts: attempts };
  if (attempts >= MAX_FAILED_ATTEMPTS) {
    data.lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
  }
  await prisma.adminUser.update({ where: { id: userId }, data });
}

export async function resetFailedLogins(userId: string) {
  await prisma.adminUser.update({
    where: { id: userId },
    data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
  });
}
