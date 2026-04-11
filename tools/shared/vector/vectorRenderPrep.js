import { cloneJson } from '../../../src/shared/utils/jsonUtils.js';
import { sanitizeVectorText } from "./vectorSafeValueUtils.js";

import {
  combineBounds,
  computeBoundsFromPoints,
  createPoint,
  parseSvgPathData,
  transformPoints
} from "./vectorGeometryMath.js";

function sampleEllipsePoints(shape, segments = 16) {
  const points = [];
  for (let index = 0; index < segments; index += 1) {
    const theta = (Math.PI * 2 * index) / segments;
    points.push(createPoint(
      shape.cx + Math.cos(theta) * shape.rx,
      shape.cy + Math.sin(theta) * shape.ry
    ));
  }
  return points;
}

function resolveStyle(layer, shape, styleKey) {
  return cloneJson(shape?.[styleKey] || layer?.style?.[styleKey] || null);
}

function createRenderableGeometry(shape) {
  switch (shape.type) {
    case "line":
      return {
        points: [createPoint(shape.x1, shape.y1), createPoint(shape.x2, shape.y2)],
        closed: false
      };
    case "rectangle":
      return {
        points: [
          createPoint(shape.x, shape.y),
          createPoint(shape.x + shape.width, shape.y),
          createPoint(shape.x + shape.width, shape.y + shape.height),
          createPoint(shape.x, shape.y + shape.height)
        ],
        closed: true
      };
    case "ellipse":
      return {
        points: sampleEllipsePoints(shape),
        closed: true,
        ellipse: {
          center: createPoint(shape.cx, shape.cy),
          rx: shape.rx,
          ry: shape.ry
        }
      };
    case "polyline":
      return {
        points: shape.points.map((point) => createPoint(point?.x, point?.y)),
        closed: false
      };
    case "polygon":
      return {
        points: shape.points.map((point) => createPoint(point?.x, point?.y)),
        closed: true
      };
    case "path": {
      const parsed = parseSvgPathData(shape.d);
      return {
        points: parsed.points.map((point) => createPoint(point?.x, point?.y)),
        closed: parsed.closed,
        commands: parsed.commands
      };
    }
    default:
      return {
        points: [],
        closed: false
      };
  }
}

function createCollisionPrimitive(shape, transformedPoints, bounds, geometry) {
  if (shape.type === "ellipse") {
    return {
      type: "ellipse",
      shapeId: sanitizeVectorText(shape?.id),
      points: transformedPoints,
      bounds,
      ellipse: geometry.ellipse
    };
  }

  if (shape.type === "line" || shape.type === "polyline") {
    return {
      type: "segments",
      shapeId: sanitizeVectorText(shape?.id),
      points: transformedPoints,
      bounds
    };
  }

  return {
    type: geometry.closed ? "polygon" : "polyline",
    shapeId: sanitizeVectorText(shape?.id),
    points: transformedPoints,
    bounds
  };
}

export function prepareVectorRenderables(asset, options = {}) {
  const transform = options.transform && typeof options.transform === "object" ? cloneJson(options.transform) : {};
  const origin = options.origin && typeof options.origin === "object"
    ? createPoint(options.origin?.x, options.origin?.y)
    : createPoint(asset?.origin?.x, asset?.origin?.y);
  const renderables = [];
  const collisionPrimitives = [];
  let drawOrder = 0;

  (Array.isArray(asset?.layers) ? asset.layers : []).forEach((layer) => {
    if (layer?.visible === false) {
      return;
    }

    (Array.isArray(layer?.shapes) ? layer.shapes : []).forEach((shape) => {
      if (shape?.visible === false) {
        return;
      }
      const geometry = createRenderableGeometry(shape);
      const transformedPoints = transformPoints(geometry.points, transform, origin);
      const bounds = computeBoundsFromPoints(transformedPoints);
      const renderable = {
        assetId: sanitizeVectorText(asset?.assetId),
        layerId: sanitizeVectorText(layer?.id),
        id: sanitizeVectorText(shape?.id),
        name: sanitizeVectorText(shape?.name),
        primitive: sanitizeVectorText(shape?.type),
        drawOrder,
        stroke: resolveStyle(layer, shape, "stroke"),
        fill: resolveStyle(layer, shape, "fill"),
        points: transformedPoints,
        closed: geometry.closed === true,
        bounds
      };
      if (shape.type === "path") {
        renderable.path = {
          d: sanitizeVectorText(shape?.d),
          commands: geometry.commands || []
        };
      }
      if (geometry.ellipse) {
        renderable.ellipse = cloneJson(geometry.ellipse);
      }
      renderables.push(renderable);
      collisionPrimitives.push(createCollisionPrimitive(shape, transformedPoints, bounds, geometry));
      drawOrder += 1;
    });
  });

  return {
    renderables,
    collisionPrimitives,
    bounds: combineBounds(renderables.map((renderable) => renderable.bounds))
  };
}
