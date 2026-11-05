import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { PROJECTS } from "./data/projects";
import { Header, Footer } from "./components/Header";
import { Hero } from "./sections/Hero";
import { Pile } from "./sections/Pile";
import { Parcours } from "./sections/Parcours";
import { Stack } from "./sections/Stack";
import { Contact } from "./sections/Contact";
import { ProjectPage } from "./pages/ProjectPage";
import { useHighlights } from "./hooks/useReveal";
import { reduced } from "./lib/util";
import { track } from "./lib/track";

// Chargé seulement quand on ouvre #/admin : les visiteurs ne téléchargent pas l'espace admin
const AdminPage = lazy(() => import("./admin/AdminPage"));

/** Vue affichée : l'accueil, la page d'un projet (#/projet/slug) ou l'espace admin (#/admin) */
type View = { kind: "home" } | { kind: "admin" } | { kind: "project"; slug: string };

const HOME_TITLE = "Yvan Ossey — Développeur full-stack web & mobile à Abidjan";
const parseHash = (hash: string): View => {
  if (/^#\/admin/.test(hash)) return { kind: "admin" };
  const m = hash.match(/^#\/projet\/([\w-]+)/);
  return m && PROJECTS.some((p) => p.slug === m[1]) ? { kind: "project", slug: m[1] } : { kind: "home" };
};
const sameView = (a: View, b: View) => a.kind === b.kind && (a.kind !== "project" || a.slug === (b as typeof a).slug);

function Home({ hidden }: { hidden: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useHighlights(ref);
  return (
    <div id="home" ref={ref} hidden={hidden}>
      <Hero />
      <Pile />
      <Parcours />
      <Stack />
      <Contact />
    </div>
  );
}

export default function App() {
  // /projet/<slug> (page générée pour les moteurs de recherche) ouvre la même fiche que #/projet/<slug>
  const [view, setView] = useState<View>(() => {
    const path = location.pathname.match(/^\/projet\/([\w-]+)/);
    return parseHash(location.hash || (path ? `#/projet/${path[1]}` : ""));
  });
  const wipeRef = useRef<HTMLDivElement>(null);
  const wipeTitleRef = useRef<HTMLSpanElement>(null);
  const current = useRef(view);
  const busy = useRef(false);
  const pending = useRef(false);

  useEffect(() => {
    // Coup de surligneur plein écran : la bande bleue couvre la page, on change de vue, elle repart
    async function wipe(title: string, swap: () => void) {
      const el = wipeRef.current!, label = wipeTitleRef.current!;
      if (reduced) { swap(); return; }
      busy.current = true;
      label.textContent = title;
      const ease = "cubic-bezier(.76,0,.24,1)";
      label.animate([{ opacity: 0, transform: "translateX(-24px)" }, { opacity: 1, transform: "none" }], { duration: 380, delay: 300, easing: "cubic-bezier(.22,1,.36,1)", fill: "both" });
      await el.animate([{ transform: "scaleX(0)", transformOrigin: "left" }, { transform: "scaleX(1)", transformOrigin: "left" }], { duration: 520, easing: ease, fill: "forwards" }).finished;
      swap();
      await el.animate([{ transform: "scaleX(1)", transformOrigin: "right" }, { transform: "scaleX(0)", transformOrigin: "right" }], { duration: 560, delay: 260, easing: ease, fill: "forwards" }).finished;
      el.getAnimations().forEach((a) => a.cancel());
      label.getAnimations().forEach((a) => a.cancel());
      busy.current = false;
      if (pending.current) { pending.current = false; route(); }
    }

    function route() {
      if (busy.current) { pending.current = true; return; }
      const hash = location.hash;
      const next = parseHash(hash);
      if (sameView(next, current.current)) {
        if (next.kind === "home" && hash === "#/") scrollTo({ top: 0 });
        return;
      }
      current.current = next;
      if (next.kind === "project") track({ type: "project", slug: next.slug });
      const title = next.kind === "project" ? PROJECTS.find((p) => p.slug === next.slug)!.title : next.kind === "admin" ? "Espace admin" : "Yvan Ossey";
      wipe(title, () => {
        // la nouvelle vue doit être dans le DOM avant de défiler vers une ancre
        flushSync(() => setView(next));
        if (next.kind === "home") {
          const target = hash.length > 2 ? document.querySelector(hash) : null;
          if (target) target.scrollIntoView({ behavior: "instant" });
          else scrollTo({ top: 0, behavior: "instant" });
        } else {
          scrollTo({ top: 0, behavior: "instant" });
        }
      });
    }

    if (current.current.kind === "project") track({ type: "project", slug: current.current.slug });
    addEventListener("hashchange", route);
    return () => removeEventListener("hashchange", route);
  }, []);

  useEffect(() => {
    document.title = view.kind === "project"
      ? (({ title, type }) => `${title} — ${type} | Yvan Ossey`)(PROJECTS.find((p) => p.slug === view.slug)!)
      : view.kind === "admin" ? "Espace admin — Yvan Ossey" : HOME_TITLE;
  }, [view]);

  const project = view.kind === "project" ? PROJECTS.find((p) => p.slug === view.slug)! : null;

  return (
    <>
      <a className="skip" href="#travail">Aller aux projets</a>
      <Header />
      {/* L'accueil reste monté (caché) pendant la lecture d'une fiche : on retrouve sa position au retour */}
      <Home hidden={view.kind !== "home"} />
      {project && <ProjectPage key={project.slug} project={project} />}
      {view.kind === "admin" && (
        <Suspense fallback={<main className="admin"><p className="ad-wait">Chargement…</p></main>}>
          <AdminPage />
        </Suspense>
      )}
      <Footer />
      <div className="wipe" id="wipe" aria-hidden="true" ref={wipeRef}><span id="wipe-title" ref={wipeTitleRef} /></div>
    </>
  );
}
