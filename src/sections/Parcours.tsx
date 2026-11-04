import { useEffect, useRef } from "react";
import { useReveal } from "../hooks/useReveal";
import { reduced, type CSSVars } from "../lib/util";
import { CONTENT } from "../data/projects";
import { Rich } from "../components/Rich";

const P = CONTENT.parcours;

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

const TILTS = [-3, 2, -1.5, 3.5, -2.5, 1.5];

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
        {P.formation.map((f) => <li key={f.what}><span>{f.when}</span><b>{f.what}</b><small>{f.where}</small></li>)}
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
          {P.about.map((t, i) => <p key={i}><Rich text={t} /></p>)}
          <dl className="facts">
            {P.facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
        </div>
      </div>

      <div className="cv-grid" ref={grid}>
        <article className="xp">
          <p className="label">Expérience</p>
          <div className="xp-head">
            <h3>{P.experience.title}</h3>
            <span className="xp-date">{P.experience.date}</span>
          </div>
          <p className="xp-org">{P.experience.org}</p>
          <ul className="xp-list">
            {P.experience.items.map(([k, v]) => <li key={k}><b>{k}</b> {v}</li>)}
          </ul>
        </article>

        <div className="cv-side">
          <Timeline />
          <div className="tl">
            <p className="label">Certifications</p>
            <ul className="certs">
              {P.certifications.map((c) => <li key={c.name}><b>{c.name}</b><small><Rich text={c.org} /></small></li>)}
            </ul>
          </div>
          <ul className="qualities" aria-label="Qualités">
            {P.qualities.map((q, i) => (
              <li key={q} style={{ "--q": i, "--rq": `${TILTS[i % TILTS.length]}deg` } as CSSVars}>{q}</li>
            ))}
          </ul>
        </div>
      </div>

      <a className="cv-strip" href="cv/CV_Yvan_Ossey.pdf" target="_blank" rel="noopener">
        <span className="label">Le CV complet</span>
        <strong>Voir mon CV <span aria-hidden="true">↗</span></strong>
        <small>PDF · 1 page · mis à jour en {P.cvUpdated}</small>
      </a>
    </section>
  );
}
