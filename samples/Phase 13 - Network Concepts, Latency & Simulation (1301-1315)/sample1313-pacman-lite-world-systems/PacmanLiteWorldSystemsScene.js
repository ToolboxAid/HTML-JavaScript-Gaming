/*
Toolbox Aid
David Quesenberry
03/29/2026
PacmanLiteWorldSystemsScene.js
*/
import { Scene } from '../../../src/engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../src/engine/theme/index.js';
import { drawFrame, drawPanel } from '../../../src/engine/debug/index.js';
import { SpawnSystem, LifecycleSystem, WorldStateSystem, EventsSystem, distanceSq } from '../../shared/worldSystems.js';

const theme = new Theme(ThemeTokens);

const MAZE_MIN_X = 120;
const MAZE_MAX_X = 840;
const MAZE_MIN_Y = 90;
const MAZE_MAX_Y = 450;
const PACMAN_VALIDATION_PRESETS = {
  baseline: {
    waves: [
      { spawn: { id: 'round0', interval: 0.05, limit: 25 }, config: { ghostCount: 2, pelletStepX: 120, pelletStepY: 90 } },
      { spawn: { id: 'round1', interval: 0.045, limit: 31 }, config: { ghostCount: 3, pelletStepX: 100, pelletStepY: 80 } }
    ],
    events: [
      { id: 'frightened-window', phase: 'active', time: 5.0, repeat: false, action: { type: 'frightened', duration: 4.5 } },
      { id: 'bonus-fruit', phase: 'active', time: 8.0, repeat: false, action: { type: 'spawnBonus' } },
      { id: 'tempo-rise', waveIndex: 1, phase: 'active', time: 12.0, repeat: true, action: { type: 'ghostSpeedMult', value: 1.015 } }
    ],
    lifecycle: { maxEntities: 80, maxLifetime: 16 }
  },
  stress: {
    waves: [
      { spawn: { id: 'round0', interval: 0.02, limit: 48 }, config: { ghostCount: 4, pelletStepX: 80, pelletStepY: 70 } },
      { spawn: { id: 'round1', interval: 0.018, limit: 56 }, config: { ghostCount: 5, pelletStepX: 72, pelletStepY: 64 } }
    ],
    events: [
      { id: 'stress-fright', phase: 'active', time: 3.0, repeat: true, action: { type: 'frightened', duration: 2.0 } },
      { id: 'stress-bonus', phase: 'active', time: 4.0, repeat: true, action: { type: 'spawnBonus' } }
    ],
    lifecycle: { maxEntities: 160, maxLifetime: 10 }
  },
  edge: {
    waves: [
      { spawn: { id: 'round0', interval: 0.1, limit: 0 }, config: { ghostCount: 0, pelletStepX: 120, pelletStepY: 90 } },
      { spawn: { id: 'round1', interval: 0.1, limit: 1 }, config: { ghostCount: 1, pelletStepX: 120, pelletStepY: 90 } }
    ],
    events: [
      { id: 'edge-overlap-a', phase: 'spawning', time: 0.1, repeat: false, action: { type: 'spawnBonus' } },
      { id: 'edge-overlap-b', phase: 'spawning', time: 0.1, repeat: false, action: { type: 'spawnBonus' } }
    ],
    lifecycle: { maxEntities: 20, maxLifetime: 4 }
  }
};

function getValidationMode() {
  const query = (globalThis.location && globalThis.location.search) ? String(globalThis.location.search) : '';
  if (query.indexOf('validation=stress') >= 0) return 'stress';
  if (query.indexOf('validation=edge') >= 0) return 'edge';
  return 'baseline';
}

export default class PacmanLiteWorldSystemsScene extends Scene {
  constructor() {
    super();
    this.width = 960;
    this.height = 540;
    this.elapsed = 0;
    this.score = 0;
    this.lives = 3;
    this.lastEvent = '';
    this.validationMode = getValidationMode();
    this.validationConfig = PACMAN_VALIDATION_PRESETS[this.validationMode] || PACMAN_VALIDATION_PRESETS.baseline;

    this.player = { x: 480, y: 270, vx: 88, vy: 0, radius: 9 };
    this.ghostSpeed = 48;
    this.frightenedTimer = 0;

    this.entities = [];
    this.spawnDone = false;

    this.stateSystem = new WorldStateSystem(this.validationConfig.waves);

    this.eventsSystem = new EventsSystem(this.validationConfig.events);

    this.spawnSystem = null;
    this.lifecycleSystem = new LifecycleSystem({
      maxEntities: this.validationConfig.lifecycle.maxEntities,
      maxLifetime: this.validationConfig.lifecycle.maxLifetime,
      bounds: { minX: MAZE_MIN_X, maxX: MAZE_MAX_X, minY: MAZE_MIN_Y, maxY: MAZE_MAX_Y }
    });

    this.configureRound();
  }

