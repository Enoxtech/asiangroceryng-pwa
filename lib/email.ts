import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';
import { decryptSecret } from '@/lib/crypto';

// Purpose-specific sender addresses on the verified domain — Resend verifies
// the whole domain, so any of these work without extra DNS setup.
export const ORDERS_FROM = 'orders@asiangroceryng.com';
export const NOREPLY_FROM = 'noreply@asiangroceryng.com';
export const HELLO_FROM = 'hello@asiangroceryng.com';

interface Mailer {
  send: (to: string, subject: string, html: string, fromOverride?: string) => Promise<void>;
}

/**
 * Resend is preferred when configured — Gmail SMTP from a personal-style
 * address has a deliverability ceiling (spam folder) that no amount of code
 * can fix. Gmail remains as a zero-setup fallback.
 */
async function getMailer(): Promise<Mailer | null> {
  const settings = await prisma.integrationSettings.findUnique({ where: { id: 'singleton' } });

  const resendApiKey = settings?.resendApiKey && decryptSecret(settings.resendApiKey);
  const resendFrom = settings?.resendFromEmail;
  if (resendApiKey && resendFrom) {
    return {
      // fromOverride lets callers use a purpose-specific address (orders@,
      // noreply@, hello@, ...) on the same verified domain — Resend verifies
      // the whole domain, not a single mailbox, so any address on it works.
      send: async (to, subject, html, fromOverride) => {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: `Asian Grocery Nigeria <${fromOverride || resendFrom}>`, to, subject, html }),
        });
        if (!res.ok) {
          throw new Error(`Resend API error ${res.status}: ${await res.text()}`);
        }
      },
    };
  }

  const gmailUser = settings?.gmailUser || process.env.GMAIL_USER;
  const gmailPass = (settings?.gmailAppPassword && decryptSecret(settings.gmailAppPassword)) || process.env.GMAIL_APP_PASSWORD;
  if (gmailUser && gmailPass) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPass },
    });
    return {
      // Gmail SMTP can't send as an arbitrary address — fromOverride is
      // ignored here and the authenticated Gmail account is always used.
      send: async (to, subject, html) => {
        await transporter.sendMail({ from: `"Asian Grocery Nigeria" <${gmailUser}>`, to, subject, html });
      },
    };
  }

  return null;
}

/** Sends an email if Resend or Gmail is configured; silently no-ops otherwise. Never throws.
 *  `fromOverride` (e.g. 'orders@asiangroceryng.com') only takes effect when sending via Resend. */
export async function sendMail(to: string, subject: string, html: string, fromOverride?: string): Promise<boolean> {
  try {
    const mailer = await getMailer();
    if (!mailer) return false;
    await mailer.send(to, subject, html, fromOverride);
    return true;
  } catch (err) {
    console.error('[email] send failed', err);
    return false;
  }
}

export function wrapEmail(title: string, bodyHtml: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f0ece4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ece4;padding:32px 16px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#c41e3a;padding:28px 32px;text-align:center;">
            <h1 style="margin:0;font-size:22px;font-weight:800;color:#ffffff;">Asian Grocery Nigeria</h1>
          </td>
        </tr>
        <tr><td style="padding:32px;">${bodyHtml}</td></tr>
        <tr>
          <td style="background:#faf8f5;padding:18px 32px;text-align:center;border-top:1px solid #f0ece4;">
            <p style="margin:0;font-size:12px;color:#b0a898;">Asian Grocery Nigeria &nbsp;·&nbsp; Store F11, Ikeja Town-Square, Lagos</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function buildVerifyEmailHtml(name: string, link: string): string {
  return wrapEmail('Verify your email', `
    <p style="margin:0 0 16px;font-size:15px;color:#2d2a24;">Hi ${name},</p>
    <p style="margin:0 0 24px;font-size:14px;color:#5a5448;line-height:1.6;">Welcome! Please verify your email address to finish setting up your account.</p>
    <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;"><tr><td>
      <a href="${link}" style="display:inline-block;padding:14px 32px;border-radius:50px;background:#c41e3a;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;">Verify Email Address</a>
    </td></tr></table>
    <p style="margin:0;font-size:12px;color:#9d8f7e;">This link expires in 24 hours. If you didn't create this account, you can ignore this email.</p>
  `);
}

export function buildResetPasswordEmailHtml(name: string, link: string): string {
  return wrapEmail('Reset your password', `
    <p style="margin:0 0 16px;font-size:15px;color:#2d2a24;">Hi ${name},</p>
    <p style="margin:0 0 24px;font-size:14px;color:#5a5448;line-height:1.6;">We received a request to reset your password. Click below to choose a new one.</p>
    <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;"><tr><td>
      <a href="${link}" style="display:inline-block;padding:14px 32px;border-radius:50px;background:#c41e3a;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;">Reset Password</a>
    </td></tr></table>
    <p style="margin:0;font-size:12px;color:#9d8f7e;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email — your password won't change.</p>
  `);
}
