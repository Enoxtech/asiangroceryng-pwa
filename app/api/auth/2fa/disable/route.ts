import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession, verifyPassword } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { password } = await req.json();
  const user = await prisma.adminUser.findUnique({ where: { id: session.id } });
  if (!user || !(await verifyPassword(password ?? '', user.passwordHash))) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }

  await prisma.adminUser.update({ where: { id: session.id }, data: { totpEnabled: false, totpSecret: null } });
  await logAudit(req, session, 'disable_2fa', 'AdminUser', session.id);
  return NextResponse.json({ ok: true });
}
