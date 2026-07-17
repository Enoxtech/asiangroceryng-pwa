import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const checkoutRequestSchema = z.object({
  customer: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(7).max(30),
  address: z.string().trim().max(500).optional().default(''),
  notes: z.string().trim().max(1000).optional().default(''),
  deliveryMethod: z.enum(['ship', 'pickup']),
  deliveryAreaId: z.string().trim().optional(),
  couponCode: z.string().trim().max(50).optional(),
  items: z.array(z.object({
    productId: z.string().trim().min(1),
    quantity: z.number().int().min(1).max(50),
  })).min(1).max(50),
});

export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;

export class CheckoutError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}

export interface CalculatedCheckout {
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    productId: string;
    categorySlug: string;
  }>;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  tax: number;
  total: number;
  couponCode?: string;
  area: string;
  address: string;
}

export async function calculateCheckout(input: CheckoutRequest): Promise<CalculatedCheckout> {
  const quantities = new Map<string, number>();
  for (const item of input.items) {
    quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
  }

  const productIds = [...quantities.keys()];
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  if (products.length !== productIds.length) {
    throw new CheckoutError('One or more products are no longer available. Refresh your cart and try again.');
  }

  const productById = new Map(products.map((product) => [product.id, product]));
  const items = productIds.map((productId) => {
    const product = productById.get(productId)!;
    const quantity = quantities.get(productId)!;
    if (!product.inStock || product.stockCount < quantity) {
      throw new CheckoutError(`${product.name} does not have enough stock for this order.`, 409);
    }
    return {
      name: product.name,
      quantity,
      price: product.price,
      productId: product.id,
      categorySlug: product.categorySlug,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let area = 'Store Pickup';
  let address = 'Store F11, Ikeja Town-Square';
  let baseDeliveryFee = 0;

  if (input.deliveryMethod === 'ship') {
    if (!input.deliveryAreaId) throw new CheckoutError('Choose a delivery area.');
    const deliveryArea = await prisma.deliveryArea.findFirst({
      where: { id: input.deliveryAreaId, enabled: true },
    });
    if (!deliveryArea) throw new CheckoutError('The selected delivery area is unavailable.', 409);
    if (!input.address) throw new CheckoutError('Enter a delivery address.');
    area = deliveryArea.name;
    address = input.address;
    baseDeliveryFee = deliveryArea.fee;
  }

  let couponCode: string | undefined;
  let couponType: string | undefined;
  let couponValue = 0;
  if (input.couponCode) {
    const normalizedCode = input.couponCode.toUpperCase();
    const coupon = await prisma.coupon.findUnique({ where: { code: normalizedCode } });
    if (!coupon || !coupon.active) throw new CheckoutError('This promo code is no longer valid.', 409);
    if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
      throw new CheckoutError('This promo code has expired.', 409);
    }
    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      throw new CheckoutError('This promo code has reached its usage limit.', 409);
    }
    if (coupon.minOrder && subtotal < coupon.minOrder) {
      throw new CheckoutError(`Minimum order of ₦${coupon.minOrder.toLocaleString('en-NG')} required.`, 409);
    }
    couponCode = coupon.code;
    couponType = coupon.type;
    couponValue = coupon.value;
  }

  const deliveryFee = couponType === 'shipping' ? 0 : baseDeliveryFee;
  const discount = couponType === 'percent'
    ? Math.round(subtotal * couponValue / 100)
    : couponType === 'fixed'
      ? Math.min(couponValue, subtotal)
      : couponType === 'shipping'
        ? baseDeliveryFee
        : 0;

  const settings = await prisma.integrationSettings.findUnique({ where: { id: 'singleton' } });
  const vatPercent = settings?.vatPercent ?? 0;
  const tax = Math.round(subtotal * vatPercent / 100);
  const total = subtotal + deliveryFee + tax - (couponType === 'shipping' ? 0 : discount);
  if (!Number.isFinite(total) || total <= 0) throw new CheckoutError('The calculated order total is invalid.');

  return { items, subtotal, deliveryFee, discount, tax, total, couponCode, area, address };
}
