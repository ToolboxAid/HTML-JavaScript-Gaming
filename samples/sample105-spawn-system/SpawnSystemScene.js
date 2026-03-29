/*
Toolbox Aid
David Quesenberry
03/22/2026
SpawnSystemScene.js
*/
import { Scene } from '../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../engine/debug/index.js';

const theme = new Theme(ThemeTokens);

class SampleSpawnSystem {
  constructor(rules = []) {
    this.rules = Array.isArray(rules)
      ? rules.map((rule) => ({
          id: rule.id,
          interval: Math.max(0.001, Number(rule.interval) || 1),
          limit: Math.max(0, Number(rule.limit) || 0),
          elapsed: 0,
          count: 0
        }))
      : [];
  }

  update(dt, spawnFactory) {
    const created = [];
    const delta = Math.max(0, Number(dt) || 0);
    for (let i = 0; i < this.rules.length; i += 1) {
      const rule = this.rules[i];
      if (rule.count >= rule.limit) continue;
      rule.elapsed += delta;
      while (rule.elapsed >= rule.interval && rule.count < rule.limit) {
        rule.elapsed -= rule.interval;
        const entity = spawnFactory(rule, rule.count);
        if (entity) created.push(entity);
        rule.count += 1;
      }
    }
    return created;
  }
}

class SampleLifecycleSystem {
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

export default class SpawnSystemScene extends Scene {
  constructor() {
    super();
    this.spawned = [];
    this.elapsed = 0;
    this.spawnSystem = new SampleSpawnSystem([
      { id: 'orb', interval: 0.5, limit: 6 },
    ]);
    this.lifecycleSystem = new SampleLifecycleSystem({
      maxEntities: 6,
      maxLifetime: 3.5,
      bounds: { minX: -40, maxX: 1000, minY: -40, maxY: 580 }
    });
  }

  update(dt) {
    this.elapsed += Math.max(0, Number(dt) || 0);
    const created = this.spawnSystem.update(dt, (rule, count) => ({
      id: `${rule.id}-${count}`,
      x: 140 + count * 90,
      y: 290,
      age: 0
    }));
    this.spawned.push(...created);
    for (let i = 0; i < this.spawned.length; i += 1) {
      this.spawned[i].x += 28 * Math.max(0, Number(dt) || 0);
    }
    this.spawned = this.lifecycleSystem.update(this.spawned, dt);
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Sample105',
      'Spawn + lifecycle systems run deterministically at scene level.',
      'Entities expire by lifetime, bounds, and max active limits.',
    ]);

    this.spawned.forEach((entity) => {
      renderer.drawCircle(entity.x, entity.y, 14, '#fbbf24');
    });

    drawPanel(renderer, 620, 34, 300, 152, 'World Lifecycle System', [
      `Spawned: ${this.spawned.length}`,
      `Rules: ${this.spawnSystem.rules.length}`,
      `First interval: ${this.spawnSystem.rules[0].interval}s`,
      `Max lifetime: ${this.lifecycleSystem.maxLifetime}s`,
      `Max active: ${this.lifecycleSystem.maxEntities}`,
      'Cleanup removes expired/out-of-bounds entities.',
    ]);
  }
}
