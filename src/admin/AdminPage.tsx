// Espace admin (#/admin) : modifier le contenu du portfolio sans toucher au code.
// L'enregistrement crée un commit sur GitHub ; Vercel remet le site en ligne en une minute environ.
import { useEffect, useState, type FormEvent } from "react";
import type { SiteContent } from "../data/schema";
import { validateContent } from "../data/schema";
import { ApiError, fileToBase64, getSession, loadContent, login, logout, saveContent, type Upload } from "./api";
import { humanize } from "./humanize";
import { excludeThisBrowser } from "../lib/track";
import { StatsPanel } from "./Stats";
import { ContactEditor, ParcoursEditor, ProjectsEditor, SkillsEditor, type Pending } from "./editors";
import "./admin.css";

const TABS = [
  ["stats", "Statistiques"],
  ["projects", "Projets"],
  ["skills", "Compétences"],
  ["parcours", "Parcours"],
  ["contact", "Accueil & contact"],
  ["cv", "CV"],
] as const;
type Tab = (typeof TABS)[number][0];

type Status = { kind: "idle" } | { kind: "saving" } | { kind: "ok"; text: string } | { kind: "error"; text: string; details?: string[] };

function Login({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(password);
      excludeThisBrowser();
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Connexion impossible.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <form className="ad-login" onSubmit={submit}>
      <p className="label">Espace admin</p>
      <h1>Connexion</h1>
      <label htmlFor="ad-pw">Mot de passe</label>
      <input id="ad-pw" type="password" autoComplete="current-password" autoFocus value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <p className="ad-error" role="alert">{error}</p>}
      <button className="btn" type="submit" disabled={busy || !password}>{busy ? "Vérification…" : "Se connecter"}</button>
      <a className="text-link" href="#/">← Retour au portfolio</a>
    </form>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [draft, setDraft] = useState<SiteContent | null>(null);
  const [sha, setSha] = useState("");
  const [tab, setTab] = useState<Tab>("stats");
  const [pending, setPending] = useState<Pending>({});
  const [cv, setCv] = useState<{ name: string; base64: string } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  useEffect(() => {
    getSession().then((s) => { setAuthed(s.authenticated); if (s.authenticated) excludeThisBrowser(); }).catch(() => setAuthed(false));
  }, []);

  useEffect(() => {
    if (!authed) return;
    loadContent()
      .then(({ content, sha }) => { setDraft(content); setSha(sha); })
      .catch((e: ApiError) => {
        if (e.status === 401) setAuthed(false);
        else setStatus({ kind: "error", text: e.message });
      });
  }, [authed]);

  // Prévient avant de quitter la page avec des modifications non enregistrées
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    addEventListener("beforeunload", warn);
    return () => removeEventListener("beforeunload", warn);
  }, [dirty]);

  const update = (next: SiteContent) => { setDraft(next); setDirty(true); setStatus({ kind: "idle" }); };

  const save = async () => {
    if (!draft) return;
    // les listes se mettent à jour en quittant le champ : on laisse le navigateur valider la saisie en cours
    (document.activeElement as HTMLElement | null)?.blur();
    await new Promise((r) => setTimeout(r, 0));

    const errors = validateContent(draft);
    if (errors.length) { setStatus({ kind: "error", text: "Certaines informations sont à compléter ou à corriger.", details: errors.slice(0, 12).map((x) => humanize(x, draft)) }); return; }

    // seules les images encore utilisées sont envoyées
    const used = new Set(draft.projects.map((p) => p.image?.src.replace(/^img\//, "").replace(/\?.*$/, "")));
    const uploads: Upload[] = Object.entries(pending)
      .filter(([name]) => used.has(name))
      .map(([name, f]) => ({ kind: "image", name, base64: f.base64 }));
    if (cv) uploads.push({ kind: "cv", base64: cv.base64 });
    const size = uploads.reduce((n, u) => n + u.base64.length, 0);
    if (size > 4_000_000) {
      setStatus({ kind: "error", text: "Trop de fichiers d’un coup : enregistrez les images en plusieurs fois (4 Mo maximum par envoi)." });
      return;
    }

    setStatus({ kind: "saving" });
    try {
      const res = await saveContent(draft, sha, uploads);
      setSha(res.sha);
      setPending({});
      setCv(null);
      setDirty(false);
      setStatus({ kind: "ok", text: "Enregistré. Le site en ligne sera à jour dans une minute environ." });
    } catch (e) {
      const err = e as ApiError;
      if (err.status === 401) setAuthed(false);
      setStatus({ kind: "error", text: err.message, details: err.details.map((x) => humanize(x, draft)) });
    }
  };

  const signOut = async () => {
    if (dirty && !confirm("Des modifications ne sont pas enregistrées. Se déconnecter quand même ?")) return;
    await logout().catch(() => {});
    setAuthed(false);
    setDraft(null);
    setDirty(false);
  };

  if (authed === null) return <main className="admin"><p className="ad-wait">Chargement…</p></main>;
  if (!authed) return <main className="admin"><Login onDone={() => setAuthed(true)} /></main>;
  if (!draft) {
    return (
      <main className="admin">
        <p className="ad-wait">{status.kind === "error" ? status.text : "Chargement du contenu…"}</p>
      </main>
    );
  }

  return (
    <main className="admin">
      <header className="ad-head">
        <div>
          <p className="label">Espace admin</p>
          <h1>Modifier le portfolio</h1>
        </div>
        <div className="ad-head-acts">
          <a className="text-link" href="#/" target="_blank" rel="noopener">Voir le site ↗</a>
          <button type="button" className="ad-link" onClick={signOut}>Se déconnecter</button>
        </div>
      </header>

      <nav className="ad-tabs" aria-label="Parties du contenu">
        {TABS.map(([id, label]) => (
          <button key={id} type="button" aria-pressed={tab === id} onClick={() => setTab(id)}>{label}</button>
        ))}
      </nav>

      {tab === "stats" && <StatsPanel content={draft} />}
      {tab === "projects" && (
        <ProjectsEditor projects={draft.projects} onChange={(projects) => update({ ...draft, projects })}
          pending={pending} setPending={(p) => { setPending(p); setDirty(true); }} />
      )}
      {tab === "skills" && <SkillsEditor skills={draft.skills} onChange={(skills) => update({ ...draft, skills })} />}
      {tab === "parcours" && <ParcoursEditor value={draft.parcours} onChange={(parcours) => update({ ...draft, parcours })} />}
      {tab === "contact" && <ContactEditor content={draft} onChange={update} />}
      {tab === "cv" && (
        <section className="ad-box">
          <h3>CV en PDF</h3>
          <p>Le fichier envoyé remplace le CV actuel (boutons « Voir mon CV » et « Télécharger »). 2,5 Mo maximum.</p>
          <p><a className="text-link" href="cv/CV_Yvan_Ossey.pdf" target="_blank" rel="noopener">Ouvrir le CV actuel ↗</a></p>
          <input type="file" accept="application/pdf" onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            if (f.type !== "application/pdf" || f.size > 2_500_000) { alert("Choisissez un PDF de 2,5 Mo maximum."); e.target.value = ""; return; }
            setCv({ name: f.name, base64: await fileToBase64(f) });
            setDirty(true);
          }} />
          {cv && <p className="ad-ok">« {cv.name} » sera envoyé à l’enregistrement.</p>}
        </section>
      )}

      {/* rien à enregistrer sur l'onglet Statistiques : la barre ne s'affiche que s'il reste des modifications */}
      {(tab !== "stats" || dirty || status.kind !== "idle") && (
      <div className="ad-savebar" role="region" aria-label="Enregistrement">
        <p aria-live="polite" className={status.kind === "error" ? "ad-error" : status.kind === "ok" ? "ad-ok" : ""}>
          {status.kind === "saving" && "Enregistrement sur GitHub…"}
          {status.kind === "ok" && status.text}
          {status.kind === "error" && status.text}
          {status.kind === "idle" && (dirty ? "Modifications non enregistrées." : "Tout est enregistré.")}
        </p>
        {status.kind === "error" && status.details && status.details.length > 0 && (
          <ul className="ad-details">{status.details.map((d) => <li key={d}>{d}</li>)}</ul>
        )}
        <button className="btn" type="button" onClick={save} disabled={!dirty || status.kind === "saving"}>
          {status.kind === "saving" ? "Enregistrement…" : "Enregistrer et publier"}
        </button>
      </div>
      )}
    </main>
  );
}
