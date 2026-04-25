import { readToolHostSharedContextFromLocation } from "/tools/shared/toolHostSharedContext.js";

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
  const hostContextId = (params.get("hostContextId") || "").trim();
  if (hosted && hostToolId === "workspace-manager" && hostContextId) {
    const hostContext = readToolHostSharedContextFromLocation(window.location);
    const contextGameId = normalizeGameId(hostContext?.sharedContext?.gameId);
    const hostMode = normalizeGameId(hostContext?.sharedContext?.hostMode).toLowerCase();
    if (hostMode === "game" && contextGameId.toLowerCase() === normalizedGameId.toLowerCase()) {
      window.__WORKSPACE_GAME_CONTEXT__ = hostContext;
      return;
    }
  }

  const redirectUrl = new URL("/tools/Workspace%20Manager/index.html", window.location.origin);
  redirectUrl.searchParams.set("game", normalizedGameId);
  redirectUrl.searchParams.set("mount", "game");
  window.location.replace(redirectUrl.toString());
}
