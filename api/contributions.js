import { isAdminAuthorized } from "./_admin-auth.js";

const githubApiUrl = "https://api.github.com/repos/Brraiin/isora/issues";
const contributionDecisionLabels = {
  accepted: "isora-validee",
  rejected: "isora-refusee",
};

function json(status, body, response) {
  if (response) {
    if (typeof response.status === "function" && typeof response.json === "function") {
      return response.status(status).json(body);
    }

    response.statusCode = status;
    if (typeof response.setHeader === "function") {
      response.setHeader("content-type", "application/json; charset=utf-8");
    }
    response.end(JSON.stringify(body));
    return undefined;
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
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

function extractPayload(body) {
  if (typeof body !== "string") return null;

  const match = body.match(/```json\s*([\s\S]*?)```/);
  if (!match) return null;

  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

function getLabelName(label) {
  return typeof label === "string" ? label : label?.name;
}

function getContributionStatus(issue) {
  const labels = new Set((issue.labels ?? []).map(getLabelName).filter(Boolean));
  const bodyStatus = typeof issue.body === "string"
    ? issue.body.match(/<!--\s*isora-moderation:(accepted|rejected)\s*-->/)?.[1]
    : null;

  if (labels.has(contributionDecisionLabels.accepted)) return "accepted";
  if (labels.has(contributionDecisionLabels.rejected)) return "rejected";
  if (bodyStatus === "accepted" || bodyStatus === "rejected") return bodyStatus;
  if (issue.state === "closed") return "closed";
  return "pending";
}

function serializeIssue(issue) {
  return {
    number: issue.number,
    title: issue.title,
    url: issue.html_url,
    createdAt: issue.created_at,
    updatedAt: issue.updated_at,
    state: issue.state,
    status: getContributionStatus(issue),
    labels: (issue.labels ?? []).map(getLabelName).filter(Boolean),
    payload: extractPayload(issue.body),
  };
}

export default async function handler(request, response) {
  const token = process.env.GITHUB_ISSUE_TOKEN ?? process.env.GITHUB_TOKEN;
  const method = request.method ?? "GET";

  if ((method === "GET" || method === "PATCH") && !isAdminAuthorized(request)) {
    return json(401, { error: "admin_auth_required" }, response);
  }

  if (method === "GET") {
    if (!token) {
      return json(503, { error: "missing_github_token" }, response);
    }

    const githubResponse = await fetch(`${githubApiUrl}?state=all&labels=contribution&per_page=100&sort=updated&direction=desc`, {
      headers: {
        accept: "application/vnd.github+json",
        authorization: `Bearer ${token}`,
        "x-github-api-version": "2022-11-28",
      },
    });

    if (!githubResponse.ok) {
      return json(502, { error: "github_issue_list_failed" }, response);
    }

    const issues = await githubResponse.json();

    return json(200, {
      ok: true,
      items: issues.map(serializeIssue),
    }, response);
  }

  if (method === "PATCH") {
    if (!token) {
      return json(503, { error: "missing_github_token" }, response);
    }

    let data;

    try {
      data = await readJson(request);
    } catch {
      return json(400, { error: "invalid_json" }, response);
    }

    const issueNumber = Number(data?.issueNumber);
    const decision = data?.decision;

    if (!Number.isInteger(issueNumber) || !contributionDecisionLabels[decision]) {
      return json(400, { error: "invalid_moderation_payload" }, response);
    }

    const issueResponse = await fetch(`${githubApiUrl}/${issueNumber}`, {
      headers: {
        accept: "application/vnd.github+json",
        authorization: `Bearer ${token}`,
        "x-github-api-version": "2022-11-28",
      },
    });

    if (!issueResponse.ok) {
      return json(502, { error: "github_issue_read_failed" }, response);
    }

    const issue = await issueResponse.json();
    const labels = (issue.labels ?? []).map(getLabelName).filter(Boolean);
    const decisionLabelValues = Object.values(contributionDecisionLabels);
    const nextLabels = [
      ...labels.filter((label) => !decisionLabelValues.includes(label)),
      contributionDecisionLabels[decision],
    ];
    const nextBody = `${String(issue.body ?? "").replace(/\n*<!--\s*isora-moderation:(accepted|rejected)\s*-->\n*/g, "").trim()}\n\n<!-- isora-moderation:${decision} -->`;

    let githubResponse = await fetch(`${githubApiUrl}/${issueNumber}`, {
      method: "PATCH",
      headers: {
        accept: "application/vnd.github+json",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
        "x-github-api-version": "2022-11-28",
      },
      body: JSON.stringify({
        state: "closed",
        body: nextBody,
        labels: nextLabels,
      }),
    });

    if (!githubResponse.ok) {
      githubResponse = await fetch(`${githubApiUrl}/${issueNumber}`, {
        method: "PATCH",
        headers: {
          accept: "application/vnd.github+json",
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
          "x-github-api-version": "2022-11-28",
        },
        body: JSON.stringify({
          state: "closed",
          body: nextBody,
        }),
      });
    }

    if (!githubResponse.ok) {
      return json(502, { error: "github_issue_moderation_failed" }, response);
    }

    const moderatedIssue = await githubResponse.json();
    const decisionText = decision === "accepted" ? "validé" : "refusé";

    await fetch(`${githubApiUrl}/${issueNumber}/comments`, {
      method: "POST",
      headers: {
        accept: "application/vnd.github+json",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
        "x-github-api-version": "2022-11-28",
      },
      body: JSON.stringify({
        body: `Retour ${decisionText} depuis le dashboard isora le ${new Date().toISOString()}.`,
      }),
    }).catch(() => undefined);

    return json(200, {
      ok: true,
      item: serializeIssue(moderatedIssue),
    }, response);
  }

  if (method !== "POST") {
    return json(405, { error: "method_not_allowed" }, response);
  }

  let data;

  try {
    data = await readJson(request);
  } catch {
    return json(400, { error: "invalid_json" }, response);
  }

  const title = typeof data?.title === "string" ? data.title.trim() : "";
  const payload = data?.payload;

  if (!title || !payload || typeof payload !== "object") {
    return json(400, { error: "invalid_payload" }, response);
  }

  if (!token) {
    return json(202, {
      ok: true,
      delivery: "browser_local",
      warning: "missing_github_token",
    }, response);
  }

  const type = typeof payload.type === "string" ? payload.type : "contribution";
  const body = [
    "Retour envoyé depuis Isora.",
    "",
    "```json",
    JSON.stringify(payload, null, 2),
    "```",
  ].join("\n");

  const githubResponse = await fetch(githubApiUrl, {
    method: "POST",
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      "x-github-api-version": "2022-11-28",
    },
    body: JSON.stringify({
      title,
      body,
      labels: ["contribution", type],
    }),
  });

  if (!githubResponse.ok) {
    return json(502, { error: "github_issue_failed" }, response);
  }

  const issue = await githubResponse.json();

  return json(201, {
    ok: true,
    delivery: "github",
    issueUrl: issue.html_url,
    issueNumber: issue.number,
  }, response);
}
