import { useEffect, useRef, type RefObject } from "react";

/**
 * Ajoute la classe `in` quand l'élément entre à l'écran (une seule fois).
 * Les animations d'entrée sont décrites dans styles.css (.xxx.in).
 */
export function useReveal<T extends Element>(margin = "-10%"): RefObject<T | null> {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        io.unobserve(e.target);
      }),
      { rootMargin: `0px 0px ${margin} 0px` },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);
  return ref;
}

/** Même principe pour tous les coups de surligneur (`mark.hl`) d'un bloc */
export function useHighlights(ref: RefObject<Element | null>, deps: unknown[] = []) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        io.unobserve(e.target);
      }),
      { rootMargin: "0px 0px -15% 0px" },
    );
    root.querySelectorAll("mark.hl:not(.timed)").forEach((m) => io.observe(m));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
