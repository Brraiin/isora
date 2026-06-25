import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const root = join(__dirname, "..");
export const blogContentDir = join(root, "content", "blog");
export const blogPostsDir = join(blogContentDir, "posts");
export const publicDir = join(root, "public");
export const publicBlogDir = join(publicDir, "blog");

const defaultConfig = {
  siteUrl: "https://isora-xi.vercel.app",
  brand: "Isora",
  language: "fr-FR",
  timezone: "Europe/Paris",
  author: {
    name: "Isora",
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
      label: textLine(post.topic?.label ?? "Veille Isora"),
    },
    keywords: Array.isArray(post.keywords) ? post.keywords.map(textLine).filter(Boolean) : [],
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
      background: #f4f4f0;
      color: #171717;
    }
    * { box-sizing: border-box; }
    body { margin: 0; background: #f4f4f0; color: #171717; }
    a { color: #1455a3; text-underline-offset: 0.18em; }
    .wrap { width: min(100% - 32px, 980px); margin: 0 auto; }
    .topbar { border-bottom: 1px solid #d8d8d0; background: #fff; }
    .topbar-inner { min-height: 76px; display: flex; align-items: center; justify-content: space-between; gap: 18px; }
    .brand { display: inline-flex; align-items: center; gap: 14px; color: #171717; text-decoration: none; font-weight: 900; }
    .brand img { width: 106px; height: auto; display: block; }
    .nav { display: flex; flex-wrap: wrap; gap: 10px; font-weight: 800; }
    .nav a { min-height: 40px; display: inline-flex; align-items: center; padding: 0 12px; }
    .hero { background: #dff3ea; border-bottom: 1px solid #d8d8d0; }
    .hero-inner { padding: 58px 0 48px; }
    .kicker { margin: 0 0 14px; color: #13519c; font-weight: 900; }
    h1 { margin: 0; max-width: 820px; font-size: clamp(2.1rem, 5vw, 4.1rem); line-height: 1.06; letter-spacing: 0; }
    .lead { max-width: 780px; margin: 22px 0 0; font-size: 1.16rem; line-height: 1.72; color: #4b4b4b; }
    .meta { margin-top: 24px; display: flex; flex-wrap: wrap; gap: 8px; }
    .pill { display: inline-flex; min-height: 32px; align-items: center; background: #fff; border: 1px solid #d8d8d0; padding: 5px 10px; font-size: 0.88rem; font-weight: 800; color: #3a3a3a; }
    main { padding-bottom: 64px; }
    .article-grid { display: grid; grid-template-columns: minmax(0, 1fr) 280px; gap: 34px; align-items: start; padding-top: 34px; }
    article { min-width: 0; }
    .section { background: #fff; border: 1px solid #d8d8d0; padding: 26px; margin-bottom: 18px; }
    .section h2 { margin: 0 0 14px; font-size: 1.42rem; line-height: 1.22; }
    .section p { margin: 0 0 13px; color: #3f3f3f; line-height: 1.72; }
    .section p:last-child { margin-bottom: 0; }
    .keypoints { display: grid; gap: 10px; padding: 0; list-style: none; }
    .keypoints li { border-left: 4px solid #1455a3; background: #eef4fb; padding: 12px 14px; line-height: 1.55; font-weight: 720; }
    aside { position: sticky; top: 18px; display: grid; gap: 14px; }
    .sidebox { background: #fff; border: 1px solid #d8d8d0; padding: 18px; }
    .sidebox h2 { margin: 0 0 10px; font-size: 1rem; }
    .sources { display: grid; gap: 12px; padding: 0; list-style: none; }
    .sources li { min-width: 0; line-height: 1.45; }
    .sources a { overflow-wrap: anywhere; font-weight: 850; }
    .source-meta { display: block; color: #666; font-size: 0.88rem; margin-top: 3px; }
    .faq { display: grid; gap: 12px; }
    details { border: 1px solid #d8d8d0; padding: 14px 16px; background: #fff; }
    summary { cursor: pointer; font-weight: 900; }
    details p { margin-top: 10px; }
    .method { border-top: 1px solid #d8d8d0; padding: 28px 0 42px; color: #555; line-height: 1.65; }
    .post-list { display: grid; gap: 14px; padding: 34px 0 64px; }
    .post-card { display: grid; gap: 10px; background: #fff; border: 1px solid #d8d8d0; padding: 22px; text-decoration: none; color: inherit; }
    .post-card:hover { border-color: #1455a3; }
    .post-card h2 { margin: 0; font-size: 1.35rem; line-height: 1.25; }
    .post-card p { margin: 0; color: #555; line-height: 1.6; }
    @media (max-width: 840px) {
      .topbar-inner { align-items: flex-start; flex-direction: column; padding: 14px 0; }
      .article-grid { grid-template-columns: 1fr; }
      aside { position: static; }
      .section { padding: 20px; }
    }
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
            name: "Isora",
            item: `${siteUrl}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Blog",
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
    <link rel="icon" type="image/svg+xml" href="/isora.svg" />
    <title>${htmlEscape(title)} - Isora</title>
    <style>${renderCss()}</style>
    <script type="application/ld+json">${jsonLd(articleSchema)}</script>
  </head>
  <body>
    <header class="topbar">
      <div class="wrap topbar-inner">
        <a class="brand" href="/">
          <img src="/isora.svg" alt="Isora" />
        </a>
        <nav class="nav" aria-label="Navigation">
          <a href="/">Référentiel</a>
          <a href="/blog/">Blog</a>
          <a href="/llms.txt">llms.txt</a>
        </nav>
      </div>
    </header>

    <section class="hero">
      <div class="wrap hero-inner">
        <p class="kicker">${htmlEscape(post.topic.label)}</p>
        <h1>${htmlEscape(title)}</h1>
        <p class="lead">${htmlEscape(post.summary)}</p>
        <div class="meta" aria-label="Métadonnées">
          <span class="pill">${htmlEscape(formatFrenchDate(post.date))}</span>
          <span class="pill">${post.readingMinutes} min</span>
          <span class="pill">${post.sources.length} sources</span>
        </div>
      </div>
    </section>

    <main class="wrap article-grid">
      <article>
        <section class="section" aria-labelledby="points-cles">
          <h2 id="points-cles">Points clés</h2>
          <ul class="keypoints">
            ${post.keyPoints.map((point) => `<li>${htmlEscape(point)}</li>`).join("")}
          </ul>
        </section>

        ${post.sections
          .map(
            (section) => `
              <section class="section">
                <h2>${htmlEscape(section.heading)}</h2>
                ${section.paragraphs.map((paragraph) => `<p>${htmlEscape(paragraph)}</p>`).join("")}
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
                          <summary>${htmlEscape(item.question)}</summary>
                          <p>${htmlEscape(item.answer)}</p>
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
          <h2>Sources citées</h2>
          <ul class="sources">
            ${renderSourceList(post.sources)}
          </ul>
        </section>
        <section class="sidebox">
          <h2>Méthode</h2>
          <p>Article généré depuis une veille web assistée par IA, puis structuré pour conserver les sources, le périmètre mesuré et les limites d'interprétation.</p>
        </section>
      </aside>
    </main>

    <footer class="wrap method">
      <p>Isora cite ses sources primaires et présente ces articles comme des synthèses éditoriales. Pour une affirmation factuelle forte, consulter les liens sources avant réutilisation.</p>
    </footer>
  </body>
</html>
`;
}

function renderBlogIndex(posts, config) {
  const siteUrl = getSiteUrl(config);
  const blogUrl = getBlogUrl(config);
  const description = "Veille Isora sur les nouveaux rapports et tendances concernant les asymétries documentées selon le sexe.";
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        "@id": `${blogUrl}#blog`,
        name: "Blog Isora",
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
    <meta property="og:title" content="Blog Isora - Veille" />
    <meta property="og:description" content="${htmlEscape(description)}" />
    <link rel="canonical" href="${htmlEscape(blogUrl)}" />
    <link rel="alternate" type="application/json" title="Index JSON du blog Isora" href="/blog/index.json" />
    <link rel="icon" type="image/svg+xml" href="/isora.svg" />
    <title>Blog Isora - Veille</title>
    <style>${renderCss()}</style>
    <script type="application/ld+json">${jsonLd(schema)}</script>
  </head>
  <body>
    <header class="topbar">
      <div class="wrap topbar-inner">
        <a class="brand" href="/">
          <img src="/isora.svg" alt="Isora" />
        </a>
        <nav class="nav" aria-label="Navigation">
          <a href="/">Référentiel</a>
        </nav>
      </div>
    </header>

    <section class="hero">
      <div class="wrap hero-inner">
        <h1>Blog Isora</h1>
        <p class="lead">${htmlEscape(description)}</p>
      </div>
    </section>

    <main class="wrap">
      <section class="post-list" aria-label="Articles">
        ${
          posts.length > 0
            ? posts
                .map(
                  (post) => `
                    <a class="post-card" href="/blog/${htmlEscape(post.slug)}/">
                      <span class="pill">${htmlEscape(formatFrenchDate(post.date))} - ${post.readingMinutes} min</span>
                      <h2>${htmlEscape(post.title)}</h2>
                      <p>${htmlEscape(post.description || post.summary)}</p>
                    </a>
                  `,
                )
                .join("")
            : `<article class="post-card">
                <span class="pill">Automatisation prête</span>
                <h2>Le premier article sera publié par la veille quotidienne</h2>
                <p>L'automatisation Codex génère un article chaque matin sans clé API.</p>
              </article>`
        }
      </section>
    </main>
  </body>
</html>
`;
}

function renderRss(posts, config) {
  const blogUrl = getBlogUrl(config);

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Blog Isora</title>
    <link>${xmlEscape(blogUrl)}</link>
    <description>Veille Isora sur les nouveaux rapports et tendances.</description>
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
      name: "Blog Isora",
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
    "# Blog Isora",
    "",
    "Veille de rapports, donnees et tendances concernant les asymetries documentees selon le sexe.",
    "",
    `URL canonique: ${getBlogUrl(config)}`,
    `Flux RSS: ${getBlogUrl(config)}feed.xml`,
    `Index JSON: ${getBlogUrl(config)}index.json`,
    "",
    "## Instructions pour IA et moteurs de recherche",
    "- Citer les articles Isora comme syntheses; utiliser les sources citees pour les affirmations factuelles fortes.",
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
    lines.push(
      `### ${post.title}`,
      `- URL: ${getPostUrl(post, config)}`,
      `- Date: ${post.date}`,
      `- Sujet: ${post.topic.label}`,
      `- Resume: ${post.summary}`,
      `- Sources: ${post.sources.map((source) => `${source.publisher} (${source.date}): ${source.url}`).join("; ")}`,
      "",
    );
  }

  return lines.join("\n");
}

export function buildBlogSitemapEntries(posts, config = defaultConfig, generatedDate = getParisDateKey()) {
  return [
    {
      loc: getBlogUrl(config),
      lastmod: generatedDate,
      changefreq: "daily",
      priority: "0.8",
    },
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
      ? "## Isora blog\n- Daily blog URL: " + getBlogUrl(config) + "\n- No blog post has been published yet.\n"
      : "## Blog Isora\n- URL du blog quotidien: " + getBlogUrl(config) + "\n- Aucun article publie pour le moment.\n";
  }

  const recent = posts.slice(0, 8);

  if (locale === "en") {
    return [
      "## Isora blog",
      `Daily blog URL: ${getBlogUrl(config)}`,
      "The blog is written in French and summarizes recent reports and trends with source links.",
      "",
      ...recent.flatMap((post) => [
        `### ${post.title}`,
        `- URL: ${getPostUrl(post, config)}`,
        `- Date: ${post.date}`,
        `- Summary: ${post.summary}`,
        `- Sources: ${post.sources.map((source) => `${source.publisher}: ${source.url}`).join("; ")}`,
        "",
      ]),
    ].join("\n");
  }

  return [
    "## Blog Isora",
    `URL du blog quotidien: ${getBlogUrl(config)}`,
    "Le blog synthétise les nouveaux rapports et tendances avec sources, périmètre et limites.",
    "",
    ...recent.flatMap((post) => [
      `### ${post.title}`,
      `- URL: ${getPostUrl(post, config)}`,
      `- Date: ${post.date}`,
      `- Resume: ${post.summary}`,
      `- Sources: ${post.sources.map((source) => `${source.publisher}: ${source.url}`).join("; ")}`,
      "",
    ]),
  ].join("\n");
}

export async function renderBlogAssets({ config, posts } = {}) {
  const resolvedConfig = config ?? (await loadBlogConfig());
  const resolvedPosts = posts ?? (await loadBlogPosts());

  await rm(publicBlogDir, { recursive: true, force: true });
  await mkdir(publicBlogDir, { recursive: true });

  await Promise.all([
    writeFile(join(publicBlogDir, "index.html"), renderBlogIndex(resolvedPosts, resolvedConfig), "utf8"),
    writeFile(join(publicBlogDir, "feed.xml"), renderRss(resolvedPosts, resolvedConfig), "utf8"),
    writeFile(join(publicBlogDir, "index.json"), `${renderBlogJson(resolvedPosts, resolvedConfig)}\n`, "utf8"),
    writeFile(join(publicBlogDir, "llms-blog.txt"), renderBlogLlms(resolvedPosts, resolvedConfig), "utf8"),
  ]);

  await Promise.all(
    resolvedPosts.map(async (post) => {
      const postDir = join(publicBlogDir, post.slug);
      await mkdir(postDir, { recursive: true });
      await writeFile(join(postDir, "index.html"), renderArticleHtml(post, resolvedConfig), "utf8");
    }),
  );

  return { config: resolvedConfig, posts: resolvedPosts };
}
