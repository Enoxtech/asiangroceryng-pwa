import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireRole(req, ['super_admin', 'product_manager']);
  if (response) return response;

  const { id } = await params;
  const body = await req.json();
  const data: Record<string, string | number | boolean> = {};
  if (typeof body.name === 'string') data.name = body.name;
  if (typeof body.fee === 'number') data.fee = body.fee;
  if (typeof body.estimatedDays === 'string') data.estimatedDays = body.estimatedDays;
  if (typeof body.enabled === 'boolean') data.enabled = body.enabled;
  if (typeof body.position === 'number') data.position = body.position;

  const area = await prisma.deliveryArea.update({ where: { id }, data });

  await logAudit(req, session, 'update', 'DeliveryArea', id, { fields: Object.keys(data) });

  return NextResponse.json(area);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireRole(req, ['super_admin', 'product_manager']);
  if (response) return response;

  const { id } = await params;
  await prisma.deliveryArea.delete({ where: { id } });

  await logAudit(req, session, 'delete', 'DeliveryArea', id);

  return NextResponse.json({ ok: true });
}
