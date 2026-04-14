import { createAsteroidsShowcaseDebugPlugin } from "../debug/asteroidsShowcaseDebug.js";
import {
  ASTEROIDS_FLOW_CONTRACT_VERSION, ASTEROIDS_GAME_OVER_RETURN_MODE, ASTEROIDS_GAME_OVER_RETURN_RESET_IDLE } from "../rules/flowRules.js";

export const ASTEROIDS_NEW_GAME_OVER_RETURN_MODE = ASTEROIDS_GAME_OVER_RETURN_MODE;
export const ASTEROIDS_NEW_GAME_OVER_RETURN_RESET_IDLE = ASTEROIDS_GAME_OVER_RETURN_RESET_IDLE;
export const ASTEROIDS_ATTRACT_FLOW_NEXT_ID = "intro";

export const attractFlow = Object.freeze({
  id: "attract",
  label: "Attract",
  contractVersion: ASTEROIDS_FLOW_CONTRACT_VERSION,
  nextFlowId: ASTEROIDS_ATTRACT_FLOW_NEXT_ID,
  autoAdvanceSeconds: null,
  statusText: "Press 1 for one player or 2 for two players.",
  returnMode: ASTEROIDS_NEW_GAME_OVER_RETURN_MODE,
  resetIdleOnReturn: ASTEROIDS_NEW_GAME_OVER_RETURN_RESET_IDLE,
  debugPluginFactory: createAsteroidsShowcaseDebugPlugin
});

