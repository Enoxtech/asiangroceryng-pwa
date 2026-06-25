import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, validatePasswordStrength } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { getClientIp } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const ok = await checkRateLimit(`customer-reset-password:${ip}`, 10, 15 * 60 * 1000);
  if (!ok) return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });

  const body = await req.json();
  const token = typeof body.token === 'string' ? body.token : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  const passwordError = validatePasswordStrength(password);
  if (passwordError) return NextResponse.json({ error: passwordError }, { status: 400 });

  const user = await prisma.customer.findUnique({ where: { resetToken: token } });
  if (!user || !user.resetTokenExpires || user.resetTokenExpires.getTime() < Date.now()) {
    return NextResponse.json({ error: 'This reset link is invalid or has expired' }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);
  await prisma.customer.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpires: null,
      sessionVersion: { increment: 1 },
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  return NextResponse.json({ ok: true });
}
