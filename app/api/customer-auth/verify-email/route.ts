import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const token = typeof body.token === 'string' ? body.token : '';
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

  const user = await prisma.customer.findUnique({ where: { verifyToken: token } });
  if (!user || !user.verifyTokenExpires || user.verifyTokenExpires.getTime() < Date.now()) {
    return NextResponse.json({ error: 'This verification link is invalid or has expired' }, { status: 400 });
  }

  await prisma.customer.update({
    where: { id: user.id },
    data: { emailVerified: true, verifyToken: null, verifyTokenExpires: null },
  });

  return NextResponse.json({ ok: true });
}
