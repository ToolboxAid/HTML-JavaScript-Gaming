import { isColliding } from '../collision/aabb.js';
import { getSystemEntities, requireSystemComponents } from './SystemUtils.js';

export function blockCollidingEntities(world) {
  let hitCount = 0;

  const movers = getSystemEntities(world, ['transform', 'size', 'collider']);
  const solids = getSystemEntities(world, ['transform', 'size', 'solid']);

  movers.forEach((entityId) => {
    const [transform, size, collider] = requireSystemComponents(world, entityId, [
      'transform',
      'size',
      'collider',
    ]);

    if (collider.solid === true) {
      return;
    }

    for (const solidId of solids) {
      const [solidTransform, solidSize, solid] = requireSystemComponents(world, solidId, [
        'transform',
        'size',
        'solid',
      ]);

      if (!solid.enabled) {
        continue;
      }

      if (
        isColliding(
          { x: transform.x, y: transform.y, width: size.width, height: size.height },
          { x: solidTransform.x, y: solidTransform.y, width: solidSize.width, height: solidSize.height }
        )
      ) {
        transform.x = transform.previousX ?? transform.x;
        transform.y = transform.previousY ?? transform.y;
        hitCount += 1;
        break;
      }
    }
  });

  return hitCount;
}
