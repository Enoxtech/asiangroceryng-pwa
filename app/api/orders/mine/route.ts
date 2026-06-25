import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCustomerSession } from '@/lib/customerAuth';

export async function GET(req: NextRequest) {
  const session = await getCustomerSession(req);
  if (!session) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: { customerId: session.id },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(orders);
}
