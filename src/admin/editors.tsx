// Éditeurs de chaque partie du contenu. Chacun reçoit la valeur et une fonction pour la remplacer.
import { useState } from "react";
import { KINDS, STATUSES, type Contact, type Parcours, type Project, type SiteContent, type SkillGroup } from "../data/schema";
import { Area, Field, ListArea, Text } from "./fields";
import { imageToJpegBase64 } from "./api";

export type Pending = Record<string, { base64: string; dataUrl: string }>;

const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "projet";

export function newProject(existing: Project[]): Project {
  let slug = "nouveau-projet";
  for (let i = 2; existing.some((p) => p.slug === slug); i++) slug = `nouveau-projet-${i}`;
  return {
    slug, kinds: ["web"], title: "Nouveau projet", type: "", status: "En cours", year: String(new Date().getFullYear()),
    short: "", image: null, intro: "", description: "", stack: [], signature: "", audiences: "",
    features: [], architecture: [], role: "",
  };
}

/* ------------------------------------------------------------------ Projets */

export function ProjectsEditor({ projects, onChange, pending, setPending }: {
  projects: Project[]; onChange: (p: Project[]) => void; pending: Pending; setPending: (p: Pending) => void;
}) {
  const [sel, setSel] = useState(0);
  const i = Math.min(sel, projects.length - 1);
  const p = projects[i];

  const set = (patch: Partial<Project>) => onChange(projects.map((x, k) => (k === i ? { ...x, ...patch } : x)));
  const move = (dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= projects.length) return;
    const next = [...projects];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
    setSel(j);
  };
  const remove = () => {
    if (projects.length <= 1) return;
    if (!confirm(`Supprimer « ${p.title} » du portfolio ?`)) return;
    onChange(projects.filter((_, k) => k !== i));
    setSel(Math.max(0, i - 1));
  };
  const add = () => {
    onChange([...projects, newProject(projects)]);
    setSel(projects.length);
  };

  const onImage = async (file: File | undefined) => {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { alert("Choisissez une image JPEG, PNG ou WebP."); return; }
    const { base64, dataUrl } = await imageToJpegBase64(file);
    const name = `${slugify(p.slug)}.jpg`;
    setPending({ ...pending, [name]: { base64, dataUrl } });
    set({
      image: {
        src: `img/${name}?v=${Date.now()}`,
        position: p.image?.position || "center top",
        alt: p.image?.alt || `Capture du projet ${p.title}`,
        caption: p.image?.caption,
        url: p.image?.url,
      },
    });
  };

  const imgName = p.image?.src.replace(/^img\//, "").replace(/\?.*$/, "");
  const preview = imgName && pending[imgName] ? pending[imgName].dataUrl : p.image?.src;

  return (
    <div className="ad-split">
      <aside className="ad-list">
        <ol>
          {projects.map((x, k) => (
            <li key={x.slug + k}>
              <button type="button" className={k === i ? "on" : ""} onClick={() => setSel(k)}>
                <span>{String(k + 1).padStart(2, "0")}</span>{x.title}
              </button>
            </li>
          ))}
        </ol>
        <div className="ad-list-acts">
          <button type="button" onClick={() => move(-1)} disabled={i === 0} aria-label="Monter">↑</button>
          <button type="button" onClick={() => move(1)} disabled={i === projects.length - 1} aria-label="Descendre">↓</button>
          <button type="button" onClick={add}>+ Ajouter</button>
        </div>
      </aside>

      <div className="ad-form">
        <div className="ad-row">
          <Text label="Titre" required value={p.title} onChange={(v) => set({ title: v })} />
          <Text label="Identifiant (adresse)" required value={p.slug} onChange={(v) => set({ slug: slugify(v) })}
            hint={<>Page : <code>#/projet/{p.slug}</code></>} />
        </div>
        <div className="ad-row">
          <Text label="Type" required value={p.type} onChange={(v) => set({ type: v })} placeholder="Application web de…" />
          <Field label="Statut">
            {(id) => (
              <select id={id} value={p.status} onChange={(e) => set({ status: e.target.value as Project["status"] })}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            )}
          </Field>
          <Text label="Année" required value={p.year} onChange={(v) => set({ year: v })} />
        </div>
        <fieldset className="ad-checks">
          <legend>Catégories</legend>
          {KINDS.map((k) => (
            <label key={k}>
              <input type="checkbox" checked={p.kinds.includes(k)}
                onChange={(e) => set({ kinds: e.target.checked ? [...p.kinds, k] : p.kinds.filter((x) => x !== k) })} />
              {k}
            </label>
          ))}
        </fieldset>

        <Area label="Résumé (fiche)" required rows={2} value={p.short} onChange={(v) => set({ short: v })} />

        <section className="ad-box">
          <h3>Capture</h3>
          <div className="ad-img">
            {preview ? <img src={preview} alt="" /> : <div className="ad-img-empty">Aucune capture : une carte « capture à venir » s’affiche.</div>}
            <div>
              <Field label="Nouvelle image" hint="JPEG, PNG ou WebP. Elle est redimensionnée et compressée automatiquement.">
                {(id) => <input id={id} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => onImage(e.target.files?.[0])} />}
              </Field>
              {p.image && (
                <>
                  <Text label="Description de l’image (accessibilité)" required value={p.image.alt} onChange={(v) => set({ image: { ...p.image!, alt: v } })} />
                  <Text label="Légende" value={p.image.caption} onChange={(v) => set({ image: { ...p.image!, caption: v || undefined } })} />
                  <div className="ad-row">
                    <Text label="Adresse affichée" value={p.image.url} onChange={(v) => set({ image: { ...p.image!, url: v || undefined } })}
                      hint="Sites uniquement, ex. monsite.com : dessine une fenêtre de navigateur." />
                    <Text label="Cadrage" value={p.image.position} onChange={(v) => set({ image: { ...p.image!, position: v } })}
                      hint="center top, left top, center…" />
                  </div>
                  <button type="button" className="ad-link" onClick={() => set({ image: null })}>Retirer la capture</button>
                </>
              )}
            </div>
          </div>
        </section>

        <div className="ad-row">
          <Text label="Lien du site" value={p.site} onChange={(v) => set({ site: v || undefined })} placeholder="https://…" />
          <Text label="Lien GitHub" value={p.github} onChange={(v) => set({ github: v || undefined })} placeholder="https://github.com/…" />
        </div>

        <Area label="Introduction (page projet)" required rows={2} value={p.intro} onChange={(v) => set({ intro: v })} />
        <Area label="Description" required rows={5} value={p.description} onChange={(v) => set({ description: v })} />
        <Text label="Phrase surlignée" required value={p.signature} onChange={(v) => set({ signature: v })} />
        <Area label="Pour qui" required rows={2} value={p.audiences} onChange={(v) => set({ audiences: v })} />
        <ListArea mode="csv" label="Stack *" value={p.stack} onChange={(v: string[]) => set({ stack: v })}
          hint="Séparées par des virgules. Les noms identiques à ceux de l’onglet Compétences allument les touches du clavier." />
        <ListArea mode="lines" label="Fonctionnalités *" rows={5} value={p.features} onChange={(v: string[]) => set({ features: v })} hint="Une par ligne." />
        <ListArea mode="pairs" label="Architecture *" rows={5} value={p.architecture} onChange={(v: [string, string][]) => set({ architecture: v })}
          hint="Une par ligne, sous la forme « Frontend : React, Vite »." />
        <Area label="Sécurité" rows={2} value={p.security} onChange={(v) => set({ security: v || undefined })} />
        <Area label="Mon rôle" required rows={3} value={p.role} onChange={(v) => set({ role: v })} />
        <Text label="Intitulé du rôle" value={p.roleTitle} onChange={(v) => set({ roleTitle: v || undefined })} hint="Facultatif, ex. « Chef de projet & développeur »." />

        <button type="button" className="ad-danger" onClick={remove} disabled={projects.length <= 1}>Supprimer ce projet</button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- Compétences */

export function SkillsEditor({ skills, onChange, common, onCommon }: {
  skills: SkillGroup[]; onChange: (s: SkillGroup[]) => void; common: string[]; onCommon: (c: string[]) => void;
}) {
  const set = (i: number, patch: Partial<SkillGroup>) => onChange(skills.map((g, k) => (k === i ? { ...g, ...patch } : g)));
  return (
    <div className="ad-stack">
      <section className="ad-box">
        <h3>Outils utilisés dans tous les projets</h3>
        <ListArea mode="csv" label="Outils communs" value={common} onChange={(v: string[]) => onCommon(v)}
          hint="Séparés par des virgules, ex. GitHub, Figma. Leur touche du clavier affiche alors tous les projets." />
      </section>
      {skills.map((g, i) => (
        <section className="ad-box" key={i}>
          <div className="ad-row">
            <Text label="Groupe" value={g.title} onChange={(v) => set(i, { title: v })} />
            <Field label="Couleur">
              {(id) => <input id={id} type="color" value={g.color} onChange={(e) => set(i, { color: e.target.value })} />}
            </Field>
          </div>
          <ListArea mode="csv" label="Touches" value={g.items} onChange={(v: string[]) => set(i, { items: v })} hint="Séparées par des virgules." />
          <button type="button" className="ad-link" onClick={() => onChange(skills.filter((_, k) => k !== i))} disabled={skills.length <= 1}>Supprimer ce groupe</button>
        </section>
      ))}
      <button type="button" onClick={() => onChange([...skills, { title: "Nouveau groupe", color: "#5d84b6", items: ["Outil"] }])}>+ Ajouter un groupe</button>
    </div>
  );
}

/* ---------------------------------------------------------------- Parcours */

export function ParcoursEditor({ value: v, onChange }: { value: Parcours; onChange: (p: Parcours) => void }) {
  const set = (patch: Partial<Parcours>) => onChange({ ...v, ...patch });
  const xp = v.experience;
  return (
    <div className="ad-stack">
      <section className="ad-box">
        <h3>Présentation</h3>
        {v.about.map((t, i) => (
          <Area key={i} label={`Paragraphe ${i + 1}`} rows={4} value={t}
            onChange={(x) => set({ about: v.about.map((y, k) => (k === i ? x : y)) })}
            hint={i === 0 ? <>Mettre un mot en gras : <code>**mot**</code>. « 1er » passe en exposant tout seul.</> : undefined} />
        ))}
        <ListArea mode="pairs" label="Infos clés" value={v.facts} onChange={(x: [string, string][]) => set({ facts: x })} hint="« Basé à : Cocody, Abidjan », une par ligne." />
      </section>
      <section className="ad-box">
        <h3>Expérience</h3>
        <div className="ad-row">
          <Text label="Poste" value={xp.title} onChange={(x) => set({ experience: { ...xp, title: x } })} />
          <Text label="Période" value={xp.date} onChange={(x) => set({ experience: { ...xp, date: x } })} />
        </div>
        <Text label="Structure" value={xp.org} onChange={(x) => set({ experience: { ...xp, org: x } })} />
        <ListArea mode="pairs" label="Missions" rows={5} value={xp.items} onChange={(x: [string, string][]) => set({ experience: { ...xp, items: x } })}
          hint="« Pilotage : analyse des besoins… », une par ligne." />
      </section>
      <section className="ad-box">
        <h3>Formation</h3>
        {v.formation.map((f, i) => (
          <div className="ad-row" key={i}>
            <Text label="Période" value={f.when} onChange={(x) => set({ formation: v.formation.map((y, k) => (k === i ? { ...y, when: x } : y)) })} />
            <Text label="Diplôme" value={f.what} onChange={(x) => set({ formation: v.formation.map((y, k) => (k === i ? { ...y, what: x } : y)) })} />
            <Text label="Établissement" value={f.where} onChange={(x) => set({ formation: v.formation.map((y, k) => (k === i ? { ...y, where: x } : y)) })} />
            <button type="button" className="ad-x" aria-label="Retirer" onClick={() => set({ formation: v.formation.filter((_, k) => k !== i) })}>✕</button>
          </div>
        ))}
        <button type="button" onClick={() => set({ formation: [{ when: "", what: "", where: "" }, ...v.formation] })}>+ Ajouter une formation</button>
      </section>
      <section className="ad-box">
        <h3>Certifications</h3>
        {v.certifications.map((c, i) => (
          <div className="ad-row" key={i}>
            <Text label="Intitulé" value={c.name} onChange={(x) => set({ certifications: v.certifications.map((y, k) => (k === i ? { ...y, name: x } : y)) })} />
            <Text label="Organisme" value={c.org} onChange={(x) => set({ certifications: v.certifications.map((y, k) => (k === i ? { ...y, org: x } : y)) })} />
            <button type="button" className="ad-x" aria-label="Retirer" onClick={() => set({ certifications: v.certifications.filter((_, k) => k !== i) })}>✕</button>
          </div>
        ))}
        <button type="button" onClick={() => set({ certifications: [...v.certifications, { name: "", org: "" }] })}>+ Ajouter une certification</button>
      </section>
      <section className="ad-box">
        <h3>Qualités et CV</h3>
        <ListArea mode="csv" label="Qualités (autocollants)" value={v.qualities} onChange={(x: string[]) => set({ qualities: x })} />
        <Text label="CV mis à jour en" value={v.cvUpdated} onChange={(x) => set({ cvUpdated: x })} />
      </section>
    </div>
  );
}

/* ------------------------------------------------------- Accueil et contact */

export function ContactEditor({ content, onChange }: { content: SiteContent; onChange: (c: SiteContent) => void }) {
  const c = content.contact;
  const set = (patch: Partial<Contact>) => onChange({ ...content, contact: { ...c, ...patch } });
  return (
    <div className="ad-stack">
      <section className="ad-box">
        <h3>Accueil</h3>
        <Area label="Phrase sous le titre" rows={2} value={content.hero.lede} onChange={(v) => onChange({ ...content, hero: { lede: v } })} />
      </section>
      <section className="ad-box">
        <h3>Contact</h3>
        <div className="ad-row">
          <Text label="E-mail" value={c.email} onChange={(v) => set({ email: v })} />
          <Text label="Téléphone (format international)" value={c.phone} onChange={(v) => set({ phone: v.replace(/[^\d+]/g, "") })} hint="Ex. +2250767214818 — sert aussi pour WhatsApp." />
          <Text label="Téléphone affiché" value={c.phoneLabel} onChange={(v) => set({ phoneLabel: v })} />
        </div>
        <div className="ad-row">
          <Text label="Lien LinkedIn" value={c.linkedin} onChange={(v) => set({ linkedin: v })} />
          <Text label="LinkedIn affiché" value={c.linkedinLabel} onChange={(v) => set({ linkedinLabel: v })} />
        </div>
        <div className="ad-row">
          <Text label="Lien GitHub" value={c.github} onChange={(v) => set({ github: v })} />
          <Text label="GitHub affiché" value={c.githubLabel} onChange={(v) => set({ githubLabel: v })} />
        </div>
        <div className="ad-row">
          <Text label="Ville" value={c.city} onChange={(v) => set({ city: v })} />
          <Text label="Pays" value={c.country} onChange={(v) => set({ country: v })} />
        </div>
      </section>
    </div>
  );
}
