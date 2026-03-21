export function serializeWorldState(worldState) {
  return JSON.stringify(worldState, null, 2);
}

export function deserializeWorldState(text) {
  return JSON.parse(text);
}
