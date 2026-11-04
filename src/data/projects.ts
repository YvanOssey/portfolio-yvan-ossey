// Le contenu du portfolio vit dans content.json : il se modifie depuis l'espace admin (#/admin)
// ou directement dans le fichier. Les types et la validation sont dans schema.ts.
import raw from "./content.json";
import type { SiteContent } from "./schema";

export type { Contact, Parcours, Project, ProjectImage, ProjectKind, ProjectStatus, SiteContent, SkillGroup } from "./schema";

export const CONTENT = raw as SiteContent;
export const PROJECTS = CONTENT.projects;
export const SKILLS = CONTENT.skills;
