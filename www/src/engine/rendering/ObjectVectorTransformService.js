import { isRecord } from "../../shared/object/objects.js";
import { asFiniteNumber } from "../../shared/number/numbers.js";

const DEGREES_PER_RADIAN = 180 / Math.PI;
const RADIANS_PER_DEGREE = Math.PI / 180;
const DEFAULT_OBJECT_VECTOR_BOUNDS = Object.freeze({ height: 80, width: 120, x: -60, y: -40 });

function rotationUnit(value, fallback = "radians") {
  const normalized = String(value || fallback).trim().toLowerCase();
  return normalized === "degrees" || normalized === "radians" ? normalized : fallback;
}

function transformScaleValue(value, fallback = 1) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function inverseScaleValue(value) {
  const parsed = transformScaleValue(value, 1);
  return parsed === 0 ? 1 : parsed;
}

export class ObjectVectorTransformService {
  rotationRadians(value, unit = "radians") {
    const rotation = asFiniteNumber(value);
    return rotationUnit(unit) === "degrees" ? rotation * RADIANS_PER_DEGREE : rotation;
  }

  rotationDegrees(value, unit = "radians") {
    const rotation = asFiniteNumber(value);
    return rotationUnit(unit) === "radians" ? rotation * DEGREES_PER_RADIAN : rotation;
  }

  normalizeRotationDegrees(value) {
    if (!Number.isFinite(value)) {
      return value;
    }
    const normalized = ((value % 360) + 360) % 360;
    return Number(normalized.toFixed(3));
  }

  normalizeTransform(transform = {}) {
    const source = isRecord(transform) ? transform : {};
    return {
      rotation: asFiniteNumber(source.rotation),
      scaleX: transformScaleValue(source.scaleX, 1),
      scaleY: transformScaleValue(source.scaleY, 1),
      x: asFiniteNumber(source.x),
      y: asFiniteNumber(source.y)
    };
  }

  normalizeOrigin(origin = {}) {
    if (!isRecord(origin) || !Number.isFinite(Number(origin.x)) || !Number.isFinite(Number(origin.y))) {
      return { x: 0, y: 0 };
    }
    return {
      x: Number(origin.x),
      y: Number(origin.y)
    };
  }

  rotatePointAround(point, pivot, rotation, unit = "degrees") {
    const radians = this.rotationRadians(rotation, unit);
    const origin = this.normalizeOrigin(pivot);
    const relativeX = asFiniteNumber(point?.x) - origin.x;
    const relativeY = asFiniteNumber(point?.y) - origin.y;
    return {
      x: origin.x + relativeX * Math.cos(radians) - relativeY * Math.sin(radians),
      y: origin.y + relativeX * Math.sin(radians) + relativeY * Math.cos(radians)
    };
  }

  transformShapePoint(point, transform = {}, origin = {}) {
    const resolvedTransform = this.normalizeTransform(transform);
    const resolvedOrigin = this.normalizeOrigin(origin);
    const relativeX = (asFiniteNumber(point?.x) - resolvedOrigin.x) * resolvedTransform.scaleX;
    const relativeY = (asFiniteNumber(point?.y) - resolvedOrigin.y) * resolvedTransform.scaleY;
    const radians = this.rotationRadians(resolvedTransform.rotation, "degrees");
    const rotatedX = relativeX * Math.cos(radians) - relativeY * Math.sin(radians);
    const rotatedY = relativeX * Math.sin(radians) + relativeY * Math.cos(radians);
    return {
      x: resolvedTransform.x + resolvedOrigin.x + rotatedX,
      y: resolvedTransform.y + resolvedOrigin.y + rotatedY
    };
  }

  transformShapePoints(points, transform = {}, origin = {}) {
    return (Array.isArray(points) ? points : []).map((point) => this.transformShapePoint(point, transform, origin));
  }

