import { NextResponse } from 'next/server';
import { clearCustomerSessionCookie } from '@/lib/customerAuth';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  clearCustomerSessionCookie(res);
  return res;
}
