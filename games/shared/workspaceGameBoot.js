import { enforceWorkspaceGameLaunch } from "/games/shared/workspaceGameLaunchGuard.js";
import { hydrateWorkspaceGameRuntime } from "/games/shared/workspaceGameRuntimeHydrator.js";
import { hydrateWorkspaceGameMetadata } from "/games/shared/workspaceGameMetadataHydrator.js";
import { normalizeGameId } from "../../src/shared/string/index.js";

export function bootWorkspaceGame(gameId) {
  const normalizedGameId = normalizeGameId(gameId);
  if (!normalizedGameId) {
    return null;
  }
  hydrateWorkspaceGameMetadata(normalizedGameId);
  enforceWorkspaceGameLaunch(normalizedGameId);
  return hydrateWorkspaceGameRuntime(normalizedGameId);
}
