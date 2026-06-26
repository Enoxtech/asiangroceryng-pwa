'use client';

import { useState, useEffect } from 'react';
import { Save, Store, Phone, Clock, MessageCircle, Building2, CreditCard, Mail } from 'lucide-react';
import { useAdminStore } from '@/store/adminStore';

const sections = [
  {
    id: 'store',
    title: 'Store Information',
    Icon: Store,
    fields: [
      { key: 'storeName', label: 'Store Name', value: 'Asian Grocery Nigeria', type: 'text' },
      { key: 'tagline', label: 'Tagline', value: 'Exploring Asia Through Food', type: 'text' },
      { key: 'email', label: 'Store Email', value: 'hello@asiangroceryng.com', type: 'email' },
    ],
  },
  {
    id: 'contact',
    title: 'Contact & Delivery',
    Icon: Phone,
    fields: [
      { key: 'phone', label: 'WhatsApp Number', value: '2348000000000', type: 'text' },
      { key: 'address', label: 'Store Address', value: 'Lagos, Nigeria', type: 'text' },
      { key: 'deliveryMin', label: 'Free Delivery Minimum (₦)', value: '15000', type: 'number' },
    ],
  },
  {
    id: 'hours',
    title: 'Business Hours',
    Icon: Clock,
    fields: [
      { key: 'weekdays', label: 'Mon – Fri', value: '8:00 AM – 7:00 PM WAT', type: 'text' },
      { key: 'saturday', label: 'Saturday', value: '9:00 AM – 5:00 PM WAT', type: 'text' },
      { key: 'sunday', label: 'Sunday', value: 'Closed', type: 'text' },
    ],
  },
];

interface IntegrationSettingsView {
  paystackPublicKey: string;
  paystackSecretKeySet: boolean;
  flutterwavePublicKey: string;
  flutterwaveSecretKeySet: boolean;
  gmailUser: string;
  gmailAppPasswordSet: boolean;
  adminEmail: string;
}

