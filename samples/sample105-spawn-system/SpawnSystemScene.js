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

export default class SpawnSystemScene extends Scene {
  constructor() {
    super();
    this.spawned = [];
    this.spawnSystem = new SampleSpawnSystem([
      { id: 'orb', interval: 0.5, limit: 6 },
    ]);
  }

  update(dt) {
    this.spawned.push(...this.spawnSystem.update(dt, (rule, count) => ({
      id: `${rule.id}-${count}`,
      x: 140 + count * 90,
      y: 290,
    })));
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Sample105',
      'Entity spawning is controlled by a reusable engine system with timing rules.',
      'New orbs appear on a schedule until the configured limit is reached.',
    ]);

    this.spawned.forEach((entity) => {
      renderer.drawCircle(entity.x, entity.y, 14, '#fbbf24');
    });

    drawPanel(renderer, 620, 34, 300, 126, 'Spawn System', [
      `Spawned: ${this.spawned.length}`,
      `Rules: ${this.spawnSystem.rules.length}`,
      `First interval: ${this.spawnSystem.rules[0].interval}s`,
      'Spawns stop at the rule limit.',
    ]);
  }
}
