# Portfolio — Yvan Ossey

Site statique, sans framework ni build : HTML, CSS et JavaScript (modules ES).

- `index.html` — structure de la page
- `styles.css` — direction artistique (coton brut, encre, couleurs du kente)
- `main.js` — métier à tisser (canvas), échantillons de projets, fiches projet et transitions
- `data.js` — **tout le contenu** : projets, compétences. C'est le seul fichier à modifier pour ajouter un projet.

## Lancer en local

```bash
python -m http.server 5173
```

Puis ouvrir http://localhost:5173 (un serveur est nécessaire à cause des modules ES).

## Ajouter un projet

Ajouter un objet dans `PROJECTS` (`data.js`). Le champ `image` pointe vers une capture du projet
dans `img/` (avec `position` pour le cadrage et `alt` pour la description) ; `null` affiche une carte
« capture à venir ». `roleTitle` (facultatif) affiche ton rôle en tête de la page projet.

## Déployer

Fonctionne tel quel sur GitHub Pages, Netlify, Vercel ou Cloudflare Pages (dossier racine, aucune commande de build).

Sur Vercel, `vercel.json` désactive l'installation et la compilation (site statique servi depuis la racine)
et règle le cache : la page est toujours revalidée, les images et logos sont gardés une semaine.

**Aperçu de partage** : `og-image.jpg` (1200 × 630) est déclarée dans les balises `og:` et `twitter:` de
`index.html`, avec l'adresse `https://yvanossey-dev.vercel.app`. Si le domaine change, remplacer cette
adresse dans `index.html` (canonical, og:url, og:image, twitter:image).

**Après chaque mise à jour de CSS ou de JS**, incrémenter le `?v=` de `styles.css`, `main.js` (dans
`index.html`) et de `data.js` (dans l'import en tête de `main.js`) pour que les visiteurs reçoivent la
nouvelle version.

## Logo

Monogramme « YO » : un Y tracé à la main, entouré d'un O griffonné, avec un coup de surligneur bleu.

- `logo/yo-mark.svg` — version encre (fonds clairs) ; `logo/yo-mark-light.svg` — version crème (fonds sombres)
- `logo/yo-mark-1024.png`, `logo/yo-mark-light-1024.png` — exports PNG transparents
- `logo/favicon.svg`, `logo/favicon-32.png`, `logo/apple-touch-icon.png` — icônes d'onglet et d'écran d'accueil
- `logo/planche-logo.png` — planche de présentation (clair / sombre, tailles réduites)

Dans la barre du site, le logo est en SVG intégré : il suit le thème et se dessine au chargement.
