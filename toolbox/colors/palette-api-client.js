import {
  callServerToolFunction,
  createServerRepositoryClient,
  readServerToolConstants,
} from "../../src/engine/api/server-api-client.js";

const constants = readServerToolConstants("palette");

export const PALETTE_SOURCE_USER = constants.PALETTE_SOURCE_USER || "user";
export const PALETTE_TOOL_KEY = constants.PALETTE_TOOL_KEY || "palette-browser";
export const PALETTE_WORKSPACE_PATH = constants.PALETTE_WORKSPACE_PATH || "tools.palette-browser.swatches";

export function createProjectWorkspacePaletteApiRepository(options = {}) {
  return createServerRepositoryClient("palette", options);
}

export function normalizePaletteSwatchInput(input) {
  return callServerToolFunction("palette", "normalizePaletteSwatchInput", input);
}

export function validatePaletteSwatchInput(input, options) {
  return callServerToolFunction("palette", "validatePaletteSwatchInput", input, options);
}
