import {
  createServerRepositoryClient,
  readServerToolConstants,
  requireServerConstant,
} from "../../src/api/server-api-client.js";

const constants = readServerToolConstants("game-journey");

export const GAME_JOURNEY_KEYS = Object.freeze(requireServerConstant(constants, "GAME_JOURNEY_KEYS", "game-journey"));
export const GAME_JOURNEY_STATUS_BY_ID = Object.freeze(requireServerConstant(constants, "GAME_JOURNEY_STATUS_BY_ID", "game-journey"));
export const GAME_JOURNEY_STATUSES = Object.freeze(requireServerConstant(constants, "GAME_JOURNEY_STATUSES", "game-journey"));
export const GAME_JOURNEY_SUGGESTED_TOOLS = Object.freeze(requireServerConstant(constants, "GAME_JOURNEY_SUGGESTED_TOOLS", "game-journey"));

export function createGameJourneyApiRepository(options = {}) {
  return createServerRepositoryClient("game-journey", options);
}
