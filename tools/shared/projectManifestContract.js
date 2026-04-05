import { readSharedAssetHandoff, readSharedPaletteHandoff } from "./assetUsageIntegration.js";

export const PROJECT_MANIFEST_SCHEMA = "html-js-gaming.project";
export const PROJECT_MANIFEST_VERSION = 1;
export const ACTIVE_PROJECT_STORAGE_KEY = "toolboxaid.projectSystem.activeManifest";

function cloneValue(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function sanitizeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function sanitizeSharedReference(ref) {
  if (!ref || typeof ref !== "object") {
    return null;
  }

  const displayName = sanitizeString(ref.displayName || ref.name, "");
  const id = sanitizeString(ref.assetId || ref.paletteId || ref.id, "");
  if (!displayName && !id) {
    return null;
  }

  return {
    id,
    type: sanitizeString(ref.assetType || ref.type, "shared-reference"),
    displayName: displayName || id,
    sourcePath: sanitizeString(ref.sourcePath, ""),
    sourceToolId: sanitizeString(ref.sourceToolId, ""),
    updatedAt: sanitizeString(ref.updatedAt, ""),
    metadata: ref.metadata && typeof ref.metadata === "object" ? cloneValue(ref.metadata) : {}
  };
}

function sanitizeToolsBlock(rawTools) {
  if (!rawTools || typeof rawTools !== "object") {
    return {};
  }

  const tools = {};
  Object.entries(rawTools).forEach(([toolId, value]) => {
    if (typeof toolId !== "string" || !toolId.trim() || !value || typeof value !== "object") {
      return;
    }
    tools[toolId.trim()] = cloneValue(value);
  });
  return tools;
}

function createProjectId() {
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const randomSuffix = Math.random().toString(36).slice(2, 8);
  return `project-${timestamp}-${randomSuffix}`;
}

export function normalizeProjectFileName(projectName) {
  const safeBase = sanitizeString(projectName, "untitled-project")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return `${safeBase || "untitled-project"}.project.json`;
}

export function createEmptyProjectManifest(options = {}) {
  const now = new Date().toISOString();
  const toolId = sanitizeString(options.toolId, "");
  const name = sanitizeString(options.name, "Untitled Project");
  const manifest = {
    schema: PROJECT_MANIFEST_SCHEMA,
    version: PROJECT_MANIFEST_VERSION,
    id: sanitizeString(options.id, createProjectId()),
    name,
    createdAt: sanitizeString(options.createdAt, now),
    updatedAt: sanitizeString(options.updatedAt, now),
    activeToolId: toolId,
    dirty: options.dirty === true,
    sharedReferences: {
      asset: sanitizeSharedReference(options.sharedReferences?.asset || readSharedAssetHandoff()),
      palette: sanitizeSharedReference(options.sharedReferences?.palette || readSharedPaletteHandoff())
    },
    tools: sanitizeToolsBlock(options.tools),
    workspace: {
      lastOpenTool: toolId,
      notes: sanitizeString(options.workspace?.notes, "")
    },
    migration: {
      applied: [],
      sourceVersion: PROJECT_MANIFEST_VERSION
    }
  };

  return manifest;
}

export function migrateProjectManifest(rawManifest) {
  if (!rawManifest || typeof rawManifest !== "object") {
    return createEmptyProjectManifest();
  }

  const sourceVersion = Number.isInteger(rawManifest.version) ? rawManifest.version : 0;
  const migrated = createEmptyProjectManifest({
    id: rawManifest.id,
    name: rawManifest.name,
    createdAt: rawManifest.createdAt,
    updatedAt: rawManifest.updatedAt,
    toolId: rawManifest.activeToolId || rawManifest.workspace?.lastOpenTool,
    dirty: rawManifest.dirty === true,
    sharedReferences: rawManifest.sharedReferences,
    tools: rawManifest.tools,
    workspace: rawManifest.workspace
  });

  migrated.migration = {
    sourceVersion,
    applied: []
  };

  if (sourceVersion <= 0) {
    migrated.migration.applied.push("normalize-legacy-project-shape");
  }

  if (sourceVersion > PROJECT_MANIFEST_VERSION) {
    migrated.migration.applied.push("forward-version-opened-as-compatible");
  }

  return migrated;
}

export function validateProjectManifest(rawManifest) {
  const issues = [];
  const warnings = [];
  const manifest = migrateProjectManifest(rawManifest);

  if (manifest.schema !== PROJECT_MANIFEST_SCHEMA) {
    issues.push(`Expected schema ${PROJECT_MANIFEST_SCHEMA} but received ${manifest.schema || "unknown"}.`);
  }

  if (!Number.isInteger(manifest.version) || manifest.version < 1) {
    issues.push("Project manifest version must be a positive integer.");
  }

  if (!sanitizeString(manifest.id, "")) {
    issues.push("Project manifest id is required.");
  }

  if (!sanitizeString(manifest.name, "")) {
    issues.push("Project manifest name is required.");
  }

  if (!manifest.tools || typeof manifest.tools !== "object") {
    issues.push("Project manifest tools block is required.");
  }

  if (manifest.sharedReferences.asset && !manifest.sharedReferences.asset.id && !manifest.sharedReferences.asset.sourcePath) {
    warnings.push("Shared asset reference is present but does not include an id or source path.");
  }

  if (manifest.sharedReferences.palette && !manifest.sharedReferences.palette.id) {
    warnings.push("Shared palette reference is present but does not include an id.");
  }

  return {
    valid: issues.length === 0,
    issues,
    warnings,
    manifest
  };
}

export function serializeProjectManifest(manifest) {
  const validation = validateProjectManifest(manifest);
  return JSON.stringify(validation.manifest, null, 2);
}

export function captureSharedReferenceSnapshot() {
  return {
    asset: sanitizeSharedReference(readSharedAssetHandoff()),
    palette: sanitizeSharedReference(readSharedPaletteHandoff())
  };
}
