import { useEffect, useRef } from "react";
import { PROJECTS } from "../data/projects";
import { Shot } from "../components/Shot";
import { pad, reduced, stampClass, TOTAL as n } from "../lib/util";

/**
 * Index : rangée horizontale qui s'empile au défilement.
 * Chaque carte avance avec la rangée jusqu'au bord gauche, puis se pose sur la pile ;
 * les cartes recouvertes rétrécissent et s'assombrissent, la rotation alterne pour un tas naturel.
 */
export function Pile() {
  const pileRef = useRef<HTMLElement>(null);
  const items = useRef<HTMLLIElement[]>([]);
  const countRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (reduced) return;
    const pile = pileRef.current!;
    let raf = 0;
    let step = 0;

    const layout = () => {
      raf = 0;
      const rect = pile.getBoundingClientRect();
      const travel = pile.offsetHeight - innerHeight;
      const prog = travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 1;
      const p = prog * (n - 1);
      items.current.forEach((li, i) => {
        const d = Math.max(0, p - i);
        const x = Math.max(i * 6, (i - p) * step);
        const settle = Math.min(1, d);
        const tilt = (i % 2 ? -1 : 1) * (1.2 + (i % 3) * 0.8) * settle;
        const scale = 1 - Math.min(d, 4) * 0.035;
        li.style.transform = `translate3d(${x}px, ${Math.min(d, 4) * 4}px, 0) rotate(${tilt}deg) scale(${scale})`;
        li.style.setProperty("--dim", String(Math.min(d, 3) * 0.12));
      });
      if (countRef.current) countRef.current.textContent = `${pad(Math.min(n, Math.round(p) + 1))} / ${pad(n)}`;
      if (barRef.current) barRef.current.style.transform = `scaleX(${prog})`;
    };
    const size = () => {
      const w = items.current[0]?.offsetWidth ?? 0;
      step = w + Math.min(32, innerWidth * 0.04);
      // ~65 % d'écran de défilement par carte
      pile.style.height = `${innerHeight + (n - 1) * innerHeight * 0.65}px`;
      layout();
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(layout); };

    pile.classList.add("live");
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", size);
    document.fonts.ready.then(size);
    size();
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", size);
    };
  }, []);

  return (
    <section className="pile" id="index" aria-labelledby="index-title" ref={pileRef}>
      <div className="pile-sticky">
        <header className="pile-head">
          <p className="label">§ 01 — Index</p>
          <h2 id="index-title">Tous les projets, <mark className="hl">l’un sur l’autre</mark>.</h2>
          <div className="pile-meta" aria-hidden="true">
            <span id="pile-count" ref={countRef}>01 / {pad(n)}</span>
            <span className="pile-bar"><i id="pile-bar" ref={barRef} /></span>
          </div>
        </header>
        <ol className="pile-track" id="pile-track">
          {PROJECTS.map((p, i) => (
            <li key={p.slug} className="pc" style={{ zIndex: i + 1 }} ref={(el) => { if (el) items.current[i] = el; }}>
              <a href={`#/projet/${p.slug}`}>
                <Shot project={p} className="pc-img" decorative />
                <span className="pc-body">
                  <span className="pc-top"><span>{pad(i + 1)} / {pad(n)}</span><span>{p.year}</span></span>
                  <strong>{p.title}</strong>
                  <span className="pc-type">{p.type}</span>
                  <span className="pc-tags">{p.stack.slice(0, 3).map((s) => <i key={s}>{s}</i>)}</span>
                  <span className="pc-foot"><span className={stampClass(p)}>{p.status}</span><span className="open" aria-hidden="true">→</span></span>
                </span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
