import { createHmac, timingSafeEqual, scrypt, randomBytes } from "node:crypto";
import { promisify } from "node:util";
import { header } from "./security.js";

const deriveKey = promisify(scrypt);
const sessionCookieName = "__Host-isora_admin_session";
const attemptsCookieName = "isora_admin_attempts";
const sessionSeconds = 8 * 60 * 60;
const oneDaySeconds = 24 * 60 * 60;
const hashPattern = /^scrypt\$131072\$8\$1\$([a-f0-9]{32})\$([a-f0-9]{128})$/i;
let passwordChecks = 0;

function getSecret() {
  const secret = process.env.ISORA_ADMIN_SECRET;
  return /^[a-f0-9]{64}$/i.test(secret ?? "") ? secret : null;
}

export function isAdminConfigured() {
  return Boolean(getSecret() && hashPattern.test(process.env.ISORA_ADMIN_PASSWORD_HASH ?? ""));
}

function sign(value) {
  const secret = getSecret();
  if (!secret) throw new Error("admin_auth_unconfigured");
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function packCookiePayload(payload) {
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

function unpackCookiePayload(value) {
  if (!getSecret() || typeof value !== "string" || value.length > 2048) return null;
  const parts = value.split(".");
  if (parts.length !== 2 || !/^[A-Za-z0-9_-]+$/.test(parts[0]) || !safeEqual(parts[1], sign(parts[0]))) return null;
  try { return JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8")); } catch { return null; }
}

function readCookies(request) {
  const cookies = Object.create(null);
  const raw = header(request, "cookie");
  if (raw.length > 8192) return cookies;
  for (const entry of raw.split(";")) {
    const index = entry.indexOf("=");
    if (index < 0) continue;
    const name = entry.slice(0, index).trim();
    try { cookies[name] = decodeURIComponent(entry.slice(index + 1).trim()); } catch { /* Reject malformed cookie values. */ }
  }
  return cookies;
}

function createCookie(name, value, maxAge) {
  return `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Strict; Secure`;
}

export function clearCookie(name) { return createCookie(name, "", 0); }
export function applySetCookies(response, cookies) {
  if (cookies.length) response?.setHeader?.("Set-Cookie", cookies);
}

export function getAdminAuthState(request) {
  const cookies = readCookies(request);
  const session = unpackCookiePayload(cookies[sessionCookieName]);
  const attempts = unpackCookiePayload(cookies[attemptsCookieName]);
  const now = Date.now();
  const issued = Number(session?.iat);
  const expires = Number(session?.exp);
  const blocked = Number(attempts?.blockedUntil) || 0;
  return {
    authenticated: isAdminConfigured() && session?.version === 2 && session.scope === "isora-dashboard" &&
      Number.isFinite(issued) && issued <= now && issued >= now - sessionSeconds * 1000 &&
      Number.isFinite(expires) && expires > now && expires <= issued + sessionSeconds * 1000,
    attempts: Math.max(0, Math.min(Number(attempts?.attempts) || 0, 3)),
    blockedUntil: blocked > now && blocked <= now + oneDaySeconds * 1000 ? blocked : null,
  };
}

export function isAdminAuthorized(request) { return getAdminAuthState(request).authenticated; }
export function createAdminSessionCookie() {
  if (!isAdminConfigured()) throw new Error("admin_auth_unconfigured");
  const now = Date.now();
  return createCookie(sessionCookieName, packCookiePayload({ version: 2, scope: "isora-dashboard", iat: now,
    exp: now + sessionSeconds * 1000, nonce: randomBytes(16).toString("hex") }), sessionSeconds);
}
export function createAttemptsCookie(attempts, blockedUntil = null) {
  return createCookie(attemptsCookieName, packCookiePayload({ attempts, blockedUntil }), oneDaySeconds);
}
export function createBlockedState() { return Date.now() + oneDaySeconds * 1000; }
export async function verifyAdminPassword(password) {
  const hash = (process.env.ISORA_ADMIN_PASSWORD_HASH ?? "").match(hashPattern);
  if (!isAdminConfigured() || !hash || typeof password !== "string" || Buffer.byteLength(password) > 1024) return false;
  // Bound the memory occupied by concurrent scrypt calls (128 MiB each).
  if (passwordChecks >= 2) throw Object.assign(new Error("auth_busy"), { status: 429 });
  passwordChecks += 1;
  try {
    const derived = await deriveKey(password, Buffer.from(hash[1], "hex"), 64, { N: 131072, r: 8, p: 1, maxmem: 160 * 1024 * 1024 });
    return timingSafeEqual(derived, Buffer.from(hash[2], "hex"));
  } finally { passwordChecks -= 1; }
}
export { attemptsCookieName, sessionCookieName };
