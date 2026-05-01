import { createToolHostManifest, getToolHostEntryById } from "../../tools/shared/toolHostManifest.js";
import { createToolHostRuntime } from "../../tools/shared/toolHostRuntime.js";
import { resolveToolIdAlias } from "../../tools/toolRegistry.js";
import {
  createAssetHandoff,
  createPaletteHandoff,
  writeSharedAssetHandoff,
  writeSharedPaletteHandoff
} from "../../tools/shared/assetUsageIntegration.js";
import {
  removeToolHostSharedContextById,
  writeToolHostSharedContext
} from "../../tools/shared/toolHostSharedContext.js";

const GAMES_METADATA_PATH = "/games/metadata/games.index.metadata.json";
const PRIMARY_GAME_ASSET_CATALOG_FILENAME = "workspace.asset-catalog.json";
const GAME_ASSET_CATALOG_SCHEMA = "html-js-gaming.game-asset-catalog";
const GAME_ASSET_CATALOG_VERSION = 1;
const WORKSPACE_MANIFEST_SCHEMA = "html-js-gaming.project";
const WORKSPACE_DOCUMENT_KIND = "workspace-manifest";
const WORKSPACE_MANIFEST_SCHEMA_PATH = "/tools/schemas/workspace.manifest.schema.json";
const WORKSPACE_SPECIAL_TOOL_KEY_MAP = Object.freeze({});
const gameAssetCatalogCache = new Map();
let workspaceSchemaContractPromise = null;

function deriveGameAssetCatalogPath(gameHref) {
  const href = normalizeGameHref(gameHref);
  if (!href) {
    return "";
  }
  if (href.endsWith("/index.html")) {
    return `${href.slice(0, -"/index.html".length)}/assets/${PRIMARY_GAME_ASSET_CATALOG_FILENAME}`;
  }
  if (href.endsWith("/")) {
    return `${href}assets/${PRIMARY_GAME_ASSET_CATALOG_FILENAME}`;
  }
  return "";
}

function normalizeGameAssetCatalogEntries(value) {
  const source = value && typeof value === "object" ? value : {};
  const entries = {};
  Object.entries(source).forEach(([assetId, rawEntry]) => {
    const safeAssetId = typeof assetId === "string" ? assetId.trim() : "";
    const entry = rawEntry && typeof rawEntry === "object" ? rawEntry : null;
    const path = typeof entry?.path === "string" ? entry.path.trim() : "";
    if (!safeAssetId || !path) {
      return;
    }
    entries[safeAssetId] = {
      path,
      kind: typeof entry.kind === "string" ? entry.kind.trim() : "",
      source: typeof entry.source === "string" ? entry.source.trim() : ""
    };
  });
  return entries;
}

function parseGameAssetCatalogPayload(payload) {
  const source = payload && typeof payload === "object" ? payload : {};
  const schema = typeof source.schema === "string" ? source.schema.trim() : "";
  const version = Number(source.version);
  const entries = normalizeGameAssetCatalogEntries(source.assets || source.entries);
  return {
    schema,
    version,
    entries
  };
}

async function readGameAssetCatalog(assetCatalogPath) {
  const normalizedPath = typeof assetCatalogPath === "string" ? assetCatalogPath.trim() : "";
  if (!normalizedPath) {
    return {};
  }
  if (gameAssetCatalogCache.has(normalizedPath)) {
    return gameAssetCatalogCache.get(normalizedPath);
  }
  try {
    const response = await fetch(normalizedPath, { cache: "no-store" });
    if (!response.ok) {
      gameAssetCatalogCache.set(normalizedPath, {});
      return {};
    }
    const payload = parseGameAssetCatalogPayload(await response.json());
    const validSchema = payload.schema === GAME_ASSET_CATALOG_SCHEMA;
    const validVersion = payload.version === GAME_ASSET_CATALOG_VERSION;
    const entries = validSchema && validVersion ? payload.entries : {};
    gameAssetCatalogCache.set(normalizedPath, entries);
    return entries;
  } catch {
    gameAssetCatalogCache.set(normalizedPath, {});
    return {};
  }
}

const refs = {
  mountButton: null,
  prevButton: document.querySelector("[data-tool-host-prev]"),
  nextButton: document.querySelector("[data-tool-host-next]"),
  unmountButton: null,
  standaloneLink: null,
  switchMetaText: null,
  statusText: null,
  currentLabel: document.querySelector("[data-tool-host-current-label]"),
  mountContainer: document.querySelector("[data-tool-host-mount-container]")
};

const manifest = createToolHostManifest();
const allToolIds = manifest.tools.map((tool) => tool.id);
let toolIds = [...allToolIds];
let currentGameFrame = null;
let currentGameHostContextId = "";
const TOOL_LAUNCH_PARAM_PREFIXES = Object.freeze({
  samplePresetPath: ["/samples/", "/games/"],
  gameHref: ["/games/"],
  workspaceHref: ["/tools/Workspace%20Manager/", "/tools/Workspace Manager/"],
  returnTo: ["/games/", "/samples/"]
});
let selectedToolId = "";
let pagerEventsBound = false;
let pagerMessageBridgeBound = false;
let workspaceShellStateBridgeBound = false;
let workspaceManifestToolDiagnostics = null;
let loadedSvgWorkspaceTileState = null;

function refreshPagerRefs() {
  refs.prevButton = document.querySelector("[data-tool-host-prev]");
  refs.nextButton = document.querySelector("[data-tool-host-next]");
  refs.currentLabel = document.querySelector("[data-tool-host-current-label]");
}