  configureRound() {
    const round = this.stateSystem.getWave();
    if (!round) {
      this.spawnSystem = new SpawnSystem([]);
      this.spawnDone = true;
      return;
    }
    this.spawnSystem = new SpawnSystem([round.spawn]);
    this.roundConfig = round.config;
    this.spawnDone = false;
    this.entities = this.entities.filter((e) => e.type !== 'pellet' && e.type !== 'ghost' && e.type !== 'bonus');
    for (let i = 0; i < this.roundConfig.ghostCount; i += 1) {
      this.entities.push({
        id: `ghost-${this.stateSystem.waveIndex}-${i}`,
        type: 'ghost',
        x: 260 + i * 180,
        y: 170 + (i % 2) * 120,
        vx: (i % 2 === 0 ? 1 : -1) * this.ghostSpeed,
        vy: (i % 2 === 0 ? 1 : -1) * this.ghostSpeed * 0.55,
        radius: 10,
        age: 0
      });
    }
  }

  spawnRoundContent(dt) {
    if (this.stateSystem.phase !== 'spawning') return;
    const added = this.spawnSystem.update(dt, (_rule, count) => {
      const cols = 7;
      const row = Math.floor(count / cols);
      const col = count % cols;
      const x = MAZE_MIN_X + 30 + col * this.roundConfig.pelletStepX;
      const y = MAZE_MIN_Y + 25 + row * this.roundConfig.pelletStepY;
      if (count % 12 === 0) {
        return { id: `power-${this.stateSystem.waveIndex}-${count}`, type: 'power', x, y, vx: 0, vy: 0, radius: 6, age: 0 };
      }
      return { id: `pellet-${this.stateSystem.waveIndex}-${count}`, type: 'pellet', x, y, vx: 0, vy: 0, radius: 4, age: 0 };
    });
    this.entities.push(...added);
    const r = this.spawnSystem.rules[0];
    this.spawnDone = !!r && r.count >= r.limit;
  }

  updatePlayer(dt) {
    const t = this.elapsed;
    const dirX = Math.cos(t * 0.9);
    const dirY = Math.sin(t * 0.9);
    const len = Math.max(0.001, Math.sqrt(dirX * dirX + dirY * dirY));
    this.player.vx = (dirX / len) * 88;
    this.player.vy = (dirY / len) * 88;
    this.player.x += this.player.vx * dt;
    this.player.y += this.player.vy * dt;
    if (this.player.x < MAZE_MIN_X) this.player.x = MAZE_MAX_X;
    if (this.player.x > MAZE_MAX_X) this.player.x = MAZE_MIN_X;
    if (this.player.y < MAZE_MIN_Y) this.player.y = MAZE_MAX_Y;
    if (this.player.y > MAZE_MAX_Y) this.player.y = MAZE_MIN_Y;
  }

  applyEvents() {
    const fired = this.eventsSystem.update({
      elapsed: this.elapsed,
      phase: this.stateSystem.phase,
      waveIndex: this.stateSystem.waveIndex
    }, (action) => {
      if (!action) return;
      if (action.type === 'frightened') {
        this.frightenedTimer = Math.max(this.frightenedTimer, Number(action.duration) || 0);
      }
      if (action.type === 'spawnBonus') {
        const hasBonus = this.entities.some((e) => e.type === 'bonus');
        if (!hasBonus) {
          this.entities.push({ id: `bonus-${this.elapsed.toFixed(2)}`, type: 'bonus', x: 480, y: 270, vx: 0, vy: 0, radius: 7, age: 0 });
        }
      }
      if (action.type === 'ghostSpeedMult') {
        this.ghostSpeed = Math.max(24, this.ghostSpeed * (Number(action.value) || 1));
      }
    });
    if (fired.length) this.lastEvent = fired[fired.length - 1];
  }

