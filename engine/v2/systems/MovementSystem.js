import { clamp } from '../utils/math.js';

export function moveEntities(world, dt, worldBounds = null) {
  const movers = world.getEntitiesWith('transform', 'size', 'velocity');

  movers.forEach((entityId) => {
    const transform = world.getComponent(entityId, 'transform');
    const size = world.getComponent(entityId, 'size');
    const velocity = world.getComponent(entityId, 'velocity');

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
