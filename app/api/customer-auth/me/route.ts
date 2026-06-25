import { NextRequest, NextResponse } from 'next/server';
import { getCustomerSession } from '@/lib/customerAuth';

export async function GET(req: NextRequest) {
  const session = await getCustomerSession(req);
  if (!session) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  return NextResponse.json(session);
}