function normalizeTextParam(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeToken(value) {
  const token = normalizeTextParam(value).toLowerCase();
  return resolveToolIdAlias(token);
}

function readRegistryEntryUrl(entry = null) {
  return normalizeTextParam(entry?.launchPath || entry?.entryPoint || "");
}

function traceWorkspaceRegistryResolve(requestedToolId = "") {
  const normalizedToolId = normalizeToken(requestedToolId);
  const entry = getToolHostEntryById(manifest, normalizedToolId);
  console.log("[WORKSPACE_REGISTRY_RESOLVE]", {
    requestedToolId: normalizeTextParam(requestedToolId),
    normalizedToolId,
    registryToolId: entry?.id || "",
    displayName: entry?.displayName || "",
    entryUrl: readRegistryEntryUrl(entry),
    isSvg: normalizedToolId === "svg-asset-studio" || entry?.id === "svg-asset-studio"
  });
  return entry;
}

function traceWorkspaceToolTileRender(toolId = "") {
  const entry = traceWorkspaceRegistryResolve(toolId);
  console.log("[WORKSPACE_TOOL_TILE_RENDER]", {
    toolId: normalizeTextParam(toolId),
    displayName: entry?.displayName || "",
    entryUrl: readRegistryEntryUrl(entry),
    dataToolId: entry?.id || normalizeTextParam(toolId)
  });
  return entry;
}

function readToolIdFromWorkspaceClickTarget(target = null) {
  if (!(target instanceof Element)) {
    return "";
  }
  const closestWithToolId = target.closest("[data-tool-id]");
  const datasetToolId = normalizeTextParam(closestWithToolId?.dataset?.toolId);
  return datasetToolId ? normalizeToken(datasetToolId) : "";
}

function traceWorkspaceToolClick({ target = null, datasetToolId = "", resolvedToolId = "", source = "" } = {}) {
  const clickedText = target instanceof Element ? normalizeTextParam(target.textContent || "") : "";
  const eventTarget = target instanceof Element ? target.tagName.toLowerCase() : "";
  const closestToolId = target instanceof Element
    ? normalizeTextParam(target.closest("[data-tool-id]")?.dataset?.toolId)
    : "";
  console.log("[WORKSPACE_TOOL_CLICK]", {
    source,
    clickedText,
    datasetToolId: normalizeTextParam(datasetToolId),
    resolvedToolId: normalizeTextParam(resolvedToolId),
    eventTarget,
    closestToolId
  });
}

function normalizeToolsUsedList(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  const seen = new Set();
  const output = [];
  value.forEach((entry) => {
    const token = normalizeToken(entry);
    if (!token || seen.has(token)) {
      return;
    }
    seen.add(token);
    output.push(token);
  });
  return output;
}

function normalizeLocalHrefParam(value, allowedPrefixes = []) {
  const normalized = normalizeTextParam(value).replace(/\\/g, "/");
  if (!normalized || !normalized.startsWith("/") || normalized.includes("..")) {
    return "";
  }
  return allowedPrefixes.some((prefix) => normalized.startsWith(prefix)) ? normalized : "";
}

function isPlainObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function readDirectPayloadDocument(payload, documentKey = "") {
  if (!isPlainObject(payload)) {
    return null;
  }
  const node = payload[documentKey];
  return isPlainObject(node) ? node : null;
}

function inferAssetTypeFromDirectPayload(toolId = "", payload = null) {
  if (readDirectPayloadDocument(payload, "vectorMapDocument")) {
    return "vector-map";
  }
  if (readDirectPayloadDocument(payload, "vectorAssetDocument")) {
    return "vector";
  }
  if (readDirectPayloadDocument(payload, "tileMapDocument")) {
    return "tilemap";
  }
  if (readDirectPayloadDocument(payload, "parallaxDocument")) {
    return "parallax";
  }
  if (readDirectPayloadDocument(payload, "spriteProject")) {
    return "sprite";
  }
  if (readDirectPayloadDocument(payload, "skin")) {
    return "skin";
  }
  if (readDirectPayloadDocument(payload, "asset3d")) {
    return "model";
  }
  if (readDirectPayloadDocument(payload, "cameraPath")) {
    return "camera-path";
  }
  if (isPlainObject(payload?.assets)) {
    return "asset";
  }
  const normalizedToolId = normalizeToken(toolId);
  if (normalizedToolId === "vector-map-editor") {
    return "vector-map";
  }
  if (normalizedToolId === "svg-asset-studio") {
    return "vector";
  }
  if (normalizedToolId === "tile-map-editor") {
    return "tilemap";
  }
  if (normalizedToolId === "parallax-editor") {
    return "parallax";
  }
  if (normalizedToolId === "sprite-editor") {
    return "sprite";
  }
  if (normalizedToolId === "skin-editor") {
    return "skin";
  }
  if (normalizedToolId === "3d-asset-viewer") {
    return "model";
  }
  if (normalizedToolId === "3d-camera-path-editor") {
    return "camera-path";
  }
  return "asset";
}

function summarizeDirectToolPayloadLabel(toolId = "", payload = null) {
  if (!isPlainObject(payload)) {
    return "";
  }
  const normalizedToolId = normalizeToken(toolId) || normalizeTextParam(toolId).toLowerCase();

  if (normalizedToolId === "palette-browser"
    && payload.schema === "html-js-gaming.palette"
    && Array.isArray(payload.swatches)) {
    const paletteName = normalizeTextParam(payload.name || payload.id || "palette");
    return paletteName || "palette";
  }

  const vectorMapDocument = readDirectPayloadDocument(payload, "vectorMapDocument");
  if (vectorMapDocument) {
    return normalizeTextParam(vectorMapDocument.name || vectorMapDocument.id || "vector map");
  }

  const vectorAssetDocument = readDirectPayloadDocument(payload, "vectorAssetDocument");
  if (vectorAssetDocument) {
    const sourceName = normalizeTextParam(vectorAssetDocument.sourceName);
    if (sourceName) {
      return sourceName;
    }
    if (typeof vectorAssetDocument.svgText === "string" && vectorAssetDocument.svgText.trim()) {
      return "Inline SVG";
    }
    return "";
  }

  const tileMapDocument = readDirectPayloadDocument(payload, "tileMapDocument");
  if (tileMapDocument) {
    return normalizeTextParam(tileMapDocument?.map?.name || tileMapDocument.name || tileMapDocument.id || "tile map");
  }

  const parallaxDocument = readDirectPayloadDocument(payload, "parallaxDocument");
  if (parallaxDocument) {
    return normalizeTextParam(parallaxDocument?.map?.name || parallaxDocument.name || "parallax");
  }

  const spriteProject = readDirectPayloadDocument(payload, "spriteProject");
  if (spriteProject) {
    const frameCount = Array.isArray(spriteProject.frames) ? spriteProject.frames.length : 0;
    return frameCount > 0 ? `sprite project (${frameCount} frames)` : "sprite project";
  }

  const skin = readDirectPayloadDocument(payload, "skin");
  if (skin) {
    return normalizeTextParam(skin.name || skin.gameId || skin.projectId || "skin");
  }

  const assets = isPlainObject(payload.assets) ? payload.assets : null;
  if (assets) {
    const entryCount = Object.values(assets)
      .filter((entry) => isPlainObject(entry) && normalizeTextParam(entry.path || entry.runtimePath || entry.href))
      .length;
    return `asset map (${entryCount})`;
  }

  const pipelinePayload = readDirectPayloadDocument(payload, "pipelinePayload");
  if (pipelinePayload) {
    return normalizeTextParam(pipelinePayload.projectId || "pipeline payload");
  }

  const candidate = readDirectPayloadDocument(payload, "candidate");
  if (candidate) {
    return normalizeTextParam(candidate.id || candidate.name || "candidate");
  }

  const mapPayload = readDirectPayloadDocument(payload, "mapPayload");
  if (mapPayload) {
    return normalizeTextParam(mapPayload.mapId || mapPayload.id || "map payload");
  }

  const asset3d = readDirectPayloadDocument(payload, "asset3d");
  if (asset3d) {
    return normalizeTextParam(asset3d.assetId || asset3d.id || "3D asset");
  }

  const cameraPath = readDirectPayloadDocument(payload, "cameraPath");
  if (cameraPath) {
    return normalizeTextParam(cameraPath.pathId || cameraPath.id || "camera path");
  }

  const fallbackName = normalizeTextParam(payload.name || payload.id || "");
  return fallbackName;
}

function readWorkspaceDirectCardLabel(toolId = "") {
  const labelsByToolId = workspaceManifestToolDiagnostics?.directPayloadLabelByToolId instanceof Map
    ? workspaceManifestToolDiagnostics.directPayloadLabelByToolId
    : null;
  if (!labelsByToolId) {
    return "";
  }
  return normalizeTextParam(labelsByToolId.get(toolId) || "");
}

function writeSharedBindingsFromDirectPayload(toolId = "", payloadJson = null, paletteJson = null) {
  if (normalizeTextParam(toolId) === "svg-asset-studio") {
    return;
  }
  console.log("[LEGACY_BADGE_WRITE]", {
    source: "writeSharedBindingsFromDirectPayload",
    action: "requested",
    toolId: normalizeTextParam(toolId),
    hasPayloadJson: isPlainObject(payloadJson),
    hasPaletteJson: isPlainObject(paletteJson)
  });
  if (isPlainObject(paletteJson)
    && paletteJson.schema === "html-js-gaming.palette"
    && Array.isArray(paletteJson.swatches)) {
    const paletteName = normalizeTextParam(paletteJson.name || paletteJson.id || "palette");
    const colors = paletteJson.swatches
      .filter((swatch) => isPlainObject(swatch))
      .map((swatch) => ({
        symbol: normalizeTextParam(swatch.symbol),
        hex: normalizeTextParam(swatch.hex || swatch.color),
        name: normalizeTextParam(swatch.name)
      }));
    const paletteHandoff = createPaletteHandoff({
      paletteId: paletteName || "palette",
      displayName: paletteName || "palette",
      colors,
      metadata: {
        source: "workspace-manifest.direct-payload",
        toolId: normalizeTextParam(toolId)
      },
      sourceToolId: "workspace-manager"
    });
    if (paletteHandoff) {
      console.log("[LEGACY_BADGE_WRITE]", {
        source: "writeSharedBindingsFromDirectPayload",
        action: "write-palette-handoff",
        toolId: normalizeTextParam(toolId),
        paletteId: paletteHandoff.paletteId,
        displayName: paletteHandoff.displayName
      });
      writeSharedPaletteHandoff(paletteHandoff);
    }
  }

  if (!isPlainObject(payloadJson)) {
    return;
  }
  const label = summarizeDirectToolPayloadLabel(toolId, payloadJson);
  if (!label) {
    return;
  }
  const assetType = inferAssetTypeFromDirectPayload(toolId, payloadJson);
  const assetHandoff = createAssetHandoff({
    assetId: label,
    assetType,
    sourcePath: `workspace-manifest:${normalizeTextParam(toolId)}`,
    displayName: label,
    metadata: {
      source: "workspace-manifest.direct-payload",
      toolId: normalizeTextParam(toolId)
    },
    sourceToolId: "workspace-manager"
  });
  if (assetHandoff) {
    console.log("[LEGACY_BADGE_WRITE]", {
      source: "writeSharedBindingsFromDirectPayload",
      action: "write-asset-handoff",
      toolId: normalizeTextParam(toolId),
      assetId: assetHandoff.assetId,
      assetType: assetHandoff.assetType,
      displayName: assetHandoff.displayName,
      sourcePath: assetHandoff.sourcePath
    });
    writeSharedAssetHandoff(assetHandoff);
  }
}

function readLaunchUrlProof(sourceUrl = "") {
  try {
    const url = new URL(sourceUrl, window.location.href);
    return {
      iframeSrc: url.toString(),
      hosted: url.searchParams.get("hosted") || "",
      hostToolId: url.searchParams.get("hostToolId") || "",
      hostContextId: url.searchParams.get("hostContextId") || ""
    };
  } catch {
    return {
      iframeSrc: normalizeTextParam(sourceUrl),
      hosted: "",
      hostToolId: "",
      hostContextId: ""
    };
  }
}

function logWorkspaceToolLaunch({ requestedToolId = "", normalizedToolId = "", payloadJson = null, mountResult = null }) {
  const launchProof = readLaunchUrlProof(mountResult?.sourceUrl || mountResult?.frame?.src || "");
  const payloadKeys = payloadJson && typeof payloadJson === "object" && !Array.isArray(payloadJson)
    ? Object.keys(payloadJson)
    : [];
  console.log("[WORKSPACE_TOOL_LAUNCH]", {
    requestedToolId,
    normalizedToolId,
    entryUrl: launchProof.iframeSrc,
    iframeSrc: launchProof.iframeSrc,
    hosted: launchProof.hosted,
    hostToolId: launchProof.hostToolId,
    hostContextId: launchProof.hostContextId,
    hasPayloadJson: Boolean(payloadJson && typeof payloadJson === "object" && !Array.isArray(payloadJson)),
    payloadKeys
  });
  if (normalizedToolId === "svg-asset-studio") {
    const vectorAssetDocument = payloadJson?.vectorAssetDocument;
    const svgText = typeof vectorAssetDocument?.svgText === "string"
      ? vectorAssetDocument.svgText
      : "";
    console.log("[SVG_LAUNCH_REQUEST]", {
      toolId: normalizedToolId,
      registryEntryUrl: launchProof.iframeSrc,
      iframeSrc: launchProof.iframeSrc,
      hosted: launchProof.hosted,
      hostToolId: launchProof.hostToolId,
      hostContextId: launchProof.hostContextId,
      hasVectorAssetDocument: Boolean(vectorAssetDocument && typeof vectorAssetDocument === "object" && !Array.isArray(vectorAssetDocument)),
      sourceName: normalizeTextParam(vectorAssetDocument?.sourceName),
      svgTextLength: svgText.length
    });
  }
}

function resolveJsonPointer(root, pointer) {
  if (!pointer.startsWith("#/")) {
    return null;
  }
  const segments = pointer
    .slice(2)
    .split("/")
    .map((segment) => segment.replace(/~1/g, "/").replace(/~0/g, "~"));
  let current = root;
  for (const segment of segments) {
    if (!isPlainObject(current) && !Array.isArray(current)) {
      return null;
    }
    current = current[segment];
  }
  return current;
}

function validateJsonValueAgainstSchema(value, schema, schemaRoot) {
  const errors = [];
  const seenPointers = new Set();
  const validateBranchSchema = (candidateValue, candidateSchema, candidatePointer, schemaContext) => {
    const beforeCount = errors.length;
    validateNode(candidateValue, candidateSchema, candidatePointer, schemaContext);
    const branchErrors = errors.slice(beforeCount);
    errors.splice(beforeCount, branchErrors.length);
    return branchErrors;
  };

  const keyMatchesPropertyNameSchema = (key, schemaNode) => {
    if (!isPlainObject(schemaNode)) {
      return true;
    }
    if (typeof schemaNode.pattern === "string") {
      try {
        return new RegExp(schemaNode.pattern).test(key);
      } catch {
        return false;
      }
    }
    if (Array.isArray(schemaNode.anyOf) && schemaNode.anyOf.length > 0) {
      return schemaNode.anyOf.some((branch) => keyMatchesPropertyNameSchema(key, branch));
    }
    if (Array.isArray(schemaNode.oneOf) && schemaNode.oneOf.length > 0) {
      return schemaNode.oneOf.some((branch) => keyMatchesPropertyNameSchema(key, branch));
    }
    if (typeof schemaNode.const === "string") {
      return key === schemaNode.const;
    }
    if (Array.isArray(schemaNode.enum) && schemaNode.enum.length > 0) {
      return schemaNode.enum.includes(key);
    }
    return true;
  };

  function validateNode(nodeValue, nodeSchema, pointer, schemaContext) {
    if (!isPlainObject(nodeSchema)) {
      return;
    }

    if (typeof nodeSchema.$ref === "string") {
      const ref = nodeSchema.$ref.trim();
      if (ref.startsWith("#/")) {
        const refPointer = `${ref}@${pointer}`;
        if (seenPointers.has(refPointer)) {
          return;
        }
        seenPointers.add(refPointer);
        const resolved = resolveJsonPointer(schemaContext, ref);
        if (!resolved) {
          errors.push(`${pointer}: unresolved schema ref ${ref}`);
          return;
        }
        validateNode(nodeValue, resolved, pointer, schemaContext);
        return;
      }
      return;
    }

    if (Array.isArray(nodeSchema.oneOf) && nodeSchema.oneOf.length > 0) {
      let branchPass = false;
      for (const branch of nodeSchema.oneOf) {
        const branchErrors = validateBranchSchema(nodeValue, branch, pointer, schemaContext);
        if (branchErrors.length === 0) {
          branchPass = true;
          break;
        }
      }
      if (!branchPass) {
        errors.push(`${pointer}: value does not satisfy any oneOf branch`);
      }
      return;
    }

    if (Array.isArray(nodeSchema.anyOf) && nodeSchema.anyOf.length > 0) {
      let branchPass = false;
      for (const branch of nodeSchema.anyOf) {
        const branchErrors = validateBranchSchema(nodeValue, branch, pointer, schemaContext);
        if (branchErrors.length === 0) {
          branchPass = true;
          break;
        }
      }
      if (!branchPass) {
        errors.push(`${pointer}: value does not satisfy any anyOf branch`);
      }
      return;
    }

    if (Array.isArray(nodeSchema.allOf) && nodeSchema.allOf.length > 0) {
      nodeSchema.allOf.forEach((branch) => {
        validateNode(nodeValue, branch, pointer, schemaContext);
      });
      return;
    }

    if (isPlainObject(nodeSchema.not)) {
      const branchErrors = validateBranchSchema(nodeValue, nodeSchema.not, pointer, schemaContext);
      if (branchErrors.length === 0) {
        errors.push(`${pointer}: value must not satisfy disallowed schema`);
      }
      return;
    }

    if (Object.prototype.hasOwnProperty.call(nodeSchema, "const")) {
      if (nodeValue !== nodeSchema.const) {
        errors.push(`${pointer}: expected const ${JSON.stringify(nodeSchema.const)}`);
        return;
      }
    }

    if (Array.isArray(nodeSchema.enum) && nodeSchema.enum.length > 0) {
      if (!nodeSchema.enum.includes(nodeValue)) {
        errors.push(`${pointer}: value is not in enum`);
        return;
      }
    }

    const schemaType = typeof nodeSchema.type === "string" ? nodeSchema.type : "";
    if (schemaType) {
      if (schemaType === "object") {
        if (!isPlainObject(nodeValue)) {
          errors.push(`${pointer}: expected object`);
          return;
        }
        const required = Array.isArray(nodeSchema.required) ? nodeSchema.required : [];
        required.forEach((requiredKey) => {
          if (!Object.prototype.hasOwnProperty.call(nodeValue, requiredKey)) {
            errors.push(`${pointer}: missing required key "${requiredKey}"`);
          }
        });
        const properties = isPlainObject(nodeSchema.properties) ? nodeSchema.properties : {};
        const patternProperties = isPlainObject(nodeSchema.patternProperties) ? nodeSchema.patternProperties : {};
        const propertyNamesSchema = isPlainObject(nodeSchema.propertyNames) ? nodeSchema.propertyNames : null;
        const propertyKeys = Object.keys(nodeValue);

        propertyKeys.forEach((propertyKey) => {
          const propertyPointer = `${pointer}.${propertyKey}`;
          if (propertyNamesSchema && !keyMatchesPropertyNameSchema(propertyKey, propertyNamesSchema)) {
            errors.push(`${pointer}: property name "${propertyKey}" is not allowed by propertyNames`);
            return;
          }
          if (Object.prototype.hasOwnProperty.call(properties, propertyKey)) {
            validateNode(nodeValue[propertyKey], properties[propertyKey], propertyPointer, schemaContext);
            return;
          }

          const matchingPattern = Object.keys(patternProperties).find((pattern) => {
            try {
              return new RegExp(pattern).test(propertyKey);
            } catch {
              return false;
            }
          });
          if (matchingPattern) {
            validateNode(nodeValue[propertyKey], patternProperties[matchingPattern], propertyPointer, schemaContext);
            return;
          }

          if (nodeSchema.additionalProperties === false) {
            errors.push(`${pointer}: unknown key "${propertyKey}"`);
            return;
          }

          if (isPlainObject(nodeSchema.additionalProperties)) {
            validateNode(nodeValue[propertyKey], nodeSchema.additionalProperties, propertyPointer, schemaContext);
          }
        });
      } else if (schemaType === "array") {
        if (!Array.isArray(nodeValue)) {
          errors.push(`${pointer}: expected array`);
          return;
        }
        if (isPlainObject(nodeSchema.items)) {
          nodeValue.forEach((item, index) => {
            validateNode(item, nodeSchema.items, `${pointer}[${index}]`, schemaContext);
          });
        }
      } else if (schemaType === "string") {
        if (typeof nodeValue !== "string") {
          errors.push(`${pointer}: expected string`);
          return;
        }
        if (Number.isInteger(nodeSchema.minLength) && nodeValue.length < nodeSchema.minLength) {
          errors.push(`${pointer}: string shorter than minLength=${nodeSchema.minLength}`);
        }
      } else if (schemaType === "integer") {
        if (!Number.isInteger(nodeValue)) {
          errors.push(`${pointer}: expected integer`);
          return;
        }
        if (typeof nodeSchema.minimum === "number" && nodeValue < nodeSchema.minimum) {
          errors.push(`${pointer}: value below minimum=${nodeSchema.minimum}`);
        }
      } else if (schemaType === "number") {
        if (typeof nodeValue !== "number" || Number.isNaN(nodeValue)) {
          errors.push(`${pointer}: expected number`);
          return;
        }
        if (typeof nodeSchema.minimum === "number" && nodeValue < nodeSchema.minimum) {
          errors.push(`${pointer}: value below minimum=${nodeSchema.minimum}`);
        }
      } else if (schemaType === "boolean") {
        if (typeof nodeValue !== "boolean") {
          errors.push(`${pointer}: expected boolean`);
        }
      } else if (schemaType === "null") {
        if (nodeValue !== null) {
          errors.push(`${pointer}: expected null`);
        }
      }
    }
  }

  validateNode(value, schema, "$", schemaRoot);
  return errors;
}

async function readWorkspaceSchemaContract() {
  if (workspaceSchemaContractPromise) {
    return workspaceSchemaContractPromise;
  }

  workspaceSchemaContractPromise = (async () => {
    const response = await fetch(WORKSPACE_MANIFEST_SCHEMA_PATH, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`workspace schema fetch failed status=${response.status}`);
    }
    const workspaceSchema = await response.json();
    const toolsNode = isPlainObject(workspaceSchema?.properties?.tools)
      ? workspaceSchema.properties.tools
      : null;
    const toolProps = isPlainObject(toolsNode?.properties) ? toolsNode.properties : {};
    const requiredWorkspaceToolKeys = Array.isArray(toolsNode?.required)
      ? toolsNode.required
          .map((entry) => normalizeToken(entry))
          .filter(Boolean)
      : [];
    const toolSchemaByWorkspaceKey = new Map();
    const allowedWorkspaceToolKeys = [];

    const workspaceSchemaUrl = new URL(WORKSPACE_MANIFEST_SCHEMA_PATH, window.location.origin);
    const propertyEntries = Object.entries(toolProps);
    for (const [rawKey, rawNode] of propertyEntries) {
      const normalizedWorkspaceKey = normalizeToken(rawKey);
      if (!normalizedWorkspaceKey) {
        continue;
      }
      allowedWorkspaceToolKeys.push(normalizedWorkspaceKey);
      if (!isPlainObject(rawNode) || typeof rawNode.$ref !== "string") {
        continue;
      }
      const ref = rawNode.$ref.trim();
      if (!ref) {
        continue;
      }
      let toolSchema = null;
      if (ref.startsWith("#/")) {
        toolSchema = resolveJsonPointer(workspaceSchema, ref);
      } else {
        const toolSchemaUrl = new URL(ref, workspaceSchemaUrl);
        const toolSchemaResponse = await fetch(toolSchemaUrl.toString(), { cache: "no-store" });
        if (!toolSchemaResponse.ok) {
          throw new Error(`tool schema fetch failed key=${normalizedWorkspaceKey} status=${toolSchemaResponse.status}`);
        }
        toolSchema = await toolSchemaResponse.json();
      }
      if (isPlainObject(toolSchema)) {
        toolSchemaByWorkspaceKey.set(normalizedWorkspaceKey, toolSchema);
      }
    }

    return {
      workspaceSchemaPath: WORKSPACE_MANIFEST_SCHEMA_PATH,
      allowedWorkspaceToolKeys,
      requiredWorkspaceToolKeys,
      toolSchemaByWorkspaceKey
    };
  })();

  return workspaceSchemaContractPromise;
}

