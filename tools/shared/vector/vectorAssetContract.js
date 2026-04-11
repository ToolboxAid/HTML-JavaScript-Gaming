import { parseSvgPathData } from "./vectorGeometryMath.js";
import { toFiniteNumber, roundNumber } from "../../../src/shared/math/numberNormalization.js";
import { cloneJson } from "../../../src/shared/utils/jsonUtils.js";
import { sanitizeVectorText } from "./vectorSafeValueUtils.js";

export const VECTOR_ASSET_FORMAT = "toolbox.vector.asset";
export const VECTOR_ASSET_VERSION = 1;

const SUPPORTED_PRIMITIVES = Object.freeze([
  "line",
  "rectangle",
  "ellipse",
  "polyline",
  "polygon",
  "path"
]);

const SUPPORTED_STROKE_JOINS = new Set(["miter", "round", "bevel"]);
const SUPPORTED_STROKE_CAPS = new Set(["butt", "round", "square"]);
const COLOR_PATTERN = /^#[0-9A-F]{6}([0-9A-F]{2})?$/;

export function parseViewBoxString(viewBox) {
  const parts = sanitizeVectorText(viewBox).split(/\s+/).map((value) => Number(value));
  if (parts.length !== 4 || parts.some((value) => !Number.isFinite(value))) {
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    };
  }
  return {
    x: roundNumber(parts[0]),
    y: roundNumber(parts[1]),
    width: roundNumber(parts[2]),
    height: roundNumber(parts[3])
  };
}

export function createDefaultVectorOrigin(viewport) {
  const normalizedViewport = normalizeViewport(viewport);
  return {
    name: "center",
    x: roundNumber(normalizedViewport.x + normalizedViewport.width / 2),
    y: roundNumber(normalizedViewport.y + normalizedViewport.height / 2)
  };
}

function normalizeViewport(viewport) {
  if (typeof viewport === "string") {
    return parseViewBoxString(viewport);
  }
  const source = viewport && typeof viewport === "object" ? viewport : {};
  return {
    x: roundNumber(toFiniteNumber(source.x, 0)),
    y: roundNumber(toFiniteNumber(source.y, 0)),
    width: roundNumber(toFiniteNumber(source.width, 0)),
    height: roundNumber(toFiniteNumber(source.height, 0))
  };
}

function normalizeOrigin(origin, viewport) {
  const fallback = createDefaultVectorOrigin(viewport);
  const source = origin && typeof origin === "object" ? origin : {};
  return {
    name: sanitizeVectorText(source.name) || fallback.name,
    x: roundNumber(toFiniteNumber(source.x, fallback.x)),
    y: roundNumber(toFiniteNumber(source.y, fallback.y))
  };
}

function normalizeAnchor(anchor, index) {
  const source = anchor && typeof anchor === "object" ? anchor : {};
  return {
    name: sanitizeVectorText(source.name) || `anchor-${index + 1}`,
    x: roundNumber(toFiniteNumber(source.x, 0)),
    y: roundNumber(toFiniteNumber(source.y, 0))
  };
}

function normalizeColor(value) {
  const color = sanitizeVectorText(value).toUpperCase();
  return COLOR_PATTERN.test(color) ? color : color;
}

function normalizeStroke(stroke) {
  if (!stroke || typeof stroke !== "object") {
    return null;
  }
  return {
    color: normalizeColor(stroke.color),
    width: roundNumber(toFiniteNumber(stroke.width, 1)),
    opacity: roundNumber(toFiniteNumber(stroke.opacity, 1)),
    join: sanitizeVectorText(stroke.join) || "miter",
    cap: sanitizeVectorText(stroke.cap) || "butt"
  };
}

function normalizeFill(fill) {
  if (!fill || typeof fill !== "object") {
    return null;
  }
  return {
    color: normalizeColor(fill.color),
    opacity: roundNumber(toFiniteNumber(fill.opacity, 1))
  };
}

function normalizePoint(point) {
  const source = point && typeof point === "object" ? point : {};
  return {
    x: roundNumber(toFiniteNumber(source.x, 0)),
    y: roundNumber(toFiniteNumber(source.y, 0))
  };
}

function normalizePoints(points) {
  return (Array.isArray(points) ? points : []).map((point) => normalizePoint(point));
}

