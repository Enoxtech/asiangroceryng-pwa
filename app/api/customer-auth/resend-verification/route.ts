import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { getCustomerSession } from '@/lib/customerAuth';
import { checkRateLimit } from '@/lib/rateLimit';
import { getClientIp } from '@/lib/audit';
import { sendMail, buildVerifyEmailHtml } from '@/lib/email';

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  const session = await getCustomerSession(req);
  if (!session) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  if (session.emailVerified) return NextResponse.json({ ok: true, alreadyVerified: true });

  const ip = getClientIp(req);
  const ok = await checkRateLimit(`customer-resend-verify:${ip}`, 3, 15 * 60 * 1000);
  if (!ok) return NextResponse.json({ error: 'Please wait before requesting another email.' }, { status: 429 });

  const verifyToken = crypto.randomBytes(32).toString('hex');
  await prisma.customer.update({
    where: { id: session.id },
    data: { verifyToken, verifyTokenExpires: new Date(Date.now() + VERIFY_TTL_MS) },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://asiangroceryng-pwa.vercel.app';
  const link = `${appUrl}/verify-email?token=${verifyToken}`;
  await sendMail(session.email, 'Verify your email — Asian Grocery Nigeria', buildVerifyEmailHtml(session.name, link));

  return NextResponse.json({ ok: true });
}
