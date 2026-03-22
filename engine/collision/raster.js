/*
Toolbox Aid
David Quesenberry
03/22/2026
raster.js
*/
import { isColliding } from './aabb.js';

export function createRasterMask(rows = [], { cellSize = 1 } = {}) {
  return {
    rows: rows.map((row) => [...row]),
    width: rows[0]?.length ?? 0,
    height: rows.length,
    cellSize,
  };
}

export function getMaskBounds(mask, x = 0, y = 0) {
  return {
    x,
    y,
    width: mask.width * (mask.cellSize ?? 1),
    height: mask.height * (mask.cellSize ?? 1),
  };
}

export function areMasksColliding(maskA, ax, ay, maskB, bx, by) {
  const boundsA = getMaskBounds(maskA, ax, ay);
  const boundsB = getMaskBounds(maskB, bx, by);
  if (!isColliding(boundsA, boundsB)) {
    return false;
  }

  const startX = Math.max(boundsA.x, boundsB.x);
  const endX = Math.min(boundsA.x + boundsA.width, boundsB.x + boundsB.width);
  const startY = Math.max(boundsA.y, boundsB.y);
  const endY = Math.min(boundsA.y + boundsA.height, boundsB.y + boundsB.height);

  for (let y = startY; y < endY; y += 1) {
    for (let x = startX; x < endX; x += 1) {
      const aLocalX = Math.floor((x - ax) / (maskA.cellSize ?? 1));
      const aLocalY = Math.floor((y - ay) / (maskA.cellSize ?? 1));
      const bLocalX = Math.floor((x - bx) / (maskB.cellSize ?? 1));
      const bLocalY = Math.floor((y - by) / (maskB.cellSize ?? 1));
      const aFilled = maskA.rows[aLocalY]?.[aLocalX] === 1;
      const bFilled = maskB.rows[bLocalY]?.[bLocalX] === 1;
      if (aFilled && bFilled) {
        return true;
      }
    }
  }

  return false;
}

export function isPointInMask(mask, x, y, originX = 0, originY = 0) {
  const localX = Math.floor((x - originX) / (mask.cellSize ?? 1));
  const localY = Math.floor((y - originY) / (mask.cellSize ?? 1));
  return mask.rows[localY]?.[localX] === 1;
}
