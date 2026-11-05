/**
 * Forme du contenu modifiable du portfolio (src/data/content.json).
 * Partagée par le site, l'espace admin et l'API d'enregistrement (api/content.ts),
 * qui refuse tout contenu qui ne passe pas validateContent().
 */

export const KINDS = ["web", "mobile", "fullstack"] as const;
export const STATUSES = ["1er prix", "En ligne", "En cours", "Académique", "Réalisé"] as const;

export type ProjectKind = (typeof KINDS)[number];
export type ProjectStatus = (typeof STATUSES)[number];

export interface ProjectImage {
  src: string;
  /** Adresse affichée dans la fenêtre de navigateur dessinée (sites uniquement) */
  url?: string;
  caption?: string;
  position: string;
  alt: string;
}

export interface Project {
  slug: string;
  kinds: ProjectKind[];
  title: string;
  type: string;
  status: ProjectStatus;
  year: string;
  short: string;
  image?: ProjectImage | null;
  site?: string;
  github?: string;
  intro: string;
  description: string;
  stack: string[];
  signature: string;
  audiences: string;
  features: string[];
  architecture: [label: string, value: string][];
  security?: string;
  role: string;
  /** Rôle précis affiché dans la fiche technique, si différent de « développeur » */
  roleTitle?: string;
}

export interface SkillGroup {
  title: string;
  color: string;
  items: string[];
}

export interface Parcours {
  /** Paragraphes de présentation ; **gras** autorisé, « 1er » passe en exposant */
  about: string[];
  facts: [label: string, value: string][];
  experience: { title: string; date: string; org: string; items: [label: string, text: string][] };
  formation: { when: string; what: string; where: string }[];
  certifications: { name: string; org: string }[];
  qualities: string[];
  cvUpdated: string;
}

export interface Contact {
  email: string;
  /** Format international sans espaces, ex. +2250767214818 */
  phone: string;
  phoneLabel: string;
  linkedin: string;
  linkedinLabel: string;
  github: string;
  githubLabel: string;
  city: string;
  country: string;
}

export interface SiteContent {
  hero: { lede: string };
  projects: Project[];
  skills: SkillGroup[];
  /** Outils utilisés dans tous les projets (ex. GitHub, Figma) : leur touche compte chaque projet */
  commonTools?: string[];
  parcours: Parcours;
  contact: Contact;
}

/* ---------------------------------------------------------------- validation */

const MAX_TEXT = 4000;

type Check = (v: unknown, path: string, errors: string[]) => void;

const str = (opts: { optional?: boolean; max?: number; pattern?: RegExp; empty?: boolean } = {}): Check =>
  (v, path, errors) => {
    if (v === undefined || v === null || v === "") {
      if (!opts.optional && !(opts.empty && v === "")) errors.push(`${path} : champ obligatoire`);
      return;
    }
    if (typeof v !== "string") { errors.push(`${path} : texte attendu`); return; }
    if (v.length > (opts.max ?? MAX_TEXT)) errors.push(`${path} : trop long`);
    if (opts.pattern && !opts.pattern.test(v)) errors.push(`${path} : format invalide`);
  };

const list = (item: Check, opts: { min?: number; max?: number } = {}): Check => (v, path, errors) => {
  if (!Array.isArray(v)) { errors.push(`${path} : liste attendue`); return; }
  if (v.length < (opts.min ?? 0)) errors.push(`${path} : au moins ${opts.min} élément(s)`);
  if (v.length > (opts.max ?? 60)) errors.push(`${path} : trop d’éléments`);
  v.forEach((x, i) => item(x, `${path}[${i + 1}]`, errors));
};

const pair: Check = (v, path, errors) => {
  if (!Array.isArray(v) || v.length !== 2) { errors.push(`${path} : paire « libellé / valeur » attendue`); return; }
  str({ max: 200 })(v[0], `${path} libellé`, errors);
  str()(v[1], `${path} valeur`, errors);
};

const obj = (shape: Record<string, Check>): Check => (v, path, errors) => {
  if (!v || typeof v !== "object" || Array.isArray(v)) { errors.push(`${path} : objet attendu`); return; }
  const o = v as Record<string, unknown>;
  for (const k of Object.keys(o)) if (!(k in shape)) errors.push(`${path}.${k} : champ inconnu`);
  for (const [k, check] of Object.entries(shape)) check(o[k], `${path}.${k}`, errors);
};

