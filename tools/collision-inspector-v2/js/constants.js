import { asFiniteNumber } from "../../../src/shared/number/index.js";
export { deepClone as clone } from "../../../src/shared/utils/jsonUtils.js";

export const OBJECT_LABELS = Object.freeze({
  a: "Object A",
  b: "Object B"
});

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
