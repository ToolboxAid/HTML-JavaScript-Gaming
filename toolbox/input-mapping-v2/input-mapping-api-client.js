import {
  createServerRepositoryClient,
  readServerToolConstants,
  requireServerConstant,
} from "../../src/engine/api/server-api-client.js";

const constants = readServerToolConstants("input-mapping-v2");

export const INPUT_MAPPING_TOOL_TABLES = Object.freeze(
  requireServerConstant(constants, "INPUT_MAPPING_TOOL_TABLES", "input-mapping-v2"),
);

export function createInputMappingToolApiRepository(options = {}) {
  return createServerRepositoryClient("input-mapping-v2", options);
}
