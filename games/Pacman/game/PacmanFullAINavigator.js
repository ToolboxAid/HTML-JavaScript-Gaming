/*
Toolbox Aid
David Quesenberry
03/25/2026
PacmanFullAINavigator.js
*/
import { oppositeCardinalDirection as opposite } from '/src/shared/utils/index.js';

const DIRS = Object.freeze({
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
});

function getLegalDirections(grid, tileX, tileY) {
  return Object.keys(DIRS).filter((name) => {
    const v = DIRS[name];
    return grid.isWalkable(tileX + v.x, tileY + v.y);
  });
}

function chooseDirectionTowardTarget(grid, tileX, tileY, currentDirection, targetTile, tieBreakOrder) {
  const legal = getLegalDirections(grid, tileX, tileY);
  if (!legal.length) return null;
  const blockedReverse = opposite(currentDirection);
  const candidates = legal.filter((d) => d !== blockedReverse);
  const valid = candidates.length ? candidates : legal;

  const ranked = valid.map((dir) => {
    const v = DIRS[dir];
    const nx = tileX + v.x;
    const ny = tileY + v.y;
    const dist = Math.abs(targetTile.x - nx) + Math.abs(targetTile.y - ny);
    const tie = tieBreakOrder.indexOf(dir);
    return { dir, dist, tie: tie < 0 ? 99 : tie };
  }).sort((a, b) => (a.dist - b.dist) || (a.tie - b.tie));
  return ranked[0].dir;
}

export { DIRS, opposite, getLegalDirections, chooseDirectionTowardTarget };
