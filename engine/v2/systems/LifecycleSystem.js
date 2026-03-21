import { getSystemEntities, requireSystemComponents } from './SystemUtils.js';

export function tickLifetimes(world, dt) {
  const expired = [];

  for (const entityId of getSystemEntities(world, ['lifetime'])) {
    const [lifetime] = requireSystemComponents(world, entityId, ['lifetime']);
    lifetime.remaining -= dt;

    if (lifetime.remaining <= 0) {
      expired.push(entityId);
    }
  }

  expired.forEach((entityId) => world.removeEntity(entityId));
  return expired;
}
