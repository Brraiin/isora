import type { LiteClient } from "algoliasearch/lite";
import type { Claim } from "./data/claims";

export type SearchField = {
  value: string;
  weight: number;
};

export type ClaimSearchCandidate = {
  claim: Claim;
  fields: SearchField[];
};

export type TextRange = {
  start: number;
  end: number;
};

type SearchToken = TextRange & {
  normalized: string;
};

type AlgoliaClaimHit = {
  claimId?: string;
  objectID?: string;
};

const algoliaAppId = import.meta.env.VITE_ALGOLIA_APP_ID?.trim() ?? "";
const algoliaSearchKey = import.meta.env.VITE_ALGOLIA_SEARCH_KEY?.trim() ?? "";
const algoliaIndexName = import.meta.env.VITE_ALGOLIA_INDEX_NAME?.trim() ?? "";

export const hasAlgoliaSearchConfig = Boolean(algoliaAppId && algoliaSearchKey && algoliaIndexName);

let algoliaClient: LiteClient | null = null;

export function normalizeSearchValue(value: string) {
  return value
    .toLocaleLowerCase("fr-FR")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/['’`]/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getSearchTerms(query: string) {
  return [...new Set(normalizeSearchValue(query).split(" ").filter((term) => term.length >= 2))];
}

function getTokenDistanceLimit(term: string) {
  if (term.length < 4) return 0;
  if (term.length <= 5) return 1;
  return 2;
}

function damerauLevenshteinDistance(left: string, right: string, maxDistance: number) {
  if (left === right) return 0;
  if (Math.abs(left.length - right.length) > maxDistance) return maxDistance + 1;

  let previousPrevious: number[] = [];
  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    let rowMinimum = current[0];

    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const substitutionCost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;
      let value = Math.min(
        previous[rightIndex] + 1,
        current[rightIndex - 1] + 1,
        previous[rightIndex - 1] + substitutionCost,
      );

      if (
        leftIndex > 1 &&
        rightIndex > 1 &&
        left[leftIndex - 1] === right[rightIndex - 2] &&
        left[leftIndex - 2] === right[rightIndex - 1]
      ) {
        value = Math.min(value, previousPrevious[rightIndex - 2] + 1);
      }

      current[rightIndex] = value;
      rowMinimum = Math.min(rowMinimum, value);
    }

    if (rowMinimum > maxDistance) return maxDistance + 1;

    previousPrevious = previous;
    previous = current;
  }

  return previous[right.length];
}

function scoreToken(term: string, token: string) {
  if (!term || !token) return 0;
  if (token === term) return 120;
  if (token.startsWith(term)) return 108 - Math.min(token.length - term.length, 16);
  if (token.includes(term)) return 88 - Math.min(token.indexOf(term), 24);

  const distanceLimit = getTokenDistanceLimit(term);
  if (!distanceLimit || token.length < 4) return 0;
  if (term[0] !== token[0]) return 0;

  const fullDistance = damerauLevenshteinDistance(token, term, distanceLimit);
  if (fullDistance <= distanceLimit) return 76 - fullDistance * 12;

  if (token.length > term.length) {
    const prefixDistance = damerauLevenshteinDistance(token.slice(0, term.length), term, distanceLimit);
    if (prefixDistance <= distanceLimit) return 84 - prefixDistance * 12;
  }

  return 0;
}

function tokenizeText(value: string) {
  const tokens: SearchToken[] = [];
  const matcher = /[\p{L}\p{N}]+/gu;
  let match: RegExpExecArray | null;

  while ((match = matcher.exec(value))) {
    const normalized = normalizeSearchValue(match[0]).replace(/\s+/g, "");
    if (!normalized) continue;

    tokens.push({
      normalized,
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  return tokens;
}

function scoreFields(fields: SearchField[], terms: string[]) {
  let score = 0;
  const tokenizedFields = fields
    .map((field) => ({
      ...field,
      normalizedValue: normalizeSearchValue(field.value),
      tokens: tokenizeText(field.value),
    }))
    .filter((field) => field.tokens.length > 0);
  const normalizedQuery = terms.join(" ");

  for (const term of terms) {
    let bestTermScore = 0;

    for (const field of tokenizedFields) {
      for (const token of field.tokens) {
        bestTermScore = Math.max(bestTermScore, scoreToken(term, token.normalized) * field.weight);
      }
    }

    if (bestTermScore <= 0) return null;
    score += bestTermScore;
  }

  for (const field of tokenizedFields) {
    if (normalizedQuery && field.normalizedValue.includes(normalizedQuery)) {
      score += field.weight * terms.length * 42;
    }
  }

  return score;
}

export function rankSearchCandidates(candidates: ClaimSearchCandidate[], query: string) {
  const terms = getSearchTerms(query);
  const rankedMatches = candidates
    .map((candidate, index) => ({
      claimId: candidate.claim.id,
      index,
      score: terms.length > 0 ? scoreFields(candidate.fields, terms) : null,
    }))
    .filter((match): match is { claimId: string; index: number; score: number } => match.score !== null)
    .sort((left, right) => right.score - left.score || left.index - right.index);

  return new Map(rankedMatches.map((match) => [match.claimId, match.score]));
}

export function getSearchHighlightRanges(text: string, query: string) {
  const terms = getSearchTerms(query);
  if (terms.length === 0) return [];

  const ranges = tokenizeText(text)
    .filter((token) => terms.some((term) => scoreToken(term, token.normalized) > 0))
    .map(({ start, end }) => ({ start, end }))
    .sort((left, right) => left.start - right.start || right.end - left.end);

  const mergedRanges: TextRange[] = [];

  for (const range of ranges) {
    const previous = mergedRanges[mergedRanges.length - 1];

    if (previous && range.start <= previous.end) {
      previous.end = Math.max(previous.end, range.end);
      continue;
    }

    mergedRanges.push({ ...range });
  }

  return mergedRanges;
}

export async function searchAlgoliaClaimIds(query: string, hitsPerPage: number) {
  if (!hasAlgoliaSearchConfig || getSearchTerms(query).length === 0) return [];

  if (!algoliaClient) {
    const { liteClient } = await import("algoliasearch/lite");
    algoliaClient = liteClient(algoliaAppId, algoliaSearchKey);
  }

  const response = await algoliaClient.searchForHits<AlgoliaClaimHit>({
    requests: [
      {
        indexName: algoliaIndexName,
        query: query.trim(),
        hitsPerPage: Math.min(Math.max(hitsPerPage, 1), 1000),
        typoTolerance: true,
        ignorePlurals: true,
        removeStopWords: true,
        attributesToHighlight: ["*"],
      },
    ],
  });
  const [result] = response.results;
  const seenIds = new Set<string>();
  const claimIds: string[] = [];

  for (const hit of result?.hits ?? []) {
    const claimId = String(hit.claimId ?? hit.objectID ?? "").trim();
    if (!claimId || seenIds.has(claimId)) continue;

    seenIds.add(claimId);
    claimIds.push(claimId);
  }

  return claimIds;
}
