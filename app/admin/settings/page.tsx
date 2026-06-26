'use client';

import { useState, useEffect } from 'react';
import { Save, Store, Phone, Clock, MessageCircle, Building2, CreditCard, Mail, Percent } from 'lucide-react';
import { useAdminStore } from '@/store/adminStore';

interface IntegrationSettingsView {
  paystackPublicKey: string;
  paystackSecretKeySet: boolean;
  flutterwavePublicKey: string;
  flutterwaveSecretKeySet: boolean;
  gmailUser: string;
  gmailAppPasswordSet: boolean;
  adminEmail: string;
  resendFromEmail: string;
  resendApiKeySet: boolean;
  vatPercent: number;
  whatsappPhoneNumberId: string;
  whatsappAccessTokenSet: boolean;
  whatsappBusinessAccountId: string;
  whatsappOrderTemplateName: string;
  whatsappTemplateLanguage: string;
  storeName: string;
  tagline: string;
  storeEmail: string;
  storeAddress: string;
  businessHoursWeekdays: string;
  businessHoursSaturday: string;
  businessHoursSunday: string;
}

export default function AdminSettingsPage() {
  const { bankDetails, updateBankDetails } = useAdminStore();
  const [bankSaved, setBankSaved] = useState(false);
  const [storeInfo, setStoreInfo] = useState({ storeName: '', tagline: '', storeEmail: '', storeAddress: '' });
  const [hours, setHours] = useState({ businessHoursWeekdays: '', businessHoursSaturday: '', businessHoursSunday: '' });
  const [storeInfoSaved, setStoreInfoSaved] = useState(false);
  const [hoursSaved, setHoursSaved] = useState(false);
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
  const [email, setEmail] = useState({ gmailUser: '', gmailAppPassword: '', adminEmail: '', resendApiKey: '', resendFromEmail: '' });
  const [tax, setTax] = useState({ vatPercent: 0 });
  const [whatsapp, setWhatsapp] = useState({
    whatsappPhoneNumberId: '',
    whatsappAccessToken: '',
    whatsappBusinessAccountId: '',
    whatsappOrderTemplateName: '',
    whatsappTemplateLanguage: 'en_US',
  });
  const [paymentSaved, setPaymentSaved] = useState(false);
  const [emailSaved, setEmailSaved] = useState(false);
  const [taxSaved, setTaxSaved] = useState(false);
  const [whatsappSaved, setWhatsappSaved] = useState(false);

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
        setEmail({ gmailUser: data.gmailUser, gmailAppPassword: '', adminEmail: data.adminEmail, resendApiKey: '', resendFromEmail: data.resendFromEmail });
        setTax({ vatPercent: data.vatPercent });
        setWhatsapp({
          whatsappPhoneNumberId: data.whatsappPhoneNumberId,
          whatsappAccessToken: '',
          whatsappBusinessAccountId: data.whatsappBusinessAccountId,
          whatsappOrderTemplateName: data.whatsappOrderTemplateName,
          whatsappTemplateLanguage: data.whatsappTemplateLanguage,
        });
        setStoreInfo({ storeName: data.storeName, tagline: data.tagline, storeEmail: data.storeEmail, storeAddress: data.storeAddress });
        setHours({ businessHoursWeekdays: data.businessHoursWeekdays, businessHoursSaturday: data.businessHoursSaturday, businessHoursSunday: data.businessHoursSunday });
      })
      .catch(() => {});
  }, []);

  async function handleStoreInfoSave() {
    const res = await fetch('/api/settings/integrations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(storeInfo),
    });
    if (res.ok) {
      const data: IntegrationSettingsView = await res.json();
      setIntegrations(data);
      setStoreInfoSaved(true);
      setTimeout(() => setStoreInfoSaved(false), 2000);
    }
  }

  async function handleHoursSave() {
    const res = await fetch('/api/settings/integrations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hours),
    });
    if (res.ok) {
      const data: IntegrationSettingsView = await res.json();
      setIntegrations(data);
      setHoursSaved(true);
      setTimeout(() => setHoursSaved(false), 2000);
    }
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
      setEmail((e) => ({ ...e, gmailAppPassword: '', resendApiKey: '' }));
      setEmailSaved(true);
      setTimeout(() => setEmailSaved(false), 2000);
    }
  }

  async function handleTaxSave() {
    const res = await fetch('/api/settings/integrations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tax),
    });
    if (res.ok) {
      const data: IntegrationSettingsView = await res.json();
      setIntegrations(data);
      setTaxSaved(true);
      setTimeout(() => setTaxSaved(false), 2000);
    }
  }

  async function handleWhatsappSave() {
    const res = await fetch('/api/settings/integrations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(whatsapp),
    });
    if (res.ok) {
      const data: IntegrationSettingsView = await res.json();
      setIntegrations(data);
      setWhatsapp((w) => ({ ...w, whatsappAccessToken: '' }));
      setWhatsappSaved(true);
      setTimeout(() => setWhatsappSaved(false), 2000);
    }
  }

  const inputCls = 'w-full px-4 py-2.5 rounded-xl text-sm text-gray-200 border font-display focus:outline-none focus:border-brand-red placeholder:text-gray-600';
  const inputStyle = { background: '#0f0e0b', borderColor: 'rgba(255,255,255,0.08)' };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white font-display">Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5 font-display">Manage your store configuration</p>
      </div>

      {/* Store Information */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: '#1a1814', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <Store className="h-4 w-4 text-gray-400" />
          <h2 className="font-bold text-white text-sm font-display">Store Information</h2>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1.5">Store Name</label>
            <input value={storeInfo.storeName} onChange={(e) => setStoreInfo((s) => ({ ...s, storeName: e.target.value }))} className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1.5">Tagline</label>
            <input value={storeInfo.tagline} onChange={(e) => setStoreInfo((s) => ({ ...s, tagline: e.target.value }))} className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1.5">Store Email</label>
            <input type="email" value={storeInfo.storeEmail} onChange={(e) => setStoreInfo((s) => ({ ...s, storeEmail: e.target.value }))} className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1.5">Store Address</label>
            <input value={storeInfo.storeAddress} onChange={(e) => setStoreInfo((s) => ({ ...s, storeAddress: e.target.value }))} className={inputCls} style={inputStyle} />
          </div>
          <p className="text-[10px] text-gray-600 font-label leading-relaxed">
            Saved for your records and shown on pages that read these settings. Note: page titles, the logo header, and
            emails currently use a fixed site-wide name — ask if you&apos;d like that wired to this field too.
          </p>
          <button
            onClick={handleStoreInfoSave}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold font-display transition-all w-full justify-center"
            style={{ background: storeInfoSaved ? '#10B981' : '#c41e3a', color: 'white' }}
          >
            <Save className="h-4 w-4" />
            {storeInfoSaved ? 'Store Info Saved!' : 'Save Store Info'}
          </button>
        </div>
      </div>

      {/* WhatsApp ordering number */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: '#1a1814', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <Phone className="h-4 w-4 text-gray-400" />
          <h2 className="font-bold text-white text-sm font-display">WhatsApp Ordering Number</h2>
        </div>
        <div className="p-5 space-y-2">
          <p className="text-sm text-gray-300 font-mono">{process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || 'Not set'}</p>
          <p className="text-[10px] text-gray-600 font-label leading-relaxed">
            This number is set via the <span className="text-gray-400">NEXT_PUBLIC_WHATSAPP_NUMBER</span> environment
            variable in Vercel, not here — changing it requires updating that variable and redeploying. Ask if you&apos;d
            like help changing it.
          </p>
        </div>
      </div>

      {/* Business Hours */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: '#1a1814', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <Clock className="h-4 w-4 text-gray-400" />
          <h2 className="font-bold text-white text-sm font-display">Business Hours</h2>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-xs text-gray-500 font-display">Shown on the Contact page.</p>
          <div>
            <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1.5">Mon – Fri</label>
            <input value={hours.businessHoursWeekdays} onChange={(e) => setHours((h) => ({ ...h, businessHoursWeekdays: e.target.value }))} className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1.5">Saturday</label>
            <input value={hours.businessHoursSaturday} onChange={(e) => setHours((h) => ({ ...h, businessHoursSaturday: e.target.value }))} className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1.5">Sunday</label>
            <input value={hours.businessHoursSunday} onChange={(e) => setHours((h) => ({ ...h, businessHoursSunday: e.target.value }))} className={inputCls} style={inputStyle} />
          </div>
          <button
            onClick={handleHoursSave}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold font-display transition-all w-full justify-center"
            style={{ background: hoursSaved ? '#10B981' : '#c41e3a', color: 'white' }}
          >
            <Save className="h-4 w-4" />
            {hoursSaved ? 'Business Hours Saved!' : 'Save Business Hours'}
          </button>
        </div>
      </div>

      {/* Tax / VAT */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: '#1a1814', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <Percent className="h-4 w-4 text-purple-400" />
          <h2 className="font-bold text-white text-sm font-display">Tax / VAT</h2>
          <span className="ml-auto text-[10px] font-label uppercase px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300">
            {tax.vatPercent > 0 ? `${tax.vatPercent}% applied` : 'Disabled'}
          </span>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-xs text-gray-500 font-display">
            VAT is calculated on the order subtotal (not delivery) and shown as a separate line at checkout. Set to 0 to disable.
          </p>
          <div>
            <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1.5">VAT Percentage (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={tax.vatPercent}
              onChange={(e) => setTax({ vatPercent: Number(e.target.value) })}
              placeholder="7.5"
              className={inputCls}
              style={inputStyle}
            />
          </div>
          <button
            onClick={handleTaxSave}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold font-display transition-all w-full justify-center"
            style={{ background: taxSaved ? '#10B981' : '#7c3aed', color: 'white' }}
          >
            <Save className="h-4 w-4" />
            {taxSaved ? 'VAT Setting Saved!' : 'Save VAT Setting'}
          </button>
        </div>
      </div>

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

      {/* WhatsApp Business Platform (automated notifications) */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: '#1a1814', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <MessageCircle className="h-4 w-4 text-green-400" />
          <h2 className="font-bold text-white text-sm font-display">WhatsApp Notifications (Cloud API)</h2>
          <span
            className="ml-auto text-[10px] font-label uppercase px-2 py-0.5 rounded-full"
            style={{
              background: integrations?.whatsappAccessTokenSet ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
              color: integrations?.whatsappAccessTokenSet ? '#34d399' : '#fbbf24',
            }}
          >
            {integrations?.whatsappAccessTokenSet ? 'Configured' : 'Setup Required'}
          </span>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-xs text-gray-500 font-display">
            Sends automatic order updates via WhatsApp (not the manual click-to-chat link below). Requires a Meta WhatsApp
            Business Platform account and one approved message template. The click-to-chat &quot;Order via WhatsApp&quot; button
            on checkout still works independently of this.
          </p>
          <div>
            <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1.5">Phone Number ID</label>
            <input
              type="text"
              value={whatsapp.whatsappPhoneNumberId}
              onChange={(e) => setWhatsapp((w) => ({ ...w, whatsappPhoneNumberId: e.target.value }))}
              placeholder="From Meta Business Manager → WhatsApp → API Setup"
              className={inputCls}
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1.5">
              Access Token {integrations?.whatsappAccessTokenSet && <span className="text-emerald-400">(currently set)</span>}
            </label>
            <input
              type="password"
              value={whatsapp.whatsappAccessToken}
              onChange={(e) => setWhatsapp((w) => ({ ...w, whatsappAccessToken: e.target.value }))}
              placeholder={integrations?.whatsappAccessTokenSet ? '••••••••••••••••' : 'Permanent system-user token (recommended)'}
              className={inputCls}
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1.5">Business Account ID (optional)</label>
            <input
              type="text"
              value={whatsapp.whatsappBusinessAccountId}
              onChange={(e) => setWhatsapp((w) => ({ ...w, whatsappBusinessAccountId: e.target.value }))}
              className={inputCls}
              style={inputStyle}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1.5">Approved Template Name</label>
              <input
                type="text"
                value={whatsapp.whatsappOrderTemplateName}
                onChange={(e) => setWhatsapp((w) => ({ ...w, whatsappOrderTemplateName: e.target.value }))}
                placeholder="order_update"
                className={inputCls}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1.5">Template Language</label>
              <input
                type="text"
                value={whatsapp.whatsappTemplateLanguage}
                onChange={(e) => setWhatsapp((w) => ({ ...w, whatsappTemplateLanguage: e.target.value }))}
                placeholder="en_US"
                className={inputCls}
                style={inputStyle}
              />
            </div>
          </div>
          <button
            onClick={handleWhatsappSave}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold font-display transition-all w-full justify-center"
            style={{ background: whatsappSaved ? '#10B981' : '#16A34A', color: 'white' }}
          >
            <Save className="h-4 w-4" />
            {whatsappSaved ? 'WhatsApp Settings Saved!' : 'Save WhatsApp Settings'}
          </button>
        </div>
      </div>

      {/* WhatsApp click-to-chat status */}
      <div className="rounded-2xl border p-5" style={{ background: '#1a1814', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3 mb-4">
          <MessageCircle className="h-4 w-4 text-green-400" />
          <h2 className="font-bold text-white text-sm font-display">WhatsApp Click-to-Chat</h2>
          <span className="ml-auto text-[10px] font-label uppercase px-2 py-0.5 rounded-full bg-green-500/15 text-green-400">Active</span>
        </div>
        <p className="text-xs text-gray-400 font-display">Always-on free link-based ordering. Customers can order directly via WhatsApp. Set your number above in &quot;Contact &amp; Delivery&quot;.</p>
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

      {/* Email Notifications */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: '#1a1814', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <Mail className="h-4 w-4 text-red-400" />
          <h2 className="font-bold text-white text-sm font-display">Email Notifications</h2>
          <span
            className="ml-auto text-[10px] font-label uppercase px-2 py-0.5 rounded-full"
            style={{
              background: integrations?.resendApiKeySet || integrations?.gmailAppPasswordSet ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
              color: integrations?.resendApiKeySet || integrations?.gmailAppPasswordSet ? '#34d399' : '#fbbf24',
            }}
          >
            {integrations?.resendApiKeySet ? 'Resend Active' : integrations?.gmailAppPasswordSet ? 'Gmail Active' : 'Setup Required'}
          </span>
        </div>
        <div className="p-5 space-y-5">
          <p className="text-xs text-gray-500 font-display">
            <strong className="text-gray-300">Resend is recommended</strong> — Gmail SMTP from a personal address often lands in
            spam. If a Resend API key is set, it&apos;s used for all order/account emails; otherwise Gmail is used as a fallback.
          </p>

          <div className="space-y-3 pb-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <p className="text-xs font-bold text-gray-300 font-display">Resend (recommended)</p>
            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1.5">
                API Key {integrations?.resendApiKeySet && <span className="text-emerald-400">(currently set)</span>}
              </label>
              <input
                type="password"
                value={email.resendApiKey}
                onChange={(e) => setEmail((s) => ({ ...s, resendApiKey: e.target.value }))}
                placeholder={integrations?.resendApiKeySet ? '••••••••••••••••' : 're_xxxxxxxxxxxxxxxx'}
                className={inputCls}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1.5">From Address (must be on a verified domain)</label>
              <input
                type="email"
                value={email.resendFromEmail}
                onChange={(e) => setEmail((s) => ({ ...s, resendFromEmail: e.target.value }))}
                placeholder="orders@asiangroceryng.com"
                className={inputCls}
                style={inputStyle}
              />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-300 font-display">Gmail (fallback)</p>
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
