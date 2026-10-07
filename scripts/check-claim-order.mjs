import { readFile } from "node:fs/promises";
import ts from "typescript";
import { validateClaimDisplayOrder } from "./claim-order.mjs";

const source = await readFile(new URL("../src/data/claims.ts", import.meta.url), "utf8");
const transpiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { claims } = await import(`data:text/javascript;base64,${Buffer.from(transpiled).toString("base64")}`);
const order = JSON.parse(await readFile(new URL("../src/data/claim-display-order.json", import.meta.url), "utf8"));
validateClaimDisplayOrder(claims, order);
console.log(`Classement validé : ${claims.length} fiches, aucune omission ni doublon, alternance conservée.`);
