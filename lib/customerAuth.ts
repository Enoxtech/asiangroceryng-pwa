import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const SESSION_COOKIE = 'agng_customer_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return secret;
}

export interface CustomerSession {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string | null;
  emailVerified: boolean;
}

interface SessionTokenPayload {
  id: string;
  sv: number;
}

export function setCustomerSessionCookie(res: NextResponse, customerId: string, sessionVersion: number) {
  const token = jwt.sign({ id: customerId, sv: sessionVersion }, getJwtSecret(), { expiresIn: SESSION_TTL_SECONDS });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearCustomerSessionCookie(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
}

/**
 * Reads + verifies the session JWT, then re-checks the account in the database
 * so a password reset ("log out everywhere") takes effect immediately.
 */
export async function getCustomerSession(req: NextRequest): Promise<CustomerSession | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  let decoded: SessionTokenPayload;
  try {
    decoded = jwt.verify(token, getJwtSecret()) as SessionTokenPayload;
  } catch {
    return null;
  }

  const user = await prisma.customer.findUnique({ where: { id: decoded.id } });
  if (!user) return null;
  if (user.sessionVersion !== decoded.sv) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    address: user.address,
    emailVerified: user.emailVerified,
  };
}

export function isLockedOut(user: { lockedUntil: Date | null }): boolean {
  return !!user.lockedUntil && user.lockedUntil.getTime() > Date.now();
}

export async function recordFailedLogin(customerId: string, currentAttempts: number) {
  const attempts = currentAttempts + 1;
  const data: { failedLoginAttempts: number; lockedUntil?: Date } = { failedLoginAttempts: attempts };
  if (attempts >= MAX_FAILED_ATTEMPTS) {
    data.lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
  }
  await prisma.customer.update({ where: { id: customerId }, data });
}

export async function resetFailedLogins(customerId: string) {
  await prisma.customer.update({
    where: { id: customerId },
    data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
  });
}
