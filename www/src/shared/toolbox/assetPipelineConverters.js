import { createAssetId, normalizeProjectRelativePath } from "./projectAssetRegistry.js";
import { cloneValue, safeString } from "./projectSystemValueUtils.js";

const DEFAULT_BASE_PATHS = Object.freeze({
  vectors: "assets/vectors",
  tilemaps: "assets/tilemaps",
  tilesets: "assets/tilesets",
  sprites: "assets/sprites"
});

function normalizeSection(section, fallback = "") {
  return safeString(section, fallback);
}

function normalizeType(type, fallback = "") {
  return safeString(type, fallback);
}

function normalizePath(pathValue, fallback = "") {
  const normalized = normalizeProjectRelativePath(pathValue);
  return normalized || fallback;
}

function toFileSlug(value, fallback = "asset") {
  const text = safeString(value, fallback)
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return text || fallback;
}

function replacePathExtension(pathValue, extensionWithDot, fallbackDir, fallbackLabel) {
  const normalized = normalizePath(pathValue, "");
  const baseDir = safeString(fallbackDir, "assets");
  const suffix = safeString(extensionWithDot, ".json");
  if (normalized) {
    if (/\.[^./\\]+$/i.test(normalized)) {
      return normalized.replace(/\.[^./\\]+$/i, suffix);
    }
    return `${normalized}${suffix}`;
  }
  return `${baseDir}/${toFileSlug(fallbackLabel, "asset")}${suffix}`;
}

function cloneCandidate(candidate) {
  return candidate && typeof candidate === "object" ? cloneValue(candidate) : {};
}

function withConversionMetadata(candidate, converterId, fromSection, toSection, fromType, toType) {
  const metadata = candidate.metadata && typeof candidate.metadata === "object" ? cloneValue(candidate.metadata) : {};
  metadata.pipelineConversion = {
    converterId,
    fromSection: safeString(fromSection, ""),
    toSection: safeString(toSection, ""),
    fromType: safeString(fromType, ""),
    toType: safeString(toType, "")
  };
  return metadata;
}

function normalizeConversionRequest(rawRequest) {
  const request = rawRequest && typeof rawRequest === "object" ? rawRequest : {};
  return {
    converterId: safeString(request.converterId, ""),
    targetSection: safeString(request.targetSection, ""),
    targetType: safeString(request.targetType, ""),
    sourceHint: safeString(request.sourceHint, "")
  };
}

function createTileToVectorConverter() {
  return {
    id: "tile-to-vector-basic",
    description: "Basic tile/tilemap -> vector conversion metadata shim.",
    match(candidate, request) {
      const sourceSection = normalizeSection(candidate.section, "");
      const sourceType = normalizeType(candidate.type, "");
      const targetSection = normalizeSection(request.targetSection, "");
      const targetType = normalizeType(request.targetType, "");
      const isTileSource = sourceSection === "tilemaps" || sourceSection === "tilesets" || sourceType === "tilemap" || sourceType === "tileset";
      const wantsVector = targetSection === "vectors" || targetType === "vector";
      return isTileSource && wantsVector;
    },
    convert(candidate) {
      const next = cloneCandidate(candidate);
      const fromSection = normalizeSection(next.section, "");
      const fromType = normalizeType(next.type, "");
      next.section = "vectors";
      next.type = "vector";
      next.id = safeString(next.id, "") || createAssetId("vector", next.name || candidate.id || "vector", "vector");
      next.name = safeString(next.name, next.id);
      next.path = replacePathExtension(
        next.path,
        ".vector.json",
        DEFAULT_BASE_PATHS.vectors,
        next.name || next.id
      );
      next.metadata = withConversionMetadata(next, "tile-to-vector-basic", fromSection, next.section, fromType, next.type);
      return next;
    }
  };
}

function createVectorToTileConverter() {
  return {
    id: "vector-to-tile-basic",
    description: "Basic vector -> tilemap/tileset conversion metadata shim.",
    match(candidate, request) {
      const sourceSection = normalizeSection(candidate.section, "");
      const sourceType = normalizeType(candidate.type, "");
      const targetSection = normalizeSection(request.targetSection, "");
      const targetType = normalizeType(request.targetType, "");
      const isVectorSource = sourceSection === "vectors" || sourceType === "vector";
      const wantsTile = targetSection === "tilemaps"
        || targetSection === "tilesets"
        || targetType === "tilemap"
        || targetType === "tileset"
        || targetType === "tile";
      return isVectorSource && wantsTile;
    },
    convert(candidate, request) {
      const next = cloneCandidate(candidate);
      const fromSection = normalizeSection(next.section, "");
      const fromType = normalizeType(next.type, "");

      const explicitSection = normalizeSection(request.targetSection, "");
      const explicitType = normalizeType(request.targetType, "");
      const toSection = explicitSection === "tilesets"
        ? "tilesets"
        : (explicitType === "tileset" ? "tilesets" : "tilemaps");
      const toType = toSection === "tilesets" ? "tileset" : "tilemap";
      const extension = toSection === "tilesets" ? ".tileset.json" : ".tilemap.json";
      const baseDir = toSection === "tilesets" ? DEFAULT_BASE_PATHS.tilesets : DEFAULT_BASE_PATHS.tilemaps;

      next.section = toSection;
      next.type = toType;
      next.id = safeString(next.id, "") || createAssetId(toType, next.name || candidate.id || toType, toType);
      next.name = safeString(next.name, next.id);
      next.path = replacePathExtension(next.path, extension, baseDir, next.name || next.id);
      next.metadata = withConversionMetadata(next, "vector-to-tile-basic", fromSection, next.section, fromType, next.type);
      return next;
    }
  };
}

