import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { getCustomerSession } from '@/lib/customerAuth';
import { checkRateLimit } from '@/lib/rateLimit';
import { getClientIp } from '@/lib/audit';
import { verifyPaystackTransaction } from '@/lib/paystack';

export async function GET(req: NextRequest) {
  const { response } = await requireRole(req, ['super_admin', 'support', 'product_manager']);
  if (response) return response;

  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(orders);
}

// Intentionally public — this is how customers place real orders at checkout.
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const ok = await checkRateLimit(`order:${ip}`, 8, 10 * 60 * 1000);
  if (!ok) {
    return NextResponse.json({ error: 'Too many orders submitted. Please try again later.' }, { status: 429 });
  }

  const body = await req.json();
  const customerSession = await getCustomerSession(req);

  // Never trust a client-supplied "confirmed" status for card payments —
  // re-verify the Paystack reference server-side before honoring it.
  let status = 'pending';
  let paymentRef: string | undefined;
  if (body.payment === 'paystack') {
    if (typeof body.paymentRef !== 'string' || !body.paymentRef) {
      return NextResponse.json({ error: 'Missing payment reference' }, { status: 400 });
    }
    try {
      const data = await verifyPaystackTransaction(body.paymentRef);
      if (!data || data.status !== 'success' || data.amount !== Math.round(body.total * 100)) {
        return NextResponse.json({ error: 'Payment could not be verified' }, { status: 400 });
      }
      status = 'confirmed';
      paymentRef = body.paymentRef;
    } catch {
      return NextResponse.json({ error: 'Payment could not be verified' }, { status: 400 });
    }
  } else {
    status = body.status ?? 'pending';
  }

  const order = await prisma.order.create({
    data: {
      id: body.id,
      customer: body.customer,
      phone: body.phone,
      email: body.email,
      customerId: customerSession?.id,
      subtotal: body.subtotal,
      deliveryFee: body.deliveryFee,
      discount: body.discount ?? 0,
      total: body.total,
      status,
      paymentRef,
      area: body.area,
      address: body.address,
      payment: body.payment,
      notes: body.notes,
      source: body.source ?? 'checkout',
      items: {
        create: (body.items ?? []).map((it: { name: string; quantity: number; price: number }) => ({
          name: it.name,
          quantity: it.quantity,
          price: it.price,
        })),
      },
    },
    include: { items: true },
  });
  return NextResponse.json(order, { status: 201 });
}
