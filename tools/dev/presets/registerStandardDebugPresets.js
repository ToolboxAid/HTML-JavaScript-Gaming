/*
Toolbox Aid
David Quesenberry
04/05/2026
registerStandardDebugPresets.js
*/

export const STANDARD_DEBUG_PRESETS = Object.freeze([
  Object.freeze({
    presetId: "preset.gameplay",
    title: "Gameplay",
    description: "Focus on scene gameplay and interaction diagnostics.",
    panels: Object.freeze({
      enabled: Object.freeze([
        "runtime-summary",
        "scene-identity",
        "camera-state",
        "entity-counts",
        "input-summary"
      ]),
      disabled: Object.freeze([
        "frame-timing",
        "render-stage",
        "tilemap-summary",
        "hotreload-status",
        "validation-warnings"
      ]),
      order: Object.freeze([
        "runtime-summary",
        "scene-identity",
        "camera-state",
        "entity-counts",
        "input-summary"
      ])
    })
  }),
  Object.freeze({
    presetId: "preset.minimal",
    title: "Minimal",
    description: "Minimal panel set for lightweight runtime checks.",
    panels: Object.freeze({
      enabled: Object.freeze([
        "runtime-summary",
        "frame-timing",
        "validation-warnings"
      ]),
      disabled: Object.freeze([
        "scene-identity",
        "camera-state",
        "entity-counts",
        "render-stage",
        "tilemap-summary",
        "input-summary",
        "hotreload-status"
      ]),
      order: Object.freeze([
        "runtime-summary",
        "frame-timing",
        "validation-warnings"
      ])
    })
  }),
  Object.freeze({
    presetId: "preset.qa",
    title: "QA",
    description: "Validation and hot-reload oriented checks for QA runs.",
    panels: Object.freeze({
      enabled: Object.freeze([
        "runtime-summary",
        "frame-timing",
        "hotreload-status",
        "validation-warnings",
        "input-summary"
      ]),
      disabled: Object.freeze([
        "scene-identity",
        "camera-state",
        "entity-counts",
        "render-stage",
        "tilemap-summary"
      ]),
      order: Object.freeze([
        "runtime-summary",
        "frame-timing",
        "hotreload-status",
        "validation-warnings",
        "input-summary"
      ])
    })
  }),
  Object.freeze({
    presetId: "preset.rendering",
    title: "Rendering",
    description: "Focus on rendering and timing diagnostics.",
    panels: Object.freeze({
      enabled: Object.freeze([
        "runtime-summary",
        "frame-timing",
        "render-stage",
        "camera-state"
      ]),
      disabled: Object.freeze([
        "scene-identity",
        "entity-counts",
        "tilemap-summary",
        "input-summary",
        "hotreload-status",
        "validation-warnings"
      ]),
      order: Object.freeze([
        "runtime-summary",
        "frame-timing",
        "render-stage",
        "camera-state"
      ])
    })
  }),
  Object.freeze({
    presetId: "preset.systems",
    title: "Systems",
    description: "Focus on runtime systems, reload, and validation health.",
    panels: Object.freeze({
      enabled: Object.freeze([
        "runtime-summary",
        "hotreload-status",
        "validation-warnings",
        "input-summary"
      ]),
      disabled: Object.freeze([
        "frame-timing",
        "scene-identity",
        "camera-state",
        "entity-counts",
        "render-stage",
        "tilemap-summary"
      ]),
      order: Object.freeze([
        "runtime-summary",
        "hotreload-status",
        "validation-warnings",
        "input-summary"
      ])
    })
  })
]);

export function registerStandardDebugPresets(presetRegistry, source = "standard") {
  if (!presetRegistry || typeof presetRegistry.registerPreset !== "function") {
    return [];
  }

  const stableDescriptors = STANDARD_DEBUG_PRESETS
    .slice()
    .sort((left, right) => left.presetId.localeCompare(right.presetId));

  return stableDescriptors.map((descriptor) => {
    return presetRegistry.registerPreset(descriptor, source);
  });
}
