function finiteOrZero(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

/**
 * Clamps a number between inclusive bounds.
 *
 * @param {number} value Value to clamp.
 * @param {number} min Inclusive minimum.
 * @param {number} max Inclusive maximum.
 * @returns {number} Clamped value.
 */
export function clamp(value, min, max) {
  const low = Math.min(finiteOrZero(min), finiteOrZero(max));
  const high = Math.max(finiteOrZero(min), finiteOrZero(max));
  return Math.max(low, Math.min(finiteOrZero(value), high));
}

/**
 * Creates a 2D vector.
 *
 * @param {number} x X coordinate.
 * @param {number} y Y coordinate.
 * @returns {{x: number, y: number}} Vector.
 */
export function vector2(x = 0, y = 0) {
  return { x: finiteOrZero(x), y: finiteOrZero(y) };
}

export function addVectors(a, b) {
  return vector2(finiteOrZero(a?.x) + finiteOrZero(b?.x), finiteOrZero(a?.y) + finiteOrZero(b?.y));
}

export function subtractVectors(a, b) {
  return vector2(finiteOrZero(a?.x) - finiteOrZero(b?.x), finiteOrZero(a?.y) - finiteOrZero(b?.y));
}

export function scaleVector(vector, scale = 1) {
  return vector2(finiteOrZero(vector?.x) * finiteOrZero(scale), finiteOrZero(vector?.y) * finiteOrZero(scale));
}

export function distance(a, b) {
  const dx = finiteOrZero(a?.x) - finiteOrZero(b?.x);
  const dy = finiteOrZero(a?.y) - finiteOrZero(b?.y);
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Creates a normalized rectangle with non-negative dimensions.
 *
 * @param {number} x Left coordinate.
 * @param {number} y Top coordinate.
 * @param {number} width Width.
 * @param {number} height Height.
 * @returns {{x: number, y: number, width: number, height: number, right: number, bottom: number}} Rectangle.
 */
export function rectangle(x = 0, y = 0, width = 0, height = 0) {
  const startX = finiteOrZero(x);
  const startY = finiteOrZero(y);
  const resolvedWidth = finiteOrZero(width);
  const resolvedHeight = finiteOrZero(height);
  const left = resolvedWidth < 0 ? startX + resolvedWidth : startX;
  const top = resolvedHeight < 0 ? startY + resolvedHeight : startY;
  const normalizedWidth = Math.abs(resolvedWidth);
  const normalizedHeight = Math.abs(resolvedHeight);
  return {
    x: left,
    y: top,
    width: normalizedWidth,
    height: normalizedHeight,
    right: left + normalizedWidth,
    bottom: top + normalizedHeight,
  };
}

export function containsPoint(rect, point) {
  const box = rectangle(rect?.x, rect?.y, rect?.width, rect?.height);
  const x = finiteOrZero(point?.x);
  const y = finiteOrZero(point?.y);
  return x >= box.x && x <= box.right && y >= box.y && y <= box.bottom;
}

export function rectanglesIntersect(a, b) {
  const first = rectangle(a?.x, a?.y, a?.width, a?.height);
  const second = rectangle(b?.x, b?.y, b?.width, b?.height);
  return first.x <= second.right && first.right >= second.x && first.y <= second.bottom && first.bottom >= second.y;
}

export function rectangleIntersection(a, b) {
  if (!rectanglesIntersect(a, b)) {
    return null;
  }

  const first = rectangle(a?.x, a?.y, a?.width, a?.height);
  const second = rectangle(b?.x, b?.y, b?.width, b?.height);
  const x = Math.max(first.x, second.x);
  const y = Math.max(first.y, second.y);
  return rectangle(x, y, Math.min(first.right, second.right) - x, Math.min(first.bottom, second.bottom) - y);
}

export function boundsFromPoints(points) {
  if (!Array.isArray(points) || points.length === 0) {
    return rectangle(0, 0, 0, 0);
  }

  const xs = points.map((point) => finiteOrZero(point?.x));
  const ys = points.map((point) => finiteOrZero(point?.y));
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  return rectangle(minX, minY, Math.max(...xs) - minX, Math.max(...ys) - minY);
}