  updateGhosts() {
    for (let i = 0; i < this.entities.length; i += 1) {
      const e = this.entities[i];
      if (e.type !== 'ghost') continue;
      const speed = this.frightenedTimer > 0 ? this.ghostSpeed * 0.6 : this.ghostSpeed;
      const dx = this.player.x - e.x;
      const dy = this.player.y - e.y;
      const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
      const toward = this.frightenedTimer > 0 ? -1 : 1;
      e.vx = toward * (dx / len) * speed;
      e.vy = toward * (dy / len) * speed;
    }
  }

  resolveCollectionsAndHits() {
    const dead = new Set();
    for (let i = 0; i < this.entities.length; i += 1) {
      const e = this.entities[i];
      const r = this.player.radius + (e.radius || 0);
      if (distanceSq(this.player, e) > r * r) continue;
      if (e.type === 'pellet') {
        dead.add(e.id);
        this.score += 5;
      }
      if (e.type === 'power') {
        dead.add(e.id);
        this.score += 20;
        this.frightenedTimer = 5.0;
      }
      if (e.type === 'bonus') {
        dead.add(e.id);
        this.score += 50;
      }
      if (e.type === 'ghost') {
        if (this.frightenedTimer > 0) {
          dead.add(e.id);
          this.score += 40;
        } else {
          this.lives = Math.max(0, this.lives - 1);
          this.player.x = 480;
          this.player.y = 270;
        }
      }
    }
    if (dead.size) this.entities = this.entities.filter((e) => !dead.has(e.id));
  }

  update(dt) {
    const delta = Math.max(0, Number(dt) || 0);
    this.elapsed += delta;
    this.frightenedTimer = Math.max(0, this.frightenedTimer - delta);

    this.applyEvents();
    this.spawnRoundContent(delta);
    this.updatePlayer(delta);
    this.updateGhosts();

    this.entities = this.lifecycleSystem.update(this.entities, delta);
    this.resolveCollectionsAndHits();

    const transitions = this.stateSystem.update({
      spawnDone: this.spawnDone,
      remainingCount: this.entities.filter((e) => e.type === 'pellet' || e.type === 'power' || e.type === 'ghost').length
    });
    if (transitions.indexOf('spawning') >= 0) this.configureRound();
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Level 8.2 - Pacman Lite Pattern Expansion',
      'Reuses shared Spawn/Lifecycle/WorldState/Events systems via composition.',
      'Pacman-specific chase, collection, and life rules stay scene-local.',
    ]);

    renderer.drawRect(MAZE_MIN_X, MAZE_MIN_Y, MAZE_MAX_X - MAZE_MIN_X, MAZE_MAX_Y - MAZE_MIN_Y, '#0b1022');
    renderer.drawCircle(this.player.x, this.player.y, this.player.radius, '#facc15');

    for (let i = 0; i < this.entities.length; i += 1) {
      const e = this.entities[i];
      if (e.type === 'pellet') renderer.drawCircle(e.x, e.y, e.radius || 4, '#f8fafc');
      if (e.type === 'power') renderer.drawCircle(e.x, e.y, e.radius || 6, '#f97316');
      if (e.type === 'bonus') renderer.drawRect(e.x - 6, e.y - 6, 12, 12, '#ef4444');
      if (e.type === 'ghost') renderer.drawRect(e.x - 10, e.y - 10, 20, 20, this.frightenedTimer > 0 ? '#60a5fa' : '#22c55e');
    }

    const pellets = this.entities.filter((e) => e.type === 'pellet').length;
    const ghosts = this.entities.filter((e) => e.type === 'ghost').length;
    drawPanel(renderer, 612, 24, 328, 220, 'Pacman Lite Systems', [
      `Phase: ${this.stateSystem.phase}`,
      `Round: ${Math.min(this.stateSystem.waveIndex + 1, this.stateSystem.waves.length)}/${this.stateSystem.waves.length}`,
      `Validation: ${this.validationMode}`,
      `Pellets: ${pellets}`,
      `Ghosts: ${ghosts}`,
      `Lives: ${this.lives}`,
      `Ghost speed: ${Math.round(this.ghostSpeed)}`,
      `Frightened: ${this.frightenedTimer.toFixed(2)}s`,
      `Last event: ${this.lastEvent || 'none'}`,
      `Score: ${this.score}`
    ]);
  }
}
