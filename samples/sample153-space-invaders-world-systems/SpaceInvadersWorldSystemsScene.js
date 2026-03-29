/*
Toolbox Aid
David Quesenberry
03/29/2026
SpaceInvadersWorldSystemsScene.js
*/
import { Scene } from '../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../engine/debug/index.js';
import { SpawnSystem, LifecycleSystem, WorldStateSystem, EventsSystem, distanceSq } from '../shared/worldSystems.js';

const theme = new Theme(ThemeTokens);

export default class SpaceInvadersWorldSystemsScene extends Scene {
  constructor() {
    super();
    this.width = 960;
    this.height = 540;
    this.elapsed = 0;
    this.score = 0;
    this.lastEvent = '';
    this.player = { x: this.width * 0.5, y: this.height - 48, cooldown: 0.28 };
    this.playerFireCooldown = 0.28;
    this.formationStep = 24;
    this.formationDrop = 14;
    this.invaderSpeed = 28;
    this.invaderDirection = 1;
    this.spawnDone = false;
    this.entities = [];

    this.stateSystem = new WorldStateSystem([
      { spawn: { id: 'invader', interval: 0.06, limit: 18 }, config: { invaderSpeed: 28, playerCooldown: 0.28 } },
      { spawn: { id: 'invader', interval: 0.05, limit: 24 }, config: { invaderSpeed: 36, playerCooldown: 0.24 } },
      { spawn: { id: 'invader', interval: 0.04, limit: 30 }, config: { invaderSpeed: 44, playerCooldown: 0.2 } }
    ]);

    this.eventsSystem = new EventsSystem([
      { id: 'ufo-pass', phase: 'active', time: 5.5, repeat: false, action: { type: 'spawnUfo' } },
      { id: 'tempo-spike', waveIndex: 1, time: 8.0, repeat: false, action: { type: 'invaderSpeedMult', value: 1.18 } },
      { id: 'late-wave-pressure', waveIndex: 2, phase: 'active', time: 11.0, repeat: true, action: { type: 'invaderSpeedMult', value: 1.02 } }
    ]);

    this.spawnSystem = null;
    this.lifecycleSystem = new LifecycleSystem({
      maxEntities: 110,
      maxLifetime: 2.2,
      bounds: { minX: 0, maxX: this.width, minY: 0, maxY: this.height }
    });
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
    this.invaderSpeed = wave.config.invaderSpeed;
    this.playerFireCooldown = wave.config.playerCooldown;
    this.spawnDone = false;
  }

  createInvader(count) {
    const cols = 6;
    const row = Math.floor(count / cols);
    const col = count % cols;
    return {
      id: `invader-${this.stateSystem.waveIndex}-${count}`,
      type: 'invader',
      x: 120 + col * this.formationStep,
      y: 84 + row * 28,
      vx: this.invaderSpeed * this.invaderDirection,
      vy: 0,
      radius: 10,
      age: 0
    };
  }

  maybeFirePlayerShot(dt) {
    this.player.cooldown = Math.max(0, this.player.cooldown - dt);
    const invaders = this.entities.filter((e) => e.type === 'invader');
    if (!invaders.length || this.player.cooldown > 0) return;
    let target = invaders[0];
    let best = distanceSq(this.player, target);
    for (let i = 1; i < invaders.length; i += 1) {
      const d = distanceSq(this.player, invaders[i]);
      if (d < best) {
        best = d;
        target = invaders[i];
      }
    }
    const dx = target.x - this.player.x;
    const dy = target.y - this.player.y;
    const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    this.entities.push({
      id: `shot-${this.elapsed.toFixed(3)}`,
      type: 'shot',
      x: this.player.x,
      y: this.player.y - 8,
      vx: (dx / len) * 250,
      vy: (dy / len) * 250,
      radius: 3,
      age: 0
    });
    this.player.cooldown = this.playerFireCooldown;
  }

  applyEvents() {
    const fired = this.eventsSystem.update({
      elapsed: this.elapsed,
      phase: this.stateSystem.phase,
      waveIndex: this.stateSystem.waveIndex
    }, (action) => {
      if (!action) return;
      if (action.type === 'spawnUfo') {
        this.entities.push({
          id: `ufo-${this.elapsed.toFixed(2)}`,
          type: 'ufo',
          x: 0,
          y: 56,
          vx: 120,
          vy: 0,
          radius: 12,
          age: 0
        });
      }
      if (action.type === 'invaderSpeedMult') {
        this.invaderSpeed = Math.max(20, this.invaderSpeed * (Number(action.value) || 1));
      }
    });
    if (fired.length) this.lastEvent = fired[fired.length - 1];
  }

