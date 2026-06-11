import {
  createServerRepositoryClient,
  readServerToolConstants,
  requireServerConstant,
} from "../../src/engine/api/server-api-client.js";

const constants = readServerToolConstants("project-workspace");

export const GAME_WORKSPACE_MEMBER_ROLES = Object.freeze(requireServerConstant(constants, "PROJECT_WORKSPACE_MEMBER_ROLES", "project-workspace"));
export const GAME_WORKSPACE_PROJECT_PURPOSES = Object.freeze(requireServerConstant(constants, "PROJECT_WORKSPACE_PROJECT_PURPOSES", "project-workspace"));
export const GAME_WORKSPACE_PROJECT_STATUSES = Object.freeze(requireServerConstant(constants, "PROJECT_WORKSPACE_PROJECT_STATUSES", "project-workspace"));

export function createGameWorkspaceApiRepository(options = {}) {
  return createServerRepositoryClient("project-workspace", options);
}
