import { mkdir, writeFile } from "node:fs/promises";
import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { resolve } from "node:path";

const directory = process.argv[2];
if (!directory) throw new Error("Indiquer un nouveau dossier privé, par exemple /private/tmp/isora-admin-credentials.");
const output = resolve(directory);
await mkdir(output, { mode: 0o700 });
const password = randomBytes(24).toString("base64url");
const salt = randomBytes(16);
const derived = await promisify(scrypt)(password, salt, 64, { N: 131072, r: 8, p: 1, maxmem: 160 * 1024 * 1024 });
const hash = `scrypt$131072$8$1$${salt.toString("hex")}$${derived.toString("hex")}`;
for (const [name, value] of Object.entries({ "admin-password.txt": password,
  "ISORA_ADMIN_PASSWORD_HASH.txt": hash, "ISORA_ADMIN_SECRET.txt": randomBytes(32).toString("hex") })) {
  await writeFile(resolve(output, name), value, { mode: 0o600, flag: "wx" });
}
console.log(`Identifiants créés dans ${output}. Aucune valeur secrète affichée. Conserver le mot de passe dans un gestionnaire, puis retirer les fichiers après configuration Vercel.`);
