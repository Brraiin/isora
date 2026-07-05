import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";
import {
  buildBlogSitemapEntries,
  htmlEscape,
  loadBlogConfig,
  loadBlogPosts,
  renderBlogAssets,
  renderBlogSummaryForLlms,
  renderSitemapEntries,
} from "./blog-utils.mjs";
import { renderFaviconLinks } from "./favicon-links.mjs";
import { renderStaticHeader, renderStaticHeaderCss } from "./static-header.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const publicDir = join(root, "public");
const publicWellKnownDir = join(publicDir, ".well-known");
const publicClaimsDir = join(publicDir, "fiches");
const publicLexiconDir = join(publicDir, "lexique");
const sourceFile = join(root, "src", "data", "claims.ts");
const lexiconFile = join(root, "src", "data", "lexicon.ts");
const homeBlogUpdatesFile = join(root, "src", "data", "blog-updates.ts");
const manualClaimUpdatesFile = join(root, "src", "data", "manual-claim-updates.json");
const logoFile = join(root, "src", "assets", "isora.svg");
const tempFile = join(root, "node_modules", ".cache", "isora-claims.mjs");
const lexiconTempFile = join(root, "node_modules", ".cache", "isora-lexicon.mjs");
const siteUrl = "https://isora-xi.vercel.app";
const generatedDate = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Paris" });
const generatedAt = `${generatedDate}T00:00:00+02:00`;
const blogConfig = await loadBlogConfig();
const blogPosts = await loadBlogPosts();
const manualClaimUpdates = JSON.parse(await readFile(manualClaimUpdatesFile, "utf8"));

function textLine(value) {
  return String(value).replace(/\s+/g, " ").trim();
}

function slugPath(value) {
  return encodeURIComponent(String(value));
}

function truncateDescription(value, maxLength = 158) {
  const text = textLine(value);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}…`;
}

await mkdir(publicDir, { recursive: true });
await mkdir(publicWellKnownDir, { recursive: true });
await mkdir(dirname(tempFile), { recursive: true });

const source = await readFile(sourceFile, "utf8");
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
    verbatimModuleSyntax: false,
  },
}).outputText;

await writeFile(tempFile, transpiled, "utf8");
const { claims, domains, tagLabels } = await import(`${pathToFileURL(tempFile).href}?t=${Date.now()}`);
await rm(tempFile, { force: true });

const lexiconSource = await readFile(lexiconFile, "utf8");
const lexiconTranspiled = ts.transpileModule(lexiconSource, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
    verbatimModuleSyntax: false,
  },
}).outputText;

await writeFile(lexiconTempFile, lexiconTranspiled, "utf8");
const { lexiconEntries, lexiconNotice } = await import(`${pathToFileURL(lexiconTempFile).href}?t=${Date.now()}`);
await rm(lexiconTempFile, { force: true });

const counts = {
  total: claims.length,
  hommes: claims.filter((claim) => claim.side === "hommes").length,
  femmes: claims.filter((claim) => claim.side === "femmes").length,
  sources: new Set(
    claims.flatMap((claim) => [
      claim.source.url,
      ...(claim.additionalSources?.map((sourceItem) => sourceItem.url) ?? []),
    ]),
  ).size,
};

const lexiconCategoryLabels = {
  repere: "Repère",
  haine: "Haine de sexe",
  methode: "Méthode",
  angle: "Angle d'analyse",
};

function getLexiconCategoryLabel(category) {
  return lexiconCategoryLabels[category] ?? category;
}

function getClaimTranslation(claim, locale) {
  return claim.translations?.[locale] ?? {};
}

function normalizeUrlForMatch(value) {
  if (!value) return "";

  try {
    const url = new URL(String(value));
    url.hash = "";
    const sortedParams = [...url.searchParams.entries()].sort(([leftKey, leftValue], [rightKey, rightValue]) =>
      `${leftKey}=${leftValue}`.localeCompare(`${rightKey}=${rightValue}`),
    );
    url.search = "";
    sortedParams.forEach(([key, paramValue]) => url.searchParams.append(key, paramValue));
    return url.toString().replace(/\/$/, "");
  } catch {
    return textLine(value).replace(/#.*$/, "").replace(/\/$/, "");
  }
}

const claimById = new Map(claims.map((claim) => [claim.id, claim]));
const claimIdsBySourceUrl = new Map();

for (const claim of claims) {
  for (const sourceItem of [claim.source, ...(claim.additionalSources ?? [])]) {
    const sourceUrl = normalizeUrlForMatch(sourceItem.url);
    if (!sourceUrl) continue;

    const claimIds = claimIdsBySourceUrl.get(sourceUrl) ?? [];
    claimIds.push(claim.id);
    claimIdsBySourceUrl.set(sourceUrl, claimIds);
  }
}

function getRelatedClaimIdsForPost(post) {
  const relatedIds = new Set();

  for (const claimId of post.relatedClaimIds ?? []) {
    if (claimById.has(claimId)) {
      relatedIds.add(claimId);
    }
  }

  for (const sourceItem of post.sources ?? []) {
    const sourceUrl = normalizeUrlForMatch(sourceItem.url);
    const matchingClaimIds = claimIdsBySourceUrl.get(sourceUrl) ?? [];
    matchingClaimIds.forEach((claimId) => relatedIds.add(claimId));
  }

  return [...relatedIds];
}

function buildHomeBlogUpdates() {
  const updatesByClaimId = new Map();

  for (const post of blogPosts) {
    for (const claimId of getRelatedClaimIdsForPost(post)) {
      const claim = claimById.get(claimId);
      if (!claim) continue;

      const update = {
        claimId,
        side: claim.side,
        claimTitle: claim.title,
        claimMetric: claim.metric,
        blogTitle: post.title,
        blogUrl: `/blog/${post.slug}/`,
        date: post.date,
        updatedAt: post.updatedAt,
      };
      const current = updatesByClaimId.get(claimId);

      if (!current || String(update.updatedAt).localeCompare(String(current.updatedAt)) > 0) {
        updatesByClaimId.set(claimId, update);
      }
    }
  }

  return [...updatesByClaimId.values()].sort((left, right) => {
    const byUpdate = String(right.updatedAt).localeCompare(String(left.updatedAt));
    return byUpdate || left.claimTitle.localeCompare(right.claimTitle, "fr");
  });
}

function renderHomeBlogUpdatesModule(updates) {
  return `// This file is generated by scripts/generate-seo.mjs. Do not edit by hand.
