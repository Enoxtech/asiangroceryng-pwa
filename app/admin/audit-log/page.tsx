'use client';

import { useState, useEffect } from 'react';
import { ScrollText } from 'lucide-react';

interface AuditLogRow {
  id: string;
  adminName: string;
  adminEmail: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  ip: string | null;
  createdAt: string;
}

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-green-500/15 text-green-400',
  update: 'bg-blue-500/15 text-blue-400',
  update_status: 'bg-blue-500/15 text-blue-400',
  delete: 'bg-red-500/15 text-red-400',
  login: 'bg-gray-500/15 text-gray-400',
  login_2fa: 'bg-gray-500/15 text-gray-400',
  enable_2fa: 'bg-purple-500/15 text-purple-400',
  disable_2fa: 'bg-amber-500/15 text-amber-400',
  revoke_sessions: 'bg-amber-500/15 text-amber-400',
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/audit-log')
      .then((r) => (r.ok ? r.json() : []))
      .then(setLogs)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <ScrollText className="h-5 w-5 text-gray-400" />
        <div>
          <h1 className="text-xl font-bold text-white font-display">Audit Log</h1>
          <p className="text-gray-500 text-sm mt-0.5 font-display">Most recent 100 admin actions</p>
        </div>
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ background: '#1a1814', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#0f0e0b' }}>
                <th className="text-left px-4 py-3 text-[10px] font-label uppercase tracking-wide text-gray-500">When</th>
                <th className="text-left px-4 py-3 text-[10px] font-label uppercase tracking-wide text-gray-500">Admin</th>
                <th className="text-left px-4 py-3 text-[10px] font-label uppercase tracking-wide text-gray-500">Action</th>
                <th className="text-left px-4 py-3 text-[10px] font-label uppercase tracking-wide text-gray-500">Entity</th>
                <th className="text-left px-4 py-3 text-[10px] font-label uppercase tracking-wide text-gray-500 hidden md:table-cell">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-[10px] text-gray-500 font-label whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-200 text-xs font-display">{log.adminName}</p>
                    <p className="text-[10px] text-gray-500 font-label">{log.adminEmail}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-label ${ACTION_COLORS[log.action] ?? 'bg-gray-500/15 text-gray-400'}`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300 text-xs font-display">
                    {log.entityType}
                    {log.entityId && <span className="text-gray-500"> · {log.entityId.slice(0, 12)}</span>}
                  </td>
                  <td className="px-4 py-3 text-[10px] text-gray-500 font-label hidden md:table-cell">{log.ip ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && logs.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-gray-500 text-sm font-display">No admin actions recorded yet.</p>
            </div>
          )}
          {loading && (
            <div className="py-12 text-center">
              <p className="text-gray-500 text-sm font-display">Loading…</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
