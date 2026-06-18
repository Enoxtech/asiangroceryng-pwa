import Link from 'next/link';
import { ShoppingBag, Package, Users, AlertTriangle, TrendingUp, ArrowUpRight } from 'lucide-react';
import { products } from '@/data/products';
import { formatPrice } from '@/lib/utils';

const mockOrders = [
  { id: 'AGNG-001240', customer: 'Amara Okafor', total: 8400, status: 'pending', date: '2024-07-15' },
  { id: 'AGNG-001239', customer: 'Femi Adeleke', total: 5500, status: 'processing', date: '2024-07-15' },
  { id: 'AGNG-001238', customer: 'Chioma Eze', total: 12300, status: 'shipped', date: '2024-07-14' },
  { id: 'AGNG-001237', customer: 'Kola Abiodun', total: 3200, status: 'delivered', date: '2024-07-14' },
  { id: 'AGNG-001236', customer: 'Ngozi Nwosu', total: 7800, status: 'delivered', date: '2024-07-13' },
];

const lowStock = products.filter((p) => p.stockCount <= 20 && p.inStock);
const outOfStock = products.filter((p) => !p.inStock);

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-400',
  processing: 'bg-blue-500/15 text-blue-400',
  shipped: 'bg-green-500/15 text-green-400',
  delivered: 'bg-gray-500/15 text-gray-400',
  cancelled: 'bg-red-500/15 text-red-400',
};

const stats = [
  { label: 'Total Orders', value: '142', sub: '+12 this week', Icon: ShoppingBag, color: '#3B82F6' },
  { label: 'Pending', value: '8', sub: 'Requires action', Icon: AlertTriangle, color: '#F59E0B' },
  { label: 'Products', value: String(products.length), sub: `${outOfStock.length} out of stock`, Icon: Package, color: '#10B981' },
  { label: 'Low Stock', value: String(lowStock.length), sub: 'Under 20 units', Icon: AlertTriangle, color: '#EF4444' },
  { label: 'Customers', value: '5', sub: '2 new this week', Icon: Users, color: '#8B5CF6' },
  { label: 'Revenue', value: '₦0', sub: 'Connect Paystack', Icon: TrendingUp, color: '#EC4899' },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white font-display">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5 font-display">Welcome back, Admin</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map(({ label, value, sub, Icon, color }) => (
          <div key={label} className="rounded-2xl p-4 border" style={{ background: '#1a1814', borderColor: 'rgba(255,255,255,0.06)' }}>
            <Icon className="h-4 w-4 mb-3" style={{ color }} />
            <p className="text-xl font-bold text-white font-label">{value}</p>
            <p className="text-xs font-semibold text-gray-300 mt-0.5 font-display">{label}</p>
            <p className="text-[10px] text-gray-600 mt-0.5 font-display">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent orders */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: '#1a1814', borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <h2 className="font-bold text-white text-sm font-display">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-brand-red font-semibold hover:opacity-75 flex items-center gap-1 font-display">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {mockOrders.map((order) => (
              <div key={order.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-200 font-label">{order.id}</p>
                  <p className="text-xs text-gray-500 truncate font-display">{order.customer}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${statusColors[order.status] ?? ''}`}>{order.status}</span>
                  <span className="text-xs font-bold text-white font-label">{formatPrice(order.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low stock */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: '#1a1814', borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <h2 className="font-bold text-white text-sm font-display">Low Stock Alert</h2>
            <Link href="/admin/products" className="text-xs text-brand-red font-semibold hover:opacity-75 flex items-center gap-1 font-display">
              Manage <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {lowStock.slice(0, 5).map((p) => (
              <div key={p.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-200 truncate font-display">{p.name}</p>
                  <p className="text-[10px] text-gray-500 font-display">{p.category}</p>
                </div>
                <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${p.stockCount <= 5 ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'}`}>
                  {p.stockCount} left
                </span>
              </div>
            ))}
            {lowStock.length === 0 && (
              <div className="px-5 py-8 text-center text-xs text-gray-500 font-display">All products are well stocked ✅</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
