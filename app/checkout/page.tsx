'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import { deliveryAreas } from '@/data/products';
import { Button } from '@/components/ui/Button';
import { MessageCircle, CreditCard, Building2, Banknote, Tag, Check, X, Truck, Store, MapPin, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buildCustomerConfirmation, openWhatsApp, ADMIN_WHATSAPP, buildAdminAlert } from '@/lib/whatsapp';
import { useUserNotificationStore } from '@/store/userNotificationStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useAdminStore } from '@/store/adminStore';
import type { OrderEmailPayload } from '@/app/api/notify-order/route';

type PaymentMethod = 'paystack' | 'flutterwave' | 'bank_transfer' | 'pay_on_delivery';
type DeliveryMethod = 'ship' | 'pickup';

const PICKUP_STORE = {
  name: 'Store F11: Ikeja Town-Square',
  address: '131 Obafemi Awolowo way, Ikeja, Lagos, 10001',
  hours: 'Pick up time 12:00PM – 4:00PM Mon–Sat',
};

const PROMO_CODES: Record<string, { type: 'percent' | 'fixed' | 'shipping'; value: number; label: string; minOrder?: number }> = {
  SHOPASIA:     { type: 'percent', value: 10, label: '10% off' },
  ASIAN10:      { type: 'percent', value: 10, label: '10% off',      minOrder: 5000 },
  NEWCUSTOMER:  { type: 'percent', value: 15, label: '15% off',      minOrder: 3000 },
  WELCOME20:    { type: 'percent', value: 20, label: '20% off',      minOrder: 10000 },
  FREESHIP:     { type: 'shipping', value: 0, label: 'Free delivery' },
};

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore();
  const { addNotification: addUserNotif } = useUserNotificationStore();
  const { addNotification: addAdminNotif } = useNotificationStore();
  const { bankDetails, addOrder } = useAdminStore();
  const router = useRouter();
  const subtotal = totalPrice();
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('ship');
  const [selectedArea, setSelectedArea] = useState(deliveryAreas[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pay_on_delivery');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', city: '', notes: '',
  });
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<typeof PROMO_CODES[string] & { code: string } | null>(null);
  const [couponError, setCouponError] = useState('');

  function applyCoupon() {
    const code = couponInput.trim().toUpperCase();
    const promo = PROMO_CODES[code];
    if (!promo) { setCouponError('Invalid promo code'); return; }
    if (promo.minOrder && subtotal < promo.minOrder) {
      setCouponError(`Minimum order of ${formatPrice(promo.minOrder)} required`);
      return;
    }
    setAppliedCoupon({ ...promo, code });
    setCouponError('');
    setCouponInput('');
  }

  function removeCoupon() { setAppliedCoupon(null); setCouponError(''); }

  const discount = appliedCoupon
    ? appliedCoupon.type === 'percent' ? Math.round(subtotal * appliedCoupon.value / 100)
    : appliedCoupon.type === 'shipping' ? selectedArea.fee
    : appliedCoupon.value
    : 0;

  const deliveryFee = deliveryMethod === 'pickup' ? 0 : (appliedCoupon?.type === 'shipping' ? 0 : selectedArea.fee);
  const total = subtotal + deliveryFee - (appliedCoupon?.type !== 'shipping' ? discount : 0);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    setStep('payment');
  }

  function buildOrderDetails(orderId: string) {
    return {
      id: orderId,
      customer: form.name || 'Customer',
      phone: form.phone,
      email: form.email,
      items: items.map((i) => ({ name: i.product.name, quantity: i.quantity, price: i.product.price })),
      subtotal,
      deliveryFee,
      discount: discount > 0 ? discount : undefined,
      total,
      area: deliveryMethod === 'pickup' ? 'Store Pickup' : selectedArea.name,
      address: deliveryMethod === 'pickup' ? 'Store F11, Ikeja Town-Square' : form.address,
      paymentMethod,
      notes: form.notes,
    };
  }

  function sendAdminEmail(payload: OrderEmailPayload) {
    // Fire-and-forget — never block the order flow
    fetch('/api/notify-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => { /* silent — email is non-critical */ });
  }

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const orderId = `AGNG-${Date.now().toString().slice(-6)}`;
    await new Promise((r) => setTimeout(r, 1200));

    const orderDetails = buildOrderDetails(orderId);

    // 0. Persist real order to admin orders panel
    addOrder({
      id: orderId,
      customer: form.name || 'Customer',
      phone: form.phone,
      total,
      status: 'pending',
      items: items.length,
      area: deliveryMethod === 'pickup' ? 'Store Pickup' : selectedArea.name,
      date: new Date().toISOString().slice(0, 10),
      payment: paymentMethod,
    });

    // 1. Admin email (instant, fire-and-forget)
    sendAdminEmail({ ...orderDetails, orderId: orderDetails.id, source: 'checkout' });

    // 2. In-app user notification
    addUserNotif({
      type: 'order',
      title: `Order ${orderId} Confirmed!`,
      body: `Your order for ${items.length} item${items.length > 1 ? 's' : ''} (₦${total.toLocaleString()}) has been placed successfully.`,
      link: '/orders',
    });

    // 3. In-app admin notification
    addAdminNotif({
      type: 'order',
      title: 'New Order Received',
      message: `Order ${orderId} placed by ${form.name || 'Customer'} — ₦${total.toLocaleString()} · ${paymentMethod.replace(/_/g, ' ')}`,
      actionUrl: '/admin/orders',
    });

    // 4. WhatsApp customer confirmation
    if (form.phone) {
      const customerMsg = buildCustomerConfirmation(orderDetails);
      openWhatsApp(form.phone, customerMsg);
    }

    // 5. WhatsApp admin alert
    const adminMsg = buildAdminAlert(orderDetails);
    openWhatsApp(ADMIN_WHATSAPP, adminMsg);

    clearCart();
    router.push(`/order-success?order=${orderId}`);
  }

  function handleWhatsAppOrder() {
    const orderId = `AGNG-${Date.now().toString().slice(-6)}`;
    const orderDetails = buildOrderDetails(orderId);
    const message = buildCustomerConfirmation(orderDetails);

    // 1. Admin email (fire-and-forget)
    sendAdminEmail({ ...orderDetails, orderId: orderDetails.id, source: 'whatsapp' });

    // 2. Admin WhatsApp alert
    const adminMsg = buildAdminAlert(orderDetails);
    openWhatsApp(ADMIN_WHATSAPP, adminMsg);

    // 3. Customer WhatsApp confirmation
    window.open(`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '2348000000000'}?text=${encodeURIComponent(message)}`, '_blank');

    // 4. In-app notifications
    addUserNotif({
      type: 'order',
      title: `Order ${orderId} via WhatsApp`,
      body: `Your WhatsApp order for ₦${total.toLocaleString()} has been sent. We'll confirm shortly.`,
      link: '/orders',
    });
    addAdminNotif({
      type: 'order',
      title: 'New WhatsApp Order',
      message: `WhatsApp order ${orderId} from ${form.name || 'Customer'} — ₦${total.toLocaleString()}`,
      actionUrl: '/admin/orders',
    });
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Your cart is empty.</p>
        <Button onClick={() => router.push('/shop')} className="mt-4">Shop Now</Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8">
        {(['details', 'payment'] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold', step === s || (s === 'details' && step === 'payment') ? 'bg-brand-red text-white' : 'bg-gray-200 text-gray-400')}>
              {i + 1}
            </div>
            <span className={cn('text-sm font-medium capitalize', step === s ? 'text-gray-900' : 'text-gray-400')}>{s === 'details' ? 'Delivery Details' : 'Payment'}</span>
            {i < 1 && <div className="flex-1 h-px bg-gray-200 w-8" />}
          </div>
        ))}
      </div>

      {step === 'details' ? (
        <form onSubmit={handleContinue} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
            <input required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="John Doe" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-red" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number *</label>
            <input required value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+234 800 000 0000" type="tel" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-red" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
            <input value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@email.com" type="email" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-red" />
          </div>
          {deliveryMethod === 'ship' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Delivery Address *</label>
            <textarea required={deliveryMethod === 'ship'} value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="House number, street name, area..." rows={2} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-red resize-none" />
          </div>
          )}
          {/* Delivery method toggle */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
              {([
                { id: 'ship' as DeliveryMethod, label: 'Ship', Icon: Truck },
                { id: 'pickup' as DeliveryMethod, label: 'Pickup', Icon: Store },
              ]).map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setDeliveryMethod(id)}
                  className={cn(
                    'flex items-center justify-center gap-2 py-3 rounded-[10px] text-sm font-semibold transition-all',
                    deliveryMethod === id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {deliveryMethod === 'pickup' ? (
            /* Pickup location card */
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Pickup Location</label>
              <div className="border-2 border-brand-red rounded-xl p-4 bg-red-50">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-brand-red flex items-center justify-center shrink-0 mt-0.5">
                      <div className="h-3 w-3 rounded-full bg-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{PICKUP_STORE.name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 shrink-0" /> {PICKUP_STORE.address}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3 shrink-0" /> {PICKUP_STORE.hours}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full shrink-0">FREE</span>
                </div>
              </div>
            </div>
          ) : (
            /* Ship: delivery area selector */
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Delivery Area *</label>
              <select
                value={selectedArea.id}
                onChange={(e) => setSelectedArea(deliveryAreas.find((a) => a.id === e.target.value) ?? deliveryAreas[0])}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-red bg-white"
              >
                {deliveryAreas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name} — {formatPrice(area.fee)} · {area.estimatedDays}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Order Notes (optional)</label>
            <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Any special instructions..." rows={2} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-red resize-none" />
          </div>

          {/* Promo code */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Promo Code</label>
            {appliedCoupon ? (
              <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm">
                <Check className="h-4 w-4 text-green-600 shrink-0" />
                <span className="font-semibold text-green-800 flex-1">{appliedCoupon.code} — {appliedCoupon.label} applied!</span>
                <button type="button" onClick={removeCoupon} className="text-gray-400 hover:text-gray-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => { setCouponInput(e.target.value); setCouponError(''); }}
                    placeholder="Enter code (e.g. ASIAN10)"
                    className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-red uppercase"
                  />
                </div>
                <button
                  type="button"
                  onClick={applyCoupon}
                  className="px-4 py-3 bg-brand-red text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-colors whitespace-nowrap"
                >
                  Apply
                </button>
              </div>
            )}
            {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery ({deliveryMethod === 'pickup' ? 'Pickup' : selectedArea.name})</span>
              {deliveryFee === 0
                ? <span className="text-green-600 font-semibold">FREE</span>
                : <span>{formatPrice(deliveryFee)}</span>}
            </div>
            {appliedCoupon && appliedCoupon.type !== 'shipping' && discount > 0 && (
              <div className="flex justify-between text-green-600 font-semibold">
                <span>Discount ({appliedCoupon.code})</span>
                <span>−{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-900 border-t pt-2"><span>Total</span><span className="text-brand-red">{formatPrice(total)}</span></div>
          </div>

          <Button type="submit" size="lg" className="w-full">Continue to Payment</Button>
        </form>
      ) : (
        <form onSubmit={handlePlaceOrder} className="space-y-4">
          <h2 className="font-bold text-gray-900 text-lg">Choose Payment Method</h2>

          {[
            { id: 'paystack', label: 'Paystack', desc: 'Debit/credit card, bank transfer, USSD', icon: <CreditCard className="h-5 w-5" />, badge: 'Coming soon' },
            { id: 'flutterwave', label: 'Flutterwave', desc: 'Cards, mobile money, bank', icon: <CreditCard className="h-5 w-5" />, badge: 'Coming soon' },
            { id: 'bank_transfer', label: 'Bank Transfer', desc: 'Transfer to our account details', icon: <Building2 className="h-5 w-5" />, badge: null },
            { id: 'pay_on_delivery', label: 'Pay on Delivery', desc: 'Cash on delivery (Lagos only)', icon: <Banknote className="h-5 w-5" />, badge: null },
          ].map(({ id, label, desc, icon, badge }) => (
            <label
              key={id}
              className={cn(
                'flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors',
                paymentMethod === id ? 'border-brand-red bg-red-50' : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <input type="radio" name="payment" value={id} checked={paymentMethod === id} onChange={() => setPaymentMethod(id as PaymentMethod)} className="sr-only" />
              <div className={cn('shrink-0', paymentMethod === id ? 'text-brand-red' : 'text-gray-400')}>{icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-800">{label}</span>
                  {badge && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">{badge}</span>}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
              <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0', paymentMethod === id ? 'border-brand-red' : 'border-gray-300')}>
                {paymentMethod === id && <div className="w-2.5 h-2.5 rounded-full bg-brand-red" />}
              </div>
            </label>
          ))}

          {paymentMethod === 'bank_transfer' && (
            <div className="bg-blue-50 rounded-xl p-4 text-sm">
              <p className="font-bold text-blue-900 mb-2">Bank Transfer Details</p>
              {bankDetails.bankName ? (
                <>
                  <div className="space-y-1 text-blue-800">
                    <p><span className="text-blue-500">Bank:</span> {bankDetails.bankName}{bankDetails.bankBranch ? ` (${bankDetails.bankBranch})` : ''}</p>
                    <p><span className="text-blue-500">Account Name:</span> {bankDetails.accountName}</p>
                    <p><span className="text-blue-500">Account Number:</span> <span className="font-bold tracking-wider">{bankDetails.accountNumber}</span></p>
                  </div>
                  {bankDetails.note && <p className="text-blue-500 text-xs mt-2">{bankDetails.note}</p>}
                </>
              ) : (
                <p className="text-blue-700">Bank details not yet configured. Please contact us on WhatsApp to get our account details.</p>
              )}
            </div>
          )}

          {/* Final summary */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            {items.slice(0, 3).map((i) => (
              <div key={i.product.id} className="flex justify-between text-gray-600 text-xs">
                <span className="truncate">{i.product.name} x{i.quantity}</span>
                <span className="shrink-0 ml-2">{formatPrice(i.product.price * i.quantity)}</span>
              </div>
            ))}
            {items.length > 3 && <p className="text-xs text-gray-400">+{items.length - 3} more items</p>}
            <div className="flex justify-between font-bold text-gray-900 border-t pt-2"><span>Total</span><span className="text-brand-red">{formatPrice(total)}</span></div>
          </div>

          <div className="flex flex-col gap-3">
            <Button type="submit" size="lg" loading={loading} className="w-full" disabled={paymentMethod === 'paystack' || paymentMethod === 'flutterwave'}>
              {paymentMethod === 'paystack' || paymentMethod === 'flutterwave' ? 'Coming Soon' : `Place Order · ${formatPrice(total)}`}
            </Button>
            <button type="button" onClick={handleWhatsAppOrder} className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors">
              <MessageCircle className="h-5 w-5" /> Order via WhatsApp
            </button>
            <button type="button" onClick={() => setStep('details')} className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              ← Back to details
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
