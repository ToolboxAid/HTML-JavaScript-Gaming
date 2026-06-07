import {
  createServerRepositoryClient,
  readServerToolConstants,
  requireServerConstant,
} from "../../src/engine/api/server-api-client.js";

const constants = readServerToolConstants("game-design");

export const GAME_DESIGN_GAME_TYPES = Object.freeze(requireServerConstant(constants, "GAME_DESIGN_GAME_TYPES", "game-design"));
export const GAME_DESIGN_GENRES = Object.freeze(requireServerConstant(constants, "GAME_DESIGN_GENRES", "game-design"));
export const GAME_DESIGN_PLAY_STYLES = Object.freeze(requireServerConstant(constants, "GAME_DESIGN_PLAY_STYLES", "game-design"));

export function createGameDesignApiRepository(options = {}) {
  return createServerRepositoryClient("game-design", options);
}