export type HomeBlogUpdate = {
  claimId: string;
  side: "hommes" | "femmes";
  claimTitle: string;
  claimMetric: string;
  blogTitle: string;
  blogUrl: string;
  date: string;
  updatedAt: string;
};

export const homeBlogUpdates = ${JSON.stringify(updates, null, 2)} as const satisfies readonly HomeBlogUpdate[];
`;
}

function buildClaimUpdatesById(updates) {
  const updatesByClaimId = new Map();

  for (const update of updates) {
    if (!claimById.has(update.claimId)) continue;
    const claimUpdates = updatesByClaimId.get(update.claimId) ?? [];
    claimUpdates.push(update);
    updatesByClaimId.set(
      update.claimId,
      claimUpdates.sort((left, right) => String(right.updatedAt).localeCompare(String(left.updatedAt))),
    );
  }

  return updatesByClaimId;
}

function isSourceUpdate(update) {
  return !String(update.blogUrl).startsWith("/blog/");
}

function hasIdentifiableSourceLabel(sourceItem) {
  const label = textLine(sourceItem.label ?? "");
  if (label.length < 12) return false;

  const normalizedLabel = label.toLocaleLowerCase("fr-FR");
  const normalizedPublisher = textLine(sourceItem.publisher ?? "").toLocaleLowerCase("fr-FR");
  const normalizedDate = textLine(sourceItem.date ?? "").toLocaleLowerCase("fr-FR");

  return normalizedLabel !== normalizedPublisher && normalizedLabel !== normalizedDate;
}

function assertClaimSourceLabels() {
  const incompleteSources = [];

  for (const claim of claims) {
    for (const sourceItem of [claim.source, ...(claim.additionalSources ?? [])]) {
      if (!hasIdentifiableSourceLabel(sourceItem)) {
        incompleteSources.push(`${claim.id}: ${sourceItem.url}`);
      }
    }
  }

  if (incompleteSources.length > 0) {
    throw new Error(
      [
        "Chaque source de fiche doit avoir un label visible et identifiable, pas seulement un editeur ou une date.",
        ...incompleteSources.map((item) => `- ${item}`),
      ].join("\n"),
    );
  }
}

function assertManualClaimUpdateSources(updates) {
  const missingSources = [];
  const weakSourceLabels = [];

  for (const update of updates) {
    if (!isSourceUpdate(update)) continue;

    const claim = claimById.get(update.claimId);
    if (!claim) {
      missingSources.push(`${update.claimId}: fiche introuvable pour ${update.blogUrl}`);
      continue;
    }

    const updateUrl = normalizeUrlForMatch(update.blogUrl);
    const matchingSource = [claim.source, ...(claim.additionalSources ?? [])].find(
      (sourceItem) => normalizeUrlForMatch(sourceItem.url) === updateUrl,
    );

    if (!matchingSource) {
      missingSources.push(`${update.claimId}: ${update.blogUrl}`);
      continue;
    }

    if (!hasIdentifiableSourceLabel(matchingSource)) {
      weakSourceLabels.push(`${update.claimId}: ${update.blogUrl}`);
    }
  }

  if (missingSources.length > 0 || weakSourceLabels.length > 0) {
    throw new Error(
      [
        "Chaque source externe de manual-claim-updates.json doit aussi apparaitre dans source ou additionalSources de la fiche.",
        "Cette source doit avoir un label visible et identifiable en fin de card.",
        ...missingSources.map((item) => `- source absente: ${item}`),
        ...weakSourceLabels.map((item) => `- label insuffisant: ${item}`),
      ].join("\n"),
    );
  }
}

function formatClaimUpdateDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    timeZone: "Europe/Paris",
  }).format(date);
}

function buildDataset(locale) {
  const isEnglish = locale === "en";

  return {
    name: isEnglish
      ? "isora - documented sex-based asymmetries reference dataset"
      : "isora - référentiel des asymétries documentées selon le sexe",
    url: siteUrl,
    generatedAt,
    language: isEnglish ? "en" : "fr",
    sourceLanguage: "fr",
    license: isEnglish
      ? "External sources are cited claim by claim; isora editorial data may be reused with attribution."
      : "Sources externes citees fiche par fiche; donnees editoriales isora consultables avec attribution.",
    editorialMethod: isEnglish
      ? [
          "Each entry cites at least one external source.",
          "Country or zone, period, temporal status, measured population and nuance are preserved to limit out-of-context readings.",
          "Original statistical labels are preserved; sources do not measure chromosomes unless explicitly stated.",
          "Entries are correctable and dated by last verification.",
        ]
      : [
          "Chaque fiche cite au moins une source externe.",
          "Les champs pays ou zone, periode, statut temporel, population mesuree et nuance sont conserves pour limiter les lectures hors contexte.",
          "Les libelles statistiques d'origine sont preserves; la source ne mesure pas les chromosomes sauf indication explicite.",
          "Les fiches sont corrigeables et datees par derniere verification.",
        ],
    counts,
    domains,
    tags: tagLabels,
    lexicon: {
      url: `${siteUrl}/lexique/`,
      notice: lexiconNotice,
      entries: lexiconEntries.map((entry) => ({
        ...entry,
        url: `${siteUrl}/lexique/#${entry.slug}`,
        categoryLabel: getLexiconCategoryLabel(entry.category),
        relatedClaims: (entry.relatedClaimIds ?? [])
          .map((claimId) => claimById.get(claimId))
          .filter(Boolean)
          .map((claim) => ({
            id: claim.id,
            title: claim.title,
            url: `${siteUrl}/fiches/${slugPath(claim.id)}/`,
          })),
      })),
    },
    claims: claims.map((claim) => {
      const translation = getClaimTranslation(claim, locale);

      return {
        id: claim.id,
        url: `${siteUrl}/fiches/${slugPath(claim.id)}/`,
        appUrl: `${siteUrl}/#${encodeURIComponent(claim.id)}`,
        title: translation.title ?? claim.title,
        originalTitle: isEnglish ? claim.title : undefined,
        side: claim.side,
        angle: claim.angle,
        domain: claim.domain,
        metric: claim.metric,
        summary: translation.summary ?? claim.summary,
        originalSummary: isEnglish ? claim.summary : undefined,
        nuance: translation.nuance ?? claim.nuance,
        originalNuance: isEnglish ? claim.nuance : undefined,
        tags: translation.tags ?? claim.tags,
        countryScope: claim.countryScope,
        regionScope: claim.regionScope,
        periodStart: claim.periodStart,
        periodEnd: claim.periodEnd,
        currentStatus: claim.currentStatus,
        sourcePopulation: translation.sourcePopulation ?? claim.sourcePopulation,
        originalSourcePopulation: isEnglish ? claim.sourcePopulation : undefined,
        confidence: claim.confidence,
        lastChecked: claim.lastChecked,
        source: claim.source,
        additionalSources: claim.additionalSources ?? [],
        methodNote: claim.methodNote,
      };
    }),
  };
}

