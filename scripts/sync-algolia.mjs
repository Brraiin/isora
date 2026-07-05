import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { algoliasearch } from "algoliasearch";
import ts from "typescript";
import { loadBlogPosts } from "./blog-utils.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const sourceFile = join(root, "src", "data", "claims.ts");
const tempFile = join(root, "node_modules", ".cache", "isora-claims-algolia.mjs");

const appId = process.env.ALGOLIA_APP_ID || process.env.VITE_ALGOLIA_APP_ID;
const adminKey = process.env.ALGOLIA_ADMIN_KEY;
const claimsIndexName =
  process.env.ALGOLIA_CLAIMS_INDEX_NAME || process.env.ALGOLIA_INDEX_NAME || process.env.VITE_ALGOLIA_INDEX_NAME || "isora_claims";
const articlesIndexName =
  process.env.ALGOLIA_ARTICLES_INDEX_NAME || process.env.VITE_ALGOLIA_ARTICLES_INDEX_NAME || "isora_articles";
const syncTarget = process.env.ALGOLIA_SYNC_TARGET || "all";

function assertEnv() {
  const missing = [];
  if (!appId) missing.push("ALGOLIA_APP_ID");
  if (!adminKey) missing.push("ALGOLIA_ADMIN_KEY");

  if (missing.length > 0) {
    throw new Error(`Variables Algolia manquantes: ${missing.join(", ")}`);
  }
}

