/*
Toolbox Aid
David Quesenberry
03/29/2026
AsteroidsWorldSystemsScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';
import { SpawnSystem, LifecycleSystem, WorldStateSystem, EventsSystem, distanceSq } from '../../shared/worldSystems.js';

const theme = new Theme(ThemeTokens);
const ASTEROIDS_VALIDATION_PRESETS = {
  baseline: {
    waves: [
      { spawn: { id: 'asteroid', interval: 0.7, limit: 7 }, asteroidSpeed: 38 },
      { spawn: { id: 'asteroid', interval: 0.5, limit: 9 }, asteroidSpeed: 52 },
      { spawn: { id: 'asteroid', interval: 0.35, limit: 11 }, asteroidSpeed: 66 }
    ],
    events: [
      { id: 'wave0-spike', waveIndex: 0, time: 3.5, repeat: false, action: { type: 'spawnIntervalMult', value: 0.8 } },
      { id: 'active-fire-boost', phase: 'active', time: 6.0, repeat: false, action: { type: 'fireCooldown', value: 0.22 } },
      { id: 'wave2-ramp', waveIndex: 2, time: 12.0, repeat: true, action: { type: 'asteroidSpeedMult', value: 1.02 } }
    ],
    lifecycle: { maxEntities: 64, maxLifetime: 2.4 }
  },
  stress: {
    waves: [
      { spawn: { id: 'asteroid', interval: 0.28, limit: 20 }, asteroidSpeed: 58 },
      { spawn: { id: 'asteroid', interval: 0.2, limit: 28 }, asteroidSpeed: 72 },
      { spawn: { id: 'asteroid', interval: 0.14, limit: 34 }, asteroidSpeed: 86 }
    ],
    events: [
      { id: 'burst-1', waveIndex: 0, time: 2.0, repeat: true, action: { type: 'spawnIntervalMult', value: 0.92 } },
      { id: 'burst-2', phase: 'active', time: 5.0, repeat: true, action: { type: 'asteroidSpeedMult', value: 1.015 } },
      { id: 'cooldown-compress', waveIndex: 1, time: 6.0, repeat: false, action: { type: 'fireCooldown', value: 0.14 } }
    ],
    lifecycle: { maxEntities: 140, maxLifetime: 1.6 }
  },
  edge: {
    waves: [
      { spawn: { id: 'asteroid', interval: 0.9, limit: 0 }, asteroidSpeed: 24 },
      { spawn: { id: 'asteroid', interval: 0.4, limit: 1 }, asteroidSpeed: 120 }
    ],
    events: [
      { id: 'edge-overlap-a', phase: 'spawning', time: 0.1, repeat: false, action: { type: 'spawnIntervalMult', value: 0.5 } },
      { id: 'edge-overlap-b', phase: 'spawning', time: 0.1, repeat: false, action: { type: 'spawnIntervalMult', value: 0.5 } },
      { id: 'edge-repeat', phase: 'active', time: 0.2, repeat: true, action: { type: 'asteroidSpeedMult', value: 1.0 } }
    ],
    lifecycle: { maxEntities: 12, maxLifetime: 0.5 }
  }
};

function getValidationMode() {
  const query = (globalThis.location && globalThis.location.search) ? String(globalThis.location.search) : '';
  if (query.indexOf('validation=stress') >= 0) return 'stress';
  if (query.indexOf('validation=edge') >= 0) return 'edge';
  return 'baseline';
}

export default class AsteroidsWorldSystemsScene extends Scene {
  constructor() {
    super();
    this.width = 960;
    this.height = 540;
    this.elapsed = 0;
    this.ship = { x: this.width * 0.5, y: this.height * 0.5, cooldown: 0 };
    this.entities = [];
    this.spawnDone = false;
    this.lastEvent = '';
    this.score = 0;
    this.validationMode = getValidationMode();
    this.validationConfig = ASTEROIDS_VALIDATION_PRESETS[this.validationMode] || ASTEROIDS_VALIDATION_PRESETS.baseline;

    this.stateSystem = new WorldStateSystem(this.validationConfig.waves);

    this.eventsSystem = new EventsSystem(this.validationConfig.events);

    this.spawnSystem = null;
    this.lifecycleSystem = new LifecycleSystem({
      maxEntities: this.validationConfig.lifecycle.maxEntities,
      maxLifetime: this.validationConfig.lifecycle.maxLifetime,
      bounds: { minX: 0, maxX: this.width, minY: 0, maxY: this.height }
    });
    this.asteroidSpeed = 40;
    this.fireCooldown = 0.3;
    this.configureWave();
  }

  configureWave() {
    const wave = this.stateSystem.getWave();
    if (!wave) {
      this.spawnSystem = new SpawnSystem([]);
      this.spawnDone = true;
      return;
    }
    this.spawnSystem = new SpawnSystem([wave.spawn]);
    this.asteroidSpeed = wave.asteroidSpeed;
    this.spawnDone = false;
  }

  update(dt) {
    const delta = Math.max(0, Number(dt) || 0);
    this.elapsed += delta;

    const fired = this.eventsSystem.update({
      elapsed: this.elapsed,
      phase: this.stateSystem.phase,
      waveIndex: this.stateSystem.waveIndex
    }, (action) => {
      if (!action) return;
      if (action.type === 'spawnIntervalMult' && this.spawnSystem && this.spawnSystem.rules[0]) {
        this.spawnSystem.rules[0].interval = Math.max(0.12, this.spawnSystem.rules[0].interval * (Number(action.value) || 1));
      }
      if (action.type === 'fireCooldown') {
        this.fireCooldown = Math.max(0.1, Number(action.value) || this.fireCooldown);
      }
      if (action.type === 'asteroidSpeedMult') {
        this.asteroidSpeed = Math.max(20, this.asteroidSpeed * (Number(action.value) || 1));
      }
    });
    if (fired.length) this.lastEvent = fired[fired.length - 1];

    if (this.stateSystem.phase === 'spawning') {
      const created = this.spawnSystem.update(delta, (rule, count) => {
        const edge = count % 4;
        const base = edge === 0 ? { x: 0, y: 40 + count * 35 } : edge === 1 ? { x: this.width, y: 50 + count * 28 } : edge === 2 ? { x: 50 + count * 44, y: 0 } : { x: 65 + count * 31, y: this.height };
        const dx = this.ship.x - base.x;
        const dy = this.ship.y - base.y;
        const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        return {
          id: `${rule.id}-${this.stateSystem.waveIndex}-${count}`,
          type: 'asteroid',
          x: base.x,
          y: base.y,
          vx: (dx / len) * this.asteroidSpeed,
          vy: (dy / len) * this.asteroidSpeed,
          radius: 18,
          age: 0
        };
      });
      this.entities.push(...created);
      const r = this.spawnSystem.rules[0];
      this.spawnDone = !!r && r.count >= r.limit;
    }

    this.ship.cooldown = Math.max(0, this.ship.cooldown - delta);
    const asteroids = this.entities.filter((e) => e.type === 'asteroid');
    if (asteroids.length && this.ship.cooldown <= 0) {
      let target = asteroids[0];
      let best = distanceSq(this.ship, target);
      for (let i = 1; i < asteroids.length; i += 1) {
        const d = distanceSq(this.ship, asteroids[i]);
        if (d < best) {
          best = d;
          target = asteroids[i];
        }
      }
      const dx = target.x - this.ship.x;
      const dy = target.y - this.ship.y;
      const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
      this.entities.push({
        id: `bullet-${this.elapsed.toFixed(3)}`,
        type: 'bullet',
        x: this.ship.x,
        y: this.ship.y,
        vx: (dx / len) * 320,
        vy: (dy / len) * 320,
        radius: 3,
        age: 0
      });
      this.ship.cooldown = this.fireCooldown;
    }

    this.entities = this.lifecycleSystem.update(this.entities, delta);

    const ast = [];
    const bullets = [];
    for (let i = 0; i < this.entities.length; i += 1) {
      const e = this.entities[i];
      if (e.type === 'asteroid') ast.push(e); else if (e.type === 'bullet') bullets.push(e);
    }
    const deadAst = new Set();
    const deadBul = new Set();
    for (let i = 0; i < bullets.length; i += 1) {
      for (let j = 0; j < ast.length; j += 1) {
        if (deadBul.has(bullets[i].id) || deadAst.has(ast[j].id)) continue;
        const r = (bullets[i].radius || 0) + (ast[j].radius || 0);
        if (distanceSq(bullets[i], ast[j]) <= r * r) {
          deadBul.add(bullets[i].id);
          deadAst.add(ast[j].id);
          this.score += 10;
        }
      }
    }
    if (deadAst.size || deadBul.size) {
      this.entities = this.entities.filter((e) => !deadAst.has(e.id) && !deadBul.has(e.id));
    }

    const transitions = this.stateSystem.update({
      spawnDone: this.spawnDone,
      remainingCount: this.entities.filter((e) => e.type === 'asteroid').length
    });
    if (transitions.indexOf('spawning') >= 0) this.configureWave();
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Level 8 - Sample Asteroids Game (World Systems)',
      'Spawn, Lifecycle, World State, and Events drive deterministic game flow.',
      'Ship auto-targets nearest asteroid to keep this sample logic-focused.',
    ]);

    renderer.drawCircle(this.ship.x, this.ship.y, 10, '#60a5fa');
    for (let i = 0; i < this.entities.length; i += 1) {
      const e = this.entities[i];
      if (e.type === 'asteroid') renderer.drawCircle(e.x, e.y, e.radius || 16, '#f59e0b');
      if (e.type === 'bullet') renderer.drawCircle(e.x, e.y, e.radius || 3, '#f8fafc');
    }

    const asteroidCount = this.entities.filter((e) => e.type === 'asteroid').length;
    const bulletCount = this.entities.filter((e) => e.type === 'bullet').length;
    drawPanel(renderer, 618, 28, 320, 208, 'Asteroids World Systems', [
      `Phase: ${this.stateSystem.phase}`,
      `Wave: ${Math.min(this.stateSystem.waveIndex + 1, this.stateSystem.waves.length)}/${this.stateSystem.waves.length}`,
      `Validation: ${this.validationMode}`,
      `Asteroids: ${asteroidCount}`,
      `Bullets: ${bulletCount}`,
      `Spawn interval: ${this.spawnSystem.rules[0] ? this.spawnSystem.rules[0].interval.toFixed(2) : 'n/a'}s`,
      `Asteroid speed: ${Math.round(this.asteroidSpeed)}`,
      `Fire cooldown: ${this.fireCooldown.toFixed(2)}s`,
      `Last event: ${this.lastEvent || 'none'}`,
      `Score: ${this.score}`
    ]);
  }
}
