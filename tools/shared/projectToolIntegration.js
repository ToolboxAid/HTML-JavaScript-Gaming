import { cloneValue, safeString } from "./projectSystemValueUtils.js";

export const PROJECT_TOOL_INTEGRATION_SCHEMA = "html-js-gaming.project-tool-integration";
export const PROJECT_TOOL_INTEGRATION_VERSION = 1;
export const TOOL_DATA_CONTRACT_SCHEMA = "html-js-gaming.tool-data-contract";
export const TOOL_DATA_CONTRACT_VERSION = 1;
export const TOOL_STATE_DOCUMENT_KIND = "tool-state";

const TOOL_DATA_CONTRACT_IDS = Object.freeze({
  "tile-map-editor": "tool-state.tile-map-editor/1",
  "parallax-editor": "tool-state.parallax-editor/1",
  "sprite-editor": "tool-state.sprite-editor/1",
  "vector-map-editor": "tool-state.vector-map-editor/1",
  "vector-asset-studio": "tool-state.vector-asset-studio/1",
  "asset-browser": "tool-state.asset-browser/1",
  "palette-browser": "tool-state.palette-browser/1"
});

function normalizeId(value) {
  return safeString(value, "");
}

function normalizeIdList(values) {
  if (!Array.isArray(values)) {
    return [];
  }
  const seen = new Set();
  const output = [];
  values.forEach((value) => {
    const normalized = normalizeId(value);
    if (!normalized || seen.has(normalized)) {
      return;
    }
    seen.add(normalized);
    output.push(normalized);
  });
  return output;
}

function createEmptyNormalizedAssetReferences() {
  return {
    assetIds: [],
    paletteIds: [],
    spriteIds: [],
    vectorIds: [],
    tilesetIds: [],
    tilemapIds: [],
    imageIds: [],
    parallaxSourceIds: []
  };
}

function sanitizeAssetRefsBlock(rawRefs) {
  const source = rawRefs && typeof rawRefs === "object" ? rawRefs : {};
  return {
    assetIds: normalizeIdList(source.assetIds),
    paletteIds: normalizeIdList(source.paletteIds),
    spriteIds: normalizeIdList(source.spriteIds),
    vectorIds: normalizeIdList(source.vectorIds),
    tilesetIds: normalizeIdList(source.tilesetIds),
    tilemapIds: normalizeIdList(source.tilemapIds),
    imageIds: normalizeIdList(source.imageIds),
    parallaxSourceIds: normalizeIdList(source.parallaxSourceIds)
  };
}

function mergeAssetRefs(targetRefs, sourceRefs) {
  const output = sanitizeAssetRefsBlock(targetRefs);
  const source = sanitizeAssetRefsBlock(sourceRefs);

  Object.keys(output).forEach((key) => {
    output[key] = normalizeIdList([...(output[key] || []), ...(source[key] || [])]);
  });

  return output;
}

function addAssetRef(output, key, value) {
  const normalized = normalizeId(value);
  if (!normalized) {
    return;
  }
  output[key] = normalizeIdList([...(output[key] || []), normalized]);
}

function addAssetRefList(output, key, values) {
  normalizeIdList(values).forEach((value) => addAssetRef(output, key, value));
}

function readObject(value) {
  return value && typeof value === "object" ? value : {};
}

function stripVolatileToolFields(input) {
  if (Array.isArray(input)) {
    return input.map((entry) => stripVolatileToolFields(entry));
  }
  if (!input || typeof input !== "object") {
    return input;
  }
  const output = {};
  Object.entries(input).forEach(([key, value]) => {
    if (key === "capturedAt" || key === "imageDataUrl") {
      return;
    }
    output[key] = stripVolatileToolFields(value);
  });
  return output;
}

export function unwrapToolStateForAdapter(toolId, rawState) {
  const state = readObject(rawState);
  if (state.toolId === toolId && state.snapshot && typeof state.snapshot === "object") {
    return cloneValue(state.snapshot);
  }
  return cloneValue(state);
}

function normalizeDocumentAssetRefs(assetRefs) {
  const source = readObject(assetRefs);
  const normalized = {
    tilemapId: normalizeId(source.tilemapId),
    tilesetId: normalizeId(source.tilesetId),
    parallaxSourceIds: normalizeIdList(source.parallaxSourceIds)
  };

  if (normalizeId(source.parallaxSourceId)) {
    normalized.parallaxSourceIds = normalizeIdList([
      ...normalized.parallaxSourceIds,
      source.parallaxSourceId
    ]);
  }

  if (!normalized.tilemapId) {
    delete normalized.tilemapId;
  }
  if (!normalized.tilesetId) {
    delete normalized.tilesetId;
  }
  if (!normalized.parallaxSourceIds.length) {
    delete normalized.parallaxSourceIds;
  }

  return normalized;
}

