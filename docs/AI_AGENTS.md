# Isora - documentation pour IA et agents

Isora publie des fichiers lisibles par les moteurs de recherche, crawlers et agents IA.

Le domaine canonique est `https://isora.info`. L'URL technique Vercel ne doit pas
etre utilisee dans les canonicals, le sitemap, les identifiants JSON-LD ou les exports.
L'exploration et l'indexation ne garantissent ni classement ni citation par une IA.

## Fichiers publics

- `/llms.txt` : guide agent en francais.
- `/llms-en.txt` : guide agent en anglais.
- `/blog/` : index statique du blog quotidien.
- `/blog/feed.xml` : flux RSS du blog.
- `/blog/index.json` : index JSON des articles.
- `/blog/llms-blog.txt` : guide agent dedie au blog.
- `/fiches/` : index HTML statique de toutes les fiches, lisible sans JavaScript.
- `/fiches/<id>/` : page HTML statique canonique d'une fiche, avec sources et JSON-LD.
- `/lexique/` : lexique HTML statique des reperes editoriaux et confusions a eviter.
- `/methode/` : methode editoriale publique, limites, role de l'IA et corrections.
- `/isora-dataset.json` : dataset JSON francais.
- `/isora-dataset-en.json` : dataset JSON anglais.
- `/ai.txt` : politique courte d'acces IA.
- `/.well-known/ai.txt` : copie de la politique courte d'acces IA.
- `/sitemap.xml` : liste les pages HTML canoniques indexables.

L'accueil contient une presentation et des liens utiles dans le HTML initial,
avant l'execution de React. Les fiches et articles restent consultables sans JavaScript.
Les fichiers `llms.txt` sont des complements documentaires, pas des leviers de classement garantis.

## Multilingue public

Le code de l'interface prend en charge deux langues, mais le selecteur du header
est actuellement desactive. Il n'existe pas de routes HTML anglaises distinctes :

- `FR` affiche les libelles francais.
- `EN` affiche les libelles anglais.

Le choix est conserve dans `localStorage` avec la cle `isora:locale`. Le code met aussi a jour
`document.documentElement.lang` pour que le document annonce correctement `fr` ou `en`.

Les textes d'interface sont centralises dans `src/App.tsx` :

- `uiText.fr` et `uiText.en` pour les libelles generaux.
- `sideLabelsByLocale` pour les groupes.
- `angleLabelsByLocale` pour les angles editoriaux.
- `periodFilterLabelsByLocale` pour les statuts temporels.

Les contenus de fiches restent stockes dans `src/data/claims.ts`. Une fiche peut ajouter une version anglaise
relue dans `translations.en`. Tant qu'une fiche n'a pas cette traduction relue, l'interface anglaise conserve
le texte source francais pour la fiche elle-meme. Ce repli est volontaire : ne pas publier de traduction non relue
comme si elle etait definitive.

L'export anglais precise `translationStatus` : `reviewed` lorsque la fiche dispose
d'une traduction, ou `source-language-fallback` lorsque le contenu francais est conserve.
Les exports conservent aussi les libelles de population de la source, la mesure ou
non des chromosomes et la date de consultation. Ne pas annoncer une traduction complete.

Avant d'annoncer que le site est integralement bilingue, lancer :

```bash
npm run i18n:check
```

Ce check doit passer. S'il echoue, il liste les fiches dont `translations.en` manque encore.

## Generation automatique

La commande suivante regenere toujours les deux versions :

```bash
npm run seo
```

Le build Vite lance aussi la generation via `prebuild` :

```bash
npm run build
```

`prebuild` controle les canonicals, le sitemap, le JSON-LD, les liens internes,
les dates et les metadonnees des exports IA. Tests dedies :

```bash
npm run seo:test
npm run seo:check
```

Les dates `lastmod` et `dateModified` correspondent aux verifications, mises a jour
editoriales et modifications significatives des gabarits. Ne jamais remplacer
ces dates par celle de chaque build. La constante `seoReleaseDate` du generateur
est avancee seulement lors d'une vraie modification des gabarits publics ou de la methode.

## Blog quotidien IA + SEO

Le blog quotidien Isora vit dans ce projet, au chemin canonique :

```text
/Users/skynn/Web dev/Isora
```

Ne pas chercher cette automatisation dans `RGAA-auto` : `RGAA-auto` sert aux audits RGAA, tandis que le blog de veille publique appartient a Isora.

La configuration editoriale est dans :

- `content/blog/watch-config.json` : themes, priorites de sources, seuils qualite.
- `content/blog/posts/` : memoire des articles publies, un JSON par article.
- Automatisation Codex app `Veille quotidienne Isora` : voie normale, sans cle API, lancee tous les jours vers 20:30.
- `scripts/blog-utils.mjs` : rend les pages HTML statiques, RSS, JSON, `llms-blog.txt` et les entrees sitemap.
- `scripts/generate-seo.mjs` : genere aussi les pages statiques `/fiches/`, `/fiches/<id>/`, `/lexique/` et `/methode/`, l'accueil HTML initial, les metadonnees du site, le sitemap, `llms.txt`, `llms-en.txt`, `ai.txt`, `/.well-known/ai.txt` et les datasets publics.
- `scripts/generate-daily-blog.mjs` : voie optionnelle par API OpenAI, utile seulement si une cle API est ajoutee plus tard.

