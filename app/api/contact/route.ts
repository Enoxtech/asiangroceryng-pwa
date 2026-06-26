import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rateLimit';
import { getClientIp } from '@/lib/audit';
import { sendMail, wrapEmail, HELLO_FROM } from '@/lib/email';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Public — the contact page form. Emails the admin; never throws past the
// caller so a misconfigured mailer doesn't make the form look broken twice.
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const ok = await checkRateLimit(`contact-form:${ip}`, 5, 15 * 60 * 1000);
  if (!ok) {
    return NextResponse.json({ error: 'Too many messages sent. Please try again later.' }, { status: 429 });
  }

  const body = await req.json();
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 });
  }

  const settings = await prisma.integrationSettings.findUnique({ where: { id: 'singleton' } });
  const adminEmail = settings?.adminEmail || process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    // No admin email configured — tell the truth rather than silently "succeeding".
    return NextResponse.json({ error: 'This form is not yet configured to receive messages. Please reach us on WhatsApp instead.' }, { status: 503 });
  }

  const html = wrapEmail('New Contact Message', `
    <p style="margin:0 0 16px;font-size:15px;color:#2d2a24;">New message from the Contact page:</p>
    <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:16px;">
      <tr><td style="padding:4px 0;font-size:13px;color:#9d8f7e;width:90px;">From</td><td style="padding:4px 0;font-size:14px;color:#2d2a24;font-weight:600;">${escapeHtml(name)}</td></tr>
      <tr><td style="padding:4px 0;font-size:13px;color:#9d8f7e;">Email</td><td style="padding:4px 0;font-size:14px;color:#2d2a24;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
      ${subject ? `<tr><td style="padding:4px 0;font-size:13px;color:#9d8f7e;">Subject</td><td style="padding:4px 0;font-size:14px;color:#2d2a24;">${escapeHtml(subject)}</td></tr>` : ''}
    </table>
    <p style="margin:0;padding:14px 16px;border-radius:12px;background:#faf8f5;font-size:14px;color:#2d2a24;line-height:1.6;white-space:pre-wrap;">${escapeHtml(message)}</p>
  `);

  const sent = await sendMail(adminEmail, `📩 Contact form: ${subject || 'New message'} — ${name}`, html, HELLO_FROM);

  if (!sent) {
    return NextResponse.json({ error: 'Could not send your message right now. Please reach us on WhatsApp instead.' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
