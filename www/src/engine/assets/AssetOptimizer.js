/*
Toolbox Aid
David Quesenberry
03/22/2026
AssetOptimizer.js
*/
export default class AssetOptimizer {
  constructor() {
    this.cache = new Map();
  }

  getCacheKey(id, definition = {}) {
    return `${id}:${definition.type ?? 'unknown'}:${definition.path ?? 'source'}`;
  }

  getOrCreate(id, definition, factory) {
    const key = this.getCacheKey(id, definition);
    if (!this.cache.has(key)) {
      this.cache.set(key, factory());
    }

    return this.cache.get(key);
  }

  stats() {
    return { cachedAssets: this.cache.size };
  }
}
