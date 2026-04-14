import { createAsteroidsShowcaseDebugPlugin } from "../debug/asteroidsShowcaseDebug.js";

export const ASTEROIDS_FLOW_CONTRACT_VERSION = "1";
export const ASTEROIDS_HIGHSCORE_FLOW_NEXT_ID = "attract";
export const ASTEROIDS_HIGHSCORE_AUTO_EXIT_SECONDS = 12;
export const ASTEROIDS_HIGHSCORE_STATUS = "High scores";

export const highscoreFlow = Object.freeze({
  id: "highscore",
  label: "Highscore",
  contractVersion: ASTEROIDS_FLOW_CONTRACT_VERSION,
  nextFlowId: ASTEROIDS_HIGHSCORE_FLOW_NEXT_ID,
  autoAdvanceSeconds: ASTEROIDS_HIGHSCORE_AUTO_EXIT_SECONDS,
  statusText: ASTEROIDS_HIGHSCORE_STATUS,
  returnMode: "menu",
  resetIdleOnReturn: true,
  debugPluginFactory: createAsteroidsShowcaseDebugPlugin
});
