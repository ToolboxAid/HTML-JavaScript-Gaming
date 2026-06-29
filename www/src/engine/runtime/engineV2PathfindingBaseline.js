/*
Toolbox Aid
David Quesenberry
06/03/2026
engineV2PathfindingBaseline.js
*/

export const ENGINE_V2_PATHFINDING_ERRORS = Object.freeze({
  GRID_INVALID: "ENGINE_V2_PATHFINDING_GRID_INVALID",
  REQUESTS_INVALID: "ENGINE_V2_PATHFINDING_REQUESTS_INVALID",
  OBJECTS_INVALID: "ENGINE_V2_PATHFINDING_OBJECTS_INVALID",
  REQUEST_INVALID: "ENGINE_V2_PATHFINDING_REQUEST_INVALID",
  OBJECT_MISSING: "ENGINE_V2_PATHFINDING_OBJECT_MISSING",
  OBJECT_NOT_DYNAMIC: "ENGINE_V2_PATHFINDING_OBJECT_NOT_DYNAMIC",
  START_BLOCKED: "ENGINE_V2_PATHFINDING_START_BLOCKED",
  GOAL_BLOCKED: "ENGINE_V2_PATHFINDING_GOAL_BLOCKED",
});

export function resolveEngineV2PathRequests({ grid, pathRequests, runtimeObjects }) {
  const errors = [];

  validateGrid(grid).forEach((error) => errors.push(error));

  if (!Array.isArray(pathRequests)) {
    errors.push(createPathfindingError(ENGINE_V2_PATHFINDING_ERRORS.REQUESTS_INVALID, "Pathfinding requires pathRequests array.", "pathRequests"));
  }

  if (!Array.isArray(runtimeObjects)) {
    errors.push(createPathfindingError(ENGINE_V2_PATHFINDING_ERRORS.OBJECTS_INVALID, "Pathfinding requires runtimeObjects array.", "runtimeObjects"));
  }

  if (errors.length > 0) {
    return createPathfindingResult({ pathResults: [], errors });
  }

  pathRequests.forEach((pathRequest, index) => {
    validatePathRequest(pathRequest, `pathRequests[${index}]`).forEach((error) => errors.push(error));
  });

  pathRequests.forEach((pathRequest, index) => {
    const runtimeObject = runtimeObjects.find((item) => item.instanceId === pathRequest.instanceId);

    if (!runtimeObject) {
      errors.push(createPathfindingError(
        ENGINE_V2_PATHFINDING_ERRORS.OBJECT_MISSING,
        "Path request references missing runtime object.",
        `pathRequests[${index}].instanceId`
      ));
      return;
    }

    if (!isDynamicRuntimeObject(runtimeObject)) {
      errors.push(createPathfindingError(
        ENGINE_V2_PATHFINDING_ERRORS.OBJECT_NOT_DYNAMIC,
        "Path request target must be a dynamic runtime object.",
        `pathRequests[${index}].instanceId`
      ));
    }

    if (!isWalkable(grid, pathRequest.start.x, pathRequest.start.y)) {
      errors.push(createPathfindingError(
        ENGINE_V2_PATHFINDING_ERRORS.START_BLOCKED,
        "Path request start must be in-bounds and passable.",
        `pathRequests[${index}].start`
      ));
    }

    if (!isWalkable(grid, pathRequest.goal.x, pathRequest.goal.y)) {
      errors.push(createPathfindingError(
        ENGINE_V2_PATHFINDING_ERRORS.GOAL_BLOCKED,
        "Path request goal must be in-bounds and passable.",
        `pathRequests[${index}].goal`
      ));
    }
  });

  if (errors.length > 0) {
    return createPathfindingResult({ pathResults: [], errors });
  }

  const pathResults = pathRequests.map((pathRequest) => Object.freeze({
    requestId: pathRequest.requestId,
    instanceId: pathRequest.instanceId,
    path: Object.freeze(findGridPath(grid, pathRequest.start, pathRequest.goal).map((node) => Object.freeze(node))),
  }));

  return createPathfindingResult({ pathResults, errors });
}

function findGridPath(grid, start, goal) {
  const open = [{ x: start.x, y: start.y, g: 0, f: getHeuristic(start, goal) }];
  const cameFrom = new Map();
  const costSoFar = new Map([[getNodeKey(start.x, start.y), 0]]);

  while (open.length > 0) {
    open.sort((left, right) => left.f - right.f || left.y - right.y || left.x - right.x);
    const current = open.shift();

    if (current.x === goal.x && current.y === goal.y) {
      return buildPath(cameFrom, current);
    }

    getNeighbors(current).forEach((neighbor) => {
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
        f: nextCost + getHeuristic(neighbor, goal),
      });
    });
  }

  return [];
}

function buildPath(cameFrom, current) {
  const path = [{ x: current.x, y: current.y }];
  let key = getNodeKey(current.x, current.y);

  while (cameFrom.has(key)) {
    const previous = cameFrom.get(key);

    path.unshift(previous);
    key = getNodeKey(previous.x, previous.y);
  }

  return path;
}

function validateGrid(grid) {
  if (!isRecord(grid) || !Number.isInteger(grid.width) || grid.width <= 0 || !Number.isInteger(grid.height) || grid.height <= 0 || !Array.isArray(grid.cells) || grid.cells.length !== grid.height || !grid.cells.every((row) => Array.isArray(row) && row.length === grid.width && row.every((cell) => cell === 0 || cell === 1))) {
    return [createPathfindingError(
      ENGINE_V2_PATHFINDING_ERRORS.GRID_INVALID,
      "Pathfinding grid requires width, height, and cells with 0 passable / 1 blocked values.",
      "grid"
    )];
  }

  return [];
}

function validatePathRequest(pathRequest, path) {
  if (!isRecord(pathRequest) || !hasNonEmptyString(pathRequest.requestId) || !hasNonEmptyString(pathRequest.instanceId) || !isGridPosition(pathRequest.start) || !isGridPosition(pathRequest.goal)) {
    return [createPathfindingError(
      ENGINE_V2_PATHFINDING_ERRORS.REQUEST_INVALID,
      "Path request requires requestId, instanceId, start, and goal.",
      path
    )];
  }

  return [];
}

function getNeighbors(node) {
  return [
    { x: node.x + 1, y: node.y },
    { x: node.x, y: node.y + 1 },
    { x: node.x - 1, y: node.y },
    { x: node.x, y: node.y - 1 },
  ];
}

function isWalkable(grid, x, y) {
  return Number.isInteger(x)
    && Number.isInteger(y)
    && y >= 0
    && y < grid.height
    && x >= 0
    && x < grid.width
    && grid.cells[y][x] === 0;
}

function isDynamicRuntimeObject(runtimeObject) {
  return runtimeObject.objectType === "dynamic" || (Array.isArray(runtimeObject.capabilities) && runtimeObject.capabilities.includes("dynamic"));
}

function getHeuristic(left, right) {
  return Math.abs(left.x - right.x) + Math.abs(left.y - right.y);
}

function getNodeKey(x, y) {
  return `${x},${y}`;
}

function createPathfindingResult({ pathResults, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    pathResults: Object.freeze(pathResults),
    errors: Object.freeze(errors),
  });
}

function createPathfindingError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function isGridPosition(value) {
  return isRecord(value) && Number.isInteger(value.x) && Number.isInteger(value.y);
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
