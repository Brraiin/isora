import test from "node:test";
import assert from "node:assert/strict";
import { validateClaimDisplayOrder } from "./claim-order.mjs";

const claims = [
  { id: "hommes-esperance-vie", side: "hommes" },
  { id: "femmes-violences", side: "femmes" },
  { id: "hommes-suicide", side: "hommes" },
  { id: "femmes-sante", side: "femmes" },
  { id: "femmes-revenus", side: "femmes" },
];
const order = claims.map((claim) => claim.id);

test("accepte une alternance suivie des fiches du sexe restant", () => {
  assert.deepEqual(validateClaimDisplayOrder(claims, order), order);
});
test("bloque une nouvelle fiche oubliée dans le classement", () => {
  assert.throws(() => validateClaimDisplayOrder([...claims, { id: "hommes-nouvelle-fiche", side: "hommes" }], order), /Fiche sans classement éditorial : hommes-nouvelle-fiche/);
});
test("bloque les doublons et les références à des fiches supprimées", () => {
  assert.throws(() => validateClaimDisplayOrder(claims, [...order, order[1], "fiche-supprimee"]), /ID dupliqué[\s\S]*ID inconnu/);
});
test("bloque une alternance rompue même si tous les IDs sont présents", () => {
  assert.throws(() => validateClaimDisplayOrder(claims, [order[0], order[2], order[1], ...order.slice(3)]), /Alternance/);
});
test("bloque un retour à l’ordre d’ajout avec un nouveau sujet en tête", () => {
  assert.throws(() => validateClaimDisplayOrder(claims, [order[1], order[0], ...order.slice(2)]), /rester en tête/);
});
test("refuse un classement mal formé", () => {
  for (const value of [null, {}, [4], [""]]) {
    assert.throws(() => validateClaimDisplayOrder(claims, value), /liste d’identifiants/);
  }
});
