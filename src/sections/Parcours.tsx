import { useEffect, useRef } from "react";
import { useReveal } from "../hooks/useReveal";
import { reduced, type CSSVars } from "../lib/util";

/** Découpe un texte en mots numérotés : la citation s'écrit mot à mot (délai --w en CSS) */
function Words({ text, from }: { text: string; from: number }) {
  let k = from;
  return (
    <>
      {text.split(/(\s+)/).map((part, i) => {
        if (!part) return null;
        if (/^\s+$/.test(part)) return part;
        return <span key={i} className="w" style={{ "--w": k++ } as CSSVars}>{part}</span>;
      })}
    </>
  );
}

const countWords = (s: string) => s.split(/\s+/).filter(Boolean).length;

const QUOTE_START = "Je pars toujours d’un ";
const QUOTE_UNDERLINED = "vrai besoin";
const QUOTE_END = ", je prends le temps de le comprendre avant d’écrire une ligne de code, et je ne m’arrête que lorsque l’application sert vraiment à quelqu’un.";

function Quote() {
  const a = countWords(QUOTE_START);
  const b = countWords(QUOTE_UNDERLINED);
  // le soulignement se dessine juste après le dernier mot souligné
  const lastUnderlined = a + b - 1;
  return (
    <blockquote className="pull" style={{ "--ud": `${lastUnderlined * 42 + 500}ms` } as CSSVars}>
      <Words text={QUOTE_START} from={0} />
      <span className="scrib-u">
        <Words text={QUOTE_UNDERLINED} from={a} />
        <svg viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true"><path pathLength={1} d="M2 8c40-5 90-6 196-3" /></svg>
      </span>
      <Words text={QUOTE_END} from={a + b} />
    </blockquote>
  );
}

const QUALITIES = ["Autonome", "Autodidacte", "Rigoureux", "Créatif", "Curieux", "Esprit d’équipe"];
const TILTS = [-3, 2, -1.5, 3.5, -2.5, 1.5];

const FORMATION = [
  { when: "2026 — 2027", what: "Licence 3 MIAGE", where: "Université Polytechnique de Bingerville" },
  { when: "2023 — 2024", what: "Baccalauréat série D", where: "Lycée Municipal de Brobo" },
];

/** Frise de formation tracée au fil du défilement */
function Timeline() {
  const list = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const ol = list.current!;
    const items = [...ol.children] as HTMLLIElement[];
    if (reduced) { items.forEach((li) => li.classList.add("on")); return; }
    let raf = 0;
    const draw = () => {
      raf = 0;
      const r = ol.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.72 - r.top) / r.height));
      ol.style.setProperty("--tp", p.toFixed(3));
      items.forEach((li) => li.classList.toggle("on", (li.offsetTop + 10) / r.height <= p + 0.001));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(draw); };
    addEventListener("scroll", onScroll, { passive: true });
    draw();
    return () => { cancelAnimationFrame(raf); removeEventListener("scroll", onScroll); };
  }, []);

  return (
    <div className="tl">
      <p className="label">Formation</p>
      <ol ref={list}>
        {FORMATION.map((f) => <li key={f.what}><span>{f.when}</span><b>{f.what}</b><small>{f.where}</small></li>)}
      </ol>
    </div>
  );
}

export function Parcours() {
  const about = useReveal<HTMLDivElement>();
  const grid = useReveal<HTMLDivElement>();

  return (
    <section className="section about" id="parcours" aria-labelledby="parcours-title">
      <header className="sec-head">
        <p className="label">§ 02 — Parcours</p>
        <h2 id="parcours-title">Étudiant le jour, <mark className="hl">bâtisseur</mark> tout le temps.</h2>
      </header>
      <div className="about-grid" ref={about}>
        <Quote />
        <div className="about-copy">
          <p>Je m’appelle <b>Ossey Yvan Jean De Kenty</b>, étudiant en Licence 3 MIAGE à l’Université Polytechnique de Bingerville. Je conçois et livre des applications web et mobiles complètes, de la maquette Figma au déploiement.</p>
          <p>Plusieurs de mes projets sont en production, et l’un d’eux, KoumanPlay, a remporté le 1<sup>er</sup> prix d’un hackathon en 2026. J’encadre aussi une équipe de développeurs bénévoles. Je cherche à mettre ces compétences au service de projets concrets en entreprise.</p>
          <dl className="facts">
            <div><dt>Basé à</dt><dd>Cocody, Abidjan</dd></div>
            <div><dt>Rôle actuel</dt><dd>Resp. développeur full-stack</dd></div>
            <div><dt>Langues</dt><dd>Français · Anglais (notions)</dd></div>
          </dl>
        </div>
      </div>

      <div className="cv-grid" ref={grid}>
        <article className="xp">
          <p className="label">Expérience</p>
          <div className="xp-head">
            <h3>Responsable Développeur Full-Stack</h3>
            <span className="xp-date">2026 — aujourd’hui</span>
          </div>
          <p className="xp-org">Ghostech · engagement bénévole</p>
          <ul className="xp-list">
            <li><b>Pilotage</b> analyse des besoins, conception des solutions, répartition des tâches et suivi des développements.</li>
            <li><b>Développement</b> applications web et mobiles, outils internes et maintenance évolutive.</li>
            <li><b>Qualité</b> bonnes pratiques, revues de code, tests et documentation.</li>
            <li><b>Transmission</b> sessions de partage et accompagnement des développeurs débutants.</li>
          </ul>
        </article>

        <div className="cv-side">
          <Timeline />
          <div className="tl">
            <p className="label">Certifications</p>
            <ul className="certs">
              <li><b>Introduction à la cybersécurité</b><small>Cisco Networking Academy</small></li>
              <li><b>Full-Stack Development 101</b><small>Simplilearn</small></li>
              <li><b>Développement Front-End</b><small>NovaSavo</small></li>
              <li><b>Hack &amp; Train « Ponts Numériques »</b><small>Istorias Media — 1<sup>er</sup> prix</small></li>
              <li><b>Vibeathon 2026</b><small>Participation</small></li>
            </ul>
          </div>
          <ul className="qualities" aria-label="Qualités">
            {QUALITIES.map((q, i) => (
              <li key={q} style={{ "--q": i, "--rq": `${TILTS[i % TILTS.length]}deg` } as CSSVars}>{q}</li>
            ))}
          </ul>
        </div>
      </div>

      <a className="cv-strip" href="cv/CV_Yvan_Ossey.pdf" target="_blank" rel="noopener">
        <span className="label">Le CV complet</span>
        <strong>Voir mon CV <span aria-hidden="true">↗</span></strong>
        <small>PDF · 1 page · mis à jour en novembre 2026</small>
      </a>
    </section>
  );
}
