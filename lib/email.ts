import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';
import { decryptSecret } from '@/lib/crypto';

async function getMailer(): Promise<{ transporter: nodemailer.Transporter; fromAddress: string } | null> {
  const settings = await prisma.integrationSettings.findUnique({ where: { id: 'singleton' } });
  const gmailUser = settings?.gmailUser || process.env.GMAIL_USER;
  const gmailPass = (settings?.gmailAppPassword && decryptSecret(settings.gmailAppPassword)) || process.env.GMAIL_APP_PASSWORD;
  if (!gmailUser || !gmailPass) return null;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: gmailUser, pass: gmailPass },
  });
  return { transporter, fromAddress: gmailUser };
}

/** Sends an email if Gmail credentials are configured; silently no-ops otherwise. Never throws. */
export async function sendMail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const mailer = await getMailer();
    if (!mailer) return false;
    await mailer.transporter.sendMail({
      from: `"Asian Grocery NG" <${mailer.fromAddress}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (err) {
    console.error('[email] send failed', err);
    return false;
  }
}

function wrapEmail(title: string, bodyHtml: string): string {
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
            <h1 style="margin:0;font-size:22px;font-weight:800;color:#ffffff;">Asian Grocery NG</h1>
          </td>
        </tr>
        <tr><td style="padding:32px;">${bodyHtml}</td></tr>
        <tr>
          <td style="background:#faf8f5;padding:18px 32px;text-align:center;border-top:1px solid #f0ece4;">
            <p style="margin:0;font-size:12px;color:#b0a898;">Asian Grocery NG &nbsp;·&nbsp; Store F11, Ikeja Town-Square, Lagos</p>
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
