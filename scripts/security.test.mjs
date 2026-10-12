import test from "node:test";
import assert from "node:assert/strict";
import { scryptSync, createHmac } from "node:crypto";
import authHandler from "../api/admin-auth.js";
import contributionsHandler from "../api/contributions.js";
import analyticsHandler from "../api/analytics.js";
import { createAdminSessionCookie, getAdminAuthState, verifyAdminPassword } from "../server/admin-auth.js";
import { readJson, mutationError, rateLimit } from "../server/security.js";

const salt = Buffer.alloc(16, 2);
const fixture = "security-test-fixture";
const passwordHash = `scrypt$131072$8$1$${salt.toString("hex")}$${scryptSync(fixture, salt, 64, { N: 131072, r: 8, p: 1, maxmem: 160 * 1024 * 1024 }).toString("hex")}`;
const keys = ["ISORA_ADMIN_SECRET", "ISORA_ADMIN_PASSWORD_HASH", "GITHUB_ISSUE_TOKEN", "GITHUB_TOKEN", "VERCEL", "ISORA_STORE_SEARCH_ANALYTICS"];
const req = (path, method = "GET", data, headers = {}) => new Request(`https://isora.info${path}`, {
  method, headers: { "content-type": "application/json", ...headers },
  ...(method === "GET" ? {} : { body: JSON.stringify(data ?? {}) }),
});
const reply = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

test.beforeEach((t) => {
  const saved = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  process.env.ISORA_ADMIN_SECRET = "a".repeat(64);
  process.env.ISORA_ADMIN_PASSWORD_HASH = passwordHash;
  process.env.GITHUB_ISSUE_TOKEN = "fixture-only-token";
  delete process.env.GITHUB_TOKEN;
  delete process.env.VERCEL;
  delete process.env.ISORA_STORE_SEARCH_ANALYTICS;
  t.after(() => { for (const [key, value] of Object.entries(saved)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; } });
});

test("unconfigured authentication fails closed and never creates a session", async () => {
  delete process.env.ISORA_ADMIN_SECRET;
  const response = await authHandler(req("/api/admin-auth", "POST", { password: fixture }));
  assert.equal(response.status, 503);
  assert.equal(response.headers.get("set-cookie"), null);
  assert.equal(getAdminAuthState(req("/api/admin-auth")).authenticated, false);
});

test("password verification uses the configured slow hash", async () => {
  assert.equal(await verifyAdminPassword(fixture), true);
  assert.equal(await verifyAdminPassword("wrong-fixture"), false);
  assert.equal(await verifyAdminPassword("x".repeat(1025)), false);
});

test("sessions are secure, host scoped and invalidated by secret rotation", () => {
  const cookie = createAdminSessionCookie();
  assert.match(cookie, /^__Host-isora_admin_session=/);
  for (const flag of ["HttpOnly", "Secure", "SameSite=Strict", "Path=/"]) assert.ok(cookie.includes(flag));
  const request = req("/api/admin-auth", "GET", null, { cookie: cookie.split(";")[0] });
  assert.equal(getAdminAuthState(request).authenticated, true);
  process.env.ISORA_ADMIN_SECRET = "b".repeat(64);
  assert.equal(getAdminAuthState(request).authenticated, false);
});

test("malformed, legacy and overlong session cookies are rejected without throwing", () => {
  for (const value of ["%", "bad.bad", "x".repeat(9000), "legacy.signature.extra"]) {
    assert.equal(getAdminAuthState(req("/api/admin-auth", "GET", null, { cookie: `__Host-isora_admin_session=${value}` })).authenticated, false);
  }
  const payload = Buffer.from(JSON.stringify({ scope: "isora-dashboard", exp: Date.now() + 60000 })).toString("base64url");
  const signature = createHmac("sha256", process.env.ISORA_ADMIN_SECRET).update(payload).digest("base64url");
  assert.equal(getAdminAuthState(req("/api/admin-auth", "GET", null, { cookie: `isora_admin_session=${payload}.${signature}` })).authenticated, false);
});

