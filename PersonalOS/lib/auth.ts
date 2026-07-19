// Uses Web Crypto (crypto.subtle) instead of Node's `crypto` module so this
// also works in Next.js middleware, which runs on the Edge runtime.

export const AUTH_COOKIE = "pos_auth";

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set");
  }
  return secret;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function sign(value: string): Promise<string> {
  const key = await hmacKey(getSecret());
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return toHex(sig);
}

/** Builds a signed cookie value: `${expiryMs}.${hmac}` */
export async function createSessionToken(ttlMs = 1000 * 60 * 60 * 24 * 30): Promise<string> {
  const exp = Date.now() + ttlMs;
  const payload = String(exp);
  return `${payload}.${await sign(payload)}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const [payload, mac] = token.split(".");
  if (!payload || !mac) return false;

  const expected = await sign(payload);
  if (!timingSafeEqualStr(mac, expected)) return false;

  const exp = Number(payload);
  if (!Number.isFinite(exp)) return false;
  return Date.now() < exp;
}

export function checkPassword(candidate: string): boolean {
  const expected = process.env.DASHBOARD_PASSWORD;
  if (!expected) return false;
  return timingSafeEqualStr(candidate, expected);
}

export function checkApiSecret(candidate: string | null): boolean {
  const expected = process.env.API_SECRET;
  if (!expected || !candidate) return false;
  return timingSafeEqualStr(candidate, expected);
}
