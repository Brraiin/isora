import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const root = join(__dirname, "..");
export const blogContentDir = join(root, "content", "blog");
export const blogPostsDir = join(blogContentDir, "posts");
export const publicDir = join(root, "public");
export const publicBlogDir = join(publicDir, "blog");

const blogPostsPerPage = 15;

const defaultConfig = {
  siteUrl: "https://isora-xi.vercel.app",
  brand: "isora",
  language: "fr-FR",
  timezone: "Europe/Paris",
  author: {
    name: "isora",
    url: "https://isora-xi.vercel.app/",
  },
  quality: {
    minSources: 3,
    minKeyPoints: 3,
    minFaqItems: 2,
  },
  sourcePriorities: [],
  topics: [],
};

function ensureTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}

export function getSiteUrl(config = defaultConfig) {
  return String(config.siteUrl || defaultConfig.siteUrl).replace(/\/+$/, "");
}

export function getBlogUrl(config = defaultConfig) {
  return `${getSiteUrl(config)}/blog/`;
}

function getBlogPageUrl(config = defaultConfig, pageNumber = 1) {
  return pageNumber <= 1 ? getBlogUrl(config) : `${getBlogUrl(config)}page/${pageNumber}/`;
}

function getBlogPageHref(pageNumber = 1) {
  return pageNumber <= 1 ? "/blog/" : `/blog/page/${pageNumber}/`;
}

function getBlogPageCount(posts) {
  return Math.max(1, Math.ceil(posts.length / blogPostsPerPage));
}

export function getPostUrl(post, config = defaultConfig) {
  return `${getBlogUrl(config)}${post.slug}/`;
}