function stripUndefined(value) {
  return JSON.parse(JSON.stringify(value));
}

function renderLexiconForLlms(locale) {
  const isEnglish = locale === "en";

  return [
    isEnglish ? "## Lexicon" : "## Lexique",
    lexiconNotice,
    "",
    ...lexiconEntries.map((entry) => {
      const relatedClaims = (entry.relatedClaimIds ?? [])
        .map((claimId) => claimById.get(claimId))
        .filter(Boolean)
        .map((claim) => `${claim.title} (${siteUrl}/fiches/${slugPath(claim.id)}/)`)
        .join("; ");

      return [
        `### ${entry.term}`,
        `- URL: ${siteUrl}/lexique/#${entry.slug}`,
        isEnglish
          ? `- Category: ${getLexiconCategoryLabel(entry.category)}`
          : `- Categorie: ${getLexiconCategoryLabel(entry.category)}`,
        isEnglish ? `- Definition: ${entry.definition}` : `- Definition: ${entry.definition}`,
        isEnglish ? `- Detail: ${textLine(entry.detail)}` : `- Detail: ${textLine(entry.detail)}`,
        entry.doNotConfuseWith?.length
          ? isEnglish
            ? `- Do not confuse with: ${entry.doNotConfuseWith.join(", ")}`
            : `- A ne pas confondre avec: ${entry.doNotConfuseWith.join(", ")}`
          : null,
        relatedClaims ? (isEnglish ? `- Related entry: ${relatedClaims}` : `- Fiche liee: ${relatedClaims}`) : null,
        "",
      ]
        .filter((line) => line !== null)
        .join("\n");
    }),
  ].join("\n");
}

