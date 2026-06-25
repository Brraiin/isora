import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const queriesPath = path.join(root, "research", "queries.json");
const outputDir = path.join(root, "research", "candidates");
const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const today = new Date().toISOString().slice(0, 10);

const queries = JSON.parse(await readFile(queriesPath, "utf8"));

await mkdir(outputDir, { recursive: true });

if (!apiKey) {
  await writeFile(
    path.join(outputDir, `${today}-skipped.md`),
    [
      "# Veille non exécutée",
      "",
      "OPENAI_API_KEY est absent. Ajoutez cette variable au runner pour activer la veille web.",
      "",
      "Les requêtes configurées sont :",
      ...queries.map((item) => `- ${item.side} / ${item.label}: ${item.query}`),
      "",
    ].join("\n"),
  );
  console.log("OPENAI_API_KEY absent; rapport skipped généré.");
  process.exit(0);
}

const systemPrompt = `
Tu es un agent de veille pour isora, un site mondial qui documente les désavantages liés au sexe.
Règles strictes :
- Écris toujours le nom du site "isora" en minuscules.
- Ne classe pas les fiches par identité de genre : l'objet du site est le sexe, tel que mesuré ou catégorisé par les sources.
- Accepte les arguments de tous les pays et des zones mondiales, mais indique toujours le pays, la zone ou le périmètre.
- Refuse les généralisations hostiles envers un sexe.
- Chaque proposition doit avoir une source primaire ou institutionnelle quand c'est possible.
- Indique ce que la source mesure exactement : femmes/filles, hommes/garçons, female/male, sexe légal, sexe déclaré, sexe assigné ou autre catégorie.
- Sépare observation statistique, règle juridique et interprétation sociétale.
- Privilégie les sources datées de moins de 18 mois.
- Produis automatiquement une version française et une version anglaise pour chaque proposition.
- La version anglaise doit traduire le sens éditorial sans ajouter de fait absent de la version française.
- Réponds en JSON strict, tableau d'objets.
Schéma :
{
  "side": "hommes" | "femmes",
  "domain": "Travail" | "Santé" | "Famille" | "Justice" | "Éducation" | "Revenus" | "Violences" | "Religieux",
  "metric": string,
  "source": { "publisher": string, "label": string, "url": string, "date": string },
  "confidence": "forte" | "moyenne" | "à vérifier",
  "fr": {
    "title": string,
    "summary": string,
    "nuance": string,
    "sourcePopulation": string,
    "tags": string[]
  },
  "en": {
    "title": string,
    "summary": string,
    "nuance": string,
    "sourcePopulation": string,
    "tags": string[]
  }
}
`;

for (const item of queries) {
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
          content: `Agent ${item.side}. Recherche : ${item.query}. Propose au maximum 3 nouvelles fiches non redondantes.`,
        },
      ],
    }),
  });

  const raw = await response.text();
  const fileBase = `${today}-${item.side}-${item.label.replace(/\s+/g, "-")}`;

  if (!response.ok) {
    await writeFile(path.join(outputDir, `${fileBase}-error.json`), raw);
    console.error(`Erreur API pour ${item.label}: ${response.status}`);
    continue;
  }

  const parsed = JSON.parse(raw);
  const outputText =
    parsed.output_text ??
    parsed.output
      ?.flatMap((entry) => entry.content ?? [])
      .map((content) => content.text ?? "")
      .join("\n")
      .trim() ??
    raw;

  await writeFile(path.join(outputDir, `${fileBase}.json`), outputText);
  console.log(`Rapport généré: ${fileBase}.json`);
}