export function htmlEscape(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function htmlWithBrand(value = "") {
  return htmlEscape(value).replace(/\bisora\b/gi, "<em>isora</em>");
}

export function xmlEscape(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function textLine(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

export function slugify(value = "") {
  return textLine(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 86);
}

export function getParisDateKey(date = new Date()) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatFrenchDate(value) {
  const sourceDate = typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T12:00:00Z`)
    : new Date(value);

  if (Number.isNaN(sourceDate.getTime())) return value;

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Paris",
  }).format(sourceDate);
}

function readingMinutesFor(post) {
  const words = [
    post.title,
    post.description,
    post.summary,
    ...(post.keyPoints ?? []),
    ...(post.sections ?? []).flatMap((section) => [section.heading, ...(section.paragraphs ?? [])]),
    ...(post.faq ?? []).flatMap((item) => [item.question, item.answer]),
  ]
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(3, Math.ceil(words / 220));
}

export async function loadBlogConfig() {
  const configPath = join(blogContentDir, "watch-config.json");

  try {
    const config = JSON.parse(await readFile(configPath, "utf8"));

    return {
      ...defaultConfig,
      ...config,
      author: {
        ...defaultConfig.author,
        ...(config.author ?? {}),
      },
      quality: {
        ...defaultConfig.quality,
        ...(config.quality ?? {}),
      },
      siteUrl: ensureTrailingSlash(config.siteUrl ?? defaultConfig.siteUrl).replace(/\/+$/, ""),
    };
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
    return defaultConfig;
  }
}

export function normalizeBlogPost(post) {
  const title = textLine(post.title);
  const baseSlug = slugify(post.slug || title || post.id);
  const date = textLine(post.date || String(post.publishedAt ?? "").slice(0, 10) || getParisDateKey());
  const slug = baseSlug.startsWith(date) ? baseSlug : `${date}-${baseSlug}`;
  const relatedClaimIds = Array.isArray(post.relatedClaimIds)
    ? [...new Set(post.relatedClaimIds.map(textLine).filter(Boolean))]
    : [];
  const sources = Array.isArray(post.sources)
    ? post.sources
        .map((source) => ({
          title: textLine(source.title ?? source.label ?? ""),
          publisher: textLine(source.publisher ?? ""),
          url: textLine(source.url ?? ""),
          date: textLine(source.date ?? ""),
          type: textLine(source.type ?? "source"),
        }))
        .filter((source) => source.title && source.publisher && source.url)
    : [];

  return {
    id: textLine(post.id || slug),
    slug,
    status: post.status === "draft" ? "draft" : "published",
    language: post.language || "fr",
    title,
    description: textLine(post.description),
    date,
    publishedAt: post.publishedAt || `${date}T06:30:00.000Z`,
    updatedAt: post.updatedAt || post.publishedAt || `${date}T06:30:00.000Z`,
    topic: {
      id: textLine(post.topic?.id ?? "veille"),
      label: textLine(post.topic?.label ?? "Veille isora"),
    },
    keywords: Array.isArray(post.keywords) ? post.keywords.map(textLine).filter(Boolean) : [],
    relatedClaimIds,
    readingMinutes: Number.isFinite(post.readingMinutes) ? post.readingMinutes : readingMinutesFor(post),
    summary: textLine(post.summary || post.description),
    keyPoints: Array.isArray(post.keyPoints) ? post.keyPoints.map(textLine).filter(Boolean) : [],
    sections: Array.isArray(post.sections)
      ? post.sections
          .map((section) => ({
            heading: textLine(section.heading),
            paragraphs: Array.isArray(section.paragraphs)
              ? section.paragraphs.map(textLine).filter(Boolean)
              : [],
          }))
          .filter((section) => section.heading && section.paragraphs.length > 0)
      : [],
    faq: Array.isArray(post.faq)
      ? post.faq
          .map((item) => ({
            question: textLine(item.question),
            answer: textLine(item.answer),
          }))
          .filter((item) => item.question && item.answer)
      : [],
    sources,
    editorialChecks: post.editorialChecks ?? {},
  };
}

export async function loadBlogPosts({ includeDrafts = false } = {}) {
  let entries = [];

  try {
    entries = await readdir(blogPostsDir, { withFileTypes: true });
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
    return [];
  }

  const posts = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .map(async (entry) => {
        const filePath = join(blogPostsDir, entry.name);
        const parsed = JSON.parse(await readFile(filePath, "utf8"));
        return normalizeBlogPost(parsed);
      }),
  );

  return posts
    .filter((post) => includeDrafts || post.status === "published")
    .sort((left, right) => {
      const byDate = String(right.publishedAt).localeCompare(String(left.publishedAt));
      return byDate || right.slug.localeCompare(left.slug);
    });
}

export async function writeBlogPost(post) {
  const normalized = normalizeBlogPost(post);
  await mkdir(blogPostsDir, { recursive: true });
  await writeFile(join(blogPostsDir, `${normalized.slug}.json`), `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
  return normalized;
}

function jsonLd(value) {
  return JSON.stringify(value, null, 2).replaceAll("<", "\\u003c");
}

function renderCss() {
  return `
    :root {
      color-scheme: light;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #f6f4ee;
      color: #171717;
      --paper: #f6f4ee;
      --surface: #ffffff;
      --surface-soft: #fbfaf6;
      --ink: #171717;
      --muted: #57534e;
      --line: #d8d3c7;
      --blue: #1455a3;
      --blue-soft: #eaf2fb;
      --green: #147467;
      --green-soft: #e4f3ed;
      --amber: #8b5c12;
      --amber-soft: #fff2d5;
    }
    * { box-sizing: border-box; }
    [hidden] { display: none !important; }
    body { margin: 0; background: var(--paper); color: var(--ink); }
    a { color: var(--blue); text-underline-offset: 0.18em; }
    .wrap { width: min(100% - 48px, 1200px); margin: 0 auto; }
    .topbar { border-bottom: 1px solid var(--line); background: rgba(255, 255, 255, 0.96); }
    .topbar-inner { min-height: 106px; display: flex; align-items: stretch; justify-content: space-between; gap: 24px; }
    .brand { margin-left: -16px; padding: 0 16px; display: inline-flex; align-items: center; gap: 14px; color: var(--ink); text-decoration: none; font-weight: 900; }
    .brand:hover, .brand:focus-visible { background: #f6f6f6; }
    .brand:focus-visible { outline: 2px solid var(--blue); outline-offset: -2px; }
    .brand img { width: 106px; height: auto; display: block; }
    .brand span { max-width: 25rem; color: #3f3f3f; font-size: 0.96rem; font-weight: 700; line-height: 1.35; }
    .nav { margin-left: auto; display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-end; gap: 4px; align-self: center; font-weight: 800; }
    .nav a { min-height: 32px; display: inline-flex; align-items: center; gap: 8px; padding: 0 8px; color: #000091; text-decoration: none; }
    .nav svg { width: 18px; height: 18px; flex: 0 0 auto; }
    .nav a:hover { background: #f6f6f6; }
    .nav a:active { background: #ededed; }
    .nav a:focus-visible { outline: 2px solid var(--blue); outline-offset: 2px; }
    .hero { background: var(--surface); border-bottom: 1px solid var(--line); }
    .hero-inner { display: grid; grid-template-columns: minmax(0, 1fr) minmax(240px, 340px); gap: 30px; align-items: end; padding: 58px 0 46px; }
    .hero-inner-simple { display: block; padding: 56px 0 42px; }
    .hero-copy { min-width: 0; }
    .hero-panel { display: grid; gap: 14px; align-self: stretch; background: var(--surface-soft); border: 1px solid var(--line); padding: 20px; }
    .hero-panel strong { font-size: 1.08rem; line-height: 1.35; }
    .hero-panel dl { display: grid; gap: 12px; margin: 0; }
    .hero-panel div { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; border-top: 1px solid var(--line); padding-top: 12px; }
    .hero-panel dt { color: var(--muted); font-size: 0.86rem; font-weight: 800; }
    .hero-panel dd { margin: 0; color: var(--ink); font-size: 1.2rem; font-weight: 950; }
    .panel-kicker,
    .kicker { margin: 0 0 14px; color: var(--green); font-size: 0.82rem; font-weight: 950; letter-spacing: 0.08em; text-transform: uppercase; }
    .panel-kicker { margin: 0; }
    h1 { margin: 0; max-width: 880px; font-size: clamp(2.2rem, 5vw, 4.6rem); line-height: 1.03; letter-spacing: 0; }
    .lead { max-width: 820px; margin: 22px 0 0; font-size: 1.12rem; line-height: 1.72; color: var(--muted); }
    .meta { margin-top: 24px; display: flex; flex-wrap: wrap; gap: 8px; }
    .pill,
    .meta-chip { display: inline-flex; min-height: 32px; align-items: center; gap: 6px; background: var(--surface); border: 1px solid var(--line); padding: 5px 10px; font-size: 0.88rem; font-weight: 820; color: #3a3732; }
    .meta-chip.topic { color: var(--green); border-color: #b7d7cd; background: var(--green-soft); }
    .meta-chip.sources { color: var(--blue); border-color: #bfd2e8; background: var(--blue-soft); }
    .meta-chip.claims { color: var(--amber); border-color: #ead2a0; background: var(--amber-soft); }
    main { padding-bottom: 64px; }
    .article-grid { display: grid; grid-template-columns: minmax(0, 760px) minmax(260px, 320px); gap: 34px; align-items: start; justify-content: center; padding-top: 34px; }
    article { min-width: 0; }
    .article-grid > article { background: var(--surface); border: 1px solid var(--line); padding: 34px; }
    .section { border-bottom: 1px solid var(--line); padding: 0 0 30px; margin-bottom: 30px; }
    .section:last-child { border-bottom: 0; margin-bottom: 0; padding-bottom: 0; }
    .section h2 { margin: 0 0 14px; font-size: 1.55rem; line-height: 1.2; }
    .section p { margin: 0 0 14px; color: #3f3a34; line-height: 1.78; font-size: 1.02rem; }
    .section p:last-child { margin-bottom: 0; }
    .keypoints { counter-reset: point; display: grid; gap: 10px; padding: 0; list-style: none; }
    .keypoints li { counter-increment: point; display: grid; grid-template-columns: 32px minmax(0, 1fr); gap: 12px; align-items: start; background: var(--blue-soft); border: 1px solid #c8dbef; padding: 14px; line-height: 1.55; font-weight: 720; }
    .keypoints li::before { content: counter(point); display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: var(--blue); color: #fff; font-weight: 950; }
    aside { position: sticky; top: 18px; display: grid; gap: 14px; }
    .sidebox { background: var(--surface); border: 1px solid var(--line); padding: 18px; }
    .sidebox h2 { margin: 0 0 10px; font-size: 1rem; }
    ul.sources { display: grid; gap: 12px; padding: 0; list-style: none; }
    ul.sources li { min-width: 0; line-height: 1.45; }
    ul.sources a { overflow-wrap: anywhere; font-weight: 850; }
    .source-meta { display: block; color: var(--muted); font-size: 0.88rem; margin-top: 3px; }
    .faq { display: grid; gap: 14px; }
    details { border: 1px solid var(--line); padding: 16px 18px 18px; background: var(--surface-soft); }
    summary { cursor: pointer; font-weight: 900; line-height: 1.45; padding-bottom: 4px; }
    details[open] summary { margin-bottom: 8px; }
    .section details p { margin: 0 0 6px; line-height: 1.68; }
    .section details p:last-child { margin-bottom: 6px; }
    .method { border-top: 1px solid var(--line); padding: 28px 0 42px; color: var(--muted); line-height: 1.65; }
    .method-actions { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; }
    .cookie-settings-button { min-height: 40px; border: 1px solid var(--line); background: var(--surface); color: var(--blue); padding: 0 12px; font: inherit; font-size: 0.9rem; font-weight: 850; cursor: pointer; }
    .cookie-settings-button:hover { background: var(--blue-soft); }
    .blog-index { padding: 0 0 72px; }
    .blog-toolbar { display: grid; grid-template-columns: minmax(0, 1fr) minmax(260px, 360px); gap: 24px; align-items: end; padding: 30px 0 24px; border-bottom: 1px solid var(--line); }
    .blog-toolbar h2,
    .archive-head h2 { margin: 0; font-size: 1.05rem; text-transform: uppercase; letter-spacing: 0.08em; }
    .blog-toolbar p,
    .archive-head p { margin: 8px 0 0; color: var(--muted); line-height: 1.55; }
    .searchbox { display: grid; gap: 8px; }
    .searchbox span { color: var(--muted); font-size: 0.88rem; font-weight: 850; }
    .searchbox input { width: 100%; min-height: 46px; border: 1px solid var(--line); background: var(--surface); color: var(--ink); padding: 0 13px; font: inherit; font-weight: 720; }
    .searchbox input:focus { outline: 3px solid #c8dbef; outline-offset: 2px; border-color: var(--blue); }
    .featured-grid { display: grid; gap: 18px; padding-top: 24px; }
    .recent-stack { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
    .post-card { min-width: 0; display: grid; gap: 12px; align-content: start; background: var(--surface); border: 1px solid var(--line); padding: 22px; text-decoration: none; color: inherit; transition: border-color 160ms ease, transform 160ms ease, box-shadow 160ms ease; }
    .post-card:hover { border-color: var(--blue); box-shadow: 0 14px 32px rgba(23, 23, 23, 0.08); transform: translateY(-1px); }
    .post-card:focus-visible { outline: 3px solid #c8dbef; outline-offset: 3px; }
    .post-card-featured { grid-template-columns: minmax(0, 1.1fr) minmax(260px, 0.9fr); align-items: end; padding: 30px; background: var(--green-soft); border-color: #b7d7cd; }
    .post-card-featured h2 { font-size: clamp(2rem, 4vw, 3.35rem); line-height: 1.04; }
    .post-card-featured .post-meta-row { grid-column: 1; }
    .post-card-featured .post-card-action { grid-column: 2; justify-self: start; }
    .post-card-compact h2 { font-size: 1.22rem; }
    .post-card-archive { grid-template-columns: minmax(0, 1fr) auto; align-items: start; }
    .post-card-archive .post-summary,
    .post-card-archive .post-meta-row { grid-column: 1 / -1; }
    .post-card-archive .post-card-action { grid-column: 2; grid-row: 1; align-self: center; }
    .post-eyebrow { color: var(--green); font-size: 0.82rem; font-weight: 950; letter-spacing: 0.08em; text-transform: uppercase; }
    .post-card h2 { margin: 0; font-size: 1.38rem; line-height: 1.22; overflow-wrap: anywhere; }
    .post-card p { margin: 0; color: var(--muted); line-height: 1.62; }
    .post-summary { max-width: 72ch; }
    .post-meta-row { display: flex; flex-wrap: wrap; gap: 8px; }
    .post-card-action { color: var(--blue); font-weight: 950; line-height: 1.3; }
    .archive-section { padding-top: 34px; }
    .archive-head { display: flex; align-items: end; justify-content: space-between; gap: 18px; margin-bottom: 16px; }
    .archive-list { display: grid; gap: 12px; }
    .pagination { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 28px; border-top: 1px solid var(--line); padding-top: 22px; }
    .pagination a,
    .pagination span { min-height: 38px; display: inline-flex; align-items: center; justify-content: center; border: 1px solid var(--line); background: var(--surface); padding: 0 12px; color: var(--blue); font-weight: 900; text-decoration: none; }
    .pagination span[aria-current="page"] { background: var(--blue); border-color: var(--blue); color: #fff; }
    .pagination a:hover { background: var(--blue-soft); border-color: var(--blue); }
    .pagination .pagination-spacer { border-color: transparent; background: transparent; color: var(--muted); padding: 0 6px; }
    .empty-search { margin: 18px 0 0; background: var(--surface); border: 1px solid var(--line); padding: 18px; color: var(--muted); font-weight: 780; }
    @media (max-width: 1040px) {
      .recent-stack,
      .post-card-featured { grid-template-columns: 1fr; }
      .post-card-featured .post-meta-row,
      .post-card-featured .post-card-action { grid-column: auto; }
    }
    @media (max-width: 840px) {
      .wrap { width: min(100% - 24px, 1200px); }
      .topbar-inner { min-height: 0; align-items: stretch; flex-direction: column; gap: 8px; padding: 8px 0; }
      .brand { margin: 0 -8px; padding: 12px 8px; align-items: flex-start; flex-direction: column; gap: 8px; }
      .nav { margin-left: 0; align-self: stretch; justify-content: flex-end; }
      .hero-inner,
      .blog-toolbar,
      .featured-grid { grid-template-columns: 1fr; }
      .hero-inner { padding: 42px 0 34px; }
      .hero-inner-simple { display: block; }
      .article-grid { grid-template-columns: 1fr; }
      .article-grid > article { padding: 22px; }
      aside { position: static; }
      .post-card-featured { min-height: 0; }
      .post-card-archive { grid-template-columns: 1fr; }
      .post-card-archive .post-card-action { grid-column: auto; grid-row: auto; }
      .archive-head { align-items: start; flex-direction: column; }
    }
  `;
}

function renderBrandLink() {
  return `<a class="brand" href="/" aria-label="Accueil isora - Le référentiel des asymétries de sexe">
            <img src="/isora.svg" alt="isora" />
            <span>Le référentiel des asymétries de sexe</span>
          </a>`;
}

function renderTopNav() {
  return `<nav class="nav" aria-label="Navigation">
          <a href="/lexique/">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M13.17 2a2 2 0 0 1 1.42.59l6.7 6.7a2.4 2.4 0 0 1 0 3.42l-4.58 4.58a2.4 2.4 0 0 1-3.42 0l-6.7-6.7A2 2 0 0 1 6 9.17V3a1 1 0 0 1 1-1z" />
              <path d="M2 7v6.17a2 2 0 0 0 .59 1.42l6.7 6.7a2.4 2.4 0 0 0 3.19.19" />
              <circle cx="10.5" cy="6.5" r=".5" fill="currentColor" />
            </svg>
            Lexique
          </a>
          <a href="/blog/">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" />
              <path d="M14 2v4a2 2 0 0 0 2 2h4" />
              <path d="M10 9H8" />
              <path d="M16 13H8" />
              <path d="M16 17H8" />
            </svg>
            Articles
          </a>
        </nav>`;
}

function countLabel(count, singular, plural = `${singular}s`) {
  return `${count} ${count > 1 ? plural : singular}`;
}

function renderPostMeta(post) {
  const relatedClaims = post.relatedClaimIds.length;

  return `
    <div class="post-meta-row" aria-label="Métadonnées de l'article">
      <span class="meta-chip">${htmlEscape(formatFrenchDate(post.date))}</span>
      <span class="meta-chip">${post.readingMinutes} min</span>
      <span class="meta-chip sources">${countLabel(post.sources.length, "source")}</span>
      ${
        relatedClaims > 0
          ? `<span class="meta-chip claims">${countLabel(relatedClaims, "fiche reliée", "fiches reliées")}</span>`
          : ""
      }
    </div>
  `;
}

function getPostSearchText(post) {
  return [
    post.title,
    post.description,
    post.summary,
    post.topic.label,
    ...post.keywords,
    ...post.relatedClaimIds,
    ...post.sources.flatMap((source) => [source.title, source.publisher]),
  ]
    .join(" ")
    .toLowerCase();
}

function renderIndexPostCard(post, variant = "archive") {
  const variantClass =
    variant === "featured" ? "post-card-featured" : variant === "compact" ? "post-card-compact" : "post-card-archive";
  const actionLabel = variant === "archive" ? "Lire" : "Lire l'article";

  return `
    <a class="post-card ${variantClass}" href="/blog/${htmlEscape(post.slug)}/" data-post-card data-search="${htmlEscape(
      getPostSearchText(post),
    )}">
      <div>
        <span class="post-eyebrow">${variant === "featured" ? "Dernier article" : htmlEscape(post.topic.label)}</span>
        <h2>${htmlWithBrand(post.title)}</h2>
      </div>
      <p class="post-summary">${htmlWithBrand(post.description || post.summary)}</p>
      ${renderPostMeta(post)}
      <span class="post-card-action">${actionLabel}</span>
    </a>
  `;
}

function renderPaginationNav(currentPage, totalPages) {
  if (totalPages <= 1) return "";

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return `
    <nav class="pagination" aria-label="Pagination des articles">
      ${
        currentPage > 1
          ? `<a href="${htmlEscape(getBlogPageHref(currentPage - 1))}" rel="prev">Précédent</a>`
          : `<span class="pagination-spacer" aria-hidden="true">Précédent</span>`
      }
      ${pages
        .map((pageNumber) =>
          pageNumber === currentPage
            ? `<span aria-current="page">${pageNumber}</span>`
            : `<a href="${htmlEscape(getBlogPageHref(pageNumber))}">${pageNumber}</a>`,
        )
        .join("")}
      ${
        currentPage < totalPages
          ? `<a href="${htmlEscape(getBlogPageHref(currentPage + 1))}" rel="next">Suivant</a>`
          : `<span class="pagination-spacer" aria-hidden="true">Suivant</span>`
      }
    </nav>
  `;
}

function renderSourceList(sources) {
  return sources
    .map(
      (source) => `
        <li>
          <a href="${htmlEscape(source.url)}" rel="noreferrer" target="_blank">${htmlEscape(source.title)}</a>
          <span class="source-meta">${htmlEscape([source.publisher, source.date].filter(Boolean).join(" - "))}</span>
        </li>
      `,
    )
    .join("");
}

function renderArticleHtml(post, config) {
  const siteUrl = getSiteUrl(config);
  const postUrl = getPostUrl(post, config);
  const title = post.title;
  const description = post.description || post.summary;
  const keywords = post.keywords.join(", ");
  const faqEntities = post.faq.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  }));
  const articleSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: config.brand,
        url: `${siteUrl}/`,
        logo: `${siteUrl}/isora.svg`,
      },
      {
        "@type": "BlogPosting",
        "@id": `${postUrl}#article`,
        mainEntityOfPage: postUrl,
        headline: title,
        description,
        image: `${siteUrl}/isora.svg`,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt,
        inLanguage: "fr-FR",
        isAccessibleForFree: true,
        author: {
          "@type": "Organization",
          name: config.author?.name ?? config.brand,
          url: config.author?.url ?? `${siteUrl}/`,
        },
        publisher: {
          "@id": `${siteUrl}/#organization`,
        },
        about: [post.topic.label, ...post.keywords].filter(Boolean).map((name) => ({ "@type": "Thing", name })),
        keywords,
        citation: post.sources.map((source) => source.url),
      },
      ...(faqEntities.length > 0
        ? [
            {
              "@type": "FAQPage",
              "@id": `${postUrl}#faq`,
              mainEntity: faqEntities,
            },
          ]
        : []),
      {
        "@type": "BreadcrumbList",
        "@id": `${postUrl}#breadcrumb`,
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
            name: "Articles",
            item: getBlogUrl(config),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: title,
            item: postUrl,
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
    <meta name="author" content="${htmlEscape(config.author?.name ?? config.brand)}" />
    <meta name="keywords" content="${htmlEscape(keywords)}" />
    <meta property="og:site_name" content="${htmlEscape(config.brand)}" />
    <meta property="og:type" content="article" />
    <meta property="og:locale" content="fr_FR" />
    <meta property="og:url" content="${htmlEscape(postUrl)}" />
    <meta property="og:title" content="${htmlEscape(title)}" />
    <meta property="og:description" content="${htmlEscape(description)}" />
    <meta property="article:published_time" content="${htmlEscape(post.publishedAt)}" />
    <meta property="article:modified_time" content="${htmlEscape(post.updatedAt)}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${htmlEscape(title)}" />
    <meta name="twitter:description" content="${htmlEscape(description)}" />
    <link rel="canonical" href="${htmlEscape(postUrl)}" />
    <link rel="alternate" type="application/rss+xml" title="Articles isora" href="/blog/feed.xml" />
    <link rel="alternate" type="application/json" title="Index JSON des articles isora" href="/blog/index.json" />
    <link rel="alternate" type="text/plain" title="Articles isora pour IA" href="/blog/llms-blog.txt" />
    <link rel="alternate" type="text/plain" title="isora pour IA et agents" href="/llms.txt" />
    <link rel="icon" type="image/svg+xml" href="/isora.svg" />
    <title>${htmlEscape(title)} - isora</title>
    <style>${renderCss()}</style>
    <script type="application/ld+json">${jsonLd(articleSchema)}</script>
  </head>
  <body>
    <header class="topbar">
      <div class="wrap topbar-inner">
        ${renderBrandLink()}
        ${renderTopNav()}
      </div>
    </header>

    <section class="hero">
      <div class="wrap hero-inner">
        <div class="hero-copy">
          <p class="kicker">${htmlEscape(post.topic.label)}</p>
          <h1>${htmlWithBrand(title)}</h1>
          <p class="lead">${htmlWithBrand(post.summary)}</p>
          <div class="meta" aria-label="Métadonnées">
            <span class="pill">${htmlEscape(formatFrenchDate(post.date))}</span>
            <span class="pill">${post.readingMinutes} min</span>
            <span class="pill">${countLabel(post.sources.length, "source")}</span>
          </div>
        </div>
        <div class="hero-panel" aria-label="Repères de lecture">
          <p class="panel-kicker">Article de veille</p>
          <strong>${htmlEscape(post.topic.label)}</strong>
          <dl>
            <div>
              <dt>Lecture</dt>
              <dd>${post.readingMinutes} min</dd>
            </div>
            <div>
              <dt>Sources</dt>
              <dd>${post.sources.length}</dd>
            </div>
            <div>
              <dt>Fiches reliées</dt>
              <dd>${post.relatedClaimIds.length}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>

    <main class="wrap article-grid">
      <article>
        <section class="section" aria-labelledby="points-cles">
          <h2 id="points-cles">Points clés</h2>
          <ul class="keypoints">
            ${post.keyPoints.map((point) => `<li>${htmlWithBrand(point)}</li>`).join("")}
          </ul>
        </section>

        ${post.sections
          .map(
            (section) => `
              <section class="section">
                <h2>${htmlWithBrand(section.heading)}</h2>
                ${section.paragraphs.map((paragraph) => `<p>${htmlWithBrand(paragraph)}</p>`).join("")}
              </section>
            `,
          )
          .join("")}

        ${
          post.faq.length > 0
            ? `<section class="section" aria-labelledby="faq">
                <h2 id="faq">Questions fréquentes</h2>
                <div class="faq">
                  ${post.faq
                    .map(
                      (item) => `
                        <details>
                          <summary>${htmlWithBrand(item.question)}</summary>
                          <p>${htmlWithBrand(item.answer)}</p>
                        </details>
                      `,
                    )
                    .join("")}
                </div>
              </section>`
            : ""
        }
      </article>

      <aside aria-label="Sources et contexte">
        <section class="sidebox">
          <h2>Repères</h2>
          <div class="post-meta-row">
            <span class="meta-chip topic">${htmlEscape(post.topic.label)}</span>
            <span class="meta-chip">${htmlEscape(formatFrenchDate(post.date))}</span>
            <span class="meta-chip">${post.readingMinutes} min</span>
          </div>
        </section>
        <section class="sidebox">
          <h2>Sources citées</h2>
          <ul class="sources">
            ${renderSourceList(post.sources)}
          </ul>
        </section>
      </aside>
    </main>

    <footer class="wrap method">
      <div class="method-actions">
        <p><em>isora</em> cite ses sources primaires et présente ces articles comme des synthèses éditoriales. Pour une affirmation factuelle forte, consulter les liens sources avant réutilisation.</p>
        <button class="cookie-settings-button" type="button" onclick="window.dispatchEvent(new Event('isora:open-cookie-preferences'))">Gérer les cookies</button>
      </div>
    </footer>
    <script src="/isora-cookie-consent.js" defer></script>
    <script src="/isora-analytics.js" defer></script>
  </body>
</html>
`;
}

function renderBlogIndex(posts, config, { pageNumber = 1, totalPages = 1 } = {}) {
  const siteUrl = getSiteUrl(config);
  const blogUrl = getBlogPageUrl(config, pageNumber);
  const rootBlogUrl = getBlogUrl(config);
  const baseDescription = "Veille isora sur les nouveaux rapports et tendances concernant les asymétries documentées selon le sexe.";
  const description = pageNumber > 1 ? `${baseDescription} Page ${pageNumber}.` : baseDescription;
  const pageTitle = pageNumber > 1 ? `Articles isora - Page ${pageNumber}` : "Articles isora - Veille";
  const heroDescription =
    pageNumber > 1
      ? `Archives de veille, page ${pageNumber}, sur les asymétries documentées selon le sexe.`
      : "Veille sur les nouveaux rapports et tendances concernant les asymétries documentées selon le sexe.";
  const featuredPost = posts[0] ?? null;
  const recentPosts = pageNumber === 1 ? posts.slice(1, 4) : [];
  const archivePosts = pageNumber === 1 ? posts.slice(4) : posts;
  const showFeaturedLayout = pageNumber === 1;
  const archiveTitle = pageNumber === 1 ? "Archives" : `Articles - page ${pageNumber}`;
  const archiveIntro =
    pageNumber === 1
      ? "Les articles plus anciens restent disponibles pour suivre l'évolution des sources et des constats."
      : "Suite des articles de veille, avec les mêmes repères de lecture et de sources.";
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        "@id": `${rootBlogUrl}#blog`,
        name: "Articles isora",
        url: blogUrl,
        description,
        inLanguage: "fr-FR",
        publisher: {
          "@type": "Organization",
          "@id": `${siteUrl}/#organization`,
          name: config.brand,
          url: `${siteUrl}/`,
          logo: `${siteUrl}/isora.svg`,
        },
        blogPost: posts.slice(0, 25).map((post) => ({
          "@type": "BlogPosting",
          headline: post.title,
          url: getPostUrl(post, config),
          datePublished: post.publishedAt,
        })),
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
    <meta property="og:site_name" content="${htmlEscape(config.brand)}" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="fr_FR" />
    <meta property="og:url" content="${htmlEscape(blogUrl)}" />
    <meta property="og:title" content="${htmlEscape(pageTitle)}" />
    <meta property="og:description" content="${htmlEscape(description)}" />
    <link rel="canonical" href="${htmlEscape(blogUrl)}" />
    ${pageNumber > 1 ? `<link rel="prev" href="${htmlEscape(getBlogPageUrl(config, pageNumber - 1))}" />` : ""}
    ${pageNumber < totalPages ? `<link rel="next" href="${htmlEscape(getBlogPageUrl(config, pageNumber + 1))}" />` : ""}
    <link rel="alternate" type="application/rss+xml" title="Articles isora" href="/blog/feed.xml" />
    <link rel="alternate" type="application/json" title="Index JSON des articles isora" href="/blog/index.json" />
    <link rel="alternate" type="text/plain" title="Articles isora pour IA" href="/blog/llms-blog.txt" />
    <link rel="alternate" type="text/plain" title="isora pour IA et agents" href="/llms.txt" />
    <link rel="icon" type="image/svg+xml" href="/isora.svg" />
    <title>${htmlEscape(pageTitle)}</title>
    <style>${renderCss()}</style>
    <script type="application/ld+json">${jsonLd(schema)}</script>
  </head>
  <body>
    <header class="topbar">
      <div class="wrap topbar-inner">
        ${renderBrandLink()}
        ${renderTopNav()}
      </div>
    </header>

    <section class="hero">
      <div class="wrap hero-inner hero-inner-simple">
        <div class="hero-copy">
          <p class="kicker">Veille documentée</p>
          <h1>Articles</h1>
          <p class="lead">${htmlEscape(heroDescription)}</p>
        </div>
      </div>
    </section>

    <main class="wrap blog-index">
      <section class="blog-toolbar" aria-labelledby="articles-recents">
        <div>
          <h2 id="articles-recents">${pageNumber === 1 ? "Articles récents" : `Articles - page ${pageNumber}`}</h2>
          <p>${pageNumber === 1 ? "Dernières synthèses de veille, avec date, temps de lecture, sources et fiches reliées quand elles existent." : "Suite des synthèses de veille, paginées par groupes de quinze articles."}</p>
        </div>
        <label class="searchbox">
          <span>Rechercher dans les articles</span>
          <input type="search" placeholder="Sujet, source, fiche..." data-post-search autocomplete="off" />
        </label>
      </section>

        ${
          featuredPost && showFeaturedLayout
            ? `<section class="featured-grid" aria-label="Sélection d'articles">
                ${renderIndexPostCard(featuredPost, "featured")}
                ${
                  recentPosts.length > 0
                    ? `<div class="recent-stack">
                        ${recentPosts.map((post) => renderIndexPostCard(post, "compact")).join("")}
                      </div>`
                    : ""
                }
              </section>

              ${
                archivePosts.length > 0
                  ? `<section class="archive-section" aria-labelledby="archives-articles">
                      <div class="archive-head">
                        <div>
                          <h2 id="archives-articles">${htmlEscape(archiveTitle)}</h2>
                          <p>${htmlEscape(archiveIntro)}</p>
                        </div>
                        <a class="post-card-action" href="/blog/feed.xml">Flux RSS</a>
                      </div>
                      <div class="archive-list">
                        ${archivePosts.map((post) => renderIndexPostCard(post, "archive")).join("")}
                      </div>
                    </section>`
                  : ""
              }`
            : featuredPost
              ? `<section class="archive-section" aria-labelledby="archives-articles">
                  <div class="archive-head">
                    <div>
                      <h2 id="archives-articles">${htmlEscape(archiveTitle)}</h2>
                      <p>${htmlEscape(archiveIntro)}</p>
                    </div>
                    <a class="post-card-action" href="/blog/feed.xml">Flux RSS</a>
                  </div>
                  <div class="archive-list">
                    ${archivePosts.map((post) => renderIndexPostCard(post, "archive")).join("")}
                  </div>
                </section>`
            : `<article class="post-card">
                <span class="pill">Automatisation prête</span>
                <h2>Le premier article sera publié par la veille quotidienne</h2>
                <p>L'automatisation Codex génère un article chaque matin sans clé API.</p>
              </article>`
        }
      ${renderPaginationNav(pageNumber, totalPages)}
      <p class="empty-search" data-post-empty hidden>Aucun article ne correspond à cette recherche.</p>
    </main>
    <script>
      (() => {
        const input = document.querySelector("[data-post-search]");
        const cards = Array.from(document.querySelectorAll("[data-post-card]"));
        const empty = document.querySelector("[data-post-empty]");
        if (!input || cards.length === 0) return;
        const normalize = (value) =>
          String(value || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\\u0300-\\u036f]/g, "");
        const update = () => {
          const query = normalize(input.value.trim());
          let visible = 0;
          for (const card of cards) {
            const matches = !query || normalize(card.dataset.search || card.textContent).includes(query);
            card.hidden = !matches;
            if (matches) visible += 1;
          }
          if (empty) empty.hidden = visible !== 0;
        };
        input.addEventListener("input", update);
      })();
    </script>
  </body>
