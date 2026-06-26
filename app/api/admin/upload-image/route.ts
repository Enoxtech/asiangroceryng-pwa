import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { requireRole } from '@/lib/auth';
import { uploadToR2 } from '@/lib/r2';
import { logAudit } from '@/lib/audit';

const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

// Admin-only — uploads a product image file directly to Cloudflare R2 and
// returns its public URL, so admins aren't limited to pasting image links.
export async function POST(req: NextRequest) {
  const { session, response } = await requireRole(req, ['super_admin', 'product_manager']);
  if (response) return response;

  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'Image must be under 8MB' }, { status: 400 });
  }
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json({ error: 'Unsupported image type. Use JPG, PNG, WEBP, or GIF.' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = `products/admin-uploads/${crypto.randomBytes(8).toString('hex')}.${ext}`;

  try {
    const url = await uploadToR2(key, buffer, file.type);
    await logAudit(req, session, 'upload', 'ProductImage', key, { size: file.size });
    return NextResponse.json({ url });
  } catch (err) {
    console.error('[upload-image]', err);
    return NextResponse.json({ error: 'Upload failed. Check Cloudflare R2 configuration.' }, { status: 500 });
  }
}