  inverseTransformShapePoint(point, transform = {}, origin = {}) {
    const resolvedTransform = this.normalizeTransform(transform);
    const resolvedOrigin = this.normalizeOrigin(origin);
    const radians = this.rotationRadians(resolvedTransform.rotation, "degrees");
    const dx = asFiniteNumber(point?.x) - resolvedTransform.x - resolvedOrigin.x;
    const dy = asFiniteNumber(point?.y) - resolvedTransform.y - resolvedOrigin.y;
    const unrotatedX = dx * Math.cos(radians) + dy * Math.sin(radians);
    const unrotatedY = -dx * Math.sin(radians) + dy * Math.cos(radians);
    return {
      x: resolvedOrigin.x + unrotatedX / inverseScaleValue(resolvedTransform.scaleX),
      y: resolvedOrigin.y + unrotatedY / inverseScaleValue(resolvedTransform.scaleY)
    };
  }

  transformInstancePoint(point, instance = {}, options = {}) {
    return this.transformRuntimePoint(point, {
      rotation: instance?.rotation,
      rotationUnit: instance?.rotationUnit || options.rotationUnit || "degrees",
      scale: instance?.scale ?? 1,
      scaleX: instance?.scaleX ?? instance?.scale ?? 1,
      scaleY: instance?.scaleY ?? instance?.scale ?? 1,
      x: instance?.x,
      y: instance?.y
    });
  }

  transformInstancePoints(points, instance = {}, options = {}) {
    return (Array.isArray(points) ? points : []).map((point) => this.transformInstancePoint(point, instance, options));
  }

  transformRuntimePoint(point, {
    rotation = 0,
    rotationUnit: unit = "radians",
    scale = 1,
    scaleX = scale,
    scaleY = scale,
    x = 0,
    y = 0
  } = {}) {
    const radians = this.rotationRadians(rotation, unit);
    const resolvedScaleX = transformScaleValue(scaleX, 1);
    const resolvedScaleY = transformScaleValue(scaleY, 1);
    return {
      x: asFiniteNumber(x) + (asFiniteNumber(point?.x) * resolvedScaleX) * Math.cos(radians) - (asFiniteNumber(point?.y) * resolvedScaleY) * Math.sin(radians),
      y: asFiniteNumber(y) + (asFiniteNumber(point?.x) * resolvedScaleX) * Math.sin(radians) + (asFiniteNumber(point?.y) * resolvedScaleY) * Math.cos(radians)
    };
  }

  transformRuntimePoints(points, options = {}) {
    return (Array.isArray(points) ? points : []).map((point) => this.transformRuntimePoint(point, options));
  }

  boundsCornerPoints(bounds = {}) {
    const x = asFiniteNumber(bounds.x);
    const y = asFiniteNumber(bounds.y);
    const width = asFiniteNumber(bounds.width, 1);
    const height = asFiniteNumber(bounds.height, 1);
    return [
      { x, y },
      { x: x + width, y },
      { x: x + width, y: y + height },
      { x, y: y + height }
    ];
  }

  boundsFromPoints(points, fallback = DEFAULT_OBJECT_VECTOR_BOUNDS) {
    const normalizedPoints = (Array.isArray(points) ? points : [])
      .map((point) => ({ x: Number(point?.x), y: Number(point?.y) }))
      .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
    if (!normalizedPoints.length) {
      return { ...fallback };
    }
    const xValues = normalizedPoints.map((point) => point.x);
    const yValues = normalizedPoints.map((point) => point.y);
    const minX = Math.min(...xValues);
    const minY = Math.min(...yValues);
    const maxX = Math.max(...xValues);
    const maxY = Math.max(...yValues);
    const width = Math.max(1, maxX - minX);
    const height = Math.max(1, maxY - minY);
    return {
      height,
      originX: minX + width / 2,
      originY: minY + height / 2,
      width,
      x: minX,
      y: minY
    };
  }

  transformedShapeBounds(points, transform = {}, origin = {}) {
    return this.boundsFromPoints(this.transformShapePoints(points, transform, origin));
  }

