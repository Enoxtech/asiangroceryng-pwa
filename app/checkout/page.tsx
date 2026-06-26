'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { MessageCircle, CreditCard, Building2, Banknote, Tag, Check, X, Truck, Store, MapPin, Clock, UserPlus, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buildCustomerConfirmation, openWhatsApp, ADMIN_WHATSAPP, buildAdminAlert } from '@/lib/whatsapp';
import { useUserNotificationStore } from '@/store/userNotificationStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useAdminStore } from '@/store/adminStore';
import { useAuthStore } from '@/store/authStore';
import type { OrderEmailPayload } from '@/app/api/notify-order/route';

type PaymentMethod = 'paystack' | 'flutterwave' | 'bank_transfer' | 'pay_on_delivery';
type DeliveryMethod = 'ship' | 'pickup';

interface PaystackHandler {
  openIframe: () => void;
}
interface PaystackPopSetupOptions {
  key: string;
  email: string;
  amount: number;
  currency: string;
  ref: string;
  callback: (response: { reference: string }) => void;
  onClose: () => void;
}
declare global {
  interface Window {
    PaystackPop?: { setup: (opts: PaystackPopSetupOptions) => PaystackHandler };
  }
}

let paystackScriptPromise: Promise<void> | null = null;

function loadPaystackScript(): Promise<void> {
  if (window.PaystackPop) return Promise.resolve();
  if (paystackScriptPromise) return paystackScriptPromise;

  paystackScriptPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      paystackScriptPromise = null;
      reject(new Error('Could not connect to Paystack — your network may be blocking it. Try a different connection, or use Bank Transfer / Pay on Delivery instead.'));
    }, 12000);

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.onload = () => { clearTimeout(timeout); resolve(); };
    script.onerror = () => {
      clearTimeout(timeout);
      paystackScriptPromise = null;
      reject(new Error('Could not load Paystack. Check your connection and try again.'));
    };
    document.body.appendChild(script);
  });
  return paystackScriptPromise;
}

const PICKUP_STORE = {
  name: 'Store F11: Ikeja Town-Square',
  address: '131 Obafemi Awolowo way, Ikeja, Lagos, 10001',
  hours: 'Pick up time 12:00PM – 4:00PM Mon–Sat',
};

interface DeliveryArea {
  id: string;
  name: string;
  fee: number;
  estimatedDays: string;
}