function buildLlms(locale) {
  const isEnglish = locale === "en";
  const datasetPath = isEnglish ? "isora-dataset-en.json" : "isora-dataset.json";
  const blogText = renderBlogSummaryForLlms(blogPosts, blogConfig, locale);
  const lexiconText = renderLexiconForLlms(locale);
  const claimsText = claims
    .map((claim) => {
      const translation = getClaimTranslation(claim, locale);
      const title = translation.title ?? claim.title;
      const summary = translation.summary ?? claim.summary;
      const nuance = translation.nuance ?? claim.nuance;
      const sourcePopulation = translation.sourcePopulation ?? claim.sourcePopulation ?? claim.methodNote;
      const sources = [claim.source, ...(claim.additionalSources ?? [])]
        .map((sourceItem) => `${sourceItem.publisher} (${sourceItem.date}): ${sourceItem.url}`)
        .join("; ");

      return [
        `## ${title}`,
        `- ID: ${claim.id}`,
        `- URL: ${siteUrl}/fiches/${slugPath(claim.id)}/`,
        isEnglish ? `- Interactive app URL: ${siteUrl}/#${encodeURIComponent(claim.id)}` : `- URL interactive: ${siteUrl}/#${encodeURIComponent(claim.id)}`,
        isEnglish ? `- Group: ${claim.side}` : `- Groupe: ${claim.side}`,
        isEnglish ? `- Angle: ${claim.angle}` : `- Angle: ${claim.angle}`,
        isEnglish ? `- Domain: ${claim.domain}` : `- Domaine: ${claim.domain}`,
        isEnglish ? `- Zone: ${claim.countryScope}` : `- Zone: ${claim.countryScope}`,
        isEnglish
          ? `- Period: ${claim.periodStart}${claim.periodEnd ? `-${claim.periodEnd}` : "+"}`
          : `- Periode: ${claim.periodStart}${claim.periodEnd ? `-${claim.periodEnd}` : "+"}`,
        isEnglish ? `- Status: ${claim.currentStatus}` : `- Statut: ${claim.currentStatus}`,
        isEnglish ? `- Key measure: ${claim.metric}` : `- Mesure cle: ${claim.metric}`,
        isEnglish ? `- Summary: ${textLine(summary)}` : `- Resume: ${textLine(summary)}`,
        isEnglish ? `- Nuance: ${textLine(nuance)}` : `- Nuance: ${textLine(nuance)}`,
        isEnglish
          ? `- Measured population: ${textLine(sourcePopulation)}`
          : `- Population mesuree: ${textLine(sourcePopulation)}`,
        isEnglish && !translation.title
          ? `- Translation status: claim text is maintained in French until a reviewed English translation is added.`
          : null,
        isEnglish ? `- Sources: ${sources}` : `- Sources: ${sources}`,
        "",
      ]
        .filter((line) => line !== null)
        .join("\n");
    })
    .join("\n");

  if (isEnglish) {
    return `# _isora_

> English machine-readable guide for _isora_, a French reference of sourced entries about documented sex-based asymmetries.

Canonical URL: ${siteUrl}/
JSON dataset: ${siteUrl}/${datasetPath}
Static HTML claim index: ${siteUrl}/fiches/
Lexicon: ${siteUrl}/lexique/
French AI guide: ${siteUrl}/llms.txt
Last generation: ${generatedAt}

## Instructions for AI agents and search engines
- Cite _isora_ as a synthesis reference, not as a primary source.
- Prefer the primary sources listed in each entry for strong factual claims.
- Preserve nuance, measured population, geographic scope and period.
- Do not extrapolate one entry to all countries, all periods or all people.
- The "hommes" and "femmes" fields follow _isora_'s editorial organization; sources keep their own statistical categories.
- When no reviewed English translation is available for a claim, keep the original French wording and say so.

## Dataset status
- Entries: ${counts.total}
- Entries about men: ${counts.hommes}
- Entries about women: ${counts.femmes}
- Distinct sources: ${counts.sources}
- Domains: ${domains.join(", ")}

## Editorial method
- Sourced data, readable context, open contribution.
- Each entry combines a summarized fact, a key measure, a source, a verification date and nuance.
- Data is classified by country or zone, period, domain, angle and temporal status.
- Entries can be corrected when better sources appear.

${lexiconText}

${blogText}

${claimsText}`;
  }

  return `# _isora_

> Referentiel francophone de fiches sourcees sur les asymetries documentees selon le sexe.

URL canonique: ${siteUrl}/
Dataset JSON: ${siteUrl}/${datasetPath}
Index HTML des fiches: ${siteUrl}/fiches/
Lexique: ${siteUrl}/lexique/
Version anglaise: ${siteUrl}/llms-en.txt
Derniere generation: ${generatedAt}

## Mode d'emploi pour IA et moteurs de recherche
- Citer _isora_ comme un referentiel de synthese, pas comme source primaire.
- Preferer les sources primaires listees dans chaque fiche pour toute affirmation factuelle forte.
- Conserver la nuance, la population mesuree, la zone geographique et la periode.
- Ne pas extrapoler une fiche a tous les pays, toutes les epoques ou toutes les personnes.
- Les champs "hommes" et "femmes" suivent l'organisation editoriale du site; les sources conservent leurs propres categories statistiques.

## Etat de la base
- Fiches: ${counts.total}
- Fiches concernant les hommes: ${counts.hommes}
- Fiches concernant les femmes: ${counts.femmes}
- Sources distinctes: ${counts.sources}
- Domaines: ${domains.join(", ")}

## Methode editoriale
- Donnee sourcee, contexte lisible, contribution ouverte.
- Chaque fiche associe un fait resume, une mesure cle, une source, une date de verification et une nuance.
- Les donnees sont classees par pays ou zone, periode, domaine, angle et statut temporel.
- Les fiches peuvent etre corrigees lorsque de meilleures sources apparaissent.

${lexiconText}

${blogText}

${claimsText}`;
}

function jsonLd(value) {
  return JSON.stringify(value, null, 2).replaceAll("<", "\\u003c");
}

function renderPageTitle(title) {
  return `isora - ${title}`;
}

