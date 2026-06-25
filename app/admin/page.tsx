'use client';

import { useEffect, useState } from 'react';
import { useAdminStore } from '@/store/adminStore';
import Link from 'next/link';
import { Download, FileText, TrendingUp, ShoppingBag, Users, DollarSign, Package, ExternalLink, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─── Mock analytics data ─────────────────────────────────────── */
const monthlyData = [
  { month: 'Jan', revenue: 145000, orders: 18 },
  { month: 'Feb', revenue: 189000, orders: 24 },
  { month: 'Mar', revenue: 210000, orders: 31 },
  { month: 'Apr', revenue: 178000, orders: 22 },
  { month: 'May', revenue: 256000, orders: 38 },
  { month: 'Jun', revenue: 312000, orders: 45 },
  { month: 'Jul', revenue: 287000, orders: 41 },
];

const orderStatusData = [
  { label: 'Delivered', value: 89, color: '#10B981' },
  { label: 'Shipped',   value: 23, color: '#3B82F6' },
  { label: 'Processing',value: 15, color: '#F59E0B' },
  { label: 'Pending',   value: 12, color: '#8B5CF6' },
  { label: 'Cancelled', value: 3,  color: '#EF4444' },
];

const topProducts = [
  { label: 'Jasmine Rice 5kg',   value: 68400, pct: 100 },
  { label: 'Taro Milk Powder',   value: 54600, pct: 80 },
  { label: 'Boba Pearls 1kg',    value: 49200, pct: 72 },
  { label: 'Samyang Buldak',     value: 41600, pct: 61 },
  { label: 'Miso Ramen Pack',    value: 36800, pct: 54 },
];

const categoryRevenue = [
  { label: 'Noodles & Ramen', value: 234000, pct: 100 },
  { label: 'Boba & Drinks',   value: 189000, pct: 81 },
  { label: 'Snacks',          value: 156000, pct: 67 },
  { label: 'Sauces',          value: 134000, pct: 57 },
  { label: 'Grains',          value: 112000, pct: 48 },
  { label: 'Frozen',          value:  89000, pct: 38 },
];

/* ─── SVG Area Chart ──────────────────────────────────────────── */
function AreaChart({ data }: { data: typeof monthlyData }) {
  const W = 560; const H = 160;
  const PAD = { t: 18, r: 10, b: 32, l: 54 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;
  const maxRev = Math.max(...data.map((d) => d.revenue));

  const px = (i: number) => PAD.l + (i / (data.length - 1)) * cW;
  const py = (v: number) => PAD.t + cH - (v / maxRev) * cH;

  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${px(i).toFixed(1)} ${py(d.revenue).toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${px(data.length - 1).toFixed(1)} ${(PAD.t + cH).toFixed(1)} L ${px(0).toFixed(1)} ${(PAD.t + cH).toFixed(1)} Z`;

  const yTicks = [0, maxRev * 0.5, maxRev];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c41e3a" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#c41e3a" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yTicks.map((v, i) => (
        <g key={i}>
          <line x1={PAD.l} x2={W - PAD.r} y1={py(v)} y2={py(v)}
            stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray={i === 0 ? '0' : '4,4'} />
          <text x={PAD.l - 6} y={py(v) + 4} textAnchor="end" fill="#4B5563" fontSize="9" fontFamily="monospace">
            {v >= 1000 ? `₦${(v / 1000).toFixed(0)}k` : '₦0'}
          </text>
        </g>
      ))}

      {/* Vertical grid */}
      {data.map((_, i) => (
        <line key={i} x1={px(i)} x2={px(i)} y1={PAD.t} y2={PAD.t + cH}
          stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
      ))}

      {/* Area */}
      <path d={areaPath} fill="url(#areaGrad)" />

      {/* Line */}
      <path d={linePath} fill="none" stroke="#c41e3a" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots + labels */}
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={px(i)} cy={py(d.revenue)} r="5" fill="#0f0e0b" stroke="#c41e3a" strokeWidth="2" />
          <text x={px(i)} y={H - 6} textAnchor="middle" fill="#4B5563" fontSize="9.5" fontFamily="sans-serif">
            {d.month}
          </text>
          {i % 2 === 0 && (
            <text x={px(i)} y={py(d.revenue) - 10} textAnchor="middle" fill="#9CA3AF" fontSize="8.5" fontFamily="monospace">
              ₦{(d.revenue / 1000).toFixed(0)}k
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

/* ─── SVG Donut Chart ─────────────────────────────────────────── */
function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
function arcPath(cx: number, cy: number, r: number, ir: number, a1: number, a2: number) {
  const s = polar(cx, cy, r, a1); const e = polar(cx, cy, r, a2);
  const si = polar(cx, cy, ir, a1); const ei = polar(cx, cy, ir, a2);
  const lg = a2 - a1 > 180 ? 1 : 0;
  return `M${s.x.toFixed(2)},${s.y.toFixed(2)} A${r},${r} 0 ${lg},1 ${e.x.toFixed(2)},${e.y.toFixed(2)} L${ei.x.toFixed(2)},${ei.y.toFixed(2)} A${ir},${ir} 0 ${lg},0 ${si.x.toFixed(2)},${si.y.toFixed(2)}Z`;
}

function DonutChart({ data }: { data: typeof orderStatusData }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let angle = 0;
  const cx = 90; const cy = 90; const r = 74; const ir = 48;
  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 180 180" className="w-44 h-44 shrink-0">
        {data.map((d) => {
          const sweep = (d.value / total) * 359.99;
          const a1 = angle; angle += sweep;
          return <path key={d.label} d={arcPath(cx, cy, r, ir, a1, angle)} fill={d.color}
            stroke="#0f0e0b" strokeWidth="2.5" />;
        })}
        <circle cx={cx} cy={cy} r={ir - 2} fill="#0f0e0b" />
        <text x={cx} y={cy - 5} textAnchor="middle" fill="#e5e7eb" fontSize="22" fontWeight="800" fontFamily="monospace">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#6B7280" fontSize="8.5" fontFamily="sans-serif" letterSpacing="1">TOTAL ORDERS</text>
      </svg>
      <div className="flex flex-col gap-2 min-w-0 flex-1">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: d.color }} />
            <span className="text-gray-400 font-display flex-1">{d.label}</span>
            <span className="font-mono font-bold text-gray-200 tabular-nums">{d.value}</span>
            <span className="text-gray-600 font-mono w-8 text-right">{((d.value / total) * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Sparkline ───────────────────────────────────────────────── */
function Sparkline({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values); const min = Math.min(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * 72;
    const y = 24 - ((v - min) / range) * 20;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg viewBox="0 0 72 26" className="w-[72px] h-6 shrink-0">
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Horizontal bar ──────────────────────────────────────────── */
function HorizBar({ label, pct, value, color }: { label: string; pct: number; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-400 font-display w-32 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color, opacity: 0.85 }} />
      </div>
      <span className="text-xs font-mono font-bold text-gray-300 tabular-nums w-16 text-right shrink-0">
        ₦{(value / 1000).toFixed(0)}k
      </span>
    </div>
  );
}

/* ─── KPI Card ────────────────────────────────────────────────── */
function KpiCard({ label, value, sub, icon: Icon, trend, sparkValues, color }: {
  label: string; value: string; sub: string; icon: React.ElementType;
  trend: number; sparkValues: number[]; color: string;
}) {
  const up = trend >= 0;
  return (
    <div className="rounded-2xl border p-5 flex flex-col gap-3" style={{ background: '#1a1814', borderColor: 'rgba(255,255,255,0.06)' }}>
      <div className="flex items-start justify-between gap-2">
        <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}1A` }}>
          <Icon className="h-4 w-4 shrink-0" style={{ color }} />
        </div>
        <Sparkline values={sparkValues} color={color} />
      </div>
      <div>
        <p className="text-2xl font-bold text-white font-display tabular-nums">{value}</p>
        <p className="text-[10px] font-label uppercase tracking-widest text-gray-500 mt-0.5">{label}</p>
      </div>
      <div className="flex items-center gap-1.5">
        <span className={cn('text-xs font-bold font-mono', up ? 'text-green-400' : 'text-red-400')}>
          {up ? '+' : ''}{trend}%
        </span>
        <span className="text-[10px] text-gray-600 font-display truncate">{sub}</span>
      </div>
    </div>
  );
}

