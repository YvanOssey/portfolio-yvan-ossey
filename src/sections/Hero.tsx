import { useEffect, useRef } from "react";
import { Deck } from "./Deck";
import { pad, reduced, TOTAL } from "../lib/util";

const CV = "cv/CV_Yvan_Ossey.pdf";

export function Hero() {
  const ref = useRef<HTMLElement>(null);

  // Le titre se surligne au chargement, mot après mot
  useEffect(() => {
    const marks = ref.current?.querySelectorAll("mark.hl") ?? [];
    const timers = [...marks].map((m, i) => setTimeout(() => m.classList.add("in"), reduced ? 0 : 650 + i * 300));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <section className="hero" id="hero" ref={ref}>
      <div className="hero-copy">
        <h1 className="headline">
          Je construis des <mark className="hl timed">applications</mark> qui règlent de <mark className="hl timed">vrais problèmes</mark> d’ici.
        </h1>
        <p className="lede">Ossey Yvan, développeur full-stack web &amp; mobile. De la maquette Figma au déploiement — React / Next.js, Node.js, Flutter, Supabase.</p>
        <div className="hero-actions">
          <a className="btn" href={CV} target="_blank" rel="noopener">Voir mon CV <span aria-hidden="true">↗</span></a>
          <a className="text-link" href={CV} download="CV_Yvan_Ossey.pdf">Télécharger le PDF ↓</a>
        </div>
        <dl className="ruler">
          <div><dt>Projets</dt><dd>{pad(TOTAL)}</dd></div>
          <div><dt>Formation</dt><dd>L3<small>MIAGE</small></dd></div>
          <div><dt>Hackathon</dt><dd>1<sup>er</sup><small>prix</small></dd></div>
        </dl>
        <p className="margin-note" aria-hidden="true">
          <span>attrapez une fiche<br />et lancez-la&nbsp;!</span>
          <svg className="scribble" viewBox="0 0 130 70"><path pathLength={1} d="M4 52c18 14 52 16 78-2 14-10 24-24 30-38" /><path className="head" pathLength={1} d="M98 14l15-6 4 16" /></svg>
        </p>
      </div>
      <Deck />
    </section>
  );
}
