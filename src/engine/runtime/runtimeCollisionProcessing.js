/*
Toolbox Aid
David Quesenberry
06/02/2026
runtimeCollisionProcessing.js
*/

export const RUNTIME_COLLISION_ERRORS = Object.freeze({
  OBJECTS_INVALID: "RUNTIME_COLLISION_OBJECTS_INVALID",
  TILES_INVALID: "RUNTIME_COLLISION_TILES_INVALID",
  PREVIOUS_POSITION_REQUIRED: "RUNTIME_COLLISION_PREVIOUS_POSITION_REQUIRED",
});

export function processRuntimeCollisions(runtimeObjects, terrainTiles) {
  const errors = [];

  if (!Array.isArray(runtimeObjects)) {
    errors.push(createCollisionError(RUNTIME_COLLISION_ERRORS.OBJECTS_INVALID, "Collision processing requires runtimeObjects array.", "runtimeObjects"));
  }

  if (!Array.isArray(terrainTiles)) {
    errors.push(createCollisionError(RUNTIME_COLLISION_ERRORS.TILES_INVALID, "Collision processing requires terrainTiles array.", "terrainTiles"));
  }

  if (errors.length > 0) {
    return createCollisionResult({ runtimeObjects: [], collisions: [], errors });
  }

  const collisions = [];
  const collidedInstanceIds = new Set();

  runtimeObjects.forEach((runtimeObject) => {
    terrainTiles.forEach((tile) => {
      if (!tile.material.blocked || !overlaps(boundsForObject(runtimeObject), tile.bounds)) {
        return;
      }

      collisions.push(Object.freeze({
        collisionType: "blockedTerrain",
        instanceId: runtimeObject.instanceId,
        tileId: tile.tileId,
      }));
      collidedInstanceIds.add(runtimeObject.instanceId);
    });
  });

  runtimeObjects.forEach((leftObject, leftIndex) => {
    runtimeObjects.slice(leftIndex + 1).forEach((rightObject) => {
      if (!overlaps(boundsForObject(leftObject), boundsForObject(rightObject))) {
        return;
      }

      collisions.push(Object.freeze({
        collisionType: "objectObject",
        leftInstanceId: leftObject.instanceId,
        rightInstanceId: rightObject.instanceId,
      }));
    });
  });

  const resolvedObjects = runtimeObjects.map((runtimeObject) => {
    if (!collidedInstanceIds.has(runtimeObject.instanceId)) {
      return runtimeObject;
    }

    if (!runtimeObject.previousPosition) {
      errors.push(createCollisionError(
        RUNTIME_COLLISION_ERRORS.PREVIOUS_POSITION_REQUIRED,
        "Blocked terrain collision requires explicit previousPosition.",
        `${runtimeObject.instanceId}.previousPosition`
      ));
      return runtimeObject;
    }

    return Object.freeze({
      ...runtimeObject,
      position: Object.freeze({ x: runtimeObject.previousPosition.x, y: runtimeObject.previousPosition.y }),
    });
  });

  return createCollisionResult({
    runtimeObjects: errors.length === 0 ? resolvedObjects : [],
    collisions: errors.length === 0 ? collisions : [],
    errors,
  });
}

function createCollisionResult({ runtimeObjects, collisions, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    runtimeObjects: Object.freeze(runtimeObjects),
    collisions: Object.freeze(collisions),
    errors: Object.freeze(errors),
  });
}

function createCollisionError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function boundsForObject(runtimeObject) {
  return {
    x: runtimeObject.position.x,
    y: runtimeObject.position.y,
    width: runtimeObject.size.width,
    height: runtimeObject.size.height,
  };
}

function overlaps(left, right) {
  return left.x < right.x + right.width
    && left.x + left.width > right.x
    && left.y < right.y + right.height
    && left.y + left.height > right.y;
}
