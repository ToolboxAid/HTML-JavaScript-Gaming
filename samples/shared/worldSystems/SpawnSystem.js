/*
Toolbox Aid
David Quesenberry
03/29/2026
SpawnSystem.js
*/
export class SpawnSystem {
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
