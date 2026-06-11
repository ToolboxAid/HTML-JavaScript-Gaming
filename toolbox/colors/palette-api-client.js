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
export const CURATED_PALETTE_COLLECTIONS = Object.freeze(requireServerConstant(constants, "CURATED_PALETTE_COLLECTIONS", "palette"));
export const NUMERIC_VARIANT_COUNTS = Object.freeze(requireServerConstant(constants, "NUMERIC_VARIANT_COUNTS", "palette"));
export const PALETTE_GENERATOR_DEFAULTS = Object.freeze(requireServerConstant(constants, "PALETTE_GENERATOR_DEFAULTS", "palette"));
export const PALETTE_VARIANTS = Object.freeze(requireServerConstant(constants, "PALETTE_VARIANTS", "palette"));
export const PICKER_PREVIEW_DEFAULTS = Object.freeze(requireServerConstant(constants, "PICKER_PREVIEW_DEFAULTS", "palette"));
export const PICKER_PREVIEW_SORT_OPTIONS = Object.freeze(requireServerConstant(constants, "PICKER_PREVIEW_SORT_OPTIONS", "palette"));
export const SIZE_OPTIONS = Object.freeze(requireServerConstant(constants, "SIZE_OPTIONS", "palette"));
export const SORT_OPTIONS = Object.freeze(requireServerConstant(constants, "SORT_OPTIONS", "palette"));
export const SUGGESTED_TAGS = Object.freeze(requireServerConstant(constants, "SUGGESTED_TAGS", "palette"));

export function createGameWorkspacePaletteApiRepository(options = {}) {
  return createServerRepositoryClient("palette", options);
}

export function normalizePaletteSwatchInput(input) {
  return callServerToolFunction("palette", "normalizePaletteSwatchInput", input);
}

export function validatePaletteSwatchInput(input, existingSwatches, options) {
  return callServerToolFunction("palette", "validatePaletteSwatchInput", input, existingSwatches, options);
}
