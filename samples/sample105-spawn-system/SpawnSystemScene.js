/*
Toolbox Aid
David Quesenberry
03/22/2026
SpawnSystemScene.js
*/
import { Scene } from '../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../engine/debug/index.js';
import { SpawnSystem } from '../../engine/world/index.js';

const theme = new Theme(ThemeTokens);

export default class SpawnSystemScene extends Scene {
  constructor() {
    super();
    this.spawned = [];
    this.spawnSystem = new SpawnSystem([
      { id: 'orb', interval: 0.5, limit: 6 },
    ]);
  }

  update(dt) {
    this.spawned.push(...this.spawnSystem.update(dt, (rule) => ({
      id: `${rule.id}-${this.spawned.length}`,
      x: 140 + this.spawned.length * 90,
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
