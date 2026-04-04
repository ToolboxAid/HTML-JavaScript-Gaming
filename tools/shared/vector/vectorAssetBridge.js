import { createAssetId, normalizeProjectRelativePath } from "../projectAssetRegistry.js";

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function extractViewBox(svgText) {
  const match = svgText.match(/viewBox\s*=\s*"([^"]+)"/i);
  return sanitizeText(match?.[1]);
}

function extractPathData(svgText) {
  const matches = Array.from(svgText.matchAll(/<path\b[^>]*\sd\s*=\s*"([^"]+)"/gi));
  return matches
    .map((match) => sanitizeText(match[1]))
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right))
    .map((d) => ({ d }));
}

export function summarizeVectorAssetDefinition(asset) {
  const pathCount = Array.isArray(asset?.geometry?.paths) ? asset.geometry.paths.length : 0;
  return `Vector asset ${sanitizeText(asset?.id) || "vector"} ready with ${pathCount} path${pathCount === 1 ? "" : "s"}.`;
}

export function normalizeSvgToVectorAsset(options = {}) {
  const svgText = sanitizeText(options.svgText);
  const id = sanitizeText(options.id) || createAssetId("vector", options.name || "asset", "asset");
  const path = normalizeProjectRelativePath(options.path);
  const geometryPaths = extractPathData(svgText);

  return {
    id,
    name: sanitizeText(options.name) || id,
    path,
    type: "vector",
    paletteId: sanitizeText(options.paletteId),
    sourceTool: sanitizeText(options.sourceTool) || "vector-asset-studio",
    source: {
      kind: "svg",
      path
    },
    geometry: {
      viewBox: extractViewBox(svgText),
      paths: geometryPaths
    },
    style: {
      stroke: options.style?.stroke !== false,
      fill: options.style?.fill === true
    },
    assetRefs: options.assetRefs && typeof options.assetRefs === "object"
      ? JSON.parse(JSON.stringify(options.assetRefs))
      : {}
  };
}
