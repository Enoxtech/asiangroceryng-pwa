import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

// Intentionally public — checkout shows these details to customers paying by bank transfer.
export async function GET() {
  const bankDetails = await prisma.bankDetails.upsert({
    where: { id: 'singleton' },
    update: {},
    create: { id: 'singleton' },
  });
  return NextResponse.json(bankDetails);
}

export async function PATCH(req: NextRequest) {
  const { response } = await requireRole(req, ['super_admin']);
  if (response) return response;

  const body = await req.json();
  const bankDetails = await prisma.bankDetails.upsert({
    where: { id: 'singleton' },
    update: body,
    create: { id: 'singleton', ...body },
  });
  return NextResponse.json(bankDetails);
}
