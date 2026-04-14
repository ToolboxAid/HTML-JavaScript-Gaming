import { createAsteroidsShowcaseDebugPlugin } from "../debug/asteroidsShowcaseDebug.js";

export const ASTEROIDS_NEW_GAME_OVER_AUTO_EXIT_SECONDS = 30;
export const ASTEROIDS_NEW_GAME_OVER_RETURN_STATUS = "Press 1 for one player or 2 for two players.";
export const ASTEROIDS_FLOW_CONTRACT_VERSION = "1";
export const ASTEROIDS_INTRO_FLOW_NEXT_ID = "highscore";

export const introFlow = Object.freeze({
  id: "intro",
  label: "Intro",
  contractVersion: ASTEROIDS_FLOW_CONTRACT_VERSION,
  nextFlowId: ASTEROIDS_INTRO_FLOW_NEXT_ID,
  autoAdvanceSeconds: ASTEROIDS_NEW_GAME_OVER_AUTO_EXIT_SECONDS,
  statusText: ASTEROIDS_NEW_GAME_OVER_RETURN_STATUS,
  returnMode: "menu",
  resetIdleOnReturn: true,
  debugPluginFactory: createAsteroidsShowcaseDebugPlugin
});
