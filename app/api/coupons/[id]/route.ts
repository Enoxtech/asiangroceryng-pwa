import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireRole(req, ['super_admin', 'product_manager']);
  if (response) return response;

  const { id } = await params;
  const body = await req.json();
  const data: Record<string, string | number | boolean | Date | null> = {};
  if (typeof body.code === 'string') data.code = body.code.trim().toUpperCase();
  if (typeof body.type === 'string') data.type = body.type;
  if (typeof body.value === 'number') data.value = body.value;
  if (typeof body.minOrder === 'number' || body.minOrder === null) data.minOrder = body.minOrder;
  if (typeof body.active === 'boolean') data.active = body.active;
  if (typeof body.usageLimit === 'number' || body.usageLimit === null) data.usageLimit = body.usageLimit;
  if (body.expiresAt === null) data.expiresAt = null;
  else if (typeof body.expiresAt === 'string') data.expiresAt = new Date(body.expiresAt);

  const coupon = await prisma.coupon.update({ where: { id }, data });

  await logAudit(req, session, 'update', 'Coupon', id, { fields: Object.keys(data) });

  return NextResponse.json(coupon);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireRole(req, ['super_admin', 'product_manager']);
  if (response) return response;

  const { id } = await params;
  await prisma.coupon.delete({ where: { id } });

  await logAudit(req, session, 'delete', 'Coupon', id);

  return NextResponse.json({ ok: true });
}
