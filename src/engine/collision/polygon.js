/*
Toolbox Aid
David Quesenberry
03/22/2026
polygon.js
*/
const POLYGON_COLLISION_EPSILON = 0.000001;

function isFinitePolygonPoint(point) {
  return Number.isFinite(point?.x) && Number.isFinite(point?.y);
}

function arePolygonPointsEqual(left, right) {
  return Math.abs(left.x - right.x) <= POLYGON_COLLISION_EPSILON
    && Math.abs(left.y - right.y) <= POLYGON_COLLISION_EPSILON;
}

function normalizePolygon(points) {
  if (!Array.isArray(points)) {
    return [];
  }

  const polygon = points
    .filter(isFinitePolygonPoint)
    .map((point) => ({ x: point.x, y: point.y }));

  if (polygon.length > 1 && arePolygonPointsEqual(polygon[0], polygon[polygon.length - 1])) {
    polygon.pop();
  }

  return polygon;
}

function polygonCross(start, end, point) {
  return ((end.x - start.x) * (point.y - start.y)) - ((end.y - start.y) * (point.x - start.x));
}

function isPointOnPolygonSegment(point, start, end) {
  if (Math.abs(polygonCross(start, end, point)) > POLYGON_COLLISION_EPSILON) {
    return false;
  }

  return point.x >= Math.min(start.x, end.x) - POLYGON_COLLISION_EPSILON
    && point.x <= Math.max(start.x, end.x) + POLYGON_COLLISION_EPSILON
    && point.y >= Math.min(start.y, end.y) - POLYGON_COLLISION_EPSILON
    && point.y <= Math.max(start.y, end.y) + POLYGON_COLLISION_EPSILON;
}

function arePolygonSegmentsIntersecting(leftStart, leftEnd, rightStart, rightEnd) {
  const leftStartToRightStart = polygonCross(leftStart, leftEnd, rightStart);
  const leftStartToRightEnd = polygonCross(leftStart, leftEnd, rightEnd);
  const rightStartToLeftStart = polygonCross(rightStart, rightEnd, leftStart);
  const rightStartToLeftEnd = polygonCross(rightStart, rightEnd, leftEnd);

  if (isPointOnPolygonSegment(rightStart, leftStart, leftEnd)
    || isPointOnPolygonSegment(rightEnd, leftStart, leftEnd)
    || isPointOnPolygonSegment(leftStart, rightStart, rightEnd)
    || isPointOnPolygonSegment(leftEnd, rightStart, rightEnd)) {
    return true;
  }

  return ((leftStartToRightStart > POLYGON_COLLISION_EPSILON && leftStartToRightEnd < -POLYGON_COLLISION_EPSILON)
      || (leftStartToRightStart < -POLYGON_COLLISION_EPSILON && leftStartToRightEnd > POLYGON_COLLISION_EPSILON))
    && ((rightStartToLeftStart > POLYGON_COLLISION_EPSILON && rightStartToLeftEnd < -POLYGON_COLLISION_EPSILON)
      || (rightStartToLeftStart < -POLYGON_COLLISION_EPSILON && rightStartToLeftEnd > POLYGON_COLLISION_EPSILON));
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
  if (!isFinitePolygonPoint(point)) {
    return false;
  }

  const normalizedPolygon = normalizePolygon(polygon);
  if (normalizedPolygon.length < 3) {
    return false;
  }

  let inside = false;

  for (let index = 0, previousIndex = normalizedPolygon.length - 1; index < normalizedPolygon.length; previousIndex = index, index += 1) {
    const current = normalizedPolygon[index];
    const previous = normalizedPolygon[previousIndex];

    if (isPointOnPolygonSegment(point, previous, current)) {
      return true;
    }

    const crossesRay = (current.y > point.y) !== (previous.y > point.y);
    if (crossesRay) {
      const rayX = ((previous.x - current.x) * (point.y - current.y)) / (previous.y - current.y) + current.x;
      if (point.x < rayX) {
        inside = !inside;
      }
    }
  }

  return inside;
}

export function arePolygonsColliding(leftPoints, rightPoints) {
  const leftPolygon = normalizePolygon(leftPoints);
  const rightPolygon = normalizePolygon(rightPoints);

  if (leftPolygon.length < 3 || rightPolygon.length < 3) {
    return false;
  }

  for (let leftIndex = 0; leftIndex < leftPolygon.length; leftIndex += 1) {
    const leftStart = leftPolygon[leftIndex];
    const leftEnd = leftPolygon[(leftIndex + 1) % leftPolygon.length];

    for (let rightIndex = 0; rightIndex < rightPolygon.length; rightIndex += 1) {
      if (arePolygonSegmentsIntersecting(
        leftStart,
        leftEnd,
        rightPolygon[rightIndex],
        rightPolygon[(rightIndex + 1) % rightPolygon.length]
      )) {
        return true;
      }
    }
  }

  for (const point of leftPolygon) {
    if (isPointInPolygon(point, rightPolygon)) {
      return true;
    }
  }

  for (const point of rightPolygon) {
    if (isPointInPolygon(point, leftPolygon)) {
      return true;
    }
  }

  return false;
}
