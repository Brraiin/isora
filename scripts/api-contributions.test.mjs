import test from "node:test";
import assert from "node:assert/strict";
import handler from "../api/contributions.js";
import { scryptSync } from "node:crypto";
import { createAdminSessionCookie } from "../server/admin-auth.js";

const envKeys = ["GITHUB_ISSUE_TOKEN", "GITHUB_TOKEN", "RESEND_API_KEY", "ISORA_CONTRIBUTION_NOTIFY_TO", "ISORA_CONTRIBUTION_NOTIFY_FROM", "ISORA_ADMIN_SECRET", "ISORA_ADMIN_PASSWORD_HASH"];
const payload = { type: "suggestion_asymetrie", title: "Une proposition <test>", summary: "Résumé <script>alert(1)</script>", sources: ["https://example.org"], createdAt: "2026-10-07T12:00:00Z" };
const issue = { number: 42, title: payload.title, html_url: "https://github.com/Brraiin/isora/issues/42", body: `Retour\n\n\`\`\`json\n${JSON.stringify(payload)}\n\`\`\``, labels: [{ name: "contribution" }], state: "open" };
const reply = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
const request = (method = "POST", body = { title: payload.title, payload }, admin = false) => new Request("https://isora.info/api/contributions", {
  method,
  headers: { "content-type": "application/json", ...(admin ? { cookie: createAdminSessionCookie().split(";")[0] } : {}) },
  ...(method !== "GET" ? { body: JSON.stringify(body) } : {}),
});

test.beforeEach((t) => {
  const original = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
  process.env.GITHUB_ISSUE_TOKEN = "test-github-token";
  delete process.env.GITHUB_TOKEN;
  process.env.RESEND_API_KEY = "test-resend-key";
  process.env.ISORA_CONTRIBUTION_NOTIFY_TO = "owner@example.org";
  process.env.ISORA_CONTRIBUTION_NOTIFY_FROM = "isora <notifications@example.org>";
  process.env.ISORA_ADMIN_SECRET = "a".repeat(64);
  const salt = Buffer.alloc(16, 1);
  process.env.ISORA_ADMIN_PASSWORD_HASH = `scrypt$131072$8$1$${salt.toString("hex")}$${scryptSync("test-admin-fixture", salt, 64, { N: 131072, r: 8, p: 1, maxmem: 160 * 1024 * 1024 }).toString("hex")}`;
  t.after(() => {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  });
});

test("a stored proposition sends an escaped email with the protected moderation link", async (t) => {
  const calls = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    calls.push({ url, options });
    return String(url).includes("resend.com") ? reply({ id: "email-test" }) : reply(issue, 201);
  });
  const response = await handler(request());
  assert.equal(response.status, 201);
  assert.equal(response.headers.get("cache-control"), "no-store");
  const data = await response.json();
  assert.equal(data.delivery, "github");
  assert.equal(data.issueNumber, 42);
  assert.deepEqual(data.notification, { sent: true, id: "email-test" });
  const email = JSON.parse(calls[1].options.body);
  assert.deepEqual(email.to, ["owner@example.org"]);
  assert.match(email.html, /href="https:\/\/isora.info\/\?admin=contributions"/);
  assert.match(email.text, /Valider ou refuser : https:\/\/isora.info\/\?admin=contributions/);
  assert.ok(!email.html.includes("<script>"));
  assert.match(email.html, /&lt;script&gt;/);
  assert.ok(calls[1].options.headers["idempotency-key"]);
  assert.match(email.text, /ne publie pas automatiquement/);
});

test("missing email configuration is logged while preserving the contribution", async (t) => {
  delete process.env.RESEND_API_KEY;
  const warn = t.mock.method(console, "warn", () => {});
  const fetch = t.mock.method(globalThis, "fetch", async () => reply(issue, 201));
  const response = await handler(request());
  assert.equal(response.status, 201);
  assert.equal((await response.json()).notification.reason, "missing_notification_config");
  assert.equal(fetch.mock.callCount(), 1);
  assert.match(warn.mock.calls[0].arguments[0], /missing_notification_config/);
});

test("email refusal preserves the proposition and logs the provider status without secrets", async (t) => {
  const warn = t.mock.method(console, "warn", () => {});
  t.mock.method(globalThis, "fetch", async (url) => String(url).includes("resend.com") ? reply({ error: "provider error" }, 403) : reply(issue, 201));
  const response = await handler(request());
  assert.equal(response.status, 201);
  assert.deepEqual((await response.json()).notification, { sent: false, reason: "resend_failed", status: 403 });
  assert.match(warn.mock.calls[0].arguments[0], /HTTP 403/);
  assert.ok(!warn.mock.calls[0].arguments[0].includes("test-resend-key"));
});

test("email network failure does not lose a proposition already stored", async (t) => {
  t.mock.method(console, "warn", () => {});
  t.mock.method(globalThis, "fetch", async (url) => {
    if (String(url).includes("resend.com")) throw new Error("network");
    return reply(issue, 201);
  });
  const response = await handler(request());
  assert.equal(response.status, 201);
  assert.equal((await response.json()).notification.sent, false);
});

test("a missing GitHub token cannot report successful receipt for moderation", async (t) => {
  delete process.env.GITHUB_ISSUE_TOKEN;
  delete process.env.RESEND_API_KEY;
  t.mock.method(console, "warn", () => {});
  const fetch = t.mock.method(globalThis, "fetch", () => { throw new Error("unexpected fetch"); });
  const response = await handler(request());
  assert.equal(response.status, 503);
  assert.equal((await response.json()).ok, false);
  assert.equal(fetch.mock.callCount(), 0);
});

test("only authenticated admins can read configuration or moderate", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", () => { throw new Error("unexpected fetch"); });
  for (const method of ["GET", "PATCH", "DELETE"]) {
    assert.equal((await handler(request(method))).status, 401);
  }
  assert.equal(fetch.mock.callCount(), 0);
});

test("the authenticated dashboard receives missing setting names, never secret values", async (t) => {
  delete process.env.RESEND_API_KEY;
  delete process.env.ISORA_CONTRIBUTION_NOTIFY_FROM;
  delete process.env.ISORA_CONTRIBUTION_NOTIFY_TO;
  t.mock.method(globalThis, "fetch", async () => reply([issue]));
  const response = await handler(request("GET", null, true));
  const body = await response.json();
  assert.deepEqual(body.notificationConfig, { configured: false, missing: ["RESEND_API_KEY", "ISORA_CONTRIBUTION_NOTIFY_FROM", "ISORA_CONTRIBUTION_NOTIFY_TO"] });
  assert.equal(body.items[0].status, "pending");
  assert.ok(!JSON.stringify(body).includes("test-github-token"));
});

for (const decision of ["accepted", "rejected"]) {
  test(`the admin can persist the ${decision} decision and retrieve it later`, async (t) => {
    let stored = structuredClone(issue);
    t.mock.method(globalThis, "fetch", async (url, options = {}) => {
      if (String(url).endsWith("/comments")) return reply({}, 201);
      if (options.method === "PATCH") stored = { ...stored, ...JSON.parse(options.body) };
      if (String(url).includes("?state=all")) return reply([stored]);
      return reply(stored);
    });
    const response = await handler(request("PATCH", { issueNumber: 42, decision }, true));
    assert.equal(response.status, 200);
    assert.equal((await response.json()).item.status, decision);
    assert.equal(stored.state, "closed");
    const listed = await (await handler(request("GET", null, true))).json();
    assert.equal(listed.items[0].status, decision);
  });
}