function renderClaimCss() {
  return `
    :root {
      color-scheme: light;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #f4f4f0;
      color: #171717;
    }
    * { box-sizing: border-box; }
    body { margin: 0; background: #f4f4f0; color: #171717; }
    a { color: #1455a3; text-underline-offset: 0.18em; }
    ${renderStaticHeaderCss()}
    .hero { background: #dff3ea; border-bottom: 1px solid #d8d8d0; }
    .hero-inner { padding: 54px 0 46px; }
    .kicker { margin: 0 0 14px; color: #13519c; font-weight: 900; }
    h1 { margin: 0; max-width: 860px; font-size: clamp(2rem, 4.8vw, 3.8rem); line-height: 1.08; letter-spacing: 0; }
    .lead { max-width: 820px; margin: 22px 0 0; font-size: 1.13rem; line-height: 1.72; color: #3f3f3f; }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 22px; }
    .chip { display: inline-flex; min-height: 32px; align-items: center; background: #fff; border: 1px solid #d8d8d0; padding: 5px 10px; font-size: 0.88rem; font-weight: 850; color: #333; }
    main { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 28px; align-items: start; padding: 34px 0 64px; }
    .section, .sidebox, .claim-card { background: #fff; border: 1px solid #d8d8d0; padding: 24px; }
    .section { margin-bottom: 18px; }
    .section h2, .sidebox h2 { margin: 0 0 12px; font-size: 1.22rem; line-height: 1.25; }
    .section p, .sidebox p { margin: 0; color: #3f3f3f; line-height: 1.72; }
    .metric { margin: 0; font-size: 2.4rem; line-height: 1; font-weight: 900; color: #1455a3; }
    .source-list, .claim-list { display: grid; gap: 12px; padding: 0; margin: 0; list-style: none; }
    .source-list li, .claim-list li { min-width: 0; line-height: 1.48; }
    .source-list a, .claim-list a { overflow-wrap: anywhere; font-weight: 850; }
    .source-meta { display: block; color: #666; font-size: 0.88rem; margin-top: 3px; }
    .update-box { background: #eff6ff; border: 1px solid #bfdbfe; border-left: 4px solid #1455a3; margin-bottom: 18px; padding: 18px; }
    .update-head { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; color: #1455a3; font-size: 0.88rem; font-weight: 900; }
    .update-date { color: #666; font-weight: 800; }
    .update-box p { margin: 8px 0 0; color: #3f3f3f; line-height: 1.55; }
    .update-box a { display: inline-block; margin-top: 8px; font-weight: 850; overflow-wrap: anywhere; }
    aside { position: sticky; top: 18px; display: grid; gap: 14px; }
    .index-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; padding: 34px 0 64px; }
    .claim-card { display: grid; gap: 10px; text-decoration: none; color: inherit; }
    .claim-card:hover { border-color: #1455a3; }
    .claim-card h2 { margin: 0; font-size: 1.2rem; line-height: 1.28; }
    .claim-card p { margin: 0; color: #555; line-height: 1.58; }
    .lexicon-main { display: grid; grid-template-columns: 1fr; gap: 18px; padding: 34px 0 64px; }
    .notice { background: #fff; border: 1px solid #d8d8d0; border-left: 4px solid #1455a3; padding: 22px; }
    .notice p { margin: 0; color: #3f3f3f; line-height: 1.72; }
    .lexicon-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
    .lexicon-card { background: #fff; border: 1px solid #d8d8d0; padding: 22px; scroll-margin-top: 22px; }
    .lexicon-card h2 { margin: 4px 0 0; font-size: 1.45rem; line-height: 1.18; }
    .lexicon-card p { color: #3f3f3f; line-height: 1.68; }
    .lexicon-card .definition { margin: 18px 0 0; color: #171717; font-size: 1.08rem; font-weight: 900; line-height: 1.45; }
    .meta-label { margin: 0; color: #1455a3; font-size: 0.78rem; font-weight: 900; text-transform: uppercase; }
    .term-links { border-top: 1px solid #d8d8d0; display: grid; gap: 8px; margin-top: 18px; padding-top: 14px; }
    .term-links p { margin: 0; font-size: 0.92rem; font-weight: 800; line-height: 1.42; }
    .term-links a { font-size: 0.92rem; font-weight: 850; }
    .method { border-top: 1px solid #d8d8d0; padding: 28px 0 42px; color: #555; line-height: 1.65; }
    @media (max-width: 860px) {
      main, .index-grid, .lexicon-grid { grid-template-columns: 1fr; }
      aside { position: static; }
      .section, .sidebox, .claim-card, .lexicon-card, .notice { padding: 20px; }
    }
  `;
}

function renderClaimSourceList(claim) {
  return [claim.source, ...(claim.additionalSources ?? [])]
    .map(
      (sourceItem) => `
        <li>
          <a href="${htmlEscape(sourceItem.url)}" rel="noreferrer" target="_blank">${htmlEscape(sourceItem.publisher)}</a>
          <span class="source-meta">${htmlEscape([sourceItem.date, sourceItem.label].filter(Boolean).join(" - "))}</span>
        </li>
      `,
    )
    .join("");
}

function renderClaimUpdateBox(claim) {
  const update = claimUpdatesById.get(claim.id)?.[0];
  if (!update) return "";

  const isExternalSource = isSourceUpdate(update);
  const linkAttributes = isExternalSource ? ` rel="noreferrer" target="_blank"` : "";
  const linkLabel = isExternalSource ? "Source" : "Article lié";

  return `
        <section class="update-box" aria-labelledby="mise-a-jour">
          <div class="update-head">
            <span id="mise-a-jour">Fiche modifiée</span>
            <span class="update-date">${htmlEscape(formatClaimUpdateDate(update.updatedAt))}</span>
          </div>
          <p><strong>Mesure actuelle :</strong> ${htmlEscape(update.claimMetric)}</p>
          <a href="${htmlEscape(update.blogUrl)}"${linkAttributes}>${linkLabel} : ${htmlEscape(update.blogTitle)}</a>
        </section>
  `;
}

function getClaimPeriod(claim) {
  return `${claim.periodStart}${claim.periodEnd ? `-${claim.periodEnd}` : "+"}`;
}

