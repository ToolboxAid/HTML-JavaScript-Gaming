/*
Toolbox Aid
David Quesenberry
04/05/2026
registerStandard3dDebugPresets.js
*/

export const STANDARD_3D_DEBUG_PRESETS = Object.freeze([
  Object.freeze({
    presetId: "preset.3d.inspect",
    title: "3D Inspect",
    description: "Enable all shared 3D summary panels.",
    panels: Object.freeze({
      enabled: Object.freeze([
        "3d.transform",
        "3d.camera",
        "3d.renderStages",
        "3d.collision",
        "3d.sceneGraph"
      ]),
      disabled: Object.freeze([]),
      order: Object.freeze([
        "3d.transform",
        "3d.camera",
        "3d.renderStages",
        "3d.collision",
        "3d.sceneGraph"
      ])
    })
  }),
  Object.freeze({
    presetId: "preset.3d.render",
    title: "3D Render",
    description: "Focus on camera and render stage summaries.",
    panels: Object.freeze({
      enabled: Object.freeze([
        "3d.camera",
        "3d.renderStages"
      ]),
      disabled: Object.freeze([
        "3d.transform",
        "3d.collision",
        "3d.sceneGraph"
      ]),
      order: Object.freeze([
        "3d.camera",
        "3d.renderStages"
      ])
    })
  }),
  Object.freeze({
    presetId: "preset.3d.camera",
    title: "3D Camera",
    description: "Focus on active camera and transform summaries.",
    panels: Object.freeze({
      enabled: Object.freeze([
        "3d.camera",
        "3d.transform"
      ]),
      disabled: Object.freeze([
        "3d.renderStages",
        "3d.collision",
        "3d.sceneGraph"
      ]),
      order: Object.freeze([
        "3d.camera",
        "3d.transform"
      ])
    })
  })
]);

export function registerStandard3dDebugPresets(presetRegistry, source = "standard.3d") {
  if (!presetRegistry || typeof presetRegistry.registerPreset !== "function") {
    return [];
  }

  const stablePresets = STANDARD_3D_DEBUG_PRESETS
    .slice()
    .sort((left, right) => left.presetId.localeCompare(right.presetId));

  return stablePresets.map((descriptor) => presetRegistry.registerPreset(descriptor, source));
}
