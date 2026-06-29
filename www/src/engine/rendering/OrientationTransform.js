import { objectVectorTransformService } from "./ObjectVectorTransformService.js";

export function rotationRadians(value, unit = "radians") {
  return objectVectorTransformService.rotationRadians(value, unit);
}

export function rotationDegrees(value, unit = "radians") {
  return objectVectorTransformService.rotationDegrees(value, unit);
}

export function normalizeRotationDegrees(value) {
  return objectVectorTransformService.normalizeRotationDegrees(value);
}

export function normalizeObjectVectorTransform(transform = {}) {
  return objectVectorTransformService.normalizeTransform(transform);
}

export function normalizeObjectVectorOrigin(origin = {}) {
  return objectVectorTransformService.normalizeOrigin(origin);
}

export function rotatePointAround(point, pivot, rotation, unit = "degrees") {
  return objectVectorTransformService.rotatePointAround(point, pivot, rotation, unit);
}

export function transformObjectVectorShapePoint(point, transform = {}, origin = {}) {
  return objectVectorTransformService.transformShapePoint(point, transform, origin);
}

export function transformObjectVectorShapePoints(points, transform = {}, origin = {}) {
  return objectVectorTransformService.transformShapePoints(points, transform, origin);
}

export function inverseTransformObjectVectorShapePoint(point, transform = {}, origin = {}) {
  return objectVectorTransformService.inverseTransformShapePoint(point, transform, origin);
}

export function transformObjectVectorInstancePoint(point, instance = {}, options = {}) {
  return objectVectorTransformService.transformInstancePoint(point, instance, options);
}

export function transformObjectVectorInstancePoints(points, instance = {}, options = {}) {
  return objectVectorTransformService.transformInstancePoints(points, instance, options);
}

export function transformRuntimeOrientedPoint(point, options = {}) {
  return objectVectorTransformService.transformRuntimePoint(point, options);
}

export function transformRuntimeOrientedPoints(points, options = {}) {
  return objectVectorTransformService.transformRuntimePoints(points, options);
}

export function objectVectorBoundsCornerPoints(bounds = {}) {
  return objectVectorTransformService.boundsCornerPoints(bounds);
}

export function boundsFromObjectVectorPoints(points, fallback) {
  return objectVectorTransformService.boundsFromPoints(points, fallback);
}

export function transformedObjectVectorShapeBounds(points, transform = {}, origin = {}) {
  return objectVectorTransformService.transformedShapeBounds(points, transform, origin);
}

export function combineObjectVectorBounds(boundsList, fallback) {
  return objectVectorTransformService.combineBounds(boundsList, fallback);
}

export function createObjectVectorTransformPipeline(options = {}) {
  return objectVectorTransformService.createPipeline(options);
}

export function objectVectorSvgTransformAttribute(transform = {}, origin = {}) {
  return objectVectorTransformService.svgTransformAttribute(transform, origin);
}

export function applyObjectVectorCanvasTransform(context, transform = {}, origin = {}) {
  objectVectorTransformService.applyCanvasTransform(context, transform, origin);
}

export function headingPointFromRotation(origin = {}, rotation = 0, options = {}) {
  return objectVectorTransformService.headingPointFromRotation(origin, rotation, options);
}
