const TOOL_LOAD_PREFIXES = Object.freeze({
  request: "[tool-load:request]",
  fetch: "[tool-load:fetch]",
  loaded: "[tool-load:loaded]",
  warning: "[tool-load:warning]",
  error: "[tool-load:error]"
});

const MAX_SUMMARY_KEYS = 16;
const MAX_SUMMARY_DEPTH = 5;
const MAX_SUMMARY_NODES = 3000;
const CANONICAL_PALETTE_REQUIRED_FIELDS = Object.freeze(["schema", "version", "name", "swatches"]);
const CANONICAL_PALETTE_WRAPPER_FIELDS = Object.freeze(["tool", "config.palette"]);

const TOOL_EXPECTED_CONTRACTS = Object.freeze({
  "sprite-editor": Object.freeze({
    requiredPayloadShape: Object.freeze(["spriteProject"]),
    optionalPayloadShape: Object.freeze(["palette", "metadata", "sprites"]),
    paletteCapable: true
  }),
  "palette-browser": Object.freeze({
    requiredPayloadShape: CANONICAL_PALETTE_REQUIRED_FIELDS,
    optionalPayloadShape: Object.freeze(["source"]),
    paletteCapable: true,
    canonicalPaletteExpected: true
  })
});

const LAST_LOADED_CACHE = new Map();

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

function normalizeShapeList(value) {
  if (Array.isArray(value)) {
    return value
      .map((entry) => normalizeText(entry))
      .filter(Boolean);
  }
  if (value && typeof value === "object") {
    return Object.values(value)
      .map((entry) => normalizeText(entry))
      .filter(Boolean);
  }
  return [];
}

function makeUniqueList(values = []) {
  return [...new Set(values)];
}

function getToolContract(toolId) {
  const safeToolId = normalizeText(toolId);
  const contract = TOOL_EXPECTED_CONTRACTS[safeToolId] || {};
  return {
    requiredPayloadShape: normalizeShapeList(contract.requiredPayloadShape),
    optionalPayloadShape: normalizeShapeList(contract.optionalPayloadShape),
    paletteCapable: contract.paletteCapable === true,
    canonicalPaletteExpected: contract.canonicalPaletteExpected === true
  };
}

function collectRequiredPaths(requestedDataPaths) {
  const paths = [];
  if (!requestedDataPaths || typeof requestedDataPaths !== "object") {
    return paths;
  }
  Object.values(requestedDataPaths).forEach((value) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => {
        const normalized = normalizeText(entry);
        if (normalized) {
          paths.push(normalized);
        }
      });
      return;
    }
    const normalized = normalizeText(value);
    if (normalized) {
      paths.push(normalized);
    }
  });
  return makeUniqueList(paths);
}

function inferInputSource(details, requiredPaths) {
  if (normalizeText(details.samplePresetPath)) {
    return "query.samplePresetPath";
  }
  const launchQuery = details.launchQuery && typeof details.launchQuery === "object" ? details.launchQuery : {};
  if (normalizeText(launchQuery.dataPath)) {
    return "query.dataPath";
  }
  if (requiredPaths.some((entry) => /manifest/i.test(entry))) {
    return "manifest tool input";
  }
  if (requiredPaths.length > 0) {
    return "query.dataPath";
  }
  return "none";
}

