import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import type { AdminRole } from '@/lib/generated/prisma/client';

const SESSION_COOKIE = 'agng_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

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

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function signSessionToken(payload: AdminSession): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: SESSION_TTL_SECONDS });
}

export function setSessionCookie(res: NextResponse, payload: AdminSession) {
  const token = signSessionToken(payload);
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
 * so a deactivated admin or a role change takes effect immediately rather than
 * waiting for the (up to 7-day) token to expire.
 */
export async function getAdminSession(req: NextRequest): Promise<AdminSession | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  let decoded: AdminSession;
  try {
    decoded = jwt.verify(token, getJwtSecret()) as AdminSession;
  } catch {
    return null;
  }

  const user = await prisma.adminUser.findUnique({ where: { id: decoded.id } });
  if (!user || !user.active) return null;

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
