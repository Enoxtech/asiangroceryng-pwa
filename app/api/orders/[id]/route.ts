import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireRole(req, ['super_admin', 'support']);
  if (response) return response;

  const { id } = await params;
  const body = await req.json();
  const current = await prisma.order.findUnique({ where: { id } });
  if (!current) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  if (current.payment === 'bank_transfer'
    && current.paymentStatus !== 'paid'
    && body.status !== 'cancelled') {
    return NextResponse.json({ error: 'This bank-transfer order cannot be processed until payment is verified.' }, { status: 409 });
  }
  const order = await prisma.order.update({
    where: { id },
    data: { status: body.status },
    include: { items: true },
  });

  await logAudit(req, session, 'update_status', 'Order', id, { status: body.status });

  return NextResponse.json(order);
}
