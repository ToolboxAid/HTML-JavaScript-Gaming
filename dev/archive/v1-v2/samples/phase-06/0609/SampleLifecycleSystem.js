/*
Toolbox Aid
David Quesenberry
03/22/2026
SampleLifecycleSystem.js
*/
export class SampleLifecycleSystem {
  constructor(config = {}) {
    this.maxEntities = Math.max(1, Number(config.maxEntities) || 6);
    this.maxLifetime = Math.max(0.1, Number(config.maxLifetime) || 4);
    this.bounds = config.bounds || { minX: -40, maxX: 1000, minY: -40, maxY: 580 };
  }

  update(entities, dt) {
    const delta = Math.max(0, Number(dt) || 0);
    const next = [];
    for (let i = 0; i < entities.length; i += 1) {
      const entity = entities[i];
      const age = (entity.age || 0) + delta;
      const x = Number(entity.x) || 0;
      const y = Number(entity.y) || 0;
      const inBounds = x >= this.bounds.minX && x <= this.bounds.maxX && y >= this.bounds.minY && y <= this.bounds.maxY;
      if (age <= this.maxLifetime && inBounds) {
        next.push({ ...entity, age });
      }
    }
    if (next.length <= this.maxEntities) return next;
    return next.slice(next.length - this.maxEntities);
  }
}
