import { createAsteroidsShowcaseDebugPlugin } from "../debug/asteroidsShowcaseDebug.js";
import {
  ASTEROIDS_FLOW_CONTRACT_VERSION, ASTEROIDS_GAME_OVER_AUTO_EXIT_SECONDS } from "../rules/flowRules.js";
import { ASTEROIDS_GAME_OVER_RETURN_STATUS } from "../rules/flowContent.js";

export const ASTEROIDS_NEW_GAME_OVER_AUTO_EXIT_SECONDS = ASTEROIDS_GAME_OVER_AUTO_EXIT_SECONDS;
export const ASTEROIDS_NEW_GAME_OVER_RETURN_STATUS = ASTEROIDS_GAME_OVER_RETURN_STATUS;
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

