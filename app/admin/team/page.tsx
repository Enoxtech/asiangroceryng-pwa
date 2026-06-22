'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserPlus, Save, X, Trash2, ShieldCheck, Headset, Package, KeyRound, LogOut } from 'lucide-react';
import Image from 'next/image';
import { useAdminAuthStore, type AdminRole } from '@/store/adminAuthStore';

interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  active: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: 'Super Admin',
  support: 'Support',
  product_manager: 'Product Manager',
};

const ROLE_ICONS: Record<AdminRole, React.ElementType> = {
  super_admin: ShieldCheck,
  support: Headset,
  product_manager: Package,
};

const ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
  super_admin: 'Full access to everything, including settings, secrets, and admin accounts.',
  support: 'Can view and update orders, and view products & categories (read-only).',
  product_manager: 'Can manage products, categories, and banners. Orders are read-only.',
};

const inputCls = 'w-full px-3 py-2.5 rounded-xl text-sm font-display border focus:outline-none focus:border-brand-red text-gray-200 bg-[#0f0e0b] border-[rgba(255,255,255,0.08)] placeholder:text-gray-600';

function AdminRow({ admin, isSelf, onChanged }: { admin: AdminUserRow; isSelf: boolean; onChanged: () => void }) {
  const [editing, setEditing] = useState(false);
  const [role, setRole] = useState(admin.role);
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const Icon = ROLE_ICONS[admin.role];

  async function save() {
    setError('');
    setSaving(true);
    const res = await fetch(`/api/admin-users/${admin.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, ...(password ? { password } : {}) }),
    });
    setSaving(false);
    if (!res.ok) {
      const { error: msg } = await res.json().catch(() => ({ error: 'Failed to save' }));
      setError(msg);
      return;
    }
    setPassword('');
    setEditing(false);
    onChanged();
  }

  async function toggleActive() {
    setError('');
    const res = await fetch(`/api/admin-users/${admin.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !admin.active }),
    });
    if (!res.ok) {
      const { error: msg } = await res.json().catch(() => ({ error: 'Failed to update' }));
      setError(msg);
      return;
    }
    onChanged();
  }

  async function remove() {
    if (!confirm(`Remove admin account "${admin.name}"? This can't be undone.`)) return;
    const res = await fetch(`/api/admin-users/${admin.id}`, { method: 'DELETE' });
    if (!res.ok) {
      const { error: msg } = await res.json().catch(() => ({ error: 'Failed to delete' }));
      setError(msg);
      return;
    }
    onChanged();
  }

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ background: '#1a1814', borderColor: 'rgba(255,255,255,0.06)' }}>
      <div className="flex items-center gap-4 px-4 py-3">
        <div className="h-10 w-10 rounded-full bg-brand-red text-white flex items-center justify-center text-sm font-bold shrink-0">
          {admin.name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-white text-sm font-display truncate">{admin.name}</p>
            {isSelf && <span className="text-[10px] text-gray-500 font-label">(you)</span>}
            {!admin.active && (
              <span className="text-[10px] font-label uppercase px-2 py-0.5 rounded-full bg-red-500/15 text-red-400">Deactivated</span>
            )}
          </div>
          <p className="text-xs text-gray-500 font-display truncate">{admin.email}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Icon className="h-3 w-3 text-gray-500" />
            <p className="text-[10px] text-gray-600 font-label uppercase tracking-wide">{ROLE_LABELS[admin.role]}</p>
            {admin.lastLoginAt && (
              <p className="text-[10px] text-gray-700 font-label">· last login {new Date(admin.lastLoginAt).toLocaleDateString()}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => setEditing(!editing)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer font-display">
            Edit
          </button>
          {!isSelf && (
            <>
              <button onClick={toggleActive}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer font-display">
                {admin.active ? 'Deactivate' : 'Activate'}
              </button>
              <button onClick={remove}
                className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {editing && (
        <div className="border-t px-4 py-4 space-y-3" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#0f0e0b' }}>
          {error && <p className="text-xs text-red-400 font-display">{error}</p>}
          <div>
            <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as AdminRole)}
              disabled={isSelf}
              className={`${inputCls} ${isSelf ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {(['super_admin', 'support', 'product_manager'] as AdminRole[]).map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1">Reset Password (optional)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
              className={inputCls}
            />
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-brand-red hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50">
              <Save className="h-3.5 w-3.5" /> {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={() => { setEditing(false); setRole(admin.role); setPassword(''); setError(''); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
              <X className="h-3.5 w-3.5" /> Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MySecurityCard() {
  const { session, checkSession } = useAdminAuthStore();
  const [setupData, setSetupData] = useState<{ secret: string; qrCode: string } | null>(null);
  const [code, setCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [showDisable, setShowDisable] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [revoked, setRevoked] = useState(false);

  async function startSetup() {
    setError('');
    const res = await fetch('/api/auth/2fa/setup', { method: 'POST' });
    if (!res.ok) {
      setError('Failed to start 2FA setup');
      return;
    }
    setSetupData(await res.json());
  }

  async function confirmEnable(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const res = await fetch('/api/auth/2fa/enable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    setBusy(false);
    if (!res.ok) {
      const { error: msg } = await res.json().catch(() => ({ error: 'Invalid code' }));
      setError(msg);
      return;
    }
    setSetupData(null);
    setCode('');
    checkSession();
  }

  async function disable2FA(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const res = await fetch('/api/auth/2fa/disable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: disablePassword }),
    });
    setBusy(false);
    if (!res.ok) {
      const { error: msg } = await res.json().catch(() => ({ error: 'Incorrect password' }));
      setError(msg);
      return;
    }
    setShowDisable(false);
    setDisablePassword('');
    checkSession();
  }

  async function revokeSessions() {
    setBusy(true);
    await fetch('/api/auth/revoke-sessions', { method: 'POST' });
    setBusy(false);
    setRevoked(true);
    setTimeout(() => setRevoked(false), 3000);
  }

  return (
    <div className="rounded-2xl border p-5 space-y-4" style={{ background: '#1a1814', borderColor: 'rgba(255,255,255,0.06)' }}>
      <div className="flex items-center gap-3">
        <KeyRound className="h-4 w-4 text-brand-red" />
        <h2 className="font-bold text-white text-sm font-display">My Security</h2>
      </div>

      {error && <p className="text-xs text-red-400 font-display">{error}</p>}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-200 font-display">Two-Factor Authentication</p>
          <p className="text-xs text-gray-500 font-display">
            {session?.totpEnabled ? 'Enabled — your account requires a code at login.' : 'Add an authenticator app code at login.'}
          </p>
        </div>
        {session?.totpEnabled ? (
          <button onClick={() => setShowDisable(!showDisable)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer font-display">
            Disable
          </button>
        ) : (
          <button onClick={startSetup}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-brand-red hover:opacity-90 transition-opacity cursor-pointer font-display">
            Enable
          </button>
        )}
      </div>

      {setupData && (
        <form onSubmit={confirmEnable} className="border-t pt-4 space-y-3" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <p className="text-xs text-gray-400 font-display">Scan this QR code with Google Authenticator, Authy, or similar, then enter the 6-digit code to confirm.</p>
          <div className="bg-white p-3 rounded-xl w-fit">
            <Image src={setupData.qrCode} alt="2FA QR Code" width={160} height={160} unoptimized />
          </div>
          <p className="text-[10px] text-gray-600 font-label break-all">Manual entry key: {setupData.secret}</p>
          <input
            type="text"
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            className="w-32 px-3 py-2 rounded-xl text-sm font-display border focus:outline-none focus:border-brand-red text-gray-200 bg-[#0f0e0b] border-[rgba(255,255,255,0.08)] text-center tracking-widest"
          />
          <div className="flex gap-2">
            <button type="submit" disabled={busy || code.length !== 6}
              className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-brand-red hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 font-display">
              Confirm & Enable
            </button>
            <button type="button" onClick={() => { setSetupData(null); setCode(''); }}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer font-display">
              Cancel
            </button>
          </div>
        </form>
      )}

      {showDisable && (
        <form onSubmit={disable2FA} className="border-t pt-4 space-y-3" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1">Confirm your password to disable 2FA</label>
          <input
            type="password"
            value={disablePassword}
            onChange={(e) => setDisablePassword(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl text-sm font-display border focus:outline-none focus:border-brand-red text-gray-200 bg-[#0f0e0b] border-[rgba(255,255,255,0.08)]"
          />
          <button type="submit" disabled={busy}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-red-600 hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 font-display">
            Disable 2FA
          </button>
        </form>
      )}

      <div className="border-t pt-4 flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div>
          <p className="text-sm text-gray-200 font-display">Log Out Other Devices</p>
          <p className="text-xs text-gray-500 font-display">Ends every other active session for your account.</p>
        </div>
        <button onClick={revokeSessions} disabled={busy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer font-display disabled:opacity-50">
          <LogOut className="h-3.5 w-3.5" /> {revoked ? 'Done ✓' : 'Log Out Others'}
        </button>
      </div>
    </div>
  );
}

export default function AdminTeamPage() {
  const { session } = useAdminAuthStore();
  const [admins, setAdmins] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: 'support' as AdminRole });
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch('/api/admin-users')
      .then((r) => (r.ok ? r.json() : []))
      .then(setAdmins)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError('');
    setCreating(true);
    const res = await fetch('/api/admin-users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createForm),
    });
    setCreating(false);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Failed to create admin' }));
      setCreateError(error);
      return;
    }
    setCreateForm({ name: '', email: '', password: '', role: 'support' });
    setShowCreate(false);
    load();
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white font-display">Admin Team</h1>
          <p className="text-gray-500 text-sm mt-0.5 font-display">Manage admin accounts and access levels</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold font-display bg-brand-red text-white hover:opacity-90 transition-opacity cursor-pointer"
        >
          <UserPlus className="h-4 w-4" /> Add Admin
        </button>
      </div>

      {/* Role legend */}
      <div className="grid sm:grid-cols-3 gap-3">
        {(['super_admin', 'support', 'product_manager'] as AdminRole[]).map((r) => {
          const Icon = ROLE_ICONS[r];
          return (
            <div key={r} className="rounded-2xl border p-4" style={{ background: '#1a1814', borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className="h-4 w-4 text-brand-red" />
                <p className="text-sm font-bold text-white font-display">{ROLE_LABELS[r]}</p>
              </div>
              <p className="text-xs text-gray-500 font-display leading-relaxed">{ROLE_DESCRIPTIONS[r]}</p>
            </div>
          );
        })}
      </div>

      <MySecurityCard />

      {showCreate && (
        <form onSubmit={handleCreate} className="rounded-2xl border p-5 space-y-4" style={{ background: '#1a1814', borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="font-bold text-white text-sm font-display">New Admin Account</h2>
          {createError && <p className="text-xs text-red-400 font-display">{createError}</p>}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1">Name</label>
              <input required value={createForm.name} onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1">Email</label>
              <input required type="email" value={createForm.email} onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1">Password</label>
              <input required type="password" minLength={10} value={createForm.password} onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))} placeholder="Min. 10 chars, 1 letter, 1 number" className={inputCls} />
            </div>
            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1">Role</label>
              <select value={createForm.role} onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value as AdminRole }))} className={inputCls}>
                {(['super_admin', 'support', 'product_manager'] as AdminRole[]).map((r) => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={creating}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-brand-red hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50">
              <Save className="h-3.5 w-3.5" /> {creating ? 'Creating…' : 'Create Admin'}
            </button>
            <button type="button" onClick={() => setShowCreate(false)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
              <X className="h-3.5 w-3.5" /> Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {loading && <p className="text-gray-500 text-sm font-display">Loading…</p>}
        {!loading && admins.map((admin) => (
          <AdminRow key={admin.id} admin={admin} isSelf={admin.id === session?.id} onChanged={load} />
        ))}
      </div>
    </div>
  );
}
