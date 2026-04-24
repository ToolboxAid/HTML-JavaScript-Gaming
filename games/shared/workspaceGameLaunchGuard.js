function normalizeGameId(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function enforceWorkspaceGameLaunch(gameId) {
  if (typeof window === "undefined") {
    return;
  }
  const normalizedGameId = normalizeGameId(gameId);
  if (!normalizedGameId) {
    return;
  }

  const url = new URL(window.location.href);
  const params = url.searchParams;
  const hosted = params.get("hosted") === "1";
  const hostToolId = (params.get("hostToolId") || "").trim().toLowerCase();
  const allowStandalone = params.get("allowStandalone") === "1";

  if (allowStandalone || (hosted && hostToolId === "workspace-manager")) {
    return;
  }

  const redirectUrl = new URL("/tools/Workspace%20Manager/index.html", window.location.origin);
  redirectUrl.searchParams.set("game", normalizedGameId);
  window.location.replace(redirectUrl.toString());
}
