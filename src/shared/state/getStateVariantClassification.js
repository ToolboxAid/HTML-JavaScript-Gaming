/*
Toolbox Aid
David Quesenberry
04/14/2026
getStateVariantClassification.js
*/
const GET_STATE_VARIANT_PATTERN = /\b(get(?:[A-Z][A-Za-z0-9_]*)?State[A-Za-z0-9_]*)\b/g;

export function classifyGetStateVariantDomain(name) {
  const normalized = String(name || "");
  if (/^getSimulationState/i.test(normalized)) {
    return "simulation";
  }
  if (/^getReplayState/i.test(normalized)) {
    return "replay";
  }
  if (/^getEditorState/i.test(normalized)) {
    return "editor";
  }
  return "other";
}

export function classifyGetStateVariantLayer(filePath) {
  const normalized = String(filePath || "").replaceAll("\\", "/");
  if (normalized.startsWith("samples/")) {
    return "sample";
  }
  if (normalized.startsWith("tools/")) {
    return "tool";
  }
  if (normalized.startsWith("src/") || normalized.startsWith("games/")) {
    return "runtime";
  }
  return "other";
}

export function extractGetStateVariantNames(sourceText) {
  const text = String(sourceText || "");
  const matches = text.match(GET_STATE_VARIANT_PATTERN) || [];
  return Array.from(new Set(matches));
}

export function bucketGetStateVariants(entries = []) {
  const byDomain = {
    simulation: [],
    replay: [],
    editor: [],
    other: [],
  };

  const byLayer = {
    sample: [],
    tool: [],
    runtime: [],
    other: [],
  };

  const all = [];

  entries.forEach((entry) => {
    const name = String(entry?.name || "");
    const filePath = String(entry?.filePath || "");
    const domain = classifyGetStateVariantDomain(name);
    const layer = classifyGetStateVariantLayer(filePath);
    const classified = { name, filePath, domain, layer };
    byDomain[domain].push(classified);
    byLayer[layer].push(classified);
    all.push(classified);
  });

  return { byDomain, byLayer, all };
}
