const githubApiUrl = "https://api.github.com/repos/Brraiin/isora/issues";

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });
}

export default async function handler(request) {
  if (request.method !== "POST") {
    return json(405, { error: "method_not_allowed" });
  }

  const token = process.env.GITHUB_ISSUE_TOKEN ?? process.env.GITHUB_TOKEN;

  if (!token) {
    return json(503, { error: "missing_github_token" });
  }

  let data;

  try {
    data = await request.json();
  } catch {
    return json(400, { error: "invalid_json" });
  }

  const title = typeof data?.title === "string" ? data.title.trim() : "";
  const payload = data?.payload;

  if (!title || !payload || typeof payload !== "object") {
    return json(400, { error: "invalid_payload" });
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
    return json(502, { error: "github_issue_failed" });
  }

  const issue = await githubResponse.json();

  return json(201, {
    ok: true,
    issueUrl: issue.html_url,
    issueNumber: issue.number,
  });
}
