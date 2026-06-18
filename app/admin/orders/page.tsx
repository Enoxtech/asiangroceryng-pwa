import { formatPrice, formatDate } from '@/lib/utils';

const mockOrders = [
  { id: 'AGNG-001240', customer: 'Amara Okafor', phone: '08012345678', total: 8400, status: 'pending', items: 3, area: 'Lagos Island', date: '2024-07-15', payment: 'pay_on_delivery' },
  { id: 'AGNG-001239', customer: 'Femi Adeleke', phone: '08087654321', total: 5500, status: 'processing', items: 2, area: 'Abuja', date: '2024-07-15', payment: 'bank_transfer' },
  { id: 'AGNG-001238', customer: 'Chioma Eze', phone: '08055544433', total: 12300, status: 'shipped', items: 5, area: 'Lagos Mainland', date: '2024-07-14', payment: 'bank_transfer' },
  { id: 'AGNG-001237', customer: 'Kola Abiodun', phone: '09011122233', total: 3200, status: 'delivered', items: 1, area: 'Port Harcourt', date: '2024-07-14', payment: 'pay_on_delivery' },
  { id: 'AGNG-001236', customer: 'Ngozi Nwosu', phone: '07033344455', total: 7800, status: 'delivered', items: 4, area: 'Lagos Island', date: '2024-07-13', payment: 'bank_transfer' },
  { id: 'AGNG-001235', customer: 'Bayo Ogundimu', phone: '08099988877', total: 4500, status: 'cancelled', items: 2, area: 'Ibadan', date: '2024-07-12', payment: 'pay_on_delivery' },
];

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-green-100 text-green-700',
  delivered: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-600',
};

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500">{mockOrders.length} total orders (mock data)</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((s) => (
          <button key={s} className={`shrink-0 px-4 py-2 text-sm rounded-xl border font-medium transition-colors ${s === 'All' ? 'bg-brand-red text-white border-brand-red' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Order</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Area</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mockOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-mono font-bold text-gray-800 text-xs">{order.id}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{order.items} {order.items === 1 ? 'item' : 'items'}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="font-medium text-gray-800">{order.customer}</p>
                    <p className="text-xs text-gray-400">{order.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{order.area}</td>
                  <td className="px-4 py-3 font-bold text-gray-900">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColors[order.status] ?? ''}`}>{order.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 hidden sm:table-cell">{formatDate(order.date)}</td>
                  <td className="px-4 py-3">
                    <select className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-red bg-white">
                      <option>Update status</option>
                      <option value="confirmed">Confirm</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancel</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
