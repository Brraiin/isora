export const SITE_URL = "https://isora.info";

const frenchMonths = new Map([
  ["janvier", 1],
  ["fevrier", 2],
  ["mars", 3],
  ["avril", 4],
  ["mai", 5],
  ["juin", 6],
  ["juillet", 7],
  ["aout", 8],
  ["septembre", 9],
  ["octobre", 10],
  ["novembre", 11],
  ["decembre", 12],
]);

function validatedDate(year, month, day) {
  if (year < 1 || year > 9999 || month < 1 || month > 12 || day < 1) return null;

  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (day > daysInMonth[month - 1]) return null;

  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Return the stated editorial calendar date; never infer a missing date. */
export function parseEditorialDate(value) {
  if (typeof value !== "string") return null;
  const text = value.trim();

  const iso = text.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?(?:Z|([+-])(\d{2}):(\d{2}))?)?$/,
  );
  if (iso) {
    if (
      (iso[4] !== undefined && Number(iso[4]) > 23) ||
      (iso[5] !== undefined && Number(iso[5]) > 59) ||
      (iso[6] !== undefined && Number(iso[6]) > 59) ||
      (iso[9] !== undefined && Number(iso[9]) > 23) ||
      (iso[10] !== undefined && Number(iso[10]) > 59)
    ) return null;

    return validatedDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));
  }

  const normalized = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ");
  const french = normalized.match(/^(\d{1,2})(?:er)? ([a-z]+) (\d{4})$/);
  if (!french || !frenchMonths.has(french[2])) return null;
  if (french[1] !== "1" && normalized.startsWith(`${french[1]}er `)) return null;

  return validatedDate(Number(french[3]), frenchMonths.get(french[2]), Number(french[1]));
}

/** Pick the latest valid date from strings or nested arrays of strings. */
export function latestEditorialDate(...values) {
  const dates = values.flat(Infinity).map(parseEditorialDate).filter(Boolean);
  return dates.length > 0 ? dates.reduce((latest, date) => date > latest ? date : latest) : null;
}

/** Use claim verification and rendered update dates, independently of build time. */
export function getClaimModifiedDate(claim, updates = []) {
  return latestEditorialDate(
    claim?.lastChecked,
    claim?.date_consultation,
    updates.map((update) => [update?.date, update?.updatedAt, update?.publishedAt]),
  );
}
