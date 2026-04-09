import { createAsteroidsShowcaseDebugPlugin } from "../debug/asteroidsShowcaseDebug.js";

export const introFlow = Object.freeze({
  id: "intro",
  label: "Intro",
  debugPluginFactory: createAsteroidsShowcaseDebugPlugin
});
