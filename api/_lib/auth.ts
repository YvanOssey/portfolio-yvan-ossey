// Outils partagés des fonctions Vercel (dossier _lib : pas exposé comme route).
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const COOKIE = "admin_session";
const SESSION_HOURS = 8;

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET manquant ou trop court (32 caractères minimum)");
  return s;
}

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

/** Comparaison en temps constant, quelle que soit la longueur des deux textes */
export function safeEqual(a: string, b: string): boolean {
  const k = randomBytes(32);
  const ha = createHmac("sha256", k).update(a).digest();
  const hb = createHmac("sha256", k).update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function checkPassword(candidate: unknown): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || expected.length < 12) throw new Error("ADMIN_PASSWORD manquant ou trop court (12 caractères minimum)");
  return typeof candidate === "string" && safeEqual(candidate, expected);
}

/** Cookie de session signé : expiration + signature HMAC, HttpOnly, Secure, SameSite=Strict */
export function sessionCookie(): string {
  const exp = Date.now() + SESSION_HOURS * 3600_000;
  const payload = `v1.${exp}.${randomBytes(12).toString("base64url")}`;
  const value = `${payload}.${sign(payload)}`;
  return `${COOKIE}=${value}; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_HOURS * 3600}`;
}

export const clearCookie = () => `${COOKIE}=; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;

export function isAuthenticated(req: Request): boolean {
  const raw = req.headers.get("cookie") ?? "";
  const match = raw.split(/;\s*/).find((c) => c.startsWith(`${COOKIE}=`));
  if (!match) return false;
  const value = match.slice(COOKIE.length + 1);
  const cut = value.lastIndexOf(".");
  if (cut < 0) return false;
  const payload = value.slice(0, cut);
  const sig = value.slice(cut + 1);
  if (!safeEqual(sig, sign(payload))) return false;
  const exp = Number(payload.split(".")[1]);
  return Number.isFinite(exp) && exp > Date.now();
}

/**
 * Les requêtes qui modifient quelque chose doivent venir du site lui-même
 * (en plus du cookie SameSite=Strict) : protection contre les requêtes intersites.
 */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === new URL(req.url).host;
  } catch {
    return false;
  }
}

export function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
  });
}

export const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));
