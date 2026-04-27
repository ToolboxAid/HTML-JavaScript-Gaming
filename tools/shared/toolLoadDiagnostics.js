const TOOL_LOAD_PREFIXES = Object.freeze({
  request: "[tool-load:request]",
  fetch: "[tool-load:fetch]",
  loaded: "[tool-load:loaded]",
  warning: "[tool-load:warning]",
  error: "[tool-load:error]",
  classification: "[tool-load:classification]"
});

const CLASSIFICATION_VALUES = Object.freeze({
  missing: "missing",
  wrongPath: "wrong-path",
  wrongShape: "wrong-shape",
  success: "success"
});

const MAX_SUMMARY_KEYS = 16;
const MAX_SUMMARY_DEPTH = 5;
const MAX_SUMMARY_NODES = 3000;

const CANONICAL_PALETTE_SCHEMA = "html-js-gaming.palette";
const CANONICAL_PALETTE_REQUIRED_FIELDS = Object.freeze(["schema", "version", "name", "swatches"]);
const CANONICAL_PALETTE_REQUIRED_ARRAY_FIELDS = Object.freeze(["swatches"]);

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
const CLASSIFICATION_CACHE = new Map();

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

function extractLoadedSchema(root) {
  if (!root || typeof root !== "object") {
    return "";
  }
  const directSchema = normalizeText(root.schema) || normalizeText(root.$schema);
  if (directSchema) {
    return directSchema;
  }
  const payloadSchema = normalizeText(root?.payload?.schema) || normalizeText(root?.payload?.$schema);
  if (payloadSchema) {
    return payloadSchema;
  }
  const configSchema = normalizeText(root?.config?.schema) || normalizeText(root?.config?.$schema);
  if (configSchema) {
    return configSchema;
  }
  const paletteSchema = normalizeText(root?.palette?.schema) || normalizeText(root?.palette?.$schema);
  if (paletteSchema) {
    return paletteSchema;
  }
  return "";
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

function inferPrimaryDependencyId(contract, details) {
  const explicit = normalizeText(details.dependencyId);
  if (explicit) {
    return explicit;
  }
  const candidatePath = normalizeText(details.requestedPath) || normalizeText(details.samplePresetPath);
  if (contract.canonicalPaletteExpected || /\.palette\.json(?:[?#]|$)/i.test(candidatePath)) {
    return "palette";
  }
  if (contract.requiredPayloadShape.includes("spriteProject")) {
    return "sprite-project";
  }
  return "preset";
}

function inferExpectedPathKey(details) {
  const explicit = normalizeText(details.expectedPathKey);
  if (explicit) {
    return explicit;
  }
  const pathSource = normalizeText(details.pathSource);
  const queryMatch = pathSource.match(/query\.([a-zA-Z0-9._-]+)/);
  if (queryMatch?.[1]) {
    return queryMatch[1];
  }
  if (normalizeText(details.samplePresetPath)) {
    return "samplePresetPath";
  }
  const requestedDataPaths = details.requestedDataPaths && typeof details.requestedDataPaths === "object"
    ? details.requestedDataPaths
    : {};
  const firstPathKey = Object.keys(requestedDataPaths)[0];
  if (firstPathKey) {
    return firstPathKey;
  }
  return "unknownPathKey";
}

function inferExpectedPath(details, expectedPathKey) {
  const explicit = normalizeText(details.expectedPath);
  if (explicit) {
    return explicit;
  }
  const requestedDataPaths = details.requestedDataPaths && typeof details.requestedDataPaths === "object"
    ? details.requestedDataPaths
    : {};
  const fromRequestedData = requestedDataPaths[expectedPathKey];
  if (Array.isArray(fromRequestedData)) {
    const first = normalizeText(fromRequestedData[0]);
    if (first) {
      return first;
    }
  } else {
    const normalized = normalizeText(fromRequestedData);
    if (normalized) {
      return normalized;
    }
  }
  const samplePresetPath = normalizeText(details.samplePresetPath);
  if (samplePresetPath) {
    return samplePresetPath;
  }
  return normalizeText(details.requestedPath);
}

function inferExpectedSchema(dependencyId, contract, details) {
  if (dependencyId === "palette" || contract.canonicalPaletteExpected) {
    return CANONICAL_PALETTE_SCHEMA;
  }
  return normalizeText(details.expectedSchema);
}

function inferRequiredArrayFields(dependencyId, contract, details) {
  const explicit = normalizeShapeList(details.requiredArrayFields);
  if (explicit.length > 0) {
    return explicit;
  }
  if (dependencyId === "palette" || contract.canonicalPaletteExpected) {
    return [...CANONICAL_PALETTE_REQUIRED_ARRAY_FIELDS];
  }
  return [];
}

function inferRequiredFields(contract, requiredArrayFields, details) {
  const explicit = normalizeShapeList(details.requiredFields);
  if (explicit.length > 0) {
    return explicit;
  }
  return contract.requiredPayloadShape.filter((field) => !requiredArrayFields.includes(field));
}

function buildExpectedBlock(details, contract) {
  const dependencyId = inferPrimaryDependencyId(contract, details);
  const expectedPathKey = inferExpectedPathKey(details);
  const expectedPath = inferExpectedPath(details, expectedPathKey);
  const expectedSchema = inferExpectedSchema(dependencyId, contract, details);
  const requiredArrayFields = inferRequiredArrayFields(dependencyId, contract, details);
  const requiredFields = inferRequiredFields(contract, requiredArrayFields, details);
  const expectedTopLevelShape = makeUniqueList([
    ...requiredFields,
    ...requiredArrayFields,
    ...contract.optionalPayloadShape
  ]);

  return {
    dependencyId,
    expectedPathKey,
    expectedPath,
    expectedSchema,
    expectedTopLevelShape,
    requiredFields,
    requiredArrayFields
  };
}

function readHttpStatus(details) {
  const directStatus = Number(details.httpStatus);
  if (Number.isFinite(directStatus) && directStatus > 0) {
    return directStatus;
  }
  const status = Number(details.status);
  if (Number.isFinite(status) && status > 0) {
    return status;
  }
  return null;
}

function buildFieldPresence(expected, topLevelKeys) {
  const presence = {};
  expected.requiredFields.forEach((field) => {
    presence[field] = topLevelKeys.includes(field);
  });
  expected.requiredArrayFields.forEach((field) => {
    presence[field] = topLevelKeys.includes(field);
  });
  return presence;
}

function buildArrayCounts(expected, details) {
  const arrayCounts = {};
  const explicitCounts = details.arrayCounts && typeof details.arrayCounts === "object" ? details.arrayCounts : {};
  expected.requiredArrayFields.forEach((field) => {
    const explicitValue = Number(explicitCounts[field]);
    if (Number.isFinite(explicitValue) && explicitValue >= 0) {
      arrayCounts[field] = explicitValue;
      return;
    }
    if (field === "swatches") {
      const swatchCount = Number(details?.loaded?.palette?.swatchCount);
      arrayCounts[field] = Number.isFinite(swatchCount) && swatchCount >= 0 ? swatchCount : 0;
      return;
    }
    arrayCounts[field] = 0;
  });
  return arrayCounts;
}

function buildActualBlock(details, expected) {
  const topLevelKeys = normalizeShapeList(
    details.receivedTopLevelKeys
      || details.topLevelKeys
      || details?.loaded?.topLevelKeys
  );
  const actual = {
    requestedPath: normalizeText(details.requestedPath) || normalizeText(details.samplePresetPath),
    fetchUrl: normalizeText(details.fetchUrl),
    httpStatus: readHttpStatus(details),
    loadedSchema: normalizeText(details.loadedSchema) || normalizeText(details?.loaded?.loadedSchema),
    topLevelKeys,
    fieldPresence: buildFieldPresence(expected, topLevelKeys),
    arrayCounts: buildArrayCounts(expected, details)
  };
  return actual;
}

function getMissingRequiredFields(expected, actual) {
  const missingFields = expected.requiredFields.filter((field) => actual.fieldPresence[field] !== true);
  const missingArrays = expected.requiredArrayFields.filter((field) => Number(actual.arrayCounts[field] || 0) <= 0);
  return makeUniqueList([...missingFields, ...missingArrays]);
}

function buildCacheKey(toolId, sampleId, samplePresetPath, dependencyId) {
  return `${normalizeText(toolId)}|${normalizeText(sampleId)}|${normalizeText(samplePresetPath)}|${normalizeText(dependencyId)}`;
}

function clearClassificationCacheForScope(details) {
  const scopePrefix = `${normalizeText(details.toolId)}|${normalizeText(details.sampleId)}|${normalizeText(details.samplePresetPath)}|`;
  [...CLASSIFICATION_CACHE.keys()].forEach((key) => {
    if (key.startsWith(scopePrefix)) {
      CLASSIFICATION_CACHE.delete(key);
    }
  });
}

function cacheLoaded(details, expected, actual) {
  const dependencyId = normalizeText(expected.dependencyId);
  if (!dependencyId) {
    return;
  }
  const key = buildCacheKey(details.toolId, details.sampleId, details.samplePresetPath, dependencyId);
  LAST_LOADED_CACHE.set(key, {
    expected,
    actual
  });
}

function getCachedLoaded(details, expected) {
  const dependencyId = normalizeText(expected.dependencyId);
  if (!dependencyId) {
    return null;
  }
  const key = buildCacheKey(details.toolId, details.sampleId, details.samplePresetPath, dependencyId);
  return LAST_LOADED_CACHE.get(key) || null;
}

function isHttpFailure(details, actual) {
  if (details.ok === false) {
    return true;
  }
  const httpStatus = Number(actual.httpStatus);
  if (!Number.isFinite(httpStatus)) {
    return false;
  }
  return httpStatus < 200 || httpStatus >= 400;
}

function classifyLikelyCause(expected, actual, details, missingRequiredFields) {
  const errorText = normalizeText(details.error).toLowerCase();
  if (missingRequiredFields.includes("spriteProject")) {
    return "wrong path or wrong wrapper";
  }
  if (isHttpFailure(details, actual)) {
    return "wrong path";
  }
  if (missingRequiredFields.length > 0) {
    if (actual.topLevelKeys.includes("tool") || actual.topLevelKeys.includes("config")) {
      return "wrong wrapper";
    }
    return "missing field";
  }
  if (/invalid json|unexpected token|json/.test(errorText)) {
    return "invalid json";
  }
  return "unknown";
}

function deriveClassification(boundary, details, expected, actual) {
  const missingRequiredFields = getMissingRequiredFields(expected, actual);
  if (boundary === "request") {
    return null;
  }
  if (boundary === "fetch") {
    if (normalizeText(details.phase) !== "response") {
      return null;
    }
    if (isHttpFailure(details, actual)) {
      return CLASSIFICATION_VALUES.wrongPath;
    }
    return null;
  }
  if (boundary === "loaded") {
    return missingRequiredFields.length > 0
      ? CLASSIFICATION_VALUES.wrongShape
      : CLASSIFICATION_VALUES.success;
  }
  if (!actual.requestedPath && !actual.fetchUrl && actual.topLevelKeys.length === 0) {
    return CLASSIFICATION_VALUES.missing;
  }
  if (isHttpFailure(details, actual)) {
    return CLASSIFICATION_VALUES.wrongPath;
  }
  return missingRequiredFields.length > 0
    ? CLASSIFICATION_VALUES.wrongShape
    : CLASSIFICATION_VALUES.success;
}

function emitClassification(details, expected, actual, classification, note = "") {
  if (!classification) {
    return;
  }
  const cacheKey = buildCacheKey(details.toolId, details.sampleId, details.samplePresetPath, expected.dependencyId);
  if (CLASSIFICATION_CACHE.has(cacheKey)) {
    return;
  }
  CLASSIFICATION_CACHE.set(cacheKey, classification);
  emitToolLoadLog(TOOL_LOAD_PREFIXES.classification, {
    toolId: normalizeText(details.toolId),
    sampleId: normalizeText(details.sampleId),
    samplePresetPath: normalizeText(details.samplePresetPath),
    classification,
    expected,
    actual,
    note: normalizeText(note)
  });
}

function findPalettePathCandidate(details) {
  const requestedDataPaths = details.requestedDataPaths && typeof details.requestedDataPaths === "object"
    ? details.requestedDataPaths
    : {};
  const launchQuery = details.launchQuery && typeof details.launchQuery === "object"
    ? details.launchQuery
    : {};

  const candidateFromRequested = Object.entries(requestedDataPaths).find(([key, value]) => {
    if (!/palette/i.test(key)) {
      return false;
    }
    const normalizedValue = Array.isArray(value)
      ? normalizeText(value[0])
      : normalizeText(value);
    return Boolean(normalizedValue);
  });
  if (candidateFromRequested) {
    const normalizedValue = Array.isArray(candidateFromRequested[1])
      ? normalizeText(candidateFromRequested[1][0])
      : normalizeText(candidateFromRequested[1]);
    return {
      expectedPathKey: candidateFromRequested[0],
      expectedPath: normalizedValue
    };
  }

  const candidateFromQuery = Object.entries(launchQuery).find(([key, value]) => {
    if (!/palette/i.test(key) || !/(path|href|url)$/i.test(key)) {
      return false;
    }
    const normalizedValue = Array.isArray(value)
      ? normalizeText(value[0])
      : normalizeText(value);
    return Boolean(normalizedValue);
  });
  if (candidateFromQuery) {
    const normalizedValue = Array.isArray(candidateFromQuery[1])
      ? normalizeText(candidateFromQuery[1][0])
      : normalizeText(candidateFromQuery[1]);
    return {
      expectedPathKey: candidateFromQuery[0],
      expectedPath: normalizedValue
    };
  }

  return null;
}

function emitMissingPaletteClassification(details, contract) {
  if (!contract.paletteCapable) {
    return;
  }
  const palettePath = findPalettePathCandidate(details);
  if (palettePath?.expectedPath) {
    return;
  }

  const expected = {
    dependencyId: "palette",
    expectedPathKey: palettePath?.expectedPathKey || "palettePath",
    expectedPath: "",
    expectedSchema: CANONICAL_PALETTE_SCHEMA,
    expectedTopLevelShape: [...CANONICAL_PALETTE_REQUIRED_FIELDS],
    requiredFields: CANONICAL_PALETTE_REQUIRED_FIELDS.filter((field) => field !== "swatches"),
    requiredArrayFields: [...CANONICAL_PALETTE_REQUIRED_ARRAY_FIELDS]
  };
  const actual = {
    requestedPath: "",
    fetchUrl: "",
    httpStatus: null,
    loadedSchema: "",
    topLevelKeys: [],
    fieldPresence: {
      schema: false,
      version: false,
      name: false,
      swatches: false
    },
    arrayCounts: {
      swatches: 0
    },
    requested: false,
    fetched: false,
    loaded: false
  };
  emitClassification(
    details,
    expected,
    actual,
    CLASSIFICATION_VALUES.missing,
    "Expected palette dependency was not requested, not fetched, and not loaded."
  );
}

function buildEventPayload(boundary, details) {
  const safeDetails = sanitizePayload(details);
  const contract = getToolContract(safeDetails.toolId);
  const expected = buildExpectedBlock(safeDetails, contract);
  const actual = buildActualBlock(safeDetails, expected);
  const payload = {
    ...safeDetails,
    expected,
    actual
  };

  if (boundary === "loaded") {
    const missingRequiredFields = getMissingRequiredFields(expected, actual);
    expected.missingRequiredFields = missingRequiredFields;
    expected.contractMatch = missingRequiredFields.length === 0;
    cacheLoaded(safeDetails, expected, actual);
  } else if (boundary === "warning" || boundary === "error") {
    const cached = getCachedLoaded(safeDetails, expected);
    if (cached?.actual?.topLevelKeys?.length > 0 && actual.topLevelKeys.length === 0) {
      actual.topLevelKeys = cached.actual.topLevelKeys;
      actual.fieldPresence = buildFieldPresence(expected, actual.topLevelKeys);
      actual.arrayCounts = {
        ...actual.arrayCounts,
        ...cached.actual.arrayCounts
      };
    }
    if (!actual.loadedSchema && normalizeText(cached?.actual?.loadedSchema)) {
      actual.loadedSchema = normalizeText(cached.actual.loadedSchema);
    }
    const missingRequiredFields = getMissingRequiredFields(expected, actual);
    expected.missingRequiredFields = missingRequiredFields;
    expected.likelyCause = classifyLikelyCause(expected, actual, safeDetails, missingRequiredFields);
    expected.contractMatch = missingRequiredFields.length === 0;
  }

  return {
    payload,
    contract
  };
}

function emitBoundaryAndClassification(boundary, prefix, details) {
  if (boundary === "request") {
    clearClassificationCacheForScope(details);
  }
  const { payload, contract } = buildEventPayload(boundary, details);
  emitToolLoadLog(prefix, payload);

  if (boundary === "request") {
    emitMissingPaletteClassification(payload, contract);
    return;
  }

  const classification = deriveClassification(boundary, payload, payload.expected, payload.actual);
  emitClassification(payload, payload.expected, payload.actual, classification);
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
    loadedSchema: extractLoadedSchema(value),
    topLevelKeys: summarizeTopLevelKeys(value),
    palette: summarizePaletteData(value),
    sprite: summarizeSpriteData(value),
    replay: summarizeReplayData(value)
  };
}

export function logToolLoadRequest(details = {}) {
  emitBoundaryAndClassification("request", TOOL_LOAD_PREFIXES.request, details);
}

export function logToolLoadFetch(details = {}) {
  emitBoundaryAndClassification("fetch", TOOL_LOAD_PREFIXES.fetch, details);
}

export function logToolLoadLoaded(details = {}) {
  emitBoundaryAndClassification("loaded", TOOL_LOAD_PREFIXES.loaded, details);
}

export function logToolLoadError(details = {}) {
  emitBoundaryAndClassification("error", TOOL_LOAD_PREFIXES.error, details);
}

export function logToolLoadWarning(details = {}) {
  emitBoundaryAndClassification("warning", TOOL_LOAD_PREFIXES.warning, details);
  if (normalizeText(details.error)) {
    emitBoundaryAndClassification("error", TOOL_LOAD_PREFIXES.error, details);
  }
}
