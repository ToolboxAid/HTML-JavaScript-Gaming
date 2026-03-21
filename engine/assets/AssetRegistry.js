export default class AssetRegistry {
  constructor() {
    this.assets = new Map();
  }

  register(id, definition) {
    this.assets.set(id, definition);
  }

  registerMany(definitions = []) {
    definitions.forEach((definition) => {
      this.register(definition.id, { ...definition, id: undefined });
    });
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
