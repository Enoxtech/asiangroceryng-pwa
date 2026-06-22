import { NextResponse } from 'next/server';
import { clearSessionCookie, clearPending2faCookie } from '@/lib/auth';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  clearPending2faCookie(res);
  return res;
}
