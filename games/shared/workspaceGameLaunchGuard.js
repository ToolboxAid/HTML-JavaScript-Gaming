import { readToolHostSharedContextFromLocation } from "/tools/shared/toolHostSharedContext.js";

function normalizeGameId(value) {
  return typeof value === "string" ? value.trim() : "";
}

function resolveWorkspaceHostedContext(normalizedGameId) {
  const url = new URL(window.location.href);
  const params = url.searchParams;
  const hosted = params.get("hosted") === "1";
  const hostToolId = (params.get("hostToolId") || "").trim().toLowerCase();
  const hostContextId = (params.get("hostContextId") || "").trim();
  if (!hosted || hostToolId !== "workspace-manager" || !hostContextId) {
    return null;
  }

  const hostContext = readToolHostSharedContextFromLocation(window.location);
  const contextGameId = normalizeGameId(hostContext?.sharedContext?.gameId);
  const hostMode = normalizeGameId(hostContext?.sharedContext?.hostMode).toLowerCase();
  if (hostMode === "game" && contextGameId.toLowerCase() === normalizedGameId.toLowerCase()) {
    return hostContext;
  }

  return null;
}

export function openGameInWorkspaceManager(gameId) {
  if (typeof window === "undefined") {
    return false;
  }
  const normalizedGameId = normalizeGameId(gameId);
  if (!normalizedGameId) {
    return false;
  }
  const redirectUrl = new URL("/tools/Workspace%20Manager/index.html", window.location.origin);
  redirectUrl.searchParams.set("gameId", normalizedGameId);
  redirectUrl.searchParams.set("mount", "game");
  window.location.replace(redirectUrl.toString());
  return true;
}

export function enforceWorkspaceGameLaunch(gameId) {
  if (typeof window === "undefined") {
    return false;
  }
  const normalizedGameId = normalizeGameId(gameId);
  if (!normalizedGameId) {
    return false;
  }

  const hostedContext = resolveWorkspaceHostedContext(normalizedGameId);
  if (hostedContext) {
    window.__WORKSPACE_GAME_CONTEXT__ = hostedContext;
    return true;
  }

  // Direct preview/game launches must stay on the game URL and not be redirected.
  return false;
}
