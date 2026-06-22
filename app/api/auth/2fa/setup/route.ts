import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { generateTotpSecret, buildTotpQrCode } from '@/lib/totp';

export async function POST(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const secret = generateTotpSecret();
  await prisma.adminUser.update({ where: { id: session.id }, data: { totpSecret: secret, totpEnabled: false } });

  const qrCode = await buildTotpQrCode(session.email, secret);
  return NextResponse.json({ secret, qrCode });
}
