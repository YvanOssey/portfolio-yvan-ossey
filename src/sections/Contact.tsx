import { useRef, useState, type FormEvent } from "react";
import { useReveal } from "../hooks/useReveal";
import { pause, reduced, type CSSVars } from "../lib/util";

const EMAIL = "yvanossey6@gmail.com";
const PHONE = "+2250767214818";
const PHONE_LABEL = "+225 07 67 21 48 18";
const CV = "cv/CV_Yvan_Ossey.pdf";

const TYPES = ["un site vitrine", "une application web", "une application mobile", "une boutique en ligne", "un stage ou une alternance", "autre chose"];
const WHEN = ["dès que possible", "ce mois-ci", "dans 2 à 3 mois", "sans date précise"];

type Field = "name" | "type" | "when" | "msg" | "email";
type Values = Record<Field, string>;
const EMPTY: Values = { name: "", type: "", when: "", msg: "", email: "" };

/** Construit le message à partir des trous remplis de la carte */
function compose(v: Values) {
  const lines = ["Bonjour Yvan,", ""];
  lines.push(`Je m’appelle ${v.name.trim()}${v.type ? ` et je vous écris pour ${v.type}` : ""}.${v.when ? ` Idéalement, ce serait pour ${v.when}.` : ""}`);
  if (v.msg.trim()) lines.push("", v.msg.trim());
  if (v.email.trim()) lines.push("", `Vous pouvez me répondre à ${v.email.trim()}.`);
  lines.push("", "À très vite !");
  return lines.join("\n");
}

