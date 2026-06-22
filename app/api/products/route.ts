import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const { session, response } = await requireRole(req, ['super_admin', 'product_manager']);
  if (response) return response;

  const body = await req.json();
  const product = await prisma.product.create({
    data: { ...body, createdAt: body.createdAt ? new Date(body.createdAt) : new Date() },
  });

  await logAudit(req, session, 'create', 'Product', product.id, { name: product.name });

  return NextResponse.json(product, { status: 201 });
}
