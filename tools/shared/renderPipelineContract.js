/*
Toolbox Aid
David Quesenberry
04/05/2026
renderPipelineContract.js
*/
import { normalizeProjectRelativePath } from "./projectAssetRegistry.js";
import {
  createVersionedContractMetadata,
  createVersionedContractPolicy,
  evaluateContractVersion,
  normalizeContractVersion
} from "./contractVersioning.js";

export const RENDER_CONTRACT_VERSION = "1.0.0";
export const RENDER_CONTRACT_ID = "toolbox.render.contract";
export const ASSET_DOCUMENT_TYPE = "toolbox.render.asset-document";
export const COMPOSITION_DOCUMENT_TYPE = "toolbox.render.composition-document";
const RENDER_CONTRACT_POLICY = createVersionedContractPolicy({
  contractId: RENDER_CONTRACT_ID,
  currentVersion: RENDER_CONTRACT_VERSION,
  supportedVersions: ["1", "1.0", "1.0.0"],
  deprecatedVersions: []
});

const ALLOWED_ASSET_TYPES = new Set(["image", "spritesheet", "vector", "tileset", "template"]);
const ALLOWED_ASSET_SOURCE = new Set(["relative"]);
const ALLOWED_ASSET_ROLE = new Set(["render", "collision", "reference", "ui"]);
const ALLOWED_LAYER_KINDS = new Set(["parallax", "tilemap", "sprite", "vector", "collision", "guide", "overlay"]);
const ALLOWED_RUNTIME_INCLUSION = new Set(["gameplay", "debug", "editor-only"]);
const ALLOWED_COMPOSITION_ROLES = new Set(["parallax", "tilemap", "sprite", "vector", "overlay"]);

const LAYER_RENDER_BUCKETS = Object.freeze({
  parallax: 0,
  tilemap: 1,
  sprite: 2,
  vector: 3,
  overlay: 4,
  collision: 5,
  guide: 6
});

export const TOOL_ENGINE_MAPPINGS = Object.freeze({
  "tile-map-editor": Object.freeze({
    allowedLayerKinds: Object.freeze(["tilemap", "collision", "guide", "overlay"]),
    engineTargets: Object.freeze(["engine/tilemap", "engine/collision", "engine/render"]) 
  }),
  "parallax-editor": Object.freeze({
    allowedLayerKinds: Object.freeze(["parallax", "guide", "overlay"]),
    engineTargets: Object.freeze(["engine/camera", "engine/render"]) 
  }),
  "sprite-editor": Object.freeze({
    allowedLayerKinds: Object.freeze(["sprite", "guide", "overlay"]),
    engineTargets: Object.freeze(["engine/animation", "engine/render", "engine/entity"]) 
  }),
  "vector-asset-studio": Object.freeze({
    allowedLayerKinds: Object.freeze(["vector", "guide", "overlay"]),
    engineTargets: Object.freeze(["engine/vector", "engine/render"]) 
  }),
  "composition-manifest": Object.freeze({
    allowedLayerKinds: Object.freeze([]),
    engineTargets: Object.freeze(["engine/render"]) 
  })
});

