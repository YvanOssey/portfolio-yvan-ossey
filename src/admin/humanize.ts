// Traduit les chemins techniques de la validation (« contenu.projects[3].site ») en français lisible.
import type { SiteContent } from "../data/schema";

const FIELDS: Record<string, string> = {
  slug: "Identifiant", kinds: "Catégories", title: "Titre", type: "Type", status: "Statut", year: "Année",
  short: "Résumé", image: "Capture", src: "Fichier", url: "Adresse affichée", caption: "Légende", position: "Cadrage",
  alt: "Description de l’image", site: "Lien du site", github: "Lien GitHub", intro: "Introduction",
  description: "Description", stack: "Stack", signature: "Phrase surlignée", audiences: "Pour qui",
  features: "Fonctionnalités", architecture: "Architecture", security: "Sécurité", role: "Mon rôle", roleTitle: "Intitulé du rôle",
  items: "Éléments", color: "Couleur", about: "Présentation", facts: "Infos clés", experience: "Expérience",
  date: "Période", org: "Structure", formation: "Formation", when: "Période", what: "Diplôme", where: "Établissement",
  certifications: "Certifications", name: "Intitulé", qualities: "Qualités", cvUpdated: "Date du CV", lede: "Phrase d’accueil",
  email: "E-mail", phone: "Téléphone", phoneLabel: "Téléphone affiché", linkedin: "Lien LinkedIn", linkedinLabel: "LinkedIn affiché",
  githubLabel: "GitHub affiché", city: "Ville", country: "Pays", commonTools: "Outils communs",
};
const SECTIONS: Record<string, string> = { hero: "Accueil", skills: "Compétences", parcours: "Parcours", contact: "Contact" };

export function humanize(error: string, content: SiteContent): string {
  const [path, ...rest] = error.split(" : ");
  const message = rest.join(" : ");
  const parts = path.replace(/^contenu\.?/, "").split(".").filter(Boolean);
  const out: string[] = [];
  for (const part of parts) {
    const m = part.match(/^(\w+)(?:\[(\d+)\])?(.*)$/);
    if (!m) { out.push(part); continue; }
    const [, key, index, tail] = m;
    if (key === "projects" && index) out.push(`Projet « ${content.projects[Number(index) - 1]?.title ?? index} »`);
    else if (key === "projects") out.push("Projets");
    else if (key === "skills" && index) out.push(`Groupe « ${content.skills[Number(index) - 1]?.title ?? index} »`);
    else out.push(`${SECTIONS[key] ?? FIELDS[key] ?? key}${index ? ` n°${index}` : ""}${tail}`);
  }
  return `${out.join(" › ") || "Contenu"} : ${message}`;
}
