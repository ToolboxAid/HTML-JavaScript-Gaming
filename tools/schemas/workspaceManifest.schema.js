import { cloneValue, safeString } from "../shared/projectSystemValueUtils.js";

export const WORKSPACE_MANIFEST_SCHEMA = "html-js-gaming.project";
export const WORKSPACE_MANIFEST_VERSION = 1;
export const WORKSPACE_DOCUMENT_KIND = "workspace-manifest";
export const WORKSPACE_EXPORT_ARTIFACT_SCHEMA = "html-js-gaming.workspace-export-artifacts/1";

const ALLOWED_EXPORT_ARTIFACT_EXTENSIONS = new Set(["png"]);
const RESERVED_EXTERNAL_ASSET_KEYS = new Set([
  "externalAssets",
  "viewerAssets",
  "assetCatalogPath"
]);

const KNOWN_WORKSPACE_KEYS = new Set([
  "documentKind",
  "schema",
  "version",
  "id",
  "name",
  "createdAt",
  "updatedAt",
  "activeToolId",
  "dirty",
  "sharedReferences",
  "sharedLibrary",
  "tools",
  "toolIntegration",
  "workspace",
  "migration",
  "exportArtifacts"
]);

function normalizeText(value, fallback = "") {
  return safeString(value, fallback);
}

function toObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeExportArtifacts(rawArtifacts) {
  if (!Array.isArray(rawArtifacts)) {
    return [];
  }
  return rawArtifacts
    .filter((entry) => entry && typeof entry === "object")
    .map((entry) => ({
      schema: WORKSPACE_EXPORT_ARTIFACT_SCHEMA,
      kind: normalizeText(entry.kind, "png").toLowerCase(),
      path: normalizeText(entry.path, ""),
      sourceToolId: normalizeText(entry.sourceToolId, ""),
      createdAt: normalizeText(entry.createdAt, "")
    }));
}

function getPathExtension(pathValue) {
  const safePath = normalizeText(pathValue).split("?")[0];
  const match = safePath.match(/\.([^.\\/]+)$/);
  return match ? match[1].toLowerCase() : "";
}

export function normalizeWorkspaceManifestSchema(rawManifest) {
  const source = toObject(rawManifest);
  const normalized = cloneValue(source);
  normalized.documentKind = normalizeText(source.documentKind, WORKSPACE_DOCUMENT_KIND);
  normalized.schema = normalizeText(source.schema, WORKSPACE_MANIFEST_SCHEMA);
  normalized.version = Number.isInteger(source.version) ? source.version : WORKSPACE_MANIFEST_VERSION;
  normalized.id = normalizeText(source.id, "");
  normalized.name = normalizeText(source.name, "");
  normalized.tools = toObject(source.tools);
  normalized.sharedLibrary = toObject(source.sharedLibrary);
  normalized.exportArtifacts = normalizeExportArtifacts(source.exportArtifacts);
  return normalized;
}

export function validateWorkspaceManifestSchema(rawManifest, options = {}) {
  const requireSchema = options.requireSchema !== false;
  const source = toObject(rawManifest);
  const manifest = normalizeWorkspaceManifestSchema(source);
  const issues = [];
  const warnings = [];

  if (requireSchema && manifest.documentKind !== WORKSPACE_DOCUMENT_KIND) {
    issues.push(`Workspace documentKind must be ${WORKSPACE_DOCUMENT_KIND}.`);
  }

  if (requireSchema && manifest.schema !== WORKSPACE_MANIFEST_SCHEMA) {
    issues.push(`Workspace schema must be ${WORKSPACE_MANIFEST_SCHEMA}.`);
  }

  if (!Number.isInteger(manifest.version) || manifest.version < WORKSPACE_MANIFEST_VERSION) {
    issues.push("Workspace version must be a positive integer.");
  }

  if (!manifest.id) {
    issues.push("Workspace id is required.");
  }

  if (!manifest.name) {
    issues.push("Workspace name is required.");
  }

  if (!manifest.tools || typeof manifest.tools !== "object") {
    issues.push("Workspace tools block is required.");
  }

  RESERVED_EXTERNAL_ASSET_KEYS.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      issues.push(`Workspace-owned assets must remain in workspace.manifest (remove ${key}).`);
    }
  });

  manifest.exportArtifacts.forEach((artifact, index) => {
    const extension = getPathExtension(artifact.path);
    if (!artifact.path) {
      issues.push(`exportArtifacts[${index}].path is required.`);
      return;
    }
    if (!ALLOWED_EXPORT_ARTIFACT_EXTENSIONS.has(extension)) {
      issues.push(`exportArtifacts[${index}] must point to a rendered artifact (.png).`);
    }
  });

  Object.keys(source).forEach((key) => {
    if (!KNOWN_WORKSPACE_KEYS.has(key)) {
      warnings.push(`Workspace manifest contains unknown key: ${key}.`);
    }
  });

  return {
    valid: issues.length === 0,
    issues,
    warnings,
    manifest
  };
}
