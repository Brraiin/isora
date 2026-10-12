import { isAdminAuthorized } from "../server/admin-auth.js";
import { json, readJson, mutationError, rateLimit } from "../server/security.js";

const githubApiUrl = "https://api.github.com/repos/Brraiin/isora/issues";
const analyticsIssueTitle = "isora analytics rollup";

function getParisDateKey(date = new Date()) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function createEmptyStats() {
  return {
    schemaVersion: 1,
    updatedAt: null,
    totals: {
      homeViews: 0,
      articleViews: 0,
      searchEvents: 0,
    },
    home: {
      views: 0,
      lastVisitedAt: null,
      byDay: {},
    },
    articles: Object.create(null),
    searches: Object.create(null),
    recentEvents: [],
  };
}

function extractStats(body) {
  if (typeof body !== "string") return createEmptyStats();

  const match = body.match(/```json\s*([\s\S]*?)```/);
  if (!match) return createEmptyStats();

  try {
    const parsed = JSON.parse(match[1]);
    return {
      ...createEmptyStats(),
      ...parsed,
      totals: {
        ...createEmptyStats().totals,
        ...(parsed.totals ?? {}),
      },
      home: {
        ...createEmptyStats().home,
        ...(parsed.home ?? {}),
      },
      articles: parsed.articles && typeof parsed.articles === "object" ? parsed.articles : {},
      searches: parsed.searches && typeof parsed.searches === "object" ? parsed.searches : {},
      recentEvents: Array.isArray(parsed.recentEvents) ? parsed.recentEvents : [],
    };
  } catch {
    return createEmptyStats();
  }
}

function renderStatsBody(stats) {
  return [
    "Agrégat automatique des statistiques anonymes isora.",
    "",
    "Aucune donnée personnelle, cookie ou adresse IP n'est stocké dans ce JSON.",
    "",
    "```json",
    JSON.stringify(stats, null, 2),
    "```",
  ].join("\n");
}

function normalizePath(value) {
  const path = typeof value === "string" ? value.trim() : "/";
  if (!path || path === "#") return "/";

  try {
    const url = new URL(path, "https://isora-xi.vercel.app");
    return url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`;
  } catch {
    return path.startsWith("/") ? path : `/${path}`;
  }
}

function normalizeSearch(value) {
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(String(value ?? ""))) return "";
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

function incrementByDay(target, day, amount = 1) {
  target.byDay = target.byDay && typeof target.byDay === "object" ? target.byDay : {};
  target.byDay[day] = (Number(target.byDay[day]) || 0) + amount;
}

function trimRecord(record, field, limit) {
  return Object.fromEntries(
    Object.entries(record)
      .sort((left, right) => (Number(right[1]?.[field]) || 0) - (Number(left[1]?.[field]) || 0))
      .slice(0, limit),
  );
}

function applyEvent(stats, event) {
  const now = new Date();
  const eventDate = new Date(typeof event.at === "string" ? event.at : now.toISOString());
  const at = Number.isNaN(eventDate.getTime()) ? now.toISOString() : eventDate.toISOString();
  const day = getParisDateKey(Number.isNaN(eventDate.getTime()) ? now : eventDate);
  const path = normalizePath(event.path);

  if (event.type === "page_view") {
    const pageType = event.pageType === "article" || path.startsWith("/blog/") && path !== "/blog/"
      ? "article"
      : "home";

    if (pageType === "article") {
      const article = stats.articles[path] ?? {
        path,
        title: String(event.title ?? "Article isora").slice(0, 180),
        views: 0,
        lastVisitedAt: null,
        byDay: {},
      };

      article.title = String(event.title ?? article.title ?? "Article isora").slice(0, 180);
      article.views = (Number(article.views) || 0) + 1;
      article.lastVisitedAt = at;
      incrementByDay(article, day);
      stats.articles[path] = article;
      stats.totals.articleViews = (Number(stats.totals.articleViews) || 0) + 1;
    } else {
      stats.home.views = (Number(stats.home.views) || 0) + 1;
      stats.home.lastVisitedAt = at;
      incrementByDay(stats.home, day);
      stats.totals.homeViews = (Number(stats.totals.homeViews) || 0) + 1;
    }

    stats.recentEvents.unshift({
      type: "page_view",
      pageType,
      path,
      title: String(event.title ?? "").slice(0, 180),
      at,
    });
  }

  if (event.type === "search") {
    const query = normalizeSearch(event.query);
    if (query.length < 2) return;

    if (process.env.ISORA_STORE_SEARCH_ANALYTICS !== "true") {
      stats.totals.searchEvents = (Number(stats.totals.searchEvents) || 0) + 1;
      return;
    }
    if (["__proto__", "constructor", "prototype"].includes(query)) return;
    const search = (Object.hasOwn(stats.searches, query) ? stats.searches[query] : null) ?? {
      query: String(event.query ?? query).trim().slice(0, 120),
      count: 0,
      lastSearchedAt: null,
      lastResultCount: null,
      byDay: {},
    };

    const count = Math.max(1, Math.min(Number(event.count) || 1, 20));
    search.count = (Number(search.count) || 0) + count;
    search.lastSearchedAt = at;
    search.lastResultCount = Number.isFinite(event.resultCount) ? event.resultCount : search.lastResultCount;
    incrementByDay(search, day, count);
    stats.searches[query] = search;
    stats.totals.searchEvents = (Number(stats.totals.searchEvents) || 0) + count;

    stats.recentEvents.unshift({
      type: "search",
      query: search.query,
      resultCount: search.lastResultCount,
      at,
    });
  }
}

function applyEvents(stats, events) {
  for (const event of events) {
    if (!event || typeof event !== "object") continue;
    applyEvent(stats, event);
  }

  if (process.env.ISORA_STORE_SEARCH_ANALYTICS !== "true") {
    stats.searches = Object.create(null);
    stats.recentEvents = stats.recentEvents.filter((event) => event.type !== "search");
  }
  stats.updatedAt = new Date().toISOString();
  stats.articles = trimRecord(stats.articles, "views", 500);
  stats.searches = trimRecord(stats.searches, "count", 250);
  stats.recentEvents = stats.recentEvents.slice(0, 80);
  return stats;
}

async function findAnalyticsIssue(token) {
  const githubResponse = await fetch(`${githubApiUrl}?state=open&per_page=100&sort=updated&direction=desc`, {
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${token}`,
      "x-github-api-version": "2022-11-28",
    },
  });

  if (!githubResponse.ok) {
    throw new Error("github_issue_list_failed");
  }

  const issues = await githubResponse.json();
  const issue = issues.find((item) => item.title === analyticsIssueTitle);
  if (issue) return issue;

  const createResponse = await fetch(githubApiUrl, {
    method: "POST",
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      "x-github-api-version": "2022-11-28",
    },
    body: JSON.stringify({
      title: analyticsIssueTitle,
      body: renderStatsBody(createEmptyStats()),
    }),
  });

  if (!createResponse.ok) {
    throw new Error("github_issue_create_failed");
  }

  return createResponse.json();
}

