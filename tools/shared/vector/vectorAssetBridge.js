import { createAssetId, normalizeProjectRelativePath } from "../projectAssetRegistry.js";
import {
  VECTOR_ASSET_FORMAT,
  VECTOR_ASSET_VERSION,
  createDefaultVectorOrigin,
  parseViewBoxString
} from "./vectorAssetContract.js";

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
  const pathCount = Array.isArray(asset?.geometry?.paths)
    ? asset.geometry.paths.length
    : (Array.isArray(asset?.layers)
      ? asset.layers.reduce((total, layer) => total + (Array.isArray(layer?.shapes) ? layer.shapes.length : 0), 0)
      : 0);
  return `Vector asset ${sanitizeText(asset?.id) || "vector"} ready with ${pathCount} path${pathCount === 1 ? "" : "s"}.`;
}

export function normalizeSvgToVectorAsset(options = {}) {
  const svgText = sanitizeText(options.svgText);
  const id = sanitizeText(options.id) || createAssetId("vector", options.name || "asset", "asset");
  const path = normalizeProjectRelativePath(options.path);
  const geometryPaths = extractPathData(svgText);
  const viewport = parseViewBoxString(extractViewBox(svgText));
  const origin = createDefaultVectorOrigin(viewport);
  const stroke = options.style?.stroke !== false
    ? {
      color: "#FFFFFFFF",
      width: 1,
      opacity: 1,
      join: "miter",
      cap: "butt"
    }
    : null;
  const fill = options.style?.fill === true
    ? {
      color: "#FFFFFFFF",
      opacity: 1
    }
    : null;

  return {
    format: VECTOR_ASSET_FORMAT,
    version: VECTOR_ASSET_VERSION,
    assetId: id,
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
    viewport,
    origin,
    anchors: [
      {
        name: "center",
        x: origin.x,
        y: origin.y
      }
    ],
    layers: [
      {
        id: "layer-01",
        name: "default",
        visible: true,
        style: {
          stroke: null,
          fill: null
        },
        shapes: geometryPaths.map((pathEntry, index) => ({
          id: `layer-01.shape-${String(index + 1).padStart(3, "0")}`,
          name: `path-${index + 1}`,
          type: "path",
          visible: true,
          d: pathEntry.d,
          stroke,
          fill
        }))
      }
    ],
    metadata: {
      authoringBridge: "svg-import"
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
