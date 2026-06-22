import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const banners = await prisma.banner.findMany({ orderBy: { position: 'asc' } });
  return NextResponse.json(banners);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const count = await prisma.banner.count();
  const banner = await prisma.banner.create({ data: { ...body, position: count } });
  return NextResponse.json(banner, { status: 201 });
}