/** Carte postale à compléter, tamponnée à l'envoi */
function Postcard() {
  const form = useReveal<HTMLFormElement>();
  const postmark = useRef<HTMLDivElement>(null);
  const emailInput = useRef<HTMLInputElement>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  const [v, setV] = useState<Values>(EMPTY);
  const [bad, setBad] = useState<Field | null>(null);
  const [error, setError] = useState("");

  const set = (f: Field) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setV((old) => ({ ...old, [f]: e.target.value }));
    if (bad === f) setBad(null);
  };
  // les trous remplis passent en trait plein bleu
  const blank = (f: Field, extra = "") => `blank${extra}${v[f].trim() ? " filled" : ""}${bad === f ? " bad" : ""}`;

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!v.name.trim()) {
      setBad("name");
      setError("Il manque juste votre nom pour signer la carte.");
      nameInput.current?.focus();
      return;
    }
    if (v.email && !emailInput.current?.checkValidity()) {
      setBad("email");
      setError("Cette adresse e-mail semble incomplète.");
      emailInput.current?.focus();
      return;
    }
    setError("");
    const text = compose(v);
    const via = ((e.nativeEvent as SubmitEvent).submitter as HTMLElement | null)?.dataset.via;

    // Le cachet tombe sur le timbre, la carte encaisse le coup, puis on « poste »
    const card = form.current!;
    const mark = postmark.current!;
    if (!reduced) {
      mark.classList.remove("on");
      void mark.offsetWidth; // relance l'animation
      mark.classList.add("on");
      await pause(330);
      card.classList.remove("thunk");
      void card.offsetWidth;
      card.classList.add("thunk");
      await pause(450);
    } else {
      mark.classList.add("on");
    }
    if (via === "wa") {
      window.open(`https://wa.me/${PHONE.slice(1)}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    } else {
      const subject = v.type ? `Projet — ${v.type}` : `Message de ${v.name.trim()}`;
      location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    }
  };

  return (
    <form className="postcard" id="postcard" noValidate ref={form} onSubmit={submit}>
      <div className="pc-letter">
        <p className="hello">Bonjour Yvan,</p>
        <p className="line">
          Je m’appelle{" "}
          <label className={blank("name")}><span className="sr-only">Votre nom</span><input ref={nameInput} name="name" required autoComplete="name" placeholder="votre nom" size={12} value={v.name} onChange={set("name")} /></label>
          {" "}et je vous écris pour{" "}
          <label className={blank("type", " select")}><span className="sr-only">Type de projet</span>
            <select name="type" value={v.type} onChange={set("type")}>
              <option value="">un projet…</option>
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>.
          {" "}Idéalement, ce serait pour{" "}
          <label className={blank("when", " select")}><span className="sr-only">Délai</span>
            <select name="when" value={v.when} onChange={set("when")}>
              <option value="">quand ?</option>
              {WHEN.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>.
        </p>
        <label className="ruled"><span className="sr-only">Votre message</span><textarea name="msg" rows={4} placeholder="Voici l’idée en quelques mots…" value={v.msg} onChange={set("msg")} /></label>
        <p className="line">
          Vous pouvez me répondre à{" "}
          <label className={blank("email")}><span className="sr-only">Votre e-mail</span><input ref={emailInput} name="email" type="email" autoComplete="email" placeholder="votre e-mail" size={18} value={v.email} onChange={set("email")} /></label>.
        </p>
        <p className="bye">À très vite&nbsp;!</p>
        <p className="pc-error" id="pc-error" role="alert">{error}</p>
      </div>

      <div className="pc-address">
        <div className="stamp-box" aria-hidden="true">
          <div className="postage"><span className="pg-mark">Y</span><span className="pg-val">CI · 2026</span></div>
          <div className="postmark" id="postmark" ref={postmark}><span>ABIDJAN</span><b>ENVOYÉ</b><span>2026</span></div>
        </div>
        <dl className="to">
          <dt>À</dt>
          <dd><b>Yvan Ossey</b>Développeur full-stack<br />Cocody, Abidjan<br />Côte d’Ivoire</dd>
        </dl>
        <div className="pc-send">
          <button className="btn" type="submit" data-via="mail">Poster par e-mail →</button>
          <button className="btn alt" type="submit" data-via="wa">Par WhatsApp →</button>
        </div>
      </div>
    </form>
  );
}

function CopyButton({ value }: { value: string }) {
  const [label, setLabel] = useState("Copier");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setLabel("Copié ✓");
      setTimeout(() => setLabel("Copier"), 1800);
    } catch {
      setLabel("Sélectionnez l’adresse");
    }
  };
  return <button className="bk-act" type="button" onClick={copy}>{label}</button>;
}

const tab = (i: number, pos: string, r: string) => ({ "--i": i, "--tab": pos, "--r": r }) as CSSVars;

/** Onglets de répertoire : les moyens de me joindre directement */
function AddressBook() {
  const book = useReveal<HTMLUListElement>();
  return (
    <ul className="book" aria-label="Me joindre directement" ref={book}>
      <li className="bk bk-wide" style={tab(0, "18px", "-3deg")}>
        <span className="bk-tab" aria-hidden="true">@</span>
        <svg className="bk-ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="M3.5 6.5 12 13l8.5-6.5" /></svg>
        <span className="bk-label">E-mail</span>
        <a className="bk-val" href={`mailto:${EMAIL}`}>{EMAIL}</a>
        <span className="bk-acts">
          <CopyButton value={EMAIL} />
          <a className="bk-act" href={`mailto:${EMAIL}`}>Écrire ↗</a>
        </span>
      </li>
      <li className="bk bk-wide" style={tab(1, "30%", "2deg")}>
        <span className="bk-tab" aria-hidden="true">☎</span>
        <svg className="bk-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 3.5h3.2l1.8 4.6-2.3 1.4a11 11 0 0 0 6.3 6.3l1.4-2.3 4.6 1.8v3.2a1.5 1.5 0 0 1-1.6 1.5A16.5 16.5 0 0 1 4 5.1a1.5 1.5 0 0 1 1.5-1.6z" /></svg>
        <span className="bk-label">Téléphone</span>
        <a className="bk-val" href={`tel:${PHONE}`}>{PHONE_LABEL}</a>
        <span className="bk-acts">
          <a className="bk-act" href={`tel:${PHONE}`}>Appeler</a>
          <a className="bk-act" href={`https://wa.me/${PHONE.slice(1)}`} target="_blank" rel="noreferrer">WhatsApp ↗</a>
        </span>
      </li>
      <li className="bk" style={tab(2, "18px", "-2deg")}>
        <span className="bk-tab" aria-hidden="true">in</span>
        <svg className="bk-ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2.5" /><path d="M8 10.5V17M8 7.2v.1M12 17v-6.5M12 13.2c0-1.6 1-2.7 2.4-2.7s2.1 1 2.1 2.7V17" /></svg>
        <span className="bk-label">LinkedIn</span>
        <a className="bk-val" href="https://linkedin.com/in/yvan-ossey" target="_blank" rel="noreferrer">in/yvan-ossey</a>
        <span className="bk-acts"><a className="bk-act" href="https://linkedin.com/in/yvan-ossey" target="_blank" rel="noreferrer">Voir le profil ↗</a></span>
      </li>
      <li className="bk" style={tab(3, "42%", "3deg")}>
        <span className="bk-tab" aria-hidden="true">GH</span>
        <svg className="bk-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 19c-4.3 1.4-4.3-2.5-6-3M15 21v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" /></svg>
        <span className="bk-label">GitHub</span>
        <a className="bk-val" href="https://github.com/YvanOssey" target="_blank" rel="noreferrer">@YvanOssey</a>
        <span className="bk-acts"><a className="bk-act" href="https://github.com/YvanOssey" target="_blank" rel="noreferrer">Voir les dépôts ↗</a></span>
      </li>
      <li className="bk bk-cv" style={tab(4, "62%", "-2.5deg")}>
        <span className="bk-tab" aria-hidden="true">CV</span>
        <svg className="bk-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h8.5L19 7.5V21H6z" /><path d="M14 3v5h5M9 12.5h7M9 16h7" /></svg>
        <span className="bk-label">CV · PDF</span>
        <a className="bk-val" href={CV} target="_blank" rel="noopener">Mon CV</a>
        <span className="bk-acts">
          <a className="bk-act" href={CV} target="_blank" rel="noopener">Ouvrir ↗</a>
          <a className="bk-act" href={CV} download="CV_Yvan_Ossey.pdf">Télécharger ↓</a>
        </span>
      </li>
    </ul>
  );
}

export function Contact() {
  return (
    <section className="section contact" id="contact" aria-labelledby="contact-title">
      <header className="sec-head">
        <p className="label">§ 04 — Contact</p>
        <h2 id="contact-title">Écrivez-moi, <mark className="hl">je réponds sous 24 h</mark>.</h2>
        <p className="sec-sub">Complétez la carte : le message est déjà presque écrit.</p>
      </header>
      <Postcard />
      <p className="label book-label">Ou directement</p>
      <AddressBook />
    </section>
  );
}
