import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

// Admin-only — the full list including inactive/expired coupons.
// Customer-facing validation happens via /api/coupons/validate instead.
export async function GET(req: NextRequest) {
  const { response } = await requireRole(req, ['super_admin', 'product_manager']);
  if (response) return response;

  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(coupons);
}

export async function POST(req: NextRequest) {
  const { session, response } = await requireRole(req, ['super_admin', 'product_manager']);
  if (response) return response;

  const body = await req.json();
  const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : '';
  if (!code) return NextResponse.json({ error: 'Code is required' }, { status: 400 });
  if (!['percent', 'fixed', 'shipping'].includes(body.type)) {
    return NextResponse.json({ error: 'Type must be percent, fixed, or shipping' }, { status: 400 });
  }
  if (typeof body.value !== 'number' || body.value < 0) {
    return NextResponse.json({ error: 'Value must be a non-negative number' }, { status: 400 });
  }

  const existing = await prisma.coupon.findUnique({ where: { code } });
  if (existing) return NextResponse.json({ error: 'A coupon with this code already exists' }, { status: 409 });

  const coupon = await prisma.coupon.create({
    data: {
      code,
      type: body.type,
      value: body.value,
      minOrder: typeof body.minOrder === 'number' ? body.minOrder : undefined,
      active: body.active ?? true,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
      usageLimit: typeof body.usageLimit === 'number' ? body.usageLimit : undefined,
    },
  });

  await logAudit(req, session, 'create', 'Coupon', coupon.id, { code: coupon.code });

  return NextResponse.json(coupon, { status: 201 });
}
