import { PROJECTS, SKILLS } from "./data.js?v=122";

document.documentElement.classList.add("js");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, el = document) => el.querySelector(s);
const pad = (n) => String(n).padStart(2, "0");
/* ---------- Thème clair / sombre ---------- */

const root = document.documentElement;
const themeBtn = document.getElementById("theme-toggle");
const themeMeta = document.getElementById("theme-color");
const syncThemeUI = () => {
  const dark = root.dataset.theme === "dark";
  themeBtn.setAttribute("aria-pressed", String(dark));
  themeBtn.setAttribute("aria-label", dark ? "Mode clair" : "Mode sombre");
  themeMeta.content = dark ? "#141311" : "#f5f4ef";
};
function setTheme(theme, save = true) {
  const apply = () => {
    root.dataset.theme = theme;
    syncThemeUI();
  };
  if (save) { try { localStorage.setItem("theme", theme); } catch {} }
  if (reduced || !document.startViewTransition) { apply(); return; }
  // le nouveau thème s'ouvre en cercle depuis le bouton
  const r = themeBtn.getBoundingClientRect();
  const x = r.left + r.width / 2, y = r.top + r.height / 2;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  document.startViewTransition(apply).ready.then(() => {
    root.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 650, easing: "cubic-bezier(.65,0,.35,1)", pseudoElement: "::view-transition-new(root)" },
    );
  });
}
themeBtn.addEventListener("click", () => setTheme(root.dataset.theme === "dark" ? "light" : "dark"));
// sans choix enregistré, on suit le réglage du système
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
  let saved = null;
  try { saved = localStorage.getItem("theme"); } catch {}
  if (!saved) setTheme(e.matches ? "dark" : "light", false);
});
syncThemeUI();

const HOT = new Set(["1er prix", "Lauréat", "En ligne"]);

/* Capture réelle du projet, ou une carte « capture à venir » s'il n'y en a pas encore */
function shot(p, cls, decorative = false) {
  if (!p.image) {
    return `<div class="${cls} shot-empty" aria-hidden="true"><span>${p.title.slice(0, 2)}</span><small>Capture à venir</small></div>`;
  }
  const alt = decorative ? "" : p.image.alt;
  return `<img class="${cls}" src="${p.image.src}" alt="${alt}" loading="${decorative ? "eager" : "lazy"}" decoding="async" draggable="false" style="object-position:${p.image.position}" />`;
}

/* =========================================================
   Accueil
   ========================================================= */

// Surligneur : le hero se surligne au chargement, le reste en entrant à l'écran
const hlIO = new IntersectionObserver((entries) => entries.forEach((e) => {
  if (!e.isIntersecting) return;
  e.target.classList.add("in");
  hlIO.unobserve(e.target);
}), { rootMargin: "0px 0px -15% 0px" });
document.querySelectorAll("#hero mark.hl").forEach((m, i) => {
  setTimeout(() => m.classList.add("in"), reduced ? 0 : 650 + i * 300);
});
document.querySelectorAll("#home mark.hl:not(#hero mark)").forEach((m) => hlIO.observe(m));

const bar = $(".bar");
addEventListener("scroll", () => bar.classList.toggle("scrolled", scrollY > 20), { passive: true });

/* ---------- Fiches qu'on lance ---------- */

const deck = $("#deck");
const count = $("#deck-count");
const n = PROJECTS.length;
let order = PROJECTS.map((_, i) => i);
let spread = false;

const cards = PROJECTS.map((p, i) => {
  const a = document.createElement("a");
  a.className = "card";
  a.href = `#/projet/${p.slug}`;
  a.draggable = false;
  a.innerHTML = `
    ${shot(p, "cover", true)}
    <div class="card-body">
      <p class="card-top"><span>FICHE ${pad(i + 1)} / ${pad(n)} — ${p.year}</span><i aria-hidden="true"></i></p>
      <h3>${p.title}</h3>
      <p class="ctype">${p.type}</p>
      <div class="card-foot">
        <span class="stamp ${HOT.has(p.status) ? "" : "muted"}">${p.status}</span>
        <span class="open" aria-hidden="true">→</span>
      </div>
    </div>`;
  deck.appendChild(a);
  return a;
});

