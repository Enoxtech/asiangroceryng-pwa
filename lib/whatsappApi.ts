import { prisma } from '@/lib/prisma';
import { decryptSecret } from '@/lib/crypto';

const GRAPH_VERSION = 'v20.0';

function normalizePhone(phone: string): string {
  // Meta's API expects digits only, with country code, no leading + or 0-trunk prefix.
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) return `234${digits.slice(1)}`; // assume Nigerian local format
  return digits;
}

/**
 * Sends an automated WhatsApp message via Meta's Cloud API using a
 * pre-approved message template (required for business-initiated messages
 * outside an active 24h customer-service session). Silently no-ops if not
 * configured — same pattern as email. Never throws.
 */
export async function sendWhatsAppOrderUpdate(phone: string, bodyParams: string[]): Promise<boolean> {
  try {
    const settings = await prisma.integrationSettings.findUnique({ where: { id: 'singleton' } });
    const phoneNumberId = settings?.whatsappPhoneNumberId;
    const accessToken = settings?.whatsappAccessToken && decryptSecret(settings.whatsappAccessToken);
    const templateName = settings?.whatsappOrderTemplateName;
    const languageCode = settings?.whatsappTemplateLanguage || 'en_US';

    if (!phoneNumberId || !accessToken || !templateName) return false;

    const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: normalizePhone(phone),
        type: 'template',
        template: {
          name: templateName,
          language: { code: languageCode },
          components: [
            {
              type: 'body',
              parameters: bodyParams.map((text) => ({ type: 'text', text })),
            },
          ],
        },
      }),
    });

    if (!res.ok) {
      console.error('[whatsappApi] send failed', res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('[whatsappApi] send failed', err);
    return false;
  }
}
