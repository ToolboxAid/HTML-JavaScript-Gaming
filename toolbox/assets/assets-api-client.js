import {
  callServerToolFunction,
  createServerRepositoryClient,
  readServerToolConstants,
} from "../../src/engine/api/server-api-client.js";

const constants = readServerToolConstants("assets");

export const ASSET_ROLE_DEFINITIONS = Object.freeze(constants.ASSET_ROLE_DEFINITIONS || []);
export const ASSET_TOOL_TABLES = Object.freeze(constants.ASSET_TOOL_TABLES || []);
export const ASSET_TYPES = Object.freeze(constants.ASSET_TYPES || []);
export const ASSET_USAGE_BY_ROLE = Object.freeze(constants.ASSET_USAGE_BY_ROLE || {});

export function createAssetToolApiRepository(options = {}) {
  return createServerRepositoryClient("assets", options);
}

export function pickerDiagnosticForRole(role, paletteSnapshot) {
  return callServerToolFunction("assets", "pickerDiagnosticForRole", role, paletteSnapshot);
}
