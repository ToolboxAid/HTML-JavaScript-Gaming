export const OBJECT_LABELS = Object.freeze({
  a: "Object A",
  b: "Object B"
});

export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function labelForObject(object) {
  return `${object?.name || "Object"} (${object?.id || "unknown"})`;
}

export function numberValue(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isNaN(parsed) || Math.abs(parsed) === Infinity ? fallback : parsed;
}

export function roundNumber(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(numberValue(value) * factor) / factor;
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
