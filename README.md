# Portfolio — Yvan Ossey

Site personnel en « carnet d'ingénieur » : papier quadrillé, surligneur, fiches à lancer, mode sombre.
Écrit en **React 19 + TypeScript**, construit avec **Vite**, hébergé sur **Vercel** : https://yvanossey-dev.vercel.app

## Structure

```
index.html              page d'entrée (balises de partage, thème initial, version sans JavaScript)
public/                 fichiers servis tels quels : cv/, img/ (captures), logo/, og-image.jpg
src/
  main.tsx              démarrage de React
  App.tsx               navigation par ancre (#/projet/…) et transition « coup de surligneur »
  styles.css            toute la direction artistique (thèmes clair et sombre)
  data/projects.ts      tout le contenu, typé : projets (Project) et compétences (SkillGroup)
  lib/util.ts           petites aides partagées (numérotation, tampons, projets par techno)
  hooks/                useTheme (clair/sombre), useReveal / useHighlights (apparitions à l'écran)
  components/           Header (logo, menu, bouton de thème), Shot (capture d'un projet)
  sections/             Hero, Deck (fiches à lancer), Pile (rangée qui s'empile), Parcours, Stack (clavier), Contact (carte postale)
  pages/ProjectPage.tsx page détaillée d'un projet, avec zoom de la capture
```

Les interactions continues (glisser-lancer des fiches, rangée pilotée par le défilement, frise) écrivent
leurs positions directement sur les éléments via des refs : passer par l'état React à chaque image
serait inutilement coûteux. Le reste (clavier, carte postale, thème, navigation) passe par l'état React.

## Lancer en local

```bash
npm install
npm run dev
```

`npm run build` vérifie les types (`tsc`) puis produit le site dans `dist/` ; `npm run preview` le sert.

## Ajouter un projet

Ajouter un objet dans `PROJECTS` (`src/data/projects.ts`) : TypeScript signale tout champ manquant.
Le champ `image` pointe vers une capture dans `public/img/` (avec `position` pour le cadrage et `alt`
pour la description) ; `null` affiche une carte « capture à venir ». `roleTitle` (facultatif) précise
le rôle dans la fiche technique. Les compteurs (09, « 01 / 09 »…) se mettent à jour tout seuls.

Penser aussi à la liste de secours `<noscript>` dans `index.html`.

## Déployer

Vercel construit le site à chaque fusion sur `main` (`vercel.json` : `npm ci`, `npm run build`, dossier `dist`).
Les fichiers de `assets/` ont un nom qui change à chaque build : ils sont mis en cache un an.
Les captures et logos sont gardés une semaine : après avoir remplacé une capture, changer son `?v=` dans `projects.ts`.

**Aperçu de partage** : `public/og-image.jpg` (1200 × 630) est déclarée dans les balises `og:` et
`twitter:` de `index.html`, avec l'adresse `https://yvanossey-dev.vercel.app`. Si le domaine change,
remplacer cette adresse dans `index.html` (canonical, og:url, og:image, twitter:image).

## Logo

Monogramme « YO » : un Y tracé à la main, entouré d'un O griffonné, avec un coup de surligneur bleu.

- `public/logo/yo-mark.svg` — version encre (fonds clairs) ; `public/logo/yo-mark-light.svg` — version crème (fonds sombres)
- `public/logo/yo-mark-1024.png`, `public/logo/yo-mark-light-1024.png` — exports PNG transparents
- `public/logo/favicon.svg`, `public/logo/favicon-32.png`, `public/logo/apple-touch-icon.png` — icônes d'onglet et d'écran d'accueil
- `public/logo/planche-logo.png` — planche de présentation (clair / sombre, tailles réduites)

Dans la barre du site, le logo est en SVG intégré : il suit le thème et se dessine au chargement.
