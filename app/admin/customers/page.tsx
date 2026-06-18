import { formatDate } from '@/lib/utils';

const mockCustomers = [
  { id: 'c-1', name: 'Amara Okafor', email: 'amara@example.com', phone: '08012345678', orders: 5, spent: 42000, joined: '2024-03-01' },
  { id: 'c-2', name: 'Femi Adeleke', email: 'femi@example.com', phone: '08087654321', orders: 3, spent: 18500, joined: '2024-04-15' },
  { id: 'c-3', name: 'Chioma Eze', email: 'chioma@example.com', phone: '08055544433', orders: 8, spent: 67200, joined: '2024-01-10' },
  { id: 'c-4', name: 'Kola Abiodun', email: 'kola@example.com', phone: '09011122233', orders: 2, spent: 9800, joined: '2024-06-20' },
  { id: 'c-5', name: 'Ngozi Nwosu', email: 'ngozi@example.com', phone: '07033344455', orders: 11, spent: 89500, joined: '2023-12-01' },
];

export default function AdminCustomersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-sm text-gray-500">{mockCustomers.length} registered customers (mock data)</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
              {mockCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-red text-white flex items-center justify-center text-sm font-bold shrink-0">
                        {c.name[0]}
                      </div>
                      <p className="font-medium text-gray-800">{c.name}</p>
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
      </div>
    </div>
  );
}
