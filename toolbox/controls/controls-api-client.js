import {
  createServerRepositoryClient,
  readServerToolConstants,
  requireServerConstant,
} from "../../src/engine/api/server-api-client.js";

const constants = readServerToolConstants("controls");

export const INPUT_MAPPING_TOOL_TABLES = Object.freeze(
  requireServerConstant(constants, "INPUT_MAPPING_TOOL_TABLES", "controls"),
);

export function createControlsToolApiRepository(options = {}) {
  return createServerRepositoryClient("controls", options);
}
