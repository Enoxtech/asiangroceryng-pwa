import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Public, unauthenticated — only ever returns values safe to expose client-side:
// the Paystack *public* key (by design public), whether the secret key is also
// configured (so checkout knows if real payment processing is live), the VAT
// rate, and store info shown on public pages.
export async function GET() {
  const settings = await prisma.integrationSettings.findUnique({ where: { id: 'singleton' } });
  return NextResponse.json({
    paystackPublicKey: settings?.paystackPublicKey || '',
    paystackEnabled: !!(settings?.paystackPublicKey && settings?.paystackSecretKey),
    vatPercent: settings?.vatPercent ?? 0,
    storeName: settings?.storeName || 'Asian Grocery Nigeria',
    tagline: settings?.tagline || 'Exploring Asia Through Food',
    storeEmail: settings?.storeEmail || 'hello@asiangroceryng.com',
    storeAddress: settings?.storeAddress || 'Lagos, Nigeria',
    businessHoursWeekdays: settings?.businessHoursWeekdays || '8:00 AM – 7:00 PM WAT',
    businessHoursSaturday: settings?.businessHoursSaturday || '9:00 AM – 5:00 PM WAT',
    businessHoursSunday: settings?.businessHoursSunday || 'Closed',
  });
}
