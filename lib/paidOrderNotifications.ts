import { prisma } from '@/lib/prisma';
import { ORDERS_FROM, sendMail, wrapEmail } from '@/lib/email';
import { sendWhatsAppOrderUpdate } from '@/lib/whatsappApi';

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatNaira(value: number): string {
  return `₦${value.toLocaleString('en-NG')}`;
}

export async function sendPaidOrderNotifications(orderId: string): Promise<void> {
  const claimed = await prisma.order.updateMany({
    where: { id: orderId, paymentNotifiedAt: null },
    data: { paymentNotifiedAt: new Date() },
  });
  if (claimed.count === 0) return;

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) return;
  const settings = await prisma.integrationSettings.findUnique({ where: { id: 'singleton' } });

  const itemRows = order.items.map((item) => `
    <tr>
      <td style="padding:8px 0;color:#2d2a24;">${escapeHtml(item.name)} × ${item.quantity}</td>
      <td style="padding:8px 0;text-align:right;color:#2d2a24;">${formatNaira(item.price * item.quantity)}</td>
    </tr>`).join('');

  const body = wrapEmail(`Payment received - ${escapeHtml(order.id)}`, `
    <p style="margin:0 0 10px;font-size:15px;color:#2d2a24;">Hi ${escapeHtml(order.customer)},</p>
    <p style="margin:0 0 20px;font-size:14px;color:#5a5448;line-height:1.6;">Your bank transfer has been verified and order <strong>${escapeHtml(order.id)}</strong> is confirmed.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f0ece4;border-bottom:1px solid #f0ece4;">${itemRows}</table>
    <p style="margin:18px 0 0;font-size:17px;font-weight:800;color:#c41e3a;">Total paid: ${formatNaira(order.total)}</p>
  `);

  const sends: Promise<boolean>[] = [];
  if (settings?.adminEmail) {
    sends.push(sendMail(
      settings.adminEmail,
      `Paid bank-transfer order ${order.id} - ${formatNaira(order.total)}`,
      body,
      ORDERS_FROM,
    ));
  }
  if (order.email) {
    sends.push(sendMail(
      order.email,
      `Payment received - Order ${order.id}`,
      body,
      ORDERS_FROM,
    ));
  }
  if (sends.length > 0) await Promise.all(sends);
  if (order.phone) {
    await sendWhatsAppOrderUpdate(order.phone, [order.customer, order.id, formatNaira(order.total), order.area]);
  }
}
