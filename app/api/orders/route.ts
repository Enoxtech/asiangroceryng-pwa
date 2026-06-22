import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
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
