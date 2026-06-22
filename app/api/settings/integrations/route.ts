import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

// Secret fields are never sent to the client — only a "configured" flag.
// The actual value can only be overwritten, never read back, same pattern as a password field.
function toSafeShape(s: {
  paystackPublicKey: string;
  paystackSecretKey: string;
  flutterwavePublicKey: string;
  flutterwaveSecretKey: string;
  gmailUser: string;
  gmailAppPassword: string;
  adminEmail: string;
}) {
  return {
    paystackPublicKey: s.paystackPublicKey,
    paystackSecretKeySet: s.paystackSecretKey.length > 0,
    flutterwavePublicKey: s.flutterwavePublicKey,
    flutterwaveSecretKeySet: s.flutterwaveSecretKey.length > 0,
    gmailUser: s.gmailUser,
    gmailAppPasswordSet: s.gmailAppPassword.length > 0,
    adminEmail: s.adminEmail,
  };
}

export async function GET(req: NextRequest) {
  const { response } = await requireRole(req, ['super_admin']);
  if (response) return response;

  const settings = await prisma.integrationSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: { id: 'singleton' },
  });
  return NextResponse.json(toSafeShape(settings));
}

export async function PATCH(req: NextRequest) {
  const { response } = await requireRole(req, ['super_admin']);
  if (response) return response;

  const body = await req.json();
  // Only accept known fields, and only overwrite a secret if a non-empty value was actually sent
  // (so leaving a secret field blank in the form doesn't wipe out an already-saved key).
  const data: Record<string, string> = {};
  for (const key of [
    'paystackPublicKey',
    'paystackSecretKey',
    'flutterwavePublicKey',
    'flutterwaveSecretKey',
    'gmailUser',
    'gmailAppPassword',
    'adminEmail',
  ] as const) {
    if (typeof body[key] === 'string' && body[key].length > 0) {
      data[key] = body[key];
    }
  }

  const settings = await prisma.integrationSettings.upsert({
    where: { id: 'singleton' },
    update: data,
    create: { id: 'singleton', ...data },
  });
  return NextResponse.json(toSafeShape(settings));
}