const oneOf = <T extends string>(values: readonly T[]): Check => (v, path, errors) => {
  if (!values.includes(v as T)) errors.push(`${path} : valeur non autorisée`);
};

/** Liens externes : uniquement http(s), pour empêcher un lien javascript: dans la page */
const url = (optional = true) => str({ optional, max: 500, pattern: /^https?:\/\/[^\s"'<>]+$/ });
/** Captures : uniquement des fichiers du dossier img/ du site */
const imgPath = str({ max: 200, pattern: /^img\/[a-z0-9._-]+\.(jpe?g|png|webp)(\?v=\d+)?$/ });

const projectCheck = obj({
  slug: str({ max: 60, pattern: /^[a-z0-9]+(-[a-z0-9]+)*$/ }),
  kinds: list(oneOf(KINDS), { min: 1, max: 3 }),
  title: str({ max: 80 }),
  type: str({ max: 120 }),
  status: oneOf(STATUSES),
  year: str({ max: 9, pattern: /^\d{4}$/ }),
  short: str({ max: 400 }),
  image: (v, path, errors) => {
    if (v === undefined || v === null) return;
    obj({
      src: imgPath,
      url: str({ optional: true, max: 120, pattern: /^[^\s"'<>]+$/ }),
      caption: str({ optional: true, max: 200 }),
      position: str({ max: 40, pattern: /^[a-z0-9% ]+$/ }),
      alt: str({ max: 300 }),
    })(v, path, errors);
  },
  site: url(),
  github: url(),
  intro: str({ max: 600 }),
  description: str(),
  stack: list(str({ max: 40 }), { min: 1, max: 20 }),
  signature: str({ max: 200 }),
  audiences: str({ max: 800 }),
  features: list(str({ max: 400 }), { min: 1, max: 15 }),
  architecture: list(pair, { min: 1, max: 15 }),
  security: str({ optional: true }),
  role: str({ max: 1200 }),
  roleTitle: str({ optional: true, max: 80 }),
});

const contentCheck = obj({
  hero: obj({ lede: str({ max: 400 }) }),
  projects: list(projectCheck, { min: 1, max: 40 }),
  skills: list(obj({
    title: str({ max: 60 }),
    color: str({ max: 9, pattern: /^#[0-9a-fA-F]{6}$/ }),
    items: list(str({ max: 40 }), { min: 1, max: 30 }),
  }), { min: 1, max: 10 }),
  commonTools: (v, path, errors) => { if (v !== undefined) list(str({ max: 40 }), { max: 15 })(v, path, errors); },
  parcours: obj({
    about: list(str({ max: 1200 }), { min: 1, max: 6 }),
    facts: list(pair, { max: 8 }),
    experience: obj({
      title: str({ max: 120 }),
      date: str({ max: 60 }),
      org: str({ max: 120 }),
      items: list(pair, { min: 1, max: 10 }),
    }),
    formation: list(obj({ when: str({ max: 40 }), what: str({ max: 120 }), where: str({ max: 160 }) }), { max: 10 }),
    certifications: list(obj({ name: str({ max: 160 }), org: str({ max: 160 }) }), { max: 20 }),
    qualities: list(str({ max: 40 }), { max: 12 }),
    cvUpdated: str({ max: 40 }),
  }),
  contact: obj({
    email: str({ max: 120, pattern: /^[^\s@<>"']+@[^\s@<>"']+\.[a-z]{2,}$/i }),
    phone: str({ max: 20, pattern: /^\+\d{8,15}$/ }),
    phoneLabel: str({ max: 30 }),
    linkedin: url(false),
    linkedinLabel: str({ max: 60 }),
    github: url(false),
    githubLabel: str({ max: 60 }),
    city: str({ max: 80 }),
    country: str({ max: 80 }),
  }),
});

export function validateContent(v: unknown): string[] {
  const errors: string[] = [];
  contentCheck(v, "contenu", errors);
  if (errors.length === 0) {
    const slugs = (v as SiteContent).projects.map((p) => p.slug);
    const dup = slugs.find((s, i) => slugs.indexOf(s) !== i);
    if (dup) errors.push(`contenu.projects : l’identifiant « ${dup} » est utilisé deux fois`);
  }
  return errors;
}
