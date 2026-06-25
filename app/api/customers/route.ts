import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { response } = await requireRole(req, ['super_admin', 'support', 'product_manager']);
  if (response) return response;

  const customers = await prisma.customer.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      emailVerified: true,
      createdAt: true,
      orders: { select: { total: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const result = customers.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    emailVerified: c.emailVerified,
    joined: c.createdAt,
    orders: c.orders.length,
    spent: c.orders.reduce((sum, o) => sum + o.total, 0),
  }));

  return NextResponse.json(result);
}
