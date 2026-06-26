'use client';

import { useEffect, useState } from 'react';
import { Save, X, Plus, Trash2, Truck } from 'lucide-react';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import { formatPrice } from '@/lib/utils';

interface DeliveryArea {
  id: string;
  name: string;
  fee: number;
  estimatedDays: string;
  enabled: boolean;
  position: number;
}

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...options?.headers } });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

const inputCls = 'w-full px-3 py-2 rounded-xl text-sm font-display border focus:outline-none focus:border-brand-red text-gray-200 bg-[#0f0e0b] border-[rgba(255,255,255,0.08)]';

function AreaRow({ area, canWrite, onUpdate, onDelete }: { area: DeliveryArea; canWrite: boolean; onUpdate: (id: string, updates: Partial<DeliveryArea>) => void; onDelete: (id: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(area);
  const [deleting, setDeleting] = useState(false);

  function save() {
    onUpdate(area.id, { name: draft.name, fee: draft.fee, estimatedDays: draft.estimatedDays });
    setEditing(false);
  }

  async function handleDelete() {
    if (!confirm(`Delete delivery area "${area.name}"?`)) return;
    setDeleting(true);
    try { await onDelete(area.id); } finally { setDeleting(false); }
  }

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ background: '#1a1814', borderColor: 'rgba(255,255,255,0.06)' }}>
      <div className="flex items-center gap-4 px-4 py-3">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#0f0e0b' }}>
          <Truck className="h-4 w-4 text-gray-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm font-display">{area.name}</p>
          <p className="text-xs text-gray-500 font-display">{formatPrice(area.fee)} · {area.estimatedDays}</p>
        </div>
        {canWrite && (
          <div className="flex items-center gap-2 shrink-0">
            <label className="flex items-center gap-1.5 text-xs text-gray-400 font-display cursor-pointer">
              <input type="checkbox" checked={area.enabled} onChange={(e) => onUpdate(area.id, { enabled: e.target.checked })} className="accent-brand-red" />
              Enabled
            </label>
            <button onClick={() => setEditing(!editing)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer font-display">
              Edit
            </button>
            <button onClick={handleDelete} disabled={deleting} className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
      {editing && canWrite && (
        <div className="border-t px-4 py-4 space-y-3" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#0f0e0b' }}>
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1">Name</label>
              <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1">Fee (₦)</label>
              <input type="number" min={0} value={draft.fee} onChange={(e) => setDraft({ ...draft, fee: Number(e.target.value) })} className={inputCls} />
            </div>
            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1">Estimated Days</label>
              <input value={draft.estimatedDays} onChange={(e) => setDraft({ ...draft, estimatedDays: e.target.value })} className={inputCls} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={save} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-brand-red hover:opacity-90 transition-opacity cursor-pointer">
              <Save className="h-3.5 w-3.5" /> Save
            </button>
            <button onClick={() => { setDraft(area); setEditing(false); }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
              <X className="h-3.5 w-3.5" /> Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const EMPTY_FORM = { name: '', fee: 1500, estimatedDays: '2-3 business days' };

function AddAreaForm({ onAdd, onClose }: { onAdd: (data: typeof EMPTY_FORM) => Promise<void>; onClose: () => void }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    if (!form.name.trim()) { setError('Area name is required'); return; }
    setSaving(true);
    setError('');
    try {
      await onAdd(form);
      onClose();
    } catch {
      setError('Could not create delivery area.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border p-4 space-y-3" style={{ background: '#0f0e0b', borderColor: 'rgba(196,30,58,0.3)' }}>
      {error && <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-display">{error}</div>}
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1">Name *</label>
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Enugu" className={inputCls} autoFocus />
        </div>
        <div>
          <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1">Fee (₦)</label>
          <input type="number" min={0} value={form.fee} onChange={(e) => setForm((f) => ({ ...f, fee: Number(e.target.value) }))} className={inputCls} />
        </div>
        <div>
          <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1">Estimated Days</label>
          <input value={form.estimatedDays} onChange={(e) => setForm((f) => ({ ...f, estimatedDays: e.target.value }))} className={inputCls} />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-brand-red hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50">
          <Save className="h-3.5 w-3.5" /> {saving ? 'Creating…' : 'Create Area'}
        </button>
        <button onClick={onClose} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
          <X className="h-3.5 w-3.5" /> Cancel
        </button>
      </div>
    </div>
  );
}

export default function AdminDeliveryAreasPage() {
  const { session } = useAdminAuthStore();
  const canWrite = session?.role !== 'support';
  const [areas, setAreas] = useState<DeliveryArea[] | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    api<DeliveryArea[]>('/api/delivery-areas?all=true').then(setAreas).catch(() => setAreas([]));
  }, []);

  async function handleUpdate(id: string, updates: Partial<DeliveryArea>) {
    const updated = await api<DeliveryArea>(`/api/delivery-areas/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
    setAreas((prev) => (prev ? prev.map((a) => (a.id === id ? updated : a)) : prev));
  }

  async function handleDelete(id: string) {
    await api(`/api/delivery-areas/${id}`, { method: 'DELETE' });
    setAreas((prev) => (prev ? prev.filter((a) => a.id !== id) : prev));
  }

  async function handleAdd(data: typeof EMPTY_FORM) {
    const created = await api<DeliveryArea>('/api/delivery-areas', { method: 'POST', body: JSON.stringify(data) });
    setAreas((prev) => (prev ? [...prev, created] : [created]));
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-display">Delivery Areas</h1>
          <p className="text-gray-500 text-sm mt-0.5 font-display">{areas ? `${areas.length} areas` : 'Loading…'} — shown to customers at checkout</p>
        </div>
        {canWrite && !adding && (
          <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-brand-red hover:opacity-90 transition-opacity cursor-pointer shrink-0">
            <Plus className="h-4 w-4" /> Add Area
          </button>
        )}
      </div>

      {adding && <AddAreaForm onAdd={handleAdd} onClose={() => setAdding(false)} />}

      <div className="space-y-3">
        {areas === null ? (
          <p className="text-gray-500 text-sm font-display">Loading…</p>
        ) : areas.length === 0 ? (
          <p className="text-gray-500 text-sm font-display">No delivery areas yet.</p>
        ) : (
          areas.map((area) => (
            <AreaRow key={area.id} area={area} canWrite={canWrite} onUpdate={handleUpdate} onDelete={handleDelete} />
          ))
        )}
      </div>
    </div>
  );
}
