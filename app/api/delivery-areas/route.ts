import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

// Public by default (checkout needs the enabled list). Pass ?all=true from the
// admin panel (auth-checked) to also see disabled areas for management.
export async function GET(req: NextRequest) {
  const wantsAll = req.nextUrl.searchParams.get('all') === 'true';
  if (wantsAll) {
    const { response } = await requireRole(req, ['super_admin', 'product_manager']);
    if (response) return response;
    const areas = await prisma.deliveryArea.findMany({ orderBy: { position: 'asc' } });
    return NextResponse.json(areas);
  }

  const areas = await prisma.deliveryArea.findMany({ where: { enabled: true }, orderBy: { position: 'asc' } });
  return NextResponse.json(areas);
}

export async function POST(req: NextRequest) {
  const { session, response } = await requireRole(req, ['super_admin', 'product_manager']);
  if (response) return response;

  const body = await req.json();
  if (typeof body.name !== 'string' || !body.name.trim() || typeof body.fee !== 'number' || body.fee < 0) {
    return NextResponse.json({ error: 'Name and a non-negative fee are required' }, { status: 400 });
  }

  const count = await prisma.deliveryArea.count();
  const area = await prisma.deliveryArea.create({
    data: {
      name: body.name.trim(),
      fee: body.fee,
      estimatedDays: body.estimatedDays || '2-3 business days',
      enabled: body.enabled ?? true,
      position: count,
    },
  });

  await logAudit(req, session, 'create', 'DeliveryArea', area.id, { name: area.name });

  return NextResponse.json(area, { status: 201 });
}