function normalizeShapeGeometry(shape) {
  const source = shape && typeof shape === "object" ? shape : {};
  const type = sanitizeVectorText(source.type).toLowerCase();
  if (type === "line") {
    return {
      x1: roundNumber(toFiniteNumber(source.x1, 0)),
      y1: roundNumber(toFiniteNumber(source.y1, 0)),
      x2: roundNumber(toFiniteNumber(source.x2, 0)),
      y2: roundNumber(toFiniteNumber(source.y2, 0))
    };
  }
  if (type === "rectangle") {
    return {
      x: roundNumber(toFiniteNumber(source.x, 0)),
      y: roundNumber(toFiniteNumber(source.y, 0)),
      width: roundNumber(toFiniteNumber(source.width, 0)),
      height: roundNumber(toFiniteNumber(source.height, 0))
    };
  }
  if (type === "ellipse") {
    return {
      cx: roundNumber(toFiniteNumber(source.cx, 0)),
      cy: roundNumber(toFiniteNumber(source.cy, 0)),
      rx: roundNumber(toFiniteNumber(source.rx, 0)),
      ry: roundNumber(toFiniteNumber(source.ry, 0))
    };
  }
  if (type === "polyline" || type === "polygon") {
    return {
      points: normalizePoints(source.points)
    };
  }
  if (type === "path") {
    return {
      d: sanitizeVectorText(source.d)
    };
  }
  return {};
}

function normalizeShape(shape, layerId, index) {
  const source = shape && typeof shape === "object" ? shape : {};
  const type = sanitizeVectorText(source.type).toLowerCase();
  return {
    id: sanitizeVectorText(source.id) || `${layerId}.shape-${String(index + 1).padStart(3, "0")}`,
    name: sanitizeVectorText(source.name) || sanitizeVectorText(source.id) || `${type || "shape"}-${index + 1}`,
    type,
    visible: source.visible !== false,
    stroke: normalizeStroke(source.stroke),
    fill: normalizeFill(source.fill),
    ...normalizeShapeGeometry(source)
  };
}

function normalizeLayer(layer, index) {
  const source = layer && typeof layer === "object" ? layer : {};
  const layerId = sanitizeVectorText(source.id) || `layer-${String(index + 1).padStart(2, "0")}`;
  return {
    id: layerId,
    name: sanitizeVectorText(source.name) || layerId,
    visible: source.visible !== false,
    style: {
      stroke: normalizeStroke(source.style?.stroke),
      fill: normalizeFill(source.style?.fill)
    },
    shapes: (Array.isArray(source.shapes) ? source.shapes : []).map((shape, shapeIndex) => normalizeShape(shape, layerId, shapeIndex))
  };
}

function hasLegacyGeometryPaths(asset) {
  return Array.isArray(asset?.geometry?.paths) && asset.geometry.paths.length > 0;
}

function normalizeLegacyLayer(asset) {
  const hasStroke = asset?.style?.stroke === true;
  const hasFill = asset?.style?.fill === true;
  const stroke = hasStroke
    ? {
      color: "#FFFFFFFF",
      width: 1,
      opacity: 1,
      join: "miter",
      cap: "butt"
    }
    : null;
  const fill = hasFill
    ? {
      color: "#FFFFFFFF",
      opacity: 1
    }
    : null;

  return [
    {
      id: "layer-01",
      name: "default",
      visible: true,
      style: {
        stroke: null,
        fill: null
      },
      shapes: asset.geometry.paths.map((pathEntry, index) => ({
        id: `layer-01.shape-${String(index + 1).padStart(3, "0")}`,
        name: `path-${index + 1}`,
        type: "path",
        visible: true,
        d: sanitizeVectorText(pathEntry?.d || pathEntry),
        stroke: cloneJson(stroke),
        fill: cloneJson(fill)
      }))
    }
  ];
}

