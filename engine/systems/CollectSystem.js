import { isColliding } from '../collision/aabb.js';
import { getSystemEntities, requireSystemComponents } from './SystemUtils.js';

export function collectOverlappingEntities(
  world,
  {
    collectorQuery = ['transform', 'size'],
    targetQuery = ['transform', 'size'],
    onCollect = null,
  } = {},
) {
  const collectors = getSystemEntities(world, collectorQuery);
  const targets = getSystemEntities(world, targetQuery);

  let collectedCount = 0;

  collectors.forEach((collectorId) => {
    const [collectorTransform, collectorSize] = requireSystemComponents(world, collectorId, [
      'transform',
      'size',
    ]);

    targets.slice().forEach((targetId) => {
      if (!world.entities.has(targetId)) {
        return;
      }

      const [targetTransform, targetSize] = requireSystemComponents(world, targetId, [
        'transform',
        'size',
      ]);

      if (
        isColliding(
          {
            x: collectorTransform.x,
            y: collectorTransform.y,
            width: collectorSize.width,
            height: collectorSize.height,
          },
          {
            x: targetTransform.x,
            y: targetTransform.y,
            width: targetSize.width,
            height: targetSize.height,
          },
        )
      ) {
        if (typeof onCollect === 'function') {
          onCollect({ world, collectorId, targetId });
        } else {
          world.removeEntity(targetId);
        }

        collectedCount += 1;
      }
    });
  });

  return collectedCount;
}
