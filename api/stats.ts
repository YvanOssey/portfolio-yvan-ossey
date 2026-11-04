// Statistiques agrégées pour le tableau de bord de l'admin (connexion requise).
import { isAuthenticated, json } from "./_lib/auth.js";
import { pipeline, redisConfigured } from "./_lib/redis.js";
import { keys, lastDays } from "./_lib/stats.js";

type Hash = Record<string, number>;

/** HGETALL renvoie [champ, valeur, champ, valeur…] */
function toHash(v: unknown): Hash {
  const out: Hash = {};
  if (Array.isArray(v)) for (let i = 0; i + 1 < v.length; i += 2) out[String(v[i])] = Number(v[i + 1]) || 0;
  return out;
}

function add(into: Hash, from: Hash) {
  for (const [k, n] of Object.entries(from)) into[k] = (into[k] ?? 0) + n;
}

export async function GET(req: Request) {
  if (!isAuthenticated(req)) return json({ error: "Connexion requise." }, 401);
  if (!redisConfigured()) return json({ configured: false });

  const requested = Number(new URL(req.url).searchParams.get("days"));
  const n = [7, 30, 90].includes(requested) ? requested : 30;
  const days = lastDays(n);

  try {
    const cmds: (string | number)[][] = [];
    for (const d of days) {
      const k = keys(d);
      cmds.push(["GET", k.pv], ["PFCOUNT", k.uv], ["HGETALL", k.ref], ["HGETALL", k.dev], ["HGETALL", k.geo], ["HGETALL", k.proj], ["HGETALL", k.cv], ["HGETALL", k.contact]);
    }
    // visiteurs uniques sur toute la période (union des HyperLogLog)
    cmds.push(["PFCOUNT", ...days.map((d) => keys(d).uv)]);
    const r = await pipeline(cmds);

    const daily: { day: string; views: number; visitors: number }[] = [];
    const sources: Hash = {}, devices: Hash = {}, countries: Hash = {}, projects: Hash = {}, cv: Hash = {}, contact: Hash = {};
    days.forEach((day, i) => {
      const o = i * 8;
      daily.push({ day, views: Number(r[o]) || 0, visitors: Number(r[o + 1]) || 0 });
      add(sources, toHash(r[o + 2]));
      add(devices, toHash(r[o + 3]));
      add(countries, toHash(r[o + 4]));
      add(projects, toHash(r[o + 5]));
      add(cv, toHash(r[o + 6]));
      add(contact, toHash(r[o + 7]));
    });

    return json({
      configured: true,
      days: n,
      totals: {
        views: daily.reduce((s, d) => s + d.views, 0),
        visitors: Number(r[r.length - 1]) || 0,
        projectViews: Object.values(projects).reduce((s, v) => s + v, 0),
        cv: Object.values(cv).reduce((s, v) => s + v, 0),
        contacts: Object.values(contact).reduce((s, v) => s + v, 0),
      },
      daily, sources, devices, countries, projects, cv, contact,
    });
  } catch (e) {
    console.error("stats", e);
    return json({ error: "Impossible de lire les statistiques." }, 502);
  }
}