export function normalizeVectorAssetContract(asset, options = {}) {
  const source = asset && typeof asset === "object" ? cloneJson(asset) : {};
  const isLegacy = options.allowLegacy !== false && hasLegacyGeometryPaths(source);
  const viewport = normalizeViewport(isLegacy ? source?.geometry?.viewBox : source?.viewport);
  const origin = normalizeOrigin(source?.origin, viewport);
  const layers = isLegacy
    ? normalizeLegacyLayer(source)
    : (Array.isArray(source?.layers) ? source.layers : []).map((layer, index) => normalizeLayer(layer, index));

  return {
    format: sanitizeVectorText(source.format) || (isLegacy ? VECTOR_ASSET_FORMAT : ""),
    version: Number.isFinite(source.version) ? source.version : (isLegacy ? VECTOR_ASSET_VERSION : NaN),
    assetId: sanitizeVectorText(source.assetId) || sanitizeVectorText(source.id),
    id: sanitizeVectorText(source.id) || sanitizeVectorText(source.assetId),
    name: sanitizeVectorText(source.name) || sanitizeVectorText(source.assetId) || sanitizeVectorText(source.id),
    type: "vector",
    path: sanitizeVectorText(source.path),
    paletteId: sanitizeVectorText(source.paletteId),
    sourceTool: sanitizeVectorText(source.sourceTool) || "vector-asset-studio",
    source: {
      kind: sanitizeVectorText(source?.source?.kind),
      path: sanitizeVectorText(source?.source?.path) || sanitizeVectorText(source.path)
    },
    viewport,
    origin,
    anchors: (Array.isArray(source.anchors) ? source.anchors : []).map((anchor, index) => normalizeAnchor(anchor, index)),
    layers,
    metadata: {
      ...(source.metadata && typeof source.metadata === "object" ? source.metadata : {}),
      normalizedFromLegacy: isLegacy === true
    }
  };
}

function pushIssue(issues, category, message) {
  issues.push({
    category,
    message: sanitizeVectorText(message)
  });
}

function validateStylePayload(style, issues, styleName) {
  if (!style) {
    return;
  }
  if (!COLOR_PATTERN.test(sanitizeVectorText(style.color).toUpperCase())) {
    pushIssue(issues, "style", `${styleName} color must use #RRGGBB or #RRGGBBAA format.`);
  }
  if (styleName === "stroke") {
    if (!Number.isFinite(style.width) || style.width < 0) {
      pushIssue(issues, "style", "Stroke width must be a non-negative number.");
    }
    if (!SUPPORTED_STROKE_JOINS.has(style.join)) {
      pushIssue(issues, "style", "Stroke join must be miter, round, or bevel.");
    }
    if (!SUPPORTED_STROKE_CAPS.has(style.cap)) {
      pushIssue(issues, "style", "Stroke cap must be butt, round, or square.");
    }
  }
  if (!Number.isFinite(style.opacity) || style.opacity < 0 || style.opacity > 1) {
    pushIssue(issues, "style", `${styleName} opacity must be between 0 and 1.`);
  }
}

function validateLayerAndShapeStructure(layers, issues) {
  if (!Array.isArray(layers) || layers.length === 0) {
    pushIssue(issues, "geometry", "Vector assets must define at least one layer.");
    return;
  }

  let visibleShapeCount = 0;

  layers.forEach((layer) => {
    if (!sanitizeVectorText(layer?.id)) {
      pushIssue(issues, "geometry", "Every vector layer must define a stable id.");
    }
    const layerShapes = Array.isArray(layer?.shapes) ? layer.shapes : [];
    if (layerShapes.length === 0) {
      pushIssue(issues, "geometry", `Layer ${sanitizeVectorText(layer?.id) || "layer"} must contain at least one shape.`);
      return;
    }

    validateStylePayload(layer?.style?.stroke, issues, "stroke");
    validateStylePayload(layer?.style?.fill, issues, "fill");

    layerShapes.forEach((shape) => {
      if (!SUPPORTED_PRIMITIVES.includes(shape?.type)) {
        pushIssue(issues, "geometry", `Unsupported vector primitive ${sanitizeVectorText(shape?.type) || "unknown"}.`);
        return;
      }
      if (shape.visible !== false) {
        visibleShapeCount += 1;
      }

      validateStylePayload(shape?.stroke, issues, "stroke");
      validateStylePayload(shape?.fill, issues, "fill");
      if (!shape?.stroke && !shape?.fill && !layer?.style?.stroke && !layer?.style?.fill) {
        pushIssue(issues, "style", `Shape ${sanitizeVectorText(shape?.id) || "shape"} must resolve to a stroke or fill.`);
      }

      switch (shape.type) {
        case "line":
          ["x1", "y1", "x2", "y2"].forEach((key) => {
            if (!Number.isFinite(shape?.[key])) {
              pushIssue(issues, "geometry", `Line shape ${sanitizeVectorText(shape?.id)} is missing ${key}.`);
            }
          });
          break;
        case "rectangle":
          if (!Number.isFinite(shape?.width) || shape.width <= 0 || !Number.isFinite(shape?.height) || shape.height <= 0) {
            pushIssue(issues, "geometry", `Rectangle shape ${sanitizeVectorText(shape?.id)} must declare positive width and height.`);
          }
          break;
        case "ellipse":
          if (!Number.isFinite(shape?.rx) || shape.rx <= 0 || !Number.isFinite(shape?.ry) || shape.ry <= 0) {
            pushIssue(issues, "geometry", `Ellipse shape ${sanitizeVectorText(shape?.id)} must declare positive rx and ry.`);
          }
          break;
        case "polyline":
          if (!Array.isArray(shape?.points) || shape.points.length < 2) {
            pushIssue(issues, "geometry", `Polyline shape ${sanitizeVectorText(shape?.id)} must declare at least two points.`);
          }
          break;
        case "polygon":
          if (!Array.isArray(shape?.points) || shape.points.length < 3) {
            pushIssue(issues, "geometry", `Polygon shape ${sanitizeVectorText(shape?.id)} must declare at least three points.`);
          }
          break;
        case "path":
          if (!sanitizeVectorText(shape?.d)) {
            pushIssue(issues, "geometry", `Path shape ${sanitizeVectorText(shape?.id)} must declare path data.`);
            break;
          }
          try {
            const parsed = parseSvgPathData(shape.d);
            if (parsed.points.length === 0) {
              pushIssue(issues, "geometry", `Path shape ${sanitizeVectorText(shape?.id)} must produce at least one point.`);
            }
          } catch (error) {
            pushIssue(issues, "geometry", error instanceof Error ? error.message : `Path shape ${sanitizeVectorText(shape?.id)} is invalid.`);
          }
          break;
        default:
          break;
      }
    });
  });

  if (visibleShapeCount === 0) {
    pushIssue(issues, "geometry", "Vector assets must expose at least one visible shape.");
  }
}

