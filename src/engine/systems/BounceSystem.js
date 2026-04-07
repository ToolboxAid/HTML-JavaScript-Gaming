/*
Toolbox Aid
David Quesenberry
03/21/2026
BounceSystem.js
*/
import { getSystemEntities, requireSystemComponents } from './SystemUtils.js';

export function bounceEntitiesHorizontallyInBounds(world, bounds, query = ['transform', 'size', 'velocity']) {
  const entities = getSystemEntities(world, query);

  entities.forEach((entityId) => {
    const [transform, size, velocity] = requireSystemComponents(world, entityId, [
      'transform',
      'size',
      'velocity',
    ]);

    const minX = bounds.x;
    const maxX = bounds.x + bounds.width - size.width;

    if (transform.x <= minX) {
      transform.x = minX;
      velocity.x *= -1;
    }

    if (transform.x >= maxX) {
      transform.x = maxX;
      velocity.x *= -1;
    }
  });
}
