'use client';

import { useEffect, useState } from 'react';
import { formatDate } from '@/lib/utils';

interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  emailVerified: boolean;
  joined: string;
  orders: number;
  spent: number;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomer[] | null>(null);

  useEffect(() => {
    fetch('/api/customers')
      .then((r) => (r.ok ? r.json() : []))
      .then(setCustomers)
      .catch(() => setCustomers([]));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-sm text-gray-500">{customers ? `${customers.length} registered customers` : 'Loading…'}</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {customers === null ? (
          <div className="text-center py-12">
            <span className="inline-block h-6 w-6 rounded-full border-2 border-gray-200 border-t-brand-red animate-spin" />
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">No registered customers yet. Most orders are placed as guest checkout.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Contact</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Orders</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Total Spent</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-red text-white flex items-center justify-center text-sm font-bold shrink-0">
                          {c.name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{c.name}</p>
                          {!c.emailVerified && <p className="text-[10px] text-amber-600">Email unverified</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-gray-600">{c.email}</p>
                      <p className="text-xs text-gray-400">{c.phone}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{c.orders}</td>
                    <td className="px-4 py-3 font-bold text-gray-900">₦{c.spent.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-gray-400 hidden lg:table-cell">{formatDate(c.joined)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