test("all API mutations reject cross site requests and non JSON forms before external effects", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", () => { throw new Error("unexpected external call"); });
  for (const [handler, path] of [[authHandler, "/api/admin-auth"], [contributionsHandler, "/api/contributions"], [analyticsHandler, "/api/analytics"]]) {
    assert.equal((await handler(req(path, "POST", {}, { origin: "https://attacker.invalid" }))).status, 403);
    assert.equal((await handler(req(path, "POST", {}, { "content-type": "text/plain" }))).status, 415);
  }
  assert.equal(fetch.mock.callCount(), 0);
});

test("oversized or malformed JSON is bounded for Fetch and Node requests", async () => {
  await assert.rejects(() => readJson(req("/api/contributions", "POST", { text: "x".repeat(17000) })), { status: 413 });
  await assert.rejects(() => readJson({ headers: { "content-type": "application/json" }, body: '{' }));
  assert.deepEqual(await readJson({ headers: {}, body: '{"ok":true}' }), { ok: true });
  await assert.rejects(() => readJson(req("/api/contributions", "POST", [])));
});

test("rate limit accounting survives discarded client cookies within the server instance", () => {
  const bucket = `regression-${Date.now()}`;
  for (let index = 0; index < 3; index += 1) assert.equal(rateLimit(req("/api/admin-auth"), bucket, 3, 60000).limited, false);
  assert.equal(rateLimit(req("/api/admin-auth"), bucket, 3, 60000).limited, true);
});

test("public APIs deny unauthenticated reads and moderation", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", () => { throw new Error("unexpected external call"); });
  for (const [handler, path] of [[contributionsHandler, "/api/contributions"], [analyticsHandler, "/api/analytics"]]) {
    assert.equal((await handler(req(path))).status, 401);
  }
  for (const method of ["PATCH", "DELETE"]) assert.equal((await contributionsHandler(req("/api/contributions", method, { issueNumber: 1, decision: "accepted" }))).status, 401);
  assert.equal(fetch.mock.callCount(), 0);
});

test("contribution validation rejects unknown keys, emails, arrays and active URLs", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", () => { throw new Error("unexpected external call"); });
  for (const payload of [[], { type: "unexpected" }, { type: "suggestion_asymetrie", email: "person@example.invalid" },
    { type: "suggestion_asymetrie", summary: "person@example.invalid" }, { type: "suggestion_asymetrie", sources: ["javascript:alert(1)"] }]) {
    assert.equal((await contributionsHandler(req("/api/contributions", "POST", { title: "fixture", payload }))).status, 400);
  }
  assert.equal(fetch.mock.callCount(), 0);
});

test("administrators cannot close an unrelated GitHub issue through moderation", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async () => reply({ number: 2, title: "analytics", labels: [], body: "" }));
  const cookie = createAdminSessionCookie().split(";")[0];
  const response = await contributionsHandler(req("/api/contributions", "PATCH", { issueNumber: 2, decision: "accepted" }, { cookie }));
  assert.equal(response.status, 403);
  assert.equal(fetch.mock.callCount(), 1);
});

test("invalid analytics are rejected before GitHub is accessed", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", () => { throw new Error("unexpected external call"); });
  for (const data of [{ events: [] }, { events: [{ type: "unknown" }] }, { events: Array(21).fill({ type: "search", query: "test" }) },
    { events: [{ type: "page_view", path: "/secret?mail=person@example.invalid" }] }]) {
    assert.equal((await analyticsHandler(req("/api/analytics", "POST", data))).status, 400);
  }
  assert.equal(fetch.mock.callCount(), 0);
});

test("analytics POST reveals no statistics and stores no raw search terms by default", async (t) => {
  const issue = { number: 2, title: "isora analytics rollup", body: "", html_url: "https://github.com/Brraiin/isora/issues/2" };
  let written;
  t.mock.method(globalThis, "fetch", async (_url, options = {}) => {
    if (options.method === "PATCH") { written = JSON.parse(options.body).body; return reply(issue); }
    return reply([issue]);
  });
  const response = await analyticsHandler(req("/api/analytics", "POST", { events: [{ type: "search", query: "private-query-fixture" }] }));
  assert.equal(response.status, 202);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.ok(!written.includes("private-query-fixture"));
});

test("API authentication state is never cached", async () => {
  const response = await authHandler(req("/api/admin-auth"));
  assert.equal(response.status, 401);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("vercel-cdn-cache-control"), "no-store");
});
