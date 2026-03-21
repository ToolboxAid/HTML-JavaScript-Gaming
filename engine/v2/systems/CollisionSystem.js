import { isColliding } from '../collision/aabb.js';

export function blockCollidingEntities(world) {
  let hitCount = 0;

  const movers = world.getEntitiesWith('transform', 'size', 'collider');
  const solids = world.getEntitiesWith('transform', 'size', 'solid');

  movers.forEach((entityId) => {
    const transform = world.getComponent(entityId, 'transform');
    const size = world.getComponent(entityId, 'size');

    for (const solidId of solids) {
      const solidTransform = world.getComponent(solidId, 'transform');
      const solidSize = world.getComponent(solidId, 'size');

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
