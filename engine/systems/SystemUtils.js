export function requireSystemComponents(world, entityId, componentNames) {
  return componentNames.map((name) => world.requireComponent(entityId, name));
}

export function getSystemEntities(world, componentNames) {
  return world.getEntitiesWith(...componentNames);
}
