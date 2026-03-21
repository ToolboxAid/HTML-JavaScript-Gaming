export function tickLifetimes(world, dt) {
  const expired = [];

  for (const entityId of world.getEntitiesWith('lifetime')) {
    const lifetime = world.getComponent(entityId, 'lifetime');
    lifetime.remaining -= dt;

    if (lifetime.remaining <= 0) {
      expired.push(entityId);
    }
  }

  expired.forEach((entityId) => world.removeEntity(entityId));
  return expired;
}
