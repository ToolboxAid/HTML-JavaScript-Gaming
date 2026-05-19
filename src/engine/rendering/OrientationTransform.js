const DEGREES_PER_RADIAN = 180 / Math.PI;
const RADIANS_PER_DEGREE = Math.PI / 180;

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function numberValue(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

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

export function rotationRadians(value, unit = "radians") {
  const rotation = numberValue(value);
  return rotationUnit(unit) === "degrees" ? rotation * RADIANS_PER_DEGREE : rotation;
}

export function rotationDegrees(value, unit = "radians") {
  const rotation = numberValue(value);
  return rotationUnit(unit) === "radians" ? rotation * DEGREES_PER_RADIAN : rotation;
}

export function normalizeRotationDegrees(value) {
  if (!Number.isFinite(value)) {
    return value;
  }
  const normalized = ((value % 360) + 360) % 360;
  return Number(normalized.toFixed(3));
}

export function normalizeObjectVectorTransform(transform = {}) {
  const source = isRecord(transform) ? transform : {};
  return {
    rotation: numberValue(source.rotation),
    scaleX: transformScaleValue(source.scaleX, 1),
    scaleY: transformScaleValue(source.scaleY, 1),
    x: numberValue(source.x),
    y: numberValue(source.y)
  };
}

export function normalizeObjectVectorOrigin(origin = {}) {
  if (!isRecord(origin) || !Number.isFinite(Number(origin.x)) || !Number.isFinite(Number(origin.y))) {
    return { x: 0, y: 0 };
  }
  return {
    x: Number(origin.x),
    y: Number(origin.y)
  };
}

export function rotatePointAround(point, pivot, rotation, unit = "degrees") {
  const radians = rotationRadians(rotation, unit);
  const origin = normalizeObjectVectorOrigin(pivot);
  const relativeX = numberValue(point?.x) - origin.x;
  const relativeY = numberValue(point?.y) - origin.y;
  return {
    x: origin.x + relativeX * Math.cos(radians) - relativeY * Math.sin(radians),
    y: origin.y + relativeX * Math.sin(radians) + relativeY * Math.cos(radians)
  };
}

export function transformObjectVectorShapePoint(point, transform = {}, origin = {}) {
  const resolvedTransform = normalizeObjectVectorTransform(transform);
  const resolvedOrigin = normalizeObjectVectorOrigin(origin);
  const relativeX = (numberValue(point?.x) - resolvedOrigin.x) * resolvedTransform.scaleX;
  const relativeY = (numberValue(point?.y) - resolvedOrigin.y) * resolvedTransform.scaleY;
  const radians = rotationRadians(resolvedTransform.rotation, "degrees");
  const rotatedX = relativeX * Math.cos(radians) - relativeY * Math.sin(radians);
  const rotatedY = relativeX * Math.sin(radians) + relativeY * Math.cos(radians);
  return {
    x: resolvedTransform.x + resolvedOrigin.x + rotatedX,
    y: resolvedTransform.y + resolvedOrigin.y + rotatedY
  };
}

export function inverseTransformObjectVectorShapePoint(point, transform = {}, origin = {}) {
  const resolvedTransform = normalizeObjectVectorTransform(transform);
  const resolvedOrigin = normalizeObjectVectorOrigin(origin);
  const radians = rotationRadians(resolvedTransform.rotation, "degrees");
  const dx = numberValue(point?.x) - resolvedTransform.x - resolvedOrigin.x;
  const dy = numberValue(point?.y) - resolvedTransform.y - resolvedOrigin.y;
  const unrotatedX = dx * Math.cos(radians) + dy * Math.sin(radians);
  const unrotatedY = -dx * Math.sin(radians) + dy * Math.cos(radians);
  return {
    x: resolvedOrigin.x + unrotatedX / inverseScaleValue(resolvedTransform.scaleX),
    y: resolvedOrigin.y + unrotatedY / inverseScaleValue(resolvedTransform.scaleY)
  };
}

export function transformObjectVectorInstancePoint(point, instance = {}, options = {}) {
  return transformRuntimeOrientedPoint(point, {
    rotation: instance?.rotation,
    rotationUnit: instance?.rotationUnit || options.rotationUnit || "degrees",
    scale: instance?.scale ?? 1,
    scaleX: instance?.scaleX ?? instance?.scale ?? 1,
    scaleY: instance?.scaleY ?? instance?.scale ?? 1,
    x: instance?.x,
    y: instance?.y
  });
}

export function transformRuntimeOrientedPoint(point, {
  rotation = 0,
  rotationUnit = "radians",
  scale = 1,
  scaleX = scale,
  scaleY = scale,
  x = 0,
  y = 0
} = {}) {
  const radians = rotationRadians(rotation, rotationUnit);
  const resolvedScaleX = transformScaleValue(scaleX, 1);
  const resolvedScaleY = transformScaleValue(scaleY, 1);
  return {
    x: numberValue(x) + (numberValue(point?.x) * resolvedScaleX) * Math.cos(radians) - (numberValue(point?.y) * resolvedScaleY) * Math.sin(radians),
    y: numberValue(y) + (numberValue(point?.x) * resolvedScaleX) * Math.sin(radians) + (numberValue(point?.y) * resolvedScaleY) * Math.cos(radians)
  };
}

export function transformRuntimeOrientedPoints(points, options = {}) {
  return (Array.isArray(points) ? points : []).map((point) => transformRuntimeOrientedPoint(point, options));
}

export function objectVectorSvgTransformAttribute(transform = {}, origin = {}) {
  const resolvedTransform = normalizeObjectVectorTransform(transform);
  const resolvedOrigin = normalizeObjectVectorOrigin(origin);
  return [
    `translate(${resolvedTransform.x} ${resolvedTransform.y})`,
    `translate(${resolvedOrigin.x} ${resolvedOrigin.y})`,
    `rotate(${resolvedTransform.rotation})`,
    `scale(${resolvedTransform.scaleX} ${resolvedTransform.scaleY})`,
    `translate(${-resolvedOrigin.x} ${-resolvedOrigin.y})`
  ].join(" ");
}

export function applyObjectVectorCanvasTransform(context, transform = {}, origin = {}) {
  const resolvedTransform = normalizeObjectVectorTransform(transform);
  const resolvedOrigin = normalizeObjectVectorOrigin(origin);
  context.translate(resolvedTransform.x, resolvedTransform.y);
  context.translate(resolvedOrigin.x, resolvedOrigin.y);
  context.rotate(rotationRadians(resolvedTransform.rotation, "degrees"));
  context.scale(resolvedTransform.scaleX, resolvedTransform.scaleY);
  context.translate(-resolvedOrigin.x, -resolvedOrigin.y);
}

export function headingPointFromRotation(origin = {}, rotation = 0, {
  length = 34,
  rotationUnit = "degrees"
} = {}) {
  const resolvedOrigin = normalizeObjectVectorOrigin(origin);
  const radians = rotationRadians(rotation, rotationUnit);
  return {
    x: resolvedOrigin.x + Math.cos(radians) * numberValue(length, 34),
    y: resolvedOrigin.y + Math.sin(radians) * numberValue(length, 34)
  };
}
