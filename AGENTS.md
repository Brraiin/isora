# Isora agent instructions

Read this file before answering or changing anything in this repository.

## Canonical project

- Work only in `/Users/eve/Web dev/Sexite` for the current Isora app.
- Do not use old copies under `/Users/eve/Documents/...` unless the user explicitly says so.
- Visible brand: `Isora`
- Historical technical name / package: `sexite`
- Stack: React + TypeScript + Vite + Tailwind CSS
- Interface language: French

## Required context

Before code changes, read:

- `/Users/eve/Documents/Codex/ISORA_PROJECT_CONTEXT.md`
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

The working directory must be `/Users/eve/Web dev/Sexite`, and `npm run build` must pass.

## Safety rules

- Preserve existing local changes. Never revert user changes unless explicitly asked.
- Check `git status --short` before edits and before commits.
- Do not commit unrelated local changes.
- Do not edit `dist/` by hand.
- Do not commit generated/local files such as `dist/`, `node_modules/`, `.vercel/`, `isora-dist.zip`, or `*.tsbuildinfo`.
- Keep all visible app text in French.
- Use `rg` for searches.

## Key files

- `src/App.tsx`: main UI, layout, filters, cards, contribution form
- `src/data/claims.ts`: claim data, sources, tags, domains, metadata
- `src/styles.css`: Tailwind import/styles
- `src/assets/isora.svg`: logo
- `docs/DEPLOYMENT.md`: production and DNS workflow

