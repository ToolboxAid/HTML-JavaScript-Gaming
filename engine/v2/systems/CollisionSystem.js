import { isColliding } from '../collision/aabb.js';

export default class CollisionSystem {
  static revertControlledEntityAgainstSolids({ world }) {
    const playerId = world.getEntitiesWith('transform', 'size', 'collider', 'inputControlled')[0];
    if (!playerId) {
      return false;
    }

    const transform = world.getComponent(playerId, 'transform');
    const size = world.getComponent(playerId, 'size');
    const solids = world.getEntitiesWith('transform', 'size', 'solid');

    for (const solidId of solids) {
      const solidTransform = world.getComponent(solidId, 'transform');
      const solidSize = world.getComponent(solidId, 'size');

      if (isColliding(
        { x: transform.x, y: transform.y, width: size.width, height: size.height },
        { x: solidTransform.x, y: solidTransform.y, width: solidSize.width, height: solidSize.height }
      )) {
        transform.x = transform.previousX;
        transform.y = transform.previousY;
        return true;
      }
    }

    return false;
  }
}
