/*
Toolbox Aid
David Quesenberry
03/22/2026
SpawnSystem.js
*/
export default class SpawnSystem {
  constructor(rules = []) {
    this.rules = rules.map((rule) => ({
      ...rule,
      elapsed: 0,
      count: 0,
    }));
  }

  update(dt, spawnFn) {
    const spawned = [];
    this.rules.forEach((rule) => {
      rule.elapsed += dt;
      const interval = rule.interval ?? 1;
      const limit = rule.limit ?? Infinity;

      if (rule.count >= limit || rule.elapsed < interval) {
        return;
      }

      rule.elapsed = 0;
      rule.count += 1;
      const entity = spawnFn(rule);
      spawned.push(entity);
    });

    return spawned;
  }
}
