import {
  createAssetId,
  normalizeProjectRelativePath,
  sanitizeAssetRegistry,
  upsertRegistryEntry
} from "./projectAssetRegistry.js";
import { cloneValue, safeString } from "./projectSystemValueUtils.js";

export const ASSET_PIPELINE_STAGES = Object.freeze({
  INGEST: "ingest",
  NORMALIZE: "normalize",
  VALIDATE: "validate",
  REGISTER: "register"
});

export const ASSET_PIPELINE_SECTION_RULES = Object.freeze({
  palettes: { type: "palette", requiresPath: false },
  sprites: { type: "sprite", requiresPath: true },
  vectors: { type: "vector", requiresPath: true },
  tilesets: { type: "tileset", requiresPath: true },
  tilemaps: { type: "tilemap", requiresPath: true },
  images: { type: "image", requiresPath: true },
  parallaxSources: { type: "parallaxSource", requiresPath: true }
});

const KNOWN_PIPELINE_SECTIONS = Object.freeze(Object.keys(ASSET_PIPELINE_SECTION_RULES));

function normalizeSection(section, fallback = "") {
  const safeSection = safeString(section, fallback);
  return KNOWN_PIPELINE_SECTIONS.includes(safeSection) ? safeSection : "";
}

function inferSectionFromType(type) {
  const safeType = safeString(type, "");
  return KNOWN_PIPELINE_SECTIONS.find((section) => ASSET_PIPELINE_SECTION_RULES[section].type === safeType) || "";
}

function buildFallbackLabel(candidate) {
  const baseName = safeString(candidate.name, "");
  if (baseName) {
    return baseName;
  }
  const normalizedPath = normalizeProjectRelativePath(candidate.path);
  if (normalizedPath) {
    return normalizedPath.split("/").pop() || normalizedPath;
  }
  return safeString(candidate.section, "asset");
}

export function ingestAssetPipelineCandidate(input = {}) {
  return {
    stage: ASSET_PIPELINE_STAGES.INGEST,
    section: safeString(input.section, ""),
    type: safeString(input.type, ""),
    id: safeString(input.id, ""),
    name: safeString(input.name, ""),
    path: typeof input.path === "string" ? input.path : "",
    sourceTool: safeString(input.sourceTool, ""),
    metadata: input.metadata && typeof input.metadata === "object" ? cloneValue(input.metadata) : {}
  };
}

export function normalizeAssetPipelineCandidate(rawCandidate = {}) {
  const candidate = ingestAssetPipelineCandidate(rawCandidate);
  const section = normalizeSection(candidate.section) || inferSectionFromType(candidate.type);
  const sectionRules = ASSET_PIPELINE_SECTION_RULES[section] || { type: "asset", requiresPath: true };
  const type = safeString(candidate.type, sectionRules.type);
  const normalizedPath = normalizeProjectRelativePath(candidate.path);
  const fallbackLabel = buildFallbackLabel({ ...candidate, section });
  const normalizedId = safeString(candidate.id, "") || createAssetId(type || section || "asset", fallbackLabel, "asset");

  return {
    stage: ASSET_PIPELINE_STAGES.NORMALIZE,
    section,
    type: type || safeString(sectionRules.type, "asset"),
    id: normalizedId,
    name: safeString(candidate.name, fallbackLabel || normalizedId),
    path: normalizedPath,
    sourceTool: safeString(candidate.sourceTool, ""),
    metadata: cloneValue(candidate.metadata)
  };
}

export function validateAssetPipelineCandidate(rawCandidate = {}) {
  const candidate = normalizeAssetPipelineCandidate(rawCandidate);
  const issues = [];
  const warnings = [];

  if (!candidate.section) {
    issues.push("Asset pipeline section is required and must match a supported section.");
  }

  if (!candidate.id) {
    issues.push("Asset pipeline candidate id is required after normalization.");
  }

  if (!candidate.type) {
    issues.push("Asset pipeline candidate type is required after normalization.");
  }

  const rules = ASSET_PIPELINE_SECTION_RULES[candidate.section];
  const requiresPath = rules ? rules.requiresPath === true : true;
  if (requiresPath && !candidate.path) {
    issues.push(`Asset pipeline candidate path is required for section ${candidate.section}.`);
  }

  if (!candidate.sourceTool) {
    warnings.push("Asset pipeline candidate sourceTool is empty.");
  }

  return {
    stage: ASSET_PIPELINE_STAGES.VALIDATE,
    valid: issues.length === 0,
    issues,
    warnings,
    candidate
  };
}

export function registerAssetPipelineCandidate(options = {}) {
  const incomingRegistry = options.registry && typeof options.registry === "object"
    ? options.registry
    : {};
  const entryFields = options.entryFields && typeof options.entryFields === "object"
    ? cloneValue(options.entryFields)
    : {};
  const ingestInput = {
    ...options.ingest,
    section: safeString(options.section, options.ingest?.section || "")
  };
  const validation = validateAssetPipelineCandidate(ingestInput);
  const registry = sanitizeAssetRegistry(incomingRegistry);

  if (!validation.valid) {
    return {
      stage: ASSET_PIPELINE_STAGES.REGISTER,
      valid: false,
      registry,
      entry: null,
      validation
    };
  }

  const normalized = validation.candidate;
  const rules = ASSET_PIPELINE_SECTION_RULES[normalized.section] || { requiresPath: true };
  const entry = {
    id: normalized.id,
    name: normalized.name,
    sourceTool: normalized.sourceTool,
    ...entryFields
  };

  if (rules.requiresPath === true) {
    entry.path = normalized.path;
  }

  const nextRegistry = upsertRegistryEntry(registry, normalized.section, entry);
  return {
    stage: ASSET_PIPELINE_STAGES.REGISTER,
    valid: true,
    registry: nextRegistry,
    entry,
    validation
  };
}

export function summarizeAssetPipelineRules() {
  return {
    schema: "tools.asset-pipeline-foundation-rules/1",
    stages: cloneValue(ASSET_PIPELINE_STAGES),
    sectionRules: cloneValue(ASSET_PIPELINE_SECTION_RULES)
  };
}