function normalizeProjectAssetRefs(assetRefs) {
  const source = readObject(assetRefs);
  const normalized = {
    paletteId: normalizeId(source.paletteId),
    spriteId: normalizeId(source.spriteId),
    vectorId: normalizeId(source.vectorId),
    imageId: normalizeId(source.imageId),
    tilemapId: normalizeId(source.tilemapId),
    tilesetId: normalizeId(source.tilesetId),
    parallaxSourceIds: normalizeIdList(source.parallaxSourceIds)
  };

  if (normalizeId(source.parallaxSourceId)) {
    normalized.parallaxSourceIds = normalizeIdList([
      ...normalized.parallaxSourceIds,
      source.parallaxSourceId
    ]);
  }

  Object.keys(normalized).forEach((key) => {
    if (Array.isArray(normalized[key]) && normalized[key].length === 0) {
      delete normalized[key];
      return;
    }
    if (!Array.isArray(normalized[key]) && !normalized[key]) {
      delete normalized[key];
    }
  });

  return normalized;
}

export function normalizeToolStateForProjectManifest(toolId, rawState) {
  const safeToolId = normalizeId(toolId);
  const state = stripVolatileToolFields(unwrapToolStateForAdapter(safeToolId, rawState));

  if (!safeToolId || !state || typeof state !== "object") {
    return {};
  }

  if (safeToolId === "tile-map-editor" || safeToolId === "parallax-editor") {
    const nextState = cloneValue(state);
    nextState.documentModel = readObject(nextState.documentModel);
    nextState.documentModel.assetRefs = normalizeDocumentAssetRefs(nextState.documentModel.assetRefs);
    return nextState;
  }

  if (safeToolId === "sprite-editor") {
    const nextState = cloneValue(state);
    nextState.project = readObject(nextState.project);
    nextState.project.assetRefs = normalizeProjectAssetRefs(nextState.project.assetRefs);
    return nextState;
  }

  if (safeToolId === "vector-asset-studio") {
    const nextState = cloneValue(state);
    if (Object.prototype.hasOwnProperty.call(nextState, "selectedPaletteId")) {
      nextState.selectedPaletteId = normalizeId(nextState.selectedPaletteId);
    }
    return nextState;
  }

  if (safeToolId === "asset-browser") {
    const nextState = cloneValue(state);
    if (Object.prototype.hasOwnProperty.call(nextState, "selectedAssetId")) {
      nextState.selectedAssetId = normalizeId(nextState.selectedAssetId);
    }
    return nextState;
  }

  if (safeToolId === "palette-browser") {
    const nextState = cloneValue(state);
    if (Object.prototype.hasOwnProperty.call(nextState, "selectedPaletteId")) {
      nextState.selectedPaletteId = normalizeId(nextState.selectedPaletteId);
    }
    return nextState;
  }

  return cloneValue(state);
}

export function getToolDataContract(toolId) {
  const safeToolId = normalizeId(toolId);
  return {
    schema: TOOL_DATA_CONTRACT_SCHEMA,
    version: TOOL_DATA_CONTRACT_VERSION,
    toolId: safeToolId,
    contractId: TOOL_DATA_CONTRACT_IDS[safeToolId] || "tool-state.generic/1"
  };
}

export function validateToolStateContract(toolId, rawState) {
  const safeToolId = normalizeId(toolId);
  const sourceState = readObject(rawState);
  const normalizedState = normalizeToolStateForProjectManifest(safeToolId, sourceState);
  const issues = [];
  const warnings = [];

  if (!safeToolId) {
    issues.push("Tool id is required.");
  }

  if (!normalizedState || typeof normalizedState !== "object") {
    issues.push("Normalized tool state must be an object.");
  }

  if (safeToolId === "tile-map-editor" || safeToolId === "parallax-editor") {
    if (!sourceState.documentModel || typeof sourceState.documentModel !== "object") {
      issues.push("documentModel block is required.");
    }
    if (!readObject(sourceState.documentModel).assetRefs || typeof readObject(sourceState.documentModel).assetRefs !== "object") {
      issues.push("documentModel.assetRefs block is required.");
    }
  } else if (safeToolId === "sprite-editor") {
    if (!sourceState.project || typeof sourceState.project !== "object") {
      issues.push("project block is required.");
    }
    if (!readObject(sourceState.project).assetRefs || typeof readObject(sourceState.project).assetRefs !== "object") {
      issues.push("project.assetRefs block is required.");
    }
  } else if (!TOOL_DATA_CONTRACT_IDS[safeToolId]) {
    warnings.push(`No explicit tool data contract is registered for ${safeToolId || "(empty tool id)"}.`);
  }

  const contract = getToolDataContract(safeToolId);
  return {
    ...contract,
    valid: issues.length === 0,
    issues,
    warnings,
    normalizedState
  };
}

