import { authenticator } from 'otplib';
import QRCode from 'qrcode';

// Default window is 0 (zero tolerance) — too strict for real-world use given
// typing delay and clock drift between the admin's phone and the server.
// Window 1 accepts the previous/current/next 30s step (~±30s).
authenticator.options = { window: 1 };

export function generateTotpSecret(): string {
  return authenticator.generateSecret();
}

export function verifyTotpCode(secret: string, code: string): boolean {
  try {
    return authenticator.verify({ token: code, secret });
  } catch {
    return false;
  }
}

export async function buildTotpQrCode(email: string, secret: string): Promise<string> {
  const uri = authenticator.keyuri(email, 'Asian Grocery NG Admin', secret);
  return QRCode.toDataURL(uri);
}
