import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireRole(req, ['super_admin', 'product_manager']);
  if (response) return response;

  const { id } = await params;
  const body = await req.json();
  const banner = await prisma.banner.update({ where: { id }, data: body });
  return NextResponse.json(banner);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireRole(req, ['super_admin', 'product_manager']);
  if (response) return response;

  const { id } = await params;
  await prisma.banner.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
