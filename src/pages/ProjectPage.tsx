import { useEffect, useRef, useState } from "react";
import { PROJECTS, type Project } from "../data/projects";
import { Shot } from "../components/Shot";
import { useHighlights } from "../hooks/useReveal";
import { pad, stampClass, TOTAL as n } from "../lib/util";

/** Zoom plein écran sur la capture */
function Lightbox({ image, onClose }: { image: { src: string; alt: string } | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  // <dialog> natif : showModal() gère le focus, la touche Échap et le fond
  useEffect(() => {
    const d = ref.current;
    if (image && d && !d.open) d.showModal();
  }, [image]);
  return (
    <dialog
      className="lightbox"
      ref={ref}
      onClick={() => ref.current?.close()}
      onClose={onClose}
    >
      <img src={image?.src} alt={image?.alt ?? ""} />
      <button type="button" className="lb-close" aria-label="Fermer">Fermer ✕</button>
    </dialog>
  );
}

/** Capture entière, dans une fenêtre de navigateur dessinée si c'est un site */
function Figure({ p, onZoom }: { p: Project; onZoom: (img: { src: string; alt: string }) => void }) {
  if (!p.image) {
    return <figure className="dp-fig"><div className="dp-frame plain"><Shot project={p} className="dp-img" /></div></figure>;
  }
  const { src, alt, url, caption } = p.image;
  return (
    <figure className="dp-fig">
      <button className={`dp-frame ${url ? "browser" : "plain"}`} type="button" aria-label="Agrandir l’image" onClick={() => onZoom({ src, alt })}>
        {url && <span className="dp-chrome" aria-hidden="true"><i /><i /><i /><span className="dp-url">{url}</span></span>}
        <img className="dp-img" src={src} alt={alt} decoding="async" />
        <span className="dp-zoom" aria-hidden="true">⤢ Agrandir</span>
      </button>
      <figcaption><span>Fig. 1</span> {caption || alt}</figcaption>
    </figure>
  );
}

export function ProjectPage({ project: p }: { project: Project }) {
  const ref = useRef<HTMLElement>(null);
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null);
  useHighlights(ref, [p.slug]);

  const i = PROJECTS.indexOf(p);
  const next = PROJECTS[(i + 1) % n];

  return (
    <main id="detail" className="detail" ref={ref}>
      <a className="back" href="#travail">← Retour aux fiches</a>
      <header className="dp-head">
        <p className="label">Fiche {pad(i + 1)} / {pad(n)} — {p.year}</p>
        <h1>{p.title}</h1>
        <div className="dp-sub">
          <p className="dp-type">{p.type}</p>
          <span className={stampClass(p)}>{p.status}</span>
        </div>
      </header>

      <Figure p={p} onZoom={setZoom} />

      <div className="dp-body">
        <article className="dp-main">
          <p className="dp-intro">{p.intro}</p>
          <p className="dp-desc">{p.description}</p>
          <blockquote className="dp-quote"><mark className="hl">{p.signature}</mark></blockquote>
          <section className="dp-block">
            <h2 className="label">Pour qui</h2>
            <p className="dp-aud">{p.audiences}</p>
          </section>
          <section className="dp-block">
            <h2 className="label">Fonctionnalités</h2>
            <ol className="feats">{p.features.map((f, k) => <li key={f}><span>{pad(k + 1)}</span>{f}</li>)}</ol>
          </section>
          <section className="dp-block">
            <h2 className="label">Architecture</h2>
            <dl className="arch">{p.architecture.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
            {p.security && <p className="security"><b>Sécurité.</b> {p.security}</p>}
          </section>
          <section className="dp-block">
            <h2 className="label">Mon rôle</h2>
            <p className="role">{p.role}</p>
          </section>
        </article>

        <aside className="dp-side">
          <div className="dp-card">
            <p className="label">Fiche technique</p>
            <dl className="dp-facts">
              <div><dt>Statut</dt><dd>{p.status}</dd></div>
              <div><dt>Année</dt><dd>{p.year}</dd></div>
              {p.roleTitle && <div><dt>Rôle</dt><dd>{p.roleTitle}</dd></div>}
              <div><dt>Type</dt><dd>{p.type}</dd></div>
            </dl>
            <p className="label">Stack</p>
            <div className="chips-plain">{p.stack.map((s) => <span key={s}>{s}</span>)}</div>
            {(p.site || p.github) && (
              <div className="links">
                {p.site && <a className="btn" href={p.site} target="_blank" rel="noreferrer">Voir le site ↗</a>}
                {p.github && <a className="btn alt" href={p.github} target="_blank" rel="noreferrer">GitHub ↗</a>}
              </div>
            )}
          </div>
        </aside>
      </div>

      <a className="next" href={`#/projet/${next.slug}`}>
        <p className="label">Fiche suivante</p>
        <strong>{next.title} →</strong>
      </a>

      <Lightbox image={zoom} onClose={() => setZoom(null)} />
    </main>
  );
}