function readSamplePresetPathFromQuery() {
  const searchParams = new URL(window.location.href).searchParams;
  return normalizeLocalHrefParam(
    searchParams.get("samplePresetPath"),
    TOOL_LAUNCH_PARAM_PREFIXES.samplePresetPath
  );
}

function isWorkspaceManifestSource(rawSource) {
  if (!rawSource || typeof rawSource !== "object" || Array.isArray(rawSource)) {
    return false;
  }
  const documentKind = normalizeTextParam(rawSource.documentKind);
  const schema = normalizeTextParam(rawSource.schema).toLowerCase();
  return documentKind === WORKSPACE_DOCUMENT_KIND || schema === WORKSPACE_MANIFEST_SCHEMA;
}

function classifyWorkspaceManifestTools(rawSource, schemaContract = null) {
  if (!isWorkspaceManifestSource(rawSource)) {
    return {
      recognized: false,
      discoveredKeys: [],
      normalizedKeys: [],
      registryMatchedKeys: [],
      schemaValidatedKeys: [],
      acceptedToolIds: [],
      rejected: [
        {
          key: "",
          reason: "not-workspace-manifest"
        }
      ]
    };
  }

  const toolsBlock = rawSource.tools && typeof rawSource.tools === "object" && !Array.isArray(rawSource.tools)
    ? rawSource.tools
    : null;
  if (!toolsBlock) {
    return {
      recognized: true,
      discoveredKeys: [],
      normalizedKeys: [],
      registryMatchedKeys: [],
      schemaValidatedKeys: [],
      acceptedToolIds: [],
      rejected: [
        {
          key: "",
          reason: "tools-block-missing"
        }
      ]
    };
  }

  const discoveredKeys = Object.keys(toolsBlock);
  const normalizedKeys = [];
  const registryMatchedKeys = [];
  const schemaValidatedKeys = [];
  const acceptedToolIds = [];
  const acceptedSeen = new Set();
  const rejected = [];
  const allowedWorkspaceToolKeys = new Set(
    Array.isArray(schemaContract?.allowedWorkspaceToolKeys)
      ? schemaContract.allowedWorkspaceToolKeys
      : []
  );
  const requiredWorkspaceToolKeys = new Set(
    Array.isArray(schemaContract?.requiredWorkspaceToolKeys)
      ? schemaContract.requiredWorkspaceToolKeys
      : []
  );
  const toolSchemaByWorkspaceKey = schemaContract?.toolSchemaByWorkspaceKey instanceof Map
    ? schemaContract.toolSchemaByWorkspaceKey
    : new Map();
  const hasSchemaContract = allowedWorkspaceToolKeys.size > 0 && toolSchemaByWorkspaceKey.size > 0;
  if (!hasSchemaContract) {
    discoveredKeys.forEach((key) => {
      const normalizedKey = normalizeToken(key);
      const mappedToolId = normalizedKey;
      normalizedKeys.push({
        rawKey: key,
        normalizedKey,
        mappedToolId
      });
      rejected.push({
        key,
        reason: "workspace-tool-schema-contract-unavailable"
      });
    });
    return {
      recognized: true,
      discoveredKeys,
      normalizedKeys,
      registryMatchedKeys,
      schemaValidatedKeys,
      acceptedToolIds,
      rejected,
      schemaValidationSource: "unavailable"
    };
  }

  discoveredKeys.forEach((rawKey) => {
    const key = normalizeTextParam(rawKey);
    if (!key) {
      rejected.push({ key: rawKey, reason: "empty-tool-key" });
      return;
    }

    const normalizedKey = key.toLowerCase();
    const mappedToolId = normalizedKey;
    normalizedKeys.push({
      rawKey: key,
      normalizedKey,
      mappedToolId
    });
    const toolEntry = getToolHostEntryById(manifest, mappedToolId);
    if (!toolEntry) {
      rejected.push({ key, reason: "unsupported-tool-key" });
      return;
    }
    registryMatchedKeys.push(key);

    const rawToolEntry = toolsBlock[rawKey];
    if (!rawToolEntry || typeof rawToolEntry !== "object" || Array.isArray(rawToolEntry)) {
      rejected.push({ key, reason: "tool-entry-not-object" });
      return;
    }

    const expectedToolId = mappedToolId;

    if (hasSchemaContract) {
      if (!allowedWorkspaceToolKeys.has(normalizedKey)) {
        rejected.push({
          key,
          reason: `tool-key-not-allowed-by-workspace-schema(${normalizedKey})`
        });
        return;
      }
      const toolSchema = toolSchemaByWorkspaceKey.get(normalizedKey);
      if (!toolSchema) {
        rejected.push({
          key,
          reason: `tool-schema-missing-for-key(${normalizedKey})`
        });
        return;
      }
      const schemaErrors = validateJsonValueAgainstSchema(rawToolEntry, toolSchema, toolSchema);
      if (schemaErrors.length > 0) {
        rejected.push({
          key,
          reason: `tool-entry-schema-invalid(${schemaErrors.slice(0, 3).join("; ")})`
        });
        return;
      }
      schemaValidatedKeys.push(key);
    }

    if (!acceptedSeen.has(expectedToolId)) {
      acceptedSeen.add(expectedToolId);
      acceptedToolIds.push(expectedToolId);
    }
  });

  const discoveredNormalizedKeys = new Set(
    normalizedKeys
      .map((entry) => entry.normalizedKey)
      .filter(Boolean)
  );
  requiredWorkspaceToolKeys.forEach((requiredKey) => {
    if (!discoveredNormalizedKeys.has(requiredKey)) {
      rejected.push({
        key: requiredKey,
        reason: `required-workspace-tool-key-missing(${requiredKey})`
      });
    }
  });

  return {
    recognized: true,
    discoveredKeys,
    normalizedKeys,
    registryMatchedKeys,
    schemaValidatedKeys,
    acceptedToolIds,
    rejected,
    schemaValidationSource: hasSchemaContract ? WORKSPACE_MANIFEST_SCHEMA_PATH : "unavailable"
  };
}

