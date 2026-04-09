import { createAsteroidsShowcaseDebugPlugin } from "../debug/asteroidsShowcaseDebug.js";

export const attractFlow = Object.freeze({
  id: "attract",
  label: "Attract",
  debugPluginFactory: createAsteroidsShowcaseDebugPlugin
});
