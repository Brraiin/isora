import { createHash } from "node:crypto";
import { isIP } from "node:net";

const buckets = new Map();
const maxBuckets = 10000;

export function header(request, name) {
  if (typeof request.headers?.get === "function") return request.headers.get(name) ?? "";
  const value = request.headers?.[name.toLowerCase()];
  return Array.isArray(value) ? value[0] ?? "" : String(value ?? "");
}

export function json(status, body, response, cookies = []) {
  const headers = {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "cdn-cache-control": "no-store",
    "vercel-cdn-cache-control": "no-store",
    "x-content-type-options": "nosniff",
    "vary": "Cookie, Origin",
  };
  if (response) {
    for (const [key, value] of Object.entries(headers)) response.setHeader?.(key, value);
    if (cookies.length) response.setHeader?.("Set-Cookie", cookies);
    if (typeof response.status === "function" && typeof response.json === "function") return response.status(status).json(body);
    response.statusCode = status;
    response.end(JSON.stringify(body));
    return;
  }
  const result = new Headers(headers);
  for (const cookie of cookies) result.append("set-cookie", cookie);
  return new Response(JSON.stringify(body), { status, headers: result });
}

export function mutationError(request) {
  if (header(request, "sec-fetch-site") === "cross-site") return { status: 403, error: "origin_not_allowed" };
  const origin = header(request, "origin");
  const allowed = new Set(["https://isora.info", "https://www.isora.info"]);
  if (process.env.VERCEL_URL) allowed.add(`https://${process.env.VERCEL_URL}`);
  if (!process.env.VERCEL) {
    for (const host of ["localhost", "127.0.0.1"]) {
      for (const port of [5173, 4173, 3000]) allowed.add(`http://${host}:${port}`);
    }
  }
  if (origin && !allowed.has(origin)) return { status: 403, error: "origin_not_allowed" };
  if (header(request, "content-type").split(";")[0].trim().toLowerCase() !== "application/json") {
    return { status: 415, error: "json_required" };
  }
  return null;
}

export async function readJson(request, maxBytes = 16384) {
  const declared = Number(header(request, "content-length"));
  if (declared > maxBytes) throw Object.assign(new Error("payload_too_large"), { status: 413 });
  let raw;
  if (request.body && typeof request.body === "object" && !Buffer.isBuffer(request.body) && typeof request.body.getReader !== "function") {
    raw = JSON.stringify(request.body);
  } else if (typeof request.body === "string" || Buffer.isBuffer(request.body)) {
    raw = request.body;
  } else {
    const chunks = [];
    let bytes = 0;
    const stream = request.body?.getReader ? request.body : request;
    for await (const chunk of stream) {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      bytes += buffer.length;
      if (bytes > maxBytes) throw Object.assign(new Error("payload_too_large"), { status: 413 });
      chunks.push(buffer);
    }
    raw = Buffer.concat(chunks);
  }
  if (Buffer.byteLength(raw) > maxBytes) throw Object.assign(new Error("payload_too_large"), { status: 413 });
  const data = JSON.parse(String(raw));
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("invalid_json");
  return data;
}

// Defense in depth for one warm function instance. Vercel WAF must enforce
// shared limits across cold starts and instances; this is not a global counter.
export function rateLimit(request, bucket, limit, windowMs) {
  const now = Date.now();
  let address = process.env.VERCEL ? header(request, "x-vercel-forwarded-for") || header(request, "x-forwarded-for") : request.socket?.remoteAddress;
  address = String(address ?? "").split(",")[0].trim();
  const identity = isIP(address) ? address : "unknown";
  const key = `${bucket}:${createHash("sha256").update(identity).digest("hex")}`;
  if (buckets.size >= maxBuckets) {
    for (const [name, entry] of buckets) if (entry.expires <= now) buckets.delete(name);
    if (buckets.size >= maxBuckets && !buckets.has(key)) return { limited: true, retryAfter: Math.ceil(windowMs / 1000) };
  }
  let entry = buckets.get(key);
  if (!entry || entry.expires <= now) {
    entry = { count: 0, expires: now + windowMs };
    buckets.set(key, entry);
  }
  entry.count += 1;
  return { limited: entry.count > limit, retryAfter: Math.max(1, Math.ceil((entry.expires - now) / 1000)) };
}
