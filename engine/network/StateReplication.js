/*
Toolbox Aid
David Quesenberry
03/22/2026
StateReplication.js
*/
import Serializer from './Serializer.js';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export default class StateReplication {
  constructor({ serializer = null } = {}) {
    this.serializer = serializer || new Serializer();
    this.knownIds = new Set();
  }

  createSnapshot(entities = [], { tick = 0 } = {}) {
    const nextIds = new Set(entities.map((entity) => entity.id));
    const spawned = entities
      .filter((entity) => !this.knownIds.has(entity.id))
      .map((entity) => entity.id);
    const despawned = [...this.knownIds].filter((id) => !nextIds.has(id));
    this.knownIds = nextIds;

    return {
      tick,
      spawned,
      despawned,
      entities: entities.map((entity) => clone(entity)),
    };
  }

  encodeSnapshot(snapshot) {
    return this.serializer.encode('replication:snapshot', snapshot);
  }

  decodeSnapshot(text) {
    return this.serializer.decode(text).payload;
  }

  applySnapshot(snapshot, current = []) {
    const map = new Map(current.map((entity) => [entity.id, clone(entity)]));
    snapshot.despawned.forEach((id) => map.delete(id));
    snapshot.entities.forEach((entity) => {
      map.set(entity.id, clone(entity));
    });
    return [...map.values()];
  }
}