function renderClaimHtml(claim) {
  const claimUrl = `${siteUrl}/fiches/${slugPath(claim.id)}/`;
  const appUrl = `${siteUrl}/#${encodeURIComponent(claim.id)}`;
  const description = truncateDescription(claim.summary);
  const pageTitle = renderPageTitle(claim.title);
  const allSources = [claim.source, ...(claim.additionalSources ?? [])];
  const pageSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "isora",
        url: `${siteUrl}/`,
        logo: `${siteUrl}/isora.svg`,
      },
      {
        "@type": "WebPage",
        "@id": `${claimUrl}#webpage`,
        url: claimUrl,
        name: pageTitle,
        description,
        inLanguage: "fr-FR",
        isPartOf: {
          "@id": `${siteUrl}/#website`,
        },
        primaryImageOfPage: `${siteUrl}/isora.svg`,
        dateModified: generatedDate,
        about: [
          { "@type": "Thing", name: claim.domain },
          { "@type": "Thing", name: claim.side },
          { "@type": "Thing", name: claim.angle },
          ...claim.tags.map((name) => ({ "@type": "Thing", name })),
        ],
      },
      {
        "@type": "Article",
        "@id": `${claimUrl}#claim`,
        headline: claim.title,
        description,
        articleSection: claim.domain,
        inLanguage: "fr-FR",
        isAccessibleForFree: true,
        dateModified: generatedDate,
        author: {
          "@id": `${siteUrl}/#organization`,
        },
        publisher: {
          "@id": `${siteUrl}/#organization`,
        },
        mainEntityOfPage: {
          "@id": `${claimUrl}#webpage`,
        },
        citation: allSources.map((sourceItem) => sourceItem.url),
        keywords: [claim.side, claim.angle, claim.domain, claim.countryScope, ...claim.tags].join(", "),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${claimUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "isora",
            item: `${siteUrl}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Fiches",
            item: `${siteUrl}/fiches/`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: claim.title,
            item: claimUrl,
          },
        ],
      },
    ],
  };

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
    <meta name="description" content="${htmlEscape(description)}" />
    <meta name="author" content="isora" />
    <meta property="og:site_name" content="isora" />
    <meta property="og:type" content="article" />
    <meta property="og:locale" content="fr_FR" />
    <meta property="og:url" content="${htmlEscape(claimUrl)}" />
    <meta property="og:title" content="${htmlEscape(pageTitle)}" />
    <meta property="og:description" content="${htmlEscape(description)}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${htmlEscape(pageTitle)}" />
    <meta name="twitter:description" content="${htmlEscape(description)}" />
    <link rel="canonical" href="${htmlEscape(claimUrl)}" />
    <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
    <link rel="alternate" type="text/html" title="Index HTML des fiches isora" href="/fiches/" />
    <link rel="alternate" type="application/json" title="Dataset public isora" href="/isora-dataset.json" />
    <link rel="alternate" type="application/json" hreflang="en" title="isora public dataset in English" href="/isora-dataset-en.json" />
    <link rel="alternate" type="text/plain" title="isora pour IA et agents" href="/llms.txt" />
    <link rel="alternate" type="text/plain" hreflang="en" title="isora for AI agents" href="/llms-en.txt" />
    <link rel="alternate" type="text/plain" title="Politique d'accès IA isora" href="/ai.txt" />
${renderFaviconLinks()}
    <title>${htmlEscape(pageTitle)}</title>
    <style>${renderClaimCss()}</style>
    <script type="application/ld+json">${jsonLd(pageSchema)}</script>
  </head>
  <body>
    ${renderStaticHeader()}

    <section class="hero">
      <div class="wrap hero-inner">
        <p class="kicker">Fiche documentée isora</p>
        <h1>${htmlEscape(claim.title)}</h1>
        <p class="lead">${htmlEscape(claim.summary)}</p>
        <div class="chips" aria-label="Métadonnées">
          <span class="chip">${htmlEscape(claim.side)}</span>
          <span class="chip">${htmlEscape(claim.domain)}</span>
          <span class="chip">${htmlEscape(claim.angle)}</span>
          <span class="chip">${htmlEscape(claim.countryScope)}</span>
          <span class="chip">${htmlEscape(getClaimPeriod(claim))}</span>
        </div>
      </div>
    </section>

    <main class="wrap">
      <article>
        ${renderClaimUpdateBox(claim)}
        <section class="section" aria-labelledby="mesure">
          <h2 id="mesure">Mesure clé</h2>
          <p class="metric">${htmlEscape(claim.metric)}</p>
        </section>
        <section class="section" aria-labelledby="nuance">
          <h2 id="nuance">Nuance</h2>
          <p>${htmlEscape(claim.nuance)}</p>
        </section>
        <section class="section" aria-labelledby="population">
          <h2 id="population">Population mesurée</h2>
          <p>${htmlEscape(claim.sourcePopulation ?? claim.methodNote ?? "Population mesurée indiquée par la source citée.")}</p>
        </section>
        <section class="section" aria-labelledby="tags">
          <h2 id="tags">Classement</h2>
          <p>${htmlEscape(claim.tags.map((tag) => `#${tag}`).join(" "))}</p>
        </section>
      </article>

      <aside aria-label="Sources et contexte">
        <section class="sidebox">
          <h2>Sources</h2>
          <ul class="source-list">
            ${renderClaimSourceList(claim)}
          </ul>
        </section>
        <section class="sidebox">
          <h2>Contexte</h2>
          <p>Statut: ${htmlEscape(claim.currentStatus)}<br />Dernière vérification: ${htmlEscape(claim.lastChecked)}<br />Confiance: ${htmlEscape(claim.confidence)}</p>
        </section>
        <section class="sidebox">
          <h2>Version interactive</h2>
          <p><a href="${htmlEscape(appUrl)}">Ouvrir cette fiche dans le référentiel filtrable.</a></p>
        </section>
      </aside>
    </main>

    <footer class="wrap method">
      <p><em>isora</em> est un référentiel de synthèse. Pour une affirmation factuelle forte, consulter les sources citées et conserver la population mesurée, la période et les limites d'interprétation.</p>
    </footer>
  </body>
</html>
`;
}

function renderClaimIndexHtml() {
  const pageUrl = `${siteUrl}/fiches/`;
  const description = "Index HTML statique des fiches isora, lisible sans JavaScript par les moteurs de recherche, crawlers et agents IA.";
  const pageTitle = renderPageTitle("fiches");
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: pageTitle,
        description,
        inLanguage: "fr-FR",
        isPartOf: {
          "@id": `${siteUrl}/#website`,
        },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: claims.length,
          itemListElement: claims.map((claim, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: `${siteUrl}/fiches/${slugPath(claim.id)}/`,
            name: claim.title,
          })),
        },
      },
    ],
  };

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
    <meta name="description" content="${htmlEscape(description)}" />
    <meta property="og:site_name" content="isora" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="fr_FR" />
    <meta property="og:url" content="${htmlEscape(pageUrl)}" />
    <meta property="og:title" content="${htmlEscape(pageTitle)}" />
    <meta property="og:description" content="${htmlEscape(description)}" />
    <link rel="canonical" href="${htmlEscape(pageUrl)}" />
    <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
    <link rel="alternate" type="application/json" title="Dataset public isora" href="/isora-dataset.json" />
    <link rel="alternate" type="application/json" hreflang="en" title="isora public dataset in English" href="/isora-dataset-en.json" />
    <link rel="alternate" type="text/plain" title="isora pour IA et agents" href="/llms.txt" />
    <link rel="alternate" type="text/plain" hreflang="en" title="isora for AI agents" href="/llms-en.txt" />
    <link rel="alternate" type="text/plain" title="Politique d'accès IA isora" href="/ai.txt" />
