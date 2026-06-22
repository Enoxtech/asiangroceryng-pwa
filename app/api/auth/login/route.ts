import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  verifyPassword,
  setSessionCookie,
  setPending2faCookie,
  isLockedOut,
  recordFailedLogin,
  resetFailedLogins,
} from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { getClientIp, logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  // Defense in depth: cap login attempts per IP regardless of which email is targeted,
  // on top of the per-account lockout below.
  const ipOk = await checkRateLimit(`login:${ip}`, 20, 15 * 60 * 1000);
  if (!ipOk) {
    return NextResponse.json({ error: 'Too many login attempts. Please try again later.' }, { status: 429 });
  }

  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  const user = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !user.active) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  if (isLockedOut(user)) {
    const minutesLeft = Math.ceil(((user.lockedUntil as Date).getTime() - Date.now()) / 60000);
    return NextResponse.json(
      { error: `Account temporarily locked due to repeated failed attempts. Try again in ${minutesLeft} minute(s).` },
      { status: 423 }
    );
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    await recordFailedLogin(user.id, user.failedLoginAttempts);
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  await resetFailedLogins(user.id);
  const session = { id: user.id, name: user.name, email: user.email, role: user.role };

  if (user.totpEnabled) {
    const res = NextResponse.json({ requires2FA: true });
    setPending2faCookie(res, user.id);
    return res;
  }

  const res = NextResponse.json(session);
  setSessionCookie(res, session, user.sessionVersion);
  await logAudit(req, session, 'login', 'AdminUser', user.id);
  return res;
}
