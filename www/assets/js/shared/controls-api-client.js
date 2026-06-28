import {
  createServerRepositoryClient,
  readServerToolConstants,
  requireServerConstant,
} from "../../../../src/api/server-api-client.js";

const constants = readServerToolConstants("controls");

function freezeRows(rows) {
  return Object.freeze(rows.map((row) => Object.freeze({ ...row })));
}

function freezeValues(values) {
  return Object.freeze([...values]);
}

export const COMMON_DEFAULT_GAME_CONTROLS = freezeValues(
  requireServerConstant(constants, "COMMON_DEFAULT_GAME_CONTROLS", "controls"),
);

export const CONTROL_EVENT_OPTIONS = freezeRows(
  requireServerConstant(constants, "CONTROL_EVENT_OPTIONS", "controls"),
);

export const ENGINE_OWNED_NORMALIZED_INPUTS = freezeValues(
  requireServerConstant(constants, "ENGINE_OWNED_NORMALIZED_INPUTS", "controls"),
);

export const GAME_CONTROL_NORMALIZED_INPUTS = freezeValues(
  requireServerConstant(constants, "GAME_CONTROL_NORMALIZED_INPUTS", "controls"),
);

export const INPUT_MAPPING_TOOL_TABLES = Object.freeze(
  requireServerConstant(constants, "INPUT_MAPPING_TOOL_TABLES", "controls"),
);

export const NORMALIZED_USAGE_LABELS = Object.freeze(
  { ...requireServerConstant(constants, "NORMALIZED_USAGE_LABELS", "controls") },
);

export function createControlsToolApiRepository(options = {}) {
  return createServerRepositoryClient("controls", options);
}