const STAGES = Object.freeze(["load", "validate", "normalize", "resolve", "compose", "sequence", "render"]);

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function cloneJson(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function createStageStatus(stage, status, message = "") {
  return {
    stage,
    status,
    message: sanitizeText(message)
  };
}

function createContractError(stage, code, path, message, details = {}) {
  return {
    level: "error",
    stage: sanitizeText(stage) || "validate",
    code: sanitizeText(code) || "RENDER_CONTRACT_ERROR",
    path: sanitizeText(path),
    message: sanitizeText(message) || "Render contract error.",
    details: details && typeof details === "object" ? cloneJson(details) : {}
  };
}

function pushError(errors, stage, code, path, message, details = {}) {
  errors.push(createContractError(stage, code, path, message, details));
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateEnvelope(document, expectedType, errors, pathPrefix) {
  const rootPath = sanitizeText(pathPrefix) || "document";
  if (!isObject(document)) {
    pushError(errors, "validate", "INVALID_DOCUMENT", rootPath, "Document must be an object.");
    return false;
  }

  if (sanitizeText(document.documentType) !== expectedType) {
    pushError(
      errors,
      "validate",
      "INVALID_DOCUMENT_TYPE",
      `${rootPath}.documentType`,
      `Expected ${expectedType} document type.`
    );
  }

  const versionCheck = evaluateContractVersion(document.contractVersion, RENDER_CONTRACT_POLICY);
  if (versionCheck.status !== "ready") {
    pushError(
      errors,
      "validate",
      sanitizeText(versionCheck.code) || "UNSUPPORTED_CONTRACT_VERSION",
      `${rootPath}.contractVersion`,
      sanitizeText(versionCheck.message) || `Expected contractVersion ${RENDER_CONTRACT_VERSION}.`
    );
  } else {
    document.contractVersion = normalizeContractVersion(document.contractVersion);
  }

  const producerTool = sanitizeText(document?.producer?.tool);
  if (!producerTool) {
    pushError(errors, "validate", "MISSING_PRODUCER_TOOL", `${rootPath}.producer.tool`, "producer.tool is required.");
  } else if (!Object.prototype.hasOwnProperty.call(TOOL_ENGINE_MAPPINGS, producerTool)) {
    pushError(errors, "validate", "UNKNOWN_PRODUCER_TOOL", `${rootPath}.producer.tool`, `Unsupported producer tool ${producerTool}.`);
  }

  if (!sanitizeText(document?.producer?.toolVersion)) {
    pushError(errors, "validate", "MISSING_PRODUCER_VERSION", `${rootPath}.producer.toolVersion`, "producer.toolVersion is required.");
  }

  if (!isObject(document.document)) {
    pushError(errors, "validate", "MISSING_DOCUMENT_BLOCK", `${rootPath}.document`, "document block is required.");
  } else {
    if (!sanitizeText(document.document.id)) {
      pushError(errors, "validate", "MISSING_DOCUMENT_ID", `${rootPath}.document.id`, "document.id is required.");
    }
    if (!sanitizeText(document.document.name)) {
      pushError(errors, "validate", "MISSING_DOCUMENT_NAME", `${rootPath}.document.name`, "document.name is required.");
    }
    if (sanitizeText(document.document.coordinateSpace) !== "2d") {
      pushError(errors, "validate", "INVALID_COORDINATE_SPACE", `${rootPath}.document.coordinateSpace`, "document.coordinateSpace must be 2d.");
    }
    if (sanitizeText(document.document.units) !== "pixels") {
      pushError(errors, "validate", "INVALID_DOCUMENT_UNITS", `${rootPath}.document.units`, "document.units must be pixels.");
    }
  }

  if (!isObject(document.metadata)) {
    pushError(errors, "validate", "INVALID_METADATA_BLOCK", `${rootPath}.metadata`, "metadata must be an object.");
  }

  if (!isObject(document.payload)) {
    pushError(errors, "validate", "INVALID_PAYLOAD_BLOCK", `${rootPath}.payload`, "payload must be an object.");
  }

  return errors.length === 0;
}

function validateUniqueIds(entries, idSelector, pathPrefix, errors) {
  const seen = new Set();
  (Array.isArray(entries) ? entries : []).forEach((entry, index) => {
    const id = sanitizeText(idSelector(entry));
    if (!id) {
      return;
    }
    if (seen.has(id)) {
      pushError(errors, "validate", "DUPLICATE_ID", `${pathPrefix}[${index}].id`, `Duplicate id ${id}.`);
      return;
    }
    seen.add(id);
  });
}

function validateAssetRecords(payload, errors, pathPrefix) {
  if (!Array.isArray(payload.assets)) {
    pushError(errors, "validate", "INVALID_ASSET_COLLECTION", `${pathPrefix}.assets`, "payload.assets must be an array.");
    return;
  }

  validateUniqueIds(payload.assets, (entry) => entry?.id, `${pathPrefix}.assets`, errors);

  const pathByType = new Set();

  payload.assets.forEach((asset, index) => {
    const base = `${pathPrefix}.assets[${index}]`;
    const id = sanitizeText(asset?.id);
    const type = sanitizeText(asset?.type);
    const source = sanitizeText(asset?.source);
    const role = sanitizeText(asset?.role);
    const path = normalizeProjectRelativePath(asset?.path);

    if (!id) {
      pushError(errors, "validate", "MISSING_ASSET_ID", `${base}.id`, "Asset id is required.");
    }
    if (!ALLOWED_ASSET_TYPES.has(type)) {
      pushError(errors, "validate", "INVALID_ASSET_TYPE", `${base}.type`, `Unsupported asset type ${type || "unknown"}.`);
    }
    if (!ALLOWED_ASSET_SOURCE.has(source)) {
      pushError(errors, "validate", "INVALID_ASSET_SOURCE", `${base}.source`, "Asset source must be relative.");
    }
    if (!ALLOWED_ASSET_ROLE.has(role)) {
      pushError(errors, "validate", "INVALID_ASSET_ROLE", `${base}.role`, `Unsupported asset role ${role || "unknown"}.`);
    }
    if (!path) {
      pushError(errors, "validate", "INVALID_ASSET_PATH", `${base}.path`, "Asset path must be a normalized project-relative path.");
    }
    if (typeof asset?.preload !== "boolean") {
      pushError(errors, "validate", "INVALID_ASSET_PRELOAD", `${base}.preload`, "Asset preload must be boolean.");
    }
    if (!isObject(asset?.metadata)) {
      pushError(errors, "validate", "INVALID_ASSET_METADATA", `${base}.metadata`, "Asset metadata must be an object.");
    }

    if (type && path) {
      const pairKey = `${type}|${path}`;
      if (pathByType.has(pairKey)) {
        pushError(errors, "validate", "DUPLICATE_ASSET_TYPE_PATH", `${base}.path`, `Duplicate asset type/path pair ${pairKey}.`);
      }
      pathByType.add(pairKey);
    }
  });
}

function validateItemRecords(items, assetIds, layerPath, errors) {
  if (!Array.isArray(items)) {
    pushError(errors, "validate", "INVALID_LAYER_ITEMS", `${layerPath}.items`, "Layer items must be an array.");
    return;
  }

  validateUniqueIds(items, (entry) => entry?.id, `${layerPath}.items`, errors);

  items.forEach((item, itemIndex) => {
    const itemPath = `${layerPath}.items[${itemIndex}]`;
    if (!sanitizeText(item?.id)) {
      pushError(errors, "validate", "MISSING_ITEM_ID", `${itemPath}.id`, "Item id is required.");
    }
    if (!sanitizeText(item?.type)) {
      pushError(errors, "validate", "MISSING_ITEM_TYPE", `${itemPath}.type`, "Item type is required.");
    }
    if (typeof item?.order !== "number" || !Number.isFinite(item.order)) {
      pushError(errors, "validate", "INVALID_ITEM_ORDER", `${itemPath}.order`, "Item order must be numeric.");
    }
    if (!isObject(item?.transform)) {
      pushError(errors, "validate", "INVALID_ITEM_TRANSFORM", `${itemPath}.transform`, "Item transform is required.");
    } else {
      ["x", "y", "scaleX", "scaleY", "rotation"].forEach((field) => {
        if (typeof item.transform[field] !== "number" || !Number.isFinite(item.transform[field])) {
          pushError(errors, "validate", "INVALID_ITEM_TRANSFORM_FIELD", `${itemPath}.transform.${field}`, `transform.${field} must be numeric.`);
        }
      });
    }

    if (!isObject(item?.metadata)) {
      pushError(errors, "validate", "INVALID_ITEM_METADATA", `${itemPath}.metadata`, "Item metadata must be an object.");
    }

    const assetId = sanitizeText(item?.assetId);
    if (assetId && !assetIds.has(assetId)) {
      pushError(errors, "validate", "MISSING_ASSET_REFERENCE", `${itemPath}.assetId`, `Item assetId ${assetId} is not declared in payload.assets.`);
    }
  });
}

function validateLayerRecords(payload, producerTool, errors, pathPrefix) {
  if (!Array.isArray(payload.layers)) {
    pushError(errors, "validate", "INVALID_LAYER_COLLECTION", `${pathPrefix}.layers`, "payload.layers must be an array.");
    return;
  }

  validateUniqueIds(payload.layers, (entry) => entry?.id, `${pathPrefix}.layers`, errors);

  const mapping = TOOL_ENGINE_MAPPINGS[producerTool] || { allowedLayerKinds: [] };
  const allowedKinds = new Set(mapping.allowedLayerKinds || []);
  const assetIds = new Set((Array.isArray(payload.assets) ? payload.assets : []).map((asset) => sanitizeText(asset?.id)).filter(Boolean));

  payload.layers.forEach((layer, layerIndex) => {
    const layerPath = `${pathPrefix}.layers[${layerIndex}]`;
    const kind = sanitizeText(layer?.kind);
    if (!sanitizeText(layer?.id)) {
      pushError(errors, "validate", "MISSING_LAYER_ID", `${layerPath}.id`, "Layer id is required.");
    }
    if (!sanitizeText(layer?.name)) {
      pushError(errors, "validate", "MISSING_LAYER_NAME", `${layerPath}.name`, "Layer name is required.");
    }
    if (!ALLOWED_LAYER_KINDS.has(kind)) {
      pushError(errors, "validate", "INVALID_LAYER_KIND", `${layerPath}.kind`, `Unsupported layer kind ${kind || "unknown"}.`);
    }

    if (!allowedKinds.has(kind)) {
      pushError(errors, "validate", "TOOL_ENGINE_MAPPING_VIOLATION", `${layerPath}.kind`, `Tool ${producerTool} cannot emit ${kind} layers.`);
    }

    if (typeof layer?.zIndex !== "number" || !Number.isInteger(layer.zIndex)) {
      pushError(errors, "validate", "INVALID_LAYER_ZINDEX", `${layerPath}.zIndex`, "Layer zIndex must be an integer.");
    }

    if (layer?.visible !== undefined && typeof layer.visible !== "boolean") {
      pushError(errors, "validate", "INVALID_LAYER_VISIBLE", `${layerPath}.visible`, "Layer visible must be boolean when provided.");
    }

    if (layer?.opacity !== undefined) {
      if (typeof layer.opacity !== "number" || !Number.isFinite(layer.opacity) || layer.opacity < 0 || layer.opacity > 1) {
        pushError(errors, "validate", "INVALID_LAYER_OPACITY", `${layerPath}.opacity`, "Layer opacity must be a number between 0 and 1.");
      }
    }

    const inclusion = sanitizeText(layer?.runtimeInclusion);
    if (!ALLOWED_RUNTIME_INCLUSION.has(inclusion)) {
      pushError(errors, "validate", "INVALID_RUNTIME_INCLUSION", `${layerPath}.runtimeInclusion`, `runtimeInclusion must be one of gameplay/debug/editor-only.`);
    }

    if (layer?.metadata !== undefined && !isObject(layer.metadata)) {
      pushError(errors, "validate", "INVALID_LAYER_METADATA", `${layerPath}.metadata`, "Layer metadata must be an object when provided.");
    }

    validateItemRecords(layer?.items, assetIds, layerPath, errors);
  });
}

function validateEntityRecords(payload, errors, pathPrefix) {
  if (!Array.isArray(payload.entities)) {
    pushError(errors, "validate", "INVALID_ENTITY_COLLECTION", `${pathPrefix}.entities`, "payload.entities must be an array.");
    return;
  }
  validateUniqueIds(payload.entities, (entry) => entry?.id, `${pathPrefix}.entities`, errors);
  payload.entities.forEach((entity, index) => {
    const entityPath = `${pathPrefix}.entities[${index}]`;
    if (!sanitizeText(entity?.id)) {
      pushError(errors, "validate", "MISSING_ENTITY_ID", `${entityPath}.id`, "Entity id is required.");
    }
    if (!sanitizeText(entity?.name)) {
      pushError(errors, "validate", "MISSING_ENTITY_NAME", `${entityPath}.name`, "Entity name is required.");
    }
  });
}

function validateAssetDocument(document, errors, pathPrefix = "entryDocument") {
  validateEnvelope(document, ASSET_DOCUMENT_TYPE, errors, pathPrefix);

  if (!isObject(document?.payload)) {
    return;
  }

  validateAssetRecords(document.payload, errors, `${pathPrefix}.payload`);
  validateLayerRecords(document.payload, sanitizeText(document?.producer?.tool), errors, `${pathPrefix}.payload`);
  validateEntityRecords(document.payload, errors, `${pathPrefix}.payload`);
}

function validateCompositionDocument(document, errors, pathPrefix = "entryDocument") {
  validateEnvelope(document, COMPOSITION_DOCUMENT_TYPE, errors, pathPrefix);

  if (!isObject(document?.payload)) {
    return;
  }

  const refsPath = `${pathPrefix}.payload.references`;
  if (!Array.isArray(document.payload.references)) {
    pushError(errors, "validate", "INVALID_COMPOSITION_REFERENCES", refsPath, "Composition payload.references must be an array.");
    return;
  }

  validateUniqueIds(document.payload.references, (entry) => entry?.id, refsPath, errors);

  document.payload.references.forEach((reference, index) => {
    const base = `${refsPath}[${index}]`;
    if (!sanitizeText(reference?.id)) {
      pushError(errors, "validate", "MISSING_COMPOSITION_REFERENCE_ID", `${base}.id`, "Composition reference id is required.");
    }
    const documentPath = normalizeProjectRelativePath(reference?.documentPath);
    if (!documentPath) {
      pushError(errors, "validate", "INVALID_COMPOSITION_REFERENCE_PATH", `${base}.documentPath`, "Composition documentPath must be project-relative.");
    }
    const role = sanitizeText(reference?.role);
    if (!ALLOWED_COMPOSITION_ROLES.has(role)) {
      pushError(errors, "validate", "INVALID_COMPOSITION_ROLE", `${base}.role`, `Composition role ${role || "unknown"} is not allowed.`);
    }
  });
}

function normalizeAssetDocument(document) {
  const cloned = cloneJson(document);
  const payload = cloned.payload;
  payload.assets = payload.assets.map((asset) => ({
    ...asset,
    path: normalizeProjectRelativePath(asset.path),
    metadata: isObject(asset.metadata) ? asset.metadata : {}
  }));

  payload.layers = payload.layers.map((layer, layerSourceIndex) => ({
    ...layer,
    visible: layer.visible !== false,
    opacity: layer.opacity === undefined ? 1 : layer.opacity,
    metadata: isObject(layer.metadata) ? layer.metadata : {},
    items: (Array.isArray(layer.items) ? layer.items : []).map((item, itemSourceIndex) => ({
      ...item,
      visible: item.visible !== false,
      metadata: isObject(item.metadata) ? item.metadata : {},
      _itemSourceIndex: itemSourceIndex
    })),
    _layerSourceIndex: layerSourceIndex
  }));

  payload.entities = Array.isArray(payload.entities) ? payload.entities : [];
  return cloned;
}

function normalizeCompositionDocument(document) {
  const cloned = cloneJson(document);
  cloned.payload.references = cloned.payload.references.map((reference, index) => ({
    ...reference,
    documentPath: normalizeProjectRelativePath(reference.documentPath),
    _referenceSourceIndex: index
  }));
  return cloned;
}

function resolveDocumentLookup(documentsByPath) {
  if (documentsByPath instanceof Map) {
    return documentsByPath;
  }

  const map = new Map();
  if (isObject(documentsByPath)) {
    Object.keys(documentsByPath).forEach((key) => {
      const normalized = normalizeProjectRelativePath(key);
      if (normalized) {
        map.set(normalized, documentsByPath[key]);
      }
    });
  }
  return map;
}

function composeFromAssetDocument(document, includeDebugLayers) {
  const payload = document.payload;
  const layers = payload.layers.filter((layer) => {
    const inclusion = sanitizeText(layer.runtimeInclusion);
    if (inclusion === "gameplay") {
      return true;
    }
    if (inclusion === "debug") {
      return includeDebugLayers === true;
    }
    return false;
  }).map((layer) => ({
    ...layer,
    _sourceDocumentId: document.document.id,
    _sourceDocumentOrder: 0
  }));

  return {
    scene: {
      id: document.document.id,
      name: document.document.name,
      coordinateSpace: "2d",
      units: "pixels"
    },
    assets: payload.assets.slice(),
    layers,
    entities: payload.entities.slice(),
    mappings: {
      [sanitizeText(document.producer.tool)]: TOOL_ENGINE_MAPPINGS[sanitizeText(document.producer.tool)]
    }
  };
}

function mergeAssets(targetAssets, nextAssets, errors) {
  const byId = new Map(targetAssets.map((asset) => [sanitizeText(asset.id), asset]));
  nextAssets.forEach((asset) => {
    const id = sanitizeText(asset.id);
    if (!id) {
      return;
    }

    if (!byId.has(id)) {
      byId.set(id, asset);
      return;
    }

    const existing = byId.get(id);
    const sameType = sanitizeText(existing.type) === sanitizeText(asset.type);
    const samePath = sanitizeText(existing.path) === sanitizeText(asset.path);
    if (!sameType || !samePath) {
      pushError(
        errors,
        "compose",
        "ASSET_ID_CONFLICT",
        `assets.${id}`,
        `Asset id conflict for ${id}; type/path mismatch across referenced documents.`
      );
    }
  });

  return Array.from(byId.values());
}

function composeFromCompositionDocument(compositionDocument, normalizedReferences, includeDebugLayers, errors) {
  const merged = {
    scene: {
      id: compositionDocument.document.id,
      name: compositionDocument.document.name,
      coordinateSpace: "2d",
      units: "pixels"
    },
    assets: [],
    layers: [],
    entities: [],
    mappings: {}
  };

  normalizedReferences.forEach((entry) => {
    const doc = entry.document;
    const tool = sanitizeText(doc.producer.tool);

    merged.mappings[tool] = TOOL_ENGINE_MAPPINGS[tool];
    merged.assets = mergeAssets(merged.assets, doc.payload.assets, errors);

    doc.payload.layers.forEach((layer) => {
      const inclusion = sanitizeText(layer.runtimeInclusion);
      if (inclusion === "editor-only") {
        return;
      }
      if (inclusion === "debug" && includeDebugLayers !== true) {
        return;
      }

      merged.layers.push({
        ...layer,
        _sourceDocumentId: doc.document.id,
        _sourceDocumentOrder: entry.reference._referenceSourceIndex,
        _sourceReferenceRole: entry.reference.role
      });
    });

    doc.payload.entities.forEach((entity, index) => {
      merged.entities.push({
        ...entity,
        _sourceDocumentId: doc.document.id,
        _sourceEntityIndex: index
      });
    });
  });

  return merged;
}

function sequenceLayersAndItems(model) {
  const layers = model.layers.slice();

  layers.sort((left, right) => {
    const leftBucket = LAYER_RENDER_BUCKETS[sanitizeText(left.kind)] ?? Number.MAX_SAFE_INTEGER;
    const rightBucket = LAYER_RENDER_BUCKETS[sanitizeText(right.kind)] ?? Number.MAX_SAFE_INTEGER;
    if (leftBucket !== rightBucket) {
      return leftBucket - rightBucket;
    }

    const leftZ = Number.isFinite(left.zIndex) ? left.zIndex : 0;
    const rightZ = Number.isFinite(right.zIndex) ? right.zIndex : 0;
    if (leftZ !== rightZ) {
      return leftZ - rightZ;
    }

    const leftDocumentOrder = Number.isFinite(left._sourceDocumentOrder) ? left._sourceDocumentOrder : 0;
    const rightDocumentOrder = Number.isFinite(right._sourceDocumentOrder) ? right._sourceDocumentOrder : 0;
    if (leftDocumentOrder !== rightDocumentOrder) {
      return leftDocumentOrder - rightDocumentOrder;
    }

    const leftLayerIndex = Number.isFinite(left._layerSourceIndex) ? left._layerSourceIndex : 0;
    const rightLayerIndex = Number.isFinite(right._layerSourceIndex) ? right._layerSourceIndex : 0;
    if (leftLayerIndex !== rightLayerIndex) {
      return leftLayerIndex - rightLayerIndex;
    }

    return sanitizeText(left.id).localeCompare(sanitizeText(right.id));
  });

  layers.forEach((layer) => {
    if (!Array.isArray(layer.items)) {
      layer.items = [];
      return;
    }

    layer.items.sort((left, right) => {
      const leftOrder = Number.isFinite(left.order) ? left.order : 0;
      const rightOrder = Number.isFinite(right.order) ? right.order : 0;
      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }
      const leftSourceIndex = Number.isFinite(left._itemSourceIndex) ? left._itemSourceIndex : 0;
      const rightSourceIndex = Number.isFinite(right._itemSourceIndex) ? right._itemSourceIndex : 0;
      if (leftSourceIndex !== rightSourceIndex) {
        return leftSourceIndex - rightSourceIndex;
      }
      return sanitizeText(left.id).localeCompare(sanitizeText(right.id));
    });
  });

  return {
    ...model,
    layers
  };
}

export function runRenderContractRuntimePath(options = {}) {
  const errors = [];
  const stageStatus = [];
  const includeDebugLayers = options.includeDebugLayers === true;
  const entryDocument = cloneJson(options.entryDocument || null);

  stageStatus.push(createStageStatus("load", "passed", "Entry document loaded."));

  if (!entryDocument) {
    pushError(errors, "load", "MISSING_ENTRY_DOCUMENT", "entryDocument", "entryDocument is required.");
    stageStatus.push(createStageStatus("load", "failed", "Entry document missing."));
    return { status: "failed", stageStatus, errors, output: null };
  }

  const entryType = sanitizeText(entryDocument.documentType);
  if (entryType !== ASSET_DOCUMENT_TYPE && entryType !== COMPOSITION_DOCUMENT_TYPE) {
    pushError(errors, "validate", "INVALID_DOCUMENT_TYPE", "entryDocument.documentType", "Unsupported entry document type.");
    stageStatus.push(createStageStatus("validate", "failed", "Unsupported entry document type."));
    return { status: "failed", stageStatus, errors, output: null };
  }

  if (entryType === ASSET_DOCUMENT_TYPE) {
    validateAssetDocument(entryDocument, errors, "entryDocument");
  } else {
    validateCompositionDocument(entryDocument, errors, "entryDocument");
  }

  if (errors.length > 0) {
    stageStatus.push(createStageStatus("validate", "failed", "Validation failed."));
    return { status: "failed", stageStatus, errors, output: null };
  }
  stageStatus.push(createStageStatus("validate", "passed", "Validation passed."));

  const normalizedEntry = entryType === ASSET_DOCUMENT_TYPE
    ? normalizeAssetDocument(entryDocument)
    : normalizeCompositionDocument(entryDocument);
  stageStatus.push(createStageStatus("normalize", "passed", "Normalization passed."));

  const lookup = resolveDocumentLookup(options.documentsByPath || {});
  const normalizedRefs = [];

  if (entryType === COMPOSITION_DOCUMENT_TYPE) {
    normalizedEntry.payload.references.forEach((reference) => {
      const docPath = sanitizeText(reference.documentPath);
      const referencedDocument = lookup.get(docPath);
      if (!referencedDocument) {
        pushError(
          errors,
          "resolve",
          "MISSING_COMPOSITION_REFERENCE_DOCUMENT",
          `entryDocument.payload.references.${reference.id}.documentPath`,
          `Referenced asset document not found for ${docPath}.`
        );
        return;
      }

      const referencedClone = cloneJson(referencedDocument);
      validateAssetDocument(referencedClone, errors, `documentsByPath.${docPath}`);
      if (errors.length > 0) {
        return;
      }

      normalizedRefs.push({
        reference,
        document: normalizeAssetDocument(referencedClone)
      });
    });
  }

  if (errors.length > 0) {
    stageStatus.push(createStageStatus("resolve", "failed", "Reference resolution failed."));
    return { status: "failed", stageStatus, errors, output: null };
  }
  stageStatus.push(createStageStatus("resolve", "passed", "Reference resolution passed."));

  const composed = entryType === ASSET_DOCUMENT_TYPE
    ? composeFromAssetDocument(normalizedEntry, includeDebugLayers)
    : composeFromCompositionDocument(normalizedEntry, normalizedRefs, includeDebugLayers, errors);

  if (errors.length > 0) {
    stageStatus.push(createStageStatus("compose", "failed", "Composition failed."));
    return { status: "failed", stageStatus, errors, output: null };
  }
  stageStatus.push(createStageStatus("compose", "passed", "Composition passed."));

  const sequenced = sequenceLayersAndItems(composed);
  stageStatus.push(createStageStatus("sequence", "passed", "Deterministic sequencing passed."));

  stageStatus.push(createStageStatus("render", "passed", "Render-ready output produced."));

  return {
    status: "ready",
    stageStatus,
    errors,
    output: sequenced
  };
}

export function summarizeRenderContractRuntimePath(result) {
  if (!result || typeof result !== "object") {
    return "Render contract runtime path unavailable.";
  }

  if (result.status === "failed") {
    const code = sanitizeText(result.errors?.[0]?.code) || "UNKNOWN";
    return `Render contract runtime path failed at ${code}.`;
  }

  const layerCount = Array.isArray(result.output?.layers) ? result.output.layers.length : 0;
  const assetCount = Array.isArray(result.output?.assets) ? result.output.assets.length : 0;
  return `Render contract runtime path ready with ${layerCount} layers and ${assetCount} assets.`;
}

export function getRenderPipelineStageOrder() {
  return STAGES.slice();
}

export function getRenderContractVersionMetadata() {
  return createVersionedContractMetadata(RENDER_CONTRACT_POLICY);
}