async function readWorkspaceManifestToolDiagnosticsFromSamplePreset(samplePresetPath) {
  const normalizedPath = normalizeLocalHrefParam(samplePresetPath, TOOL_LAUNCH_PARAM_PREFIXES.samplePresetPath);
  if (!normalizedPath) {
    return null;
  }
  try {
    const schemaContract = await readWorkspaceSchemaContract().catch((error) => ({
      schemaContractError: error instanceof Error ? error.message : "unknown-schema-contract-error"
    }));
    const response = await fetch(normalizedPath, { cache: "no-store" });
    if (!response.ok) {
      return {
        sourcePath: normalizedPath,
        recognized: false,
        discoveredKeys: [],
        normalizedKeys: [],
        registryMatchedKeys: [],
        schemaValidatedKeys: [],
        acceptedToolIds: [],
        visibleToolIds: [],
        rejected: [
          {
            key: "",
            reason: `fetch-failed(status=${response.status})`
          }
        ],
        schemaContractError: schemaContract?.schemaContractError || "",
        explicitToolPayloadById: new Map(),
        directPayloadLabelByToolId: new Map(),
        explicitPalettePayload: null
      };
    }
    const rawSource = await response.json();
    const classifications = classifyWorkspaceManifestTools(rawSource, schemaContract);
    const explicitInputs = extractWorkspaceManifestExplicitLaunchInputs(rawSource);
    return {
      sourcePath: normalizedPath,
      ...classifications,
      visibleToolIds: [],
      schemaContractError: schemaContract?.schemaContractError || "",
      explicitToolPayloadById: explicitInputs.explicitToolPayloadById,
      directPayloadLabelByToolId: explicitInputs.directPayloadLabelByToolId,
      explicitPalettePayload: explicitInputs.explicitPalettePayload
    };
  } catch (error) {
    return {
      sourcePath: normalizedPath,
      recognized: false,
      discoveredKeys: [],
      normalizedKeys: [],
      registryMatchedKeys: [],
      schemaValidatedKeys: [],
      acceptedToolIds: [],
      visibleToolIds: [],
      rejected: [
        {
          key: "",
          reason: `fetch-error(${error instanceof Error ? error.message : "unknown"})`
        }
      ],
      explicitToolPayloadById: new Map(),
      directPayloadLabelByToolId: new Map(),
      explicitPalettePayload: null
    };
  }
}

