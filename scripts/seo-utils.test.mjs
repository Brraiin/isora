import test from "node:test";
import assert from "node:assert/strict";
import {
  SITE_URL,
  parseEditorialDate,
  latestEditorialDate,
  getClaimModifiedDate,
} from "./seo-utils.mjs";

test("the canonical origin uses the public domain", () => {
  assert.equal(SITE_URL, "https://isora.info");
});

test("ISO editorial dates retain the written calendar date", () => {
  assert.equal(parseEditorialDate("2026-10-06"), "2026-10-06");
  assert.equal(parseEditorialDate("2026-10-06T09:05:00.000Z"), "2026-10-06");
  assert.equal(parseEditorialDate("2026-10-06T00:15:00+02:00"), "2026-10-06");
  assert.equal(parseEditorialDate(" 2026-10-06T09:05 "), "2026-10-06");
});

test("French editorial dates accept accents, case and whitespace", () => {
  assert.equal(parseEditorialDate("6 octobre 2026"), "2026-10-06");
  assert.equal(parseEditorialDate("11 août 2026"), "2026-08-11");
  assert.equal(parseEditorialDate(" 29  FÉVRIER  2024 "), "2024-02-29");
  assert.equal(parseEditorialDate("1er janvier 2026"), "2026-01-01");
  assert.equal(parseEditorialDate("31 décembre 2026"), "2026-12-31");
});

test("date validation respects Gregorian leap years", () => {
  assert.equal(parseEditorialDate("2000-02-29"), "2000-02-29");
  assert.equal(parseEditorialDate("2024-02-29"), "2024-02-29");
  assert.equal(parseEditorialDate("1900-02-29"), null);
  assert.equal(parseEditorialDate("2026-02-29"), null);
  assert.equal(parseEditorialDate("29 février 2026"), null);
});

test("invalid or incomplete dates never become build dates", () => {
  for (const value of [
    undefined, null, 2026, "", "octobre 2026", "6 octobre", "2026", "2026-2-03",
    "0000-01-01", "2026-00-01", "2026-13-01", "2026-01-00", "2026-04-31",
    "2026-02-30", "31 avril 2026", "2er janvier 2026", "6 inconnu 2026",
    "2026-10-06junk", "2026-10-06T24:00:00Z", "2026-10-06T09:60:00Z",
    "2026-10-06T09:05:60Z", "2026-10-06T09:05:00+24:00",
    "2026-10-06T09:05:00+02:60",
  ]) {
    assert.equal(parseEditorialDate(value), null, String(value));
  }
});

test("latest date flattens arrays and ignores invalid values", () => {
  assert.equal(
    latestEditorialDate("2026-01-01", ["6 octobre 2026", ["2026-09-30", null]], "invalid"),
    "2026-10-06",
  );
  assert.equal(latestEditorialDate(), null);
  assert.equal(latestEditorialDate(undefined, [null, "invalid"]), null);
});

test("claim modification uses verification and dated updates", () => {
  const claim = { lastChecked: "9 septembre 2026", date_consultation: "2026-09-10" };
  assert.equal(getClaimModifiedDate(claim), "2026-09-10");
  assert.equal(
    getClaimModifiedDate(claim, [
      { date: "2026-09-08", updatedAt: "2026-10-06T09:05:00Z" },
      { date: "invalid", updatedAt: null },
    ]),
    "2026-10-06",
  );
  assert.equal(getClaimModifiedDate({}, [{ publishedAt: "2026-09-30" }]), "2026-09-30");
  assert.equal(getClaimModifiedDate({ lastChecked: "unknown" }), null);
});
