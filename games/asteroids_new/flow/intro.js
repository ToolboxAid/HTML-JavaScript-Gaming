import { createAsteroidsShowcaseDebugPlugin } from "../debug/asteroidsShowcaseDebug.js";

export const ASTEROIDS_NEW_GAME_OVER_AUTO_EXIT_SECONDS = 30;
export const ASTEROIDS_NEW_GAME_OVER_RETURN_STATUS = "Press 1 for one player or 2 for two players.";

export const introFlow = Object.freeze({
  id: "intro",
  label: "Intro",
  debugPluginFactory: createAsteroidsShowcaseDebugPlugin
});