function textLine(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function sourceText(source) {
  return [source?.label, source?.publisher, source?.date, source?.url].map(textLine).filter(Boolean).join(" ");
}

function articleSourceText(source) {
  return [source?.title, source?.publisher, source?.date, source?.url].map(textLine).filter(Boolean).join(" ");
}

async function loadClaims() {
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
  const { claims } = await import(`${pathToFileURL(tempFile).href}?t=${Date.now()}`);
  await rm(tempFile, { force: true });

  return claims;
}

function buildClaimRecord(claim) {
  const translationEn = claim.translations?.en ?? {};
  const sources = [claim.source, ...(claim.additionalSources ?? [])];
  const sourceTexts = sources.map(sourceText).filter(Boolean);
  const period = `${claim.periode_debut}${claim.periode_fin ? `-${claim.periode_fin}` : "+"}`;
  const fields = [
    claim.title,
    translationEn.title,
    claim.summary,
    translationEn.summary,
    claim.metric,
    claim.domain,
    claim.side,
    claim.angle,
    claim.pays_ou_zone,
    claim.statut_temporel,
    period,
    claim.sourcePopulation,
    translationEn.sourcePopulation,
    claim.nuance,
    translationEn.nuance,
    claim.lastChecked,
    claim.tags,
    translationEn.tags,
    sourceTexts,
  ];

  return {
    objectID: claim.id,
    claimId: claim.id,
    title: textLine(claim.title),
    titleEn: textLine(translationEn.title),
    summary: textLine(claim.summary),
    summaryEn: textLine(translationEn.summary),
    metric: textLine(claim.metric),
    side: claim.side,
    angle: claim.angle,
    domain: claim.domain,
    country: claim.pays_ou_zone,
    period,
    status: claim.statut_temporel,
    tags: claim.tags,
    tagsEn: translationEn.tags ?? [],
    sourcePopulation: textLine(claim.sourcePopulation),
    sourcePopulationEn: textLine(translationEn.sourcePopulation),
    nuance: textLine(claim.nuance),
    nuanceEn: textLine(translationEn.nuance),
    sourceLabel: textLine(claim.source?.label),
    sourcePublisher: textLine(claim.source?.publisher),
    sourceDate: textLine(claim.source?.date),
    sourceUrl: textLine(claim.source?.url),
    sourceText: sourceTexts,
    url: `/fiches/${encodeURIComponent(claim.id)}/`,
    searchableText: fields.flat(2).map(textLine).filter(Boolean).join(" "),
  };
}

function buildArticleRecord(post) {
  const sourceTexts = post.sources.map(articleSourceText).filter(Boolean);
  const sectionsText = (post.sections ?? []).flatMap((section) => [
    section.heading,
    ...(section.paragraphs ?? []),
  ]);
  const faqText = (post.faq ?? []).flatMap((item) => [item.question, item.answer]);
  const fields = [
    post.title,
    post.description,
    post.summary,
    post.topic?.label,
    post.date,
    post.updatedAt,
    post.keywords,
    post.relatedClaimIds,
    post.keyPoints,
    sectionsText,
    faqText,
    sourceTexts,
  ];

  return {
    objectID: post.slug,
    postSlug: post.slug,
    type: "article",
    title: textLine(post.title),
    description: textLine(post.description),
    summary: textLine(post.summary),
    topic: textLine(post.topic?.label),
    date: textLine(post.date),
    publishedAt: textLine(post.publishedAt),
    updatedAt: textLine(post.updatedAt),
    keywords: post.keywords ?? [],
    relatedClaimIds: post.relatedClaimIds ?? [],
    sourceTitle: post.sources.map((source) => textLine(source.title)).filter(Boolean),
    sourcePublisher: post.sources.map((source) => textLine(source.publisher)).filter(Boolean),
    sourceDate: post.sources.map((source) => textLine(source.date)).filter(Boolean),
    sourceUrl: post.sources.map((source) => textLine(source.url)).filter(Boolean),
    sourceText: sourceTexts,
    url: `/blog/${encodeURIComponent(post.slug)}/`,
    searchableText: fields.flat(3).map(textLine).filter(Boolean).join(" "),
  };
}

assertEnv();

const client = algoliasearch(appId, adminKey);

if (syncTarget === "all" || syncTarget === "claims") {
  const claims = await loadClaims();
  const claimRecords = claims.map(buildClaimRecord);

  await client.setSettings({
    indexName: claimsIndexName,
    indexSettings: {
      searchableAttributes: [
        "unordered(title)",
        "unordered(titleEn)",
        "unordered(summary)",
        "unordered(summaryEn)",
        "unordered(metric)",
        "unordered(sourceLabel)",
        "unordered(sourcePublisher)",
        "unordered(sourceText)",
        "unordered(tags)",
        "unordered(tagsEn)",
        "unordered(domain)",
        "unordered(country)",
        "unordered(status)",
        "unordered(sourcePopulation)",
        "unordered(sourcePopulationEn)",
        "unordered(nuance)",
        "unordered(nuanceEn)",
        "unordered(searchableText)",
      ],
      attributesForFaceting: ["filterOnly(side)", "searchable(domain)", "searchable(country)", "searchable(status)"],
      attributesToHighlight: ["*"],
      typoTolerance: true,
      ignorePlurals: ["fr", "en"],
      removeStopWords: ["fr", "en"],
    },
  });

  await client.replaceAllObjects({
    indexName: claimsIndexName,
    objects: claimRecords,
    batchSize: 1000,
  });

  console.log(`Index Algolia "${claimsIndexName}" synchronise: ${claimRecords.length} fiche(s).`);
}

if (syncTarget === "all" || syncTarget === "articles") {
  const posts = await loadBlogPosts();
  const articleRecords = posts.map(buildArticleRecord);

  await client.setSettings({
    indexName: articlesIndexName,
    indexSettings: {
      searchableAttributes: [
        "unordered(title)",
        "unordered(description)",
        "unordered(summary)",
        "unordered(topic)",
        "unordered(sourceTitle)",
        "unordered(sourcePublisher)",
        "unordered(sourceText)",
        "unordered(keywords)",
        "unordered(relatedClaimIds)",
        "unordered(searchableText)",
      ],
      attributesForFaceting: ["searchable(topic)", "searchable(sourcePublisher)", "searchable(relatedClaimIds)"],
      attributesToHighlight: ["*"],
      typoTolerance: true,
      ignorePlurals: ["fr", "en"],
      removeStopWords: ["fr", "en"],
    },
  });

  await client.replaceAllObjects({
    indexName: articlesIndexName,
    objects: articleRecords,
    batchSize: 1000,
  });

  console.log(`Index Algolia "${articlesIndexName}" synchronise: ${articleRecords.length} article(s).`);
}
