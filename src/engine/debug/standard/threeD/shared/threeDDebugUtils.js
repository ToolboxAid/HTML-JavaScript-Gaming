/*
Toolbox Aid
David Quesenberry
04/05/2026
threeDDebugUtils.js
*/

import { sanitizeText } from "../../../../../shared/string/strings.js";
import { asFinite } from "../../../../../shared/math/numberNormalization.js";
import { asArray } from "../../../../../shared/array/arrays.js";
import { asObject } from "../../../../../shared/object/objects.js";

export { asArray, asFinite, asObject, sanitizeText };

export function asNonNegativeInteger(value, fallback = 0) {
  const normalized = Number.isFinite(value) ? Math.floor(Number(value)) : fallback;
  return normalized >= 0 ? normalized : fallback;
}

export function toLinePair(label, value) {
  const key = sanitizeText(label) || "value";
  if (value === undefined || value === null) {
    return `${key}=n/a`;
  }
  return `${key}=${String(value)}`;
}

export function createProvider(providerId, title, getSnapshot) {
  return {
    providerId,
    title,
    getSnapshot: typeof getSnapshot === "function"
      ? getSnapshot
      : () => ({})
  };
}

export function createPanelDescriptor({
  id,
  title,
  provider,
  priority,
  enabled = false,
  linesBuilder
}) {
  return {
    id,
    title,
    enabled: enabled === true,
    priority: asFinite(priority, 1200),
    source: "threeD",
    renderMode: "text-block",
    refreshMs: 250,
    render(_panel, contextSnapshot = {}) {
      const snapshot = provider && typeof provider.getSnapshot === "function"
        ? provider.getSnapshot(contextSnapshot)
        : {};
      const lines = typeof linesBuilder === "function"
        ? linesBuilder(snapshot)
        : [];
      return {
        id,
        title,
        lines: asArray(lines).map((line) => String(line)).filter(Boolean)
      };
    }
  };
}

export function getAdapter(adapters, key) {
  const source = asObject(adapters);
  const candidate = source[key];
  return typeof candidate === "function" ? candidate : null;
}