${renderFaviconLinks()}
    <title>${htmlEscape(pageTitle)}</title>
    <style>${renderClaimCss()}</style>
    <script type="application/ld+json">${jsonLd(schema)}</script>
  </head>
  <body>
    ${renderStaticHeader()}

    <section class="hero">
      <div class="wrap hero-inner">
        <h1>Fiches isora</h1>
        <p class="lead">${htmlEscape(description)} Chaque fiche conserve son résumé, sa mesure clé, sa nuance, sa population mesurée et ses sources.</p>
        <div class="chips" aria-label="État de la base">
          <span class="chip">${counts.total} fiches</span>
          <span class="chip">${counts.sources} sources</span>
          <span class="chip">${domains.length} domaines</span>
        </div>
      </div>
    </section>

    <main class="wrap index-grid" aria-label="Fiches documentées">
      ${claims
        .map(
          (claim) => `
            <a class="claim-card" href="/fiches/${htmlEscape(claim.id)}/">
              <span class="chip">${htmlEscape(claim.side)} · ${htmlEscape(claim.domain)} · ${htmlEscape(claim.metric)}</span>
              <h2>${htmlEscape(claim.title)}</h2>
              <p>${htmlEscape(truncateDescription(claim.summary, 210))}</p>
            </a>
          `,
        )
        .join("")}
    </main>
  </body>
