# Isora - mise en production

Cette procedure est la reference pour publier Isora. Le projet canonique est:

```bash
cd "/Users/eve/Web dev/Isora"
```

## Etat de production

- Repo GitHub: https://github.com/Brraiin/isora
- Branche de production: `main`
- Projet Vercel: `isora`
- Domaine public principal: https://isora.info
- URL Vercel technique: https://isora-xi.vercel.app
- Build command Vercel: `npm run build`
- Output directory Vercel: `dist`

Vercel est connecte au repo GitHub. Un push sur `main` declenche automatiquement un deploiement.

## Tests bloquants avant chaque mise en production

Ces tests sont obligatoires avant de pousser sur `main`, meme pour une petite correction. Ne pas publier si une fonctionnalite marche seulement dans un worktree local, un fichier non suivi, ou un diff qui n'est pas committe.

### 1. Etat Git et dependances

```bash
git status --short
git diff
npm ci
```

- `git status --short` doit montrer tous les fichiers a publier avant le commit.
- Les fichiers non suivis importants doivent etre ajoutes ou volontairement ecartes.
- Verifier en particulier les fichiers de recherche: `src/search.ts`, `scripts/sync-algolia.mjs`, `package.json`, `package-lock.json` et les variables Vercel `VITE_ALGOLIA_APP_ID`, `VITE_ALGOLIA_SEARCH_KEY`, `VITE_ALGOLIA_INDEX_NAME`.

### 2. Build et generation

```bash
npm run build
```

Le build est bloquant. Si la publication modifie les traductions ou annonce un etat bilingue complet, lancer aussi:

```bash
npm run i18n:check
```

Si les fiches ou les articles ont change et que les variables d'administration Algolia sont disponibles, resynchroniser les index:

```bash
npm run search:sync
```

### 3. Tests navigateur en local

Lancer une preview locale puis tester au navigateur:

```bash
npm run preview
```

Tests minimum:

- Accueil `/`: la page charge, pas d'overlay Vite/React, pas d'erreur console bloquante.
- Recherche exacte: chercher `masculinisme`; des fiches sortent et les mots correspondants sont entoures par des balises `<mark>`.
- Recherche avec faute: chercher `masculinsme` ou `paternite`; la recherche doit rester tolerante, afficher des fiches pertinentes et surligner les termes proches.
- Repli sans Algolia: si les variables `VITE_ALGOLIA_*` ne sont pas presentes en local, la recherche fuzzy locale doit quand meme fonctionner et surligner.
- Bouton de remise a zero: "Tout effacer" doit vider la recherche, retirer les filtres et restaurer la liste complete.
- Filtres: sexe, angle, domaine, zone, statut, periode et tags doivent pouvoir etre actives puis desactives.
- Fiche directe: `/fiches/hommes-vocabulaire-masculinisme-pejoratif/` doit afficher une seule fiche, les sources et le bouton de retour/copie sans erreur.
- Lexique `/lexique/`: le menu, le gabarit, le titre de page `isora - lexique` et le contenu doivent etre stables.
- Blog `/blog/`: la liste charge, la recherche interne du blog fonctionne, un article s'ouvre.
- Navigation douce: accueil -> lexique -> blog -> article -> retour accueil ne doit pas dupliquer le header, casser les scripts ou provoquer de saut visuel important.
- Titres navigateur: chaque route testee doit commencer par `isora - ...`.
- Favicon: `/favicon.ico` et `/site.webmanifest` doivent repondre.
- Cookies/analytics: le bouton de preferences cookies s'ouvre; apres navigation douce, les scripts d'analytics et de consentement restent fonctionnels.
- Mobile: tester au moins une largeur proche de `390x844`; pas de texte qui se chevauche, pas de menu decale, pas de carte inutilisable.

### 4. Tests production apres deploiement

Apres le push et le deploiement Vercel, refaire les tests critiques sur le domaine public, pas seulement sur l'URL technique:

```text
https://isora.info
```

Verifier aussi:

```bash
npm exec -- vercel inspect isora-xi.vercel.app
npm exec -- vercel domains inspect isora.info
```

- Le deploiement doit etre `Ready`.
- Le domaine `isora.info` doit pointer vers le deploiement attendu.
- Les logs Vercel ne doivent pas montrer d'erreur runtime nouvelle.
- La recherche typo + surlignage doit etre testee en production apres chaque mise en prod qui touche `src/App.tsx`, `src/search.ts`, Algolia, les donnees de fiches, le build ou les variables Vercel.

### Recherche Algolia

La recherche publique a deux niveaux:

- un repli local fuzzy, embarque dans le bundle, qui tolere les fautes courantes et produit les surlignages `<mark>` sans variable externe;
- Algolia, utilise seulement si les variables publiques suivantes existent au build Vercel: `VITE_ALGOLIA_APP_ID`, `VITE_ALGOLIA_SEARCH_KEY`, `VITE_ALGOLIA_INDEX_NAME`.

Pour synchroniser les index Algolia depuis un environnement qui possede la cle d'administration:

```bash
ALGOLIA_APP_ID=... ALGOLIA_ADMIN_KEY=... npm run search:sync
```

Ne jamais committer les cles Algolia. Les ajouter dans Vercel avec `vercel env add` ou depuis l'interface Vercel, puis redeployer pour que les variables `VITE_` soient injectees au build.

## Avant de publier

1. Verifier le dossier courant:

```bash
pwd
```

Il doit afficher:

```text
/Users/eve/Web dev/Isora
```

2. Verifier les changements:

```bash
git status --short
git diff
```

Ne pas embarquer de changements locaux non demandes. En particulier, `src/data/claims.ts` peut contenir des fiches en cours de travail.

