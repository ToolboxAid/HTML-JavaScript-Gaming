/*
Toolbox Aid
David Quesenberry
03/29/2026
LifecycleSystem.js
*/
export class LifecycleSystem {
  constructor(config = {}) {
    this.maxEntities = Math.max(1, Number(config.maxEntities) || 32);
    this.maxLifetime = Math.max(0.2, Number(config.maxLifetime) || 12);
    this.bounds = config.bounds || { minX: 0, maxX: 960, minY: 0, maxY: 540 };
  }

  update(entities, dt) {
    const delta = Math.max(0, Number(dt) || 0);
    const alive = [];
    for (let i = 0; i < entities.length; i += 1) {
      const e = entities[i];
      const age = (e.age || 0) + delta;
      const next = {
        ...e,
        x: (e.x || 0) + (e.vx || 0) * delta,
        y: (e.y || 0) + (e.vy || 0) * delta,
        age
      };
      if (next.type === 'bullet') {
        if (age > this.maxLifetime) continue;
        if (next.x < this.bounds.minX || next.x > this.bounds.maxX || next.y < this.bounds.minY || next.y > this.bounds.maxY) continue;
      } else {
        if (next.x < this.bounds.minX) next.x = this.bounds.maxX;
        if (next.x > this.bounds.maxX) next.x = this.bounds.minX;
        if (next.y < this.bounds.minY) next.y = this.bounds.maxY;
        if (next.y > this.bounds.maxY) next.y = this.bounds.minY;
      }
      alive.push(next);
    }
    if (alive.length <= this.maxEntities) return alive;
    return alive.slice(alive.length - this.maxEntities);
  }
}
