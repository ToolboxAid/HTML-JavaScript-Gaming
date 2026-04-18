/*
Toolbox Aid
David Quesenberry
03/22/2026
SpawnSystemScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';
import { SampleSpawnSystem } from './SampleSpawnSystem.js';
import { SampleLifecycleSystem } from './SampleLifecycleSystem.js';
import { SampleWorldStateSystem } from './SampleWorldStateSystem.js';
import { SampleWorldEventsSystem } from './SampleWorldEventsSystem.js';

const theme = new Theme(ThemeTokens);

export default class SpawnSystemScene extends Scene {
  constructor() {
    super();
    this.spawned = [];
    this.elapsed = 0;
    this.worldStateSystem = new SampleWorldStateSystem([
      { spawn: { id: 'orb', interval: 0.5, limit: 6 }, lifecycle: { maxEntities: 6, maxLifetime: 3.5 } },
      { spawn: { id: 'orb', interval: 0.35, limit: 8 }, lifecycle: { maxEntities: 8, maxLifetime: 3.2 } }
    ]);
    this.spawnSystem = null;
    this.lifecycleSystem = null;
    this.worldEventsSystem = new SampleWorldEventsSystem([
      { id: 'warmup-rate-boost', time: 1.5, waveIndex: 0, repeat: false, action: { type: 'setSpawnInterval', value: 0.4 } },
      { id: 'active-lifetime-shorten', phase: 'active', repeat: false, action: { type: 'setMaxLifetime', value: 2.8 } },
      { id: 'wave2-rate-ramp', waveIndex: 1, time: 4.5, repeat: true, action: { type: 'multiplySpawnInterval', value: 0.96 } }
    ]);
    this.spawnDone = false;
    this.lastEvent = '';
    this.configureForWave();
  }

  configureForWave() {
    const wave = this.worldStateSystem.getCurrentWave();
    if (!wave) {
      this.spawnSystem = new SampleSpawnSystem([]);
      this.lifecycleSystem = new SampleLifecycleSystem({ maxEntities: 1, maxLifetime: 0.1 });
      this.spawnDone = true;
      return;
    }
    this.spawnSystem = new SampleSpawnSystem([wave.spawn]);
    this.lifecycleSystem = new SampleLifecycleSystem({
      maxEntities: wave.lifecycle.maxEntities,
      maxLifetime: wave.lifecycle.maxLifetime,
      bounds: { minX: -40, maxX: 1000, minY: -40, maxY: 580 }
    });
    this.spawnDone = false;
  }

  update(dt) {
    this.elapsed += Math.max(0, Number(dt) || 0);
    const fired = this.worldEventsSystem.update({
      elapsed: this.elapsed,
      phase: this.worldStateSystem.phase,
      waveIndex: this.worldStateSystem.waveIndex
    }, (action) => {
      if (!action || !this.spawnSystem || !this.lifecycleSystem) return;
      if (action.type === 'setSpawnInterval' && this.spawnSystem.rules[0]) {
        this.spawnSystem.rules[0].interval = Math.max(0.08, Number(action.value) || this.spawnSystem.rules[0].interval);
      }
      if (action.type === 'multiplySpawnInterval' && this.spawnSystem.rules[0]) {
        const next = this.spawnSystem.rules[0].interval * (Number(action.value) || 1);
        this.spawnSystem.rules[0].interval = Math.max(0.08, next);
      }
      if (action.type === 'setMaxLifetime') {
        this.lifecycleSystem.maxLifetime = Math.max(0.25, Number(action.value) || this.lifecycleSystem.maxLifetime);
      }
    });
    if (fired.length) this.lastEvent = fired[fired.length - 1];
    if (this.worldStateSystem.phase === 'spawning') {
      const created = this.spawnSystem.update(dt, (rule, count) => ({
        id: `${rule.id}-${this.worldStateSystem.waveIndex}-${count}`,
        x: 140 + count * 90,
        y: 290,
        age: 0
      }));
      this.spawned.push(...created);
      const doneRule = this.spawnSystem.rules[0];
      this.spawnDone = !!doneRule && doneRule.count >= doneRule.limit;
    }
    for (let i = 0; i < this.spawned.length; i += 1) {
      this.spawned[i].x += 28 * Math.max(0, Number(dt) || 0);
    }
    this.spawned = this.lifecycleSystem.update(this.spawned, dt);
    const transitions = this.worldStateSystem.update(this.spawned, this.spawnDone);
    if (transitions.indexOf('spawning') >= 0) {
      this.configureForWave();
    }
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine sample 0609',
      'Spawn + lifecycle + world phase systems run deterministically.',
      'World phase transitions: idle -> spawning -> active -> complete.',
    ]);

    this.spawned.forEach((entity) => {
      renderer.drawCircle(entity.x, entity.y, 14, '#fbbf24');
    });

    drawPanel(renderer, 620, 34, 300, 204, 'World Events / Phase System', [
      `Spawned: ${this.spawned.length}`,
      `Phase: ${this.worldStateSystem.phase}`,
      `Wave: ${Math.min(this.worldStateSystem.waveIndex + 1, this.worldStateSystem.waves.length)}/${this.worldStateSystem.waves.length}`,
      `Spawn interval: ${this.spawnSystem.rules[0] ? this.spawnSystem.rules[0].interval : 0}s`,
      `Max lifetime: ${this.lifecycleSystem.maxLifetime}s`,
      `Max active: ${this.lifecycleSystem.maxEntities}`,
      `Events: ${this.worldEventsSystem.events.length}`,
      `Last event: ${this.lastEvent || 'none'}`,
      'Wave advances after spawn complete and entity cleanup.',
    ]);
  }
}
