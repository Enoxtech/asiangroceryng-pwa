import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

const MONTHS_BACK = 6;
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export async function GET(req: NextRequest) {
  const { response } = await requireRole(req, ['super_admin']);
  if (response) return response;

  const since = new Date();
  since.setMonth(since.getMonth() - (MONTHS_BACK - 1));
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const [orders, statusGroups, items, categories] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, total: true },
    }),
    prisma.order.groupBy({ by: ['status'], _count: true }),
    prisma.orderItem.findMany({
      where: { order: { createdAt: { gte: since } } },
      select: { name: true, price: true, quantity: true, categorySlug: true },
    }),
    prisma.category.findMany({ select: { slug: true, name: true } }),
  ]);

  // Monthly revenue + order count, oldest to newest
  const monthly: { month: string; revenue: number; orders: number }[] = [];
  for (let i = MONTHS_BACK - 1; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    monthly.push({ month: MONTH_NAMES[d.getMonth()], revenue: 0, orders: 0 });
  }
  const monthIndexOf = (date: Date) => {
    const diff = (date.getFullYear() - since.getFullYear()) * 12 + (date.getMonth() - since.getMonth());
    return diff;
  };
  for (const o of orders) {
    const idx = monthIndexOf(new Date(o.createdAt));
    if (idx >= 0 && idx < monthly.length) {
      monthly[idx].revenue += o.total;
      monthly[idx].orders += 1;
    }
  }

  const orderStatusBreakdown = statusGroups.map((g) => ({ status: g.status, count: g._count }));

  const categoryNameBySlug = new Map(categories.map((c) => [c.slug, c.name]));

  const productRevenue = new Map<string, number>();
  const categoryRevenueMap = new Map<string, number>();
  for (const it of items) {
    const revenue = it.price * it.quantity;
    productRevenue.set(it.name, (productRevenue.get(it.name) ?? 0) + revenue);
    if (it.categorySlug) {
      const label = categoryNameBySlug.get(it.categorySlug) ?? it.categorySlug;
      categoryRevenueMap.set(label, (categoryRevenueMap.get(label) ?? 0) + revenue);
    }
  }

  const topProducts = [...productRevenue.entries()]
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const categoryRevenue = [...categoryRevenueMap.entries()]
    .map(([category, revenue]) => ({ category, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  // Trend: this month vs previous month (only meaningful with 2+ months of data)
  const thisMonth = monthly[monthly.length - 1];
  const prevMonth = monthly[monthly.length - 2];
  const revenueTrendPercent = prevMonth && prevMonth.revenue > 0
    ? Math.round(((thisMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 1000) / 10
    : null;
  const ordersTrendPercent = prevMonth && prevMonth.orders > 0
    ? Math.round(((thisMonth.orders - prevMonth.orders) / prevMonth.orders) * 1000) / 10
    : null;

  return NextResponse.json({
    monthly,
    orderStatusBreakdown,
    topProducts,
    categoryRevenue,
    revenueTrendPercent,
    ordersTrendPercent,
  });
}
