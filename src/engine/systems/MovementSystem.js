/*
Toolbox Aid
David Quesenberry
03/21/2026
MovementSystem.js
*/
import { clamp } from '../utils/math.js';
import { getSystemEntities, requireSystemComponents } from './SystemUtils.js';

export function moveEntities(world, dt, worldBounds = null) {
  const movers = getSystemEntities(world, ['transform', 'size', 'velocity']);

  movers.forEach((entityId) => {
    const [transform, size, velocity] = requireSystemComponents(world, entityId, [
      'transform',
      'size',
      'velocity',
    ]);

    transform.previousX = transform.x;
    transform.previousY = transform.y;

    transform.x += velocity.x * dt;
    transform.y += velocity.y * dt;

    if (worldBounds) {
      const minX = worldBounds.x;
      const minY = worldBounds.y;
      const maxX = worldBounds.x + worldBounds.width - size.width;
      const maxY = worldBounds.y + worldBounds.height - size.height;

      transform.x = clamp(transform.x, minX, maxX);
      transform.y = clamp(transform.y, minY, maxY);
    }
  });
}

export function moveEntities3D(world, dt, worldBounds = null) {
  const movers = getSystemEntities(world, ['transform3D', 'size3D', 'velocity3D']);

  movers.forEach((entityId) => {
    const [transform3D, size3D, velocity3D] = requireSystemComponents(world, entityId, [
      'transform3D',
      'size3D',
      'velocity3D',
    ]);

    transform3D.previousX = transform3D.x;
    transform3D.previousY = transform3D.y;
    transform3D.previousZ = transform3D.z;

    transform3D.x += (velocity3D.x ?? 0) * dt;
    transform3D.y += (velocity3D.y ?? 0) * dt;
    transform3D.z += (velocity3D.z ?? 0) * dt;

    if (worldBounds) {
      const minX = worldBounds.x;
      const minY = worldBounds.y;
      const minZ = worldBounds.z;
      const maxX = worldBounds.x + worldBounds.width - size3D.width;
      const maxY = worldBounds.y + worldBounds.height - size3D.height;
      const maxZ = worldBounds.z + worldBounds.depth - size3D.depth;

      transform3D.x = clamp(transform3D.x, minX, maxX);
      transform3D.y = clamp(transform3D.y, minY, maxY);
      transform3D.z = clamp(transform3D.z, minZ, maxZ);
    }
  });
}
