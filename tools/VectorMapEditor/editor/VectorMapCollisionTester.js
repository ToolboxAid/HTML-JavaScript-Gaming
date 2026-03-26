/*
Toolbox Aid
David Quesenberry
03/26/2026
VectorMapCollisionTester.js
*/
function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = (a.z || 0) - (b.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function segmentIntersection(p1, p2, p3, p4) {
  const denominator = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
  if (Math.abs(denominator) < 1e-9) {
    return null;
  }

  const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / denominator;
  const u = ((p1.x - p3.x) * (p1.y - p2.y) - (p1.y - p3.y) * (p1.x - p2.x)) / denominator;

  if (t < 0 || t > 1 || u < 0 || u > 1) {
    return null;
  }

  return {
    t,
    u,
    point: {
      x: p1.x + t * (p2.x - p1.x),
      y: p1.y + t * (p2.y - p1.y),
      z: p1.z + t * ((p2.z || 0) - (p1.z || 0))
    }
  };
}

function isCollisionEnabled(flags = {}) {
  return Boolean(
    flags.collidable ||
    flags.deadly ||
    flags.trigger ||
    flags.spawnBlocker ||
    flags.projectileBlocker ||
    flags.playerOnly ||
    flags.enemyOnly ||
    (flags.tag && String(flags.tag).trim())
  );
}

function buildSegments(object) {
  const segments = [];
  const points = object.points || [];
  for (let index = 0; index < points.length - 1; index += 1) {
    segments.push([points[index], points[index + 1]]);
  }
  if (object.closed && points.length > 2) {
    segments.push([points[points.length - 1], points[0]]);
  }
  return segments;
}

export class VectorMapCollisionTester {
  test(documentModel, vector, mode = "2d") {
    if (!vector?.start || !vector?.end) {
      return null;
    }

    let bestHit = null;
    for (const object of documentModel.getObjects()) {
      if (object.space !== mode || !isCollisionEnabled(object.flags)) {
        continue;
      }

      for (const [start, end] of buildSegments(object)) {
        const hit = segmentIntersection(vector.start, vector.end, start, end);
        if (!hit) {
          continue;
        }
        const result = {
          objectId: object.id,
          objectName: object.name,
          point: hit.point,
          distance: distance(vector.start, hit.point),
          flags: { ...object.flags },
          t: hit.t
        };
        if (!bestHit || result.distance < bestHit.distance) {
          bestHit = result;
        }
      }
    }

    return bestHit;
  }
}
