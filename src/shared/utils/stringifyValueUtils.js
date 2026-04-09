export function stringifyValue(value) {
  try {
    const encoded = JSON.stringify(value);
    return typeof encoded === "string" ? encoded : String(value);
  } catch (_error) {
    return String(value);
  }
}
