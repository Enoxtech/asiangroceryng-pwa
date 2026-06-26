import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rateLimit';
import { getClientIp } from '@/lib/audit';
import { sendMail, buildResetPasswordEmailHtml, NOREPLY_FROM } from '@/lib/email';

const RESET_TTL_MS = 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const ok = await checkRateLimit(`customer-forgot-password:${ip}`, 5, 15 * 60 * 1000);
  if (!ok) return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });

  const body = await req.json();
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

  const user = email ? await prisma.customer.findUnique({ where: { email } }) : null;

  // Always respond the same way, whether or not the account exists — avoids
  // leaking which emails are registered.
  if (user) {
    const resetToken = crypto.randomBytes(32).toString('hex');
    await prisma.customer.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpires: new Date(Date.now() + RESET_TTL_MS) },
    });
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://asiangroceryng-pwa.vercel.app';
    const link = `${appUrl}/reset-password?token=${resetToken}`;
    await sendMail(email, 'Reset your password — Asian Grocery Nigeria', buildResetPasswordEmailHtml(user.name, link), NOREPLY_FROM);
  }

  return NextResponse.json({ ok: true });
}