export function extractToolAssetReferences(toolId, rawState) {
  const safeToolId = normalizeId(toolId);
  const state = normalizeToolStateForProjectManifest(safeToolId, rawState);
  const refs = createEmptyNormalizedAssetReferences();

  if (safeToolId === "tile-map-editor") {
    const assetRefs = readObject(state?.documentModel?.assetRefs);
    addAssetRef(refs, "tilemapIds", assetRefs.tilemapId);
    addAssetRef(refs, "tilesetIds", assetRefs.tilesetId);
    addAssetRefList(refs, "parallaxSourceIds", assetRefs.parallaxSourceIds);
    return refs;
  }

  if (safeToolId === "parallax-editor") {
    const assetRefs = readObject(state?.documentModel?.assetRefs);
    addAssetRefList(refs, "parallaxSourceIds", assetRefs.parallaxSourceIds);
    return refs;
  }

  if (safeToolId === "sprite-editor") {
    const assetRefs = readObject(state?.project?.assetRefs);
    addAssetRef(refs, "spriteIds", assetRefs.spriteId);
    addAssetRef(refs, "paletteIds", assetRefs.paletteId);
    addAssetRef(refs, "vectorIds", assetRefs.vectorId);
    addAssetRef(refs, "imageIds", assetRefs.imageId);
    addAssetRef(refs, "tilesetIds", assetRefs.tilesetId);
    addAssetRef(refs, "tilemapIds", assetRefs.tilemapId);
    addAssetRefList(refs, "parallaxSourceIds", assetRefs.parallaxSourceIds);
    return refs;
  }

  if (safeToolId === "vector-asset-studio") {
    addAssetRef(refs, "paletteIds", state?.selectedPaletteId);
    return refs;
  }

  if (safeToolId === "asset-browser") {
    addAssetRef(refs, "assetIds", state?.selectedAssetId);
    return refs;
  }

  if (safeToolId === "palette-browser") {
    addAssetRef(refs, "paletteIds", state?.selectedPaletteId);
    return refs;
  }

  return refs;
}

export function buildProjectToolIntegration(rawTools) {
  const sourceTools = rawTools && typeof rawTools === "object" ? rawTools : {};
  const tools = {};
  let aggregateRefs = createEmptyNormalizedAssetReferences();
  const invalidTools = [];
  const warningsByTool = {};

  Object.entries(sourceTools).forEach(([toolId, toolState]) => {
    const safeToolId = normalizeId(toolId);
    if (!safeToolId || !toolState || typeof toolState !== "object") {
      return;
    }

    const contractValidation = validateToolStateContract(safeToolId, toolState);
    const normalizedState = contractValidation.normalizedState;
    const assetReferences = extractToolAssetReferences(safeToolId, normalizedState);
    aggregateRefs = mergeAssetRefs(aggregateRefs, assetReferences);
    if (!contractValidation.valid) {
      invalidTools.push(safeToolId);
    }
    if (contractValidation.warnings.length > 0) {
      warningsByTool[safeToolId] = cloneValue(contractValidation.warnings);
    }

    tools[safeToolId] = {
      documentKind: TOOL_STATE_DOCUMENT_KIND,
      toolId: safeToolId,
      contractId: contractValidation.contractId,
      contractVersion: contractValidation.version,
      contractStatus: contractValidation.valid ? "valid" : "invalid",
      contractIssues: cloneValue(contractValidation.issues),
      assetReferences
    };
  });

  return {
    schema: PROJECT_TOOL_INTEGRATION_SCHEMA,
    version: PROJECT_TOOL_INTEGRATION_VERSION,
    tools,
    assetReferences: aggregateRefs,
    contractSummary: {
      schema: TOOL_DATA_CONTRACT_SCHEMA,
      version: TOOL_DATA_CONTRACT_VERSION,
      status: invalidTools.length === 0 ? "valid" : "invalid",
      invalidToolIds: invalidTools,
      warningsByTool
    }
  };
}
