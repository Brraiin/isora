import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  getParisDateKey,
  loadBlogConfig,
  loadBlogPosts,
  normalizeBlogPost,
  renderBlogAssets,
  root,
  slugify,
  textLine,
  writeBlogPost,
} from "./blog-utils.mjs";

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_BLOG_MODEL || process.env.OPENAI_MODEL || "gpt-4.1-mini";
const today = getParisDateKey();
const now = new Date().toISOString();
const force = process.argv.includes("--force");
const candidatesDir = join(root, "research", "candidates");

function extractOutputText(parsed) {
  return (
    parsed.output_text ??
    parsed.output
      ?.flatMap((entry) => entry.content ?? [])
      .map((content) => content.text ?? "")
      .join("\n")
      .trim() ??
    ""
  );
}

function extractJsonObject(value) {
  const trimmed = value.trim();
  const withoutFence = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(withoutFence);
  } catch {
    const firstBrace = withoutFence.indexOf("{");
    const lastBrace = withoutFence.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      throw new Error("La réponse ne contient pas d'objet JSON exploitable.");
    }

    return JSON.parse(withoutFence.slice(firstBrace, lastBrace + 1));
  }
}

function normalizeUrl(value) {
  try {
    const url = new URL(textLine(value));
    if (!["http:", "https:"].includes(url.protocol)) return "";
    url.hash = "";
    return url.toString();
  } catch {
    return "";
  }
}

function normalizeGeneratedPost(raw, config) {
  if (raw.skip === true) {
    return { skip: true, reason: textLine(raw.reason || "Aucun sujet fiable sélectionné.") };
  }

  const topic = config.topics.find((item) => item.id === raw.topicId) ?? config.topics[0] ?? {
    id: "veille",
    label: "Veille Isora",
  };
  const title = textLine(raw.title);
  const description = textLine(raw.description);
  const baseSlug = slugify(raw.slug || title);
  const sources = Array.isArray(raw.sources)
    ? raw.sources
        .map((source) => ({
          title: textLine(source.title ?? source.label ?? ""),
          publisher: textLine(source.publisher ?? ""),
          url: normalizeUrl(source.url),
          date: textLine(source.date ?? ""),
          type: textLine(source.type ?? "source"),
        }))
        .filter((source) => source.title && source.publisher && source.url)
    : [];

  const post = normalizeBlogPost({
    id: `${today}-${baseSlug}`,
    slug: `${today}-${baseSlug}`,
    status: "published",
    language: "fr",
    title,
    description,
    date: today,
    publishedAt: now,
    updatedAt: now,
    topic: {
      id: topic.id,
      label: topic.label,
    },
    keywords: Array.isArray(raw.keywords) ? raw.keywords : [],
    summary: raw.summary,
    keyPoints: raw.keyPoints,
    sections: raw.sections,
    faq: raw.faq,
    sources,
    editorialChecks: {
      generatedBy: "scripts/generate-daily-blog.mjs",
      model,
      generatedAt: now,
      requiresHumanReview: false,
    },
  });

  const errors = [];

  if (!post.title) errors.push("titre manquant");
  if (!post.description) errors.push("description manquante");
  if (!post.summary) errors.push("résumé manquant");
  if (post.sources.length < config.quality.minSources) {
    errors.push(`moins de ${config.quality.minSources} sources valides`);
  }
  if (post.keyPoints.length < config.quality.minKeyPoints) {
    errors.push(`moins de ${config.quality.minKeyPoints} points clés`);
  }
  if (post.faq.length < config.quality.minFaqItems) {
    errors.push(`moins de ${config.quality.minFaqItems} questions FAQ`);
  }
  if (post.sections.length < 3) errors.push("moins de 3 sections éditoriales");

  if (errors.length > 0) {
    throw new Error(`Article rejeté: ${errors.join(", ")}.`);
  }

  return post;
}

