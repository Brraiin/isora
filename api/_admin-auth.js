import { createHmac, timingSafeEqual } from "node:crypto";

const dashboardPassword = "4!Th3!H0rd3";
const sessionCookieName = "isora_admin_session";
const attemptsCookieName = "isora_admin_attempts";
const oneDaySeconds = 24 * 60 * 60;
const oneDayMs = oneDaySeconds * 1000;

function getSecret() {
  return process.env.ISORA_ADMIN_SECRET ?? dashboardPassword;
}

function base64UrlEncode(value) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));

  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

function packCookiePayload(payload) {
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

function unpackCookiePayload(value) {
  if (!value || typeof value !== "string") return null;

  const [encodedPayload, signature] = value.split(".");
  if (!encodedPayload || !signature || !safeEqual(signature, sign(encodedPayload))) return null;

  try {
    return JSON.parse(base64UrlDecode(encodedPayload));
  } catch {
    return null;
  }
}

function readCookieHeader(request) {
  if (typeof request.headers?.get === "function") {
    return request.headers.get("cookie") ?? "";
  }

  return request.headers?.cookie ?? "";
}

function readCookies(request) {
  return Object.fromEntries(
    readCookieHeader(request)
      .split(";")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const separatorIndex = entry.indexOf("=");
        if (separatorIndex === -1) return [entry, ""];
        return [entry.slice(0, separatorIndex), decodeURIComponent(entry.slice(separatorIndex + 1))];
      }),
  );
}

function createCookie(name, value, maxAgeSeconds) {
  const secure = process.env.VERCEL ? "; Secure" : "";
  return `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; HttpOnly; SameSite=Lax${secure}`;
}

export function clearCookie(name) {
  const secure = process.env.VERCEL ? "; Secure" : "";
  return `${name}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`;
}

export function applySetCookies(response, cookies) {
  if (!response || cookies.length === 0) return;

  if (typeof response.setHeader === "function") {
    response.setHeader("Set-Cookie", cookies);
  }
}

export function getAdminAuthState(request) {
  const cookies = readCookies(request);
  const session = unpackCookiePayload(cookies[sessionCookieName]);
  const attempts = unpackCookiePayload(cookies[attemptsCookieName]);
  const now = Date.now();
  const blockedUntil = Number(attempts?.blockedUntil) || 0;

  return {
    authenticated: session?.scope === "isora-dashboard" && Number(session.exp) > now,
    attempts: Number(attempts?.attempts) || 0,
    blockedUntil: blockedUntil > now ? blockedUntil : null,
  };
}

export function isAdminAuthorized(request) {
  return getAdminAuthState(request).authenticated;
}

export function createAdminSessionCookie() {
  return createCookie(
    sessionCookieName,
    packCookiePayload({
      scope: "isora-dashboard",
      exp: Date.now() + oneDayMs,
    }),
    oneDaySeconds,
  );
}

export function createAttemptsCookie(attempts, blockedUntil = null) {
  return createCookie(
    attemptsCookieName,
    packCookiePayload({
      attempts,
      blockedUntil,
    }),
    oneDaySeconds,
  );
}

export function createBlockedState() {
  return Date.now() + oneDayMs;
}

export function verifyAdminPassword(password) {
  return safeEqual(password, dashboardPassword);
}

export { attemptsCookieName, sessionCookieName };
