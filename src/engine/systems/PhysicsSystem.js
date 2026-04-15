/*
Toolbox Aid
David Quesenberry
04/15/2026
PhysicsSystem.js
*/
import { applyDrag, resolveAabbCollision3D, stepArcadeBody } from '../physics/index.js';
import { moveEntities3D } from './MovementSystem.js';
import { getSystemEntities, requireSystemComponents } from './SystemUtils.js';

export { stepArcadeBody, applyDrag };

export function stepWorldPhysics3D(world, dt, { worldBounds = null } = {}) {
  if (!world) {
    return {
      movedEntities: 0,
      collisionCount: 0,
    };
  }

  moveEntities3D(world, dt, worldBounds);

  const movers = getSystemEntities(world, ['transform3D', 'size3D', 'velocity3D', 'collider3D']);
  const solids = getSystemEntities(world, ['transform3D', 'size3D', 'solid3D']);
  let collisionCount = 0;

  movers.forEach((entityId) => {
    const [transform3D, size3D, velocity3D, collider3D] = requireSystemComponents(world, entityId, [
      'transform3D',
      'size3D',
      'velocity3D',
      'collider3D',
    ]);

    if (collider3D.solid === true || collider3D.enabled === false) {
      return;
    }

    const body = {
      x: transform3D.x,
      y: transform3D.y,
      z: transform3D.z,
      width: size3D.width,
      height: size3D.height,
      depth: size3D.depth,
      velocityX: velocity3D.x ?? 0,
      velocityY: velocity3D.y ?? 0,
      velocityZ: velocity3D.z ?? 0,
    };

    for (const solidId of solids) {
      if (solidId === entityId) {
        continue;
      }

      const [solidTransform3D, solidSize3D, solid3D] = requireSystemComponents(world, solidId, [
        'transform3D',
        'size3D',
        'solid3D',
      ]);

      if (solid3D.enabled === false) {
        continue;
      }

      const result = resolveAabbCollision3D(body, {
        x: solidTransform3D.x,
        y: solidTransform3D.y,
        z: solidTransform3D.z,
        width: solidSize3D.width,
        height: solidSize3D.height,
        depth: solidSize3D.depth,
      });

      if (result.collided) {
        collisionCount += 1;
      }
    }

    transform3D.x = body.x;
    transform3D.y = body.y;
    transform3D.z = body.z;
    velocity3D.x = body.velocityX;
    velocity3D.y = body.velocityY;
    velocity3D.z = body.velocityZ;
  });

  return {
    movedEntities: movers.length,
    collisionCount,
  };
}
