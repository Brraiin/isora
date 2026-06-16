# Isora - documentation pour IA et agents

Isora publie des fichiers lisibles par les moteurs de recherche, crawlers et agents IA.

## Fichiers publics

- `/llms.txt` : guide agent en francais.
- `/llms-en.txt` : guide agent en anglais.
- `/isora-dataset.json` : dataset JSON francais.
- `/isora-dataset-en.json` : dataset JSON anglais.
- `/ai.txt` : politique courte d'acces IA.
- `/sitemap.xml` : indexe les fichiers publics principaux.

## Generation automatique

La commande suivante regenere toujours les deux versions :

```bash
npm run seo
```

Le build Vite lance aussi la generation via `prebuild` :

```bash
npm run build
```

## Veille et nouvelles fiches

`scripts/research-agent.mjs` demande aux agents de veille de produire chaque proposition avec deux blocs :

- `fr` pour la version francaise.
- `en` pour la version anglaise.

La version anglaise doit traduire le sens editorial sans ajouter de fait absent de la version francaise. Les sources restent identiques entre les deux versions.

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
