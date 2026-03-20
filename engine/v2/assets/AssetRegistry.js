export default class AssetRegistry {
  constructor() {
    this.assets = new Map();
  }

  register(id, definition) {
    this.assets.set(id, definition);
  }

  get(id) {
    return this.assets.get(id);
  }

  entries() {
    return Array.from(this.assets.entries());
  }

  count() {
    return this.assets.size;
  }
}
