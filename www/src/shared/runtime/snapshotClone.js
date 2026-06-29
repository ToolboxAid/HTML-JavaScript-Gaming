export function cloneRuntimeValue(value) {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

export function cloneSnapshot(snapshot) {
  if (snapshot === null || typeof snapshot !== "object") {
    return {};
  }
  return {
    ...snapshot,
    entities: Array.isArray(snapshot.entities)
      ? snapshot.entities.map((entity) => ({
          ...entity,
          position: entity?.position ? { ...entity.position } : undefined,
          velocity: entity?.velocity ? { ...entity.velocity } : undefined,
          stateFlags: entity?.stateFlags ? { ...entity.stateFlags } : undefined
        }))
      : [],
    meta: snapshot.meta && typeof snapshot.meta === "object"
      ? { ...snapshot.meta }
      : undefined
  };
}
