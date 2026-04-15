/*
Toolbox Aid
David Quesenberry
04/15/2026
scene3d.js
*/
import { integrateVelocity3D } from './integration3d.js';
import { resolveAabbCollisions3D } from './collision3d.js';

export function stepSceneBodies3D(
  scene,
  dtSeconds,
  {
    bodiesKey = 'bodies3D',
    collidersKey = 'staticColliders3D',
  } = {},
) {
  if (!scene || typeof scene !== 'object') {
    return {
      movedBodies: 0,
      resolvedCollisions: 0,
    };
  }

  const bodies = Array.isArray(scene[bodiesKey]) ? scene[bodiesKey] : [];
  const staticColliders = Array.isArray(scene[collidersKey]) ? scene[collidersKey] : [];
  let movedBodies = 0;
  let resolvedCollisions = 0;

  for (const body of bodies) {
    integrateVelocity3D(body, dtSeconds);
    movedBodies += 1;

    const colliders = Array.isArray(body?.colliders3D) ? body.colliders3D : staticColliders;
    const collisionResult = resolveAabbCollisions3D(body, colliders);
    resolvedCollisions += collisionResult.collisionCount;
  }

  return {
    movedBodies,
    resolvedCollisions,
  };
}
