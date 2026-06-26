import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rateLimit';
import { getClientIp } from '@/lib/audit';

// Public — checkout calls this to check a code without exposing the full
// coupon list (which would let anyone enumerate working promo codes).
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const ok = await checkRateLimit(`coupon-validate:${ip}`, 20, 10 * 60 * 1000);
  if (!ok) return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });

  const body = await req.json();
  const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : '';
  const subtotal = typeof body.subtotal === 'number' ? body.subtotal : 0;
  if (!code) return NextResponse.json({ error: 'Enter a promo code' }, { status: 400 });

  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon || !coupon.active) {
    return NextResponse.json({ error: 'Invalid promo code' }, { status: 404 });
  }
  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: 'This promo code has expired' }, { status: 410 });
  }
  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    return NextResponse.json({ error: 'This promo code has reached its usage limit' }, { status: 410 });
  }
  if (coupon.minOrder && subtotal < coupon.minOrder) {
    return NextResponse.json({ error: `Minimum order of ₦${coupon.minOrder.toLocaleString()} required` }, { status: 400 });
  }

  return NextResponse.json({
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    minOrder: coupon.minOrder,
  });
}
