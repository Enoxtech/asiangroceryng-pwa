import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '…';
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
}

export function getWhatsAppOrderUrl(productName: string, price: number): string {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '2348000000000';
  const message = encodeURIComponent(
    `Hi! I'd like to order: ${productName} (${formatPrice(price)})\n\nPlease confirm availability and provide payment details.`
  );
  return `https://wa.me/${phone}?text=${message}`;
}

export function getWhatsAppCartUrl(
  items: Array<{ product: { name: string; price: number }; quantity: number }>,
  total: number
): string {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '2348000000000';
  const itemList = items
    .map((item) => `  • ${item.product.name} × ${item.quantity} = ${formatPrice(item.product.price * item.quantity)}`)
    .join('\n');
  const message = `Hi Asian Grocery Nigeria! I'd like to place an order:\n\n${itemList}\n\n*Total: ${formatPrice(total)}*\n\nPlease confirm availability and delivery details. Thank you!`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function getWhatsAppSupportUrl(): string {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '2348000000000';
  const message = encodeURIComponent('Hi! I have a question about Asian Grocery Nigeria.');
  return `https://wa.me/${phone}?text=${message}`;
}
