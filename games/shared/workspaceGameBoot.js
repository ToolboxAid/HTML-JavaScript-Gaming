import { enforceWorkspaceGameLaunch } from "/games/shared/workspaceGameLaunchGuard.js";
import { hydrateWorkspaceGameRuntime } from "/games/shared/workspaceGameRuntimeHydrator.js";
import { hydrateWorkspaceGameMetadata } from "/games/shared/workspaceGameMetadataHydrator.js";

function normalizeGameId(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function bootWorkspaceGame(gameId) {
  const normalizedGameId = normalizeGameId(gameId);
  if (!normalizedGameId) {
    return null;
  }
  hydrateWorkspaceGameMetadata(normalizedGameId);
  enforceWorkspaceGameLaunch(normalizedGameId);
  return hydrateWorkspaceGameRuntime(normalizedGameId);
}