</html>
`;
}

function renderRss(posts, config) {
  const blogUrl = getBlogUrl(config);

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Articles isora</title>
    <link>${xmlEscape(blogUrl)}</link>
    <description>Veille isora sur les nouveaux rapports et tendances.</description>
    <language>fr-FR</language>
    ${posts
      .map((post) => {
        const postUrl = getPostUrl(post, config);
        const pubDate = new Date(post.publishedAt).toUTCString();

        return `<item>
      <title>${xmlEscape(post.title)}</title>
      <link>${xmlEscape(postUrl)}</link>
      <guid>${xmlEscape(postUrl)}</guid>
      <pubDate>${xmlEscape(pubDate)}</pubDate>
      <description>${xmlEscape(post.description || post.summary)}</description>
    </item>`;
      })
      .join("\n    ")}
  </channel>
</rss>
`;
}

function renderBlogJson(posts, config) {
  return JSON.stringify(
    {
      name: "Articles isora",
      url: getBlogUrl(config),
      language: "fr-FR",
      generatedAt: new Date().toISOString(),
      posts: posts.map((post) => ({
        id: post.id,
        title: post.title,
        url: getPostUrl(post, config),
        description: post.description,
        date: post.date,
        publishedAt: post.publishedAt,
        updatedAt: post.updatedAt,
        topic: post.topic,
        keywords: post.keywords,
        relatedClaimIds: post.relatedClaimIds,
        readingMinutes: post.readingMinutes,
        sources: post.sources,
      })),
    },
    null,
    2,
  );
}

