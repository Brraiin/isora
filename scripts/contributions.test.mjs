import test from "node:test";
import assert from "node:assert/strict";
import { getContributionKey, sendContribution } from "../src/contributions.ts";

const response = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

test("the form confirms a contribution stored for moderation", async (t) => {
  t.mock.method(globalThis, "fetch", async () => response({ ok: true, delivery: "github", issueNumber: 42 }, 201));
  assert.equal((await sendContribution("test", {})).issueNumber, 42);
});

test("local-only responses and HTTP failures cannot produce a success confirmation", async (t) => {
  for (const status of [202, 404, 503, 502]) {
    const mock = t.mock.method(globalThis, "fetch", async () => response({ ok: true, delivery: "browser_local" }, status));
    await assert.rejects(sendContribution("test", {}), /contribution_not_received/);
    mock.mock.restore();
  }
});

test("network failures and non-JSON responses reach the form error path", async (t) => {
  const mock = t.mock.method(globalThis, "fetch", async () => { throw new Error("offline"); });
  await assert.rejects(sendContribution("test", {}), /offline/);
  mock.mock.restore();
  t.mock.method(globalThis, "fetch", async () => new Response("<html>fallback</html>"));
  await assert.rejects(sendContribution("test", {}), /contribution_not_received/);
});

test("local and remote copies share an identity without merging distinct proposals", () => {
  const payload = { type: "suggestion_asymetrie", createdAt: "2026-10-07T12:00:00Z", title: "test", summary: "Résumé", sources: ["https://example.org"] };
  assert.equal(getContributionKey(payload), getContributionKey({ sources: payload.sources, summary: payload.summary, title: payload.title, type: payload.type, createdAt: payload.createdAt }));
  assert.notEqual(getContributionKey(payload), getContributionKey({ ...payload, title: "different" }));
  assert.notEqual(getContributionKey(payload), getContributionKey({ ...payload, createdAt: "2026-10-07T13:00:00Z" }));
  assert.equal(getContributionKey({ title: "legacy without date" }), null);
});