function inferPathKind(details) {
  const source = normalizeText(details.requestedPath) || normalizeText(details.fetchUrl);
  if (!source) {
    return "unknown";
  }
  if (/\.palette\.json(?:[?#]|$)/i.test(source)) {
    return "palette";
  }
  if (/manifest/i.test(source)) {
    return "manifest";
  }
  if (/\/samples\//i.test(source) || /sample\.\d{4}\./i.test(source)) {
    return "sample preset";
  }
  if (/\/assets\//i.test(source) || /\.(png|jpg|jpeg|gif|webp|svg|json|txt|js)(?:[?#]|$)/i.test(source)) {
    return "asset";
  }
  return "unknown";
}

function inferContentType(details) {
  const source = normalizeText(details.fetchUrl) || normalizeText(details.requestedPath);
  if (/\.json(?:[?#]|$)/i.test(source)) {
    return "json";
  }
  if (/\.(png|jpg|jpeg|gif|webp|bmp|ico)(?:[?#]|$)/i.test(source)) {
    return "image";
  }
  if (/\.(svg|txt|css|js|mjs|html)(?:[?#]|$)/i.test(source)) {
    return "text";
  }
  return "unknown";
}

function inferPaletteFileKind(details) {
  const source = normalizeText(details.requestedPath) || normalizeText(details.fetchUrl);
  if (/\.palette\.json(?:[?#]|$)/i.test(source)) {
    return "canonical palette file";
  }
  if (/\.palette-browser\.json(?:[?#]|$)/i.test(source)) {
    return "tool wrapper file";
  }
  return "unknown";
}

function normalizeMissingFields(requiredPayloadShape, detectedPayloadShape) {
  return requiredPayloadShape.filter((field) => !detectedPayloadShape.includes(field));
}

function classifyPalettePayloadShape(detectedPayloadShape) {
  const hasCanonicalFields = CANONICAL_PALETTE_REQUIRED_FIELDS.every((field) => detectedPayloadShape.includes(field));
  if (hasCanonicalFields) {
    return "canonical-palette";
  }
  if (detectedPayloadShape.includes("tool") && detectedPayloadShape.includes("config")) {
    return "tool-wrapper";
  }
  if (detectedPayloadShape.includes("payload")) {
    return "wrapper-payload";
  }
  return "unknown";
}

function buildCacheKey(toolId, samplePresetPath) {
  const safeToolId = normalizeText(toolId);
  const safeSamplePresetPath = normalizeText(samplePresetPath);
  return `${safeToolId}|${safeSamplePresetPath}`;
}

function writeLoadedCache(details, expected) {
  const toolId = normalizeText(details.toolId);
  if (!toolId) {
    return;
  }
  const entry = {
    detectedPayloadShape: normalizeShapeList(expected.detectedPayloadShape),
    missingRequiredFields: normalizeShapeList(expected.missingRequiredFields),
    requiredPayloadShape: normalizeShapeList(expected.requiredPayloadShape)
  };
  LAST_LOADED_CACHE.set(toolId, entry);
  const scopedKey = buildCacheKey(toolId, details.samplePresetPath);
  LAST_LOADED_CACHE.set(scopedKey, entry);
}

function readLoadedCache(details) {
  const toolId = normalizeText(details.toolId);
  if (!toolId) {
    return null;
  }
  const scopedKey = buildCacheKey(toolId, details.samplePresetPath);
  return LAST_LOADED_CACHE.get(scopedKey) || LAST_LOADED_CACHE.get(toolId) || null;
}

function inferLikelyCause(details, requiredPayloadShape, receivedTopLevelKeys, missingRequiredFields) {
  const errorText = normalizeText(details.error).toLowerCase();

  if (missingRequiredFields.includes("spriteProject")) {
    return "wrong path or wrong wrapper";
  }

  if (errorText && /unexpected token|invalid json|json/i.test(errorText)) {
    return "invalid json";
  }

  if (missingRequiredFields.length > 0) {
    if (receivedTopLevelKeys.includes("tool") || receivedTopLevelKeys.includes("config") || receivedTopLevelKeys.includes("payload")) {
      return "wrong wrapper";
    }
    return "missing field";
  }

  if (errorText && (/failed \(\d+\)/i.test(errorText) || /fetch|request failed|network|404|not found/.test(errorText))) {
    return "wrong path";
  }

  if (errorText && /wrapper/.test(errorText)) {
    return "wrong wrapper";
  }

  if (requiredPayloadShape.length > 0 && receivedTopLevelKeys.length === 0) {
    return "missing field";
  }

  return "unknown";
}

function mergeExpected(computedExpected, providedExpected) {
  if (!providedExpected || typeof providedExpected !== "object" || Array.isArray(providedExpected)) {
    return computedExpected;
  }
  return {
    ...computedExpected,
    ...providedExpected
  };
}

function buildRequestExpected(details, contract) {
  const requiredPaths = collectRequiredPaths(details.requestedDataPaths);
  return {
    inputSource: inferInputSource(details, requiredPaths),
    requiredPaths,
    requiredPayloadShape: contract.requiredPayloadShape,
    optionalPayloadShape: contract.optionalPayloadShape
  };
}

function buildFetchExpected(details, contract) {
  const pathKind = inferPathKind(details);
  const payloadContract = contract.canonicalPaletteExpected
    ? CANONICAL_PALETTE_REQUIRED_FIELDS
    : contract.requiredPayloadShape;
  const expected = {
    pathKind,
    mustExist: true,
    contentType: inferContentType(details),
    payloadContract
  };

  if (contract.canonicalPaletteExpected || contract.paletteCapable) {
    const fetchedFileKind = inferPaletteFileKind(details);
    expected.canonicalPalette = {
      schema: "html-js-gaming.palette",
      requiredFields: CANONICAL_PALETTE_REQUIRED_FIELDS,
      wrapperNotCanonicalFields: CANONICAL_PALETTE_WRAPPER_FIELDS
    };
    expected.fetchedFileKind = fetchedFileKind;
    expected.canonicalFileExpected = contract.canonicalPaletteExpected;
  }

  return expected;
}

function buildLoadedExpected(details, contract) {
  const detectedPayloadShape = normalizeShapeList(details?.loaded?.topLevelKeys || details.detectedPayloadShape);
  const requiredPayloadShape = contract.requiredPayloadShape;
  const missingRequiredFields = normalizeMissingFields(requiredPayloadShape, detectedPayloadShape);
  const expected = {
    requiredPayloadShape,
    detectedPayloadShape,
    missingRequiredFields,
    contractMatch: requiredPayloadShape.length === 0 || missingRequiredFields.length === 0
  };

  if (contract.canonicalPaletteExpected || contract.paletteCapable) {
    expected.canonicalPalette = {
      schema: "html-js-gaming.palette",
      requiredFields: CANONICAL_PALETTE_REQUIRED_FIELDS,
      wrapperNotCanonicalFields: CANONICAL_PALETTE_WRAPPER_FIELDS
    };
    expected.palettePayloadKind = classifyPalettePayloadShape(detectedPayloadShape);
  }

  writeLoadedCache(details, expected);
  return expected;
}

function buildWarningOrErrorExpected(details, contract) {
  const cached = readLoadedCache(details);
  const requiredPayloadShape = contract.requiredPayloadShape.length > 0
    ? contract.requiredPayloadShape
    : normalizeShapeList(cached?.requiredPayloadShape);
  const receivedTopLevelKeys = normalizeShapeList(
    details.receivedTopLevelKeys
      || details?.loaded?.topLevelKeys
      || cached?.detectedPayloadShape
  );
  const missingRequiredFields = requiredPayloadShape.length > 0
    ? normalizeMissingFields(requiredPayloadShape, receivedTopLevelKeys)
    : normalizeShapeList(cached?.missingRequiredFields);
  const expected = {
    requiredPayloadShape,
    receivedTopLevelKeys,
    likelyCause: inferLikelyCause(details, requiredPayloadShape, receivedTopLevelKeys, missingRequiredFields)
  };

  if (missingRequiredFields.length > 0) {
    expected.missingRequiredFields = missingRequiredFields;
  }

  if (contract.canonicalPaletteExpected || contract.paletteCapable) {
    expected.canonicalPalette = {
      schema: "html-js-gaming.palette",
      requiredFields: CANONICAL_PALETTE_REQUIRED_FIELDS,
      wrapperNotCanonicalFields: CANONICAL_PALETTE_WRAPPER_FIELDS
    };
    expected.palettePayloadKind = classifyPalettePayloadShape(receivedTopLevelKeys);
  }

  return expected;
}

function buildExpected(boundary, details) {
  const contract = getToolContract(details.toolId);
  if (boundary === "request") {
    return buildRequestExpected(details, contract);
  }
  if (boundary === "fetch") {
    return buildFetchExpected(details, contract);
  }
  if (boundary === "loaded") {
    return buildLoadedExpected(details, contract);
  }
  return buildWarningOrErrorExpected(details, contract);
}

function withExpected(boundary, details) {
  const safeDetails = sanitizePayload(details);
  const computedExpected = buildExpected(boundary, safeDetails);
  const expected = mergeExpected(computedExpected, safeDetails.expected);
  return {
    ...safeDetails,
    expected
  };
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
  emitToolLoadLog(TOOL_LOAD_PREFIXES.request, withExpected("request", details));
}

export function logToolLoadFetch(details = {}) {
  emitToolLoadLog(TOOL_LOAD_PREFIXES.fetch, withExpected("fetch", details));
}

export function logToolLoadLoaded(details = {}) {
  emitToolLoadLog(TOOL_LOAD_PREFIXES.loaded, withExpected("loaded", details));
}

export function logToolLoadError(details = {}) {
  emitToolLoadLog(TOOL_LOAD_PREFIXES.error, withExpected("error", details));
}

export function logToolLoadWarning(details = {}) {
  const warningPayload = withExpected("warning", details);
  emitToolLoadLog(TOOL_LOAD_PREFIXES.warning, warningPayload);
  if (normalizeText(warningPayload.error)) {
    emitToolLoadLog(TOOL_LOAD_PREFIXES.error, withExpected("error", warningPayload));
  }
}
