import { access, readFile, readdir } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE_URL, parseEditorialDate } from "./seo-utils.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const errors = new Set();
const contents = new Map();
const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Paris" });

function report(file, message) {
  errors.add(`${relative(root, file)} : ${message}`);
}

async function read(file) {
  if (contents.has(file)) return contents.get(file);
  try {
    const text = await readFile(file, "utf8");
    contents.set(file, text);
    return text;
  } catch (error) {
    report(file, `lecture impossible (${error.code ?? error.message})`);
    return null;
  }
}

async function htmlFiles(directory) {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    const nested = await Promise.all(entries.map(async (entry) => {
      const file = join(directory, entry.name);
      if (entry.isDirectory()) return htmlFiles(file);
      return entry.isFile() && entry.name.endsWith(".html") ? [file] : [];
    }));
    return nested.flat();
  } catch (error) {
    report(directory, `dossier HTML introuvable (${error.code ?? error.message})`);
    return [];
  }
}

function decodeEntities(value) {
  return value.replace(/&(#x[0-9a-f]+|#\d+|amp|quot|apos|lt|gt);/gi, (entity, code) => {
    const named = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">" };
    if (!code.startsWith("#")) return named[code.toLowerCase()] ?? entity;
    const number = code.toLowerCase().startsWith("#x")
      ? Number.parseInt(code.slice(2), 16)
      : Number.parseInt(code.slice(1), 10);
    return number > 0 && number <= 0x10ffff ? String.fromCodePoint(number) : entity;
  });
}

function attributes(tag) {
  const result = {};
  for (const match of tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
    result[match[1].toLowerCase()] = decodeEntities(match[2] ?? match[3] ?? match[4]);
  }
  return result;
}

function pagePath(file) {
  if (file === join(root, "index.html")) return "/";
  const path = `/${relative(publicDir, file).split("\\").join("/")}`;
  return path.endsWith("/index.html") ? path.slice(0, -"index.html".length) : path;
}

async function checkInternalTarget(url, sourceFile) {
  if (url.origin !== SITE_URL || url.pathname.startsWith("/api/")) return;
  const path = decodeURIComponent(url.pathname);
  let target;
  if (path === "/" || path === "/index.html") {
    target = join(root, "index.html");
  } else if (/\.(?:json|txt|xml|html)$/i.test(path)) {
    target = join(publicDir, path);
  } else if (!/\.[^/]+$/.test(path)) {
    target = join(publicDir, path, "index.html");
  } else {
    return;
  }

  try {
    await access(target);
  } catch {
    report(sourceFile, `lien interne sans fichier : ${url.pathname}`);
  }
}

const directories = ["fiches", "blog", "lexique", "methode"];
const pages = [join(root, "index.html"), ...(await Promise.all(
  directories.map((directory) => htmlFiles(join(publicDir, directory))),
)).flat()];

const sitemapFile = join(publicDir, "sitemap.xml");
const sitemap = await read(sitemapFile);
const sitemapUrls = new Set();
if (sitemap !== null) {
  const entries = [...sitemap.matchAll(/<url\b[^>]*>([\s\S]*?)<\/url>/gi)];
  if (entries.length === 0) report(sitemapFile, "aucune URL dans le sitemap");
  for (const entry of entries) {
    const loc = decodeEntities(entry[1].match(/<loc\b[^>]*>([\s\S]*?)<\/loc>/i)?.[1]?.trim() ?? "");
    const lastmod = entry[1].match(/<lastmod\b[^>]*>([\s\S]*?)<\/lastmod>/i)?.[1]?.trim();
    if (sitemapUrls.has(loc)) report(sitemapFile, `URL en double : ${loc}`);
    sitemapUrls.add(loc);
    try {
      const url = new URL(loc);
      if (url.origin !== SITE_URL || url.username || url.password || url.search || url.hash) {
        report(sitemapFile, `URL non canonique : ${loc}`);
      } else {
        await checkInternalTarget(url, sitemapFile);
      }
    } catch {
      report(sitemapFile, `URL invalide : ${loc}`);
    }
    if (!lastmod || parseEditorialDate(lastmod) !== lastmod) {
      report(sitemapFile, `lastmod invalide pour ${loc} : ${lastmod ?? "absent"}`);
    } else if (lastmod > today) {
      report(sitemapFile, `lastmod futur pour ${loc} : ${lastmod}`);
    }
  }
}