function normalizedFingerprint(value) {
  return textLine(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function isDuplicatePost(post, existingPosts) {
  const title = normalizedFingerprint(post.title);
  const sourceUrls = new Set(post.sources.map((source) => source.url));

  return existingPosts.some((existingPost) => {
    if (normalizedFingerprint(existingPost.title) === title) return true;

    const sharedSources = existingPost.sources.filter((source) => sourceUrls.has(source.url)).length;
    return sharedSources >= 2;
  });
}

async function writeCandidate(name, content) {
  await mkdir(candidatesDir, { recursive: true });
  await writeFile(join(candidatesDir, name), content, "utf8");
}

const config = await loadBlogConfig();
const existingPosts = await loadBlogPosts({ includeDrafts: true });
const todayPost = existingPosts.find((post) => post.date === today);

if (todayPost && !force) {
  await renderBlogAssets({ config, posts: existingPosts.filter((post) => post.status === "published") });
  console.log(`Article déjà présent pour ${today}: ${todayPost.slug}`);
  process.exit(0);
}

if (!apiKey) {
  await writeCandidate(
    `${today}-blog-skipped.md`,
    [
      "# Blog quotidien non exécuté",
      "",
      "OPENAI_API_KEY est absent. Ajoutez ce secret GitHub ou cette variable locale pour générer l'article du matin.",
      "",
      `Date: ${today}`,
      `Modèle prévu: ${model}`,
      "",
    ].join("\n"),
  );
  console.log("OPENAI_API_KEY absent; aucun article généré.");
  process.exit(0);
}

const existingContext = existingPosts
  .slice(0, 40)
  .map((post) => `- ${post.date} / ${post.title} / sources: ${post.sources.map((source) => source.url).join(", ")}`)
  .join("\n");

const systemPrompt = `
Tu es l'agent de veille éditoriale d'Isora.
Objectif: produire un article de blog quotidien bien indexable par Google et par les IA, sans contenu dupliqué ni scraping réécrit sans valeur.

Règles éditoriales:
- Isora documente des asymétries selon le sexe; ne centre pas l'article sur l'identité de genre, la transition ou les catégories trans.
- Reste neutre, factuel, mesuré. Pas de formulation militante, hostile ou rhétorique.
- Ne prétends pas qu'une source mesure les chromosomes si elle mesure seulement women/men, femmes/hommes, sexe déclaré, sexe légal ou autre catégorie.
- Préserve les pays, périodes, populations mesurées, limites et incertitudes.
- Cite des sources primaires, institutionnelles ou scientifiques quand elles existent.
- Apporte une valeur originale: explique ce qui change, ce qui est mesuré, ce qui ne l'est pas, et ce qu'Isora devrait surveiller.
- Ne copie pas de longs passages. Résume avec tes propres mots.
- Si aucun sujet fiable et récent n'est trouvé, réponds {"skip": true, "reason": "..."}.

Réponds uniquement en JSON strict, sans Markdown.
`;

const userPrompt = `
Nous sommes le ${today}. Trouve un sujet récent pour le blog quotidien Isora.

Priorités de sources:
${config.sourcePriorities.map((source) => `- ${source}`).join("\n")}

Axes autorisés:
${config.topics.map((topic) => `- ${topic.id}: ${topic.label}. Recherche: ${topic.query}`).join("\n")}

Articles existants à éviter:
${existingContext || "- Aucun article existant."}

Schéma JSON attendu:
{
  "topicId": "un id de topic fourni",
  "title": "titre H1 en français, précis et longue traîne",
  "slug": "slug court sans date",
  "description": "meta description en 145 à 165 caractères",
  "summary": "chapô clair en 2 phrases maximum",
  "keywords": ["mot clé", "mot clé"],
  "keyPoints": ["3 à 5 points clés factuels"],
  "sections": [
    {
      "heading": "Ce qui change",
      "paragraphs": ["paragraphe 1", "paragraphe 2"]
    },
    {
      "heading": "Ce que la source mesure",
      "paragraphs": ["paragraphe 1"]
    },
    {
      "heading": "Pourquoi c'est utile pour Isora",
      "paragraphs": ["paragraphe 1"]
    },
    {
      "heading": "Limites à garder en tête",
      "paragraphs": ["paragraphe 1"]
    }
  ],
  "faq": [
    { "question": "question SEO naturelle", "answer": "réponse courte et sourcée" },
    { "question": "question SEO naturelle", "answer": "réponse courte et sourcée" }
  ],
  "sources": [
    {
      "title": "titre de la publication source",
      "publisher": "organisme",
      "url": "https://...",
      "date": "date ou année de publication",
      "type": "rapport | statistique | article scientifique | communiqué"
    }
  ]
}

Contraintes:
- Au moins ${config.quality.minSources} sources avec URL.
- Pas de liens inventés.
- Article en français.
- Sujet daté de préférence de moins de 18 mois.
`;

const response = await fetch("https://api.openai.com/v1/responses", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model,
    tools: [{ type: "web_search_preview" }],
    input: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
  }),
});

const raw = await response.text();

if (!response.ok) {
  await writeCandidate(`${today}-blog-error.json`, raw);
  throw new Error(`Erreur OpenAI Responses: ${response.status}`);
}

const parsed = JSON.parse(raw);
const outputText = extractOutputText(parsed);
await writeCandidate(`${today}-blog-raw.json`, outputText || raw);

const generated = extractJsonObject(outputText || raw);
const post = normalizeGeneratedPost(generated, config);

if (post.skip) {
  await writeCandidate(`${today}-blog-skip.json`, `${JSON.stringify(post, null, 2)}\n`);
  console.log(`Aucun article publié: ${post.reason}`);
  process.exit(0);
}

if (isDuplicatePost(post, existingPosts) && !force) {
  await writeCandidate(`${today}-blog-duplicate.json`, `${JSON.stringify(post, null, 2)}\n`);
  console.log(`Article trop proche d'un article existant: ${post.title}`);
  process.exit(0);
}

const savedPost = await writeBlogPost(post);
const publishedPosts = await loadBlogPosts();
await renderBlogAssets({ config, posts: publishedPosts });

console.log(`Article généré: ${savedPost.slug}`);
