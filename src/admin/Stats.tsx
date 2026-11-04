// Tableau de bord des statistiques du site (onglet « Statistiques » de l'admin).
import { useEffect, useMemo, useRef, useState } from "react";
import type { SiteContent } from "../data/schema";
import { ApiError, loadStats, type Stats } from "./api";

const nf = new Intl.NumberFormat("fr-FR");
const fmtDay = (d: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }) =>
  new Date(`${d}T12:00:00Z`).toLocaleDateString("fr-FR", opts);

const regions = (() => { try { return new Intl.DisplayNames(["fr"], { type: "region" }); } catch { return null; } })();
const country = (code: string) => { try { return regions?.of(code) ?? code; } catch { return code; } };

const CONTACT_LABELS: Record<string, string> = {
  email: "E-mail (lien)", whatsapp: "WhatsApp (lien)", phone: "Téléphone", linkedin: "LinkedIn", github: "GitHub",
  "carte-email": "Carte postale → e-mail", "carte-whatsapp": "Carte postale → WhatsApp",
};
const CV_LABELS: Record<string, string> = { open: "Ouvert", download: "Téléchargé" };
const DEVICE_LABELS: Record<string, string> = { mobile: "Mobile", desktop: "Ordinateur" };

/* --------------------------------------------------------- visites par jour */

