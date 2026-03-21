import { isColliding } from '../collision/aabb.js';

export function collectOverlappingEntities(
  world,
  {
    collectorQuery = ['transform', 'size'],
    targetQuery = ['transform', 'size'],
    onCollect = null,
  } = {},
) {
  const collectors = world.getEntitiesWith(...collectorQuery);
  const targets = world.getEntitiesWith(...targetQuery);

  let collectedCount = 0;

  collectors.forEach((collectorId) => {
    const collectorTransform = world.getComponent(collectorId, 'transform');
    const collectorSize = world.getComponent(collectorId, 'size');

    targets.slice().forEach((targetId) => {
      if (!world.entities.has(targetId)) {
        return;
      }

      const targetTransform = world.getComponent(targetId, 'transform');
      const targetSize = world.getComponent(targetId, 'size');

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
