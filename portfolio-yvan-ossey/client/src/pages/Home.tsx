/* Portfolio repris du fichier source utilisateur : terminal sombre, cyan, grilles techniques, contenu CV corrigé et sections natives React. */
import { FormEvent, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Award,
  Check,
  Cloud,
  FileText,
  Github,
  HardDrive,
  Layers3,
  Linkedin,
  Mail,
  MailCheck,
  Menu,
  Phone,
  Send,
  Server,
  ShieldCheck,
  TrainFront,
  Wrench,
  X,
} from "lucide-react";
import numcertificationImage from "../assets/certification-sensibilisation-numerique.png";
import cybercertificationImage from "../assets/certification-introduction-cybersecurite.png";
import certificationImage from "../assets/certification-utilisation-ordi-equipementmobile.png";
import fullcertificationImage from "../assets/certification-developpeur-fullstack.png";
import vibecertificationImage from "../assets/certification-vibeathon.png";
import hackcertificationImage from "../assets/certification-koumanplay.jpeg";
import profilePhoto from "../assets/photo-yvan-ossey.png";

const cvUrl =
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663930880878/NKqnlJysDrvZbIct.pdf";

const projects = [
  [
    "01",
    "KoumanPlay",
    "Jeu culturel intergénérationnel",
    "Prototype lauréat du Hack & Train Pont numérique 2026 pour transmettre le patrimoine ivoirien avec proverbes, contes audio et défis interactifs.",
    ["HTML5", "CSS3", "JavaScript"],
    "Lauréat",
  ],
  [
    "02",
    "TontinCi",
    "Gestion intelligente de tontines",
    "Application mobile pour créer, rejoindre et gérer des groupes, suivre les cotisations et consulter l’historique des transactions.",
    ["Flutter", "Dart", "Supabase", "Iconsax","Git","GitHub","Figma"],
    "En cours",
    "",
    "https://github.com/YvanOssey/tontinci",
  ],
  [
    "03",
    "ChopTaResi CI",
    "Plateforme SaaS immobilière",
    "Solution de gestion des biens, résidences, locataires et paiements avec authentification JWT sécurisée.",
    ["Node.js", "React", "MySQL", "JWT","Git","GitHub","Figma"],
    "En cours",
    "",
    "https://github.com/YvanOssey/resimanage-ci",
  ],
  [
    "04",
    "EduScan",
    "Gestion de scolarité",
    "Application mobile académique pour vérifier les paiements étudiants par scan de QR code et gérer les données via Supabase.",
    ["Figma", "Flutter", "Supabase","Git","GitHub","Figma"],
    "Académique",
    "",
    "https://github.com/YvanOssey/EduScan",
  ],
  [
    "05",
    "OBVX",
    "Boutique e-commerce",
    "Interface responsive avec catalogue dynamique, panier interactif et expérience d’achat claire.",
    ["HTML5", "CSS3", "JavaScript","Git","GitHub","Figma"],
    "Réalisé - En ligne",
    "https://obvx.vercel.app",
    "https://github.com/YvanOssey/obvx",
  ],
  [
    "06",
    "OBC & AEC",
    "Sites institutionnels sportifs",
    "Maquettes web responsives pour présenter les activités, équipes et événements de clubs sportifs.",
    ["HTML5", "CSS3", "Formspree","Git","GitHub","Figma"],
    "Réalisé",
    "",
    "https://github.com/YvanOssey/Athl-tic-Elite-Club",
  ],
  [
    "07",
    "ClairDroit",
    "Blog juridique full-stack",
    "Blog juridique avec espace d’administration sécurisé, publication d’articles par rubrique, personnalisation éditoriale, stockage d’images Cloudflare R2, notifications Resend et déploiement Railway.",
    ["React", "Node.js", "MySQL", "Railway", "Cloudflare R2", "Resend","Git","GitHub","Figma"],
    "Réalisé - En ligne",
    "https://clairdroit-production.up.railway.app/",
    "https://github.com/YvanOssey/clairdroit",
  ],
  [
    "08",
    "Story’s",
    "Gestion de blanchisserie à domicile",
    "Application web pour gérer les collectes de linge, suivre les commandes, organiser les créneaux et coordonner l’activité opérationnelle d’une blanchisserie à domicile.",
    [
      "React",
      "TypeScript",
      "Node.js",
      "Express",
      "tRPC",
      "MySQL",
      "Drizzle ORM",
      "Railway",
      "Git",
      "GitHub",
      "Figma",
    ],
    "Réalisé - En ligne",
    "https://storys-blanchisserie.vercel.app/",
    "https://github.com/YvanOssey/storys-blanchisserie",
  ],
] as Array<[string, string, string, string, string[], string, string, string]>;

