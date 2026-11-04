// Modèle des statistiques : des compteurs par jour (UTC = heure d'Abidjan), gardés 400 jours.
// Aucune donnée personnelle : pas de cookie, pas d'IP stockée ; les visiteurs uniques sont
// estimés par un HyperLogLog d'empreintes salées qui changent chaque jour.

export const EVENTS = ["view", "project", "cv", "contact"] as const;
export type EventType = (typeof EVENTS)[number];

export const CV_ACTIONS = ["open", "download"] as const;
export const CONTACT_CHANNELS = ["email", "whatsapp", "phone", "linkedin", "github", "carte-email", "carte-whatsapp"] as const;
export const DEVICES = ["mobile", "desktop"] as const;

export const TTL = 400 * 24 * 3600;

export const dayKey = (d: Date) => d.toISOString().slice(0, 10);

export const keys = (day: string) => ({
  pv: `pv:${day}`,
  uv: `uv:${day}`,
  ref: `ref:${day}`,
  dev: `dev:${day}`,
  geo: `geo:${day}`,
  proj: `proj:${day}`,
  cv: `cv:${day}`,
  contact: `contact:${day}`,
});

/** Derniers jours, du plus ancien au plus récent */
export function lastDays(n: number, now = new Date()): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(dayKey(new Date(now.getTime() - i * 86400_000)));
  return out;
}

/** Robots, aperçus de liens et navigateurs automatisés : pas comptés */
export const isBot = (ua: string) => !ua || /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|headless|lighthouse|curl|wget|python|node-fetch|axios/i.test(ua);
