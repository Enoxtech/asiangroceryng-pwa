import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireRole(req, ['super_admin', 'support']);
  if (response) return response;

  const { id } = await params;
  const body = await req.json();
  const order = await prisma.order.update({
    where: { id },
    data: { status: body.status },
    include: { items: true },
  });
  return NextResponse.json(order);
}
