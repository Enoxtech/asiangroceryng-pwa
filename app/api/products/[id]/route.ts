import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireRole(req, ['super_admin', 'product_manager']);
  if (response) return response;

  const { id } = await params;
  const body = await req.json();
  if (body.createdAt) body.createdAt = new Date(body.createdAt);
  const product = await prisma.product.update({ where: { id }, data: body });

  await logAudit(req, session, 'update', 'Product', id, { fields: Object.keys(body) });

  return NextResponse.json(product);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireRole(req, ['super_admin', 'product_manager']);
  if (response) return response;

  const { id } = await params;
  await prisma.product.delete({ where: { id } });

  await logAudit(req, session, 'delete', 'Product', id);

  return NextResponse.json({ ok: true });
}
