/*
Toolbox Aid
David Quesenberry
05/19/2026
objectVector.js
*/
import { isColliding } from './aabb.js';
import { arePolygonsColliding, getPolygonBounds, isPointInPolygon } from './polygon.js';
import { areMasksColliding, createRasterMask } from './raster.js';
import {
  createObjectVectorTransformPipeline,
  normalizeObjectVectorOrigin,
  normalizeObjectVectorTransform,
  transformRuntimeOrientedPoints,
} from '../rendering/OrientationTransform.js';
import { isRecord } from '../../shared/object/objects.js';
import { deepClone } from '../../shared/json/clone.js';
import { asFiniteNumber } from '../../shared/number/numbers.js';

export const OBJECT_VECTOR_COLLISION_ENGINE_PATH = 'src/engine/collision/objectVector.js';
export const OBJECT_VECTOR_COLLISION_MODES = Object.freeze(['bounds', 'vector', 'pixel-sprite', 'hybrid']);
export const OBJECT_VECTOR_COLLISION_MODE_LABELS = Object.freeze({
  bounds: 'Bounds',
  hybrid: 'Hybrid',
  'pixel-sprite': 'Pixel/Sprite',
  vector: 'Vector',
});

const MODE_ALIASES = Object.freeze({
  pixel: 'pixel-sprite',
  sprite: 'pixel-sprite',
});
const POLYGON_SAMPLE_COUNT = 28;
const DEFAULT_MASK_CELL_SIZE = 4;

function normalizePoint(point) {
  return {
    x: asFiniteNumber(point?.x),
    y: asFiniteNumber(point?.y),
  };
}

function normalizePoints(points) {
  return Array.isArray(points)
    ? points.map(normalizePoint)
    : [];
}

function shapeTool(shape) {
  const tool = String(shape?.tool || '').trim().toLowerCase();
  if (tool === 'triangle') {
    return 'polygon';
  }
  if (tool === 'square') {
    return 'rectangle';
  }
  return tool;
}

function sortedShapes(object) {
  return [...(Array.isArray(object?.shapes) ? object.shapes : [])]
    .sort((left, right) => asFiniteNumber(left?.order) - asFiniteNumber(right?.order));
}

function sortedFrames(state) {
  return [...(Array.isArray(state?.frames) ? state.frames : [])]
    .sort((left, right) => asFiniteNumber(left?.order) - asFiniteNumber(right?.order));
}

function firstObjectFrame(object, preferredStateIds = ['active', 'idle']) {
  const states = Array.isArray(object?.states) ? object.states : [];
  const preferred = states.find((state) => preferredStateIds.includes(String(state?.id || '').trim().toLowerCase()))
    || states[0]
    || null;
  return sortedFrames(preferred)[0] || null;
}

function shapeTransform(shape) {
  return normalizeObjectVectorTransform(shape?.transform);
}

export function getObjectVectorOrigin(object) {
  return normalizeObjectVectorOrigin(object?.objectOrigin);
}

function effectiveShapeForFrame(shape, frame, shapeIndex) {
  const effective = deepClone(shape);
  const override = Array.isArray(frame?.shapeOverrides)
    ? frame.shapeOverrides.find((entry) => entry.shapeIndex === shapeIndex)
    : null;
  if (override && Object.prototype.hasOwnProperty.call(override, 'visible')) {
    effective.visible = override.visible;
  }
  if (isRecord(override?.transform)) {
    effective.transform = { ...effective.transform, ...override.transform };
  }
  return effective;
}

function rectanglePoints(x, y, width, height) {
  return [
    { x, y },
    { x: x + width, y },
    { x: x + width, y: y + height },
    { x, y: y + height },
  ];
}

function ellipsePoints(cx, cy, rx, ry, count = POLYGON_SAMPLE_COUNT) {
  return Array.from({ length: count }, (_, index) => {
    const angle = (Math.PI * 2 * index) / count;
    return {
      x: cx + Math.cos(angle) * rx,
      y: cy + Math.sin(angle) * ry,
    };
  });
}

function segmentPolygon(start, end, width) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy);
  if (length <= 0) {
    const radius = Math.max(1, width / 2);
    return rectanglePoints(start.x - radius, start.y - radius, radius * 2, radius * 2);
  }
  const nx = (-dy / length) * (width / 2);
  const ny = (dx / length) * (width / 2);
  return [
    { x: start.x + nx, y: start.y + ny },
    { x: end.x + nx, y: end.y + ny },
    { x: end.x - nx, y: end.y - ny },
    { x: start.x - nx, y: start.y - ny },
  ];
}

