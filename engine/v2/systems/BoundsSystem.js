import { clamp } from '../utils/math.js';

export function clampEntitiesToBounds(world, bounds, query = ['transform', 'size']) {
  const entities = world.getEntitiesWith(...query);

  entities.forEach((entityId) => {
    const transform = world.getComponent(entityId, 'transform');
    const size = world.getComponent(entityId, 'size');

    const minX = bounds.x;
    const minY = bounds.y;
    const maxX = bounds.x + bounds.width - size.width;
    const maxY = bounds.y + bounds.height - size.height;

    transform.x = clamp(transform.x, minX, maxX);
    transform.y = clamp(transform.y, minY, maxY);
  });
}
