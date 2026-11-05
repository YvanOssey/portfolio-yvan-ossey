// Référencement, généré à chaque build à partir de src/data/content.json (donc à jour après chaque
// enregistrement dans l'admin) :
// - fiche d'identité schema.org (Person + WebSite) dans la page d'accueil ;
// - une vraie page HTML par projet (/projet/<slug>), avec son titre, sa description et son texte,
//   que les moteurs de recherche peuvent lire sans exécuter JavaScript ;
// - sitemap.xml et robots.txt.
import fs from "node:fs";
import type { Plugin } from "vite";
import type { Project, SiteContent } from "../src/data/schema";

export const SITE = "https://yvanossey-dev.vercel.app";
const NAME = "Yvan Ossey";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const plain = (s: string) => s.replace(/\*\*/g, "");
const ld = (o: unknown) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`;
const abs = (src: string) => `${SITE}/${src.replace(/\?.*$/, "")}`;
const cut = (s: string, n = 158) => (s.length <= n ? s : `${s.slice(0, n - 1).replace(/\s+\S*$/, "")}…`);

function readContent(): SiteContent {
  return JSON.parse(fs.readFileSync(new URL("../src/data/content.json", import.meta.url), "utf8")) as SiteContent;
}

function person(c: SiteContent) {
  const school = c.parcours.formation[0]?.where;
  const org = c.parcours.experience.org.split("·")[0].trim();
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE}/#person`,
    name: NAME,
    alternateName: ["Ossey Yvan", "Ossey Yvan Jean De Kenty"],
    givenName: "Yvan",
    familyName: "Ossey",
    jobTitle: "Développeur full-stack web & mobile",
    description: plain(c.hero.lede),
    url: `${SITE}/`,
    image: `${SITE}/og-image.jpg`,
    email: `mailto:${c.contact.email}`,
    address: { "@type": "PostalAddress", addressLocality: c.contact.city, addressCountry: "CI" },
    ...(school ? { alumniOf: { "@type": "CollegeOrUniversity", name: school } } : {}),
    ...(org ? { worksFor: { "@type": "Organization", name: org } } : {}),
    knowsAbout: c.skills.flatMap((g) => g.items).slice(0, 30),
    sameAs: [c.contact.linkedin, c.contact.github],
  };
}

const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE}/#website`,
  url: `${SITE}/`,
  name: `${NAME} — Portfolio`,
  inLanguage: "fr",
  author: { "@id": `${SITE}/#person` },
};

function projectLd(p: Project) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: p.title,
    headline: `${p.title} — ${p.type}`,
    description: p.short,
    url: `${SITE}/projet/${p.slug}`,
    dateCreated: p.year,
    inLanguage: "fr",
    keywords: p.stack.join(", "),
    author: { "@id": `${SITE}/#person`, "@type": "Person", name: NAME },
    ...(p.image ? { image: abs(p.image.src) } : {}),
    ...(p.site ? { sameAs: [p.site] } : {}),
  };
}

/** Remplace la valeur content="" d'une balise meta (par name ou property) */
function setMeta(html: string, key: string, value: string) {
  const re = new RegExp(`(<meta (?:name|property)="${key.replace(/[:.]/g, "\\$&")}" content=")[^"]*(")`);
  return html.replace(re, `$1${esc(value)}$2`);
}

function pageFor(base: string, p: Project, i: number, total: number) {
  const title = `${p.title} — ${p.type} | ${NAME}`;
  const desc = cut(`${p.short} Projet de ${NAME}, développeur full-stack à Abidjan.`);
  const url = `${SITE}/projet/${p.slug}`;
  let h = base
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${url}"`);
  h = setMeta(h, "description", desc);
  h = setMeta(h, "og:type", "article");
  h = setMeta(h, "og:title", title);
  h = setMeta(h, "og:description", desc);
  h = setMeta(h, "og:url", url);
  h = setMeta(h, "twitter:title", title);
  h = setMeta(h, "twitter:description", desc);
  if (p.image) {
    h = setMeta(h, "og:image", abs(p.image.src));
    h = setMeta(h, "twitter:image", abs(p.image.src));
    h = setMeta(h, "og:image:alt", p.image.alt);
    // la capture n'a pas forcément le format 1200 × 630 de l'image par défaut
    h = h.replace(/\s*<meta property="og:image:(width|height)" content="[^"]*" \/>/g, "");
  }
  h = h.replace("</head>", `  ${ld(projectLd(p))}\n</head>`);

  // Texte complet de la fiche, lisible sans JavaScript (et par les moteurs de recherche)
  const links = [
    p.site && `<a href="${esc(p.site)}">Voir le site</a>`,
    p.github && `<a href="${esc(p.github)}">Code sur GitHub</a>`,
  ].filter(Boolean).join(" · ");
  const body = `<noscript>
    <main class="section nojs">
      <p class="label">Fiche ${String(i + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")} — ${esc(p.year)}</p>
      <h1>${esc(p.title)}</h1>
      <p><b>${esc(p.type)}</b> · ${esc(p.status)}</p>
      ${p.image ? `<img src="/${esc(p.image.src)}" alt="${esc(p.image.alt)}" width="1200" style="max-width:100%;height:auto" />` : ""}
      <p>${esc(p.intro)}</p>
      <p>${esc(p.description)}</p>
      <h2>Fonctionnalités</h2>
      <ul>${p.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
      <h2>Stack</h2>
      <p>${p.stack.map(esc).join(", ")}</p>
      <h2>Mon rôle</h2>
      <p>${esc(p.role)}</p>
      ${links ? `<p>${links}</p>` : ""}
      <p><a href="/">← Tous les projets de ${NAME}</a></p>
    </main>
  </noscript>`;
  return h.replace(/<noscript>[\s\S]*?<\/noscript>/, body);
}

export function seo(): Plugin {
  return {
    name: "portfolio-seo",
    enforce: "post",
    transformIndexHtml: {
      order: "post",
      handler(html) {
        const c = readContent();
        return html
          // les captures et icônes ont des chemins relatifs : <base> les garde justes sur /projet/<slug>
          .replace("<head>", `<head>\n  <base href="/" />`)
          .replace("</head>", `  ${ld(person(c))}\n  ${ld(website)}\n</head>`);
      },
    },
    generateBundle(_, bundle) {
      const index = bundle["index.html"];
      if (!index || index.type !== "asset") return;
      const base = String(index.source);
      const c = readContent();
      const today = new Date().toISOString().slice(0, 10);

      c.projects.forEach((p, i) => {
        this.emitFile({ type: "asset", fileName: `projet/${p.slug}/index.html`, source: pageFor(base, p, i, c.projects.length) });
      });

      const urls = [`${SITE}/`, ...c.projects.map((p) => `${SITE}/projet/${p.slug}`)];
      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
          .map((u, i) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod><priority>${i === 0 ? "1.0" : "0.7"}</priority></url>`)
          .join("\n")}\n</urlset>\n`,
      });
      this.emitFile({
        type: "asset",
        fileName: "robots.txt",
        source: `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITE}/sitemap.xml\n`,
      });
    },
  };
}