function layout() {
  order.forEach((idx, k) => {
    const c = cards[idx];
    const f = spread ? 1.8 : 1;
    const tilt = (k % 2 ? -1 : 1) * k * 2.2 * f;
    c.style.zIndex = String(n - k);
    c.style.opacity = k < 4 ? "1" : "0";
    c.style.transform = k === 0 ? "" : `translate(${k * 10 * f}px, ${k * 8 * f}px) rotate(${tilt}deg) scale(${1 - k * 0.03})`;
    c.style.pointerEvents = k === 0 ? "auto" : "none";
    c.tabIndex = k === 0 ? 0 : -1;
    c.setAttribute("aria-hidden", k === 0 ? "false" : "true");
  });
  count.textContent = `${pad(order[0] + 1)} / ${pad(n)}`;
}

function throwTop(dir) {
  const c = cards[order[0]];
  c.classList.remove("dragging");
  c.style.transform = `translate(${dir * 135}%, -30px) rotate(${dir * 24}deg)`;
  order.push(order.shift());
  // la fiche repart sous la pile une fois sortie du cadre
  setTimeout(layout, reduced ? 0 : 260);
  count.textContent = `${pad(order[0] + 1)} / ${pad(n)}`;
}

function bringBack() {
  order.unshift(order.pop());
  const c = cards[order[0]];
  c.classList.add("dragging");
  c.style.zIndex = String(n + 1);
  c.style.transform = "translate(-135%, -30px) rotate(-24deg)";
  c.getBoundingClientRect();
  c.classList.remove("dragging");
  layout();
}

$("#next").addEventListener("click", () => throwTop(1));
$("#prev").addEventListener("click", bringBack);
deck.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") { throwTop(1); cards[order[0]].focus(); }
  if (e.key === "ArrowLeft") { bringBack(); cards[order[0]].focus(); }
});

if (matchMedia("(hover: hover)").matches && !reduced) {
  deck.addEventListener("pointerenter", () => { spread = true; layout(); });
  deck.addEventListener("pointerleave", () => { spread = false; layout(); });
}

let drag = null;
let swallowClick = false;
deck.addEventListener("pointerdown", (e) => {
  const c = cards[order[0]];
  if (!c.contains(e.target) || e.button > 0) return;
  drag = { c, x: e.clientX, y: e.clientY, t: performance.now(), dx: 0, dy: 0, moved: false };
});
addEventListener("pointermove", (e) => {
  if (!drag) return;
  drag.dx = e.clientX - drag.x;
  drag.dy = e.clientY - drag.y;
  if (!drag.moved && Math.hypot(drag.dx, drag.dy) < 6) return;
  if (!drag.moved) {
    drag.moved = true;
    drag.c.classList.add("dragging");
    try { drag.c.setPointerCapture(e.pointerId); } catch {}
  }
  drag.c.style.transform = `translate(${drag.dx}px, ${drag.dy * 0.35}px) rotate(${drag.dx * 0.06}deg)`;
});
function endDrag() {
  if (!drag) return;
  const { c, dx, t, moved } = drag;
  drag = null;
  if (!moved) return;
  swallowClick = true;
  const v = dx / Math.max(1, performance.now() - t);
  if (Math.abs(dx) > 110 || Math.abs(v) > 0.7) throwTop(Math.sign(dx) || 1);
  else { c.classList.remove("dragging"); layout(); }
}
addEventListener("pointerup", endDrag);
addEventListener("pointercancel", () => { if (drag) { drag.c.classList.remove("dragging"); drag = null; layout(); } });
deck.addEventListener("click", (e) => { if (swallowClick) { e.preventDefault(); swallowClick = false; } }, true);

layout();

const revealIO = new IntersectionObserver((entries) => entries.forEach((e) => {
  if (!e.isIntersecting) return;
  e.target.classList.add("in");
  revealIO.unobserve(e.target);
}), { rootMargin: "0px 0px -10% 0px" });

/* ---------- Index : rangée horizontale qui s'empile au défilement ---------- */

