import {
  applySetCookies,
  attemptsCookieName,
  clearCookie,
  createAdminSessionCookie,
  createAttemptsCookie,
  createBlockedState,
  getAdminAuthState,
  verifyAdminPassword,
} from "./_admin-auth.js";

function json(status, body, response, cookies = []) {
  if (response) {
    if (typeof response.status === "function" && typeof response.json === "function") {
      applySetCookies(response, cookies);
      return response.status(status).json(body);
    }

    response.statusCode = status;
    if (typeof response.setHeader === "function") {
      response.setHeader("content-type", "application/json; charset=utf-8");
      applySetCookies(response, cookies);
    }
    response.end(JSON.stringify(body));
    return undefined;
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(cookies.length > 0 ? { "set-cookie": cookies.join(", ") } : {}),
    },
  });
}

async function readJson(request) {
  if (typeof request.json === "function") {
    return request.json();
  }

  if (request.body && typeof request.body === "object" && !Buffer.isBuffer(request.body)) {
    return request.body;
  }

  const chunks = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const text = Buffer.concat(chunks).toString("utf8");
  return JSON.parse(text);
}

function remainingSeconds(blockedUntil) {
  return Math.max(0, Math.ceil((blockedUntil - Date.now()) / 1000));
}

export default async function handler(request, response) {
  const method = request.method ?? "GET";
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
  } catch {
    return json(400, { error: "invalid_json" }, response);
  }

  const password = typeof data?.password === "string" ? data.password : "";

  if (verifyAdminPassword(password)) {
    return json(200, {
      ok: true,
      authenticated: true,
    }, response, [
      createAdminSessionCookie(),
      clearCookie(attemptsCookieName),
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
