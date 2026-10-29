import { authenticator } from 'otplib';
import QRCode from 'qrcode';

// Configure authenticator with window 1 (allows current, 30s past, 30s future)
authenticator.options = {
  window: 1,
};

export function generateTotpSecret(): string {
  return authenticator.generateSecret();
}

export function getTotpKeyUri(username: string, issuer: string, secret: string): string {
  return authenticator.keyuri(username, issuer, secret);
}

export function verifyTotpCode(code: string, secret: string): boolean {
  try {
    return authenticator.verify({
      token: code.trim(),
      secret: secret.trim(),
    });
  } catch {
    return false;
  }
}

export async function generateQrDataUrl(keyuri: string): Promise<string> {
  return QRCode.toDataURL(keyuri, {
    width: 256,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });
}