function shapeLocalOutlinePoints(shape) {
  const geometry = isRecord(shape?.geometry) ? shape.geometry : {};
  const tool = shapeTool(shape);
  if (tool === 'polygon' || tool === 'polyline') {
    return normalizePoints(geometry.points);
  }
  if (tool === 'line') {
    return normalizePoints([geometry.point1, geometry.point2]);
  }
  return [];
}

function shapeLocalPolygons(shape) {
  const geometry = isRecord(shape?.geometry) ? shape.geometry : {};
  const tool = shapeTool(shape);
  if (tool === 'rectangle') {
    return [rectanglePoints(asFiniteNumber(geometry.x), asFiniteNumber(geometry.y), asFiniteNumber(geometry.width, 1), asFiniteNumber(geometry.height, 1))];
  }
  if (tool === 'polygon') {
    const points = normalizePoints(geometry.points);
    return points.length >= 3 ? [points] : [];
  }
  if (tool === 'polyline') {
    const points = normalizePoints(geometry.points);
    const strokeWidth = Math.max(2, asFiniteNumber(shape?.style?.strokeWidth, 2));
    return points.slice(1).map((point, index) => segmentPolygon(points[index], point, strokeWidth));
  }
  if (tool === 'line') {
    const strokeWidth = Math.max(2, asFiniteNumber(shape?.style?.strokeWidth, 2));
    return [segmentPolygon(
      normalizePoint(geometry.point1),
      normalizePoint(geometry.point2),
      strokeWidth
    )];
  }
  if (tool === 'circle') {
    const radius = Math.max(1, asFiniteNumber(geometry.r, 1));
    return [ellipsePoints(asFiniteNumber(geometry.cx), asFiniteNumber(geometry.cy), radius, radius)];
  }
  if (tool === 'ellipse') {
    return [ellipsePoints(asFiniteNumber(geometry.cx), asFiniteNumber(geometry.cy), Math.max(1, asFiniteNumber(geometry.rx, 1)), Math.max(1, asFiniteNumber(geometry.ry, 1)))];
  }
  return [];
}

export function transformCollisionPoints(points, {
  x = 0,
  y = 0,
  rotation = 0,
  rotationUnit = 'radians',
  scale = 1,
  scaleX = scale,
  scaleY = scale,
} = {}) {
  return transformRuntimeOrientedPoints(normalizePoints(points), {
    rotation,
    rotationUnit,
    scale,
    scaleX,
    scaleY,
    x,
    y,
  });
}

function boundsFromPoints(points) {
  if (!Array.isArray(points) || !points.length) {
    return { x: 0, y: 0, width: 1, height: 1 };
  }
  return getPolygonBounds(points);
}

function boundsFromPolygons(polygons) {
  const points = polygons.flat();
  if (!points.length) {
    return { x: 0, y: 0, width: 1, height: 1 };
  }
  const bounds = boundsFromPoints(points);
  return {
    x: bounds.x,
    y: bounds.y,
    width: Math.max(1, bounds.width),
    height: Math.max(1, bounds.height),
  };
}

function anyPolygonsCollide(leftPolygons, rightPolygons) {
  return leftPolygons.some((left) => rightPolygons.some((right) => arePolygonsColliding(left, right)));
}

function maskFromPolygons(polygons, bounds, cellSize) {
  const width = Math.max(1, Math.ceil(bounds.width / cellSize) + 2);
  const height = Math.max(1, Math.ceil(bounds.height / cellSize) + 2);
  const rows = Array.from({ length: height }, () => Array.from({ length: width }, () => 0));
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const point = {
        x: bounds.x + x * cellSize + cellSize / 2,
        y: bounds.y + y * cellSize + cellSize / 2,
      };
      rows[y][x] = polygons.some((polygon) => isPointInPolygon(point, polygon)) ? 1 : 0;
    }
  }
  return createRasterMask(rows, { cellSize });
}

function intersectionRect(left, right) {
  const x = Math.max(left.x, right.x);
  const y = Math.max(left.y, right.y);
  const width = Math.min(left.x + left.width, right.x + right.width) - x;
  const height = Math.min(left.y + left.height, right.y + right.height) - y;
  return width > 0 && height > 0 ? { x, y, width, height } : null;
}

function visibleEffectiveShapes(object, options = {}) {
  const frame = firstObjectFrame(object, options.preferredStateIds);
  return sortedShapes(object)
    .map((shape, shapeIndex) => effectiveShapeForFrame(shape, frame, shapeIndex))
    .filter((shape) => shape.visible !== false);
}

