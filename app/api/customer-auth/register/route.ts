import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { hashPassword, validatePasswordStrength } from '@/lib/auth';
import { setCustomerSessionCookie } from '@/lib/customerAuth';
import { checkRateLimit } from '@/lib/rateLimit';
import { getClientIp } from '@/lib/audit';
import { sendMail, buildVerifyEmailHtml } from '@/lib/email';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const ok = await checkRateLimit(`customer-register:${ip}`, 5, 60 * 60 * 1000);
  if (!ok) {
    return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
  }

  const body = await req.json();
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const address = typeof body.address === 'string' ? body.address.trim() : undefined;

  if (!name || !email || !phone) {
    return NextResponse.json({ error: 'Name, email, and phone are required' }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
  }
  const passwordError = validatePasswordStrength(password);
  if (passwordError) {
    return NextResponse.json({ error: passwordError }, { status: 400 });
  }

  const existing = await prisma.customer.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const verifyToken = crypto.randomBytes(32).toString('hex');

  const customer = await prisma.customer.create({
    data: {
      name,
      email,
      phone,
      address,
      passwordHash,
      verifyToken,
      verifyTokenExpires: new Date(Date.now() + VERIFY_TTL_MS),
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://asiangroceryng-pwa.vercel.app';
  const link = `${appUrl}/verify-email?token=${verifyToken}`;
  await sendMail(email, 'Verify your email — Asian Grocery NG', buildVerifyEmailHtml(name, link));

  const res = NextResponse.json({
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    emailVerified: customer.emailVerified,
  }, { status: 201 });
  setCustomerSessionCookie(res, customer.id, customer.sessionVersion);
  return res;
}
