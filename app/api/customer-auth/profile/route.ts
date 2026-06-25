import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCustomerSession } from '@/lib/customerAuth';

export async function PATCH(req: NextRequest) {
  const session = await getCustomerSession(req);
  if (!session) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const body = await req.json();
  const data: Record<string, string> = {};
  if (typeof body.name === 'string' && body.name.trim()) data.name = body.name.trim();
  if (typeof body.phone === 'string' && body.phone.trim()) data.phone = body.phone.trim();
  if (typeof body.address === 'string') data.address = body.address.trim();

  const user = await prisma.customer.update({ where: { id: session.id }, data });
  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    address: user.address,
    emailVerified: user.emailVerified,
  });
}