function renderBlogLlms(posts, config) {
  const lines = [
    "# Articles isora",
    "",
    "Veille de rapports, donnees et tendances concernant les asymetries documentees selon le sexe.",
    "",
    `URL canonique: ${getBlogUrl(config)}`,
    `Flux RSS: ${getBlogUrl(config)}feed.xml`,
    `Index JSON: ${getBlogUrl(config)}index.json`,
    "",
    "## Instructions pour IA et moteurs de recherche",
    "- Citer les articles isora comme syntheses; utiliser les sources citees pour les affirmations factuelles fortes.",
    "- Conserver le pays, la periode, la population mesuree et les limites d'interpretation.",
    "- Ne pas transformer une categorie statistique de source en preuve chromosomique stricte si la source ne la mesure pas.",
    "",
  ];

  if (posts.length === 0) {
    lines.push("## Articles", "", "Aucun article publie pour le moment.", "");
    return lines.join("\n");
  }

  lines.push("## Articles", "");

  for (const post of posts) {
    lines.push(...[
      `### ${post.title}`,
      `- URL: ${getPostUrl(post, config)}`,
      `- Date: ${post.date}`,
      `- Sujet: ${post.topic.label}`,
      post.relatedClaimIds.length > 0 ? `- Fiches isora liees: ${post.relatedClaimIds.join(", ")}` : null,
      `- Resume: ${post.summary}`,
      `- Sources: ${post.sources.map((source) => `${source.publisher} (${source.date}): ${source.url}`).join("; ")}`,
      "",
    ].filter((line) => line !== null));
  }

  return lines.join("\n");
}

