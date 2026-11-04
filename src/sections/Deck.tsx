import { useEffect, useRef, useState } from "react";
import { PROJECTS } from "../data/projects";
import { Shot } from "../components/Shot";
import { pad, reduced, stampClass, TOTAL as n } from "../lib/util";

interface Drag { c: HTMLAnchorElement; x: number; y: number; t: number; dx: number; dy: number; moved: boolean }

/**
 * Fiches bristol empilées : on attrape celle du dessus et on la lance (souris, doigt ou clavier).
 * Les positions sont écrites directement sur les éléments (refs) : à 60 images/seconde,
 * passer par l'état React à chaque mouvement du pointeur serait inutilement coûteux.
 */
export function Deck() {
  const deckRef = useRef<HTMLDivElement>(null);
  const cards = useRef<HTMLAnchorElement[]>([]);
  const order = useRef(PROJECTS.map((_, i) => i));
  const spread = useRef(false);
  const [top, setTop] = useState(0);

  // Les fonctions de pilotage restent stables : elles ne lisent que des refs
  const api = useRef({
    layout() {
      order.current.forEach((idx, k) => {
        const c = cards.current[idx];
        if (!c) return;
        const f = spread.current ? 1.8 : 1;
        const tilt = (k % 2 ? -1 : 1) * k * 2.2 * f;
        c.style.zIndex = String(n - k);
        c.style.opacity = k < 4 ? "1" : "0";
        c.style.transform = k === 0 ? "" : `translate(${k * 10 * f}px, ${k * 8 * f}px) rotate(${tilt}deg) scale(${1 - k * 0.03})`;
        c.style.pointerEvents = k === 0 ? "auto" : "none";
        c.tabIndex = k === 0 ? 0 : -1;
        c.setAttribute("aria-hidden", k === 0 ? "false" : "true");
      });
      setTop(order.current[0]);
    },
    throwTop(dir: number) {
      const c = cards.current[order.current[0]];
      c.classList.remove("dragging");
      c.style.transform = `translate(${dir * 135}%, -30px) rotate(${dir * 24}deg)`;
      order.current.push(order.current.shift()!);
      setTop(order.current[0]);
      // la fiche repart sous la pile une fois sortie du cadre
      setTimeout(() => api.current.layout(), reduced ? 0 : 260);
    },
    bringBack() {
      order.current.unshift(order.current.pop()!);
      const c = cards.current[order.current[0]];
      c.classList.add("dragging");
      c.style.zIndex = String(n + 1);
      c.style.transform = "translate(-135%, -30px) rotate(-24deg)";
      c.getBoundingClientRect(); // force la position de départ avant l'animation
      c.classList.remove("dragging");
      api.current.layout();
    },
  });

  useEffect(() => {
    const deck = deckRef.current!;
    const { layout, throwTop } = api.current;
    let drag: Drag | null = null;
    let swallowClick = false;

    const onEnter = () => { spread.current = true; layout(); };
    const onLeave = () => { spread.current = false; layout(); };
    const hover = matchMedia("(hover: hover)").matches && !reduced;
    if (hover) {
      deck.addEventListener("pointerenter", onEnter);
      deck.addEventListener("pointerleave", onLeave);
    }

    const onDown = (e: PointerEvent) => {
      const c = cards.current[order.current[0]];
      if (!c.contains(e.target as Node) || e.button > 0) return;
      drag = { c, x: e.clientX, y: e.clientY, t: performance.now(), dx: 0, dy: 0, moved: false };
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      drag.dx = e.clientX - drag.x;
      drag.dy = e.clientY - drag.y;
      if (!drag.moved && Math.hypot(drag.dx, drag.dy) < 6) return;
      if (!drag.moved) {
        drag.moved = true;
        drag.c.classList.add("dragging");
        try { drag.c.setPointerCapture(e.pointerId); } catch { /* pointeur déjà relâché */ }
      }
      drag.c.style.transform = `translate(${drag.dx}px, ${drag.dy * 0.35}px) rotate(${drag.dx * 0.06}deg)`;
    };
    const onUp = () => {
      if (!drag) return;
      const { c, dx, t, moved } = drag;
      drag = null;
      if (!moved) return;
      swallowClick = true;
      const v = dx / Math.max(1, performance.now() - t);
      if (Math.abs(dx) > 110 || Math.abs(v) > 0.7) throwTop(Math.sign(dx) || 1);
      else { c.classList.remove("dragging"); layout(); }
    };
    const onCancel = () => { if (drag) { drag.c.classList.remove("dragging"); drag = null; layout(); } };
    // un lancer ne doit pas ouvrir la fiche
    const onClick = (e: MouseEvent) => { if (swallowClick) { e.preventDefault(); swallowClick = false; } };

    deck.addEventListener("pointerdown", onDown);
    addEventListener("pointermove", onMove);
    addEventListener("pointerup", onUp);
    addEventListener("pointercancel", onCancel);
    deck.addEventListener("click", onClick, true);
    layout();

    return () => {
      if (hover) {
        deck.removeEventListener("pointerenter", onEnter);
        deck.removeEventListener("pointerleave", onLeave);
      }
      deck.removeEventListener("pointerdown", onDown);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerup", onUp);
      removeEventListener("pointercancel", onCancel);
      deck.removeEventListener("click", onClick, true);
    };
  }, []);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") { api.current.throwTop(1); cards.current[order.current[0]].focus(); }
    if (e.key === "ArrowLeft") { api.current.bringBack(); cards.current[order.current[0]].focus(); }
  };

  return (
    <div className="deck-zone" id="travail" aria-labelledby="deck-title">
      <h2 id="deck-title" className="sr-only">Projets</h2>
      <div className="deck" id="deck" ref={deckRef} onKeyDown={onKey}>
        {PROJECTS.map((p, i) => (
          <a
            key={p.slug}
            className="card"
            href={`#/projet/${p.slug}`}
            draggable={false}
            ref={(el) => { if (el) cards.current[i] = el; }}
          >
            <Shot project={p} className="cover" decorative />
            <div className="card-body">
              <p className="card-top"><span>FICHE {pad(i + 1)} / {pad(n)} — {p.year}</span><i aria-hidden="true" /></p>
              <h3>{p.title}</h3>
              <p className="ctype">{p.type}</p>
              <div className="card-foot">
                <span className={stampClass(p)}>{p.status}</span>
                <span className="open" aria-hidden="true">→</span>
              </div>
            </div>
          </a>
        ))}
      </div>
      <div className="deck-ctrl">
        <button className="sq" id="prev" type="button" aria-label="Fiche précédente" onClick={() => api.current.bringBack()}>←</button>
        <p className="deck-count"><span id="deck-count">{pad(top + 1)} / {pad(n)}</span></p>
        <button className="sq" id="next" type="button" aria-label="Fiche suivante" onClick={() => api.current.throwTop(1)}>→</button>
      </div>
    </div>
  );
}
