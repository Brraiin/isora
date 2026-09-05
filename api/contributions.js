import { isAdminAuthorized } from "./_admin-auth.js";

const githubApiUrl = "https://api.github.com/repos/Brraiin/isora/issues";
const contributionDecisionLabels = {
  accepted: "isora-validee",
  rejected: "isora-refusee",
};
const contributionDeletedLabel = "isora-supprimee";
const contributionModerationMarkerPattern = /\n*<!--\s*isora-moderation:(accepted|rejected|deleted)\s*-->\n*/g;

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
    ? issue.body.match(/<!--\s*isora-moderation:(accepted|rejected|deleted)\s*-->/)?.[1]
    : null;

  if (labels.has(contributionDeletedLabel) || bodyStatus === "deleted") return "deleted";
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

function readNotificationRecipients() {
  const value = process.env.ISORA_CONTRIBUTION_NOTIFY_TO ?? "";
  return value
    .split(/[,;\n]/)
    .map((recipient) => recipient.trim())
    .filter(Boolean);
}

function htmlEscape(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "\"":
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return character;
    }
  });
}

function truncateText(value, maxLength = 4000) {
  const text = String(value ?? "").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}…`;
}

function normalizeContributionValue(value) {
  if (Array.isArray(value)) {
    return value
      .map((entry) => normalizeContributionValue(entry))
      .filter(Boolean)
      .join("\n");
  }

  if (typeof value === "string") return value.trim();
  return "";
}

function getContributionKind(payload) {
  if (payload?.type === "contestation_asymetrie") {
    return {
      label: "Signalement d'asymétrie",
      subject: "isora - signalement d'asymétrie",
    };
  }

  if (payload?.type === "suggestion_asymetrie") {
    return {
      label: "Proposition d'asymétrie",
      subject: "isora - proposition d'asymétrie",
    };
  }

  return {
    label: "Contribution",
    subject: "isora - nouvelle contribution",
  };
}

function buildNotificationFields(title, payload, issue, warning) {
  const fields = [];
  const addField = (label, value) => {
    const text = truncateText(normalizeContributionValue(value));
    if (text) fields.push([label, text]);
  };

  addField("Type", getContributionKind(payload).label);
  addField("Titre", payload?.title || payload?.claimTitle || title);
  addField("Angle", payload?.angle);
  addField("Sexe concerné", payload?.side);
  addField("Résumé proposé", payload?.summary);
  addField("Correction proposée", payload?.correction);
  addField("Fiche concernée", payload?.claimTitle);
  addField("Lien fiche", payload?.claimUrl);
  addField("Page d'envoi", payload?.pageUrl);
  addField("Sources", payload?.sources);
  addField("Date d'envoi", payload?.createdAt);
  addField("Issue GitHub", issue?.html_url);
  addField("Avertissement", warning);

  return fields;
}

function buildNotificationMessage(title, payload, issue, warning) {
  const kind = getContributionKind(payload);
  const itemTitle = truncateText(normalizeContributionValue(payload?.title || payload?.claimTitle || title), 110);
  const subject = itemTitle ? `${kind.subject} - ${itemTitle}` : kind.subject;
  const fields = buildNotificationFields(title, payload, issue, warning);
  const rows = fields
    .map(
      ([label, value]) => `
        <tr>
          <th style="border-top:1px solid #e5e7eb;color:#1455a3;font-family:Arial,sans-serif;font-size:12px;padding:12px;text-align:left;text-transform:uppercase;vertical-align:top;width:160px">${htmlEscape(label)}</th>
          <td style="border-top:1px solid #e5e7eb;color:#171717;font-family:Arial,sans-serif;font-size:14px;line-height:1.5;padding:12px;white-space:pre-wrap">${htmlEscape(value)}</td>
        </tr>`,
    )
    .join("");

  const text = [
    `${kind.label} reçue par isora.`,
    "",
    ...fields.map(([label, value]) => `${label}: ${value}`),
  ].join("\n");

  const html = `<!doctype html>
<html lang="fr">
  <body style="background:#f8fafc;margin:0;padding:24px">
    <main style="background:#ffffff;border:1px solid #e5e7eb;margin:0 auto;max-width:680px">
      <header style="padding:20px 24px 8px">
        <p style="color:#1455a3;font-family:Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:0;margin:0 0 8px;text-transform:uppercase">Contribution publique</p>
        <h1 style="color:#171717;font-family:Arial,sans-serif;font-size:22px;line-height:1.25;margin:0">${htmlEscape(kind.label)} reçue sur <em>isora</em></h1>
      </header>
      <table style="border-collapse:collapse;margin:8px 0 0;width:100%">
        <tbody>${rows}</tbody>
      </table>
    </main>
  </body>
