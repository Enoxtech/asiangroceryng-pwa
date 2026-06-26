import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Public, unauthenticated — only ever returns values safe to expose client-side:
// the Paystack *public* key (by design public), whether the secret key is also
// configured (so checkout knows if real payment processing is live), and the
// VAT rate used to compute tax at checkout.
export async function GET() {
  const settings = await prisma.integrationSettings.findUnique({ where: { id: 'singleton' } });
  return NextResponse.json({
    paystackPublicKey: settings?.paystackPublicKey || '',
    paystackEnabled: !!(settings?.paystackPublicKey && settings?.paystackSecretKey),
    vatPercent: settings?.vatPercent ?? 0,
  });
}