function extractWorkspaceManifestExplicitLaunchInputs(rawSource) {
  const explicitToolPayloadById = new Map();
  const directPayloadLabelByToolId = new Map();
  let explicitPalettePayload = null;
  if (!isWorkspaceManifestSource(rawSource)) {
    return {
      explicitToolPayloadById,
      directPayloadLabelByToolId,
      explicitPalettePayload
    };
  }
  const toolsBlock = rawSource.tools && typeof rawSource.tools === "object" && !Array.isArray(rawSource.tools)
    ? rawSource.tools
    : null;
  if (!toolsBlock) {
    return {
      explicitToolPayloadById,
      directPayloadLabelByToolId,
      explicitPalettePayload
    };
  }

  Object.entries(toolsBlock).forEach(([rawToolKey, rawToolPayload]) => {
    const toolId = typeof rawToolKey === "string" ? rawToolKey.trim().toLowerCase() : "";
    if (!toolId || !rawToolPayload || typeof rawToolPayload !== "object" || Array.isArray(rawToolPayload)) {
      return;
    }
    explicitToolPayloadById.set(toolId, rawToolPayload);
    const directLabel = summarizeDirectToolPayloadLabel(toolId, rawToolPayload);
    if (directLabel) {
      directPayloadLabelByToolId.set(toolId, directLabel);
    }
    if (toolId === "palette-browser"
      && rawToolPayload.schema === "html-js-gaming.palette"
      && Array.isArray(rawToolPayload.swatches)) {
      explicitPalettePayload = rawToolPayload;
    }
  });

  return {
    explicitToolPayloadById,
    directPayloadLabelByToolId,
    explicitPalettePayload
  };
}

function logWorkspaceManifestToolDiagnostics(diagnostics) {
  if (!diagnostics) {
    return;
  }
  const source = diagnostics.sourcePath || "(unknown source)";
  console.info(
    `[WorkspaceManager] workspace manifest tools source=${source} discovered=${diagnostics.discoveredKeys.join(", ") || "(none)"} normalized=${Array.isArray(diagnostics.normalizedKeys) ? diagnostics.normalizedKeys.map((entry) => `${entry.rawKey}->${entry.mappedToolId}`).join(", ") : "(none)"} registryMatched=${diagnostics.registryMatchedKeys.join(", ") || "(none)"} schemaValidated=${diagnostics.schemaValidatedKeys.join(", ") || "(none)"} accepted=${diagnostics.acceptedToolIds.join(", ") || "(none)"} visible=${diagnostics.visibleToolIds.join(", ") || "(none)"}`
  );
  if (diagnostics.rejected.length > 0) {
    console.warn(
      `[WorkspaceManager] workspace manifest rejected tool keys: ${diagnostics.rejected.map((entry) => `${entry.key || "(none)"}:${entry.reason}`).join(" | ")}`
    );
  }
  if (diagnostics.schemaContractError) {
    console.warn(`[WorkspaceManager] workspace schema contract unavailable: ${diagnostics.schemaContractError}`);
  }
}

function readSelectedToolId() {
  return selectedToolId;
}

function writeSelectedToolId(toolId) {
  const normalizedToolId = typeof toolId === "string" ? toolId.trim() : "";
  selectedToolId = normalizedToolId;
}

function traceSvgTileWrite(source, details = {}) {
  console.log("[SVG_TILE_WRITE]", {
    source,
    toolId: normalizeTextParam(details.toolId) || readSelectedToolId(),
    hostContextId: normalizeTextParam(details.hostContextId),
    assetLabel: normalizeTextParam(details.assetLabel),
    statusLabel: normalizeTextParam(details.statusLabel),
    title: normalizeTextParam(details.title),
    timestamp: Date.now()
  });
}

function shouldBlockLoadedSvgWorkspaceTileOverwrite(source, details = {}) {
  if (!loadedSvgWorkspaceTileState?.loaded || readSelectedToolId() !== "svg-asset-studio") {
    return false;
  }
  const nextTitle = normalizeTextParam(details.title || details.assetLabel);
  const loadedLabel = normalizeTextParam(loadedSvgWorkspaceTileState.assetLabel);
  if (!nextTitle || !loadedLabel) {
    return false;
  }
  const preservesLoadedLabel = nextTitle.includes(loadedLabel) && !/\bnone\b/i.test(nextTitle);
  if (preservesLoadedLabel) {
    return false;
  }
  console.log("[SVG_TILE_WRITE_BLOCKED_LEGACY]", {
    source,
    toolId: "svg-asset-studio",
    hostContextId: loadedSvgWorkspaceTileState.hostContextId,
    attemptedTitle: nextTitle,
    protectedAssetLabel: loadedLabel,
    protectedStatusLabel: loadedSvgWorkspaceTileState.statusLabel,
    timestamp: Date.now()
  });
  return true;
}

function writeStatus(text) {
  traceSvgTileWrite("writeStatus", {
    statusLabel: text
  });
  if (refs.statusText instanceof HTMLElement) {
    refs.statusText.textContent = text;
  }
}

function renderMountDiagnostic(message, detail = "") {
  if (!(refs.mountContainer instanceof HTMLElement)) {
    return;
  }
  const titleNode = document.createElement("h2");
  titleNode.className = "tool-host-mount-diagnostic__title";
  titleNode.textContent = "Workspace Manager Diagnostic";
  const messageNode = document.createElement("p");
  messageNode.className = "tool-host-mount-diagnostic__message";
  messageNode.textContent = normalizeTextParam(message) || "Unknown mount failure.";
  const detailNode = document.createElement("pre");
  detailNode.className = "tool-host-mount-diagnostic__detail";
  detailNode.textContent = normalizeTextParam(detail);
  detailNode.hidden = !detailNode.textContent;
  const panelNode = document.createElement("section");
  panelNode.className = "tool-host-mount-diagnostic";
  panelNode.setAttribute("data-tool-host-mount-diagnostic", "visible");
  panelNode.append(titleNode, messageNode, detailNode);
  refs.mountContainer.replaceChildren(panelNode);
}

function setCurrentLabel(text) {
  refreshPagerRefs();
  if (shouldBlockLoadedSvgWorkspaceTileOverwrite("setCurrentLabel", {
    assetLabel: text,
    title: text
  })) {
    return;
  }
  traceSvgTileWrite("setCurrentLabel", {
    assetLabel: text,
    title: text
  });
  if (refs.currentLabel instanceof HTMLElement) {
    refs.currentLabel.textContent = text;
  }
}

function writeSwitchMeta(text) {
  if (refs.switchMetaText instanceof HTMLElement) {
    refs.switchMetaText.textContent = text;
  }
}

function getSelectedToolIndex() {
  const selectedToolId = readSelectedToolId();
  return toolIds.findIndex((toolId) => toolId === selectedToolId);
}

function updateSwitchMeta() {
  if (toolIds.length === 0) {
    writeSwitchMeta("No active tools are available in host manifest.");
    return;
  }
  const selectedIndex = getSelectedToolIndex();
  const oneBased = selectedIndex >= 0 ? selectedIndex + 1 : 1;
  writeSwitchMeta(`Switch target ${oneBased}/${toolIds.length}.`);
}

function selectToolByOffset(offset) {
  if (toolIds.length === 0) {
    return false;
  }

  const currentIndex = Math.max(0, getSelectedToolIndex());
  const nextIndex = (currentIndex + offset + toolIds.length) % toolIds.length;
  writeSelectedToolId(toolIds[nextIndex]);
  updateSwitchMeta();
  return true;
}

function updateStandaloneHref(toolId) {
  if (!(refs.standaloneLink instanceof HTMLAnchorElement)) {
    return;
  }
  const entry = getToolHostEntryById(manifest, toolId);
  const enabled = !!entry && toolIds.includes(toolId);
  refs.standaloneLink.href = enabled ? entry.launchPath : "#";
  refs.standaloneLink.setAttribute("aria-disabled", enabled ? "false" : "true");
  refs.standaloneLink.tabIndex = enabled ? 0 : -1;
  refs.standaloneLink.classList.toggle("is-disabled", !enabled);
}

function writeQueryToolId(toolId, replace = false) {
  const url = new URL(window.location.href);
  url.searchParams.delete("game");
  if (toolId) {
    url.searchParams.set("tool", toolId);
  } else {
    url.searchParams.delete("tool");
  }
  const method = replace ? "replaceState" : "pushState";
  window.history[method]({}, "", url.toString());
}

