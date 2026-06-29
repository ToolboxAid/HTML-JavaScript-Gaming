/*
Toolbox Aid
David Quesenberry
04/06/2026
registerAdvancedInspectorDebugPresets.js
*/

export const ADVANCED_INSPECTOR_DEBUG_PRESETS = Object.freeze([
  Object.freeze({
    presetId: "preset.inspectors.inspect",
    title: "Inspect",
    description: "Enable all advanced inspector panels.",
    panels: Object.freeze({
      enabled: Object.freeze([
        "inspector-entity",
        "inspector-component",
        "inspector-state-diff",
        "inspector-timeline",
        "inspector-event-stream"
      ]),
      disabled: Object.freeze([]),
      order: Object.freeze([
        "inspector-entity",
        "inspector-component",
        "inspector-state-diff",
        "inspector-timeline",
        "inspector-event-stream"
      ])
    })
  }),
  Object.freeze({
    presetId: "preset.inspectors.timeline",
    title: "Timeline",
    description: "Focus on timeline and event stream inspectors.",
    panels: Object.freeze({
      enabled: Object.freeze([
        "inspector-timeline",
        "inspector-event-stream"
      ]),
      disabled: Object.freeze([
        "inspector-entity",
        "inspector-component",
        "inspector-state-diff"
      ]),
      order: Object.freeze([
        "inspector-timeline",
        "inspector-event-stream"
      ])
    })
  }),
  Object.freeze({
    presetId: "preset.inspectors.state",
    title: "State Diff",
    description: "Focus on state and component snapshots.",
    panels: Object.freeze({
      enabled: Object.freeze([
        "inspector-state-diff",
        "inspector-component",
        "inspector-entity"
      ]),
      disabled: Object.freeze([
        "inspector-timeline",
        "inspector-event-stream"
      ]),
      order: Object.freeze([
        "inspector-state-diff",
        "inspector-component",
        "inspector-entity"
      ])
    })
  })
]);

export function registerAdvancedInspectorDebugPresets(presetRegistry, source = "advanced.inspectors") {
  if (!presetRegistry || typeof presetRegistry.registerPreset !== "function") {
    return [];
  }

  const ordered = ADVANCED_INSPECTOR_DEBUG_PRESETS
    .slice()
    .sort((left, right) => left.presetId.localeCompare(right.presetId));

  return ordered.map((descriptor) => presetRegistry.registerPreset(descriptor, source));
}
