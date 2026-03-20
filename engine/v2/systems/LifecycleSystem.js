export default class LifecycleSystem {
  static expireTimedEntities({ world, componentName = 'lifetime', requiredTag = null, dt, onExpire = null }) {
    const requiredComponents = requiredTag ? [requiredTag, componentName] : [componentName];

    for (const entityId of world.getEntitiesWith(...requiredComponents)) {
      const lifetime = world.getComponent(entityId, componentName);
      lifetime.remaining -= dt;

      if (lifetime.remaining <= 0) {
        if (typeof onExpire === 'function') {
          onExpire(entityId);
        }
        world.removeEntity(entityId);
      }
    }
  }
}
