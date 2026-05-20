import { asFiniteNumber } from "../../../src/shared/number/index.js";

export const OBJECT_LABELS = Object.freeze({
  a: "Object A",
  b: "Object B"
});

export const COLLISION_ZOOM_DEFAULT = 1;
export const COLLISION_ZOOM_MAX = 10;
export const COLLISION_ZOOM_MIN = 0.1;

export function labelForObject(object) {
  return `${object?.name || "Object"} (${object?.id || "unknown"})`;
}

export function roundNumber(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(asFiniteNumber(value) * factor) / factor;
}

export function roundPoint(point) {
  return {
    x: roundNumber(point?.x),
    y: roundNumber(point?.y)
  };
}

export function roundBounds(bounds) {
  return {
    x: roundNumber(bounds?.x),
    y: roundNumber(bounds?.y),
    width: roundNumber(bounds?.width),
    height: roundNumber(bounds?.height)
  };
}

export function clampCollisionZoom(zoom) {
  return Math.max(COLLISION_ZOOM_MIN, Math.min(COLLISION_ZOOM_MAX, asFiniteNumber(zoom, COLLISION_ZOOM_DEFAULT)));
}

export function percentToCollisionZoom(percent) {
  return clampCollisionZoom(asFiniteNumber(percent, COLLISION_ZOOM_DEFAULT * 100) / 100);
}

export function collisionZoomToPercent(zoom) {
  return Math.round(clampCollisionZoom(zoom) * 100);
}
