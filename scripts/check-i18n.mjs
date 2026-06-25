import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const sourceFile = join(root, "src", "data", "claims.ts");
const tempFile = join(root, "node_modules", ".cache", "isora-i18n-check.mjs");

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

const requiredEnglishFields = ["title", "summary", "nuance", "sourcePopulation"];
const missing = claims
  .map((claim) => ({
    id: claim.id,
    missingFields: requiredEnglishFields.filter((field) => !claim.translations?.en?.[field]),
  }))
  .filter((claim) => claim.missingFields.length > 0);

if (missing.length > 0) {
  console.error(`isora i18n check failed: ${missing.length}/${claims.length} claims miss reviewed English translations.`);
  console.error(
    missing
      .slice(0, 30)
      .map((claim) => `- ${claim.id}: ${claim.missingFields.join(", ")}`)
      .join("\n"),
  );

  if (missing.length > 30) {
    console.error(`...and ${missing.length - 30} more.`);
  }

  process.exit(1);
}

console.log(`isora i18n check passed: ${claims.length} claims have reviewed English translations.`);
