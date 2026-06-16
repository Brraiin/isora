# Isora - mise en production

Cette procedure est la reference pour publier Isora. Le projet canonique est:

```bash
cd "/Users/eve/Web dev/Sexite"
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
/Users/eve/Web dev/Sexite
```

2. Verifier les changements:

```bash
git status --short
git diff
```

Ne pas embarquer de changements locaux non demandes. En particulier, `src/data/claims.ts` peut contenir des fiches en cours de travail.

3. Tester le build:

```bash
npm run build
```

Le build doit passer avant tout push.

## Publier une modification

Depuis `/Users/eve/Web dev/Sexite`:

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