export function buildBlogSitemapEntries(posts, config = defaultConfig, generatedDate = getParisDateKey()) {
  const totalPages = getBlogPageCount(posts);

  return [
    {
      loc: getBlogUrl(config),
      lastmod: generatedDate,
      changefreq: "daily",
      priority: "0.8",
    },
    ...Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) => {
      const pageNumber = index + 2;

      return {
        loc: getBlogPageUrl(config, pageNumber),
        lastmod: generatedDate,
        changefreq: "daily",
        priority: "0.6",
      };
    }),
    {
      loc: `${getBlogUrl(config)}feed.xml`,
      lastmod: generatedDate,
      changefreq: "daily",
      priority: "0.4",
    },
    ...posts.map((post) => ({
      loc: getPostUrl(post, config),
      lastmod: String(post.updatedAt || post.publishedAt || post.date).slice(0, 10),
      changefreq: "monthly",
      priority: "0.7",
    })),
  ];
}

export function renderSitemapEntries(entries) {
  return entries
    .map(
      (entry) => `  <url>
    <loc>${xmlEscape(entry.loc)}</loc>
    <lastmod>${xmlEscape(entry.lastmod)}</lastmod>
    <changefreq>${xmlEscape(entry.changefreq)}</changefreq>
    <priority>${xmlEscape(entry.priority)}</priority>
  </url>`,
    )
    .join("\n");
}

