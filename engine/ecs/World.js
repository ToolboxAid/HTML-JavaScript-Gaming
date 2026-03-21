/*
Toolbox Aid
David Quesenberry
03/21/2026
World.js
*/
import { COMPONENT_SCHEMAS } from '../components/index.js';

export default class World {
  constructor({ dev = false } = {}) {
    this.nextEntityId = 1;
    this.entities = new Set();
    this.components = new Map();
    this.dev = dev;
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
    if (!this.entities.has(entityId)) {
      throw new Error(`Cannot add component "${name}" to missing entity ${entityId}.`);
    }

    this.validateComponentShape(name, data);

    if (!this.components.has(name)) {
      this.components.set(name, new Map());
    }

    this.components.get(name).set(entityId, data);
  }

  getComponent(entityId, name) {
    return this.components.get(name)?.get(entityId);
  }

  requireComponent(entityId, name) {
    const component = this.getComponent(entityId, name);

    if (!component) {
      throw new Error(`Missing required component "${name}" on entity ${entityId}.`);
    }

    return component;
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

  validateComponentShape(name, data) {
    if (!this.dev) {
      return;
    }

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error(`Component "${name}" must be an object.`);
    }

    const requiredKeys = COMPONENT_SCHEMAS[name];
    if (!requiredKeys) {
      return;
    }

    for (const key of requiredKeys) {
      if (!(key in data)) {
        throw new Error(`Component "${name}" is missing required key "${key}".`);
      }
    }
  }
}
