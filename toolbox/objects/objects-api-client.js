import {
  createServerRepositoryClient,
  readServerToolConstants,
  requireServerConstant,
} from "../../src/engine/api/server-api-client.js";

const constants = readServerToolConstants("objects");

export const OBJECTS_TOOL_TABLES = Object.freeze(requireServerConstant(constants, "OBJECTS_TOOL_TABLES", "objects"));

export function createObjectsToolApiRepository(options = {}) {
  return createServerRepositoryClient("objects", options);
}
