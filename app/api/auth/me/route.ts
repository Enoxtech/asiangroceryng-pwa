import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) return NextResponse.json({ session: null }, { status: 401 });

  const user = await prisma.adminUser.findUnique({ where: { id: session.id }, select: { totpEnabled: true } });
  return NextResponse.json({ session: { ...session, totpEnabled: user?.totpEnabled ?? false } });
}
