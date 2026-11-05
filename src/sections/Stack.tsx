import { useState } from "react";
import { SKILLS, type SkillGroup } from "../data/projects";
import { Shot } from "../components/Shot";
import { useReveal } from "../hooks/useReveal";
import { isCommonTool, usedIn, type CSSVars } from "../lib/util";

interface Selection { tech: string; group: SkillGroup }

const firstSelection = (): Selection => {
  const group = SKILLS.find((g) => g.items.includes("React")) ?? SKILLS[0];
  return { tech: group.items.includes("React") ? "React" : group.items[0], group };
};

/** Panneau de droite : les projets où la touche choisie a servi */
function Usage({ tech, group }: Selection) {
  const list = usedIn(tech);
  return (
    <aside className="usage" id="usage" aria-live="polite" style={{ "--c": group.color } as CSSVars}>
      <p className="label">{group.title}</p>
      <h3>{tech}</h3>
      <p className="u-sub">
        {list.length
          ? isCommonTool(tech)
            ? <>Utilisé dans <b>tous</b> mes projets</>
            : <>Utilisé dans <b>{list.length}</b> projet{list.length > 1 ? "s" : ""}</>
          : "Outil du quotidien, au service de tous les projets."}
      </p>
      {list.length > 0 && (
        <ul className="u-list">
          {list.map((p, i) => (
            <li key={`${tech}-${p.slug}`} style={{ "--i": i } as CSSVars}>
              <a href={`#/projet/${p.slug}`}>
                <Shot project={p} className="u-thumb" decorative />
                <span><strong>{p.title}</strong><small>{p.type}</small></span>
                <em aria-hidden="true">→</em>
              </a>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

/** Stack : un clavier dont chaque touche mène aux projets qui l'utilisent */
export function Stack() {
  const [sel, setSel] = useState<Selection>(firstSelection);
  const keyboard = useReveal<HTMLDivElement>();
  let kIndex = 0;

  return (
    <section className="section stack" id="stack" aria-labelledby="stack-title">
      <header className="sec-head">
        <p className="label">§ 03 — Stack</p>
        <h2 id="stack-title">Mes outils, <mark className="hl">touche par touche</mark>.</h2>
        <p className="sec-sub">Appuyez sur une touche pour voir dans quels projets je l’ai utilisée.</p>
      </header>
      <div className="kb-wrap">
        <div className="keyboard" id="keyboard" ref={keyboard}>
          {SKILLS.map((g) => (
            <div key={g.title} className="kgroup" style={{ "--c": g.color } as CSSVars}>
              <p className="kgroup-title"><i aria-hidden="true" />{g.title}</p>
              <div className="keys">
                {g.items.map((t) => {
                  const c = usedIn(t).length;
                  // ordre d'apparition pseudo-aléatoire, comme quelqu'un qui tape
                  const d = ((kIndex++ * 7) % 23) * 38;
                  return (
                    <button
                      key={t}
                      type="button"
                      className={`key${c ? "" : " idle"}`}
                      aria-pressed={sel.tech === t}
                      data-tech={t}
                      style={{ "--d": `${d}ms` } as CSSVars}
                      onClick={() => setSel({ tech: t, group: g })}
                    >
                      <span>{t}</span>{c > 0 && <b>{c}</b>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <Usage key={sel.tech} {...sel} />
      </div>
    </section>
  );
}