interface AppliedCoupon {
  code: string;
  type: 'percent' | 'fixed' | 'shipping';
  value: number;
  minOrder?: number | null;
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore();
  const { addNotification: addUserNotif } = useUserNotificationStore();
  const { addNotification: addAdminNotif } = useNotificationStore();
  const { bankDetails, addOrder } = useAdminStore();
  const { user, hydrate: hydrateAuth, register } = useAuthStore();
  const router = useRouter();
  const subtotal = totalPrice();
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('ship');
  const [deliveryAreas, setDeliveryAreas] = useState<DeliveryArea[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pay_on_delivery');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', city: '', notes: '',
  });
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [createAccount, setCreateAccount] = useState(false);
  const [accountPassword, setAccountPassword] = useState('');
  const [showAccountPassword, setShowAccountPassword] = useState(false);
  const [accountError, setAccountError] = useState('');
  const [paystack, setPaystack] = useState<{ publicKey: string; enabled: boolean }>({ publicKey: '', enabled: false });
  const [vatPercent, setVatPercent] = useState(0);
  const [paymentError, setPaymentError] = useState('');

  const selectedArea = deliveryAreas.find((a) => a.id === selectedAreaId) ?? deliveryAreas[0];

  useEffect(() => { hydrateAuth(); }, [hydrateAuth]);
  useEffect(() => {
    fetch('/api/settings/public')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setPaystack({ publicKey: data.paystackPublicKey, enabled: data.paystackEnabled });
        setVatPercent(data.vatPercent || 0);
      })
      .catch(() => {});
    fetch('/api/delivery-areas')
      .then((r) => (r.ok ? r.json() : []))
      .then((areas: DeliveryArea[]) => {
        setDeliveryAreas(areas);
        if (areas.length > 0) setSelectedAreaId(areas[0].id);
      })
      .catch(() => {});
  }, []);
  useEffect(() => {
    if (user) {
      setForm((f) => ({ ...f, name: f.name || user.name, email: f.email || user.email, phone: f.phone || user.phone, address: f.address || user.address || '' }));
    }
  }, [user]);

  async function applyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      });
      const json = await res.json();
      if (!res.ok) {
        setCouponError(json.error || 'Invalid promo code');
        return;
      }
      setAppliedCoupon(json);
      setCouponInput('');
    } catch {
      setCouponError('Could not check promo code. Try again.');
    } finally {
      setCouponLoading(false);
    }
  }

  function removeCoupon() { setAppliedCoupon(null); setCouponError(''); }

  const discount = appliedCoupon
    ? appliedCoupon.type === 'percent' ? Math.round(subtotal * appliedCoupon.value / 100)
    : appliedCoupon.type === 'shipping' ? (selectedArea?.fee ?? 0)
    : appliedCoupon.value
    : 0;

  const deliveryFee = deliveryMethod === 'pickup' ? 0 : (appliedCoupon?.type === 'shipping' ? 0 : (selectedArea?.fee ?? 0));
  const tax = Math.round(subtotal * vatPercent / 100);
  const total = subtotal + deliveryFee + tax - (appliedCoupon?.type !== 'shipping' ? discount : 0);

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
      tax: tax > 0 ? tax : undefined,
      total,
      area: deliveryMethod === 'pickup' ? 'Store Pickup' : (selectedArea?.name ?? ''),
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

  /** Optional account creation, run before placing/finalizing any order so the
   *  resulting session cookie lets the order link to the new account. */
  async function maybeCreateAccount() {
    if (!user && createAccount && accountPassword) {
      const result = await register({ name: form.name, email: form.email, phone: form.phone, password: accountPassword, address: form.address || undefined });
      if (!result.success) {
        setAccountError(result.error || 'Could not create account — order will continue as guest checkout.');
      }
    }
  }

  async function finalizeOrder(orderId: string, paymentRef?: string) {
    const orderDetails = buildOrderDetails(orderId);

    // 0. Persist real order to admin orders panel
    try {
      await addOrder({
        id: orderId,
        customer: form.name || 'Customer',
        phone: form.phone,
        email: form.email || undefined,
        subtotal: orderDetails.subtotal,
        deliveryFee: orderDetails.deliveryFee,
        discount: orderDetails.discount,
        tax: orderDetails.tax,
        couponCode: appliedCoupon?.code,
        total,
        status: 'pending',
        items: orderDetails.items,
        area: orderDetails.area,
        address: orderDetails.address,
        date: new Date().toISOString().slice(0, 10),
        payment: paymentMethod,
        paymentRef,
      });
    } catch (err) {
      console.error('[checkout] failed to save order to admin panel', err);
      setLoading(false);
      setPaymentError('Your payment succeeded but we could not save the order. Please contact us on WhatsApp with your payment reference.');
      return;
    }

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

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    setPaymentError('');

    if (paymentMethod === 'paystack') {
      await handlePaystackCheckout();
      return;
    }

    setLoading(true);
    setAccountError('');
    const orderId = `AGNG-${Date.now().toString().slice(-6)}`;
    await maybeCreateAccount();
    await new Promise((r) => setTimeout(r, 1200));
    await finalizeOrder(orderId);
  }

  async function handlePaystackCheckout() {
    if (!paystack.enabled || !paystack.publicKey) return;
    setLoading(true);
    setAccountError('');
    setPaymentError('');

    try {
      await maybeCreateAccount();
      await loadPaystackScript();
    } catch (err) {
      setLoading(false);
      setPaymentError(err instanceof Error ? err.message : 'Could not start payment.');
      return;
    }

    const orderId = `AGNG-${Date.now().toString().slice(-6)}`;

    if (!window.PaystackPop) {
      setLoading(false);
      setPaymentError('Could not load Paystack. Please try again.');
      return;
    }

    const handler = window.PaystackPop.setup({
      key: paystack.publicKey,
      email: form.email,
      amount: Math.round(total * 100),
      currency: 'NGN',
      ref: orderId,
      callback: (response) => {
        finalizeOrder(orderId, response.reference);
      },
      onClose: () => {
        setLoading(false);
      },
    });
    handler.openIframe();
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
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address *</label>
            <input required value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@email.com" type="email" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-red" />
          </div>

          {!user && (
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={createAccount}
                  onChange={(e) => setCreateAccount(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-brand-red"
                />
                <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  <UserPlus className="h-4 w-4 text-brand-red" /> Create an account to track this order (optional)
                </span>
              </label>
              {createAccount && (
                <div className="mt-3 relative">
                  <input
                    type={showAccountPassword ? 'text' : 'password'}
                    required={createAccount}
                    value={accountPassword}
                    onChange={(e) => setAccountPassword(e.target.value)}
                    placeholder="Choose a password (10+ characters)"
                    className="w-full px-4 py-3 pr-11 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
                  />
                  <button type="button" onClick={() => setShowAccountPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showAccountPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              )}
              {accountError && <p className="text-xs text-red-500 mt-2">{accountError}</p>}
            </div>
          )}

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
              {deliveryAreas.length === 0 ? (
                <p className="text-sm text-gray-400 px-1">Loading delivery areas…</p>
              ) : (
                <select
                  value={selectedAreaId}
                  onChange={(e) => setSelectedAreaId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-red bg-white"
                >
                  {deliveryAreas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name} — {formatPrice(area.fee)} · {area.estimatedDays}
                    </option>
                  ))}
                </select>
              )}
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
                <span className="font-semibold text-green-800 flex-1">
                  {appliedCoupon.code} — {appliedCoupon.type === 'percent' ? `${appliedCoupon.value}% off` : appliedCoupon.type === 'shipping' ? 'Free delivery' : `₦${appliedCoupon.value.toLocaleString()} off`} applied!
                </span>
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
                  disabled={couponLoading}
                  className="px-4 py-3 bg-brand-red text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-colors whitespace-nowrap disabled:opacity-60"
                >
                  {couponLoading ? 'Checking…' : 'Apply'}
                </button>
              </div>
            )}
            {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery ({deliveryMethod === 'pickup' ? 'Pickup' : (selectedArea?.name ?? '—')})</span>
              {deliveryFee === 0
                ? <span className="text-green-600 font-semibold">FREE</span>
                : <span>{formatPrice(deliveryFee)}</span>}
            </div>
            {tax > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>VAT ({vatPercent}%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
            )}
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
            { id: 'paystack', label: 'Paystack', desc: 'Debit/credit card, bank transfer, USSD', icon: <CreditCard className="h-5 w-5" />, badge: paystack.enabled ? null : 'Coming soon' },
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

          {paymentError && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {paymentError}
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
            {tax > 0 && (
              <div className="flex justify-between text-gray-600 text-xs pt-1 border-t">
                <span>VAT ({vatPercent}%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-900 border-t pt-2"><span>Total</span><span className="text-brand-red">{formatPrice(total)}</span></div>
          </div>

          <div className="flex flex-col gap-3">
            <Button type="submit" size="lg" loading={loading} className="w-full" disabled={paymentMethod === 'paystack' && !paystack.enabled}>
              {paymentMethod === 'paystack' && !paystack.enabled ? 'Coming Soon' : paymentMethod === 'paystack' ? `Pay with Paystack · ${formatPrice(total)}` : `Place Order · ${formatPrice(total)}`}
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