async function writeAnalyticsIssue(token, issueNumber, stats) {
  const githubResponse = await fetch(`${githubApiUrl}/${issueNumber}`, {
    method: "PATCH",
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      "x-github-api-version": "2022-11-28",
    },
    body: JSON.stringify({
      body: renderStatsBody(stats),
    }),
  });

  if (!githubResponse.ok) {
    throw new Error("github_issue_update_failed");
  }

  return githubResponse.json();
}

export default async function handler(request, response) {
  const token = process.env.GITHUB_ISSUE_TOKEN ?? process.env.GITHUB_TOKEN;
  const method = request.method ?? "GET";

  if (!["GET", "POST"].includes(method)) {
    return json(405, { error: "method_not_allowed" }, response);
  }

  if (method === "GET" && !isAdminAuthorized(request)) {
    return json(401, { error: "admin_auth_required" }, response);
  }

  if (method === "POST") {
    const invalid = mutationError(request);
    if (invalid) return json(invalid.status, { error: invalid.error }, response);
    const budget = rateLimit(request, "analytics-submit", 60, 60 * 1000);
    if (budget.limited) return json(429, { error: "rate_limited", retryAfter: budget.retryAfter }, response);
  }

  if (!token) {
    return json(503, { error: "missing_github_token" }, response);
  }

  let data;
  let events = [];
  if (method === "POST") {
    try { data = await readJson(request); }
    catch (error) { return json(error.status ?? 400, { error: error.status === 413 ? "payload_too_large" : "invalid_json" }, response); }
    events = Array.isArray(data.events) ? data.events : [data.event ?? data];
    if (events.length < 1 || events.length > 20 || events.some((event) => !event || typeof event !== "object" ||
      !["page_view", "search"].includes(event.type) ||
      (event.type === "search" && (typeof event.query !== "string" || event.query.length > 120)) ||
      (event.type === "page_view" && (typeof event.path !== "string" || !/^\/(?:$|blog\/[a-z0-9-]+\/?$)/.test(event.path))) ||
      (event.title !== undefined && (typeof event.title !== "string" || event.title.length > 180)))) {
      return json(400, { error: "invalid_events" }, response);
    }
    // Use server time and trusted published titles; visitor input must not be a
    // channel for publishing private data into the analytics issue.
    events = events.map((event) => ({ ...event, at: new Date().toISOString(), title: event.type === "page_view" ? event.path : undefined, count: 1 }));
  }
  let issue;
  try { issue = await findAnalyticsIssue(token); }
  catch { return json(502, { error: "github_analytics_issue_failed" }, response); }
  if (method === "GET") return json(200, { ok: true, stats: extractStats(issue.body), issueUrl: issue.html_url, updatedAt: issue.updated_at }, response);
  const stats = applyEvents(extractStats(issue.body), events);

  try {
    await writeAnalyticsIssue(token, issue.number, stats);
    return json(202, { ok: true }, response);
  } catch {
    return json(502, { error: "github_analytics_update_failed" }, response);
  }
}
