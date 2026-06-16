const githubApiUrl = "https://api.github.com/repos/Brraiin/isora/issues";

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

export default async function handler(request, response) {
  const token = process.env.GITHUB_ISSUE_TOKEN ?? process.env.GITHUB_TOKEN;
  const method = request.method ?? "GET";

  if (method === "GET") {
    if (!token) {
      return json(503, { error: "missing_github_token" }, response);
    }

    const githubResponse = await fetch(`${githubApiUrl}?state=open&labels=contribution&per_page=100`, {
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
      items: issues.map((issue) => ({
        number: issue.number,
        title: issue.title,
        url: issue.html_url,
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
        labels: issue.labels.map((label) => label.name),
        payload: extractPayload(issue.body),
      })),
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
