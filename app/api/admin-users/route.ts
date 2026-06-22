import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole, hashPassword, validatePasswordStrength } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

const SAFE_SELECT = { id: true, name: true, email: true, role: true, active: true, createdAt: true, lastLoginAt: true };

export async function GET(req: NextRequest) {
  const { response } = await requireRole(req, ['super_admin']);
  if (response) return response;

  const users = await prisma.adminUser.findMany({ select: SAFE_SELECT, orderBy: { createdAt: 'asc' } });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const { session, response } = await requireRole(req, ['super_admin']);
  if (response) return response;

  const { name, email, password, role } = await req.json();
  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: 'name, email, password, and role are required' }, { status: 400 });
  }
  if (!['super_admin', 'support', 'product_manager'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }
  const passwordError = validatePasswordStrength(password);
  if (passwordError) {
    return NextResponse.json({ error: passwordError }, { status: 400 });
  }

  const existing = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return NextResponse.json({ error: 'An admin with that email already exists' }, { status: 409 });
  }

  const user = await prisma.adminUser.create({
    data: { name, email: email.toLowerCase(), passwordHash: await hashPassword(password), role },
    select: SAFE_SELECT,
  });

  await logAudit(req, session, 'create', 'AdminUser', user.id, { email: user.email, role: user.role });

  return NextResponse.json(user, { status: 201 });
}
