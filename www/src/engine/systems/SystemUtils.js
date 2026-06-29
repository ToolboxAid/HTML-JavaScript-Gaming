/*
Toolbox Aid
David Quesenberry
03/21/2026
SystemUtils.js
*/
export function requireSystemComponents(world, entityId, componentNames) {
  return componentNames.map((name) => world.requireComponent(entityId, name));
}

export function getSystemEntities(world, componentNames) {
  return world.getEntitiesWith(...componentNames);
}
