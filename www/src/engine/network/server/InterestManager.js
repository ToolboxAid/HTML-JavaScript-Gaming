/*
Toolbox Aid
David Quesenberry
03/22/2026
InterestManager.js
*/
function distance(a, b) {
  const dx = (a.x || 0) - (b.x || 0);
  const dy = (a.y || 0) - (b.y || 0);
  return Math.sqrt(dx * dx + dy * dy);
}

export default class InterestManager {
  filterForViewer(viewer, entities, { radius = 160 } = {}) {
    return entities.filter((entity) => entity.id === viewer.id || distance(viewer, entity) <= radius);
  }
}
