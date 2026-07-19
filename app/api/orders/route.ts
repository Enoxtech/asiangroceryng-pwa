import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { getCustomerSession } from '@/lib/customerAuth';
import { checkRateLimit } from '@/lib/rateLimit';
import { getClientIp } from '@/lib/audit';
import { verifyPaystackTransaction } from '@/lib/paystack';
import { calculateCheckout, checkoutRequestSchema, CheckoutError } from '@/lib/checkout';

function createOrderId(): string {
  const timestamp = Date.now().toString().slice(-8);
  const suffix = randomBytes(3).toString('hex').toUpperCase();
  return `AGNG-${timestamp}-${suffix}`;
}

export async function GET(req: NextRequest) {
  const { response } = await requireRole(req, ['super_admin', 'support', 'product_manager']);
  if (response) return response;

  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(orders);
}

// Public checkout endpoint for completed Paystack popup payments and manual
// bank-transfer orders. All totals are recalculated from current server data.
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const allowed = await checkRateLimit(`order:${ip}`, 8, 10 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many orders submitted. Please try again later.' }, { status: 429 });
  }

  try {
    const body = await req.json();
    if (body.payment !== 'paystack' && body.payment !== 'bank_transfer') {
      return NextResponse.json({ error: 'Unsupported payment method.' }, { status: 400 });
    }

    const checkoutInput = checkoutRequestSchema.parse({
      customer: body.customer,
      email: body.email,
      phone: body.phone,
      address: body.address,
      notes: body.notes,
      deliveryMethod: body.deliveryMethod,
      deliveryAreaId: body.deliveryAreaId,
      couponCode: body.couponCode,
      items: (body.items ?? []).map((item: { productId?: string; quantity?: number }) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    });
    const checkout = await calculateCheckout(checkoutInput);
    const customerSession = await getCustomerSession(req);

    if (body.payment === 'bank_transfer') {
      const bankDetails = await prisma.bankDetails.findUnique({ where: { id: 'singleton' } });
      if (!bankDetails?.bankName || !bankDetails.accountName || !bankDetails.accountNumber) {
        return NextResponse.json({ error: 'Bank transfer is temporarily unavailable. Please choose Paystack.' }, { status: 503 });
      }

      const orderId = createOrderId();
      const order = await prisma.order.create({
        data: {
          id: orderId,
          customer: checkoutInput.customer,
          phone: checkoutInput.phone,
          email: checkoutInput.email,
          customerId: customerSession?.id,
          subtotal: checkout.subtotal,
          deliveryFee: checkout.deliveryFee,
          discount: checkout.discount,
          tax: checkout.tax,
          couponCode: checkout.couponCode,
          total: checkout.total,
          status: 'awaiting_payment',
          paymentStatus: 'pending',
          paymentProvider: 'manual',
          paymentRef: orderId,
          area: checkout.area,
          address: checkout.address,
          payment: 'bank_transfer',
          notes: checkoutInput.notes || undefined,
          source: 'checkout',
          items: { create: checkout.items },
        },
        include: { items: true },
      });

      return NextResponse.json({ ...order, bankDetails }, { status: 201 });
    }

    if (typeof body.id !== 'string' || !/^AGNG-[A-Za-z0-9-]+$/.test(body.id)) {
      return NextResponse.json({ error: 'Invalid order ID.' }, { status: 400 });
    }
    if (typeof body.paymentRef !== 'string' || body.paymentRef !== body.id) {
      return NextResponse.json({ error: 'Invalid payment reference.' }, { status: 400 });
    }

    const payment = await verifyPaystackTransaction(body.paymentRef);
    if (!payment
      || payment.status !== 'success'
      || payment.reference !== body.paymentRef
      || payment.amount !== Math.round(checkout.total * 100)
      || payment.currency !== 'NGN'
      || payment.customer?.email?.toLowerCase() !== checkoutInput.email.toLowerCase()) {
      return NextResponse.json({ error: 'Payment could not be verified.' }, { status: 400 });
    }

    const paidAt = payment.paid_at ? new Date(payment.paid_at) : new Date();
    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          id: body.id,
          customer: checkoutInput.customer,
          phone: checkoutInput.phone,
          email: checkoutInput.email,
          customerId: customerSession?.id,
          subtotal: checkout.subtotal,
          deliveryFee: checkout.deliveryFee,
          discount: checkout.discount,
          tax: checkout.tax,
          couponCode: checkout.couponCode,
          total: checkout.total,
          status: 'confirmed',
          paymentStatus: 'paid',
          paymentProvider: 'paystack',
          paidAt,
          paymentRef: body.paymentRef,
          area: checkout.area,
          address: checkout.address,
          payment: 'paystack',
          notes: checkoutInput.notes || undefined,
          source: 'checkout',
          items: { create: checkout.items },
        },
        include: { items: true },
      });
      if (checkout.couponCode) {
        await tx.coupon.updateMany({
          where: { code: checkout.couponCode },
          data: { usageCount: { increment: 1 } },
        });
      }
      return created;
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || 'Invalid checkout details.' }, { status: 400 });
    }
    if (error instanceof CheckoutError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[orders-create]', error);
    return NextResponse.json({ error: 'Could not create order.' }, { status: 500 });
  }
}
