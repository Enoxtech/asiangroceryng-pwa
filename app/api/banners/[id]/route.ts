import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireRole(req, ['super_admin', 'product_manager']);
  if (response) return response;

  const { id } = await params;
  const body = await req.json();
  const banner = await prisma.banner.update({ where: { id }, data: body });

  // Skip logging pure reorder pings (position-only) to avoid flooding the audit log every drag.
  const fields = Object.keys(body);
  if (!(fields.length === 1 && fields[0] === 'position')) {
    await logAudit(req, session, 'update', 'Banner', id, { fields });
  }

  return NextResponse.json(banner);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireRole(req, ['super_admin', 'product_manager']);
  if (response) return response;

  const { id } = await params;
  await prisma.banner.delete({ where: { id } });

  await logAudit(req, session, 'delete', 'Banner', id);

  return NextResponse.json({ ok: true });
}
