const EMPTY_TOOL_REGISTRY = Object.freeze([]);

export const TOOL_STATUS_MODEL = Object.freeze([
  "Ready",
  "Wireframe",
  "Under Construction",
  "Planned",
  "Hidden",
  "Deprecated",
]);

export const TOOL_RELEASE_CHANNELS = Object.freeze([
  "planned",
  "wireframe",
  "beta",
  "complete",
  "deprecated",
]);

export const TOOL_RELEASE_CHANNEL_LABELS = Object.freeze({
  planned: "Planned",
  wireframe: "Wireframe",
  beta: "Beta",
  complete: "Complete",
  deprecated: "Deprecated",
});

export const TOOL_RELEASE_CHANNEL_HELP_TEXT = Object.freeze({
  planned: "Not designed yet.\nNo meaningful UI.\nNo ownership defined.",
  wireframe: "Tool exists.\nUser can understand workflow.\nData ownership is defined.\nNot functionally usable.",
  beta: "Functionally usable.\nCan be used in a real game.\nMay still contain incomplete workflows, placeholder data, UI cleanup issues, unused fields, missing validation, or incomplete code review.",
  complete: "Functionally usable.\nCode reviewed.\nDead code removed.\nInvalid fields removed.\nUI cleaned up.\nNo known placeholder data.\nNo known invalid controls.\nReady for long-term support.",
  deprecated: "Tool remains supported but is not recommended for new workflows.\nMust remain deprecated before removal.",
});

export const TOOL_REGISTRY_REQUIRED_METADATA_FIELDS = Object.freeze([]);
export const TOOL_REGISTRY = EMPTY_TOOL_REGISTRY;
export const TOOL_IMAGE_BADGE_ROOT = "/assets/theme-v2/images/badges/";
export const TOOL_IMAGE_TOOL_ROOT = "/assets/theme-v2/images/tools/";
export const TOOL_IMAGE_FALLBACK = "/assets/theme-v2/images/image-missing.svg";
export const TOOL_IMAGE_SIZE_SUFFIX_PATTERN = /(?:-64|-1024|-\d+x\d+)(?=\.[a-z0-9]+(?:[?#].*)?$)/i;

function cloneList() {
  return [];
}

function normalizeReleaseChannel(value) {
  const channel = String(value?.releaseChannel || value || "").trim().toLowerCase();
  return TOOL_RELEASE_CHANNELS.includes(channel) ? channel : "planned";
}

export function getToolReleaseChannel(toolOrChannel) {
  return normalizeReleaseChannel(toolOrChannel);
}

export function getToolReleaseChannelLabel(toolOrChannel) {
  return TOOL_RELEASE_CHANNEL_LABELS[getToolReleaseChannel(toolOrChannel)] || TOOL_RELEASE_CHANNEL_LABELS.planned;
}

export function getToolReleaseChannelHelpText(toolOrChannel) {
  return TOOL_RELEASE_CHANNEL_HELP_TEXT[getToolReleaseChannel(toolOrChannel)] || TOOL_RELEASE_CHANNEL_HELP_TEXT.planned;
}

export function getToolRegistry() {
  return cloneList();
}

export function getActiveToolRegistry() {
  return cloneList();
}

export function getVisibleActiveToolRegistry() {
  return cloneList();
}

export function getToolById() {
  return null;
}

export function getToolBySlug() {
  return null;
}

export function getToolRoute() {
  return "";
}

export function getToolProgressReadiness() {
  return "No";
}

export function getToolImageSource() {
  return TOOL_IMAGE_FALLBACK;
}

export function getToolImageDiagnostics() {
  return ["Toolbox tool metadata is served through /api/toolbox/registry/snapshot."];
}

export function toolRegistryMetadataDiagnostic() {
  return "Toolbox tool metadata is DB-backed and unavailable from toolbox/toolRegistry.js.";
}

export function getToolRegistrySnapshot() {
  return {
    activeTools: [],
    imageFallback: TOOL_IMAGE_FALLBACK,
    tools: [],
  };
}
export function getToolImageCoverage() {
  return [];
}

export function getToolNavigationTargets() {
  return {
    next: {
      disabled: true,
      group: "",
      href: "",
      kind: "disabled",
      label: "No next tool",
    },
    previous: {
      disabled: true,
      group: "",
      href: "",
      kind: "disabled",
      label: "No previous tool",
    },
    tool: null,
  };
}
