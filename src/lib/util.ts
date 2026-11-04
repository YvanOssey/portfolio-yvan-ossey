import { PROJECTS, type Project, type ProjectStatus } from "../data/projects";

export const reduced =
  typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

export const pad = (n: number) => String(n).padStart(2, "0");

export const TOTAL = PROJECTS.length;

/** Statuts mis en avant par un tampon bleu, les autres sont grisés */
const HOT: ReadonlySet<ProjectStatus> = new Set(["1er prix", "En ligne"]);
export const stampClass = (p: Project) => `stamp ${HOT.has(p.status) ? "" : "muted"}`;

/** « Next.js 15 » et « Next.js » désignent la même touche du clavier */
const techKey = (s: string) => s.toLowerCase().replace(/[^a-z0-9.]+/g, " ").trim().split(" ")[0];
export const usedIn = (tech: string) =>
  PROJECTS.filter((p) => p.stack.some((s) => techKey(s) === techKey(tech)));

export const pause = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Style React avec variables CSS personnalisées (--x) */
export type CSSVars = React.CSSProperties & Record<`--${string}`, string | number>;
