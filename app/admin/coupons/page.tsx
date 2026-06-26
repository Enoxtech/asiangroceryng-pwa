'use client';

import { useEffect, useState } from 'react';
import { Save, X, Plus, Trash2, Tag } from 'lucide-react';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import { formatDate } from '@/lib/utils';

interface Coupon {
  id: string;
  code: string;
  type: 'percent' | 'fixed' | 'shipping';
  value: number;
  minOrder: number | null;
  active: boolean;
  expiresAt: string | null;
  usageLimit: number | null;
  usageCount: number;
  createdAt: string;
}

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...options?.headers } });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error ${res.status}`);
  }
  return res.json();
}

const inputCls = 'w-full px-3 py-2 rounded-xl text-sm font-display border focus:outline-none focus:border-brand-red text-gray-200 bg-[#0f0e0b] border-[rgba(255,255,255,0.08)]';

function valueLabel(c: Pick<Coupon, 'type' | 'value'>): string {
  if (c.type === 'percent') return `${c.value}% off`;
  if (c.type === 'shipping') return 'Free delivery';
  return `₦${c.value.toLocaleString()} off`;
}

function CouponRow({ coupon, canWrite, onUpdate, onDelete }: { coupon: Coupon; canWrite: boolean; onUpdate: (id: string, updates: Partial<Coupon>) => void; onDelete: (id: string) => void }) {
  const [deleting, setDeleting] = useState(false);
  const expired = coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now();
  const limitReached = coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit;

  async function handleDelete() {
    if (!confirm(`Delete coupon "${coupon.code}"?`)) return;
    setDeleting(true);
    try { await onDelete(coupon.id); } finally { setDeleting(false); }
  }

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ background: '#1a1814', borderColor: 'rgba(255,255,255,0.06)' }}>
      <div className="flex items-center gap-4 px-4 py-3">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#0f0e0b' }}>
          <Tag className="h-4 w-4 text-gray-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm font-display font-mono">{coupon.code}</p>
          <p className="text-xs text-gray-500 font-display">
            {valueLabel(coupon)}
            {coupon.minOrder ? ` · min ₦${coupon.minOrder.toLocaleString()}` : ''}
            {coupon.usageLimit !== null ? ` · ${coupon.usageCount}/${coupon.usageLimit} used` : ` · ${coupon.usageCount} used`}
            {coupon.expiresAt ? ` · expires ${formatDate(coupon.expiresAt)}` : ''}
          </p>
          {(expired || limitReached) && (
            <p className="text-[10px] text-amber-400 font-label uppercase mt-0.5">{expired ? 'Expired' : 'Usage limit reached'} — won&apos;t apply even if active</p>
          )}
        </div>
        {canWrite && (
          <div className="flex items-center gap-2 shrink-0">
            <label className="flex items-center gap-1.5 text-xs text-gray-400 font-display cursor-pointer">
              <input type="checkbox" checked={coupon.active} onChange={(e) => onUpdate(coupon.id, { active: e.target.checked })} className="accent-brand-red" />
              Active
            </label>
            <button onClick={handleDelete} disabled={deleting} className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const EMPTY_FORM = { code: '', type: 'percent' as Coupon['type'], value: 10, minOrder: '', usageLimit: '', expiresAt: '' };

function AddCouponForm({ onAdd, onClose }: { onAdd: (data: Record<string, unknown>) => Promise<void>; onClose: () => void }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    if (!form.code.trim()) { setError('Code is required'); return; }
    setSaving(true);
    setError('');
    try {
      await onAdd({
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: form.type === 'shipping' ? 0 : Number(form.value),
        minOrder: form.minOrder ? Number(form.minOrder) : undefined,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
        expiresAt: form.expiresAt || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create coupon.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border p-4 space-y-3" style={{ background: '#0f0e0b', borderColor: 'rgba(196,30,58,0.3)' }}>
      {error && <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-display">{error}</div>}
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1">Code *</label>
          <input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="e.g. SAVE15" className={`${inputCls} uppercase`} autoFocus />
        </div>
        <div>
          <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1">Type</label>
          <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as Coupon['type'] }))} className={inputCls}>
            <option value="percent">Percent off</option>
            <option value="fixed">Fixed amount off</option>
            <option value="shipping">Free delivery</option>
          </select>
        </div>
        {form.type !== 'shipping' && (
          <div>
            <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1">
              Value {form.type === 'percent' ? '(%)' : '(₦)'}
            </label>
            <input type="number" min={0} value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) }))} className={inputCls} />
          </div>
        )}
        <div>
          <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1">Min Order (₦, optional)</label>
          <input type="number" min={0} value={form.minOrder} onChange={(e) => setForm((f) => ({ ...f, minOrder: e.target.value }))} className={inputCls} />
        </div>
        <div>
          <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1">Usage Limit (optional)</label>
          <input type="number" min={0} value={form.usageLimit} onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))} placeholder="Unlimited" className={inputCls} />
        </div>
        <div>
          <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1">Expires (optional)</label>
          <input type="date" value={form.expiresAt} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))} className={inputCls} />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-brand-red hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50">
          <Save className="h-3.5 w-3.5" /> {saving ? 'Creating…' : 'Create Coupon'}
        </button>
        <button onClick={onClose} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
          <X className="h-3.5 w-3.5" /> Cancel
        </button>
      </div>
    </div>
  );
}

export default function AdminCouponsPage() {
  const { session } = useAdminAuthStore();
  const canWrite = session?.role !== 'support';
  const [coupons, setCoupons] = useState<Coupon[] | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    api<Coupon[]>('/api/coupons').then(setCoupons).catch(() => setCoupons([]));
  }, []);

  async function handleUpdate(id: string, updates: Partial<Coupon>) {
    const updated = await api<Coupon>(`/api/coupons/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
    setCoupons((prev) => (prev ? prev.map((c) => (c.id === id ? updated : c)) : prev));
  }

  async function handleDelete(id: string) {
    await api(`/api/coupons/${id}`, { method: 'DELETE' });
    setCoupons((prev) => (prev ? prev.filter((c) => c.id !== id) : prev));
  }

  async function handleAdd(data: Record<string, unknown>) {
    const created = await api<Coupon>('/api/coupons', { method: 'POST', body: JSON.stringify(data) });
    setCoupons((prev) => (prev ? [created, ...prev] : [created]));
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-display">Coupons</h1>
          <p className="text-gray-500 text-sm mt-0.5 font-display">{coupons ? `${coupons.length} coupons` : 'Loading…'}</p>
        </div>
        {canWrite && !adding && (
          <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-brand-red hover:opacity-90 transition-opacity cursor-pointer shrink-0">
            <Plus className="h-4 w-4" /> Add Coupon
          </button>
        )}
      </div>

      {adding && <AddCouponForm onAdd={handleAdd} onClose={() => setAdding(false)} />}

      <div className="space-y-3">
        {coupons === null ? (
          <p className="text-gray-500 text-sm font-display">Loading…</p>
        ) : coupons.length === 0 ? (
          <p className="text-gray-500 text-sm font-display">No coupons yet.</p>
        ) : (
          coupons.map((coupon) => (
            <CouponRow key={coupon.id} coupon={coupon} canWrite={canWrite} onUpdate={handleUpdate} onDelete={handleDelete} />
          ))
        )}
      </div>
    </div>
  );
}
