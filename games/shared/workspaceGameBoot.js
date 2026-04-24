import { enforceWorkspaceGameLaunch } from "/games/shared/workspaceGameLaunchGuard.js";
import { hydrateWorkspaceGameRuntime } from "/games/shared/workspaceGameRuntimeHydrator.js";

function normalizeGameId(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function bootWorkspaceGame(gameId) {
  const normalizedGameId = normalizeGameId(gameId);
  if (!normalizedGameId) {
    return null;
  }
  enforceWorkspaceGameLaunch(normalizedGameId);
  return hydrateWorkspaceGameRuntime(normalizedGameId);
}