const projectSlug = (title: string) =>
  title
    .toLowerCase()
    .replace(/&/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const certifications = [
  {
    name: "Certificat de participation — VIBEATHON 2026",
    issuer: "VIBEATHON 2026",
    date: "11 Juillet 2026 - CSCTICAO",
    result: "Compétiteur",
    Description:
      "Participation à la première édition du VIBEATHON en tant que compétiteur au sein de l’équipe NeuroGhost",
    image: vibecertificationImage,
  },

  {
    name: "Hack & Train « Ponts numériques »",
    issuer: "Istorias Media",
    date: "16–18 juin 2026",
    result: "Lauréat",
    description:
      "Conception d’un prototype numérique favorisant la transmission du patrimoine culturel ivoirien à travers des proverbes, des contes audio et des défis interactifs adaptés aux différents groupes ethniques.",
    image: hackcertificationImage,
  },

  {
    name: "Full-Stack Development 101",
    issuer: "Simplilearn",
    date: "20 juin 2026",
    image: fullcertificationImage,
  },

  {
    name: "Utilisation d'Ordinateurs et d'Equipements mobiles",
    issuer: "Cybastion IT Academy",
    date: "14 juillet 2025",
    image: certificationImage,
  },

  {
    name: "Sensibilisation au numérique",
    issuer: "Cybastion IT Academy",
    date: "11 juillet 2025",
    image: numcertificationImage,
  },

  {
    name: "Introduction à la Cybersécurité",
    issuer: "Cybastion IT Academy",
    date: "10 juillet 2025",
    image: cybercertificationImage,
  },
];

const skillGroups = [
  {
    title: "Frontend",
    tone: "cyan",
    skills: [
      {
        name: "HTML5",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg",
        alt: "Logo HTML5",
      },
      {
        name: "CSS3",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg",
        alt: "Logo CSS3",
      },
      {
        name: "JavaScript (ES6+)",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg",
        alt: "Logo JavaScript",
      },
      {
        name: "React.js",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg",
        alt: "Logo React",
      },
      {
        name: "Flutter",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/flutter/flutter-original.svg",
        alt: "Logo Flutter",
      },
      {
        name: "Dart",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/dart/dart-original.svg",
        alt: "Logo Dart",
      },
    ],
  },

  {
    title: "Design & UX/UI",
    tone: "violet",
    skills: [
      {
        name: "Figma",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg",
        alt: "Logo Figma",
      },
      {
        name: "Wireframes",
        logo: "design",
        alt: "Pictogramme wireframe",
      },
      {
        name: "Maquettes web et mobile",
        logo: "design",
        alt: "Pictogramme maquettes web et mobile",
      },
      {
        name: "Prototypes interactifs",
        logo: "design",
        alt: "Pictogramme prototypes interactifs",
      },
      {
        name: "Conception responsive",
        logo: "design",
        alt: "Pictogramme conception responsive",
      },
      {
        name: "Organisation et hiérarchisation des contenus",
        logo: "design",
        alt: "Pictogramme organisation des contenus",
      },
      {
        name: "Bases des principes UX/UI",
        logo: "design",
        alt: "Pictogramme principes UX/UI",
      },
    ],
  },

  {
    title: "Backend",
    tone: "violet",
    skills: [
      {
        name: "Node.js",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg",
        alt: "Logo Node.js",
      },
      {
        name: "Express.js",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/express/express-original.svg",
        alt: "Logo Express.js",
      },
      {
        name: "PHP",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/php/php-original.svg",
        alt: "Logo PHP",
      },
      {
        name: "Python",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg",
        alt: "Logo Python",
      },
    ],
  },
  {
    title: "Bases de données",
    tone: "green",
    skills: [
      {
        name: "MySQL",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg",
        alt: "Logo MySQL",
      },
      { name: "SQL", logo: "database", alt: "Pictogramme SQL" },
      {
        name: "Supabase",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/supabase/supabase-original.svg",
        alt: "Logo Supabase",
      },
    ],
  },
  {
    title: "Outils",
    tone: "yellow",
    skills: [
      {
        name: "Git",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg",
        alt: "Logo Git",
      },
      {
        name: "GitHub",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg",
        alt: "Logo GitHub",
      },
      {
        name: "Linux",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/linux/linux-original.svg",
        alt: "Logo Linux",
      },
      { name: "VMware", logo: "vmware", alt: "Pictogramme VMware" },
      {
        name: "Android Studio",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/androidstudio/androidstudio-original.svg",
        alt: "Logo Android Studio",
      },

      {
        name: "Canva",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/canva/canva-original.svg",
        alt: "Logo Canva",
      },
      { name: "Pack Office", logo: "office", alt: "Pictogramme Pack Office" },
      { name: "Railway", logo: "railway", alt: "Pictogramme Railway" },
      {
        name: "Cloudflare R2",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cloudflare/cloudflare-original.svg",
        alt: "Logo Cloudflare",
      },
      { name: "Resend", logo: "resend", alt: "Pictogramme Resend" },
    ],
  },
  {
    title: "Sécurité",
    tone: "pink",
    skills: [
      { name: "JWT", logo: "security", alt: "Pictogramme JWT" },
      {
        name: "Authentification sécurisée",
        logo: "security",
        alt: "Pictogramme authentification sécurisée",
      },
      {
        name: "Notions de cybersécurité",
        logo: "security",
        alt: "Pictogramme cybersécurité",
      },
    ],
  },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState("");

  async function submitContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setSubmitError("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("https://formspree.io/f/xnpqpjek", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("L’envoi du message a échoué.");
      }

      setSent(true);
      form.reset();
    } catch {
      setSubmitError(
        "Impossible d’envoyer le message pour le moment. Veuillez réessayer ou utiliser l’e-mail affiché à gauche."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="source-portfolio">
      <nav className="source-nav" aria-label="Navigation principale">
        <a className="source-logo" href="#top">
          <span>[</span>YVAN<span>.</span>DEV<span>]</span>
        </a>
        <div className={`source-links ${menuOpen ? "open" : ""}`}>
          <a href="#about" onClick={() => setMenuOpen(false)}>
            À propos
          </a>
          <a href="#skills" onClick={() => setMenuOpen(false)}>
            Stacks
          </a>
          <a href="#projects" onClick={() => setMenuOpen(false)}>
            Projets
          </a>
          <a
            href={cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
          >
            Voir mon CV
          </a>
          <a href="#certifications" onClick={() => setMenuOpen(false)}>
            Certifications
          </a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>
            Contact
          </a>
        </div>

        <div className="source-status">
          <i /> Disponible pour échanger
        </div>
        <button
          className="source-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Ouvrir le menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      <main id="top">
        <section className="source-hero">
          <div className="hero-grid" />
          <div className="hero-glow cyan" />
          <div className="hero-glow violet" />
          <div className="hero-copy">
            <div className="terminal">
              <span>Yvan.</span>Dev <b />
            </div>
            <p className="source-kicker">
              DÉVELOPPEUR WEB & MOBILE · COCODY, RIVIERA 4 · CÔTE D’IVOIRE
            </p>
            <h1>
              <span>Ossey</span>
              <strong>Yvan</strong>
              <small>Jean De Kenty</small>
            </h1>
            <p className="source-lead">
              Développeur web et mobile.
              <br />
              Je conçois des applications modernes, rapides et complètes.
            </p>
            <div className="source-actions">
              <a className="source-btn primary" href="#projects">
                Voir mes projets <ArrowUpRight size={16} />
              </a>
              <a className="source-btn ghost" href="#contact">
                Me contacter
              </a>
            </div>
            <div className="source-meta">
              <div>
                <b>08</b>
                <span>Projets documentés</span>
              </div>
              <div>
                <b>05</b>
                <span>Axes techniques</span>
              </div>
              <div>
                <b>L2</b>
                <span>MIAGE</span>
              </div>
            </div>
          </div>
          <div className="hero-art">
            <div className="art-orbit" />
            <div className="art-card">
              <div className="art-top">
                <span />
                <span />
                <span /> <em>yvan.dev</em>
              </div>
              
            </div>
          </div>
          <a className="scroll-indicator" href="#about">
            <span>SCROLL TO EXPLORE</span>
            <ArrowDown size={15} />
          </a>
        </section>

        <section id="about" className="source-section about-section">
          <div className="source-label">
            01 <span /> À PROPOS
          </div>
          <div className="about-grid">
            <div className="about-visual">
              <h2>
                Qui suis-<em>je ?</em>
              </h2>

              <div className="about-photo-frame">
                <img src={profilePhoto} alt="Portrait de Yvan Ossey" />
              </div>
            </div>

            <div className="about-body">
              <p>
                Je m’appelle <b>Ossey Yvan Jean De Kenty</b>, étudiant en{" "}
                <b>Licence 2 MIAGE</b> à l’Université Polytechnique de{" "}
                Bingerville.
              </p>

              <p>
                Passionné par le développement web et mobile, je travaille avec{" "}
                <b>React, Node.js, MySQL, Flutter, Dart et Supabase</b>.
                Rigoureux, autonome et curieux, je souhaite contribuer à des
                projets innovants tout en renforçant mes compétences.
              </p>

              <p>
                J’intègre les agents IA à mon processus de développement comme
                de véritables partenaires de travail. Je les guide et les
                coordonne pour accélérer la recherche, le prototypage et la mise
                en œuvre de solutions robustes.
              </p>

              <p>
                Cette approche me permet de gagner en efficacité tout en restant
                pleinement responsable des décisions techniques. Je reste
                toutefois maître des décisions essentielles — architecture,
                sécurité et qualité du code. Chaque production est analysée,
                adaptée et validée par mes soins afin de garantir un résultat
                fiable et maintenable.
              </p>

              <p>
                Mon objectif est de devenir un <b>développeur full-stack</b>{" "}
                polyvalent, capable de créer des solutions digitales à impact
                réel.
              </p>

              <div className="about-facts">
                <span>
                  <small>FORMATION</small>Licence 2 MIAGE
                </span>
                <span>
                  <small>STATUT</small>Étudiant
                </span>
                <span>
                  <small>LOCALISATION</small>Cocody, Riviera 4
                </span>
                <span>
                  <small>DISPONIBILITÉ</small>
                  <b>Disponible</b>
                </span>
              </div>
            </div>
          </div>
        </section>

        <section id="skills" className="source-section skills-section">
          <div className="source-label">
            02 <span /> COMPÉTENCES
          </div>
          <div className="section-intro">
            <h2>
              Mes
              <br />
              <em>stacks</em>
            </h2>
            <p>
              Des outils choisis pour prototyper, construire et faire évoluer
              des expériences web et mobiles accessibles.
            </p>
          </div>
          <div className="skill-groups">
            {skillGroups.map((group, groupIndex) => (
              <div className={`skill-group ${group.tone}`} key={group.title}>
                <div className="skill-group-heading">
                  <span>0{groupIndex + 1}</span>
                  <h3>{group.title}</h3>
                  <i>
                    {group.skills.length.toString().padStart(2, "0")} éléments
                  </i>
                </div>
                <div className="skill-grid">
                  {group.skills.map((skill, skillIndex) => (
                    <div className="skill-card" key={skill.name}>
                      <div>
                        <span className="skill-num">
                          {String(skillIndex + 1).padStart(2, "0")}
                        </span>
                        <span className="skill-logo">
                          {skill.logo === "security" ? (
                            <ShieldCheck aria-hidden="true" />
                          ) : skill.logo === "database" ? (
                            <Server aria-hidden="true" />
                          ) : skill.logo === "vmware" ? (
                            <HardDrive aria-hidden="true" />
                          ) : skill.logo === "office" ? (
                            <FileText aria-hidden="true" />
                          ) : skill.logo === "railway" ? (
                            <TrainFront aria-hidden="true" />
                          ) : skill.logo === "resend" ? (
                            <MailCheck aria-hidden="true" />
                          ) : skill.logo === "design" ? (
                            <Layers3 aria-hidden="true" />
                          ) : (
                            <img src={skill.logo} alt={skill.alt} />
                          )}
                        </span>

                        <strong>{skill.name}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="projects" className="source-section projects-section">
          <div className="source-label">
            03 <span /> RÉALISATIONS
          </div>
          <div className="section-intro project-intro">
            <h2>
              Mes <em>projets</em>
            </h2>
            <p>
              Du projet académique au prototype lauréat, chaque réalisation est
              une occasion de rendre une idée tangible.
            </p>
          </div>
          <div className="project-list">
            {projects.map(
              ([num, title, type, desc, tags, status, siteUrl, githubUrl]) => (
                <article className="source-project" key={title}>
                  <a
                    className="project-hit"
                    href={`/projects/${projectSlug(title)}`}
                    aria-label={`Voir le détail du projet ${title}`}
                  />
                  <div className="project-number">{num}</div>
                  <div className="project-main">
                    <div className="project-type">
                      {type} <span>{status}</span>
                    </div>
                    <h3>{title}</h3>
                    <p>{desc}</p>
                    <div className="project-tags">
                      {tags.map(tag => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                    {(siteUrl || githubUrl) && (
                      <div className="project-actions">
                        {siteUrl && (
                          <a
                            href={siteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={event => event.stopPropagation()}
                          >
                            Voir le site <ArrowUpRight size={13} />
                          </a>
                        )}
                        {githubUrl && (
                          <a
                            href={githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={event => event.stopPropagation()}
                          >
                            GitHub <Github size={13} />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="project-link">
                    <ArrowUpRight size={18} />
                  </span>
                </article>
              )
            )}
          </div>
        </section>

        <section
          id="certifications"
          className="source-section certifications-section"
        >
          <div className="source-label">
            04 <span /> CERTIFICATIONS
          </div>

          <div className="section-intro certification-intro">
            <h2>
              Mes <em>certifications</em>
            </h2>
            <p>
              Des formations qui renforcent ma compréhension des usages
              numériques et ma capacité à accompagner des projets responsables.
            </p>
          </div>

          <div className="certification-list">
            {certifications.map(certification => (
              <article className="certification-card" key={certification.name}>
                <div className="certification-image-wrap">
                  <img
                    className="certification-image"
                    src={certification.image}
                    alt={`Certificat ${certification.name}`}
                  />
                </div>

                <div className="certification-content">
                  <span className="certification-label">
                    {certification.result}
                  </span>
                  <h3>{certification.name}</h3>
                  <p className="certification-issuer">{certification.issuer}</p>
                  <p className="certification-description">
                    {certification.description}
                  </p>
                </div>

                <time dateTime="2025-07-11">{certification.date}</time>
              </article>
            ))}
          </div>
        </section>

        <section id="contact" className="source-section contact-section">
          <div className="source-label">
            05 <span /> CONTACT
          </div>
          <div className="contact-grid">
            <div>
              <h2>
                Travaillons
                <br />
                <em>ensemble.</em>
              </h2>
              <p>
                Disponible pour des missions freelance, des stages ou des
                collaborations académiques.
              </p>
              <div className="contact-links">
                <a href="mailto:yvanossey6@gmail.com">
                  <Mail size={15} /> yvanossey6@gmail.com
                </a>
                <a href="tel:+2250767214818">
                  <Phone size={15} /> +225 07 67 21 48 18
                </a>
                <a
                  href="https://linkedin.com/in/yvan-ossey-7a7621337/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Linkedin size={15} /> linkedin.com/in/yvan-ossey
                </a>
              </div>
            </div>
            <div className="contact-form-wrap">
              {sent ? (
                <div className="form-sent">
                  <Check size={28} />
                  <h3>Message prêt à partir.</h3>
                  <p>
                    Merci pour ton message. Tu peux aussi me joindre directement
                    par téléphone ou e-mail.
                  </p>
                </div>
              ) : (
                <form onSubmit={submitContact}>
                  <div className="form-row">
                    <label>
                      Prénom
                      <input name="prenom" required placeholder="Yvan" />
                    </label>
                    <label>
                      Nom
                      <input name="nom" required placeholder="Ossey" />
                    </label>
                  </div>

                  <label>
                    E-mail
                    <input
                      name="email"
                      required
                      type="email"
                      placeholder="vous@exemple.com"
                    />
                  </label>

                  <label>
                    Message
                    <textarea
                      name="message"
                      required
                      placeholder="Décrivez votre projet..."
                    />
                  </label>

                  {submitError && <p className="form-error">{submitError}</p>}

                  <button
                    className="source-btn primary"
                    type="submit"
                    disabled={sending}
                  >
                    {sending ? "Envoi en cours..." : "Envoyer le message"}
                    {!sending && <ArrowUpRight size={16} />}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>
      <footer className="source-footer">
        <span>[YVAN.DEV]</span>
        <small>© 2026 — Ossey Yvan Jean De Kenty</small>
        <div>
          <a
            href="https://github.com/YvanOssey"
            target="_blank"
            rel="noreferrer"
          >
            <Github size={16} />
          </a>
          <a
            href="https://www.linkedin.com/in/yvan-ossey-7a7621337/"
            target="_blank"
            rel="noreferrer"
          >
            <Linkedin size={16} />
          </a>
        </div>
      </footer>
    </div>
  );
}
