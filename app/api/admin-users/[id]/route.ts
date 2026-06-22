import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole, hashPassword, validatePasswordStrength } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

const SAFE_SELECT = { id: true, name: true, email: true, role: true, active: true, createdAt: true, lastLoginAt: true };

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireRole(req, ['super_admin']);
  if (response) return response;

  const { id } = await params;
  const body = await req.json();

  if (id === session.id && (body.active === false || (body.role && body.role !== 'super_admin'))) {
    return NextResponse.json({ error: "You can't deactivate or demote your own account" }, { status: 400 });
  }
  if (body.role && !['super_admin', 'support', 'product_manager'].includes(body.role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (typeof body.name === 'string') data.name = body.name;
  if (typeof body.role === 'string') data.role = body.role;
  if (typeof body.active === 'boolean') data.active = body.active;
  let passwordReset = false;
  if (typeof body.password === 'string' && body.password.length > 0) {
    const passwordError = validatePasswordStrength(body.password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }
    data.passwordHash = await hashPassword(body.password);
    // Resetting a password invalidates any sessions issued under the old one.
    data.sessionVersion = { increment: 1 };
    passwordReset = true;
  }

  const user = await prisma.adminUser.update({ where: { id }, data, select: SAFE_SELECT });

  await logAudit(req, session, 'update', 'AdminUser', id, {
    fields: Object.keys(body).filter((k) => ['name', 'role', 'active'].includes(k)),
    passwordReset,
  });

  return NextResponse.json(user);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireRole(req, ['super_admin']);
  if (response) return response;

  const { id } = await params;
  if (id === session.id) {
    return NextResponse.json({ error: "You can't delete your own account" }, { status: 400 });
  }

  await prisma.adminUser.delete({ where: { id } });
  await logAudit(req, session, 'delete', 'AdminUser', id);
  return NextResponse.json({ ok: true });
}
