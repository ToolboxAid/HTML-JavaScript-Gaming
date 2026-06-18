import {
  createServerRepositoryClient,
  readServerToolConstants,
  requireServerConstant,
} from "../../src/api/server-api-client.js";

const constants = readServerToolConstants("tags");

export const TAGS_TOOL_TABLES = Object.freeze(requireServerConstant(constants, "TAGS_TOOL_TABLES", "tags"));

export function createTagsToolApiRepository(options = {}) {
  return createServerRepositoryClient("tags", options);
}
