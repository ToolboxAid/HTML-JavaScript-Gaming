export function normalizeToolSamplePath(pathValue) {
  if (typeof pathValue !== "string") {
    return null;
  }

  const trimmed = pathValue.trim().replace(/\\/g, "/");
  if (!trimmed || trimmed.includes("..")) {
    return null;
  }

  if (trimmed.startsWith("./samples/")) {
    return trimmed;
  }
  if (trimmed.startsWith("samples/")) {
    return `./${trimmed}`;
  }
  return `./samples/${trimmed}`;
}

export function toToolSampleLabel(pathValue) {
  const fileName = String(pathValue).split("/").pop() || String(pathValue);
  const base = fileName.replace(/\.json$/i, "");
  const words = base.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  if (!words) {
    return "Sample";
  }
  return words.replace(/\b\w/g, (value) => value.toUpperCase());
}