const pile = $("#index");
const track = $("#pile-track");
const pileCount = $("#pile-count");
const pileBar = $("#pile-bar");
track.innerHTML = PROJECTS.map((p, i) => `
  <li class="pc" style="z-index:${i + 1}">
    <a href="#/projet/${p.slug}">
      ${shot(p, "pc-img", true)}
      <span class="pc-body">
        <span class="pc-top"><span>${pad(i + 1)} / ${pad(n)}</span><span>${p.year}</span></span>
        <strong>${p.title}</strong>
        <span class="pc-type">${p.type}</span>
        <span class="pc-tags">${p.stack.slice(0, 3).map((s) => `<i>${s}</i>`).join("")}</span>
        <span class="pc-foot"><span class="stamp ${HOT.has(p.status) ? "" : "muted"}">${p.status}</span><span class="open" aria-hidden="true">→</span></span>
      </span>
    </a>
  </li>`).join("");
const pcs = [...track.children];

// Chaque carte avance avec la rangée jusqu'au bord gauche, puis se pose sur la pile.
// Les cartes recouvertes rétrécissent et s'assombrissent un peu ; la rotation alterne pour un tas naturel.
let pileRaf = 0, step = 0;
function pileLayout() {
  pileRaf = 0;
  const rect = pile.getBoundingClientRect();
  const travel = pile.offsetHeight - innerHeight;
  const prog = travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 1;
  const p = prog * (n - 1);
  pcs.forEach((li, i) => {
    const landed = p - i;
    const x = Math.max(i * 6, (i - p) * step);
    const d = Math.max(0, landed);
    const settle = Math.min(1, d);
    const tilt = (i % 2 ? -1 : 1) * (1.2 + (i % 3) * 0.8) * settle;
    const scale = 1 - Math.min(d, 4) * 0.035;
    li.style.transform = `translate3d(${x}px, ${Math.min(d, 4) * 4}px, 0) rotate(${tilt}deg) scale(${scale})`;
    li.style.setProperty("--dim", String(Math.min(d, 3) * 0.12));
  });
  pileCount.textContent = `${pad(Math.min(n, Math.round(p) + 1))} / ${pad(n)}`;
  pileBar.style.transform = `scaleX(${prog})`;
}
function pileSize() {
  if (reduced) return;
  const w = pcs[0].offsetWidth;
  step = w + Math.min(32, innerWidth * 0.04);
  // ~65 % d'écran de défilement par carte
  pile.style.height = `${innerHeight + (n - 1) * innerHeight * 0.65}px`;
  pileLayout();
}
if (!reduced) {
  pile.classList.add("live");
  addEventListener("scroll", () => { if (!pileRaf) pileRaf = requestAnimationFrame(pileLayout); }, { passive: true });
  addEventListener("resize", pileSize);
  document.fonts.ready.then(pileSize);
  pileSize();
}

/* ---------- Stack : un clavier dont chaque touche mène aux projets ---------- */

const key = (s) => s.toLowerCase().replace(/[^a-z0-9.]+/g, " ").trim().split(" ")[0];
const usedIn = (tech) => PROJECTS.filter((p) => p.stack.some((s) => key(s) === key(tech)));
const keyboard = $("#keyboard");
const usage = $("#usage");
let kIndex = 0;
keyboard.innerHTML = SKILLS.map((g) => `
  <div class="kgroup" style="--c:${g.color}">
    <p class="kgroup-title"><i aria-hidden="true"></i>${g.title}</p>
    <div class="keys">${g.items.map((t) => {
      const c = usedIn(t).length;
      // ordre pseudo-aléatoire, comme quelqu'un qui tape
      const d = ((kIndex++ * 7) % 23) * 38;
      return `<button type="button" class="key${c ? "" : " idle"}" aria-pressed="false" data-tech="${t}" style="--d:${d}ms">
        <span>${t}</span>${c ? `<b>${c}</b>` : ""}</button>`;
    }).join("")}</div>
  </div>`).join("");
revealIO.observe(keyboard);
revealIO.observe($(".cv-grid"));

/* ---------- Parcours : citation écrite mot à mot, frise tracée au défilement ---------- */

