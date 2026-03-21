import { clamp } from '../utils/math.js';
import { getSystemEntities, requireSystemComponents } from './SystemUtils.js';

export function clampEntitiesToBounds(world, bounds, query = ['transform', 'size']) {
  const entities = getSystemEntities(world, query);

  entities.forEach((entityId) => {
    const [transform, size] = requireSystemComponents(world, entityId, ['transform', 'size']);

    const minX = bounds.x;
    const minY = bounds.y;
    const maxX = bounds.x + bounds.width - size.width;
    const maxY = bounds.y + bounds.height - size.height;

    transform.x = clamp(transform.x, minX, maxX);
    transform.y = clamp(transform.y, minY, maxY);
  });
}