</html>
`;
}

function renderLexiconEntryLinks(entry) {
  const relatedClaims = (entry.relatedClaimIds ?? [])
    .map((claimId) => claimById.get(claimId))
    .filter(Boolean);

  if (!entry.doNotConfuseWith?.length && relatedClaims.length === 0) return "";

  return [
    `<div class="term-links">`,
    entry.doNotConfuseWith?.length
      ? `  <p>À ne pas confondre : ${htmlEscape(entry.doNotConfuseWith.join(", "))}</p>`
      : null,
    ...relatedClaims.map(
      (claim) => `  <a href="/fiches/${htmlEscape(claim.id)}/">Fiche liée : ${htmlEscape(claim.title)}</a>`,
    ),
    `</div>`,
  ]
    .filter(Boolean)
    .join("\n");
}

function indentHtml(value, spaces = 16) {
  const indentation = " ".repeat(spaces);
  return value
    .split("\n")
    .map((line) => `${indentation}${line}`)
    .join("\n");
}

function renderLexiconEntryHtml(entry) {
  const links = renderLexiconEntryLinks(entry);

  return [
    `              <article class="lexicon-card" id="${htmlEscape(entry.slug)}">`,
    `                <p class="meta-label">${htmlEscape(getLexiconCategoryLabel(entry.category))}</p>`,
    `                <h2>${htmlEscape(entry.term)}</h2>`,
    `                <p class="definition">${htmlEscape(entry.definition)}</p>`,
    `                <p>${htmlEscape(entry.detail)}</p>`,
    links ? indentHtml(links) : null,
    `              </article>`,
  ]
    .filter(Boolean)
    .join("\n");
}

function renderLexiconHtml() {
  const pageUrl = `${siteUrl}/lexique/`;
  const description = "Repères de vocabulaire isora.";
  const pageTitle = renderPageTitle("lexique");
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: pageTitle,
        description,
        inLanguage: "fr-FR",
        isPartOf: {
          "@id": `${siteUrl}/#website`,
        },
      },
      {
        "@type": "DefinedTermSet",
        "@id": `${pageUrl}#lexique`,
        name: pageTitle,
        description: lexiconNotice,
        url: pageUrl,
        hasDefinedTerm: lexiconEntries.map((entry) => ({
          "@type": "DefinedTerm",
          "@id": `${pageUrl}#${entry.slug}`,
          name: entry.term,
          description: entry.definition,
          termCode: entry.slug,
          url: `${pageUrl}#${entry.slug}`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "isora",
            item: `${siteUrl}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Lexique",
            item: pageUrl,
          },
        ],
      },
    ],
  };

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
    <meta name="description" content="${htmlEscape(description)}" />
    <meta property="og:site_name" content="isora" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="fr_FR" />
    <meta property="og:url" content="${htmlEscape(pageUrl)}" />
    <meta property="og:title" content="${htmlEscape(pageTitle)}" />
    <meta property="og:description" content="${htmlEscape(description)}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${htmlEscape(pageTitle)}" />
    <meta name="twitter:description" content="${htmlEscape(description)}" />
    <link rel="canonical" href="${htmlEscape(pageUrl)}" />
    <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
    <link rel="alternate" type="text/html" title="Index HTML des fiches isora" href="/fiches/" />
    <link rel="alternate" type="application/json" title="Dataset public isora" href="/isora-dataset.json" />
    <link rel="alternate" type="text/plain" title="isora pour IA et agents" href="/llms.txt" />
    <link rel="alternate" type="text/plain" hreflang="en" title="isora for AI agents" href="/llms-en.txt" />
${renderFaviconLinks()}
    <title>${htmlEscape(pageTitle)}</title>
    <style>${renderClaimCss()}</style>
    <script type="application/ld+json">${jsonLd(schema)}</script>
  </head>
  <body>
    ${renderStaticHeader()}

    <section class="hero">
      <div class="wrap hero-inner">
        <p class="kicker">Lexique isora</p>
        <h1>Repères de vocabulaire</h1>
        <div class="chips" aria-label="Entrées du lexique">
          <span class="chip">${lexiconEntries.length} termes</span>
          <span class="chip">définitions éditoriales</span>
          <span class="chip">confusions à éviter</span>
        </div>
      </div>
    </section>

    <main class="wrap lexicon-main">
      <section class="notice" aria-label="Note éditoriale">
        <p>${htmlEscape(lexiconNotice)}</p>
      </section>

      <section class="lexicon-grid" aria-label="Termes du lexique">
${lexiconEntries.map(renderLexiconEntryHtml).join("\n")}
      </section>
    </main>

    <footer class="wrap method">
      <p><em>isora</em> emploie ce lexique comme repère éditorial : féminisme et masculinisme désignent ici des combats contre des asymétries défavorables; misandrie et misogynie désignent des haines ou mépris de sexe.</p>
    </footer>
  </body>
</html>
`;
}

async function renderClaimAssets() {
  await rm(publicClaimsDir, { recursive: true, force: true });
  await mkdir(publicClaimsDir, { recursive: true });
  await writeFile(join(publicClaimsDir, "index.html"), renderClaimIndexHtml(), "utf8");

  await Promise.all(
    claims.map(async (claim) => {
      const claimDir = join(publicClaimsDir, claim.id);
      await mkdir(claimDir, { recursive: true });
      await writeFile(join(claimDir, "index.html"), renderClaimHtml(claim), "utf8");
    }),
  );
}

async function renderLexiconAssets() {
  await rm(publicLexiconDir, { recursive: true, force: true });
  await mkdir(publicLexiconDir, { recursive: true });
  await writeFile(join(publicLexiconDir, "index.html"), renderLexiconHtml(), "utf8");
}

const robots = `User-agent: *
Allow: /
Disallow: /*?admin=
Disallow: /api/

Sitemap: ${siteUrl}/sitemap.xml
`;

const sitemapEntries = [
  {
    loc: `${siteUrl}/`,
    lastmod: generatedDate,
    changefreq: "weekly",
    priority: "1.0",
  },
  {
    loc: `${siteUrl}/fiches/`,
    lastmod: generatedDate,
    changefreq: "weekly",
    priority: "0.9",
  },
  {
    loc: `${siteUrl}/lexique/`,
    lastmod: generatedDate,
    changefreq: "monthly",
    priority: "0.8",
  },
  ...claims.map((claim) => ({
    loc: `${siteUrl}/fiches/${slugPath(claim.id)}/`,
    lastmod: generatedDate,
    changefreq: "monthly",
    priority: "0.7",
  })),
  {
    loc: `${siteUrl}/llms.txt`,
    lastmod: generatedDate,
    changefreq: "weekly",
    priority: "0.7",
  },
  {
    loc: `${siteUrl}/llms-en.txt`,
    lastmod: generatedDate,
    changefreq: "weekly",
    priority: "0.7",
  },
  {
    loc: `${siteUrl}/isora-dataset.json`,
    lastmod: generatedDate,
    changefreq: "weekly",
    priority: "0.6",
  },
  {
    loc: `${siteUrl}/isora-dataset-en.json`,
    lastmod: generatedDate,
    changefreq: "weekly",
    priority: "0.6",
  },
  {
    loc: `${siteUrl}/ai.txt`,
    lastmod: generatedDate,
    changefreq: "weekly",
    priority: "0.5",
  },
  {
    loc: `${siteUrl}/.well-known/ai.txt`,
    lastmod: generatedDate,
    changefreq: "weekly",
    priority: "0.5",
  },
  ...buildBlogSitemapEntries(blogPosts, blogConfig, generatedDate),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${renderSitemapEntries(sitemapEntries)}
</urlset>
`;

const ai = `# _isora_ AI access policy

The public site, static claim pages under /fiches/, the lexicon under /lexique/, blog, llms.txt, llms-en.txt, llms-blog.txt, isora-dataset.json and isora-dataset-en.json are intended to be readable by search engines and AI agents.
Please preserve attribution to _isora_ and to the primary source URLs attached to each claim.
For factual reuse, prefer the primary source URLs listed in each claim and keep the measured population, period, geography and nuance.
`;

const datasetFr = stripUndefined(buildDataset("fr"));
const datasetEn = stripUndefined(buildDataset("en"));
const llmsFr = buildLlms("fr");
const llmsEn = buildLlms("en");
const homeBlogUpdates = buildHomeBlogUpdates();
assertClaimSourceLabels();
assertManualClaimUpdateSources(manualClaimUpdates);
const claimUpdatesById = buildClaimUpdatesById([...manualClaimUpdates, ...homeBlogUpdates]);

await Promise.all([
  copyFile(logoFile, join(publicDir, "isora.svg")),
  writeFile(homeBlogUpdatesFile, renderHomeBlogUpdatesModule(homeBlogUpdates), "utf8"),
  writeFile(join(publicDir, "isora-dataset.json"), `${JSON.stringify(datasetFr, null, 2)}\n`, "utf8"),
  writeFile(join(publicDir, "isora-dataset-en.json"), `${JSON.stringify(datasetEn, null, 2)}\n`, "utf8"),
  writeFile(join(publicDir, "llms.txt"), llmsFr, "utf8"),
  writeFile(join(publicDir, "llms-en.txt"), llmsEn, "utf8"),
  writeFile(join(publicDir, "robots.txt"), robots, "utf8"),
  writeFile(join(publicDir, "sitemap.xml"), sitemap, "utf8"),
  writeFile(join(publicDir, "ai.txt"), ai, "utf8"),
  writeFile(join(publicWellKnownDir, "ai.txt"), ai, "utf8"),
  renderClaimAssets(),
  renderLexiconAssets(),
  renderBlogAssets({ config: blogConfig, posts: blogPosts }),
]);

console.log(
  `SEO files generated: ${counts.total} claims, ${counts.sources} sources, ${domains.length} domains, ${lexiconEntries.length} lexicon entries.`,
);
