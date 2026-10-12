export type NotificationConfig = {
  configured: boolean;
  missing: string[];
};

type ContributionIdentity = {
  type?: string;
  createdAt?: string;
  title?: string;
  claimId?: string;
  summary?: string;
  correction?: string;
  sources?: string[];
};

export function getContributionKey(payload: ContributionIdentity) {
  if (!payload.type || !payload.createdAt) return null;
  return JSON.stringify([
    payload.type, payload.createdAt, payload.title, payload.claimId,
    payload.summary, payload.correction, payload.sources,
  ]);
}

export async function sendContribution(title: string, payload: unknown) {
  const response = await fetch("/api/contributions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title, payload }),
  });

  if (!response.ok || !(response.headers.get("content-type") ?? "").includes("application/json")) {
    throw new Error("contribution_not_received");
  }

  const data = await response.json();
  if (!data?.ok || data.delivery !== "github" || !Number.isInteger(data.issueNumber) || data.issueNumber <= 0) {
    throw new Error("contribution_not_received");
  }
  return data;
}
