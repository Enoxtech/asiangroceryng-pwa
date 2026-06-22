import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPending2faUserId, clearPending2faCookie, setSessionCookie } from '@/lib/auth';
import { verifyTotpCode } from '@/lib/totp';
import { checkRateLimit } from '@/lib/rateLimit';
import { getClientIp, logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const ipOk = await checkRateLimit(`2fa:${ip}`, 20, 15 * 60 * 1000);
  if (!ipOk) {
    return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
  }

  const userId = getPending2faUserId(req);
  if (!userId) {
    return NextResponse.json({ error: 'Your login session expired. Please sign in again.' }, { status: 401 });
  }

  const { code } = await req.json();
  if (!code) {
    return NextResponse.json({ error: 'Verification code is required' }, { status: 400 });
  }

  const user = await prisma.adminUser.findUnique({ where: { id: userId } });
  if (!user || !user.active || !user.totpEnabled || !user.totpSecret) {
    return NextResponse.json({ error: 'Two-factor authentication is not available for this account' }, { status: 401 });
  }

  if (!verifyTotpCode(user.totpSecret, code)) {
    return NextResponse.json({ error: 'Invalid verification code' }, { status: 401 });
  }

  const session = { id: user.id, name: user.name, email: user.email, role: user.role };
  const res = NextResponse.json(session);
  setSessionCookie(res, session, user.sessionVersion);
  clearPending2faCookie(res);
  await prisma.adminUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await logAudit(req, session, 'login_2fa', 'AdminUser', user.id);
  return res;
}
