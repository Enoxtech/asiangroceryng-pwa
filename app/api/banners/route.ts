import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET() {
  const banners = await prisma.banner.findMany({ orderBy: { position: 'asc' } });
  return NextResponse.json(banners);
}

export async function POST(req: NextRequest) {
  const { session, response } = await requireRole(req, ['super_admin', 'product_manager']);
  if (response) return response;

  const body = await req.json();
  const count = await prisma.banner.count();
  const banner = await prisma.banner.create({ data: { ...body, position: count } });

  await logAudit(req, session, 'create', 'Banner', banner.id);

  return NextResponse.json(banner, { status: 201 });
}
