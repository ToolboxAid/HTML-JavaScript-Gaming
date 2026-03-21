export default class World {
  constructor() {
    this.nextEntityId = 1;
    this.entities = new Set();
    this.components = new Map();
  }

  createEntity() {
    const id = this.nextEntityId++;
    this.entities.add(id);
    return id;
  }

  removeEntity(entityId) {
    this.entities.delete(entityId);

    for (const componentMap of this.components.values()) {
      componentMap.delete(entityId);
    }
  }

  addComponent(entityId, name, data) {
    if (!this.components.has(name)) {
      this.components.set(name, new Map());
    }

    this.components.get(name).set(entityId, data);
  }

  getComponent(entityId, name) {
    return this.components.get(name)?.get(entityId);
  }

  hasComponent(entityId, name) {
    return this.components.get(name)?.has(entityId) ?? false;
  }

  getEntitiesWith(...componentNames) {
    return Array.from(this.entities).filter((entityId) =>
      componentNames.every((name) => this.components.get(name)?.has(entityId))
    );
  }

  countEntities() {
    return this.entities.size;
  }
}
