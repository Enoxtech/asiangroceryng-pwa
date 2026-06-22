import { prisma } from '@/lib/prisma';

/**
 * Simple DB-backed sliding-window rate limiter — works correctly across
 * Vercel's multiple serverless instances, unlike an in-memory counter.
 * Returns true if the request is allowed, false if the limit was hit.
 */
export async function checkRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const since = new Date(Date.now() - windowMs);

  const count = await prisma.rateLimitHit.count({ where: { key, createdAt: { gte: since } } });
  if (count >= limit) return false;

  await prisma.rateLimitHit.create({ data: { key } });

  // Opportunistic cleanup of old hits for this key — keeps the table small
  // without needing a separate cron job. Never blocks the actual check.
  prisma.rateLimitHit.deleteMany({ where: { key, createdAt: { lt: since } } }).catch(() => {});

  return true;
}
