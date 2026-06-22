import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { getClientIp } from '@/lib/audit';

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
  const order = await prisma.order.create({
    data: {
      id: body.id,
      customer: body.customer,
      phone: body.phone,
      email: body.email,
      subtotal: body.subtotal,
      deliveryFee: body.deliveryFee,
      discount: body.discount ?? 0,
      total: body.total,
      status: body.status ?? 'pending',
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
