import { NextRequest, NextResponse } from 'next/server';
import { verifyPaystackTransaction } from '@/lib/paystack';
import { checkRateLimit } from '@/lib/rateLimit';
import { getClientIp } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const ok = await checkRateLimit(`paystack-verify:${ip}`, 20, 10 * 60 * 1000);
  if (!ok) return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });

  const body = await req.json();
  const reference = typeof body.reference === 'string' ? body.reference : '';
  const expectedAmount = typeof body.expectedAmount === 'number' ? body.expectedAmount : 0;
  if (!reference || !expectedAmount) {
    return NextResponse.json({ error: 'Missing reference or amount' }, { status: 400 });
  }

  try {
    const data = await verifyPaystackTransaction(reference);
    if (!data || data.status !== 'success') {
      return NextResponse.json({ error: 'Payment was not successful' }, { status: 400 });
    }
    // Paystack amounts are in kobo; expectedAmount is sent in kobo too.
    if (data.amount !== Math.round(expectedAmount)) {
      return NextResponse.json({ error: 'Payment amount does not match order total' }, { status: 400 });
    }
    return NextResponse.json({ ok: true, reference: data.reference, amount: data.amount });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Verification failed' }, { status: 400 });
  }
}
