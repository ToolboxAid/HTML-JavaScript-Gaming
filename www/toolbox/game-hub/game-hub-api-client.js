import {
  createServerRepositoryClient,
  requireServerApiData,
  readServerToolConstants,
  requireServerConstant,
  safeRequestServerApi,
} from "../../../src/api/server-api-client.js";

const constants = readServerToolConstants("game-hub");

export const GAME_HUB_MEMBER_ROLES = Object.freeze(requireServerConstant(constants, "GAME_WORKSPACE_MEMBER_ROLES", "game-hub"));
export const GAME_HUB_GAME_PURPOSES = Object.freeze(requireServerConstant(constants, "GAME_WORKSPACE_GAME_PURPOSES", "game-hub"));
export const GAME_HUB_GAME_STATUSES = Object.freeze(requireServerConstant(constants, "GAME_WORKSPACE_GAME_STATUSES", "game-hub"));

export function createGameHubApiRepository(options = {}) {
  return createServerRepositoryClient("game-hub", options);
}

export const GAME_WORKSPACE_MEMBER_ROLES = GAME_HUB_MEMBER_ROLES;
export const GAME_WORKSPACE_GAME_PURPOSES = GAME_HUB_GAME_PURPOSES;
export const GAME_WORKSPACE_GAME_STATUSES = GAME_HUB_GAME_STATUSES;

export function createGameWorkspaceApiRepository(options = {}) {
  return createGameHubApiRepository(options);
}

export function readProjectWorkspaceProjectRecords() {
  return requireServerApiData(
    safeRequestServerApi("/project-workspace/projects"),
    "Game Hub project records",
  );
}
