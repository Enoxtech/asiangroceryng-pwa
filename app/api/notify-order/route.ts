import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rateLimit';
import { getClientIp } from '@/lib/audit';
import { sendMail } from '@/lib/email';
import { sendWhatsAppOrderUpdate } from '@/lib/whatsappApi';

export interface OrderEmailPayload {
  orderId: string;
  customer: string;
  phone: string;
  email?: string;
  items: { name: string; quantity: number; price: number }[];
  subtotal: number;
  deliveryFee: number;
  discount?: number;
  tax?: number;
  total: number;
  area: string;
  address?: string;
  paymentMethod: string;
  notes?: string;
  source: 'checkout' | 'whatsapp';
}

function formatNaira(n: number) {
  return '₦' + n.toLocaleString('en-NG');
}

// Customer-supplied fields (name, notes, item names, etc.) end up interpolated
// directly into HTML emails — escape them so a malicious checkout submission
// can't inject markup/scripts into the admin's or customer's email client.
function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeOrder(o: OrderEmailPayload): OrderEmailPayload {
  return {
    ...o,
    orderId: escapeHtml(o.orderId),
    customer: escapeHtml(o.customer),
    phone: escapeHtml(o.phone),
    email: o.email ? escapeHtml(o.email) : o.email,
    area: escapeHtml(o.area),
    address: o.address ? escapeHtml(o.address) : o.address,
    notes: o.notes ? escapeHtml(o.notes) : o.notes,
    items: o.items.map((it) => ({ ...it, name: escapeHtml(it.name) })),
  };
}

function paymentLabel(pm: string) {
  const map: Record<string, string> = {
    paystack: 'Paystack (Card)',
    flutterwave: 'Flutterwave (Card)',
    bank_transfer: 'Bank Transfer',
    pay_on_delivery: 'Pay on Delivery',
  };
  return map[pm] ?? pm.replace(/_/g, ' ');
}

