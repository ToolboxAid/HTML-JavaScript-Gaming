/*
Toolbox Aid
David Quesenberry
03/25/2026
PacmanLiteNavigator.js
*/
const DIRS = Object.freeze({
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
});

export { DIRS };

function opposite(direction) {
  if (direction === 'left') return 'right';
  if (direction === 'right') return 'left';
  if (direction === 'up') return 'down';
  if (direction === 'down') return 'up';
  return null;
}

export function getLegalDirections(grid, tileX, tileY) {
  return Object.keys(DIRS).filter((name) => {
    const dir = DIRS[name];
    return grid.isWalkable(tileX + dir.x, tileY + dir.y);
  });
}

export function chooseDirectionTowardTarget(grid, tileX, tileY, currentDirection, targetX, targetY) {
  const legal = getLegalDirections(grid, tileX, tileY);
  const disallow = opposite(currentDirection);
  const filtered = legal.filter((dir) => dir !== disallow);
  const candidates = filtered.length ? filtered : legal;
  if (!candidates.length) {
    return null;
  }

  const rank = candidates
    .map((dir) => {
      const vec = DIRS[dir];
      const nx = tileX + vec.x;
      const ny = tileY + vec.y;
      const dist = Math.abs(targetX - nx) + Math.abs(targetY - ny);
      return { dir, dist };
    })
    .sort((a, b) => {
      if (a.dist !== b.dist) return a.dist - b.dist;
      return a.dir.localeCompare(b.dir);
    });
  return rank[0].dir;
}

export function canMoveDirection(grid, tileX, tileY, direction) {
  const vec = DIRS[direction];
  if (!vec) {
    return false;
  }
  return grid.isWalkable(tileX + vec.x, tileY + vec.y);
}
