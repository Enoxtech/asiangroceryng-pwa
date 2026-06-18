'use client';

import { useState } from 'react';
import { Save, Store, Phone, MapPin, Clock, MessageCircle, Building2 } from 'lucide-react';
import { useAdminStore } from '@/store/adminStore';

const sections = [
  {
    id: 'store',
    title: 'Store Information',
    Icon: Store,
    fields: [
      { key: 'storeName', label: 'Store Name', value: 'Asian Grocery NG', type: 'text' },
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

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleBankSave() {
    updateBankDetails(bank);
    setBankSaved(true);
    setTimeout(() => setBankSaved(false), 2000);
  }

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
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-gray-200 border font-display focus:outline-none focus:border-brand-red"
                  style={{ background: '#0f0e0b', borderColor: 'rgba(255,255,255,0.08)' }}
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
            { key: 'accountName', label: 'Account Name', placeholder: 'e.g. Asian Grocery NG' },
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
                className="w-full px-4 py-2.5 rounded-xl text-sm text-gray-200 border font-display focus:outline-none focus:border-blue-400 placeholder:text-gray-600"
                style={{ background: '#0f0e0b', borderColor: 'rgba(255,255,255,0.08)' }}
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

      {/* Payment note */}
      <div className="rounded-2xl border p-5" style={{ background: '#1a1814', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3 mb-3">
          <MapPin className="h-4 w-4 text-amber-400" />
          <h2 className="font-bold text-white text-sm font-display">Payment Gateway</h2>
          <span className="ml-auto text-[10px] font-label uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">Setup Required</span>
        </div>
        <p className="text-xs text-gray-400 font-display">Integrate Paystack or Flutterwave to accept online payments. Add your API keys to <span className="text-gray-200 font-label">.env.local</span> to enable.</p>
      </div>
    </div>
  );
}
