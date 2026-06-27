import { enforceWorkspaceGameLaunch } from "/old_old_games/shared/workspaceGameLaunchGuard.js";
import { hydrateWorkspaceGameRuntime } from "/old_old_games/shared/workspaceGameRuntimeHydrator.js";
import { hydrateWorkspaceGameMetadata } from "/old_old_games/shared/workspaceGameMetadataHydrator.js";
import { normalizeGameId } from "../../src/shared/string/strings.js";

export function bootWorkspaceGame(gameId) {
  const normalizedGameId = normalizeGameId(gameId);
  if (!normalizedGameId) {
    return null;
  }
  hydrateWorkspaceGameMetadata(normalizedGameId);
  enforceWorkspaceGameLaunch(normalizedGameId);
  return hydrateWorkspaceGameRuntime(normalizedGameId);
}