export function getObjectVectorCollisionOutlinePoints(object, options = {}) {
  const origin = getObjectVectorOrigin(object);
  const shape = visibleEffectiveShapes(object, options).find((candidate) => {
    const tool = shapeTool(candidate);
    return tool === 'polygon' || tool === 'polyline';
  }) || visibleEffectiveShapes(object, options).find((candidate) => shapeTool(candidate) === 'line');
  return createObjectVectorTransformPipeline({
    objectOrigin: origin,
    shapeTransform: shapeTransform(shape)
  }).localPointsToShape(shapeLocalOutlinePoints(shape));
}

export function createObjectVectorCollisionGeometry(object, instance = {}, options = {}) {
  const origin = getObjectVectorOrigin(object);
  const polygons = visibleEffectiveShapes(object, options)
    .flatMap((shape) => {
      const pipeline = createObjectVectorTransformPipeline({
        instance,
        objectOrigin: origin,
        shapeTransform: shapeTransform(shape)
      });
      return shapeLocalPolygons(shape)
        .map((polygon) => pipeline.localPointsToWorld(polygon))
        .filter((polygon) => polygon.length >= 3);
    });
  const bounds = boundsFromPolygons(polygons);
  const maskCellSize = Math.max(1, asFiniteNumber(options.maskCellSize, DEFAULT_MASK_CELL_SIZE));
  return {
    bounds,
    hasGeometry: polygons.length > 0,
    instance: { ...instance },
    mask: maskFromPolygons(polygons, bounds, maskCellSize),
    object,
    origin,
    originWorld: object ? createObjectVectorTransformPipeline({ instance, objectOrigin: origin }).originWorld() : { x: 0, y: 0 },
    polygons,
    shapeRotations: [...new Set(visibleEffectiveShapes(object, options).map((shape) => shapeTransform(shape).rotation))],
    transformedPoints: polygons.flat(),
  };
}

export function normalizeObjectVectorCollisionMode(mode) {
  const rawMode = String(mode || '').trim().toLowerCase();
  const normalized = MODE_ALIASES[rawMode] || rawMode;
  return OBJECT_VECTOR_COLLISION_MODES.includes(normalized) ? normalized : 'auto';
}

export function recommendObjectVectorCollisionMode(objectA, objectB, options = {}) {
  const geometryA = createObjectVectorCollisionGeometry(objectA, {}, options);
  const geometryB = createObjectVectorCollisionGeometry(objectB, {}, options);
  return geometryA.hasGeometry && geometryB.hasGeometry ? 'vector' : 'bounds';
}

export function evaluateObjectVectorCollisionPair({
  instanceA = {},
  instanceB = {},
  maskCellSize = DEFAULT_MASK_CELL_SIZE,
  mode = 'auto',
  objectA = null,
  objectB = null,
} = {}) {
  const geometryA = createObjectVectorCollisionGeometry(objectA, instanceA, { maskCellSize });
  const geometryB = createObjectVectorCollisionGeometry(objectB, instanceB, { maskCellSize });
  const recommendedMode = geometryA.hasGeometry && geometryB.hasGeometry ? 'vector' : 'bounds';
  const activeMode = normalizeObjectVectorCollisionMode(mode) === 'auto'
    ? recommendedMode
    : normalizeObjectVectorCollisionMode(mode);
  const boundsOverlap = Boolean(objectA && objectB && geometryA.hasGeometry && geometryB.hasGeometry && isColliding(geometryA.bounds, geometryB.bounds));
  const vectorOverlap = boundsOverlap && anyPolygonsCollide(geometryA.polygons, geometryB.polygons);
  const pixelOverlap = boundsOverlap && areMasksColliding(
    geometryA.mask,
    geometryA.bounds.x,
    geometryA.bounds.y,
    geometryB.mask,
    geometryB.bounds.x,
    geometryB.bounds.y
  );
  const modeCollision = {
    bounds: boundsOverlap,
    hybrid: boundsOverlap && vectorOverlap && pixelOverlap,
    'pixel-sprite': pixelOverlap,
    vector: vectorOverlap,
  };

  return {
    boundsOverlap,
    collided: modeCollision[activeMode] === true,
    enginePath: OBJECT_VECTOR_COLLISION_ENGINE_PATH,
    geometryA,
    geometryB,
    mode: activeMode,
    modeLabel: OBJECT_VECTOR_COLLISION_MODE_LABELS[activeMode] || 'Vector',
    overlapBounds: boundsOverlap ? intersectionRect(geometryA.bounds, geometryB.bounds) : null,
    pixelOverlap,
    recommendedMode,
    vectorOverlap,
  };
}
