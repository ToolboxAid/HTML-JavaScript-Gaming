/*
Toolbox Aid
David Quesenberry
03/29/2026
worldSystems.js
*/
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
    if (this.phase === 'active' && state.remainingCount === 0) {
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

export { SpawnSystem, LifecycleSystem, WorldStateSystem, EventsSystem, distanceSq };