// Découpe la citation en mots (sans toucher au soulignement dessiné)
const pull = $(".pull");
let wordIndex = 0;
function splitWords(node) {
  [...node.childNodes].forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      const frag = document.createDocumentFragment();
      child.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.append(part); return; }
        const w = document.createElement("span");
        w.className = "w";
        w.style.setProperty("--w", wordIndex++);
        w.textContent = part;
        frag.append(w);
      });
      child.replaceWith(frag);
    } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== "svg") {
      splitWords(child);
    }
  });
}
splitWords(pull);
// le soulignement part juste après le dernier mot souligné
const lastUnderlined = [...pull.querySelectorAll(".scrib-u .w")].pop();
if (lastUnderlined) pull.style.setProperty("--ud", `${+lastUnderlined.style.getPropertyValue("--w") * 42 + 500}ms`);
revealIO.observe($(".about-grid"));

// Autocollants : chacun penche un peu différemment
document.querySelectorAll(".qualities li").forEach((li, i) => {
  li.style.setProperty("--q", i);
  li.style.setProperty("--rq", `${[-3, 2, -1.5, 3.5, -2.5, 1.5][i % 6]}deg`);
});

// Frise de formation pilotée par le défilement
const tlList = $(".tl ol");
const tlItems = [...tlList.children];
let tlRaf = 0;
function drawTimeline() {
  tlRaf = 0;
  const r = tlList.getBoundingClientRect();
  const p = Math.min(1, Math.max(0, (innerHeight * 0.72 - r.top) / r.height));
  tlList.style.setProperty("--tp", p.toFixed(3));
  tlItems.forEach((li) => li.classList.toggle("on", (li.offsetTop + 10) / r.height <= p + 0.001));
}
if (!reduced) {
  addEventListener("scroll", () => { if (!tlRaf) tlRaf = requestAnimationFrame(drawTimeline); }, { passive: true });
  drawTimeline();
} else {
  tlItems.forEach((li) => li.classList.add("on"));
}


function showTech(btn) {
  keyboard.querySelectorAll(".key").forEach((k) => k.setAttribute("aria-pressed", String(k === btn)));
  const tech = btn.dataset.tech;
  const list = usedIn(tech);
  const group = btn.closest(".kgroup");
  usage.style.setProperty("--c", group.style.getPropertyValue("--c"));
  usage.innerHTML = `
    <p class="label">${$(".kgroup-title", group).textContent}</p>
    <h3>${tech}</h3>
    <p class="u-sub">${list.length ? `Utilisé dans <b>${list.length}</b> projet${list.length > 1 ? "s" : ""}` : "Outil du quotidien, au service de tous les projets."}</p>
    ${list.length ? `<ul class="u-list">${list.map((p, i) => `
      <li style="--i:${i}"><a href="#/projet/${p.slug}">${shot(p, "u-thumb", true)}<span><strong>${p.title}</strong><small>${p.type}</small></span><em aria-hidden="true">→</em></a></li>`).join("")}</ul>` : ""}`;
}
keyboard.addEventListener("click", (e) => {
  const b = e.target.closest(".key");
  if (b) showTech(b);
});
showTech(keyboard.querySelector('[data-tech="React"]') || keyboard.querySelector(".key"));

/* ---------- Contact : carte postale à compléter, tamponnée à l'envoi ---------- */

const card = $("#postcard");
const postmark = $("#postmark");
const pcError = $("#pc-error");
revealIO.observe(card);
revealIO.observe($(".book"));

// Les trous remplis passent en trait plein bleu
card.querySelectorAll(".blank input, .blank select").forEach((f) => {
  const mark = () => {
    f.parentElement.classList.toggle("filled", Boolean(f.value.trim()));
    f.parentElement.classList.remove("bad");
  };
  f.addEventListener("input", mark);
  f.addEventListener("change", mark);
});

const pause = (ms) => new Promise((r) => setTimeout(r, ms));

