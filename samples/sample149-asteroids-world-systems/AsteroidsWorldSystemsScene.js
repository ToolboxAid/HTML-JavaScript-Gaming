/*
Toolbox Aid
David Quesenberry
03/29/2026
AsteroidsWorldSystemsScene.js
*/
import { Scene } from '../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../engine/debug/index.js';

const theme = new Theme(ThemeTokens);

class SpawnSystem {
  constructor(rules = []) {
    this.rules = Array.isArray(rules)
      ? rules.map((rule) => ({
          id: rule.id,
          interval: Math.max(0.05, Number(rule.interval) || 1),
          limit: Math.max(0, Number(rule.limit) || 0),
          elapsed: 0,
          count: 0
        }))
      : [];
  }

  update(dt, factory) {
    const out = [];
    const delta = Math.max(0, Number(dt) || 0);
    for (let i = 0; i < this.rules.length; i += 1) {
      const rule = this.rules[i];
      if (rule.count >= rule.limit) continue;
      rule.elapsed += delta;
      while (rule.elapsed >= rule.interval && rule.count < rule.limit) {
        rule.elapsed -= rule.interval;
        const created = factory(rule, rule.count);
        if (created) out.push(created);
        rule.count += 1;
      }
    }
    return out;
  }
}

class LifecycleSystem {
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

class WorldStateSystem {
  constructor(waves = []) {
    this.waves = Array.isArray(waves) ? waves : [];
    this.phase = this.waves.length ? 'idle' : 'complete';
    this.waveIndex = 0;
  }

  getWave() {
    return this.waves[this.waveIndex] || null;
  }

  update(state) {
    const transitions = [];
    if (this.phase === 'complete') return transitions;
    if (this.phase === 'idle') {
      this.phase = 'spawning';
      transitions.push('spawning');
      return transitions;
    }
    if (this.phase === 'spawning' && state.spawnDone) {
      this.phase = 'active';
      transitions.push('active');
      return transitions;
    }
    if (this.phase === 'active' && state.asteroidCount === 0) {
      this.waveIndex += 1;
      if (this.waveIndex >= this.waves.length) {
        this.phase = 'complete';
        transitions.push('complete');
      } else {
        this.phase = 'spawning';
        transitions.push('spawning');
      }
    }
    return transitions;
  }
}

class EventsSystem {
  constructor(events = []) {
    this.events = Array.isArray(events) ? events.map((e) => ({ ...e, fired: false })) : [];
  }

  update(ctx, applyAction) {
    const fired = [];
    for (let i = 0; i < this.events.length; i += 1) {
      const event = this.events[i];
      const okTime = typeof event.time === 'number' ? ctx.elapsed >= event.time : true;
      const okPhase = event.phase ? ctx.phase === event.phase : true;
      const okWave = typeof event.waveIndex === 'number' ? ctx.waveIndex === event.waveIndex : true;
      if (!(okTime && okPhase && okWave)) continue;
      if (!event.repeat && event.fired) continue;
      applyAction(event.action);
      event.fired = true;
      fired.push(event.id || `event-${i}`);
    }
    return fired;
  }
}

function distanceSq(a, b) {
  const dx = (a.x || 0) - (b.x || 0);
  const dy = (a.y || 0) - (b.y || 0);
  return dx * dx + dy * dy;
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

    this.stateSystem = new WorldStateSystem([
      { spawn: { id: 'asteroid', interval: 0.7, limit: 7 }, asteroidSpeed: 38 },
      { spawn: { id: 'asteroid', interval: 0.5, limit: 9 }, asteroidSpeed: 52 },
      { spawn: { id: 'asteroid', interval: 0.35, limit: 11 }, asteroidSpeed: 66 }
    ]);

    this.eventsSystem = new EventsSystem([
      { id: 'wave0-spike', waveIndex: 0, time: 3.5, repeat: false, action: { type: 'spawnIntervalMult', value: 0.8 } },
      { id: 'active-fire-boost', phase: 'active', time: 6.0, repeat: false, action: { type: 'fireCooldown', value: 0.22 } },
      { id: 'wave2-ramp', waveIndex: 2, time: 12.0, repeat: true, action: { type: 'asteroidSpeedMult', value: 1.02 } }
    ]);

    this.spawnSystem = null;
    this.lifecycleSystem = new LifecycleSystem({ maxEntities: 64, maxLifetime: 2.4, bounds: { minX: 0, maxX: this.width, minY: 0, maxY: this.height } });
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
      asteroidCount: this.entities.filter((e) => e.type === 'asteroid').length
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
