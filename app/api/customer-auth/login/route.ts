import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';
import { setCustomerSessionCookie, isLockedOut, recordFailedLogin, resetFailedLogins } from '@/lib/customerAuth';
import { checkRateLimit } from '@/lib/rateLimit';
import { getClientIp } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const ok = await checkRateLimit(`customer-login:${ip}`, 10, 15 * 60 * 1000);
  if (!ok) {
    return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
  }

  const body = await req.json();
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  const user = await prisma.customer.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }
  if (isLockedOut(user)) {
    return NextResponse.json({ error: 'Account temporarily locked due to too many failed attempts. Try again in 15 minutes.' }, { status: 423 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    await recordFailedLogin(user.id, user.failedLoginAttempts);
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  await resetFailedLogins(user.id);

  const res = NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    address: user.address,
    emailVerified: user.emailVerified,
  });
  setCustomerSessionCookie(res, user.id, user.sessionVersion);
  return res;
}
