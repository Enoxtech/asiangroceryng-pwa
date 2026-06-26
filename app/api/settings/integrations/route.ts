import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { encryptSecret } from '@/lib/crypto';
import { logAudit } from '@/lib/audit';
import type { IntegrationSettings } from '@/lib/generated/prisma/client';

const SECRET_FIELDS = ['paystackSecretKey', 'flutterwaveSecretKey', 'gmailAppPassword', 'resendApiKey', 'whatsappAccessToken'] as const;

const STRING_FIELDS = [
  'paystackPublicKey',
  'paystackSecretKey',
  'flutterwavePublicKey',
  'flutterwaveSecretKey',
  'gmailUser',
  'gmailAppPassword',
  'adminEmail',
  'resendApiKey',
  'resendFromEmail',
  'whatsappPhoneNumberId',
  'whatsappAccessToken',
  'whatsappBusinessAccountId',
  'whatsappOrderTemplateName',
  'whatsappTemplateLanguage',
] as const;

// Secret fields are never sent to the client — only a "configured" flag.
// The actual value can only be overwritten, never read back, same pattern as a password field.
function toSafeShape(s: IntegrationSettings) {
  return {
    paystackPublicKey: s.paystackPublicKey,
    paystackSecretKeySet: s.paystackSecretKey.length > 0,
    flutterwavePublicKey: s.flutterwavePublicKey,
    flutterwaveSecretKeySet: s.flutterwaveSecretKey.length > 0,
    gmailUser: s.gmailUser,
    gmailAppPasswordSet: s.gmailAppPassword.length > 0,
    adminEmail: s.adminEmail,
    resendFromEmail: s.resendFromEmail,
    resendApiKeySet: s.resendApiKey.length > 0,
    vatPercent: s.vatPercent,
    whatsappPhoneNumberId: s.whatsappPhoneNumberId,
    whatsappAccessTokenSet: s.whatsappAccessToken.length > 0,
    whatsappBusinessAccountId: s.whatsappBusinessAccountId,
    whatsappOrderTemplateName: s.whatsappOrderTemplateName,
    whatsappTemplateLanguage: s.whatsappTemplateLanguage,
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
  const { session, response } = await requireRole(req, ['super_admin']);
  if (response) return response;

  const body = await req.json();
  // Only accept known fields, and only overwrite a secret if a non-empty value was actually sent
  // (so leaving a secret field blank in the form doesn't wipe out an already-saved key).
  const data: Record<string, string | number> = {};
  for (const key of STRING_FIELDS) {
    if (typeof body[key] === 'string' && body[key].length > 0) {
      data[key] = (SECRET_FIELDS as readonly string[]).includes(key) ? encryptSecret(body[key]) : body[key];
    }
  }
  if (typeof body.vatPercent === 'number' && body.vatPercent >= 0 && body.vatPercent <= 100) {
    data.vatPercent = body.vatPercent;
  }

  const settings = await prisma.integrationSettings.upsert({
    where: { id: 'singleton' },
    update: data,
    create: { id: 'singleton', ...data },
  });

  await logAudit(req, session, 'update', 'IntegrationSettings', 'singleton', { fields: Object.keys(data) });

  return NextResponse.json(toSafeShape(settings));
}
