// Mesure d'audience anonyme : le site envoie de petits événements (navigator.sendBeacon).
// Réponse toujours 204 : un visiteur ne doit jamais voir d'erreur à cause des statistiques.
import { createHash } from "node:crypto";
import { pipeline, redisConfigured } from "./_lib/redis.js";
import { CONTACT_CHANNELS, CV_ACTIONS, DEVICES, EVENTS, TTL, dayKey, isBot, keys, type EventType } from "./_lib/stats.js";
import { sameOrigin } from "./_lib/auth.js";

interface TrackBody { type?: unknown; slug?: unknown; action?: unknown; ref?: unknown; device?: unknown }

const done = () => new Response(null, { status: 204, headers: { "cache-control": "no-store" } });

const oneOf = <T extends string>(list: readonly T[], v: unknown): T | null => (list.includes(v as T) ? (v as T) : null);

/** Ne garde que le nom de domaine du site d'origine (jamais l'adresse complète) */
function refHost(v: unknown, self: string): string | null {
  if (typeof v !== "string" || !v) return null;
  try {
    const host = new URL(v).hostname.replace(/^www\./, "").toLowerCase();
    if (!host || host === self || host.length > 80 || !/^[a-z0-9.-]+$/.test(host)) return null;
    return host;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    if (!redisConfigured() || !sameOrigin(req)) return done();
    const ua = req.headers.get("user-agent") ?? "";
    if (isBot(ua)) return done();

    const text = await req.text();
    if (text.length > 1000) return done();
    const body = JSON.parse(text) as TrackBody;
    const type = oneOf<EventType>(EVENTS, body.type);
    if (!type) return done();

    const day = dayKey(new Date());
    const k = keys(day);
    const cmds: (string | number)[][] = [];

    if (type === "view") {
      // empreinte du jour : IP + navigateur + sel secret + date, puis hachée ; seule l'empreinte part dans le HyperLogLog
      const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
      const salt = process.env.SESSION_SECRET ?? "";
      const fp = createHash("sha256").update(`${salt}|${day}|${ip}|${ua}`).digest("base64url").slice(0, 22);
      cmds.push(["INCR", k.pv], ["PFADD", k.uv, fp]);
      const device = oneOf(DEVICES, body.device);
      if (device) cmds.push(["HINCRBY", k.dev, device, 1]);
      const country = (req.headers.get("x-vercel-ip-country") ?? "").toUpperCase();
      if (/^[A-Z]{2}$/.test(country)) cmds.push(["HINCRBY", k.geo, country, 1]);
      const host = refHost(body.ref, new URL(req.url).hostname.replace(/^www\./, ""));
      cmds.push(["HINCRBY", k.ref, host ?? "direct", 1]);
      for (const key of [k.pv, k.uv, k.dev, k.geo, k.ref]) cmds.push(["EXPIRE", key, TTL]);
    } else if (type === "project") {
      const slug = typeof body.slug === "string" && /^[a-z0-9-]{1,60}$/.test(body.slug) ? body.slug : null;
      if (!slug) return done();
      cmds.push(["HINCRBY", k.proj, slug, 1], ["EXPIRE", k.proj, TTL]);
    } else if (type === "cv") {
      const action = oneOf(CV_ACTIONS, body.action);
      if (!action) return done();
      cmds.push(["HINCRBY", k.cv, action, 1], ["EXPIRE", k.cv, TTL]);
    } else if (type === "contact") {
      const channel = oneOf(CONTACT_CHANNELS, body.action);
      if (!channel) return done();
      cmds.push(["HINCRBY", k.contact, channel, 1], ["EXPIRE", k.contact, TTL]);
    }

    await pipeline(cmds);
  } catch (e) {
    console.error("track", e);
  }
  return done();
}
