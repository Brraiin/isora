import {
  attemptsCookieName,
  clearCookie,
  createAdminSessionCookie,
  createAttemptsCookie,
  createBlockedState,
  getAdminAuthState,
  isAdminConfigured,
  verifyAdminPassword,
} from "../server/admin-auth.js";
import { json, readJson, mutationError, rateLimit } from "../server/security.js";

function remainingSeconds(blockedUntil) {
  return Math.max(0, Math.ceil((blockedUntil - Date.now()) / 1000));
}

export default async function handler(request, response) {
  const method = request.method ?? "GET";
  if (!["GET", "POST", "DELETE"].includes(method)) return json(405, { error: "method_not_allowed" }, response);
  if (method !== "GET") {
    const invalid = mutationError(request);
    if (invalid) return json(invalid.status, { error: invalid.error }, response);
  }
  if (!isAdminConfigured()) return json(503, { error: "admin_auth_unconfigured", authenticated: false }, response);
  if (method === "DELETE") return json(200, { ok: true, authenticated: false }, response, [clearCookie("__Host-isora_admin_session"), clearCookie("isora_admin_session")]);
  const authState = getAdminAuthState(request);

  if (method === "GET") {
    if (authState.authenticated) {
      return json(200, { ok: true, authenticated: true }, response);
    }

    if (authState.blockedUntil) {
      return json(423, {
        ok: false,
        authenticated: false,
        blockedUntil: new Date(authState.blockedUntil).toISOString(),
        remainingSeconds: remainingSeconds(authState.blockedUntil),
      }, response);
    }

    return json(401, {
      ok: false,
      authenticated: false,
      attemptsRemaining: Math.max(3 - authState.attempts, 0),
    }, response);
  }

  if (method !== "POST") {
    return json(405, { error: "method_not_allowed" }, response);
  }

  const budget = rateLimit(request, "admin-login", 5, 15 * 60 * 1000);
  if (budget.limited) return json(429, { ok: false, authenticated: false, remainingSeconds: budget.retryAfter,
    blockedUntil: new Date(Date.now() + budget.retryAfter * 1000).toISOString() }, response);

  if (authState.blockedUntil) {
    return json(423, {
      ok: false,
      authenticated: false,
      blockedUntil: new Date(authState.blockedUntil).toISOString(),
      remainingSeconds: remainingSeconds(authState.blockedUntil),
    }, response);
  }

  let data;

  try {
    data = await readJson(request);
  } catch (error) {
    return json(error.status ?? 400, { error: error.status === 413 ? "payload_too_large" : "invalid_json" }, response);
  }

  const password = typeof data?.password === "string" ? data.password : "";

  let passwordValid;
  try { passwordValid = await verifyAdminPassword(password); }
  catch { return json(429, { ok: false, authenticated: false, error: "auth_busy" }, response); }
  if (passwordValid) {
    return json(200, {
      ok: true,
      authenticated: true,
    }, response, [
      createAdminSessionCookie(),
      clearCookie(attemptsCookieName),
      clearCookie("isora_admin_session"),
    ]);
  }

  const nextAttempts = authState.attempts + 1;

  if (nextAttempts >= 3) {
    const blockedUntil = createBlockedState();

    return json(423, {
      ok: false,
      authenticated: false,
      blockedUntil: new Date(blockedUntil).toISOString(),
      remainingSeconds: remainingSeconds(blockedUntil),
    }, response, [createAttemptsCookie(3, blockedUntil)]);
  }

  return json(401, {
    ok: false,
    authenticated: false,
    attemptsRemaining: Math.max(3 - nextAttempts, 0),
  }, response, [createAttemptsCookie(nextAttempts)]);
}
