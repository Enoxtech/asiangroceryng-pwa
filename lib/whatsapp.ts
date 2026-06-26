export const ADMIN_WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '2348000000000';

export interface OrderDetails {
  id: string;
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
}

export function buildCustomerConfirmation(order: OrderDetails): string {
  const lines = order.items
    .map((i) => `  • ${i.name} ×${i.quantity} — ₦${(i.price * i.quantity).toLocaleString()}`)
    .join('\n');

  const payLabel: Record<string, string> = {
    pay_on_delivery: 'Pay on Delivery',
    bank_transfer: 'Bank Transfer',
    paystack: 'Paystack',
    flutterwave: 'Flutterwave',
  };

  return (
    `🎉 *Order Confirmed — Asian Grocery Nigeria*\n\n` +
    `Order ID: *${order.id}*\n` +
    `Hi ${order.customer}, thank you for your order!\n\n` +
    `*Items Ordered:*\n${lines}\n\n` +
    `Subtotal: ₦${order.subtotal.toLocaleString()}\n` +
    `Delivery (${order.area}): ₦${order.deliveryFee.toLocaleString()}\n` +
    (order.tax ? `VAT: ₦${order.tax.toLocaleString()}\n` : '') +
    (order.discount ? `Discount: −₦${order.discount.toLocaleString()}\n` : '') +
    `*Total: ₦${order.total.toLocaleString()}*\n\n` +
    `Payment: ${payLabel[order.paymentMethod] ?? order.paymentMethod}\n` +
    (order.address ? `Delivery to: ${order.address}\n` : '') +
    `\nWe'll update you once your order is on its way. 🚚\n` +
    `Questions? Reply here anytime.`
  );
}

export function buildAdminAlert(order: OrderDetails): string {
  const lines = order.items
    .map((i) => `  • ${i.name} ×${i.quantity}`)
    .join('\n');

  return (
    `🛎️ *NEW ORDER — Asian Grocery Nigeria Admin*\n\n` +
    `Order ID: *${order.id}*\n` +
    `Customer: ${order.customer}\n` +
    `Phone: ${order.phone}\n` +
    (order.email ? `Email: ${order.email}\n` : '') +
    `\n*Items:*\n${lines}\n\n` +
    `Total: *₦${order.total.toLocaleString()}*\n` +
    `Payment: ${order.paymentMethod.replace(/_/g, ' ')}\n` +
    `Area: ${order.area}\n` +
    (order.address ? `Address: ${order.address}\n` : '') +
    (order.notes ? `\nNotes: ${order.notes}` : '') +
    `\n\nView in admin: ${typeof window !== 'undefined' ? window.location.origin : ''}/admin/orders`
  );
}

export function openWhatsApp(phone: string, message: string): void {
  const cleaned = phone.replace(/\D/g, '');
  const url = `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function sendOrderConfirmationToCustomer(order: OrderDetails): void {
  const msg = buildCustomerConfirmation(order);
  openWhatsApp(order.phone, msg);
}

export function sendOrderAlertToAdmin(order: OrderDetails): void {
  const msg = buildAdminAlert(order);
  openWhatsApp(ADMIN_WHATSAPP, msg);
}

export function buildPromoMessage(promo: { title: string; code: string; discount: string; minOrder?: number; expiry?: string }): string {
  return (
    `🎁 *Exclusive Offer — Asian Grocery Nigeria*\n\n` +
    `*${promo.title}*\n` +
    `Use code: *${promo.code}* for ${promo.discount}\n` +
    (promo.minOrder ? `Minimum order: ₦${promo.minOrder.toLocaleString()}\n` : '') +
    (promo.expiry ? `Valid until: ${promo.expiry}\n` : '') +
    `\nShop now: ${typeof window !== 'undefined' ? window.location.origin : ''}/shop`
  );
}