function readInitialToolId() {
  const url = new URL(window.location.href);
  const fromQuery = resolveToolIdAlias(url.searchParams.get("tool"));
  if (fromQuery && getToolHostEntryById(manifest, fromQuery) && toolIds.includes(fromQuery)) {
    return fromQuery;
  }
  return "";
}

function readRequestedToolIdFromQuery() {
  const url = new URL(window.location.href);
  const requested = resolveToolIdAlias((url.searchParams.get("tool") || "").trim());
  if (!requested || !getToolHostEntryById(manifest, requested) || !toolIds.includes(requested)) {
    return "";
  }
  return requested;
}

function readRawToolIdFromQuery() {
  const url = new URL(window.location.href);
  return resolveToolIdAlias((url.searchParams.get("tool") || "").trim());
}

function readInitialGameId() {
  const url = new URL(window.location.href);
  const gameId = (url.searchParams.get("gameId") || "").trim();
  return gameId || "";
}

function shouldMountGameFrameFromQuery() {
  const url = new URL(window.location.href);
  const mode = (url.searchParams.get("mount") || "").trim().toLowerCase();
  return mode === "game";
}

function normalizeGameHref(value) {
  const href = typeof value === "string" ? value.trim() : "";
  if (!href || !href.startsWith("/games/")) {
    return "";
  }
  if (href.includes("..")) {
    return "";
  }
  return href;
}

async function readGameEntryById(gameId) {
  const normalizedId = typeof gameId === "string" ? gameId.trim() : "";
  if (!normalizedId) {
    return null;
  }
  try {
    const response = await fetch(GAMES_METADATA_PATH, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    const metadata = await response.json();
    const games = Array.isArray(metadata?.games) ? metadata.games : [];
    const entry = games.find((game) => String(game?.id || "").trim().toLowerCase() === normalizedId.toLowerCase());
    if (!entry) {
      return null;
    }
    const href = normalizeGameHref(entry.href);
    if (!href) {
      return null;
    }
    const classValues = Array.isArray(entry.classValues)
      ? entry.classValues.map((value) => String(value || "").trim()).filter(Boolean)
      : [];
    const tags = Array.isArray(entry.tags)
      ? entry.tags.map((value) => String(value || "").trim()).filter(Boolean)
      : [];
    const toolsUsed = normalizeToolsUsedList(entry.toolsUsed);
    return {
      id: String(entry.id || "").trim(),
      title: String(entry.title || entry.id || "Game").trim(),
      href,
      assetCatalogPath: deriveGameAssetCatalogPath(href),
      level: String(entry.level || "").trim(),
      status: String(entry.status || "").trim(),
      description: String(entry.description || "").trim(),
      classValues,
      tags,
      toolsUsed,
      sampleTrack: entry.sampleTrack === true,
      debugShowcase: entry.debugShowcase === true,
      requiresService: entry.requiresService === true
    };
  } catch {
    return null;
  }
}

function unmountGameFrame() {
  if (!currentGameFrame) {
    if (currentGameHostContextId) {
      removeToolHostSharedContextById(currentGameHostContextId);
      currentGameHostContextId = "";
    }
    return;
  }
  if (currentGameFrame.parentElement === refs.mountContainer) {
    currentGameFrame.removeAttribute("src");
    refs.mountContainer.removeChild(currentGameFrame);
  }
  currentGameFrame = null;
  if (currentGameHostContextId) {
    removeToolHostSharedContextById(currentGameHostContextId);
    currentGameHostContextId = "";
  }
}

async function mountGameFrame(gameEntry) {
  if (!(refs.mountContainer instanceof HTMLElement)) {
    writeStatus("Workspace container is unavailable.");
    return false;
  }
  runtime.unmountCurrentTool("switch-to-game");
  unmountGameFrame();
  const assetCatalogPath = typeof gameEntry?.assetCatalogPath === "string" ? gameEntry.assetCatalogPath : "";
  const assetCatalog = await readGameAssetCatalog(assetCatalogPath);

  const hostContext = writeToolHostSharedContext({
    toolId: "workspace-manager",
    source: "game-host",
    requestedAt: new Date().toISOString(),
    sharedContext: {
      hostMode: "game",
      gameId: gameEntry.id,
      gameTitle: gameEntry.title
    },
    state: {
      game: {
        id: gameEntry.id,
        title: gameEntry.title,
        href: gameEntry.href,
        level: gameEntry.level,
        status: gameEntry.status,
        description: gameEntry.description,
        classValues: gameEntry.classValues,
        tags: gameEntry.tags,
        sampleTrack: gameEntry.sampleTrack,
        debugShowcase: gameEntry.debugShowcase,
        requiresService: gameEntry.requiresService,
        assetCatalogPath,
        assetCatalog,
        hostedAt: new Date().toISOString()
      }
    }
  });
  if (!hostContext?.contextId) {
    writeStatus("Unable to mount game: workspace host context storage is unavailable in this browser session.");
    setCurrentLabel("No game mounted.");
    return false;
  }

  const frame = document.createElement("iframe");
  frame.setAttribute("data-game-host-frame", gameEntry.id);
  frame.setAttribute("title", `${gameEntry.title} Workspace Frame`);
  frame.setAttribute("loading", "eager");
  const gameUrl = new URL(gameEntry.href, window.location.origin);
  gameUrl.searchParams.set("hosted", "1");
  gameUrl.searchParams.set("hostToolId", "workspace-manager");
  gameUrl.searchParams.set("hostGameId", gameEntry.id);
  currentGameHostContextId = hostContext.contextId;
  gameUrl.searchParams.set("hostContextId", hostContext.contextId);
  frame.src = gameUrl.toString();
  refs.mountContainer.replaceChildren(frame);
  currentGameFrame = frame;
  setCurrentLabel(`Mounted Game: ${gameEntry.title}`);
  writeStatus(`Mounted game ${gameEntry.title}.`);
  document.title = `Workspace Manager (${gameEntry.title})`;
  return true;
}

function syncControlState() {
  refreshPagerRefs();
  const selectedToolId = readSelectedToolId();
  const hasSelection = !!selectedToolId && toolIds.includes(selectedToolId) && !!getToolHostEntryById(manifest, selectedToolId);
  const hasMount = !!runtime.getCurrentMount();

  if (refs.mountButton instanceof HTMLButtonElement) {
    refs.mountButton.disabled = !hasSelection;
  }
  if (refs.prevButton instanceof HTMLButtonElement) {
    refs.prevButton.disabled = toolIds.length === 0;
  }
  if (refs.nextButton instanceof HTMLButtonElement) {
    refs.nextButton.disabled = toolIds.length === 0;
  }
  if (refs.unmountButton instanceof HTMLButtonElement) {
    refs.unmountButton.disabled = !hasMount;
  }
}

function syncSelectedToolState(initialToolId) {
  const normalizedInitialToolId = toolIds.includes(initialToolId) ? initialToolId : "";
  writeSelectedToolId(normalizedInitialToolId);
  const selectedEntry = getToolHostEntryById(manifest, readSelectedToolId());
  setCurrentLabel(selectedEntry ? selectedEntry.displayName : "No tool available");
  updateSwitchMeta();
}

function applyToolsUsedFilterForGame(gameEntry, preferredToolId = "", workspaceToolFilterIds = null) {
  if (Array.isArray(workspaceToolFilterIds)) {
    const workspaceScopedToolIds = [...allToolIds];
    if (workspaceToolFilterIds.length === 0) {
      toolIds = [];
    } else {
      const allowedFromWorkspace = new Set(workspaceToolFilterIds);
      toolIds = workspaceScopedToolIds.filter((toolId) => allowedFromWorkspace.has(toolId));
    }
  } else {
    const baseToolIds = !gameEntry
      ? [...allToolIds]
      : normalizeToolsUsedList(gameEntry.toolsUsed)
        .filter((toolId) => !!getToolHostEntryById(manifest, toolId));
    toolIds = baseToolIds;
  }

  if (workspaceManifestToolDiagnostics) {
    workspaceManifestToolDiagnostics.visibleToolIds = [...toolIds];
  }

  toolIds.forEach((toolId) => {
    traceWorkspaceToolTileRender(toolId);
  });

  const initialToolId = toolIds.includes(preferredToolId) ? preferredToolId : "";
  syncSelectedToolState(initialToolId);
  updateStandaloneHref(initialToolId);
  syncControlState();
}

function bindPagerDelegatedEvents() {
  if (pagerEventsBound || typeof document === "undefined") {
    return;
  }
  pagerEventsBound = true;

  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) {
      return;
    }

    const toolNavTarget = target.closest(".tools-platform-frame__nav-link, .tools-platform-frame__nav-tool-row");
    if (toolNavTarget instanceof Element) {
      const resolvedToolId = readToolIdFromWorkspaceClickTarget(toolNavTarget);
      const datasetToolId = normalizeTextParam(toolNavTarget.closest("[data-tool-id]")?.dataset?.toolId);
      traceWorkspaceToolClick({
        target: toolNavTarget,
        datasetToolId,
        resolvedToolId,
        source: "tool-nav"
      });
      if (resolvedToolId && toolIds.includes(resolvedToolId)) {
        event.preventDefault();
        writeSelectedToolId(resolvedToolId);
        updateSwitchMeta();
        mountSelectedTool("tool-click");
        return;
      }
    }

    if (target.closest("[data-tool-host-prev]")) {
      event.preventDefault();
      if (!selectToolByOffset(-1)) {
        return;
      }
      traceWorkspaceToolClick({
        target,
        datasetToolId: readSelectedToolId(),
        resolvedToolId: readSelectedToolId(),
        source: "prev"
      });
      mountSelectedTool("prev");
      return;
    }

    if (target.closest("[data-tool-host-next]")) {
      event.preventDefault();
      if (!selectToolByOffset(1)) {
        return;
      }
      traceWorkspaceToolClick({
        target,
        datasetToolId: readSelectedToolId(),
        resolvedToolId: readSelectedToolId(),
        source: "next"
      });
      mountSelectedTool("next");
    }
  });
}

