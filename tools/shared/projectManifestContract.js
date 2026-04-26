import { readSharedAssetHandoff, readSharedPaletteHandoff } from "./assetUsageIntegration.js";
import { cloneValue, safeString } from "./projectSystemValueUtils.js";
import {
  buildProjectToolIntegration,
  PROJECT_TOOL_INTEGRATION_SCHEMA,
  PROJECT_TOOL_INTEGRATION_VERSION,
  normalizeToolStateForProjectManifest
} from "./projectToolIntegration.js";
import {
  WORKSPACE_DOCUMENT_KIND,
  WORKSPACE_EXPORT_ARTIFACT_SCHEMA,
  WORKSPACE_MANIFEST_SCHEMA,
  WORKSPACE_MANIFEST_VERSION,
  validateWorkspaceManifestSchema
} from "./workspaceManifest.schema.js";

export const PROJECT_MANIFEST_SCHEMA = WORKSPACE_MANIFEST_SCHEMA;
export const PROJECT_MANIFEST_VERSION = WORKSPACE_MANIFEST_VERSION;
export const ACTIVE_PROJECT_STORAGE_KEY = "toolboxaid.projectSystem.activeManifest";
export const PROJECT_DOCUMENT_KIND = WORKSPACE_DOCUMENT_KIND;

const sanitizeString = safeString;

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
    tools[toolId.trim()] = normalizeToolStateForProjectManifest(toolId.trim(), value);
  });
  return tools;
}

function sanitizeSharedLibrary(rawSharedLibrary) {
  if (!rawSharedLibrary || typeof rawSharedLibrary !== "object") {
    return {
      assets: [],
      palettes: []
    };
  }

  const sanitizeEntries = (entries) => Array.isArray(entries)
    ? entries
      .filter((entry) => entry && typeof entry === "object")
      .map((entry) => ({
        id: sanitizeString(entry.id, ""),
        type: sanitizeString(entry.type, ""),
        displayName: sanitizeString(entry.displayName || entry.name, ""),
        sourcePath: sanitizeString(entry.sourcePath, ""),
        sourceToolId: sanitizeString(entry.sourceToolId, "")
      }))
    : [];

  return {
    assets: sanitizeEntries(rawSharedLibrary.assets),
    palettes: sanitizeEntries(rawSharedLibrary.palettes)
  };
}

function sanitizeExportArtifacts(rawExportArtifacts) {
  if (!Array.isArray(rawExportArtifacts)) {
    return [];
  }
  return rawExportArtifacts
    .filter((entry) => entry && typeof entry === "object")
    .map((entry) => ({
      schema: WORKSPACE_EXPORT_ARTIFACT_SCHEMA,
      kind: sanitizeString(entry.kind, "png").toLowerCase(),
      path: sanitizeString(entry.path, ""),
      sourceToolId: sanitizeString(entry.sourceToolId, ""),
      createdAt: sanitizeString(entry.createdAt, "")
    }));
}

function createProjectId() {
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const randomSuffix = Math.random().toString(36).slice(2, 8);
  return `project-${timestamp}-${randomSuffix}`;
}

export function normalizeProjectFileName(projectName) {
  const safeBase = sanitizeString(projectName, "untitled-workspace")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const normalizedBase = safeBase || "untitled-workspace";
  const baseWithWorkspace = normalizedBase.includes("workspace")
    ? normalizedBase
    : `${normalizedBase}-workspace`;
  return `${baseWithWorkspace}.project.json`;
}

export function createEmptyProjectManifest(options = {}) {
  const now = new Date().toISOString();
  const toolId = sanitizeString(options.toolId, "");
  const tools = sanitizeToolsBlock(options.tools);
  const name = sanitizeString(options.name, "Untitled Project");
  const manifest = {
    documentKind: PROJECT_DOCUMENT_KIND,
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
    sharedLibrary: sanitizeSharedLibrary(options.sharedLibrary),
    tools,
    toolIntegration: buildProjectToolIntegration(tools),
    workspace: {
      lastOpenTool: toolId,
      notes: sanitizeString(options.workspace?.notes, "")
    },
    exportArtifacts: sanitizeExportArtifacts(options.exportArtifacts),
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
    sharedLibrary: rawManifest.sharedLibrary,
    tools: rawManifest.tools,
    workspace: rawManifest.workspace,
    exportArtifacts: rawManifest.exportArtifacts
  });

  migrated.migration = {
    sourceVersion,
    applied: []
  };

  if (sourceVersion <= 0) {
    migrated.migration.applied.push("normalize-legacy-project-shape");
  }

  if (sanitizeString(rawManifest.documentKind, "") !== PROJECT_DOCUMENT_KIND) {
    migrated.migration.applied.push("project-document-kind-added");
  }

  if (sourceVersion > PROJECT_MANIFEST_VERSION) {
    migrated.migration.applied.push("forward-version-opened-as-compatible");
  }

  if (!rawManifest.toolIntegration || typeof rawManifest.toolIntegration !== "object") {
    migrated.migration.applied.push("project-tool-integration-created");
  }

  migrated.toolIntegration = buildProjectToolIntegration(migrated.tools);

  return migrated;
}

export function validateProjectManifest(rawManifest) {
  const issues = [];
  const warnings = [];
  let manifest = migrateProjectManifest(rawManifest);

  const workspaceValidation = validateWorkspaceManifestSchema(manifest, {
    requireSchema: true
  });
  manifest = workspaceValidation.manifest;
  issues.push(...workspaceValidation.issues);
  warnings.push(...workspaceValidation.warnings);

  if (!manifest.toolIntegration || typeof manifest.toolIntegration !== "object") {
    issues.push("Project manifest toolIntegration block is required.");
  } else {
    if (manifest.toolIntegration.schema !== PROJECT_TOOL_INTEGRATION_SCHEMA) {
      warnings.push(`Project toolIntegration schema expected ${PROJECT_TOOL_INTEGRATION_SCHEMA} but received ${manifest.toolIntegration.schema || "unknown"}.`);
    }
    if (manifest.toolIntegration.version !== PROJECT_TOOL_INTEGRATION_VERSION) {
      warnings.push(`Project toolIntegration version expected ${PROJECT_TOOL_INTEGRATION_VERSION} but received ${manifest.toolIntegration.version || "unknown"}.`);
    }
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
