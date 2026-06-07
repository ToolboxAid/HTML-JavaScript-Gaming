import {
  createServerRepositoryClient,
  readServerToolConstants,
} from "../../src/engine/api/server-api-client.js";

const constants = readServerToolConstants("game-design");

export const GAME_DESIGN_GAME_TYPES = Object.freeze(constants.GAME_DESIGN_GAME_TYPES || []);
export const GAME_DESIGN_GENRES = Object.freeze(constants.GAME_DESIGN_GENRES || []);
export const GAME_DESIGN_PLAY_STYLES = Object.freeze(constants.GAME_DESIGN_PLAY_STYLES || []);

export function createGameDesignApiRepository(options = {}) {
  return createServerRepositoryClient("game-design", options);
}
