/*
Toolbox Aid
David Quesenberry
03/22/2026
GridPathfinding.js
*/
function getNodeKey(x, y) {
  return `${x},${y}`;
}

function heuristic(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function isWalkable(grid, x, y) {
  return y >= 0 && y < grid.length && x >= 0 && x < grid[y].length && grid[y][x] === 0;
}

export function findGridPath(grid, start, goal) {
  if (!isWalkable(grid, start.x, start.y) || !isWalkable(grid, goal.x, goal.y)) {
    return [];
  }

  const open = [{ x: start.x, y: start.y, g: 0, f: heuristic(start, goal) }];
  const cameFrom = new Map();
  const costSoFar = new Map([[getNodeKey(start.x, start.y), 0]]);

  while (open.length > 0) {
    open.sort((a, b) => a.f - b.f);
    const current = open.shift();

    if (current.x === goal.x && current.y === goal.y) {
      const path = [{ x: current.x, y: current.y }];
      let key = getNodeKey(current.x, current.y);

      while (cameFrom.has(key)) {
        const previous = cameFrom.get(key);
        path.unshift(previous);
        key = getNodeKey(previous.x, previous.y);
      }

      return path;
    }

    const neighbors = [
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 },
    ];

    neighbors.forEach((neighbor) => {
      if (!isWalkable(grid, neighbor.x, neighbor.y)) {
        return;
      }

      const nextCost = current.g + 1;
      const key = getNodeKey(neighbor.x, neighbor.y);
      const previousCost = costSoFar.get(key);

      if (previousCost !== undefined && nextCost >= previousCost) {
        return;
      }

      costSoFar.set(key, nextCost);
      cameFrom.set(key, { x: current.x, y: current.y });
      open.push({
        x: neighbor.x,
        y: neighbor.y,
        g: nextCost,
        f: nextCost + heuristic(neighbor, goal),
      });
    });
  }

  return [];
}
