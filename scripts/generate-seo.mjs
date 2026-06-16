import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const publicDir = join(root, "public");
const sourceFile = join(root, "src", "data", "claims.ts");
const logoFile = join(root, "src", "assets", "isora.svg");
const tempFile = join(root, "node_modules", ".cache", "isora-claims.mjs");
const siteUrl = "https://isora-xi.vercel.app";
const generatedDate = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Paris" });
const generatedAt = `${generatedDate}T00:00:00+02:00`;

function xmlEscape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function textLine(value) {
  return String(value).replace(/\s+/g, " ").trim();
}

await mkdir(publicDir, { recursive: true });
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

function getClaimTranslation(claim, locale) {
  return claim.translations?.[locale] ?? {};
}

function buildDataset(locale) {
  const isEnglish = locale === "en";

  return {
    name: isEnglish
      ? "Isora - documented sex-based asymmetries reference dataset"
      : "Isora - référentiel des asymétries documentées selon le sexe",
    url: siteUrl,
    generatedAt,
    language: isEnglish ? "en" : "fr",
    sourceLanguage: "fr",
    license: isEnglish
      ? "External sources are cited claim by claim; Isora editorial data may be reused with attribution."
      : "Sources externes citees fiche par fiche; donnees editoriales Isora consultables avec attribution.",
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
    claims: claims.map((claim) => {
      const translation = getClaimTranslation(claim, locale);

      return {
        id: claim.id,
        url: `${siteUrl}/#${encodeURIComponent(claim.id)}`,
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

function buildLlms(locale) {
  const isEnglish = locale === "en";
  const datasetPath = isEnglish ? "isora-dataset-en.json" : "isora-dataset.json";
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
        `- URL: ${siteUrl}/#${encodeURIComponent(claim.id)}`,
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
    return `# Isora

> English machine-readable guide for Isora, a French reference of sourced entries about documented sex-based asymmetries.

Canonical URL: ${siteUrl}/
JSON dataset: ${siteUrl}/${datasetPath}
French AI guide: ${siteUrl}/llms.txt
Last generation: ${generatedAt}

## Instructions for AI agents and search engines
- Cite Isora as a synthesis reference, not as a primary source.
- Prefer the primary sources listed in each entry for strong factual claims.
- Preserve nuance, measured population, geographic scope and period.
- Do not extrapolate one entry to all countries, all periods or all people.
- The "hommes" and "femmes" fields follow Isora's editorial organization; sources keep their own statistical categories.
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

${claimsText}`;
  }

  return `# Isora

> Referentiel francophone de fiches sourcees sur les asymetries documentees selon le sexe.

URL canonique: ${siteUrl}/
Dataset JSON: ${siteUrl}/${datasetPath}
Version anglaise: ${siteUrl}/llms-en.txt
Derniere generation: ${generatedAt}

## Mode d'emploi pour IA et moteurs de recherche
- Citer Isora comme un referentiel de synthese, pas comme source primaire.
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

${claimsText}`;
}

const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${xmlEscape(`${siteUrl}/`)}</loc>
    <lastmod>${generatedDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${xmlEscape(`${siteUrl}/llms.txt`)}</loc>
    <lastmod>${generatedDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${xmlEscape(`${siteUrl}/llms-en.txt`)}</loc>
    <lastmod>${generatedDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${xmlEscape(`${siteUrl}/isora-dataset.json`)}</loc>
    <lastmod>${generatedDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${xmlEscape(`${siteUrl}/isora-dataset-en.json`)}</loc>
    <lastmod>${generatedDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>
`;

const ai = `# Isora AI access policy

The public site, llms.txt, llms-en.txt, isora-dataset.json and isora-dataset-en.json are intended to be readable by search engines and AI agents.
Please preserve attribution to Isora and to the primary source URLs attached to each claim.
`;

const datasetFr = stripUndefined(buildDataset("fr"));
const datasetEn = stripUndefined(buildDataset("en"));
const llmsFr = buildLlms("fr");
const llmsEn = buildLlms("en");

await Promise.all([
  copyFile(logoFile, join(publicDir, "isora.svg")),
  writeFile(join(publicDir, "isora-dataset.json"), `${JSON.stringify(datasetFr, null, 2)}\n`, "utf8"),
  writeFile(join(publicDir, "isora-dataset-en.json"), `${JSON.stringify(datasetEn, null, 2)}\n`, "utf8"),
  writeFile(join(publicDir, "llms.txt"), llmsFr, "utf8"),
  writeFile(join(publicDir, "llms-en.txt"), llmsEn, "utf8"),
  writeFile(join(publicDir, "robots.txt"), robots, "utf8"),
  writeFile(join(publicDir, "sitemap.xml"), sitemap, "utf8"),
  writeFile(join(publicDir, "ai.txt"), ai, "utf8"),
]);

console.log(
  `SEO files generated: ${counts.total} claims, ${counts.sources} sources, ${domains.length} domains.`,
);