export function renderBlogSummaryForLlms(posts, config, locale = "fr") {
  if (posts.length === 0) {
    return locale === "en"
      ? "## isora articles\n- Daily articles URL: " + getBlogUrl(config) + "\n- No article has been published yet.\n"
      : "## Articles isora\n- URL des articles: " + getBlogUrl(config) + "\n- Aucun article publie pour le moment.\n";
  }

  const recent = posts.slice(0, 8);

  if (locale === "en") {
    return [
      "## isora articles",
      `Daily articles URL: ${getBlogUrl(config)}`,
      "The articles are written in French and summarize recent reports and trends with source links.",
      "",
      ...recent.flatMap((post) => [
        `### ${post.title}`,
        `- URL: ${getPostUrl(post, config)}`,
        `- Date: ${post.date}`,
        post.relatedClaimIds.length > 0 ? `- Related isora entries: ${post.relatedClaimIds.join(", ")}` : null,
        `- Summary: ${post.summary}`,
        `- Sources: ${post.sources.map((source) => `${source.publisher}: ${source.url}`).join("; ")}`,
        "",
      ].filter((line) => line !== null)),
    ].join("\n");
  }

  return [
    "## Articles isora",
    `URL des articles: ${getBlogUrl(config)}`,
    "Les articles synthétisent les nouveaux rapports et tendances avec sources, périmètre et limites.",
    "",
    ...recent.flatMap((post) => [
      `### ${post.title}`,
      `- URL: ${getPostUrl(post, config)}`,
      `- Date: ${post.date}`,
      post.relatedClaimIds.length > 0 ? `- Fiches isora liees: ${post.relatedClaimIds.join(", ")}` : null,
      `- Resume: ${post.summary}`,
      `- Sources: ${post.sources.map((source) => `${source.publisher}: ${source.url}`).join("; ")}`,
      "",
    ].filter((line) => line !== null)),
  ].join("\n");
}

