import {
  createServerRepositoryClient,
  readServerToolConstants,
  requireServerConstant,
} from "../../src/engine/api/server-api-client.js";

const constants = readServerToolConstants("game-configuration");

export const GAME_CONFIGURATION_SECTIONS = Object.freeze(requireServerConstant(constants, "GAME_CONFIGURATION_SECTIONS", "game-configuration"));

export function createGameConfigurationApiRepository(options = {}) {
  return createServerRepositoryClient("game-configuration", options);
}
