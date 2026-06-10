import {
  createServerRepositoryClient,
  readServerToolConstants,
  requireServerConstant,
} from "../../src/engine/api/server-api-client.js";

const constants = readServerToolConstants("project-journey");

export const PROJECT_JOURNEY_KEYS = Object.freeze(requireServerConstant(constants, "PROJECT_JOURNEY_KEYS", "project-journey"));
export const PROJECT_JOURNEY_STATUS_BY_ID = Object.freeze(requireServerConstant(constants, "PROJECT_JOURNEY_STATUS_BY_ID", "project-journey"));
export const PROJECT_JOURNEY_STATUSES = Object.freeze(requireServerConstant(constants, "PROJECT_JOURNEY_STATUSES", "project-journey"));
export const PROJECT_JOURNEY_SUGGESTED_TOOLS = Object.freeze(requireServerConstant(constants, "PROJECT_JOURNEY_SUGGESTED_TOOLS", "project-journey"));

export function createProjectJourneyApiRepository(options = {}) {
  return createServerRepositoryClient("project-journey", options);
}
