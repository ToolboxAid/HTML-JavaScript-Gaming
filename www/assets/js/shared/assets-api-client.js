import {
  callServerToolFunction,
  createServerRepositoryClient,
  readServerToolConstants,
  requireServerConstant,
} from "../../../../src/api/server-api-client.js";

const constants = readServerToolConstants("assets");

export const ASSET_ROLE_DEFINITIONS = Object.freeze(requireServerConstant(constants, "ASSET_ROLE_DEFINITIONS", "assets"));
export const ASSET_CATALOG_TYPES = Object.freeze(requireServerConstant(constants, "ASSET_CATALOG_TYPES", "assets"));
export const ASSET_TOOL_TABLES = Object.freeze(requireServerConstant(constants, "ASSET_TOOL_TABLES", "assets"));
export const ASSET_TYPES = Object.freeze(requireServerConstant(constants, "ASSET_TYPES", "assets"));
export const ASSET_USAGE_OPTIONS = Object.freeze(requireServerConstant(constants, "ASSET_USAGE_OPTIONS", "assets"));
export const ASSET_USAGE_BY_ROLE = Object.freeze(requireServerConstant(constants, "ASSET_USAGE_BY_ROLE", "assets"));

export function createAssetToolApiRepository(options = {}) {
  return createServerRepositoryClient("assets", options);
}

export function pickerDiagnosticForRole(role, paletteSnapshot) {
  return callServerToolFunction("assets", "pickerDiagnosticForRole", role, paletteSnapshot);
}
