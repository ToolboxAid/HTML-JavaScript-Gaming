/*
Toolbox Aid
David Quesenberry
03/27/2026
geometry.js
*/
export function pointInRect(point, rect) {
  return !!(
    point &&
    rect &&
    point.x >= rect.x &&
    point.y >= rect.y &&
    point.x <= rect.x + rect.w &&
    point.y <= rect.y + rect.h
  );
}

export function xyInRect(x, y, rect) {
  return pointInRect({ x, y }, rect);
}

export function getCenteredRect(containerRect, width, height, verticalBias = 0.5) {
  return {
    x: containerRect.x + Math.floor((containerRect.width - width) * 0.5),
    y: containerRect.y + Math.floor((containerRect.height - height) * verticalBias),
    w: width,
    h: height
  };
}

export function normalizePoints(points) {
  return Array.isArray(points)
    ? points.map((point) => ({
      x: Number(point?.x ?? 0),
      y: Number(point?.y ?? 0),
    })).filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y))
    : [];
}

export function centerPoints(points) {
  if (!points.length) {
    return [];
  }
  const xs = points.map(({ x }) => x);
  const ys = points.map(({ y }) => y);
  const centerX = (Math.min(...xs) + Math.max(...xs)) / 2;
  const centerY = (Math.min(...ys) + Math.max(...ys)) / 2;
  return points.map(({ x, y }) => ({
    x: x - centerX,
    y: y - centerY,
  }));
}

export function maxRadius(points) {
  if (!points.length) {
    return 0;
  }
  return Math.max(...points.map(({ x, y }) => Math.sqrt(x * x + y * y)));
}
