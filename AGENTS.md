# isora agent instructions

Read this file before answering or changing anything in this repository.

## Canonical project

- Work only in `/Users/eve/Web dev/Isora` for the current isora app.
- Do not use old copies under `/Users/eve/Documents/...` unless the user explicitly says so.
- Visible brand: `isora`, lowercase. In HTML/UI prose, render the word in italics when it refers to the site.
- Package npm: `isora`
- Stack: React + TypeScript + Vite + Tailwind CSS
- Interface language: French
- Blog / veille IA+SEO: this belongs to this repo too. If the user mentions isora blog, daily article, scraping, veille, SEO for AI, llms, or "un article tous les matins", work in `/Users/eve/Web dev/Isora`, not in `RGAA-auto`.
- User shorthand: when Eve asks to "faire un article", "fais un article", "article et asymétrie", or similar without naming another project, treat it as an Isora article request and work in this repo.

## Required context

Before code changes, read:

- `/Users/eve/Documents/Codex/Isora/ISORA_PROJECT_CONTEXT.md`
- `docs/AI_AGENTS.md` if the task touches AI-readable files, blog generation, daily watch, SEO, llms, sitemap, or datasets
- `docs/DEPLOYMENT.md` if the task touches production, GitHub, Vercel, IONOS, DNS, builds, or release workflow

## Deployment

Production is documented in `docs/DEPLOYMENT.md`.

Current production setup:

- GitHub repo: `git@github.com:Brraiin/isora.git`
- GitHub URL: `https://github.com/Brraiin/isora`
- Production branch: `main`
- Vercel project: `isora`
- Current Vercel URL: `https://isora-xi.vercel.app`

A push to `main` triggers a Vercel production deployment.

Before publishing:

```bash
pwd
git status --short
npm run build
```

The working directory must be `/Users/eve/Web dev/Isora`, and `npm run build` must pass.

## Safety rules

- Preserve existing local changes. Never revert user changes unless explicitly asked.
- Check `git status --short` before edits and before commits.
- Do not commit unrelated local changes.
- Do not edit `dist/` by hand.
- Do not commit generated/local files such as `dist/`, `node_modules/`, `.vercel/`, `isora-dist.zip`, or `*.tsbuildinfo`.
- Keep all visible app text in French.
- Use `rg` for searches.

## Editorial neutrality

- isora must stay as neutral and factual as possible.
- Present documented facts, measured populations, dates, ratios, source scope, and limits of interpretation.
- Do not use partisan, rhetorical, or mind-reading formulations such as "qu'attendu", "casse l'idée", "prouve que", "donc aussi", "les gens pensent", or similar shortcuts.
- Do not infer intent or social meaning beyond what sources establish. Prefer formulations like "la source mesure", "les donnees indiquent", "le droit visait", "les resultats varient selon".
- When an asymmetry affects both sexes differently, state both sides plainly before explaining where the documented asymmetry is stronger. Example: "moyens contraceptifs pour les hommes, comme les preservatifs, et moyens contraceptifs pour les femmes", then explain the additional pregnancy, birth, medical, legal, or social burden where sourced.
- Nuance blocks should clarify scope without defending a side: what is measured, what is not measured, what can and cannot be concluded.

## Key files

- `src/App.tsx`: main UI, layout, filters, cards, contribution form
- `src/data/claims.ts`: claim data, sources, tags, domains, metadata
- `src/styles.css`: Tailwind import/styles
- `src/assets/isora.svg`: logo
- `content/blog/watch-config.json`: daily blog watch topics and source priorities
- `content/blog/posts/`: generated article memory, one JSON file per published blog post
- Codex app automation `Veille quotidienne isora`: daily no-API blog watch, article generation, build, commit and push
- `scripts/generate-daily-blog.mjs`: optional OpenAI API fallback generator, not the default workflow
- `scripts/blog-utils.mjs`: static blog renderer, RSS, JSON index, llms-blog, sitemap helpers
- `docs/DEPLOYMENT.md`: production and DNS workflow