function bindPagerMessageBridge() {
  if (pagerMessageBridgeBound || typeof window === "undefined") {
    return;
  }
  pagerMessageBridgeBound = true;

  window.addEventListener("message", (event) => {
    if (event.origin !== window.location.origin) {
      return;
    }
    const payload = event.data && typeof event.data === "object" ? event.data : null;
    if (!payload || payload.type !== "workspace-pager-action") {
      return;
    }

    const action = payload.action === "prev" || payload.action === "next"
      ? payload.action
      : "";
    if (!action) {
      return;
    }

    console.info(`[WorkspaceManager] ${action.toUpperCase()} delegated handler fired.`);

    if (toolIds.length === 0) {
      writeStatus("No active tools are currently available for Workspace Manager.");
      renderMountDiagnostic(
        "No active tools are available for delegated pager action.",
        "Load a valid game/tool context before switching tools."
      );
      syncControlState();
      return;
    }

    const offset = action === "prev" ? -1 : 1;
    if (!selectToolByOffset(offset)) {
      writeStatus(`Unable to select ${action === "prev" ? "previous" : "next"} tool.`);
      renderMountDiagnostic(
        `Unable to select ${action === "prev" ? "previous" : "next"} tool.`,
        "Tool list state is unavailable for pager navigation."
      );
      syncControlState();
      return;
    }

    traceWorkspaceToolClick({
      target: null,
      datasetToolId: readSelectedToolId(),
      resolvedToolId: readSelectedToolId(),
      source: `pager-message:${action}`
    });
    mountSelectedTool(action);
  });
}

function normalizeWorkspaceShellMessageState(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const toolId = normalizeTextParam(value.toolId);
  const hostContextId = normalizeTextParam(value.hostContextId);
  if (!toolId || !hostContextId) {
    return null;
  }
  return {
    toolId,
    hostContextId,
    loaded: value.loaded === true,
    assetLabel: normalizeTextParam(value.assetLabel),
    paletteLabel: normalizeTextParam(value.paletteLabel) || "none",
    statusLabel: normalizeTextParam(value.statusLabel),
    contractType: normalizeTextParam(value.contractType),
    errors: Array.isArray(value.errors)
      ? value.errors.map((entry) => normalizeTextParam(entry)).filter(Boolean)
      : []
  };
}

function applyWorkspaceShellStateToMountedTool(state) {
  const currentMount = runtime.getCurrentMount();
  console.log("[SVG_TILE_WRITE]", {
    source: "applyWorkspaceShellStateToMountedTool:attempt",
    incomingToolId: state.toolId,
    incomingHostContextId: state.hostContextId,
    toolId: state.toolId,
    hostContextId: state.hostContextId,
    mountedToolId: currentMount?.tool?.id || "",
    mountedHostContextId: currentMount?.hostContextId || "",
    loaded: state.loaded,
    assetLabel: state.assetLabel,
    statusLabel: state.statusLabel,
    contractType: state.contractType,
    timestamp: Date.now()
  });
  if (!currentMount || currentMount.tool?.id !== state.toolId || currentMount.hostContextId !== state.hostContextId) {
    console.log("[SVG_TILE_WRITE]", {
      source: "applyWorkspaceShellStateToMountedTool:ignored-mount-mismatch",
      toolId: state.toolId,
      hostContextId: state.hostContextId,
      assetLabel: state.assetLabel,
      statusLabel: state.statusLabel,
      timestamp: Date.now()
    });
    return false;
  }
  if (state.toolId !== "svg-asset-studio") {
    console.log("[SVG_TILE_WRITE]", {
      source: "applyWorkspaceShellStateToMountedTool:ignored-unsupported-tool",
      toolId: state.toolId,
      hostContextId: state.hostContextId,
      assetLabel: state.assetLabel,
      statusLabel: state.statusLabel,
      timestamp: Date.now()
    });
    return false;
  }
  const toolName = currentMount.tool?.displayName || "SVG Asset Studio";
  const label = state.loaded && state.assetLabel
    ? `${toolName} - ${state.assetLabel}`
    : `${toolName} - ${state.statusLabel || "not loaded"}`;
  if (state.loaded && state.assetLabel) {
    loadedSvgWorkspaceTileState = { ...state };
  } else if (loadedSvgWorkspaceTileState?.hostContextId === state.hostContextId) {
    loadedSvgWorkspaceTileState = null;
  }
  setCurrentLabel(label);
  if (state.statusLabel) {
    writeStatus(state.statusLabel);
  }
  if (currentMount.frame instanceof HTMLIFrameElement) {
    currentMount.frame.dataset.workspaceShellLoaded = state.loaded ? "1" : "0";
    currentMount.frame.dataset.workspaceShellAssetLabel = state.assetLabel;
    currentMount.frame.dataset.workspaceShellContract = state.contractType;
  }
  console.log("[SVG_TILE_WRITE]", {
    source: "applyWorkspaceShellStateToMountedTool:applied",
    toolId: state.toolId,
    hostContextId: state.hostContextId,
    loaded: state.loaded,
    assetLabel: state.assetLabel,
    statusLabel: state.statusLabel,
    contractType: state.contractType,
    title: label,
    timestamp: Date.now()
  });
  syncControlState();
  return true;
}

function bindWorkspaceShellStateBridge() {
  if (workspaceShellStateBridgeBound || typeof window === "undefined") {
    return;
  }
  workspaceShellStateBridgeBound = true;

  window.addEventListener("message", (event) => {
    if (event.origin !== window.location.origin) {
      return;
    }
    const message = event.data && typeof event.data === "object" ? event.data : null;
    if (!message || message.type !== "tools:workspace-shell-state") {
      return;
    }
    console.log("[SVG_POSTMESSAGE_RECEIVE]", {
      type: message.type,
      origin: event.origin,
      payload: message.payload
    });
    const state = normalizeWorkspaceShellMessageState(message.payload);
    if (!state) {
      console.log("[SVG_POSTMESSAGE_RECEIVE]", {
        ignored: true,
        reason: "invalid-workspace-shell-state",
        payload: message.payload
      });
      return;
    }
    const currentMount = runtime.getCurrentMount();
    if (currentMount?.frame?.contentWindow && event.source !== currentMount.frame.contentWindow) {
      console.log("[SVG_POSTMESSAGE_RECEIVE]", {
        ignored: true,
        reason: "source-mismatch",
        toolId: state.toolId,
        hostContextId: state.hostContextId
      });
      return;
    }
    applyWorkspaceShellStateToMountedTool(state);
  });
}

const runtime = createToolHostRuntime({
  manifest,
  mountContainer: refs.mountContainer,
  onStatus(message) {
    writeStatus(message);
  },
  onMounted(tool) {
    const directLabel = readWorkspaceDirectCardLabel(tool.id);
    setCurrentLabel(directLabel ? `${tool.displayName} - ${directLabel}` : tool.displayName);
    syncControlState();
  },
  onUnmounted() {
    loadedSvgWorkspaceTileState = null;
    setCurrentLabel("No tool mounted.");
    syncControlState();
  }
});

function mountSelectedTool(source = "manual") {
  unmountGameFrame();
  const toolId = readSelectedToolId();
  if (!toolId) {
    writeStatus("Select a tool to mount.");
    renderMountDiagnostic(
      "No tool is selected for mount.",
      "Use [PREV] and [NEXT] to choose a tool."
    );
    return false;
  }
  traceWorkspaceRegistryResolve(toolId);
  updateSwitchMeta();
  updateStandaloneHref(toolId);
  writeQueryToolId(toolId, source === "init");
  const explicitToolPayloadById = workspaceManifestToolDiagnostics?.explicitToolPayloadById instanceof Map
    ? workspaceManifestToolDiagnostics.explicitToolPayloadById
    : null;
  const payloadJson = explicitToolPayloadById ? (explicitToolPayloadById.get(toolId) || null) : null;
  if (!payloadJson || typeof payloadJson !== "object" || Array.isArray(payloadJson)) {
    throw new Error(`launch contract violation: explicit payloadJson is required for ${toolId}.`);
  }
  const paletteJson = workspaceManifestToolDiagnostics?.explicitPalettePayload || null;
  writeSharedBindingsFromDirectPayload(toolId, payloadJson, paletteJson);
  const mountResult = runtime.launch(toolId, payloadJson, paletteJson);
  logWorkspaceToolLaunch({
    requestedToolId: toolId,
    normalizedToolId: mountResult?.tool?.id || toolId,
    payloadJson,
    mountResult
  });
  if (!mountResult || !(mountResult.frame instanceof HTMLIFrameElement)) {
    const selectedEntry = getToolHostEntryById(manifest, toolId);
    const displayName = selectedEntry ? selectedEntry.displayName : toolId;
    writeStatus(`Failed to mount ${displayName}.`);
    renderMountDiagnostic(
      `Failed to mount ${displayName}.`,
      "Workspace Manager could not load the selected tool in the mount container."
    );
    syncControlState();
    return false;
  }
  mountResult.frame.addEventListener("error", () => {
    const selectedEntry = getToolHostEntryById(manifest, toolId);
    const displayName = selectedEntry ? selectedEntry.displayName : toolId;
    writeStatus(`Failed to load ${displayName}.`);
    renderMountDiagnostic(
      `Failed to load ${displayName}.`,
      "The selected tool frame failed to load. Verify the tool launch path and host context."
    );
    syncControlState();
  }, { once: true });
  syncControlState();
  return true;
}