/* ─── CSV / PDF download ──────────────────────────────────────── */
type AnyOrder = { id: string; customer: string; total: number; status: string; date: string; area: string; payment: string };

function dlCSV(orders: AnyOrder[]) {
  const rows = [
    ['Order ID', 'Customer', 'Total (N)', 'Status', 'Area', 'Payment', 'Date'],
    ...orders.map((o) => [o.id, o.customer, o.total, o.status, o.area, o.payment.replace(/_/g, ' '), o.date]),
    [],
    ['Month', 'Orders', 'Revenue (N)', 'Avg Order Value (N)'],
    ...monthlyData.map((m) => [m.month, m.orders, m.revenue, Math.round(m.revenue / m.orders)]),
  ];
  const csv = rows.map((r) => r.join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `agng-sales-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function dlPDF(orders: AnyOrder[]) {
  const orderRows = orders.slice(0, 20).map((o) =>
    `<tr><td>${o.id}</td><td>${o.customer}</td><td>&#8358;${o.total.toLocaleString()}</td><td style="text-transform:capitalize">${o.status}</td><td>${o.date}</td></tr>`
  ).join('');
  const monthRows = monthlyData.map((m) =>
    `<tr><td>${m.month} 2024</td><td>${m.orders}</td><td>&#8358;${m.revenue.toLocaleString()}</td><td>&#8358;${Math.round(m.revenue / m.orders).toLocaleString()}</td></tr>`
  ).join('');
  const totalRev = monthlyData.reduce((s, m) => s + m.revenue, 0);
  const totalOrd = monthlyData.reduce((s, m) => s + m.orders, 0);
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Sales Report - Asian Grocery NG</title>
<style>
body{font-family:Helvetica,Arial,sans-serif;padding:28px;color:#1a1a1a;font-size:13px}
h1{color:#c41e3a;margin:0 0 3px;font-size:21px}
.sub{color:#888;font-size:12px;margin-bottom:22px}
h2{font-size:13px;font-weight:700;margin:22px 0 7px;padding-bottom:4px;border-bottom:2px solid #c41e3a;color:#333}
table{width:100%;border-collapse:collapse;font-size:12px}
th{background:#f5f3f0;padding:7px 9px;text-align:left;font-weight:700;color:#444;border-bottom:2px solid #ddd}
td{padding:6px 9px;border-bottom:1px solid #eee}
tr:nth-child(even){background:#fafaf9}
.kpi{display:flex;gap:14px;margin-bottom:18px;flex-wrap:wrap}
.kc{flex:1;min-width:110px;background:#faf8f6;border-radius:8px;padding:12px;border-left:3px solid #c41e3a}
.kv{font-size:19px;font-weight:800;color:#c41e3a}
.kl{font-size:9px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-top:2px}
</style></head><body>
<h1>Sales Report &#8212; Asian Grocery NG</h1>
<p class="sub">Generated ${new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
<div class="kpi">
<div class="kc"><div class="kv">&#8358;${totalRev.toLocaleString()}</div><div class="kl">Total Revenue (YTD)</div></div>
<div class="kc"><div class="kv">${totalOrd}</div><div class="kl">Total Orders</div></div>
<div class="kc"><div class="kv">&#8358;${Math.round(totalRev / totalOrd).toLocaleString()}</div><div class="kl">Avg Order Value</div></div>
<div class="kc"><div class="kv">142</div><div class="kl">Customers</div></div>
</div>
<h2>Monthly Revenue Breakdown</h2>
<table><thead><tr><th>Month</th><th>Orders</th><th>Revenue</th><th>Avg. Order Value</th></tr></thead><tbody>${monthRows}</tbody></table>
<h2>Recent Order History</h2>
<table><thead><tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead><tbody>${orderRows}</tbody></table>
</body></html>`;
  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  setTimeout(() => win.print(), 400);
}

/* ─── Main Dashboard ──────────────────────────────────────────── */
export default function AdminDashboardPage() {
  const { orders, products, hydrateOrders } = useAdminStore();
  const [customerCount, setCustomerCount] = useState<number | null>(null);

  useEffect(() => {
    hydrateOrders();
    fetch('/api/customers')
      .then((r) => (r.ok ? r.json() : []))
      .then((c) => setCustomerCount(c.length))
      .catch(() => setCustomerCount(0));
  }, [hydrateOrders]);

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const totalOrders = orders.length;
  const avgOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const lowStock = products.filter((p) => p.inStock && p.stockCount <= 15).length;
  const outOfStock = products.filter((p) => !p.inStock).length;

  const card = 'rounded-2xl border p-5';
  const cardStyle = { background: '#1a1814', borderColor: 'rgba(255,255,255,0.06)' };
  const sectionLabel = 'text-[10px] font-label uppercase tracking-widest text-gray-500 mb-4';

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-display">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5 font-display">
            Asian Grocery NG · {new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => dlCSV(orders as AnyOrder[])}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-80 transition-opacity cursor-pointer"
            style={{ background: '#10B981' }}>
            <Download className="h-4 w-4" /> Export Excel
          </button>
          <button onClick={() => dlPDF(orders as AnyOrder[])}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-80 transition-opacity cursor-pointer"
            style={{ background: '#3B82F6' }}>
            <FileText className="h-4 w-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Revenue" value={`₦${(totalRevenue / 1000).toFixed(0)}k`}
          sub="vs last month" icon={DollarSign} trend={12.4}
          sparkValues={monthlyData.map((d) => d.revenue)} color="#c41e3a" />
        <KpiCard label="Total Orders" value={String(totalOrders)}
          sub="vs last month" icon={ShoppingBag} trend={8.1}
          sparkValues={monthlyData.map((d) => d.orders)} color="#3B82F6" />
        <KpiCard label="Avg Order Value" value={`₦${(avgOrder / 1000).toFixed(1)}k`}
          sub="vs last month" icon={TrendingUp} trend={-2.3}
          sparkValues={[6800, 7200, 6900, 7500, 7100, 7400, 7200]} color="#8B5CF6" />
        <KpiCard label="Customers" value={customerCount === null ? '–' : String(customerCount)}
          sub="registered accounts" icon={Users} trend={0}
          sparkValues={[1, 1, 1, 1, 1, 1, customerCount || 1]} color="#10B981" />
      </div>

      {/* Alerts */}
      {(lowStock > 0 || outOfStock > 0) && (
        <div className="flex flex-wrap gap-3">
          {outOfStock > 0 && (
            <Link href="/admin/products" className={cn(card, 'flex items-center gap-3 py-3 hover:opacity-80 transition-opacity')}
              style={{ ...cardStyle, borderColor: 'rgba(239,68,68,0.3)' }}>
              <Package className="h-4 w-4 text-red-400 shrink-0" />
              <span className="text-sm font-display text-red-300">{outOfStock} product{outOfStock > 1 ? 's' : ''} out of stock</span>
              <ExternalLink className="h-3 w-3 text-gray-500 ml-auto" />
            </Link>
          )}
          {lowStock > 0 && (
            <Link href="/admin/products" className={cn(card, 'flex items-center gap-3 py-3 hover:opacity-80 transition-opacity')}
              style={{ ...cardStyle, borderColor: 'rgba(245,158,11,0.3)' }}>
              <Package className="h-4 w-4 text-amber-400 shrink-0" />
              <span className="text-sm font-display text-amber-300">{lowStock} product{lowStock > 1 ? 's' : ''} running low</span>
              <ExternalLink className="h-3 w-3 text-gray-500 ml-auto" />
            </Link>
          )}
        </div>
      )}

      {/* Revenue chart + Donut */}
      <div className="grid lg:grid-cols-5 gap-4">
        <div className={cn(card, 'lg:col-span-3')} style={cardStyle}>
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <div>
              <p className={sectionLabel}>Revenue Trend — Jan to Jul 2024</p>
              <p className="text-2xl font-bold text-white font-display tabular-nums">₦1,577,000</p>
              <p className="text-xs text-green-400 font-mono mt-0.5">+12.4% vs previous period</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-label uppercase tracking-widest text-gray-600">219 total orders</p>
              <p className="text-xs text-gray-500 font-display mt-0.5">Avg ₦7,200 / order</p>
            </div>
          </div>
          <AreaChart data={monthlyData} />
        </div>

        <div className={cn(card, 'lg:col-span-2')} style={cardStyle}>
          <p className={sectionLabel}>Order Status Breakdown</p>
          <DonutChart data={orderStatusData} />
          <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 font-display">Completion rate</span>
              <span className="font-bold text-green-400 font-mono">
                {Math.round((89 / orderStatusData.reduce((s, d) => s + d.value, 0)) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products + Category Revenue */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className={card} style={cardStyle}>
          <p className={sectionLabel}>Top Products by Revenue</p>
          <div className="space-y-3">
            {topProducts.map((p) => (
              <HorizBar key={p.label} label={p.label} pct={p.pct} value={p.value} color="#c41e3a" />
            ))}
          </div>
          <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-xs text-brand-red font-semibold mt-4 hover:opacity-75 transition-opacity font-display">
            Manage Products <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        <div className={card} style={cardStyle}>
          <p className={sectionLabel}>Revenue by Category</p>
          <div className="space-y-3">
            {categoryRevenue.map((c, i) => (
              <HorizBar key={c.label} label={c.label} pct={c.pct} value={c.value}
                color={['#c41e3a', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'][i]} />
            ))}
          </div>
          <Link href="/admin/categories" className="inline-flex items-center gap-1.5 text-xs text-brand-red font-semibold mt-4 hover:opacity-75 transition-opacity font-display">
            Manage Categories <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={card} style={cardStyle}>
        <p className={sectionLabel}>Quick Actions</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/admin/banners', label: 'Edit Hero Banners', desc: 'Update homepage slider', color: '#c41e3a' },
            { href: '/admin/products', label: 'Add Product', desc: 'List a new item', color: '#3B82F6' },
            { href: '/admin/orders', label: 'View Orders', desc: 'Process pending orders', color: '#10B981' },
            { href: '/admin/categories', label: 'Edit Categories', desc: 'Update category info', color: '#8B5CF6' },
          ].map((a) => (
            <Link key={a.href} href={a.href}
              className="flex flex-col gap-1 p-4 rounded-xl border hover:bg-white/5 transition-colors"
              style={{ borderColor: `${a.color}22` }}>
              <span className="text-sm font-bold font-display" style={{ color: a.color }}>{a.label}</span>
              <span className="text-[10px] text-gray-500 font-display">{a.desc}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* WhatsApp Broadcast */}
      <div className={card} style={{ ...cardStyle, borderColor: 'rgba(34,197,94,0.2)' }}>
        <div className="flex items-center gap-3 mb-2">
          <MessageCircle className="h-4 w-4 text-green-400" />
          <p className="text-sm font-bold text-gray-200 font-display">WhatsApp Broadcast</p>
        </div>
        <p className="text-xs text-gray-500 font-display mb-4">Send a promo or announcement to your business WhatsApp for sharing with customers.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <textarea id="broadcast-msg" rows={2} placeholder="e.g. 🎉 Weekend deal! 15% off all Korean products. Use code ASIAN15 at checkout..."
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-display border focus:outline-none focus:border-green-500 text-gray-200 resize-none"
            style={{ background: '#0f0e0b', borderColor: 'rgba(255,255,255,0.08)' }} />
          <button onClick={() => {
            const el = document.getElementById('broadcast-msg') as HTMLTextAreaElement;
            const msg = el?.value.trim(); if (!msg) return;
            window.open(`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '2348000000000'}?text=${encodeURIComponent(msg)}`, '_blank');
          }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity cursor-pointer shrink-0"
            style={{ background: '#16A34A' }}>
            <MessageCircle className="h-4 w-4" /> Send
          </button>
        </div>
      </div>

      {/* Recent Orders */}
      <div className={card} style={cardStyle}>
        <div className="flex items-center justify-between mb-4">
          <p className={cn(sectionLabel, 'mb-0')}>Recent Orders</p>
          <Link href="/admin/orders" className="text-xs text-brand-red font-semibold font-display hover:opacity-75 transition-opacity">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                {['Order', 'Customer', 'Total', 'Status', 'Date'].map((h) => (
                  <th key={h} className="text-left pb-3 pr-4 text-[10px] font-label uppercase tracking-wide text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              {orders.slice(0, 8).map((o) => {
                const sc: Record<string, string> = {
                  pending: 'bg-amber-500/15 text-amber-400', confirmed: 'bg-blue-400/15 text-blue-300',
                  processing: 'bg-blue-500/15 text-blue-400', shipped: 'bg-green-500/15 text-green-400',
                  delivered: 'bg-gray-500/15 text-gray-400', cancelled: 'bg-red-500/15 text-red-400',
                };
                return (
                  <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 pr-4"><span className="font-mono text-xs font-bold text-gray-300">{o.id}</span></td>
                    <td className="py-3 pr-4"><span className="text-xs font-display text-gray-300">{o.customer}</span></td>
                    <td className="py-3 pr-4"><span className="text-xs font-mono font-bold text-gray-200 tabular-nums">₦{o.total.toLocaleString()}</span></td>
                    <td className="py-3 pr-4">
                      <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold capitalize font-label', sc[o.status] ?? '')}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 text-[10px] text-gray-500 font-label">{o.date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
