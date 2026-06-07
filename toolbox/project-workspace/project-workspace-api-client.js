import {
  createServerRepositoryClient,
  readServerToolConstants,
} from "../../src/engine/api/server-api-client.js";

const constants = readServerToolConstants("project-workspace");

export const PROJECT_WORKSPACE_MEMBER_ROLES = Object.freeze(constants.PROJECT_WORKSPACE_MEMBER_ROLES || []);
export const PROJECT_WORKSPACE_PROJECT_PURPOSES = Object.freeze(constants.PROJECT_WORKSPACE_PROJECT_PURPOSES || []);
export const PROJECT_WORKSPACE_PROJECT_STATUSES = Object.freeze(constants.PROJECT_WORKSPACE_PROJECT_STATUSES || []);

export function createProjectWorkspaceApiRepository(options = {}) {
  return createServerRepositoryClient("project-workspace", options);
}
