import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rateLimit';
import { getClientIp } from '@/lib/audit';

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.slice(-10); // last 10 digits, ignores country code / leading 0 differences
}

// Public lookup — requires both the order ID and the phone number used at
// checkout, so an order ID alone (which is not secret) can't leak details.
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const ok = await checkRateLimit(`track-order:${ip}`, 15, 10 * 60 * 1000);
  if (!ok) {
    return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
  }

  const body = await req.json();
  const orderId = typeof body.orderId === 'string' ? body.orderId.trim().toUpperCase() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  if (!orderId || !phone) {
    return NextResponse.json({ error: 'Order ID and phone number are required' }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order || normalizePhone(order.phone) !== normalizePhone(phone)) {
    return NextResponse.json({ error: 'Order not found. Check your order ID and phone number.' }, { status: 404 });
  }

  return NextResponse.json(order);
}
