/**
 * Nobitex Ed25519 Request Signer for WebCrypto & Node environments
 * Reference: https://apidocs.nobitex.ir/api_key/api-key-guide
 */

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  // Python base64.urlsafe_b64encode replaces '+' with '-' and '/' with '_', and keeps '=' padding
  return base64.replace(/\+/g, '-').replace(/\//g, '_');
}

function decodeSecretKey(secret: string): Uint8Array {
  const clean = secret.trim();

  // If hex string (64 characters)
  if (/^[0-9a-fA-F]{64}$/.test(clean)) {
    const match = clean.match(/.{1,2}/g);
    if (match) {
      return new Uint8Array(match.map((byte) => parseInt(byte, 16)));
    }
  }

  // Otherwise treat as URL-safe Base64 or standard Base64
  let base64 = clean.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  // Use the first 32 bytes (seed/raw private key)
  return bytes.subarray(0, 32);
}

export async function signNobitexRequest(params: {
  publicKey: string;
  secretKey: string;
  method: 'GET' | 'POST' | 'DELETE' | 'PUT';
  path: string;
  body?: string;
}): Promise<Record<string, string>> {
  const { publicKey, secretKey, method, path, body = '' } = params;
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const rawSeed = decodeSecretKey(secretKey);
  if (rawSeed.length < 32) {
    throw new Error('کلید خصوصی نامعتبر است (طول کلید باید حداقل ۳۲ بایت باشد).');
  }

  // PKCS#8 ASN.1 prefix for Ed25519 private keys
  const pkcs8Prefix = new Uint8Array([
    0x30, 0x2e, 0x02, 0x01, 0x00, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70, 0x04, 0x22, 0x04, 0x20
  ]);

  const fullPkcs8 = new Uint8Array(pkcs8Prefix.length + 32);
  fullPkcs8.set(pkcs8Prefix, 0);
  fullPkcs8.set(rawSeed.subarray(0, 32), pkcs8Prefix.length);

  const cryptoObj = typeof window !== 'undefined' ? window.crypto : (globalThis as any).crypto;
  if (!cryptoObj?.subtle) {
    throw new Error('محیط اجرای مرورگر از رمزنگاری Web Crypto پشتیبانی نمی‌کند.');
  }

  const cryptoKey = await cryptoObj.subtle.importKey(
    'pkcs8',
    fullPkcs8,
    { name: 'Ed25519' },
    false,
    ['sign']
  );

  const payloadString = `${timestamp}${method}${path}${body}`;
  const payloadBytes = new TextEncoder().encode(payloadString);

  const signatureBuffer = await cryptoObj.subtle.sign('Ed25519', cryptoKey, payloadBytes);
  const signatureBytes = new Uint8Array(signatureBuffer);
  const signatureB64Url = base64UrlEncode(signatureBytes);

  return {
    'Nobitex-Key': publicKey.trim(),
    'Nobitex-Signature': signatureB64Url,
    'Nobitex-Timestamp': timestamp,
    'User-Agent': 'TraderBot/InvestmentApp-1.0.0',
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}
