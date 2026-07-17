import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { getClientIp } from '@/lib/audit';
import { calculateCheckout, checkoutRequestSchema, CheckoutError } from '@/lib/checkout';
import { getCustomerSession } from '@/lib/customerAuth';
import { createPaystackBankTransfer } from '@/lib/paystack';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rateLimit';

function createOrderId(): string {
  const timestamp = Date.now().toString().slice(-8);
  const suffix = randomBytes(3).toString('hex').toUpperCase();
  return `AGNG-${timestamp}-${suffix}`;
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const allowed = await checkRateLimit(`bank-transfer-init:${ip}`, 6, 10 * 60 * 1000);
  if (!allowed) return NextResponse.json({ error: 'Too many payment attempts. Please try again later.' }, { status: 429 });

  let orderId = '';
  let reference = '';
  try {
    const input = checkoutRequestSchema.parse(await req.json());
    const checkout = await calculateCheckout(input);
    const customerSession = await getCustomerSession(req);
    orderId = createOrderId();
    reference = `${orderId}-${randomBytes(4).toString('hex').toUpperCase()}`;
    const requestedExpiry = new Date(Date.now() + 30 * 60 * 1000);
    const amountKobo = Math.round(checkout.total * 100);

    await prisma.$transaction(async (tx) => {
      await tx.order.create({
        data: {
          id: orderId,
          customer: input.customer,
          phone: input.phone,
          email: input.email,
          customerId: customerSession?.id,
          subtotal: checkout.subtotal,
          deliveryFee: checkout.deliveryFee,
          discount: checkout.discount,
          tax: checkout.tax,
          couponCode: checkout.couponCode,
          total: checkout.total,
          status: 'awaiting_payment',
          area: checkout.area,
          address: checkout.address,
          payment: 'bank_transfer',
          paymentStatus: 'pending',
          paymentProvider: 'paystack',
          paymentRef: reference,
          paymentExpiresAt: requestedExpiry,
          notes: input.notes || undefined,
          source: 'checkout',
          items: { create: checkout.items },
        },
      });
      await tx.paymentAttempt.create({
        data: {
          orderId,
          provider: 'paystack',
          reference,
          amountKobo,
          currency: 'NGN',
          status: 'pending',
          expiresAt: requestedExpiry,
        },
      });
    });

    const transfer = await createPaystackBankTransfer({
      email: input.email,
      amountKobo,
      reference,
      expiresAt: requestedExpiry,
      orderId,
    });
    const expiresAt = new Date(transfer.account_expires_at || requestedExpiry);

    await prisma.$transaction([
      prisma.paymentAttempt.update({
        where: { reference },
        data: {
          accountNumber: transfer.account_number,
          accountName: transfer.account_name,
          bankName: transfer.bank.name,
          expiresAt,
        },
      }),
      prisma.order.update({ where: { id: orderId }, data: { paymentExpiresAt: expiresAt } }),
    ]);

    return NextResponse.json({
      orderId,
      reference,
      paymentStatus: 'pending',
      bankName: transfer.bank.name,
      accountName: transfer.account_name,
      accountNumber: transfer.account_number,
      expiresAt: expiresAt.toISOString(),
      amount: checkout.total,
      subtotal: checkout.subtotal,
      deliveryFee: checkout.deliveryFee,
      discount: checkout.discount,
      tax: checkout.tax,
    }, { status: 201 });
  } catch (error) {
    if (reference) {
      await prisma.$transaction([
        prisma.paymentAttempt.updateMany({ where: { reference }, data: { status: 'failed' } }),
        prisma.order.updateMany({ where: { id: orderId }, data: { paymentStatus: 'failed' } }),
      ]).catch(() => undefined);
    }
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || 'Invalid checkout details.' }, { status: 400 });
    }
    if (error instanceof CheckoutError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[bank-transfer-initialize]', error);
    return NextResponse.json({ error: 'Could not create a secure transfer account. Please try again.' }, { status: 502 });
  }
}
