/*
Toolbox Aid
David Quesenberry
04/05/2026
registerStandardDebugMacros.js
*/

export const STANDARD_DEBUG_MACROS = Object.freeze([
  Object.freeze({
    macroId: "macro.minimal.focus",
    title: "Minimal Focus",
    description: "Apply minimal preset and show overlay for focused checks.",
    steps: Object.freeze([
      "preset.apply preset.minimal",
      "overlay.showAll",
      "overlay.status"
    ])
  }),
  Object.freeze({
    macroId: "macro.qa.start",
    title: "QA Start",
    description: "Apply QA preset and surface validation and reload status.",
    steps: Object.freeze([
      "preset.apply preset.qa",
      "overlay.showAll",
      "validation.info",
      "overlay.status"
    ])
  }),
  Object.freeze({
    macroId: "macro.render.inspect",
    title: "Render Inspect",
    description: "Apply rendering preset and inspect render diagnostics.",
    steps: Object.freeze([
      "preset.apply preset.rendering",
      "overlay.showAll",
      "render.info",
      "overlay.order"
    ])
  }),
  Object.freeze({
    macroId: "macro.scene.inspect",
    title: "Scene Inspect",
    description: "Apply gameplay preset and inspect scene diagnostics.",
    steps: Object.freeze([
      "preset.apply preset.gameplay",
      "overlay.showAll",
      "scene.info",
      "entities.count",
      "tilemap.info"
    ])
  })
]);

export function registerStandardDebugMacros(macroRegistry, source = "standard") {
  if (!macroRegistry || typeof macroRegistry.registerMacro !== "function") {
    return [];
  }

  const descriptors = STANDARD_DEBUG_MACROS
    .slice()
    .sort((left, right) => left.macroId.localeCompare(right.macroId));

  return descriptors.map((descriptor) => {
    return macroRegistry.registerMacro(descriptor, source);
  });
}