3. Monter la version de l'app avant chaque mise en production:

```bash
npm version patch --no-git-tag-version
```

Adapter le niveau (`patch`, `minor`, `major`) selon l'ampleur de la publication. Le numero affiche dans `?admin=contributions` vient de `package.json`.

4. Tester le build:

```bash
npm run build
```

Le build doit passer avant tout push.

5. Pour verifier l'etat multilingue complet:

```bash
npm run i18n:check
```

Ce check est bloquant seulement si la publication annonce un site integralement traduit. Il peut echouer tant que
les fiches n'ont pas toutes une traduction anglaise relue dans `src/data/claims.ts`.

Etat multilingue actuel:

- l'interface publique FR/EN est pilotee par le selecteur du header;
- `npm run build` regenere les exports FR/EN (`llms*.txt`, `isora-dataset*.json`);
- les fiches sans `translations.en` restent en francais dans la vue anglaise.

## Publier une modification

Depuis `/Users/eve/Web dev/Isora`:

```bash
git status --short
git add <fichiers-a-publier>
git commit -m "Message clair"
git push origin main
```

Ensuite verifier le deploiement:

```bash
npm exec -- vercel inspect isora-xi.vercel.app
npm exec -- vercel domains inspect isora.info
```

Le deploiement doit etre `Ready` et le domaine doit pointer vers Vercel.

## Deploiement manuel Vercel

Si un deploiement manuel est necessaire:

```bash
npm run build
npm exec -- vercel --prod
```

Utiliser cette voie seulement si le deploiement GitHub automatique ne convient pas.

## Lier ou verifier GitHub et Vercel

Le remote attendu est:

```bash
git remote -v
```

```text
origin  git@github.com:Brraiin/isora.git (fetch)
origin  git@github.com:Brraiin/isora.git (push)
```

Si le projet Vercel perd son lien GitHub:

```bash
npm exec -- vercel git connect git@github.com:Brraiin/isora.git
```

## Contributions et contestations

Les formulaires publics envoient les suggestions et contestations vers l'endpoint Vercel:

```text
/api/contributions
```

L'endpoint cree une issue GitHub structuree dans `Brraiin/isora`. Pour l'activer en production, ajouter dans Vercel une variable d'environnement:

```text
GITHUB_ISSUE_TOKEN
```

Le token doit avoir le droit de creer des issues sur le depot `Brraiin/isora`. Sans cette variable, les formulaires restent sauvegardes localement dans le navigateur de l'utilisateur mais ne sont pas transmis.

## Blog quotidien

La voie normale ne passe pas par GitHub Actions ni par une cle OpenAI API. Elle passe par l'automatisation Codex app `Veille quotidienne Isora`, active tous les jours vers 20:30 heure de Paris.

Cette automatisation travaille dans :

```text
/Users/eve/Web dev/Isora
```

Elle doit :

- faire la veille web avec Codex;
- creer un article JSON dans `content/blog/posts/`;
- regenerer `public/blog/`, `public/sitemap.xml`, `public/llms.txt`, `public/llms-en.txt` et `public/ai.txt`;
- lancer `npm run build`;
- commit et push sur `main` si le build passe.

Le commit sur `main` declenche ensuite le deploiement Vercel habituel.

Si l'ordinateur etait eteint a l'heure prevue, lancer manuellement l'automatisation `Veille quotidienne Isora` depuis Codex des que la machine est disponible. A defaut, demander dans un thread Codex : "Lance la veille quotidienne Isora maintenant".

Avant de publier manuellement une veille, verifier :

```bash
npm run seo
npm run build
```

Le script `npm run blog:daily` reste un mode API optionnel, mais il n'est pas utilise par defaut car Eve veut utiliser Codex sans cle OpenAI API.

Pour consulter les retours sans exposer de page publique, utiliser la vue non referencee:

```text
https://isora.info/?admin=contributions
```

Cette vue n'est liee nulle part dans le site et force `noindex,nofollow`. Elle affiche les retours sauvegardes dans le navigateur courant et, en production avec `GITHUB_ISSUE_TOKEN`, les issues GitHub ouvertes portant le label `contribution`.

## Domaine IONOS

Le domaine public principal d'Isora est:

```text
https://isora.info
```

Etat au 25 juin 2026:

- `isora.info` est ajoute au projet Vercel `isora`.
- `www.isora.info` est ajoute au projet Vercel `isora`.
- `www.isora.info` redirige vers `isora.info` en `308`.

Configuration DNS IONOS:

| Nom d'hote | Type | Valeur |
| --- | --- | --- |
| `@` | `A` | `76.76.21.21` |
| `www` | `CNAME` | `cname.vercel-dns-0.com` |

Ne pas supprimer les records mail IONOS (`MX`, `TXT`, `_dmarc`, `domainkey`, `autodiscover`). Ne pas creer a la fois un `A` et un `CNAME` pour `www`.

Toujours preferer la sortie de `vercel domains inspect` aux valeurs generiques, car Vercel peut demander un TXT de verification.

## FTP IONOS, en secours seulement

Isora est une app statique Vite. En secours, il est possible d'envoyer le contenu de `dist/` par FTP:

```bash
npm run build
```

Uploader le contenu de `dist/` dans la racine web IONOS:

- `index.html`
- dossier `assets/`

Ne pas uploader le dossier `dist` lui-meme. Cette methode est moins pratique que Vercel et ne doit pas etre la voie normale.

## Fichiers a ne pas commiter

Ces fichiers/dossiers sont generes ou locaux:

- `dist/`
- `node_modules/`
- `.vercel/`
- `isora-dist.zip`
- `*.tsbuildinfo`
