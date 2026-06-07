import {
  createServerRepositoryClient,
  readServerToolConstants,
} from "../../src/engine/api/server-api-client.js";

const constants = readServerToolConstants("project-journey");

export const PROJECT_JOURNEY_KEYS = Object.freeze(constants.PROJECT_JOURNEY_KEYS || {});
export const PROJECT_JOURNEY_STATUS_BY_ID = Object.freeze(constants.PROJECT_JOURNEY_STATUS_BY_ID || {});
export const PROJECT_JOURNEY_STATUSES = Object.freeze(constants.PROJECT_JOURNEY_STATUSES || []);

export function createProjectJourneyApiRepository(options = {}) {
  return createServerRepositoryClient("project-journey", options);
}
