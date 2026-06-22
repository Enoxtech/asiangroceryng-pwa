import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession, setSessionCookie } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

// Logs out every other device/browser by bumping sessionVersion (which invalidates
// all previously issued tokens), then immediately issues a fresh token for this
// browser so the admin calling this isn't logged out themselves.
export async function POST(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.adminUser.update({
    where: { id: session.id },
    data: { sessionVersion: { increment: 1 } },
  });

  const res = NextResponse.json({ ok: true });
  setSessionCookie(res, session, user.sessionVersion);
  await logAudit(req, session, 'revoke_sessions', 'AdminUser', session.id);
  return res;
}
