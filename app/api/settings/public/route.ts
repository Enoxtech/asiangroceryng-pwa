import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Public, unauthenticated — only ever returns the Paystack *public* key
// (safe by design to expose client-side) plus whether the secret key is
// also configured, so checkout knows if real payment processing is live.
export async function GET() {
  const settings = await prisma.integrationSettings.findUnique({ where: { id: 'singleton' } });
  return NextResponse.json({
    paystackPublicKey: settings?.paystackPublicKey || '',
    paystackEnabled: !!(settings?.paystackPublicKey && settings?.paystackSecretKey),
  });
}
