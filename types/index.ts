export type StorageType = 'dry' | 'chilled' | 'frozen';
export type SpiceLevel = 'none' | 'mild' | 'medium' | 'hot' | 'very-hot';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';
export type PaymentMethod = 'paystack' | 'flutterwave' | 'bank_transfer' | 'pay_on_delivery';
export type CouponType = 'percentage' | 'fixed';
export type AdminRole = 'super_admin' | 'admin' | 'staff';

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  productCount: number;
  emoji: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  comparePrice?: number;
  images: string[];
  category: string;
  categorySlug: string;
  brand: string;
  countryOfOrigin: string;
  countryFlag: string;
  weight: string;
  ingredients?: string;
  allergens?: string;
  expiryInfo?: string;
  storageType: StorageType;
  spiceLevel?: SpiceLevel;
  inStock: boolean;
  stockCount: number;
  isFeatured: boolean;
  isNew: boolean;
  isOnSale: boolean;
  discount?: number;
  tags: string[];
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  addresses: Address[];
  createdAt: string;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  deliveryAddress: Address;
  couponCode?: string;
  notes?: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrder: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
}

export interface DeliveryArea {
  id: string;
  name: string;
  fee: number;
  estimatedDays: string;
}
