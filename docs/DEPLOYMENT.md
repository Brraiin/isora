# Isora - mise en production

Cette procedure est la reference pour publier Isora. Le projet canonique est:

```bash
cd "/Users/eve/Web dev/Isora"
```

## Etat de production

- Repo GitHub: https://github.com/Brraiin/isora
- Branche de production: `main`
- Projet Vercel: `isora`
- URL Vercel actuelle: https://isora-xi.vercel.app
- Build command Vercel: `npm run build`
- Output directory Vercel: `dist`

Vercel est connecte au repo GitHub. Un push sur `main` declenche automatiquement un deploiement.

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
```

Le statut doit etre `Ready`.

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

La voie normale ne passe pas par GitHub Actions ni par une cle OpenAI API. Elle passe par l'automatisation Codex app `Veille quotidienne Isora`, active tous les matins vers 07:30 heure de Paris.

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

Avant de publier manuellement une veille, verifier :

```bash
npm run seo
npm run build
```

Le script `npm run blog:daily` reste un mode API optionnel, mais il n'est pas utilise par defaut car Eve veut utiliser Codex sans cle OpenAI API.

Pour consulter les retours sans exposer de page publique, utiliser la vue non referencee:

```text
https://isora-xi.vercel.app/?admin=contributions
```

Cette vue n'est liee nulle part dans le site et force `noindex,nofollow`. Elle affiche les retours sauvegardes dans le navigateur courant et, en production avec `GITHUB_ISSUE_TOKEN`, les issues GitHub ouvertes portant le label `contribution`.

## Domaine IONOS

Quand le domaine definitif est connu, l'ajouter d'abord au projet Vercel, puis suivre les enregistrements DNS indiques par Vercel:

```bash
npm exec -- vercel domains add exemple.fr
npm exec -- vercel domains inspect exemple.fr
```

Chez IONOS, la configuration habituelle est:

- domaine racine `@`: record `A` vers `76.76.21.21`
- sous-domaine `www`: record `CNAME` vers la cible indiquee par Vercel, souvent `cname.vercel-dns-0.com`

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
