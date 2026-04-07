/*
Toolbox Aid
David Quesenberry
03/22/2026
polygon.js
*/
function projectPolygon(points, axis) {
  let min = Infinity;
  let max = -Infinity;

  for (const point of points) {
    const projection = (point.x * axis.x) + (point.y * axis.y);
    min = Math.min(min, projection);
    max = Math.max(max, projection);
  }

  return { min, max };
}

function getAxes(points) {
  const axes = [];

  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    const edge = {
      x: next.x - current.x,
      y: next.y - current.y,
    };
    const normal = {
      x: -edge.y,
      y: edge.x,
    };
    const length = Math.hypot(normal.x, normal.y) || 1;
    axes.push({
      x: normal.x / length,
      y: normal.y / length,
    });
  }

  return axes;
}

export function getPolygonBounds(points) {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  return {
    x: Math.min(...xs),
    y: Math.min(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  };
}

export function isPointInPolygon(point, polygon) {
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    const intersects = ((yi > point.y) !== (yj > point.y))
      && (point.x < ((xj - xi) * (point.y - yi)) / ((yj - yi) || 0.00001) + xi);
    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

export function arePolygonsColliding(a, b) {
  const axes = [...getAxes(a), ...getAxes(b)];

  for (const axis of axes) {
    const projectionA = projectPolygon(a, axis);
    const projectionB = projectPolygon(b, axis);
    if (projectionA.max < projectionB.min || projectionB.max < projectionA.min) {
      return false;
    }
  }

  return true;
}
