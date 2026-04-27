const TOOL_LOAD_PREFIXES = Object.freeze({
  request: "[tool-load:request]",
  fetch: "[tool-load:fetch]",
  loaded: "[tool-load:loaded]",
  warning: "[tool-load:warning]"
});

const MAX_SUMMARY_KEYS = 16;
const MAX_SUMMARY_DEPTH = 5;
const MAX_SUMMARY_NODES = 3000;

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function sanitizePayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {};
  }
  return payload;
}

function emitToolLoadLog(prefix, payload) {
  if (typeof console === "undefined") {
    return;
  }
  const writer = typeof console.debug === "function" ? console.debug : console.log;
  writer.call(console, prefix, sanitizePayload(payload));
}

function summarizeValueType(value) {
  if (Array.isArray(value)) {
    return "array";
  }
  if (value === null) {
    return "null";
  }
  return typeof value;
}

function summarizeValueShape(value) {
  if (Array.isArray(value)) {
    return `array(${value.length})`;
  }
  if (value && typeof value === "object") {
    const keys = Object.keys(value);
    const label = value.constructor && value.constructor.name ? value.constructor.name : "object";
    return `${label}(${keys.length} keys)`;
  }
  return summarizeValueType(value);
}

function summarizeTopLevelKeys(value, limit = MAX_SUMMARY_KEYS) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [];
  }
  return Object.keys(value).slice(0, limit);
}

function normalizePathParts(pathParts) {
  if (!Array.isArray(pathParts) || pathParts.length === 0) {
    return "root";
  }
  return pathParts.join(".");
}

function findFirstMatch(root, predicate) {
  const visited = new Set();
  const stack = [{ value: root, path: ["root"], depth: 0 }];
  let nodesVisited = 0;

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) {
      continue;
    }
    const { value, path, depth } = current;
    if (value && typeof value === "object") {
      if (visited.has(value)) {
        continue;
      }
      visited.add(value);
    }

    nodesVisited += 1;
    if (nodesVisited > MAX_SUMMARY_NODES) {
      break;
    }

    if (predicate(value, path)) {
      return {
        value,
        path: normalizePathParts(path)
      };
    }

    if (depth >= MAX_SUMMARY_DEPTH || !value || typeof value !== "object") {
      continue;
    }

    if (Array.isArray(value)) {
      for (let index = value.length - 1; index >= 0; index -= 1) {
        stack.push({
          value: value[index],
          path: [...path, `[${index}]`],
          depth: depth + 1
        });
      }
      continue;
    }

    const keys = Object.keys(value);
    for (let keyIndex = keys.length - 1; keyIndex >= 0; keyIndex -= 1) {
      const key = keys[keyIndex];
      stack.push({
        value: value[key],
        path: [...path, key],
        depth: depth + 1
      });
    }
  }

  return null;
}

function summarizePaletteData(root) {
  const match = findFirstMatch(root, (value) => {
    return Boolean(value && typeof value === "object" && !Array.isArray(value) && Array.isArray(value.swatches));
  });
  const swatchCount = match && Array.isArray(match.value?.swatches) ? match.value.swatches.length : 0;
  return {
    present: Boolean(match),
    source: match ? match.path : "",
    swatchCount
  };
}

function summarizeSpriteData(root) {
  const match = findFirstMatch(root, (value) => {
    return Boolean(value && typeof value === "object" && !Array.isArray(value) && Array.isArray(value.frames));
  });
  const frameCount = match && Array.isArray(match.value?.frames) ? match.value.frames.length : 0;
  return {
    present: Boolean(match),
    source: match ? match.path : "",
    frameCount
  };
}

function summarizeReplayData(root) {
  const match = findFirstMatch(root, (value) => {
    return Boolean(value && typeof value === "object" && !Array.isArray(value) && Array.isArray(value.events));
  });
  const eventCount = match && Array.isArray(match.value?.events) ? match.value.events.length : 0;
  return {
    hasEventsArray: Boolean(match),
    source: match ? match.path : "",
    eventCount
  };
}

function normalizeQueryValue(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => normalizeText(entry)).filter(Boolean);
  }
  return normalizeText(value);
}

function appendQueryValue(snapshot, key, value) {
  if (!Object.prototype.hasOwnProperty.call(snapshot, key)) {
    snapshot[key] = value;
    return;
  }
  const existing = snapshot[key];
  if (Array.isArray(existing)) {
    existing.push(value);
    return;
  }
  snapshot[key] = [existing, value];
}

export function getToolLoadQuerySnapshot(searchParams) {
  const snapshot = {};
  if (searchParams instanceof URLSearchParams) {
    for (const [rawKey, rawValue] of searchParams.entries()) {
      const key = normalizeText(rawKey);
      const value = normalizeText(rawValue);
      if (!key || !value) {
        continue;
      }
      appendQueryValue(snapshot, key, value);
    }
    return snapshot;
  }
  if (searchParams && typeof searchParams === "object") {
    Object.entries(searchParams).forEach(([rawKey, rawValue]) => {
      const key = normalizeText(rawKey);
      const value = normalizeQueryValue(rawValue);
      if (!key || (Array.isArray(value) ? value.length === 0 : !value)) {
        return;
      }
      snapshot[key] = value;
    });
  }
  return snapshot;
}

export function getToolLoadRequestedDataPaths(querySnapshot = {}) {
  const requestedPaths = {};
  Object.entries(querySnapshot).forEach(([key, value]) => {
    if (!/(path|href|url)$/i.test(key)) {
      return;
    }
    const normalized = normalizeQueryValue(value);
    if (Array.isArray(normalized)) {
      if (normalized.length > 0) {
        requestedPaths[key] = normalized;
      }
      return;
    }
    if (normalized) {
      requestedPaths[key] = normalized;
    }
  });
  return requestedPaths;
}

export function summarizeToolLoadData(value) {
  return {
    type: summarizeValueType(value),
    shape: summarizeValueShape(value),
    topLevelKeys: summarizeTopLevelKeys(value),
    palette: summarizePaletteData(value),
    sprite: summarizeSpriteData(value),
    replay: summarizeReplayData(value)
  };
}

export function logToolLoadRequest(details = {}) {
  emitToolLoadLog(TOOL_LOAD_PREFIXES.request, details);
}

export function logToolLoadFetch(details = {}) {
  emitToolLoadLog(TOOL_LOAD_PREFIXES.fetch, details);
}

export function logToolLoadLoaded(details = {}) {
  emitToolLoadLog(TOOL_LOAD_PREFIXES.loaded, details);
}

export function logToolLoadWarning(details = {}) {
  emitToolLoadLog(TOOL_LOAD_PREFIXES.warning, details);
}
