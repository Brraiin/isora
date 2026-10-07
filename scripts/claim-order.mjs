export function interleaveClaimDisplayOrder(claims, order) {
  const byId = new Map(claims.map((claim) => [claim.id, claim]));
  const men = order.filter((id) => byId.get(id)?.side === "hommes");
  const women = order.filter((id) => byId.get(id)?.side === "femmes");
  const result = [];
  for (let index = 0; index < Math.max(men.length, women.length); index += 1) {
    if (men[index]) result.push(men[index]);
    if (women[index]) result.push(women[index]);
  }
  return result;
}

export function validateClaimDisplayOrder(claims, order) {
  const errors = [];
  if (!Array.isArray(order) || order.some((id) => typeof id !== "string" || !id.trim())) {
    throw new Error("Classement des fiches : une liste d’identifiants non vides est requise.");
  }
  const byId = new Map(claims.map((claim) => [claim.id, claim]));
  const seen = new Set();
  for (const id of order) {
    if (seen.has(id)) errors.push(`ID dupliqué : ${id}`);
    if (!byId.has(id)) errors.push(`ID inconnu : ${id}`);
    seen.add(id);
  }
  for (const claim of claims) {
    if (!seen.has(claim.id)) errors.push(`Fiche sans classement éditorial : ${claim.id}`);
  }
  if (byId.size !== claims.length) errors.push("Les fiches contiennent des identifiants dupliqués.");
  if (order[0] !== "hommes-esperance-vie") {
    errors.push("La fiche de mortalité et d’espérance de vie en France doit rester en tête.");
  }
  if (errors.length === 0) {
    const balanced = interleaveClaimDisplayOrder(claims, order);
    if (balanced.some((id, index) => id !== order[index])) {
      errors.push("Alternance hommes/femmes rompue alors que les deux listes contiennent encore des fiches.");
    }
  }
  if (errors.length) {
    throw new Error(`Classement des fiches invalide :\n${errors.map((error) => `- ${error}`).join("\n")}\nLire docs/CLAIM_DISPLAY_ORDER.md et corriger src/data/claim-display-order.json avant publication.`);
  }
  return order;
}
