import { prisma } from '@/lib/prisma';
import { decryptSecret } from '@/lib/crypto';

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data?: {
    status: string;
    reference: string;
    amount: number;
    currency: string;
    customer: { email: string };
  };
}

/** Verifies a Paystack transaction reference server-side using the stored secret key. */
export async function verifyPaystackTransaction(reference: string): Promise<PaystackVerifyResponse['data']> {
  const settings = await prisma.integrationSettings.findUnique({ where: { id: 'singleton' } });
  const secretKey = settings?.paystackSecretKey && decryptSecret(settings.paystackSecretKey);
  if (!secretKey) throw new Error('Paystack is not configured');

  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  const json: PaystackVerifyResponse = await res.json();
  if (!res.ok || !json.status || !json.data) {
    throw new Error(json.message || 'Paystack verification failed');
  }
  return json.data;
}
