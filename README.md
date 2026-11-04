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
  data/content.json     tout le contenu modifiable (projets, compétences, parcours, contact)
  data/schema.ts        types du contenu et validation (partagée avec l'API)
  admin/                espace admin (#/admin), chargé seulement quand on l'ouvre
  lib/util.ts           petites aides partagées (numérotation, tampons, projets par techno)
  hooks/                useTheme (clair/sombre), useReveal / useHighlights (apparitions à l'écran)
  components/           Header (logo, menu, bouton de thème), Shot (capture d'un projet)
  sections/             Hero, Deck (fiches à lancer), Pile (rangée qui s'empile), Parcours, Stack (clavier), Contact (carte postale)
  pages/ProjectPage.tsx page détaillée d'un projet, avec zoom de la capture
api/                    fonctions Vercel : session.ts (connexion), content.ts (contenu), track.ts (mesure d'audience), stats.ts (statistiques)
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

## Espace admin

Adresse : **https://yvanossey-dev.vercel.app/#/admin**. On y modifie les projets (textes, captures, ordre,
ajout, suppression), les compétences, le parcours, l'accueil et le contact, et on remplace le CV.

« Enregistrer et publier » valide le contenu, puis crée **un commit** sur `main` (content.json + fichiers envoyés) ;
Vercel remet le site en ligne en une minute environ. Tout reste versionné dans Git : on peut revenir en arrière.

Sécurité : mot de passe vérifié côté serveur, session par cookie signé (HttpOnly, Secure, SameSite=Strict, 8 h),
requêtes d'écriture acceptées seulement depuis le site lui-même, contenu et fichiers validés (liens http(s)
uniquement, JPEG pour les captures, PDF pour le CV), et le jeton GitHub ne quitte jamais le serveur.

### Variables à définir sur Vercel (Settings → Environment Variables)

| Nom | Valeur |
| --- | --- |
| `ADMIN_PASSWORD` | mot de passe de l'admin (12 caractères minimum) |
| `SESSION_SECRET` | longue chaîne aléatoire (32 caractères minimum) |
| `GITHUB_TOKEN` | jeton GitHub « fine-grained », limité à ce dépôt, permission **Contents : Read and write** |
| `GITHUB_REPO` | facultatif, `YvanOssey/portfolio-yvan-ossey` par défaut |
| `GITHUB_BRANCH` | facultatif, `main` par défaut |

### Statistiques

L'onglet **Statistiques** de l'admin affiche, sur 7, 30 ou 90 jours : pages vues, visiteurs uniques (estimation),
projets les plus consultés, sources de visite, pays, appareils, ouvertures et téléchargements du CV, prises de contact.

La mesure est anonyme (`src/lib/track.ts` → `api/track.ts`) : aucun cookie, aucune adresse IP enregistrée
(les visiteurs uniques sont estimés par des empreintes hachées qui changent chaque jour), robots ignorés,
« Do Not Track » respecté. Le navigateur connecté à l'admin n'est plus compté.

Les compteurs sont stockés dans **Upstash Redis** (offre gratuite), relié au projet depuis Vercel :
**Storage → Create Database → Upstash for Redis**, puis **Connect Project**. Vercel ajoute alors
`KV_REST_API_URL` et `KV_REST_API_TOKEN` ; il suffit de redéployer.

## Modifier le contenu à la main

Tout est dans `src/data/content.json`. `npm run build` vérifie les types ; l'admin et l'API vérifient
la forme du contenu avec `validateContent` (`src/data/schema.ts`). Les captures vont dans `public/img/`
(après avoir remplacé une capture, changer son `?v=`). Penser aussi à la liste `<noscript>` de `index.html`.

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
