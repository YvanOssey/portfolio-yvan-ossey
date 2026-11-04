// Mesure d'audience anonyme du portfolio (voir api/track.ts) : pas de cookie, pas de bannière nécessaire.
// Ne compte pas : l'espace admin, les navigateurs qui demandent à ne pas être suivis,
// et ce navigateur une fois connecté à l'admin (vos propres visites).

const NO_TRACK = "portfolio-no-track";

type Event =
  | { type: "view"; ref?: string; device: "mobile" | "desktop" }
  | { type: "project"; slug: string }
  | { type: "cv"; action: "open" | "download" }
  | { type: "contact"; action: string };

function allowed(): boolean {
  if (location.hash.startsWith("#/admin")) return false;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  if (nav.globalPrivacyControl || nav.doNotTrack === "1") return false;
  try { if (localStorage.getItem(NO_TRACK)) return false; } catch { /* stockage bloqué */ }
  return location.hostname !== "localhost" && location.hostname !== "127.0.0.1";
}

export function track(e: Event) {
  if (!allowed()) return;
  const body = new Blob([JSON.stringify(e)], { type: "application/json" });
  try {
    if (!navigator.sendBeacon?.("/api/track", body)) {
      fetch("/api/track", { method: "POST", body, keepalive: true, credentials: "omit" }).catch(() => {});
    }
  } catch { /* les statistiques ne doivent jamais gêner la visite */ }
}

/** Appelé à la connexion à l'admin : ce navigateur n'est plus compté */
export function excludeThisBrowser() {
  try { localStorage.setItem(NO_TRACK, "1"); } catch { /* rien */ }
}

/** Une visite par chargement de page, puis les clics utiles (CV, moyens de contact) */
export function startTracking() {
  const ext = document.referrer && !document.referrer.startsWith(location.origin) ? document.referrer : undefined;
  const mobile = matchMedia("(pointer: coarse)").matches || innerWidth < 760;
  track({ type: "view", ref: ext, device: mobile ? "mobile" : "desktop" });

  document.addEventListener("click", (ev) => {
    const a = (ev.target as Element | null)?.closest?.("a");
    if (!a) return;
    const href = a.getAttribute("href") ?? "";
    if (href.includes("cv/")) track({ type: "cv", action: a.hasAttribute("download") ? "download" : "open" });
    else if (href.startsWith("mailto:")) track({ type: "contact", action: "email" });
    else if (href.startsWith("tel:")) track({ type: "contact", action: "phone" });
    else if (href.includes("wa.me/")) track({ type: "contact", action: "whatsapp" });
    else if (href.includes("linkedin.com")) track({ type: "contact", action: "linkedin" });
    else if (/^https:\/\/github\.com\/[^/]+\/?$/.test(href)) track({ type: "contact", action: "github" });
  }, { capture: true, passive: true });
}
