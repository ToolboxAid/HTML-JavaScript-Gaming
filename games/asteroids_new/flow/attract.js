import { createAsteroidsShowcaseDebugPlugin } from "../debug/asteroidsShowcaseDebug.js";

export const ASTEROIDS_NEW_GAME_OVER_RETURN_MODE = "menu";
export const ASTEROIDS_NEW_GAME_OVER_RETURN_RESET_IDLE = true;

export const attractFlow = Object.freeze({
  id: "attract",
  label: "Attract",
  debugPluginFactory: createAsteroidsShowcaseDebugPlugin
});
