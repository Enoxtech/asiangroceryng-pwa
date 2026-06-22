import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const product = await prisma.product.create({
    data: { ...body, createdAt: body.createdAt ? new Date(body.createdAt) : new Date() },
  });
  return NextResponse.json(product, { status: 201 });
}