</html>`;

  return { subject, text, html };
}

function getNotificationIdempotencyKey(title, payload, issue) {
  const rawKey = [
    "isora-contribution",
    issue?.number ? `github-${issue.number}` : "email-only",
    payload?.createdAt,
    payload?.type,
    payload?.title || payload?.claimTitle || title,
  ]
    .map((part) => normalizeContributionValue(part))
    .filter(Boolean)
    .join("-");

  return rawKey.replace(/[^a-zA-Z0-9._:-]/g, "-").slice(0, 240);
}

async function sendContributionNotification(title, payload, issue = null, warning = "") {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ISORA_CONTRIBUTION_NOTIFY_FROM;
  const recipients = readNotificationRecipients();

  if (!apiKey || !from || recipients.length === 0) {
    return { sent: false, reason: "missing_notification_config" };
  }

  const message = buildNotificationMessage(title, payload, issue, warning);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  try {
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
        "idempotency-key": getNotificationIdempotencyKey(title, payload, issue),
      },
      body: JSON.stringify({
        from,
        to: recipients,
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
      signal: controller.signal,
    });

    if (!resendResponse.ok) {
      return { sent: false, reason: "resend_failed" };
    }

    return { sent: true };
  } catch {
    return { sent: false, reason: "notification_failed" };
  } finally {
    clearTimeout(timeout);
  }
}

function warnIfNotificationFailed(result) {
  if (result.sent || result.reason === "missing_notification_config") return;
  console.warn(`isora contribution notification skipped: ${result.reason}`);
}

export default async function handler(request, response) {
  const token = process.env.GITHUB_ISSUE_TOKEN ?? process.env.GITHUB_TOKEN;
  const method = request.method ?? "GET";

  if ((method === "GET" || method === "PATCH" || method === "DELETE") && !isAdminAuthorized(request)) {
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
      items: issues.map(serializeIssue).filter((issue) => issue.status !== "deleted"),
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
      ...labels.filter((label) => !decisionLabelValues.includes(label) && label !== contributionDeletedLabel),
      contributionDecisionLabels[decision],
    ];
    const nextBody = `${String(issue.body ?? "").replace(contributionModerationMarkerPattern, "").trim()}\n\n<!-- isora-moderation:${decision} -->`;

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

  if (method === "DELETE") {
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

    if (!Number.isInteger(issueNumber)) {
      return json(400, { error: "invalid_delete_payload" }, response);
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
      ...labels.filter((label) => !decisionLabelValues.includes(label) && label !== contributionDeletedLabel),
      contributionDeletedLabel,
    ];
    const nextBody = `${String(issue.body ?? "").replace(contributionModerationMarkerPattern, "").trim()}\n\n<!-- isora-moderation:deleted -->`;

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
      return json(502, { error: "github_issue_delete_failed" }, response);
    }

    await fetch(`${githubApiUrl}/${issueNumber}/comments`, {
      method: "POST",
      headers: {
        accept: "application/vnd.github+json",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
        "x-github-api-version": "2022-11-28",
      },
      body: JSON.stringify({
        body: `Retour supprimé du dashboard isora le ${new Date().toISOString()}.`,
      }),
    }).catch(() => undefined);

    return json(200, {
      ok: true,
      deleted: true,
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
    const notification = await sendContributionNotification(
      title,
      payload,
      null,
      "Aucune issue GitHub n'a été créée: GITHUB_ISSUE_TOKEN est absent.",
    );
    warnIfNotificationFailed(notification);

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
    const notification = await sendContributionNotification(
      title,
      payload,
      null,
      "L'issue GitHub n'a pas pu être créée. La contribution reste seulement sauvegardée dans le navigateur de la personne qui l'a envoyée.",
    );
    warnIfNotificationFailed(notification);

    return json(502, { error: "github_issue_failed" }, response);
  }

  const issue = await githubResponse.json();
  const notification = await sendContributionNotification(title, payload, issue);
  warnIfNotificationFailed(notification);

  return json(201, {
    ok: true,
    delivery: "github",
    issueUrl: issue.html_url,
    issueNumber: issue.number,
  }, response);
}