for (const file of pages) {
  const html = await read(file);
  if (html === null) continue;
  const expectedUrl = `${SITE_URL}${pagePath(file)}`;
  const canonicals = [...html.matchAll(/<link\b[^>]*>/gi)]
    .map((match) => attributes(match[0]))
    .filter((attrs) => attrs.rel?.toLowerCase().split(/\s+/).includes("canonical"));
  if (canonicals.length !== 1) {
    report(file, `une canonical requise, ${canonicals.length} trouvée(s)`);
  } else if (canonicals[0].href !== expectedUrl) {
    report(file, `canonical attendue ${expectedUrl}, reçue ${canonicals[0].href ?? "absente"}`);
  }
  if (!sitemapUrls.has(expectedUrl)) report(file, `page absente du sitemap : ${expectedUrl}`);

  const jsonLdScripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter((match) => attributes(match[1]).type?.toLowerCase() === "application/ld+json");
  if (jsonLdScripts.length === 0) report(file, "JSON-LD absent");
  for (const script of jsonLdScripts) {
    try {
      JSON.parse(script[2]);
    } catch (error) {
      report(file, `JSON-LD invalide : ${error.message}`);
    }
  }

  for (const match of html.matchAll(/<(?:a|link)\b[^>]*>/gi)) {
    const href = attributes(match[0]).href;
    if (!href || href.startsWith("#")) continue;
    try {
      const url = new URL(href, expectedUrl);
      if (url.protocol === "https:" || url.protocol === "http:") {
        await checkInternalTarget(url, file);
      }
    } catch {
      report(file, `href invalide : ${href}`);
    }
  }
}

const homepageFile = join(root, "index.html");
const homepage = await read(homepageFile);
if (homepage !== null) {
  if (!/<!--\s*isora-home:start\s*-->[\s\S]+?<!--\s*isora-home:end\s*-->/.test(homepage)) {
    report(homepageFile, "contenu initial généré absent (marqueurs isora-home)");
  }
  const rootDiv = [...homepage.matchAll(/<div\b[^>]*>/gi)]
    .find((match) => attributes(match[0]).id === "root");
  const rootContent = rootDiv
    ? homepage.slice(rootDiv.index + rootDiv[0].length).split(/<\/div\s*>/i)[0]
    : "";
  if (!rootContent.replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]*>/g, "").trim()) {
    report(homepageFile, "div #root vide : contenu initial dépendant de JavaScript");
  }
  const initialContent = homepage.match(/<!--\s*isora-home:start\s*-->([\s\S]+?)<!--\s*isora-home:end\s*-->/)?.[1] ?? "";
  if (!/<h1\b/.test(initialContent) || !/href="\/fiches\//.test(initialContent)) {
    report(homepageFile, "présentation et liens de fiches manquants dans le HTML initial");
  }
}

const robotsFile = join(publicDir, "robots.txt");
const robots = await read(robotsFile);
if (robots !== null) {
  if (!/^User-agent:\s*\*\s*$/im.test(robots)) report(robotsFile, "section User-agent: * absente");
  if (!robots.split(/\r?\n/).some((line) => line.trim() === `Sitemap: ${SITE_URL}/sitemap.xml`)) {
    report(robotsFile, "adresse sitemap canonique absente");
  }
}

let claimCount = 0;
for (const locale of ["fr", "en"]) {
  const file = join(publicDir, locale === "fr" ? "isora-dataset.json" : "isora-dataset-en.json");
  const text = await read(file);
  if (text === null) continue;
  try {
    const dataset = JSON.parse(text);
    if (!Array.isArray(dataset.claims) || dataset.claims.length < 1) {
      report(file, "dataset sans fiche");
      continue;
    }
    if (locale === "fr") claimCount = dataset.claims.length;
    for (const claim of dataset.claims) {
      if (!parseEditorialDate(claim.date_consultation)) report(file, `${claim.id} : date_consultation absente ou invalide`);
      if (typeof claim.libelle_source !== "string" || !claim.libelle_source.trim()) {
        report(file, `${claim.id} : libelle_source absent`);
      }
      if (typeof claim.mesure_chromosomes !== "boolean") report(file, `${claim.id} : mesure_chromosomes doit être booléen`);
      if (locale === "en" && !["reviewed", "source-language-fallback"].includes(claim.translationStatus)) {
        report(file, `${claim.id} : translationStatus absent ou invalide`);
      }
    }
  } catch (error) {
    report(file, `dataset JSON invalide : ${error.message}`);
  }
}

const seoFiles = [
  "llms.txt", "llms-en.txt", "ai.txt", ".well-known/ai.txt", "robots.txt", "sitemap.xml",
  "isora-dataset.json", "isora-dataset-en.json", "blog/feed.xml", "blog/index.json", "blog/llms-blog.txt",
];
await Promise.all(seoFiles.map((file) => read(join(publicDir, file))));
for (const [file, text] of contents) {
  if (/isora-xi\.vercel\.app/i.test(text)) report(file, "ancien domaine technique encore présent");
}

if (errors.size > 0) {
  console.error(`Contrôle SEO échoué : ${errors.size} erreur(s).`);
  console.error([...errors].slice(0, 40).map((error) => `- ${error}`).join("\n"));
  if (errors.size > 40) console.error(`… ${errors.size - 40} erreur(s) supplémentaires.`);
  process.exitCode = 1;
} else {
  console.log(`Contrôle SEO réussi : ${pages.length} pages HTML, ${sitemapUrls.size} URL sitemap, ${claimCount} fiches ; canonicals, JSON-LD, liens, dates et exports IA valides.`);
}
