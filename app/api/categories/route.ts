import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const { response } = await requireRole(req, ['super_admin', 'product_manager']);
  if (response) return response;

  const body = await req.json();
  const category = await prisma.category.create({ data: body });
  return NextResponse.json(category, { status: 201 });
}