card.addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = card.elements;
  const name = f.name.value.trim();
  if (!name) {
    f.name.parentElement.classList.add("bad");
    pcError.textContent = "Il manque juste votre nom pour signer la carte.";
    f.name.focus();
    return;
  }
  if (f.email.value && !f.email.checkValidity()) {
    f.email.parentElement.classList.add("bad");
    pcError.textContent = "Cette adresse e-mail semble incomplète.";
    f.email.focus();
    return;
  }
  pcError.textContent = "";

  const type = f.type.value, when = f.when.value, msg = f.msg.value.trim(), email = f.email.value.trim();
  const lines = ["Bonjour Yvan,", ""];
  lines.push(`Je m’appelle ${name}${type ? ` et je vous écris pour ${type}` : ""}.${when ? ` Idéalement, ce serait pour ${when}.` : ""}`);
  if (msg) lines.push("", msg);
  if (email) lines.push("", `Vous pouvez me répondre à ${email}.`);
  lines.push("", "À très vite !");
  const text = lines.join("\n");
  const via = e.submitter?.dataset.via;

  // Le cachet tombe sur le timbre, la carte encaisse le coup, puis on « poste »
  if (!reduced) {
    postmark.classList.remove("on");
    void postmark.offsetWidth;
    postmark.classList.add("on");
    await pause(330);
    card.classList.remove("thunk");
    void card.offsetWidth;
    card.classList.add("thunk");
    await pause(450);
  } else {
    postmark.classList.add("on");
  }
  if (via === "wa") {
    window.open(`https://wa.me/2250767214818?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  } else {
    location.href = `mailto:yvanossey6@gmail.com?subject=${encodeURIComponent(type ? `Projet — ${type}` : `Message de ${name}`)}&body=${encodeURIComponent(text)}`;
  }
});

document.querySelectorAll("[data-copy]").forEach((btn) => {
  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      btn.textContent = "Copié ✓";
      setTimeout(() => { btn.textContent = "Copier"; }, 1800);
    } catch {
      btn.textContent = "Sélectionnez l’adresse";
    }
  });
});

/* =========================================================
   Fiches projet + coup de surligneur plein écran
   ========================================================= */

const home = $("#home");
const detail = $("#detail");
const wipeEl = $("#wipe");
const wipeTitle = $("#wipe-title");
let busy = false, pending = false, current = "home";

async function wipe(title, swap) {
  if (reduced) { swap(); return; }
  busy = true;
  wipeTitle.textContent = title;
  const ease = "cubic-bezier(.76,0,.24,1)";
  wipeTitle.animate([{ opacity: 0, transform: "translateX(-24px)" }, { opacity: 1, transform: "none" }], { duration: 380, delay: 300, easing: "cubic-bezier(.22,1,.36,1)", fill: "both" });
  await wipeEl.animate([{ transform: "scaleX(0)", transformOrigin: "left" }, { transform: "scaleX(1)", transformOrigin: "left" }], { duration: 520, easing: ease, fill: "forwards" }).finished;
  swap();
  await wipeEl.animate([{ transform: "scaleX(1)", transformOrigin: "right" }, { transform: "scaleX(0)", transformOrigin: "right" }], { duration: 560, delay: 260, easing: ease, fill: "forwards" }).finished;
  wipeEl.getAnimations().forEach((a) => a.cancel());
  wipeTitle.getAnimations().forEach((a) => a.cancel());
  busy = false;
  if (pending) { pending = false; route(); }
}

/* Capture du projet sur sa page : entière, dans une fenêtre de navigateur dessinée si c'est un site */
function projectFigure(p) {
  if (!p.image) return `<figure class="dp-fig"><div class="dp-frame plain">${shot(p, "dp-img")}</div></figure>`;
  const url = p.image.url;
  return `
    <figure class="dp-fig">
      <button class="dp-frame ${url ? "browser" : "plain"}" type="button" data-zoom="${p.image.src}" data-alt="${p.image.alt}" aria-label="Agrandir l’image">
        ${url ? `<span class="dp-chrome" aria-hidden="true"><i></i><i></i><i></i><span class="dp-url">${url}</span></span>` : ""}
        <img class="dp-img" src="${p.image.src}" alt="${p.image.alt}" decoding="async" />
        <span class="dp-zoom" aria-hidden="true">⤢ Agrandir</span>
      </button>
      <figcaption><span>Fig. 1</span> ${p.image.caption || p.image.alt}</figcaption>
    </figure>`;
}

function renderDetail(p) {
  const i = PROJECTS.indexOf(p);
  const next = PROJECTS[(i + 1) % n];
  const links = [
    p.site && `<a class="btn" href="${p.site}" target="_blank" rel="noreferrer">Voir le site ↗</a>`,
    p.github && `<a class="btn alt" href="${p.github}" target="_blank" rel="noreferrer">GitHub ↗</a>`,
  ].filter(Boolean).join("");

  detail.innerHTML = `
    <a class="back" href="#travail">← Retour aux fiches</a>
    <header class="dp-head">
      <p class="label">Fiche ${pad(i + 1)} / ${pad(n)} — ${p.year}</p>
      <h1>${p.title}</h1>
      <div class="dp-sub">
        <p class="dp-type">${p.type}</p>
        <span class="stamp ${HOT.has(p.status) ? "" : "muted"}">${p.status}</span>
      </div>
    </header>

    ${projectFigure(p)}

    <div class="dp-body">
      <article class="dp-main">
        <p class="dp-intro">${p.intro}</p>
        <p class="dp-desc">${p.description}</p>
        <blockquote class="dp-quote"><mark class="hl">${p.signature}</mark></blockquote>
        <section class="dp-block">
          <h2 class="label">Pour qui</h2>
          <p class="dp-aud">${p.audiences}</p>
        </section>
        <section class="dp-block">
          <h2 class="label">Fonctionnalités</h2>
          <ol class="feats">${p.features.map((f, k) => `<li><span>${pad(k + 1)}</span>${f}</li>`).join("")}</ol>
        </section>
        <section class="dp-block">
          <h2 class="label">Architecture</h2>
          <dl class="arch">${p.architecture.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
          ${p.security ? `<p class="security"><b>Sécurité.</b> ${p.security}</p>` : ""}
        </section>
        <section class="dp-block">
          <h2 class="label">Mon rôle</h2>
          <p class="role">${p.role}</p>
        </section>
      </article>

      <aside class="dp-side">
        <div class="dp-card">
          <p class="label">Fiche technique</p>
          <dl class="dp-facts">
            <div><dt>Statut</dt><dd>${p.status}</dd></div>
            <div><dt>Année</dt><dd>${p.year}</dd></div>
            ${p.roleTitle ? `<div><dt>Rôle</dt><dd>${p.roleTitle}</dd></div>` : ""}
            <div><dt>Type</dt><dd>${p.type}</dd></div>
          </dl>
          <p class="label">Stack</p>
          <div class="chips-plain">${p.stack.map((s) => `<span>${s}</span>`).join("")}</div>
          ${links ? `<div class="links">${links}</div>` : ""}
        </div>
      </aside>
    </div>

    <a class="next" href="#/projet/${next.slug}">
      <p class="label">Fiche suivante</p>
      <strong>${next.title} →</strong>
    </a>`;
  detail.querySelectorAll("mark.hl").forEach((m) => hlIO.observe(m));
}

/* Zoom plein écran sur la capture */
const lightbox = document.createElement("dialog");
lightbox.className = "lightbox";
lightbox.innerHTML = `<img alt="" /><button type="button" class="lb-close" aria-label="Fermer">Fermer ✕</button>`;
document.body.appendChild(lightbox);
detail.addEventListener("click", (e) => {
  const b = e.target.closest("[data-zoom]");
  if (!b) return;
  const img = $("img", lightbox);
  img.src = b.dataset.zoom;
  img.alt = b.dataset.alt;
  lightbox.showModal();
});
lightbox.addEventListener("click", () => lightbox.close());

function showDetail(slug) {
  const p = PROJECTS.find((x) => x.slug === slug);
  if (!p) { location.hash = "#travail"; return; }
  current = slug;
  wipe(p.title, () => {
    renderDetail(p);
    home.hidden = true;
    detail.hidden = false;
    document.title = `${p.title} — Yvan Ossey`;
    scrollTo({ top: 0, behavior: "instant" });
  });
}

function showHome(hash) {
  if (current === "home") {
    if (hash === "#/") scrollTo({ top: 0 });
    return;
  }
  current = "home";
  wipe("Yvan Ossey", () => {
    detail.hidden = true;
    detail.innerHTML = "";
    home.hidden = false;
    document.title = "Yvan Ossey — Développeur web & mobile";
    const target = hash && hash.length > 2 ? document.querySelector(hash) : null;
    if (target) target.scrollIntoView({ behavior: "instant" });
    else scrollTo({ top: 0, behavior: "instant" });
  });
}

function route() {
  if (busy) { pending = true; return; }
  const m = location.hash.match(/^#\/projet\/([\w-]+)/);
  if (m) { if (m[1] !== current) showDetail(m[1]); }
  else showHome(location.hash);
}
addEventListener("hashchange", route);
if (location.hash.startsWith("#/projet/")) route();
