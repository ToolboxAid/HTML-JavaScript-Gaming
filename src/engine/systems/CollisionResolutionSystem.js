/*
Toolbox Aid
David Quesenberry
03/21/2026
CollisionResolutionSystem.js
*/
export function moveRectWithTilemapCollision(rect, velocity, dt, tilemap, worldOffset = { x: 0, y: 0 }) {
  const result = {
    hitX: false,
    hitY: false,
    tileX: null,
    tileY: null,
  };

  rect.x += velocity.x * dt;
  const hitX = getTileCollision(rect, tilemap, worldOffset);
  if (hitX) {
    if (velocity.x > 0) {
      rect.x = hitX.x - rect.width;
    } else if (velocity.x < 0) {
      rect.x = hitX.x + hitX.width;
    }
    velocity.x = 0;
    result.hitX = true;
    result.tileX = hitX;
  }

  rect.y += velocity.y * dt;
  const hitY = getTileCollision(rect, tilemap, worldOffset);
  if (hitY) {
    if (velocity.y > 0) {
      rect.y = hitY.y - rect.height;
    } else if (velocity.y < 0) {
      rect.y = hitY.y + hitY.height;
    }
    velocity.y = 0;
    result.hitY = true;
    result.tileY = hitY;
  }

  return result;
}

export function getTileCollision(rect, tilemap, worldOffset = { x: 0, y: 0 }, predicate = null) {
  const startCol = Math.floor((rect.x - worldOffset.x) / tilemap.tileSize);
  const endCol = Math.floor((rect.x + rect.width - 1 - worldOffset.x) / tilemap.tileSize);
  const startRow = Math.floor((rect.y - worldOffset.y) / tilemap.tileSize);
  const endRow = Math.floor((rect.y + rect.height - 1 - worldOffset.y) / tilemap.tileSize);

  for (let row = startRow; row <= endRow; row += 1) {
    for (let col = startCol; col <= endCol; col += 1) {
      const tile = tilemap.getTile(col, row);
      if (tile === null) {
        continue;
      }

      const shouldBlock = typeof predicate === 'function'
        ? predicate({ tile, col, row, tilemap })
        : tilemap.isSolid(col, row);

      if (!shouldBlock) {
        continue;
      }

      return {
        tile,
        col,
        row,
        x: worldOffset.x + col * tilemap.tileSize,
        y: worldOffset.y + row * tilemap.tileSize,
        width: tilemap.tileSize,
        height: tilemap.tileSize,
      };
    }
  }

  return null;
}
