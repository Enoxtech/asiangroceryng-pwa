import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { AdminSession } from '@/lib/auth';

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

/**
 * Records an admin action for the audit trail. Never throws — a logging
 * failure must not block the action it's describing.
 */
export async function logAudit(
  req: NextRequest,
  session: AdminSession,
  action: string,
  entityType: string,
  entityId?: string,
  metadata?: Record<string, unknown>
) {
  try {
    await prisma.auditLog.create({
      data: {
        adminId: session.id,
        adminEmail: session.email,
        adminName: session.name,
        action,
        entityType,
        entityId,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
        ip: getClientIp(req),
      },
    });
  } catch (err) {
    console.error('[audit] failed to record log', err);
  }
}
