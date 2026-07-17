import { prisma } from '@/lib/prisma';

export interface VerifiedPaystackPayment {
  status: string;
  reference: string;
  amount: number;
  currency: string;
  channel: string;
  id: number;
  paid_at?: string;
  customer: { email: string };
}

export async function markPaystackPaymentPaid(
  reference: string,
  payment: VerifiedPaystackPayment,
): Promise<{ orderId: string; newlyPaid: boolean }> {
  const attempt = await prisma.paymentAttempt.findUnique({
    where: { reference },
    include: { order: true },
  });
  if (!attempt) throw new Error('Unknown payment reference');
  if (attempt.provider !== 'paystack') throw new Error('Unexpected payment provider');
  if (payment.status !== 'success' || payment.reference !== reference) throw new Error('Payment is not successful');
  if (payment.amount !== attempt.amountKobo || payment.currency !== attempt.currency) {
    throw new Error('Payment amount or currency does not match the order');
  }
  if (attempt.order.payment === 'bank_transfer' && payment.channel !== 'bank_transfer') {
    throw new Error('Payment channel does not match the order');
  }
  if (attempt.order.email && payment.customer?.email
    && attempt.order.email.toLowerCase() !== payment.customer.email.toLowerCase()) {
    throw new Error('Payment customer does not match the order');
  }
  if (attempt.status === 'paid') return { orderId: attempt.orderId, newlyPaid: false };

  const paidAt = payment.paid_at ? new Date(payment.paid_at) : new Date();
  const newlyPaid = await prisma.$transaction(async (tx) => {
    const updated = await tx.paymentAttempt.updateMany({
      where: { id: attempt.id, status: { not: 'paid' } },
      data: {
        status: 'paid',
        paidAt,
        providerTransactionId: String(payment.id),
      },
    });
    if (updated.count === 0) return false;

    await tx.order.update({
      where: { id: attempt.orderId },
      data: {
        paymentStatus: 'paid',
        status: 'confirmed',
        paidAt,
        paymentProvider: 'paystack',
        paymentRef: reference,
      },
    });
    if (attempt.order.couponCode) {
      await tx.coupon.updateMany({
        where: { code: attempt.order.couponCode },
        data: { usageCount: { increment: 1 } },
      });
    }
    return true;
  });

  return { orderId: attempt.orderId, newlyPaid };
}

export async function markPaystackPaymentFailed(reference: string): Promise<void> {
  const attempt = await prisma.paymentAttempt.findUnique({ where: { reference } });
  if (!attempt || attempt.status === 'paid') return;
  await prisma.$transaction([
    prisma.paymentAttempt.updateMany({
      where: { id: attempt.id, status: { not: 'paid' } },
      data: { status: 'failed' },
    }),
    prisma.order.updateMany({
      where: { id: attempt.orderId, paymentStatus: { not: 'paid' } },
      data: { paymentStatus: 'failed' },
    }),
  ]);
}

export async function expirePendingPayment(reference: string): Promise<void> {
  const attempt = await prisma.paymentAttempt.findUnique({ where: { reference } });
  if (!attempt || attempt.status !== 'pending') return;
  await prisma.$transaction([
    prisma.paymentAttempt.updateMany({
      where: { id: attempt.id, status: 'pending' },
      data: { status: 'expired' },
    }),
    prisma.order.updateMany({
      where: { id: attempt.orderId, paymentStatus: 'pending' },
      data: { paymentStatus: 'expired' },
    }),
  ]);
}
