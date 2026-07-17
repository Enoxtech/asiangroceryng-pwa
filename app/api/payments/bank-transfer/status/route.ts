import { after, NextRequest, NextResponse } from 'next/server';
import { getClientIp } from '@/lib/audit';
import { sendPaidOrderNotifications } from '@/lib/paidOrderNotifications';
import { expirePendingPayment, markPaystackPaymentPaid } from '@/lib/paymentService';
import { verifyPaystackTransaction } from '@/lib/paystack';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rateLimit';

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const allowed = await checkRateLimit(`bank-transfer-status:${ip}`, 90, 10 * 60 * 1000);
  if (!allowed) return NextResponse.json({ error: 'Too many status checks. Please wait and try again.' }, { status: 429 });

  const reference = req.nextUrl.searchParams.get('reference')?.trim() || '';
  if (!reference || reference.length > 100) {
    return NextResponse.json({ error: 'Invalid payment reference.' }, { status: 400 });
  }

  let attempt = await prisma.paymentAttempt.findUnique({
    where: { reference },
    include: { order: { select: { id: true, status: true, paymentStatus: true, paidAt: true } } },
  });
  if (!attempt) return NextResponse.json({ error: 'Payment not found.' }, { status: 404 });

  const accountExpired = Boolean(attempt.expiresAt && attempt.expiresAt.getTime() <= Date.now());
  if (attempt.status === 'pending'
    && (accountExpired || !attempt.lastCheckedAt || attempt.lastCheckedAt.getTime() < Date.now() - 15_000)) {
    await prisma.paymentAttempt.update({ where: { reference }, data: { lastCheckedAt: new Date() } });
    try {
      const verified = await verifyPaystackTransaction(reference);
      if (verified?.status === 'success') {
        const result = await markPaystackPaymentPaid(reference, verified);
        if (result.newlyPaid) after(() => sendPaidOrderNotifications(result.orderId));
      }
    } catch {
      // A pending transfer normally returns a non-success response. The webhook remains authoritative.
    }
  }

  if (accountExpired) {
    const current = await prisma.paymentAttempt.findUnique({ where: { reference }, select: { status: true } });
    if (current?.status === 'pending') await expirePendingPayment(reference);
  }

  attempt = await prisma.paymentAttempt.findUnique({
    where: { reference },
    include: { order: { select: { id: true, status: true, paymentStatus: true, paidAt: true } } },
  });
  if (!attempt) return NextResponse.json({ error: 'Payment not found.' }, { status: 404 });

  return NextResponse.json({
    orderId: attempt.order.id,
    paymentStatus: attempt.order.paymentStatus,
    orderStatus: attempt.order.status,
    paidAt: attempt.order.paidAt?.toISOString() ?? null,
    expiresAt: attempt.expiresAt?.toISOString() ?? null,
  });
}
