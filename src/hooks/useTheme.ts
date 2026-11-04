import { useCallback, useEffect, useState, type RefObject } from "react";
import { reduced } from "../lib/util";

export type Theme = "light" | "dark";

const root = document.documentElement;
const readTheme = (): Theme => (root.dataset.theme === "dark" ? "dark" : "light");

function applyTheme(theme: Theme) {
  root.dataset.theme = theme;
  document.getElementById("theme-color")?.setAttribute("content", theme === "dark" ? "#141311" : "#f5f4ef");
}

let fadeTimer = 0;

/**
 * Thème clair / sombre. Le thème initial est posé par le petit script de index.html
 * (avant l'affichage, pour éviter un flash) ; ce hook le lit puis le pilote.
 */
export function useTheme(origin: RefObject<HTMLElement | null>) {
  const [theme, setState] = useState<Theme>(readTheme);

  const setTheme = useCallback((next: Theme, save = true) => {
    const apply = () => { applyTheme(next); setState(next); };
    if (save) { try { localStorage.setItem("theme", next); } catch { /* navigation privée */ } }
    if (reduced) { apply(); return; }

    // Écran tactile, ou navigateur sans View Transitions : simple fondu des couleurs.
    // (Sur Safari iOS, la transition par capture pouvait rester bloquée.)
    if (!document.startViewTransition || !matchMedia("(hover: hover) and (pointer: fine)").matches) {
      root.classList.add("theme-fade");
      apply();
      clearTimeout(fadeTimer);
      fadeTimer = window.setTimeout(() => root.classList.remove("theme-fade"), 450);
      return;
    }

    // Le nouveau thème s'ouvre en cercle depuis le bouton
    const r = origin.current?.getBoundingClientRect();
    const x = r ? r.left + r.width / 2 : innerWidth - 40;
    const y = r ? r.top + r.height / 2 : 40;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const vt = document.startViewTransition(apply);
    vt.finished.catch(() => {});
    vt.updateCallbackDone.catch(() => {});
    // filet de sécurité : si la transition ne démarre jamais, on applique quand même
    setTimeout(() => { if (readTheme() !== next) { vt.skipTransition(); apply(); } }, 500);
    vt.ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 650, easing: "cubic-bezier(.65,0,.35,1)", pseudoElement: "::view-transition-new(root)" },
      );
    }).catch(() => {});
  }, [origin]);

  // Sans choix enregistré, on suit le réglage du système
  useEffect(() => {
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => {
      let saved: string | null = null;
      try { saved = localStorage.getItem("theme"); } catch { /* rien */ }
      if (!saved) setTheme(e.matches ? "dark" : "light", false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [setTheme]);

  return { theme, toggle: () => setTheme(theme === "dark" ? "light" : "dark") };
}
