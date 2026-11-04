import type { Project } from "../data/projects";

interface ShotProps {
  project: Project;
  className: string;
  /** Image purement décorative (le titre du projet est déjà écrit à côté) */
  decorative?: boolean;
}

/** Capture réelle du projet, ou une carte « capture à venir » s'il n'y en a pas encore */
export function Shot({ project: p, className, decorative = false }: ShotProps) {
  if (!p.image) {
    return (
      <div className={`${className} shot-empty`} aria-hidden="true">
        <span>{p.title.slice(0, 2)}</span>
        <small>Capture à venir</small>
      </div>
    );
  }
  return (
    <img
      className={className}
      src={p.image.src}
      alt={decorative ? "" : p.image.alt}
      loading={decorative ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      style={{ objectPosition: p.image.position }}
    />
  );
}
