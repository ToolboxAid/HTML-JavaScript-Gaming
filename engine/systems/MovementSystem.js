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
