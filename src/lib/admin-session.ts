import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE = "visitecard_admin";

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value) throw new Error("ADMIN_SESSION_SECRET manquante.");
  return value;
}

export function createAdminSession(email: string) {
  const payload = Buffer.from(JSON.stringify({
    email: email.toLowerCase(),
    exp: Date.now() + 8 * 60 * 60 * 1000
  })).toString("base64url");
  const sig = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyAdminSession(value?: string) {
  if (!value) return false;
  const [payload, sig] = value.split(".");
  if (!payload || !sig) return false;
  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
  const a = Buffer.from(sig), b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a,b)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload,"base64url").toString());
    return data.email === (process.env.ADMIN_EMAIL || "").toLowerCase() && data.exp > Date.now();
  } catch { return false; }
}