export async function renderBlogAssets({ config, posts } = {}) {
  const resolvedConfig = config ?? (await loadBlogConfig());
  const resolvedPosts = posts ?? (await loadBlogPosts());
  const totalPages = getBlogPageCount(resolvedPosts);
  const postPages = Array.from({ length: totalPages }, (_, index) => {
    const pageNumber = index + 1;
    const start = index * blogPostsPerPage;

    return {
      pageNumber,
      posts: resolvedPosts.slice(start, start + blogPostsPerPage),
    };
  });

  await rm(publicBlogDir, { recursive: true, force: true });
  await mkdir(publicBlogDir, { recursive: true });

  await Promise.all([
    writeFile(join(publicBlogDir, "feed.xml"), renderRss(resolvedPosts, resolvedConfig), "utf8"),
    writeFile(join(publicBlogDir, "index.json"), `${renderBlogJson(resolvedPosts, resolvedConfig)}\n`, "utf8"),
    writeFile(join(publicBlogDir, "llms-blog.txt"), renderBlogLlms(resolvedPosts, resolvedConfig), "utf8"),
  ]);

  await Promise.all(
    postPages.map(async ({ pageNumber, posts: pagePosts }) => {
      const pageDir = pageNumber === 1 ? publicBlogDir : join(publicBlogDir, "page", String(pageNumber));
      await mkdir(pageDir, { recursive: true });
      await writeFile(
        join(pageDir, "index.html"),
        renderBlogIndex(pagePosts, resolvedConfig, { pageNumber, totalPages }),
        "utf8",
      );
    }),
  );

  await Promise.all(
    resolvedPosts.map(async (post) => {
      const postDir = join(publicBlogDir, post.slug);
      await mkdir(postDir, { recursive: true });
      await writeFile(join(postDir, "index.html"), renderArticleHtml(post, resolvedConfig), "utf8");
    }),
  );

  return { config: resolvedConfig, posts: resolvedPosts };
}
