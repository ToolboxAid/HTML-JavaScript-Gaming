export function cloneJson(value) {
  return value == null ? value : deepClone(value);
}

export function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}