function createSpriteNormalizationConverter() {
  return {
    id: "sprite-normalize-basic",
    description: "Basic sprite normalization for section/type/path conventions.",
    match(candidate, request) {
      const sourceSection = normalizeSection(candidate.section, "");
      const sourceType = normalizeType(candidate.type, "");
      const targetSection = normalizeSection(request.targetSection, "");
      const targetType = normalizeType(request.targetType, "");
      const explicit = safeString(request.converterId, "") === "sprite-normalize-basic";
      const spriteTarget = targetSection === "sprites" || targetType === "sprite";
      const spriteSource = sourceSection === "sprites" || sourceType === "sprite";
      return explicit || (spriteTarget && spriteSource);
    },
    convert(candidate) {
      const next = cloneCandidate(candidate);
      const fromSection = normalizeSection(next.section, "");
      const fromType = normalizeType(next.type, "");
      next.section = "sprites";
      next.type = "sprite";
      next.id = safeString(next.id, "") || createAssetId("sprite", next.name || candidate.id || "sprite", "sprite");
      next.name = safeString(next.name, next.id);
      next.path = replacePathExtension(
        next.path,
        ".sprite.json",
        DEFAULT_BASE_PATHS.sprites,
        next.name || next.id
      );
      next.metadata = withConversionMetadata(next, "sprite-normalize-basic", fromSection, next.section, fromType, next.type);
      return next;
    }
  };
}

export const DEFAULT_ASSET_PIPELINE_CONVERTERS = Object.freeze([
  createTileToVectorConverter(),
  createVectorToTileConverter(),
  createSpriteNormalizationConverter()
]);

export function createAssetPipelineConverterRegistry(options = {}) {
  const includeDefaults = options.includeDefaults !== false;
  const registry = new Map();
  if (includeDefaults) {
    DEFAULT_ASSET_PIPELINE_CONVERTERS.forEach((converter) => {
      registry.set(converter.id, converter);
    });
  }

  const customConverters = Array.isArray(options.converters) ? options.converters : [];
  customConverters.forEach((converter) => {
    if (!converter || typeof converter !== "object") {
      return;
    }
    const id = safeString(converter.id, "");
    if (!id || typeof converter.match !== "function" || typeof converter.convert !== "function") {
      return;
    }
    registry.set(id, converter);
  });

  return registry;
}

export function listAssetPipelineConverters(registry) {
  const map = registry instanceof Map ? registry : createAssetPipelineConverterRegistry();
  return Array.from(map.values()).map((converter) => ({
    id: safeString(converter.id, ""),
    description: safeString(converter.description, "")
  }));
}

function resolveConverter(registry, candidate, request) {
  const converterId = safeString(request.converterId, "");
  if (converterId && registry.has(converterId)) {
    return registry.get(converterId);
  }

  for (const converter of registry.values()) {
    if (typeof converter.match !== "function") {
      continue;
    }
    if (converter.match(candidate, request) === true) {
      return converter;
    }
  }
  return null;
}

export function convertAssetPipelineCandidate(rawCandidate, options = {}) {
  const candidate = cloneCandidate(rawCandidate);
  const request = normalizeConversionRequest(options.conversion);
  const registry = options.converterRegistry instanceof Map
    ? options.converterRegistry
    : createAssetPipelineConverterRegistry();

  if (!request.converterId && !request.targetSection && !request.targetType) {
    return {
      applied: false,
      converterId: "",
      candidate
    };
  }

  const converter = resolveConverter(registry, candidate, request);
  if (!converter) {
    return {
      applied: false,
      converterId: "",
      candidate
    };
  }

  try {
    const converted = converter.convert(candidate, request);
    return {
      applied: true,
      converterId: safeString(converter.id, ""),
      candidate: cloneCandidate(converted)
    };
  } catch {
    return {
      applied: false,
      converterId: safeString(converter.id, ""),
      candidate
    };
  }
}
