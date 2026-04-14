import { createAsteroidsShowcaseDebugPlugin } from "../debug/asteroidsShowcaseDebug.js";

export const ASTEROIDS_NEW_GAME_OVER_RETURN_MODE = "menu";
export const ASTEROIDS_NEW_GAME_OVER_RETURN_RESET_IDLE = true;
export const ASTEROIDS_FLOW_CONTRACT_VERSION = "1";
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