function buildEmailHtml(o: OrderEmailPayload): string {
  const itemRows = o.items
    .map(
      (it) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #f0ece4;font-size:14px;color:#2d2a24;">${it.name}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0ece4;font-size:14px;color:#2d2a24;text-align:center;">${it.quantity}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0ece4;font-size:14px;color:#2d2a24;text-align:right;">${formatNaira(it.price * it.quantity)}</td>
      </tr>`
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>New Order — ${o.orderId}</title>
</head>
<body style="margin:0;padding:0;background:#f0ece4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ece4;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#c41e3a;padding:28px 32px;text-align:center;">
            <p style="margin:0 0 4px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.65);">
              ${o.source === 'whatsapp' ? 'WhatsApp Order' : 'New Online Order'}
            </p>
            <h1 style="margin:0;font-size:24px;font-weight:800;color:#ffffff;">Asian Grocery Nigeria</h1>
            <p style="margin:8px 0 0;font-size:28px;font-weight:700;color:#ffffff;letter-spacing:1px;">${o.orderId}</p>
          </td>
        </tr>

        <!-- Alert banner -->
        <tr>
          <td style="background:#fff8e1;padding:12px 32px;border-bottom:2px solid #ffecb3;">
            <p style="margin:0;font-size:13px;font-weight:600;color:#b8860b;text-align:center;">
              🔔 &nbsp;A new order has just been placed — please confirm and process it promptly.
            </p>
          </td>
        </tr>

        <!-- Customer info -->
        <tr>
          <td style="padding:24px 32px 0;">
            <p style="margin:0 0 14px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#9d8f7e;font-weight:600;">Customer Details</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:6px 0;font-size:13px;color:#9d8f7e;width:36%;">Name</td>
                <td style="padding:6px 0;font-size:14px;color:#2d2a24;font-weight:600;">${o.customer}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;font-size:13px;color:#9d8f7e;">Phone</td>
                <td style="padding:6px 0;font-size:14px;color:#2d2a24;font-weight:600;">${o.phone}</td>
              </tr>
              ${o.email ? `<tr>
                <td style="padding:6px 0;font-size:13px;color:#9d8f7e;">Email</td>
                <td style="padding:6px 0;font-size:14px;color:#2d2a24;">${o.email}</td>
              </tr>` : ''}
              <tr>
                <td style="padding:6px 0;font-size:13px;color:#9d8f7e;">Delivery Area</td>
                <td style="padding:6px 0;font-size:14px;color:#2d2a24;">${o.area}</td>
              </tr>
              ${o.address ? `<tr>
                <td style="padding:6px 0;font-size:13px;color:#9d8f7e;">Address</td>
                <td style="padding:6px 0;font-size:14px;color:#2d2a24;">${o.address}</td>
              </tr>` : ''}
              <tr>
                <td style="padding:6px 0;font-size:13px;color:#9d8f7e;">Payment</td>
                <td style="padding:6px 0;">
                  <span style="display:inline-block;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;background:#f0faf4;color:#2e7d52;border:1px solid #c3e6cb;">
                    ${paymentLabel(o.paymentMethod)}
                  </span>
                </td>
              </tr>
              ${o.notes ? `<tr>
                <td style="padding:6px 0;font-size:13px;color:#9d8f7e;vertical-align:top;">Notes</td>
                <td style="padding:6px 0;font-size:14px;color:#2d2a24;font-style:italic;">"${o.notes}"</td>
              </tr>` : ''}
            </table>
          </td>
        </tr>

        <!-- Divider -->
        <tr><td style="padding:20px 32px 0;"><hr style="border:none;border-top:1px solid #f0ece4;margin:0;" /></td></tr>

        <!-- Items table -->
        <tr>
          <td style="padding:20px 32px 0;">
            <p style="margin:0 0 14px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#9d8f7e;font-weight:600;">Order Items</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0ece4;border-radius:12px;overflow:hidden;">
              <thead>
                <tr style="background:#faf8f5;">
                  <th style="padding:10px 12px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#9d8f7e;text-align:left;font-weight:600;">Product</th>
                  <th style="padding:10px 12px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#9d8f7e;text-align:center;font-weight:600;">Qty</th>
                  <th style="padding:10px 12px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#9d8f7e;text-align:right;font-weight:600;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemRows}
              </tbody>
            </table>
          </td>
        </tr>

        <!-- Totals -->
        <tr>
          <td style="padding:16px 32px 0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:5px 0;font-size:13px;color:#9d8f7e;">Subtotal</td>
                <td style="padding:5px 0;font-size:13px;color:#2d2a24;text-align:right;">${formatNaira(o.subtotal)}</td>
              </tr>
              <tr>
                <td style="padding:5px 0;font-size:13px;color:#9d8f7e;">Delivery Fee</td>
                <td style="padding:5px 0;font-size:13px;color:#2d2a24;text-align:right;">${o.deliveryFee > 0 ? formatNaira(o.deliveryFee) : 'FREE'}</td>
              </tr>
              ${o.tax && o.tax > 0 ? `<tr>
                <td style="padding:5px 0;font-size:13px;color:#9d8f7e;">VAT</td>
                <td style="padding:5px 0;font-size:13px;color:#2d2a24;text-align:right;">${formatNaira(o.tax)}</td>
              </tr>` : ''}
              ${o.discount && o.discount > 0 ? `<tr>
                <td style="padding:5px 0;font-size:13px;color:#2e7d52;">Discount Applied</td>
                <td style="padding:5px 0;font-size:13px;color:#2e7d52;text-align:right;">−${formatNaira(o.discount)}</td>
              </tr>` : ''}
              <tr>
                <td style="padding:12px 0 0;border-top:2px solid #f0ece4;font-size:16px;font-weight:800;color:#2d2a24;">ORDER TOTAL</td>
                <td style="padding:12px 0 0;border-top:2px solid #f0ece4;font-size:20px;font-weight:800;color:#c41e3a;text-align:right;">${formatNaira(o.total)}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:28px 32px;text-align:center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://asiangroceryng-pwa.vercel.app'}/admin/orders"
               style="display:inline-block;padding:14px 32px;border-radius:50px;background:#c41e3a;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;letter-spacing:0.5px;">
              View Order in Admin Panel →
            </a>
          </td>
        </tr>

        <!-- WhatsApp quick reply -->
        <tr>
          <td style="padding:0 32px 28px;text-align:center;">
            <a href="https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ''}?text=${encodeURIComponent(`Hi ${o.customer}, your order ${o.orderId} from Asian Grocery Nigeria has been confirmed! We'll process it shortly.`)}"
               style="display:inline-block;padding:12px 28px;border-radius:50px;background:#25d366;color:#ffffff;font-size:13px;font-weight:600;text-decoration:none;">
              📲 &nbsp;WhatsApp Customer
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#faf8f5;padding:18px 32px;text-align:center;border-top:1px solid #f0ece4;">
            <p style="margin:0;font-size:12px;color:#b0a898;">Asian Grocery Nigeria &nbsp;·&nbsp; Store F11, Ikeja Town-Square, Lagos</p>
            <p style="margin:6px 0 0;font-size:11px;color:#c9bfb4;">This email was automatically generated when an order was placed.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildCustomerEmailHtml(o: OrderEmailPayload): string {
  const itemRows = o.items
    .map(
      (it) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #f0ece4;font-size:14px;color:#2d2a24;">${it.name}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0ece4;font-size:14px;color:#2d2a24;text-align:center;">${it.quantity}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0ece4;font-size:14px;color:#2d2a24;text-align:right;">${formatNaira(it.price * it.quantity)}</td>
      </tr>`
    )
    .join('');

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://asiangroceryng-pwa.vercel.app';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Order Confirmed — ${o.orderId}</title>
</head>
<body style="margin:0;padding:0;background:#f0ece4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ece4;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#c41e3a;padding:32px 32px;text-align:center;">
            <p style="margin:0 0 4px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.65);">Order Confirmed</p>
            <h1 style="margin:0;font-size:24px;font-weight:800;color:#ffffff;">Asian Grocery Nigeria</h1>
            <p style="margin:10px 0 0;font-size:15px;color:rgba(255,255,255,0.9);">Thank you, ${o.customer}! 🎉</p>
          </td>
        </tr>

        <!-- Order number -->
        <tr>
          <td style="padding:24px 32px 0;text-align:center;">
            <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#9d8f7e;font-weight:600;">Order Number</p>
            <p style="margin:4px 0 0;font-size:26px;font-weight:800;color:#2d2a24;letter-spacing:1px;">${o.orderId}</p>
          </td>
        </tr>

        <!-- Status banner -->
        <tr>
          <td style="padding:20px 32px 0;">
            <p style="margin:0;padding:12px;border-radius:12px;background:#f0faf4;border:1px solid #c3e6cb;font-size:13px;font-weight:600;color:#2e7d52;text-align:center;">
              ✅ &nbsp;We&apos;ve received your order and we&apos;re getting it ready.
            </p>
          </td>
        </tr>

        <!-- Delivery info -->
        <tr>
          <td style="padding:24px 32px 0;">
            <p style="margin:0 0 14px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#9d8f7e;font-weight:600;">Delivery Details</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:6px 0;font-size:13px;color:#9d8f7e;width:36%;">Area</td>
                <td style="padding:6px 0;font-size:14px;color:#2d2a24;font-weight:600;">${o.area}</td>
              </tr>
              ${o.address ? `<tr>
                <td style="padding:6px 0;font-size:13px;color:#9d8f7e;">Address</td>
                <td style="padding:6px 0;font-size:14px;color:#2d2a24;">${o.address}</td>
              </tr>` : ''}
              <tr>
                <td style="padding:6px 0;font-size:13px;color:#9d8f7e;">Payment</td>
                <td style="padding:6px 0;">
                  <span style="display:inline-block;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;background:#fff8e1;color:#b8860b;border:1px solid #ffecb3;">
                    ${paymentLabel(o.paymentMethod)}
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Divider -->
        <tr><td style="padding:20px 32px 0;"><hr style="border:none;border-top:1px solid #f0ece4;margin:0;" /></td></tr>

        <!-- Items table -->
        <tr>
          <td style="padding:20px 32px 0;">
            <p style="margin:0 0 14px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#9d8f7e;font-weight:600;">Your Items</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0ece4;border-radius:12px;overflow:hidden;">
              <thead>
                <tr style="background:#faf8f5;">
                  <th style="padding:10px 12px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#9d8f7e;text-align:left;font-weight:600;">Product</th>
                  <th style="padding:10px 12px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#9d8f7e;text-align:center;font-weight:600;">Qty</th>
                  <th style="padding:10px 12px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#9d8f7e;text-align:right;font-weight:600;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemRows}
              </tbody>
            </table>
          </td>
        </tr>

        <!-- Totals -->
        <tr>
          <td style="padding:16px 32px 0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:5px 0;font-size:13px;color:#9d8f7e;">Subtotal</td>
                <td style="padding:5px 0;font-size:13px;color:#2d2a24;text-align:right;">${formatNaira(o.subtotal)}</td>
              </tr>
              <tr>
                <td style="padding:5px 0;font-size:13px;color:#9d8f7e;">Delivery Fee</td>
                <td style="padding:5px 0;font-size:13px;color:#2d2a24;text-align:right;">${o.deliveryFee > 0 ? formatNaira(o.deliveryFee) : 'FREE'}</td>
              </tr>
              ${o.tax && o.tax > 0 ? `<tr>
                <td style="padding:5px 0;font-size:13px;color:#9d8f7e;">VAT</td>
                <td style="padding:5px 0;font-size:13px;color:#2d2a24;text-align:right;">${formatNaira(o.tax)}</td>
              </tr>` : ''}
              ${o.discount && o.discount > 0 ? `<tr>
                <td style="padding:5px 0;font-size:13px;color:#2e7d52;">Discount Applied</td>
                <td style="padding:5px 0;font-size:13px;color:#2e7d52;text-align:right;">−${formatNaira(o.discount)}</td>
              </tr>` : ''}
              <tr>
                <td style="padding:12px 0 0;border-top:2px solid #f0ece4;font-size:16px;font-weight:800;color:#2d2a24;">TOTAL PAID</td>
                <td style="padding:12px 0 0;border-top:2px solid #f0ece4;font-size:20px;font-weight:800;color:#c41e3a;text-align:right;">${formatNaira(o.total)}</td>
              </tr>
            </table>
          </td>
        </tr>

        ${o.paymentMethod === 'bank_transfer' ? `
        <!-- Bank transfer reminder -->
        <tr>
          <td style="padding:24px 32px 0;">
            <p style="margin:0;padding:14px 16px;border-radius:12px;background:#eef4ff;border:1px solid #cfe0fb;font-size:13px;color:#2d4d8a;">
              💳 &nbsp;Remember to complete your bank transfer and send proof of payment via WhatsApp so we can process your order.
            </p>
          </td>
        </tr>` : ''}

        <!-- CTA -->
        <tr>
          <td style="padding:28px 32px;text-align:center;">
            <a href="${appUrl}/track-order"
               style="display:inline-block;padding:14px 32px;border-radius:50px;background:#c41e3a;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;letter-spacing:0.5px;">
              Track Your Order →
            </a>
          </td>
        </tr>

        <!-- WhatsApp support -->
        ${whatsappNumber ? `<tr>
          <td style="padding:0 32px 28px;text-align:center;">
            <a href="https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi! I have a question about my order ${o.orderId}.`)}"
               style="display:inline-block;padding:12px 28px;border-radius:50px;background:#25d366;color:#ffffff;font-size:13px;font-weight:600;text-decoration:none;">
              📲 &nbsp;Chat With Us
            </a>
          </td>
        </tr>` : ''}

        <!-- Footer -->
        <tr>
          <td style="background:#faf8f5;padding:18px 32px;text-align:center;border-top:1px solid #f0ece4;">
            <p style="margin:0;font-size:12px;color:#b0a898;">Asian Grocery Nigeria &nbsp;·&nbsp; Store F11, Ikeja Town-Square, Lagos</p>
            <p style="margin:6px 0 0;font-size:11px;color:#c9bfb4;">Thank you for shopping with us!</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const ok = await checkRateLimit(`notify-order:${ip}`, 15, 10 * 60 * 1000);
    if (!ok) {
      return NextResponse.json({ ok: false, skipped: true, reason: 'Rate limited' }, { status: 429 });
    }

    const order: OrderEmailPayload = await req.json();
    const safeOrder = sanitizeOrder(order);

    const settings = await prisma.integrationSettings.findUnique({ where: { id: 'singleton' } });
    const adminEmail = settings?.adminEmail || process.env.ADMIN_EMAIL;

    const sourceLabel = order.source === 'whatsapp' ? 'WhatsApp Order' : 'New Order';
    const sends: Promise<boolean>[] = [];

    if (adminEmail) {
      sends.push(sendMail(
        adminEmail,
        `🛒 ${sourceLabel} ${safeOrder.orderId} — ${formatNaira(order.total)} · ${safeOrder.customer}`,
        buildEmailHtml(safeOrder)
      ));
    }

    if (order.email) {
      sends.push(sendMail(
        order.email,
        `✅ Order Confirmed — ${safeOrder.orderId} | Asian Grocery Nigeria`,
        buildCustomerEmailHtml(safeOrder)
      ));
    }

    // WhatsApp order update (Meta Cloud API) — separate channel from email,
    // tracked independently since it silently no-ops if not configured.
    const whatsappSent = order.phone
      ? await sendWhatsAppOrderUpdate(order.phone, [safeOrder.customer, safeOrder.orderId, formatNaira(order.total), safeOrder.area])
      : false;

    if (sends.length === 0) {
      return NextResponse.json({ ok: true, skipped: true, reason: 'No email recipients', whatsappSent });
    }

    const results = await Promise.all(sends);
    const sent = results.filter(Boolean).length;
    if (sent === 0) {
      return NextResponse.json({ ok: true, skipped: true, reason: 'Email not configured', whatsappSent });
    }

    return NextResponse.json({ ok: true, sent, failed: results.length - sent, whatsappSent });
  } catch (err) {
    console.error('[notify-order]', err);
    // Return 200 so client doesn't retry — email failure must not block order flow
    return NextResponse.json({ ok: false, error: String(err) }, { status: 200 });
  }
}
