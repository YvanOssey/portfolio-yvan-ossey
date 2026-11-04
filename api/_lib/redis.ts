// Accès à Upstash Redis par son API REST (aucune dépendance).
// Vercel Marketplace injecte KV_REST_API_URL / KV_REST_API_TOKEN (ou UPSTASH_REDIS_REST_URL / _TOKEN).

type Cmd = (string | number)[];

function config() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Base des statistiques non configurée (Upstash Redis)");
  return { url: url.replace(/\/$/, ""), token };
}

export const redisConfigured = () =>
  Boolean((process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL) && (process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN));

/** Envoie plusieurs commandes en une seule requête ; renvoie le résultat de chacune */
export async function pipeline(cmds: Cmd[]): Promise<unknown[]> {
  if (cmds.length === 0) return [];
  const { url, token } = config();
  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(cmds.map((c) => c.map(String))),
  });
  if (!res.ok) throw new Error(`Upstash a répondu ${res.status}`);
  const out = (await res.json()) as { result?: unknown; error?: string }[];
  return out.map((r) => (r.error ? null : r.result));
}