function DailyChart({ daily }: { daily: Stats["daily"] }) {
  const [hover, setHover] = useState<number | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const W = 720, H = 200, PAD_L = 34, PAD_B = 24, PAD_T = 10;
  const max = Math.max(1, ...daily.map((d) => d.views));
  // échelle « ronde » pour que le repère du haut soit lisible
  const step = max <= 5 ? 1 : max <= 20 ? 5 : max <= 100 ? 20 : 10 ** Math.floor(Math.log10(max));
  const top = Math.ceil(max / step) * step;
  const slot = (W - PAD_L) / daily.length;
  const bw = Math.max(2, slot - 2); // 2 px d'écart entre les barres
  const y = (v: number) => PAD_T + (H - PAD_T - PAD_B) * (1 - v / top);
  const r = Math.min(4, bw / 2);
  const bar = (x: number, v: number) => {
    const y0 = H - PAD_B, y1 = y(v);
    if (v <= 0) return "";
    const h = y0 - y1, rr = Math.min(r, h);
    return `M${x},${y0} V${y1 + rr} Q${x},${y1} ${x + rr},${y1} H${x + bw - rr} Q${x + bw},${y1} ${x + bw},${y1 + rr} V${y0} Z`;
  };
  const ticks = [0, Math.round(daily.length / 2), daily.length - 1];
  const h = hover !== null ? daily[hover] : null;

  return (
    <div className="st-chart" ref={wrap}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Pages vues par jour, maximum ${nf.format(max)}`} onMouseLeave={() => setHover(null)}>
        {[0, top / 2, top].map((v) => (
          <g key={v}>
            <line x1={PAD_L} x2={W} y1={y(v)} y2={y(v)} className="st-grid" />
            <text x={PAD_L - 6} y={y(v) + 4} textAnchor="end" className="st-axis">{nf.format(v)}</text>
          </g>
        ))}
        {daily.map((d, i) => {
          const x = PAD_L + i * slot + 1;
          return (
            <g key={d.day}>
              <path d={bar(x, d.views)} className={`st-bar${hover === i ? " on" : ""}`} />
              {/* zone de survol plus grande que la barre */}
              <rect x={PAD_L + i * slot} y={PAD_T} width={slot} height={H - PAD_T - PAD_B} fill="transparent"
                onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} tabIndex={0}
                aria-label={`${fmtDay(d.day, { weekday: "long", day: "numeric", month: "long" })} : ${d.views} pages vues, ${d.visitors} visiteurs`} />
            </g>
          );
        })}
        {ticks.map((i) => daily[i] && (
          <text key={i} x={PAD_L + i * slot + slot / 2} y={H - 6} textAnchor={i === 0 ? "start" : i === daily.length - 1 ? "end" : "middle"} className="st-axis">
            {fmtDay(daily[i].day)}
          </text>
        ))}
      </svg>
      {h && hover !== null && (
        <div className="st-tip" style={{ left: `${((PAD_L + hover * slot + slot / 2) / W) * 100}%` }}>
          <b>{fmtDay(h.day, { weekday: "short", day: "numeric", month: "long" })}</b>
          <span>{nf.format(h.views)} page{h.views > 1 ? "s" : ""} vue{h.views > 1 ? "s" : ""}</span>
          <span>{nf.format(h.visitors)} visiteur{h.visitors > 1 ? "s" : ""}</span>
        </div>
      )}
      <details className="st-table">
        <summary>Voir les chiffres jour par jour</summary>
        <table>
          <thead><tr><th>Jour</th><th>Pages vues</th><th>Visiteurs</th></tr></thead>
          <tbody>{[...daily].reverse().map((d) => <tr key={d.day}><td>{fmtDay(d.day, { weekday: "short", day: "numeric", month: "short" })}</td><td>{d.views}</td><td>{d.visitors}</td></tr>)}</tbody>
        </table>
      </details>
    </div>
  );
}

/* --------------------------------------------------------- classements */

function Ranking({ title, data, label, empty }: { title: string; data: Record<string, number>; label: (k: string) => string; empty: string }) {
  const rows = Object.entries(data).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);
  const max = rows[0]?.[1] ?? 1;
  const total = rows.reduce((s, [, n]) => s + n, 0);
  return (
    <section className="ad-box st-rank">
      <h3>{title}</h3>
      {rows.length === 0 ? <p className="ad-hint">{empty}</p> : (
        <ol>
          {rows.slice(0, 8).map(([k, n]) => (
            <li key={k} title={`${label(k)} : ${n} (${Math.round((n / total) * 100)} %)`}>
              <span className="st-rank-name">{label(k)}</span>
              <span className="st-rank-bar"><i style={{ width: `${(n / max) * 100}%` }} /></span>
              <span className="st-rank-n">{nf.format(n)}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

/* --------------------------------------------------------- page */

export function StatsPanel({ content }: { content: SiteContent }) {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    setError("");
    loadStats(days)
      .then((s) => { if (alive) setData(s); })
      .catch((e: ApiError) => { if (alive) setError(e.message); });
    return () => { alive = false; };
  }, [days]);

  const titles = useMemo(() => Object.fromEntries(content.projects.map((p) => [p.slug, p.title])), [content]);

  if (error) return <p className="ad-error">{error}</p>;
  if (!data) return <p className="ad-wait">Chargement des statistiques…</p>;
  if (!data.configured) {
    return (
      <section className="ad-box">
        <h3>Statistiques pas encore activées</h3>
        <p>Il faut relier une base Upstash Redis (gratuite) au projet sur Vercel : <b>Storage → Create Database → Upstash for Redis</b>,
          puis la connecter au projet du portfolio et redéployer.</p>
      </section>
    );
  }

  const t = data.totals;
  const kpis: [string, number, string?][] = [
    ["Pages vues", t.views],
    ["Visiteurs uniques", t.visitors, "estimation, sans cookie"],
    ["Projets consultés", t.projectViews],
    ["CV ouvert ou téléchargé", t.cv],
    ["Prises de contact", t.contacts, "clics e-mail, WhatsApp, téléphone…"],
  ];

  return (
    <div className="ad-stack">
      <div className="st-period" role="group" aria-label="Période">
        {[7, 30, 90].map((d) => (
          <button key={d} type="button" aria-pressed={days === d} onClick={() => setDays(d)}>{d} jours</button>
        ))}
      </div>

      <div className="st-kpis">
        {kpis.map(([label, value, hint]) => (
          <div className="st-kpi" key={label}>
            <span className="st-kpi-v">{nf.format(value)}</span>
            <span className="st-kpi-l">{label}</span>
            {hint && <span className="ad-hint">{hint}</span>}
          </div>
        ))}
      </div>

      <section className="ad-box">
        <h3>Pages vues par jour</h3>
        {t.views === 0 ? <p className="ad-hint">Pas encore de visite sur cette période. Les chiffres apparaissent dès les premières visites.</p> : <DailyChart daily={data.daily} />}
      </section>

      <div className="st-grid2">
        <Ranking title="Projets les plus consultés" data={data.projects} label={(k) => titles[k] ?? k} empty="Aucune page projet ouverte pour l’instant." />
        <Ranking title="D’où viennent les visiteurs" data={data.sources} label={(k) => (k === "direct" ? "Accès direct ou application" : k)} empty="Pas encore de données." />
        <Ranking title="Pays" data={data.countries} label={country} empty="Pas encore de données." />
        <Ranking title="Appareils" data={data.devices} label={(k) => DEVICE_LABELS[k] ?? k} empty="Pas encore de données." />
        <Ranking title="Prises de contact" data={data.contact} label={(k) => CONTACT_LABELS[k] ?? k} empty="Aucun clic de contact pour l’instant." />
        <Ranking title="CV" data={data.cv} label={(k) => CV_LABELS[k] ?? k} empty="CV pas encore ouvert." />
      </div>

      <p className="ad-hint">Mesure anonyme : aucun cookie, aucune adresse IP enregistrée. Vos propres visites ne sont plus comptées
        sur ce navigateur depuis votre connexion à l’admin. Les robots ne sont pas comptés.</p>
    </div>
  );
}
