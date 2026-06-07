import {
  callServerToolFunction,
  createServerRepositoryClient,
  readServerToolConstants,
  requireServerConstant,
} from "../../src/engine/api/server-api-client.js";

const constants = readServerToolConstants("palette");

export const PALETTE_SOURCE_USER = requireServerConstant(constants, "PALETTE_SOURCE_USER", "palette");
export const PALETTE_TOOL_KEY = requireServerConstant(constants, "PALETTE_TOOL_KEY", "palette");
export const PALETTE_WORKSPACE_PATH = requireServerConstant(constants, "PALETTE_WORKSPACE_PATH", "palette");

export function createProjectWorkspacePaletteApiRepository(options = {}) {
  return createServerRepositoryClient("palette", options);
}

export function normalizePaletteSwatchInput(input) {
  return callServerToolFunction("palette", "normalizePaletteSwatchInput", input);
}

export function validatePaletteSwatchInput(input, options) {
  return callServerToolFunction("palette", "validatePaletteSwatchInput", input, options);
}
