/*
Toolbox Aid
David Quesenberry
03/21/2026
WorldSerializer.js
*/
export function serializeWorldState(worldState) {
  return JSON.stringify(worldState, null, 2);
}

export function deserializeWorldState(text) {
  return JSON.parse(text);
}
