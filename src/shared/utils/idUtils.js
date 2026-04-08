export function generateId() {
  return `id-${Math.random().toString(36).slice(2, 10)}`;
}

export function isValidId(value) {
  return typeof value === "string" && value.trim().length > 0;
}
