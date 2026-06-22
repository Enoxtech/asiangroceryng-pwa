import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { response } = await requireRole(req, ['super_admin']);
  if (response) return response;

  const { searchParams } = new URL(req.url);
  const take = Math.min(Number(searchParams.get('limit')) || 100, 200);

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take,
  });
  return NextResponse.json(logs);
}
