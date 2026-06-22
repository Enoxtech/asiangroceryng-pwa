import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { verifyTotpCode } from '@/lib/totp';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { code } = await req.json();
  const user = await prisma.adminUser.findUnique({ where: { id: session.id } });
  if (!user?.totpSecret) {
    return NextResponse.json({ error: 'Start 2FA setup first' }, { status: 400 });
  }

  if (!verifyTotpCode(user.totpSecret, code)) {
    return NextResponse.json({ error: 'Invalid verification code' }, { status: 401 });
  }

  await prisma.adminUser.update({ where: { id: session.id }, data: { totpEnabled: true } });
  await logAudit(req, session, 'enable_2fa', 'AdminUser', session.id);
  return NextResponse.json({ ok: true });
}