Commandes utiles :

```bash
npm run seo
npm run build
```

La veille quotidienne ne depend pas de `OPENAI_API_KEY` : Codex fait la recherche, cree le JSON d'article, regenere les sorties publiques, lance le build, commit et pousse sur GitHub. Le script `npm run blog:daily` reste disponible comme mode API optionnel, mais ce n'est pas le chemin normal du projet.

Si l'ordinateur etait eteint a l'heure prevue, lancer manuellement l'automatisation `Veille quotidienne Isora` depuis Codex des que la machine est disponible. A defaut, demander dans un thread Codex : "Lance la veille quotidienne Isora maintenant".

Principes editoriaux du blog :

- publier une synthese originale, pas une recopie de source;
- citer au moins trois sources valides par defaut;
- conserver pays, periode, population mesuree et limites;
- refuser les generalisations hostiles ou militantes;
- ne pas transformer une categorie statistique de source en preuve chromosomique stricte;
- renseigner `relatedClaimIds` avec les IDs des fiches existantes quand un article actualise ou contextualise leur donnee; `npm run seo` regenere ensuite les tuiles de la home depuis cette relation;
- produire une page HTML statique indexable, avec schema.org `BlogPosting`, FAQ, canonical, RSS et entree sitemap.

### Terminologie féminisme / masculinisme

Avant d'utiliser une source qui emploie `masculinisme`, lire et appliquer :

```text
/Users/skynn/Web dev/Isora/docs/TERMINOLOGIE_MASCULINISME.md
```

Conserver le titre exact et les citations de la source, mais ne jamais reprendre
automatiquement sa qualification. Isora réserve `masculinisme` au combat contre
les asymétries en défaveur des garçons et des hommes. Requalifier séparément,
selon le contenu observable, l'antiféminisme, le virilisme, la misogynie, la
violence ou la misandrie. Ne jamais assimiler une revendication masculine
pacifique à l'une de ces catégories sans preuve.

## Veille et nouvelles fiches

`scripts/research-agent.mjs` demande aux agents de veille de produire chaque proposition avec deux blocs :

- `fr` pour la version francaise.
- `en` pour la version anglaise.

La version anglaise doit traduire le sens editorial sans ajouter de fait absent de la version francaise. Les sources restent identiques entre les deux versions.

## Tracabilite des fiches modifiees

Toute modification d'une fiche ou card d'asymetrie dans `src/data/claims.ts`
doit laisser une trace visible dans la fiche:

- mettre `lastChecked` a la date du jour;
- ajouter ou ajuster le detail utile dans `nuance`, `source`,
  `additionalSources`, `sourcePopulation`, `confidence` ou les metadonnees;
- mettre a jour `sourcePopulationLabels` et `claimMetadata` si le perimetre, la
  periode, la zone, le statut ou la population mesuree changent;
- mettre a jour `translations.en` quand la fiche possede une traduction relue;
- ne pas modifier silencieusement un chiffre, une source ou une formulation
  importante.
- si une video reseau social declenche un bandeau public de fiche modifiee,
  afficher la source primaire ou institutionnelle de l'edit, pas la video, le
  compte ou l'influenceur.
- la source externe affichee dans un bandeau de fiche modifiee doit aussi etre
  presente dans `source` ou `additionalSources`, pour apparaitre en fin de card;
  son libelle visible en bas doit identifier le document, pas seulement l'editeur
  ou la date; `npm run seo` valide ce point pour
  `src/data/manual-claim-updates.json`.

Apres modification de fiches, regenerer les sorties publiques avec `npm run seo`
et verifier avec `npm run build`. Le compte-rendu final doit nommer les fiches
modifiees et confirmer que la date et le detail ont ete mis a jour.

## Vocabulaire cliquable

Les articles, fiches et tuiles d'asymetrie rendent automatiquement les termes
declares dans `src/data/lexicon.ts` cliquables vers leur definition dans
`/lexique/`, avec l'infobulle accessible « Voir la definition dans le lexique ».
Lors de l'ajout d'un terme editorial, renseigner ses variantes francaises et
anglaises dans son champ `forms`; ne pas coder une liste parallele dans un
composant ou un generateur.

`antifeminisme` designe l'opposition de principe au feminisme ou la
disqualification systematique des combats feministes pacifiques.
`antimasculinisme` designe symetriquement l'opposition de principe au
masculinisme ou la disqualification systematique des combats masculinistes
pacifiques. Un desaccord ponctuel avec une statistique, une methode ou une
revendication ne suffit pas a retenir l'un de ces termes.

## Traductions dans les donnees

Une fiche peut porter une traduction anglaise relue dans `src/data/claims.ts` via `translations.en` :

```ts
translations: {
  en: {
    title: "...",
    summary: "...",
    nuance: "...",
    sourcePopulation: "...",
    tags: ["..."]
  }
}
```

Si une fiche n'a pas encore de traduction relue, les fichiers anglais conservent le texte source francais et indiquent explicitement que la traduction reste a ajouter.
