/*
Toolbox Aid
David Quesenberry
03/22/2026
AssetLoaderSystem.js
*/
export default class AssetLoaderSystem {
  constructor({ registry, imageLoader, loaders = {} } = {}) {
    this.registry = registry;
    this.imageLoader = imageLoader;
    this.loaders = new Map(Object.entries(loaders));
    this.results = new Map();
    this.status = 'idle';
    this.lastError = null;
  }

  setLoader(type, loader) {
    this.loaders.set(type, loader);
  }

  async loadAll() {
    this.status = 'loading';
    this.lastError = null;

    const entries = this.registry?.entries?.() ?? [];
    const tasks = entries.map(([id, definition]) => this.loadOne(id, definition));
    const results = await Promise.all(tasks);

    this.status = results.some((entry) => entry.status === 'error') ? 'error' : 'ready';
    return results;
  }

  async loadOne(id, definition = {}) {
    try {
      const asset = await this.resolveAsset(id, definition);
      const entry = {
        id,
        type: definition.type ?? 'unknown',
        status: 'ready',
        asset,
      };
      this.results.set(id, entry);
      return entry;
    } catch (error) {
      this.lastError = error;
      const entry = {
        id,
        type: definition.type ?? 'unknown',
        status: 'error',
        error: error.message,
      };
      this.results.set(id, entry);
      return entry;
    }
  }

  async resolveAsset(id, definition) {
    const type = definition.type ?? 'unknown';

    if (type === 'image' && this.imageLoader) {
      return this.imageLoader.load(id, definition.source ?? definition.path ?? definition);
    }

    const loader = this.loaders.get(type);
    if (loader) {
      return loader(id, definition);
    }

    if (definition.source !== undefined) {
      return definition.source;
    }

    return definition;
  }

  getSnapshot() {
    return [...this.results.values()];
  }

  get(id) {
    return this.results.get(id) ?? null;
  }
}
