import { readdir, readFile } from "node:fs/promises";
import { resolve, relative } from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const patterns = [
  ["jeton GitHub", /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{50,})\b/],
  ["clé OpenAI", /\bsk-(?:proj-|svcacct-)[A-Za-z0-9_-]{30,}\b/],
  ["clé AWS", /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
  ["clé privée", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ["clé Resend", /\bre_[A-Za-z0-9]{24,}\b/],
  ["mot de passe client ou de secours", /(?:dashboardPassword|localReturnsClearPassword|adminPasswordDevHash)\s*=/],
];
const emailPattern = /(?<![\w.-])[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}(?![\w.-])/i;
const errors = [];
const tracked = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" }).split("\0").filter(Boolean);
for (const file of tracked) {
  if (/^(?:.*\/)?\.env(?:\.|$)/.test(file) && !file.endsWith(".example")) errors.push(`${file}: fichier d'environnement suivi par Git`);
}
async function scan(directory, publicOutput = false) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (["node_modules", ".git", ".vercel"].includes(entry.name)) continue;
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) { await scan(path, publicOutput); continue; }
    if (!entry.isFile() || !/\.(?:js|mjs|cjs|ts|tsx|json|html|txt|xml|css|yml|yaml)$/.test(entry.name)) continue;
    const content = await readFile(path, "utf8");
    for (const [name, pattern] of patterns) if (pattern.test(content)) errors.push(`${relative(root, path)}: ${name}`);
    if (publicOutput && emailPattern.test(content)) errors.push(`${relative(root, path)}: adresse e-mail dans une sortie publique`);
  }
}
for (const dir of ["src", "api", "server", "scripts", "public", "content", ".github"]) await scan(resolve(root, dir), dir === "public");
if (process.argv.includes("--dist")) await scan(resolve(root, "dist"), true);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else console.log("Contrôle sécurité réussi : aucun secret reconnu ni e-mail dans les sorties publiques contrôlées.");