  updateFormationMotion() {
    const invaders = this.entities.filter((e) => e.type === 'invader');
    if (!invaders.length) return;
    let left = invaders[0].x;
    let right = invaders[0].x;
    for (let i = 1; i < invaders.length; i += 1) {
      if (invaders[i].x < left) left = invaders[i].x;
      if (invaders[i].x > right) right = invaders[i].x;
    }
    if (right >= this.width - 30 || left <= 30) {
      this.invaderDirection *= -1;
      for (let i = 0; i < this.entities.length; i += 1) {
        if (this.entities[i].type === 'invader') this.entities[i].y += this.formationDrop;
      }
    }
    for (let i = 0; i < this.entities.length; i += 1) {
      if (this.entities[i].type === 'invader') this.entities[i].vx = this.invaderSpeed * this.invaderDirection;
    }
  }

  resolveHits() {
    const shots = this.entities.filter((e) => e.type === 'shot');
    const enemies = this.entities.filter((e) => e.type === 'invader' || e.type === 'ufo');
    const deadShots = new Set();
    const deadEnemies = new Set();
    for (let i = 0; i < shots.length; i += 1) {
      for (let j = 0; j < enemies.length; j += 1) {
        if (deadShots.has(shots[i].id) || deadEnemies.has(enemies[j].id)) continue;
        const r = (shots[i].radius || 0) + (enemies[j].radius || 0);
        if (distanceSq(shots[i], enemies[j]) <= r * r) {
          deadShots.add(shots[i].id);
          deadEnemies.add(enemies[j].id);
          this.score += enemies[j].type === 'ufo' ? 50 : 10;
        }
      }
    }
    if (deadShots.size || deadEnemies.size) {
      this.entities = this.entities.filter((e) => !deadShots.has(e.id) && !deadEnemies.has(e.id));
    }
  }

  update(dt) {
    const delta = Math.max(0, Number(dt) || 0);
    this.elapsed += delta;

    this.applyEvents();

    if (this.stateSystem.phase === 'spawning') {
      const created = this.spawnSystem.update(delta, (_rule, count) => this.createInvader(count));
      this.entities.push(...created);
      const r = this.spawnSystem.rules[0];
      this.spawnDone = !!r && r.count >= r.limit;
    }

    this.updateFormationMotion();
    this.maybeFirePlayerShot(delta);
    this.entities = this.lifecycleSystem.update(this.entities, delta);
    this.resolveHits();

    const transitions = this.stateSystem.update({
      spawnDone: this.spawnDone,
      remainingCount: this.entities.filter((e) => e.type === 'invader').length
    });
    if (transitions.indexOf('spawning') >= 0) this.configureWave();
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Level 8.1 - Space Invaders Reuse Validation',
      'Reuses the shared Spawn, Lifecycle, World State, and Events systems.',
      'Game-specific formation, firing, and scoring stay local to the scene.',
    ]);

    renderer.drawRect(this.player.x - 12, this.player.y - 6, 24, 12, '#60a5fa');
    for (let i = 0; i < this.entities.length; i += 1) {
      const e = this.entities[i];
      if (e.type === 'invader') renderer.drawRect(e.x - 10, e.y - 8, 20, 16, '#22c55e');
      if (e.type === 'ufo') renderer.drawRect(e.x - 14, e.y - 6, 28, 12, '#ef4444');
      if (e.type === 'shot') renderer.drawCircle(e.x, e.y, e.radius || 3, '#f8fafc');
    }

    const invaders = this.entities.filter((e) => e.type === 'invader').length;
    const ufos = this.entities.filter((e) => e.type === 'ufo').length;
    const shots = this.entities.filter((e) => e.type === 'shot').length;
    drawPanel(renderer, 610, 28, 330, 216, 'Space Invaders Systems', [
      `Phase: ${this.stateSystem.phase}`,
      `Wave: ${Math.min(this.stateSystem.waveIndex + 1, this.stateSystem.waves.length)}/${this.stateSystem.waves.length}`,
      `Invaders: ${invaders}`,
      `UFOs: ${ufos}`,
      `Shots: ${shots}`,
      `Invader speed: ${Math.round(this.invaderSpeed)}`,
      `Player cooldown: ${this.playerFireCooldown.toFixed(2)}s`,
      `Last event: ${this.lastEvent || 'none'}`,
      `Score: ${this.score}`
    ]);
  }
}