function bindEvents() {
  bindPagerDelegatedEvents();
  bindPagerMessageBridge();
  bindWorkspaceShellStateBridge();

  if (refs.mountButton instanceof HTMLButtonElement) {
    refs.mountButton.addEventListener("click", () => {
      traceWorkspaceToolClick({
        target: refs.mountButton,
        datasetToolId: readSelectedToolId(),
        resolvedToolId: readSelectedToolId(),
        source: "mount-button"
      });
      mountSelectedTool("button");
    });
  }

  if (refs.unmountButton instanceof HTMLButtonElement) {
    refs.unmountButton.addEventListener("click", () => {
      runtime.unmountCurrentTool("manual");
      syncControlState();
    });
  }

  window.addEventListener("popstate", () => {
    const samplePresetPath = readSamplePresetPathFromQuery();
    const gameLaunchRequested = shouldMountGameFrameFromQuery();
    const gameId = readInitialGameId();
    if (gameLaunchRequested && !gameId) {
      writeStatus("Workspace Manager game launch requires a valid gameId query parameter.");
      renderMountDiagnostic(
        "Workspace Manager game launch requires a valid gameId.",
        "Expected query: ?gameId=<id>&mount=game"
      );
      workspaceManifestToolDiagnostics = null;
      applyToolsUsedFilterForGame(null);
      return;
    }
    if (gameId) {
      void readGameEntryById(gameId).then(async (gameEntry) => {
        if (!gameEntry) {
          writeStatus(`Game "${gameId}" is not available for Workspace Manager launch.`);
          renderMountDiagnostic(
            `Game "${gameId}" is not available for Workspace Manager launch.`,
            "Use a valid gameId value from games metadata."
          );
          workspaceManifestToolDiagnostics = null;
          applyToolsUsedFilterForGame(null);
          return;
        }

        workspaceManifestToolDiagnostics = await readWorkspaceManifestToolDiagnosticsFromSamplePreset(samplePresetPath);
        logWorkspaceManifestToolDiagnostics(workspaceManifestToolDiagnostics);

        const rawRequestedToolId = readRawToolIdFromQuery();
        const workspaceToolFilterIds = workspaceManifestToolDiagnostics
          ? workspaceManifestToolDiagnostics.acceptedToolIds
          : null;
        applyToolsUsedFilterForGame(gameEntry, rawRequestedToolId, workspaceToolFilterIds);
        const requestedToolId = readRequestedToolIdFromQuery();
        if (rawRequestedToolId && !requestedToolId) {
          writeStatus(`Tool "${rawRequestedToolId}" is not available for Workspace Manager launch.`);
          renderMountDiagnostic(
            `Tool "${rawRequestedToolId}" is not available for Workspace Manager launch.`,
            `gameId=${gameEntry.id}`
          );
          runtime.unmountCurrentTool("popstate-invalid-tool");
          syncControlState();
          return;
        }
        const toolId = requestedToolId || (toolIds[0] || "");
        writeSelectedToolId(toolId);
        updateSwitchMeta();
        updateStandaloneHref(toolId);
        if (!toolId) {
          writeStatus("No active tools are currently available for Workspace Manager.");
          renderMountDiagnostic(
            "No active tools are available for this game context.",
            `gameId=${gameEntry.id}`
          );
          runtime.unmountCurrentTool("popstate");
          syncControlState();
          return;
        }
        mountSelectedTool("popstate");
      });
      return;
    }
    void (async () => {
      workspaceManifestToolDiagnostics = await readWorkspaceManifestToolDiagnosticsFromSamplePreset(samplePresetPath);
      logWorkspaceManifestToolDiagnostics(workspaceManifestToolDiagnostics);
      const workspaceToolFilterIds = workspaceManifestToolDiagnostics
        ? workspaceManifestToolDiagnostics.acceptedToolIds
        : null;
      applyToolsUsedFilterForGame(null, "", workspaceToolFilterIds);
      const rawRequestedToolId = readRawToolIdFromQuery();
      const requestedToolId = readRequestedToolIdFromQuery();
      if (rawRequestedToolId && !requestedToolId) {
        writeStatus(`Tool "${rawRequestedToolId}" is not available for Workspace Manager launch.`);
        renderMountDiagnostic(
          `Tool "${rawRequestedToolId}" is not available for Workspace Manager launch.`,
          "Select a valid tool id from the active registry."
        );
        runtime.unmountCurrentTool("popstate-invalid-tool");
        syncControlState();
        return;
      }
      const toolId = requestedToolId || (toolIds[0] || "");
      writeSelectedToolId(toolId);
      updateSwitchMeta();
      updateStandaloneHref(toolId);
      if (toolId) {
        mountSelectedTool("popstate");
      } else {
        writeStatus("Select a tool to mount.");
        renderMountDiagnostic(
          "No tool is selected for mount.",
          "Use [PREV] and [NEXT] to choose a tool."
        );
        syncControlState();
      }
      syncControlState();
    })();
  });

  window.addEventListener("beforeunload", () => {
    unmountGameFrame();
  });
}

async function init() {
  if (!(refs.mountContainer instanceof HTMLElement)) {
    return;
  }
  const samplePresetPath = readSamplePresetPathFromQuery();
  const gameLaunchRequested = shouldMountGameFrameFromQuery();
  const initialGameId = readInitialGameId();
  if (gameLaunchRequested && !initialGameId) {
    workspaceManifestToolDiagnostics = await readWorkspaceManifestToolDiagnosticsFromSamplePreset(samplePresetPath);
    logWorkspaceManifestToolDiagnostics(workspaceManifestToolDiagnostics);
    const workspaceToolFilterIds = workspaceManifestToolDiagnostics
      ? workspaceManifestToolDiagnostics.acceptedToolIds
      : null;
    applyToolsUsedFilterForGame(null, "", workspaceToolFilterIds);
    bindEvents();
    writeStatus("Workspace Manager game launch requires a valid gameId query parameter.");
    renderMountDiagnostic(
      "Workspace Manager game launch requires a valid gameId.",
      "Expected query: ?gameId=<id>&mount=game"
    );
    return;
  }
  let initialGameEntry = null;
  if (initialGameId) {
    initialGameEntry = await readGameEntryById(initialGameId);
    if (!initialGameEntry) {
      writeStatus(`Game "${initialGameId}" is not available for Workspace Manager launch.`);
      renderMountDiagnostic(
        `Game "${initialGameId}" is not available for Workspace Manager launch.`,
        "Use a valid gameId value from games metadata."
      );
      if (gameLaunchRequested) {
        workspaceManifestToolDiagnostics = await readWorkspaceManifestToolDiagnosticsFromSamplePreset(samplePresetPath);
        logWorkspaceManifestToolDiagnostics(workspaceManifestToolDiagnostics);
        const workspaceToolFilterIds = workspaceManifestToolDiagnostics
          ? workspaceManifestToolDiagnostics.acceptedToolIds
          : null;
        applyToolsUsedFilterForGame(null, "", workspaceToolFilterIds);
        bindEvents();
        return;
      }
    }
  }

  const rawRequestedToolId = readRawToolIdFromQuery();
  workspaceManifestToolDiagnostics = await readWorkspaceManifestToolDiagnosticsFromSamplePreset(samplePresetPath);
  logWorkspaceManifestToolDiagnostics(workspaceManifestToolDiagnostics);
  const workspaceToolFilterIds = workspaceManifestToolDiagnostics
    ? workspaceManifestToolDiagnostics.acceptedToolIds
    : null;
  applyToolsUsedFilterForGame(initialGameEntry, rawRequestedToolId, workspaceToolFilterIds);
  bindEvents();

  const requestedToolId = readRequestedToolIdFromQuery();
  if (rawRequestedToolId && !requestedToolId) {
    writeStatus(`Tool "${rawRequestedToolId}" is not available for Workspace Manager launch.`);
    renderMountDiagnostic(
      `Tool "${rawRequestedToolId}" is not available for Workspace Manager launch.`,
      "Select a valid tool id from the active registry."
    );
    return;
  }
  const initialToolId = requestedToolId || (toolIds[0] || "");
  writeSelectedToolId(initialToolId);
  updateSwitchMeta();
  updateStandaloneHref(initialToolId);

  if (!initialToolId) {
    if (initialGameEntry && gameLaunchRequested) {
      writeStatus("No active tools are currently available for Workspace Manager.");
      renderMountDiagnostic(
        "No active tools are available for this game context.",
        `gameId=${initialGameEntry.id}`
      );
      return;
    }
    if (toolIds.length === 0) {
      writeStatus("No active tools are currently available for Workspace Manager.");
      renderMountDiagnostic(
        "No active tools are available in Workspace Manager.",
        "Check tool registry visibility and game tool mappings."
      );
      return;
    }
    writeStatus("Select a tool to mount.");
    renderMountDiagnostic(
      "No tool is selected for mount.",
      "Use [PREV] and [NEXT] to choose a tool."
    );
    return;
  }

  if (!mountSelectedTool("init")) {
    return;
  }
}

void init();
