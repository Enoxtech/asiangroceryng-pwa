import { prisma } from '@/lib/prisma';
import { decryptSecret } from '@/lib/crypto';
import { createHmac, timingSafeEqual } from 'crypto';

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data?: {
    status: string;
    reference: string;
    amount: number;
    currency: string;
    channel: string;
    id: number;
    paid_at?: string;
    customer: { email: string };
  };
}

interface PaystackBankTransferResponse {
  status: boolean;
  message: string;
  data?: {
    reference: string;
    status: string;
    display_text?: string;
    account_name: string;
    account_number: string;
    account_expires_at: string;
    bank: { name: string; slug?: string; id?: number };
  };
}

async function getPaystackSecretKey(): Promise<string> {
  const settings = await prisma.integrationSettings.findUnique({ where: { id: 'singleton' } });
  const secretKey = settings?.paystackSecretKey && decryptSecret(settings.paystackSecretKey);
  if (!secretKey) throw new Error('Paystack is not configured');
  return secretKey;
}

/** Verifies a Paystack transaction reference server-side using the stored secret key. */
export async function verifyPaystackTransaction(reference: string): Promise<PaystackVerifyResponse['data']> {
  const secretKey = await getPaystackSecretKey();

  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  const json: PaystackVerifyResponse = await res.json();
  if (!res.ok || !json.status || !json.data) {
    throw new Error(json.message || 'Paystack verification failed');
  }
  return json.data;
}

export async function createPaystackBankTransfer(input: {
  email: string;
  amountKobo: number;
  reference: string;
  expiresAt: Date;
  orderId: string;
}): Promise<NonNullable<PaystackBankTransferResponse['data']>> {
  const secretKey = await getPaystackSecretKey();
  const res = await fetch('https://api.paystack.co/charge', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: input.email,
      amount: String(input.amountKobo),
      reference: input.reference,
      bank_transfer: { account_expires_at: input.expiresAt.toISOString() },
      metadata: { orderId: input.orderId, paymentMethod: 'bank_transfer' },
    }),
  });
  const json: PaystackBankTransferResponse = await res.json();
  if (!res.ok || !json.status || !json.data) {
    throw new Error(json.message || 'Could not create a transfer account');
  }
  if (json.data.status !== 'pending_bank_transfer' || !json.data.account_number) {
    throw new Error('Paystack did not return a valid transfer account');
  }
  return json.data;
}

export async function verifyPaystackWebhookSignature(rawBody: string, signature: string): Promise<boolean> {
  if (!signature) return false;
  const secretKey = await getPaystackSecretKey();
  const expected = createHmac('sha512', secretKey).update(rawBody).digest('hex');
  const expectedBuffer = Buffer.from(expected, 'utf8');
  const signatureBuffer = Buffer.from(signature, 'utf8');
  return expectedBuffer.length === signatureBuffer.length && timingSafeEqual(expectedBuffer, signatureBuffer);
}
