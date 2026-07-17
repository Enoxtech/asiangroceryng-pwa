import { after, NextRequest, NextResponse } from 'next/server';
import { sendPaidOrderNotifications } from '@/lib/paidOrderNotifications';
import { markPaystackPaymentFailed, markPaystackPaymentPaid } from '@/lib/paymentService';
import { verifyPaystackTransaction, verifyPaystackWebhookSignature } from '@/lib/paystack';
import { prisma } from '@/lib/prisma';

interface PaystackEvent {
  event?: string;
  data?: { reference?: string };
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-paystack-signature') || '';
  if (!(await verifyPaystackWebhookSignature(rawBody, signature))) {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 });
  }

  let event: PaystackEvent;
  try {
    event = JSON.parse(rawBody) as PaystackEvent;
  } catch {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
  }

  const reference = event.data?.reference;
  if (!reference) return NextResponse.json({ received: true });
  const managedAttempt = await prisma.paymentAttempt.findUnique({ where: { reference }, select: { id: true } });
  if (!managedAttempt) return NextResponse.json({ received: true });

  try {
    if (event.event === 'charge.success') {
      const verified = await verifyPaystackTransaction(reference);
      if (verified?.status === 'success') {
        const result = await markPaystackPaymentPaid(reference, verified);
        if (result.newlyPaid) after(() => sendPaidOrderNotifications(result.orderId));
      }
    } else if (event.event === 'bank.transfer.rejected') {
      await markPaystackPaymentFailed(reference);
    }
  } catch (error) {
    console.error('[paystack-webhook]', error);
    return NextResponse.json({ error: 'Webhook processing failed.' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
