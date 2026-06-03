/*
Toolbox Aid
David Quesenberry
04/05/2026
registerStandardPanelGroups.js
*/

export const STANDARD_PANEL_GROUPS = Object.freeze([
  Object.freeze({
    groupId: "group.input",
    title: "Input",
    description: "Input and immediate runtime interaction diagnostics.",
    panelIds: Object.freeze([
      "runtime-summary",
      "input-summary"
    ])
  }),
  Object.freeze({
    groupId: "group.qa",
    title: "QA",
    description: "Validation and hot-reload diagnostics for QA checks.",
    panelIds: Object.freeze([
      "runtime-summary",
      "frame-timing",
      "hotreload-status",
      "validation-warnings"
    ])
  }),
  Object.freeze({
    groupId: "group.rendering",
    title: "Rendering",
    description: "Render timing and stage diagnostics.",
    panelIds: Object.freeze([
      "runtime-summary",
      "frame-timing",
      "camera-state",
      "render-stage"
    ])
  }),
  Object.freeze({
    groupId: "group.scene",
    title: "Scene",
    description: "Scene and world object diagnostics.",
    panelIds: Object.freeze([
      "scene-identity",
      "entity-counts",
      "tilemap-summary"
    ])
  }),
  Object.freeze({
    groupId: "group.systems",
    title: "Systems",
    description: "Runtime systems, input, and validation health panels.",
    panelIds: Object.freeze([
      "runtime-summary",
      "input-summary",
      "hotreload-status",
      "validation-warnings"
    ])
  })
]);

export function registerStandardPanelGroups(groupRegistry, source = "standard") {
  if (!groupRegistry || typeof groupRegistry.registerGroup !== "function") {
    return [];
  }

  const descriptors = STANDARD_PANEL_GROUPS
    .slice()
    .sort((left, right) => left.groupId.localeCompare(right.groupId));

  return descriptors.map((descriptor) => {
    return groupRegistry.registerGroup(descriptor, source);
  });
}
