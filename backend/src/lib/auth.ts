import "server-only";
import { createHmac, timingSafeEqual, randomBytes } from "node:crypto";
import { env } from "./env";
import { SESSION_COOKIE } from "./constants";

export { SESSION_COOKIE };
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

function b64url(buf: Buffer): string {
  return buf.toString("base64url");
}

function sign(payload: string): string {
  return b64url(createHmac("sha256", env.sessionSecret).update(payload).digest());
}

/** Constant-time compare of two strings (returns false on length mismatch). */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) {
    // Still do a compare to avoid leaking length via timing on the hot path.
    timingSafeEqual(ab, ab);
    return false;
  }
  return timingSafeEqual(ab, bb);
}

/** Verify an operator password attempt against ADMIN_PASSWORD, constant-time. */
export function verifyPassword(attempt: string): boolean {
  return safeEqual(attempt, env.adminPassword);
}

/** Create a signed session token: base64url(json).signature */
export function createSessionToken(): string {
  const payload = JSON.stringify({
    exp: Date.now() + SESSION_TTL_MS,
    nonce: b64url(randomBytes(9)),
  });
  const body = b64url(Buffer.from(payload));
  return `${body}.${sign(body)}`;
}

/** Verify a session token: signature valid and not expired. */
export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return false;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!safeEqual(sig, sign(body))) return false;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    return typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

// --- simple in-memory login rate limiter -----------------------------------
// NOTE: per serverless instance, so not globally exact. Acceptable for a single
// operator; it stops trivial brute force from one warm instance.
const attempts = new Map<string, { count: number; first: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

export function rateLimitLogin(ip: string): { ok: boolean; retryAfter?: number } {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || now - rec.first > WINDOW_MS) {
    attempts.set(ip, { count: 1, first: now });
    return { ok: true };
  }
  rec.count += 1;
  if (rec.count > MAX_ATTEMPTS) {
    return { ok: false, retryAfter: Math.ceil((rec.first + WINDOW_MS - now) / 1000) };
  }
  return { ok: true };
}

export function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  };
}
