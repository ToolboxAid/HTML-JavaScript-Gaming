/*
Toolbox Aid
David Quesenberry
03/21/2026
TilemapCollision.js
*/
import { isColliding } from '../collision/aabb.js';

export function resolveRectVsTilemap(rect, tilemap, worldOffset = { x: 0, y: 0 }) {
  for (let row = 0; row < tilemap.height; row += 1) {
    for (let col = 0; col < tilemap.width; col += 1) {
      if (!tilemap.isSolid(col, row)) {
        continue;
      }

      const tileRect = {
        x: worldOffset.x + col * tilemap.tileSize,
        y: worldOffset.y + row * tilemap.tileSize,
        width: tilemap.tileSize,
        height: tilemap.tileSize,
      };

      if (isColliding(rect, tileRect)) {
        return tileRect;
      }
    }
  }

  return null;
}
