import { useEffect, useRef, useState } from "react";
import { useTheme } from "../hooks/useTheme";

const CV = "cv/CV_Yvan_Ossey.pdf";

/** Monogramme YO : un Y cerclé d'un O griffonné, sur un coup de surligneur */
export function Logo() {
  return (
    <svg className="logo" viewBox="0 0 64 64" aria-hidden="true">
      <path className="lg-hl" d="M13.2 30.4 50.8 26l.8 1.6-.3 3.3.7 3.2-.6 3.1L15 41.4l-.9-1.8.4-3.4-.8-3.1z" />
      <path className="lg-y" pathLength={1} d="M20.5 16.5c4 4.6 7.6 9.4 11.5 14.4M43.5 15.8c-4.2 5.4-7.6 10-11.5 15.1.3 5.2.2 10.3-.2 15.6" />
      <path className="lg-o" pathLength={1} d="M41.5 7.6C53 10.4 60.2 21 58.2 33.8 56.1 47.6 43.6 58 29.4 57 15.8 56 5.6 45 6.4 31.4 7.2 18.4 18 7.4 31.6 6.9c5.6-.2 10.8 1.6 14.6 4.9" />
    </svg>
  );
}

/** Soleil / lune : le soleil perd ses rayons, une ombre ronde le creuse en croissant (CSS) */
function ThemeToggle() {
  const btn = useRef<HTMLButtonElement>(null);
  const { theme, toggle } = useTheme(btn);
  const dark = theme === "dark";
  return (
    <button
      ref={btn}
      className="theme-toggle"
      id="theme-toggle"
      type="button"
      aria-label={dark ? "Mode clair" : "Mode sombre"}
      aria-pressed={dark}
      onClick={toggle}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <g className="rays"><path d="M12 1.8v2.4M12 19.8v2.4M1.8 12h2.4M19.8 12h2.4M4.8 4.8l1.7 1.7M17.5 17.5l1.7 1.7M4.8 19.2l1.7-1.7M17.5 6.5l1.7-1.7" /></g>
        <circle className="core" cx="12" cy="12" r="4.6" />
        <circle className="cut" cx="16.5" cy="7.5" r="5" />
      </svg>
    </button>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(scrollY > 20);
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`bar${scrolled ? " scrolled" : ""}`}>
      <a className="mark" href="#/" aria-label="Accueil">
        <Logo />
        <span className="mark-name">Yvan Ossey<span>/dev</span></span>
      </a>
      <nav aria-label="Navigation principale">
        <a href="#travail"><i>01</i>Projets</a>
        <a href="#parcours" className="hide-sm"><i>02</i>Parcours</a>
        <a href="#stack" className="hide-sm"><i>03</i>Stack</a>
        <a href="#contact"><i>04</i>Contact</a>
      </nav>
      <div className="bar-end">
        <ThemeToggle />
        <a className="btn small cv-btn" href={CV} target="_blank" rel="noopener">Voir mon CV <span aria-hidden="true">↗</span></a>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="foot">
      <span>© 2026 Ossey Yvan Jean De Kenty</span>
      <a href="#hero">Haut de page ↑</a>
    </footer>
  );
}
