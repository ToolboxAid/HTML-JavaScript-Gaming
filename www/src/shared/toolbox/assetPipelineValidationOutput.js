import {
  buildAssetDependencyGraph,
  createRegistryDownloadPayload,
  findRegistryEntryById,
  sanitizeAssetRegistry
} from "./projectAssetRegistry.js";
import { cloneValue, safeString } from "./projectSystemValueUtils.js";

export const ASSET_PIPELINE_RUNTIME_STAGES = Object.freeze({
  VALIDATION: "validation",
  OUTPUT: "output"
});

export const ASSET_PIPELINE_OUTPUT_FORMATS = Object.freeze({
  JSON: "json"
});

const DEFAULT_REFERENCE_FIELDS = Object.freeze([
  { field: "paletteId", section: "palettes" },
  { field: "tilesetId", section: "tilesets" },
  { field: "imageId", section: "images" }
]);

function toDeterministicSlug(value, fallback = "project") {
  const slug = safeString(value, fallback)
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || fallback;
}

function listSectionNames(sectionRules) {
  const source = sectionRules && typeof sectionRules === "object" ? sectionRules : {};
  return Object.keys(source);
}

function normalizeMetadataReferences(metadata) {
  const source = metadata && typeof metadata === "object" ? metadata : {};
  const references = Array.isArray(source.references) ? source.references : [];
  return references
    .map((entry) => ({
      section: safeString(entry?.section, ""),
      id: safeString(entry?.id, "")
    }))
    .filter((entry) => entry.section && entry.id);
}

function collectCandidateReferences(candidate) {
  const source = candidate && typeof candidate === "object" ? candidate : {};
  const references = [];

  DEFAULT_REFERENCE_FIELDS.forEach((rule) => {
    const referencedId = safeString(source[rule.field], "");
    if (!referencedId) {
      return;
    }
    references.push({
      field: rule.field,
      section: rule.section,
      id: referencedId
    });
  });

  normalizeMetadataReferences(source.metadata).forEach((entry) => {
    references.push({
      field: "metadata.references",
      section: entry.section,
      id: entry.id
    });
  });

  return references;
}

function validateSectionShape(registry, sectionNames, issues) {
  sectionNames.forEach((section) => {
    if (!Array.isArray(registry[section])) {
      issues.push(`Asset registry section ${section} must be an array.`);
    }
  });
}

function validateEntryIds(registry, sectionNames, issues, warnings) {
  const globalIds = new Set();
  sectionNames.forEach((section) => {
    const entries = Array.isArray(registry[section]) ? registry[section] : [];
    entries.forEach((entry, index) => {
      const id = safeString(entry?.id, "");
      if (!id) {
        issues.push(`Asset entry at ${section}[${index}] is missing id.`);
        return;
      }
      if (!/^[a-z0-9._-]+$/i.test(id)) {
        issues.push(`Asset id contains unsupported characters at ${section}[${index}]: ${id}.`);
        return;
      }
      if (globalIds.has(id)) {
        warnings.push(`Duplicate asset id detected across registry sections: ${id}.`);
        return;
      }
      globalIds.add(id);
    });
  });
}

function validateCandidateReferencesAgainstRegistry(candidate, registry, sectionNames, issues) {
  collectCandidateReferences(candidate).forEach((reference) => {
    if (!sectionNames.includes(reference.section)) {
      issues.push(`Unsupported reference section ${reference.section} on field ${reference.field}.`);
      return;
    }

    const target = findRegistryEntryById(registry, reference.section, reference.id);
    if (!target) {
      issues.push(
        `Reference ${reference.field} -> ${reference.section}:${reference.id} could not be resolved in registry.`
      );
    }
  });
}

function classifyGraphFindings(findings, issues, warnings) {
  const list = Array.isArray(findings) ? findings : [];
  list.forEach((finding) => {
    const kind = safeString(finding?.kind, "");
    const message = safeString(finding?.message, "");
    if (!message) {
      return;
    }
    if (kind === "missingTarget" || kind === "duplicateNodeId") {
      issues.push(message);
      return;
    }
    warnings.push(message);
  });
}

function summarizeRegistry(registry, sectionNames) {
  const sections = {};
  let totalAssets = 0;
  sectionNames.forEach((section) => {
    const count = Array.isArray(registry[section]) ? registry[section].length : 0;
    sections[section] = count;
    totalAssets += count;
  });
  return {
    totalAssets,
    sections
  };
}

export function validateAssetPipelineState(options = {}) {
  const sectionRules = options.sectionRules && typeof options.sectionRules === "object"
    ? options.sectionRules
    : {};
  const sectionNames = listSectionNames(sectionRules);
  const registry = sanitizeAssetRegistry(options.registry);
  const candidate = options.candidate && typeof options.candidate === "object"
    ? cloneValue(options.candidate)
    : null;

  const issues = [];
  const warnings = [];
  validateSectionShape(registry, sectionNames, issues);
  validateEntryIds(registry, sectionNames, issues, warnings);
  if (candidate) {
    validateCandidateReferencesAgainstRegistry(candidate, registry, sectionNames, issues);
  }

  const { findings } = buildAssetDependencyGraph(registry);
  classifyGraphFindings(findings, issues, warnings);

  return {
    stage: ASSET_PIPELINE_RUNTIME_STAGES.VALIDATION,
    valid: issues.length === 0,
    issues,
    warnings,
    findings: cloneValue(findings),
    summary: summarizeRegistry(registry, sectionNames)
  };
}

export function createAssetPipelineOutputArtifact(options = {}) {
  const sectionRules = options.sectionRules && typeof options.sectionRules === "object"
    ? options.sectionRules
    : {};
  const sectionNames = listSectionNames(sectionRules);
  const registry = sanitizeAssetRegistry(options.registry);
  const validation = options.validation && typeof options.validation === "object"
    ? cloneValue(options.validation)
    : validateAssetPipelineState({ registry, sectionRules });
  const format = safeString(options.format, ASSET_PIPELINE_OUTPUT_FORMATS.JSON);
  const safeFormat = format === ASSET_PIPELINE_OUTPUT_FORMATS.JSON
    ? ASSET_PIPELINE_OUTPUT_FORMATS.JSON
    : ASSET_PIPELINE_OUTPUT_FORMATS.JSON;
  const projectSlug = toDeterministicSlug(registry.projectId || "project", "project");
  const fileName = `${projectSlug}.assets.pipeline.json`;
  const filePath = `build/assets/${fileName}`;

  const artifact = {
    schema: "tools.asset-pipeline-output/1",
    format: safeFormat,
    projectId: safeString(registry.projectId, "project"),
    summary: summarizeRegistry(registry, sectionNames),
    validation: {
      valid: validation.valid === true,
      issueCount: Array.isArray(validation.issues) ? validation.issues.length : 0,
      warningCount: Array.isArray(validation.warnings) ? validation.warnings.length : 0
    },
    registry: cloneValue(registry)
  };

  return {
    stage: ASSET_PIPELINE_RUNTIME_STAGES.OUTPUT,
    format: safeFormat,
    fileName,
    filePath,
    registryPayload: createRegistryDownloadPayload(registry),
    artifact,
    serialized: `${JSON.stringify(artifact, null, 2)}\n`
  };
}
