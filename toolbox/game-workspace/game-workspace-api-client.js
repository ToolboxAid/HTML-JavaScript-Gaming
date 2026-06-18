import {
  createServerRepositoryClient,
  requireServerApiData,
  readServerToolConstants,
  requireServerConstant,
  safeRequestServerApi,
} from "../../src/api/server-api-client.js";

const constants = readServerToolConstants("game-workspace");

export const GAME_WORKSPACE_MEMBER_ROLES = Object.freeze(requireServerConstant(constants, "GAME_WORKSPACE_MEMBER_ROLES", "game-workspace"));
export const GAME_WORKSPACE_GAME_PURPOSES = Object.freeze(requireServerConstant(constants, "GAME_WORKSPACE_GAME_PURPOSES", "game-workspace"));
export const GAME_WORKSPACE_GAME_STATUSES = Object.freeze(requireServerConstant(constants, "GAME_WORKSPACE_GAME_STATUSES", "game-workspace"));

export function createGameWorkspaceApiRepository(options = {}) {
  return createServerRepositoryClient("game-workspace", options);
}

export function readProjectWorkspaceProjectRecords() {
  return requireServerApiData(
    safeRequestServerApi("/project-workspace/projects"),
    "Project Workspace project records",
  );
}