  combineBounds(boundsList, fallback = DEFAULT_OBJECT_VECTOR_BOUNDS) {
    const points = (Array.isArray(boundsList) ? boundsList : []).flatMap((bounds) => this.boundsCornerPoints(bounds));
    return this.boundsFromPoints(points, fallback);
  }

  createPipeline({
    instance = {},
    objectOrigin = {},
    screenTransform = null,
    shapeTransform = {}
  } = {}) {
    const origin = this.normalizeOrigin(objectOrigin);
    const transform = this.normalizeTransform(shapeTransform);
    const localPointToShape = (point) => this.transformShapePoint(point, transform, origin);
    const localPointsToShape = (points) => this.transformShapePoints(points, transform, origin);
    const shapePointToWorld = (point) => this.transformInstancePoint(point, instance);
    const shapePointsToWorld = (points) => this.transformInstancePoints(points, instance);
    const worldPointToViewport = (point) => (
      typeof screenTransform?.worldPointToViewportPoint === "function"
        ? screenTransform.worldPointToViewportPoint(point)
        : point
    );
    const localPointToWorld = (point) => shapePointToWorld(localPointToShape(point));
    const localPointsToWorld = (points) => shapePointsToWorld(localPointsToShape(points));
    const localPointToViewport = (point) => worldPointToViewport(localPointToWorld(point));
    const localPointsToViewport = (points) => localPointsToWorld(points).map((point) => worldPointToViewport(point));
    const originWorld = () => shapePointToWorld(origin);
    const originViewport = () => worldPointToViewport(originWorld());

    return Object.freeze({
      localPointToShape,
      localPointToViewport,
      localPointToWorld,
      localPointsToShape,
      localPointsToViewport,
      localPointsToWorld,
      origin,
      originViewport,
      originWorld,
      shapeBounds: (points) => this.transformedShapeBounds(points, transform, origin),
      shapeTransform: transform,
      viewportBounds: (points) => this.boundsFromPoints(localPointsToViewport(points)),
      worldBounds: (points) => this.boundsFromPoints(localPointsToWorld(points))
    });
  }

  svgTransformAttribute(transform = {}, origin = {}) {
    const resolvedTransform = this.normalizeTransform(transform);
    const resolvedOrigin = this.normalizeOrigin(origin);
    return [
      `translate(${resolvedTransform.x} ${resolvedTransform.y})`,
      `translate(${resolvedOrigin.x} ${resolvedOrigin.y})`,
      `rotate(${resolvedTransform.rotation})`,
      `scale(${resolvedTransform.scaleX} ${resolvedTransform.scaleY})`,
      `translate(${-resolvedOrigin.x} ${-resolvedOrigin.y})`
    ].join(" ");
  }

  applyCanvasTransform(context, transform = {}, origin = {}) {
    const resolvedTransform = this.normalizeTransform(transform);
    const resolvedOrigin = this.normalizeOrigin(origin);
    context.translate(resolvedTransform.x, resolvedTransform.y);
    context.translate(resolvedOrigin.x, resolvedOrigin.y);
    context.rotate(this.rotationRadians(resolvedTransform.rotation, "degrees"));
    context.scale(resolvedTransform.scaleX, resolvedTransform.scaleY);
    context.translate(-resolvedOrigin.x, -resolvedOrigin.y);
  }

  headingPointFromRotation(origin = {}, rotation = 0, {
    length = 34,
    rotationUnit: unit = "degrees"
  } = {}) {
    const resolvedOrigin = this.normalizeOrigin(origin);
    const radians = this.rotationRadians(rotation, unit);
    return {
      x: resolvedOrigin.x + Math.cos(radians) * asFiniteNumber(length, 34),
      y: resolvedOrigin.y + Math.sin(radians) * asFiniteNumber(length, 34)
    };
  }
}

export const objectVectorTransformService = new ObjectVectorTransformService();