export default function AdminSettingsPage() {
  const { bankDetails, updateBankDetails } = useAdminStore();
  const [saved, setSaved] = useState(false);
  const [bankSaved, setBankSaved] = useState(false);
  const [bank, setBank] = useState({
    bankName: bankDetails.bankName,
    accountNumber: bankDetails.accountNumber,
    accountName: bankDetails.accountName,
    bankBranch: bankDetails.bankBranch,
    note: bankDetails.note,
  });

  const [integrations, setIntegrations] = useState<IntegrationSettingsView | null>(null);
  const [payment, setPayment] = useState({
    paystackPublicKey: '',
    paystackSecretKey: '',
    flutterwavePublicKey: '',
    flutterwaveSecretKey: '',
  });
  const [email, setEmail] = useState({ gmailUser: '', gmailAppPassword: '', adminEmail: '' });
  const [paymentSaved, setPaymentSaved] = useState(false);
  const [emailSaved, setEmailSaved] = useState(false);

  useEffect(() => {
    fetch('/api/settings/integrations')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: IntegrationSettingsView | null) => {
        if (!data) return;
        setIntegrations(data);
        setPayment({
          paystackPublicKey: data.paystackPublicKey,
          paystackSecretKey: '',
          flutterwavePublicKey: data.flutterwavePublicKey,
          flutterwaveSecretKey: '',
        });
        setEmail({ gmailUser: data.gmailUser, gmailAppPassword: '', adminEmail: data.adminEmail });
      })
      .catch(() => {});
  }, []);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleBankSave() {
    updateBankDetails(bank);
    setBankSaved(true);
    setTimeout(() => setBankSaved(false), 2000);
  }

  async function handlePaymentSave() {
    const res = await fetch('/api/settings/integrations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payment),
    });
    if (res.ok) {
      const data: IntegrationSettingsView = await res.json();
      setIntegrations(data);
      setPayment((p) => ({ ...p, paystackSecretKey: '', flutterwaveSecretKey: '' }));
      setPaymentSaved(true);
      setTimeout(() => setPaymentSaved(false), 2000);
    }
  }

  async function handleEmailSave() {
    const res = await fetch('/api/settings/integrations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(email),
    });
    if (res.ok) {
      const data: IntegrationSettingsView = await res.json();
      setIntegrations(data);
      setEmail((e) => ({ ...e, gmailAppPassword: '' }));
      setEmailSaved(true);
      setTimeout(() => setEmailSaved(false), 2000);
    }
  }

  const inputCls = 'w-full px-4 py-2.5 rounded-xl text-sm text-gray-200 border font-display focus:outline-none focus:border-brand-red placeholder:text-gray-600';
  const inputStyle = { background: '#0f0e0b', borderColor: 'rgba(255,255,255,0.08)' };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white font-display">Settings</h1>
          <p className="text-gray-500 text-sm mt-0.5 font-display">Manage your store configuration</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold font-display transition-all"
          style={{ background: saved ? '#10B981' : '#c41e3a', color: 'white' }}
        >
          <Save className="h-4 w-4" />
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {sections.map(({ id, title, Icon, fields }) => (
        <div key={id} className="rounded-2xl border overflow-hidden" style={{ background: '#1a1814', borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <Icon className="h-4 w-4 text-gray-400" />
            <h2 className="font-bold text-white text-sm font-display">{title}</h2>
          </div>
          <div className="p-5 space-y-4">
            {fields.map(({ key, label, value, type }) => (
              <div key={key}>
                <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1.5">{label}</label>
                <input
                  type={type}
                  defaultValue={value}
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Bank Transfer Details */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: '#1a1814', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <Building2 className="h-4 w-4 text-blue-400" />
          <h2 className="font-bold text-white text-sm font-display">Bank Transfer Details</h2>
          <span className="ml-auto text-[10px] font-label uppercase px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400">
            {bank.bankName ? 'Configured' : 'Not Set'}
          </span>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-xs text-gray-500 font-display">
            These details are shown to customers who choose &quot;Bank Transfer&quot; at checkout.
          </p>
          {[
            { key: 'bankName', label: 'Bank Name', placeholder: 'e.g. GTBank' },
            { key: 'accountNumber', label: 'Account Number', placeholder: 'e.g. 0123456789' },
            { key: 'accountName', label: 'Account Name', placeholder: 'e.g. Asian Grocery Nigeria' },
            { key: 'bankBranch', label: 'Bank Branch (optional)', placeholder: 'e.g. Ikeja Branch' },
            { key: 'note', label: 'Payment Note', placeholder: 'e.g. Send proof via WhatsApp after transfer' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1.5">{label}</label>
              <input
                type="text"
                value={bank[key as keyof typeof bank]}
                onChange={(e) => setBank((b) => ({ ...b, [key]: e.target.value }))}
                placeholder={placeholder}
                className={inputCls}
                style={inputStyle}
              />
            </div>
          ))}
          <button
            onClick={handleBankSave}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold font-display transition-all w-full justify-center"
            style={{ background: bankSaved ? '#10B981' : '#1d4ed8', color: 'white' }}
          >
            <Save className="h-4 w-4" />
            {bankSaved ? 'Bank Details Saved!' : 'Save Bank Details'}
          </button>
        </div>
      </div>

      {/* WhatsApp integration status */}
      <div className="rounded-2xl border p-5" style={{ background: '#1a1814', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3 mb-4">
          <MessageCircle className="h-4 w-4 text-green-400" />
          <h2 className="font-bold text-white text-sm font-display">WhatsApp Integration</h2>
          <span className="ml-auto text-[10px] font-label uppercase px-2 py-0.5 rounded-full bg-green-500/15 text-green-400">Active</span>
        </div>
        <p className="text-xs text-gray-400 font-display">WhatsApp ordering is active. Customers can order directly via WhatsApp. Set your number above in &quot;Contact &amp; Delivery&quot;.</p>
        <div className="mt-3 p-3 rounded-xl border text-xs font-label text-gray-500" style={{ background: '#0f0e0b', borderColor: 'rgba(255,255,255,0.06)' }}>
          NEXT_PUBLIC_WHATSAPP_NUMBER=2348000000000
        </div>
      </div>

      {/* Payment Gateway Keys */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: '#1a1814', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <CreditCard className="h-4 w-4 text-amber-400" />
          <h2 className="font-bold text-white text-sm font-display">Payment Gateway</h2>
          <span
            className="ml-auto text-[10px] font-label uppercase px-2 py-0.5 rounded-full"
            style={{
              background: integrations?.paystackSecretKeySet || integrations?.flutterwaveSecretKeySet ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
              color: integrations?.paystackSecretKeySet || integrations?.flutterwaveSecretKeySet ? '#34d399' : '#fbbf24',
            }}
          >
            {integrations?.paystackSecretKeySet || integrations?.flutterwaveSecretKeySet ? 'Configured' : 'Setup Required'}
          </span>
        </div>
        <div className="p-5 space-y-5">
          <p className="text-xs text-gray-500 font-display">
            Add your Paystack and/or Flutterwave API keys to accept card payments. Secret keys are never shown again once saved — only whether one is set.
          </p>

          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-300 font-display">Paystack</p>
            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1.5">Public Key</label>
              <input
                type="text"
                value={payment.paystackPublicKey}
                onChange={(e) => setPayment((p) => ({ ...p, paystackPublicKey: e.target.value }))}
                placeholder="pk_live_xxxxxxxxxxxxxxxx"
                className={inputCls}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1.5">
                Secret Key {integrations?.paystackSecretKeySet && <span className="text-emerald-400">(currently set)</span>}
              </label>
              <input
                type="password"
                value={payment.paystackSecretKey}
                onChange={(e) => setPayment((p) => ({ ...p, paystackSecretKey: e.target.value }))}
                placeholder={integrations?.paystackSecretKeySet ? '••••••••••••••••' : 'sk_live_xxxxxxxxxxxxxxxx'}
                className={inputCls}
                style={inputStyle}
              />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-300 font-display">Flutterwave</p>
            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1.5">Public Key</label>
              <input
                type="text"
                value={payment.flutterwavePublicKey}
                onChange={(e) => setPayment((p) => ({ ...p, flutterwavePublicKey: e.target.value }))}
                placeholder="FLWPUBK-xxxxxxxxxxxxxxxx"
                className={inputCls}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1.5">
                Secret Key {integrations?.flutterwaveSecretKeySet && <span className="text-emerald-400">(currently set)</span>}
              </label>
              <input
                type="password"
                value={payment.flutterwaveSecretKey}
                onChange={(e) => setPayment((p) => ({ ...p, flutterwaveSecretKey: e.target.value }))}
                placeholder={integrations?.flutterwaveSecretKeySet ? '••••••••••••••••' : 'FLWSECK-xxxxxxxxxxxxxxxx'}
                className={inputCls}
                style={inputStyle}
              />
            </div>
          </div>

          <button
            onClick={handlePaymentSave}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold font-display transition-all w-full justify-center"
            style={{ background: paymentSaved ? '#10B981' : '#b45309', color: 'white' }}
          >
            <Save className="h-4 w-4" />
            {paymentSaved ? 'Payment Keys Saved!' : 'Save Payment Keys'}
          </button>
        </div>
      </div>

      {/* Email Notifications (Gmail) */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: '#1a1814', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <Mail className="h-4 w-4 text-red-400" />
          <h2 className="font-bold text-white text-sm font-display">Email Notifications</h2>
          <span
            className="ml-auto text-[10px] font-label uppercase px-2 py-0.5 rounded-full"
            style={{
              background: integrations?.gmailAppPasswordSet ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
              color: integrations?.gmailAppPasswordSet ? '#34d399' : '#fbbf24',
            }}
          >
            {integrations?.gmailAppPasswordSet ? 'Configured' : 'Setup Required'}
          </span>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-xs text-gray-500 font-display">
            Order confirmation emails (to you and to customers) are sent via Gmail SMTP. Generate an app password at{' '}
            <span className="text-gray-300">myaccount.google.com/apppasswords</span>.
          </p>
          <div>
            <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1.5">Gmail Address (sends from)</label>
            <input
              type="email"
              value={email.gmailUser}
              onChange={(e) => setEmail((s) => ({ ...s, gmailUser: e.target.value }))}
              placeholder="yourstore@gmail.com"
              className={inputCls}
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1.5">
              Gmail App Password {integrations?.gmailAppPasswordSet && <span className="text-emerald-400">(currently set)</span>}
            </label>
            <input
              type="password"
              value={email.gmailAppPassword}
              onChange={(e) => setEmail((s) => ({ ...s, gmailAppPassword: e.target.value }))}
              placeholder={integrations?.gmailAppPasswordSet ? '••••••••••••••••' : 'xxxx xxxx xxxx xxxx'}
              className={inputCls}
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1.5">Admin Notification Email</label>
            <input
              type="email"
              value={email.adminEmail}
              onChange={(e) => setEmail((s) => ({ ...s, adminEmail: e.target.value }))}
              placeholder="admin@yourstore.com"
              className={inputCls}
              style={inputStyle}
            />
          </div>
          <button
            onClick={handleEmailSave}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold font-display transition-all w-full justify-center"
            style={{ background: emailSaved ? '#10B981' : '#b91c1c', color: 'white' }}
          >
            <Save className="h-4 w-4" />
            {emailSaved ? 'Email Settings Saved!' : 'Save Email Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
