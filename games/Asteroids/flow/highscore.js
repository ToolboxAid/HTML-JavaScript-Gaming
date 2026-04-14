import { createAsteroidsShowcaseDebugPlugin } from "../debug/asteroidsShowcaseDebug.js";
import {
  ASTEROIDS_FLOW_CONTRACT_VERSION,
  ASTEROIDS_HIGHSCORE_AUTO_EXIT_SECONDS,
  ASTEROIDS_HIGHSCORE_STATUS
} from "../rules/gameFlowRules.js";

export const ASTEROIDS_HIGHSCORE_FLOW_NEXT_ID = "attract";

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