export function inspectVectorAssetContract(asset, options = {}) {
  const normalizedAsset = normalizeVectorAssetContract(asset, options);
  const issues = [];

  if (normalizedAsset.format !== VECTOR_ASSET_FORMAT) {
    pushIssue(issues, "geometry", `Vector asset format must be ${VECTOR_ASSET_FORMAT}.`);
  }
  if (normalizedAsset.version !== VECTOR_ASSET_VERSION) {
    pushIssue(issues, "geometry", `Vector asset version must be ${VECTOR_ASSET_VERSION}.`);
  }
  if (!sanitizeVectorText(normalizedAsset.assetId)) {
    pushIssue(issues, "geometry", "Vector assetId is required.");
  }
  if (normalizedAsset.source.kind !== "svg") {
    pushIssue(issues, "source", "Vector assets must declare source.kind as svg.");
  }
  if (!sanitizeVectorText(normalizedAsset.source.path)) {
    pushIssue(issues, "source", "Vector assets must declare a normalized project-relative source path.");
  }
  if (!Number.isFinite(normalizedAsset.viewport.width) || normalizedAsset.viewport.width <= 0
    || !Number.isFinite(normalizedAsset.viewport.height) || normalizedAsset.viewport.height <= 0) {
    pushIssue(issues, "geometry", "Vector viewport must define positive width and height.");
  }
  if (!Number.isFinite(normalizedAsset.origin.x) || !Number.isFinite(normalizedAsset.origin.y)) {
    pushIssue(issues, "geometry", "Vector origin must declare finite x and y coordinates.");
  }

  const anchorNames = new Set();
  normalizedAsset.anchors.forEach((anchor) => {
    if (!sanitizeVectorText(anchor?.name)) {
      pushIssue(issues, "geometry", "Vector anchors must define names.");
      return;
    }
    if (anchorNames.has(anchor.name)) {
      pushIssue(issues, "geometry", `Duplicate anchor name ${anchor.name}.`);
    }
    anchorNames.add(anchor.name);
    if (!Number.isFinite(anchor.x) || !Number.isFinite(anchor.y)) {
      pushIssue(issues, "geometry", `Anchor ${anchor.name} must declare finite coordinates.`);
    }
  });

  validateLayerAndShapeStructure(normalizedAsset.layers, issues);

  return {
    asset: normalizedAsset,
    issues
  };
}

export function validateVectorAssetContract(asset, options = {}) {
  return inspectVectorAssetContract(asset, options).issues;
}
