import { cloneValue, safeString } from "./projectSystemValueUtils.js";

export const PROJECT_TOOL_INTEGRATION_SCHEMA = "html-js-gaming.project-tool-integration";
export const PROJECT_TOOL_INTEGRATION_VERSION = 1;

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
  const state = unwrapToolStateForAdapter(safeToolId, rawState);

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

  Object.entries(sourceTools).forEach(([toolId, toolState]) => {
    const safeToolId = normalizeId(toolId);
    if (!safeToolId || !toolState || typeof toolState !== "object") {
      return;
    }

    const normalizedState = normalizeToolStateForProjectManifest(safeToolId, toolState);
    const assetReferences = extractToolAssetReferences(safeToolId, normalizedState);
    aggregateRefs = mergeAssetRefs(aggregateRefs, assetReferences);

    tools[safeToolId] = {
      toolId: safeToolId,
      assetReferences
    };
  });

  return {
    schema: PROJECT_TOOL_INTEGRATION_SCHEMA,
    version: PROJECT_TOOL_INTEGRATION_VERSION,
    tools,
    assetReferences: aggregateRefs
  };
}
