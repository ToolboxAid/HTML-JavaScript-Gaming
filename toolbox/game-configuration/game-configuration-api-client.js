import {
  createServerRepositoryClient,
  readServerToolConstants,
} from "../../src/engine/api/server-api-client.js";

const constants = readServerToolConstants("game-configuration");

export const GAME_CONFIGURATION_SECTIONS = Object.freeze(constants.GAME_CONFIGURATION_SECTIONS || []);

export function createGameConfigurationApiRepository(options = {}) {
  return createServerRepositoryClient("game-configuration", options);
}
