import { after, NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { sendPaidOrderNotifications } from '@/lib/paidOrderNotifications';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireRole(req, ['super_admin', 'support']);
  if (response) return response;

  const { id } = await params;
  const body = await req.json();
  const current = await prisma.order.findUnique({ where: { id } });
  if (!current) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });

  if (body.action === 'confirm_payment') {
    if (current.payment !== 'bank_transfer') {
      return NextResponse.json({ error: 'Only bank-transfer orders can be confirmed manually.' }, { status: 400 });
    }
    if (current.status === 'cancelled') {
      return NextResponse.json({ error: 'A cancelled order cannot be marked as paid.' }, { status: 409 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const claimed = await tx.order.updateMany({
        where: { id, paymentStatus: { not: 'paid' } },
        data: {
          paymentStatus: 'paid',
          paymentProvider: 'manual',
          paidAt: new Date(),
          status: 'confirmed',
        },
      });
      if (claimed.count > 0 && current.couponCode) {
        await tx.coupon.updateMany({
          where: { code: current.couponCode },
          data: { usageCount: { increment: 1 } },
        });
      }
      const order = await tx.order.findUnique({ where: { id }, include: { items: true } });
      return { order, newlyPaid: claimed.count > 0 };
    });

    if (!result.order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    if (result.newlyPaid) {
      await logAudit(req, session, 'confirm_payment', 'Order', id, { paymentStatus: 'paid', status: 'confirmed' });
      after(() => sendPaidOrderNotifications(id));
    }
    return NextResponse.json(result.order);
  }

  if (current.payment === 'bank_transfer'
    && current.paymentStatus !== 'paid'
    && body.status !== 'cancelled') {
    return NextResponse.json({ error: 'Confirm receipt of the bank transfer before processing this order.' }, { status: 409 });
  }
  const order = await prisma.order.update({
    where: { id },
    data: { status: body.status },
    include: { items: true },
  });

  await logAudit(req, session, 'update_status', 'Order', id, { status: body.status });

  return NextResponse.json(order);
}
