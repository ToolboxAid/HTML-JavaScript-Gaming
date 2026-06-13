import { createGameConfigurationMockRepository } from "./game-configuration-mock-repository.js";
import {
  createGameWorkspacePaletteRepository
} from "./palette-workspace-repository.js";
import {
  loadMockDbTables,
  MOCK_DB_KEYS,
  mockDbPersistenceEnabled,
  normalizeMockDbTables,
  saveMockDbTables,
} from "../mock-db-store.js";

export const ASSET_TOOL_TABLES = Object.freeze([
  "asset_role_definitions",
  "asset_library_items",
  "asset_storage_objects",
  "asset_import_events",
  "asset_validation_items"
]);

const ASSET_DB_OWNER = "asset";
const ASSET_SYSTEM_USER_KEY = MOCK_DB_KEYS.users.forgeBot;
const DEFAULT_ASSET_USER_KEY = MOCK_DB_KEYS.users.user1;

export const ASSET_PICKER_MODES = Object.freeze([
  "file",
  "palette",
  "managed-tool",
  "advanced"
]);

export const ASSET_ROLE_DEFINITIONS = Object.freeze([
  {
    id: "audio",
    label: "Audio",
    storageFolder: "audio",
    extensions: [".mp3", ".wav", ".ogg", ".m4a"],
    mimeTypes: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4"],
    previewBehavior: "Browser audio metadata preview",
    uploadEnabled: true,
    inputMode: "file",
    maxSizeBytes: 52428800,
    usageRoles: ["sound", "music"],
    validationNeeds: ["MIME must be audio/* or approved audio MIME", "File size must be greater than zero", "Project storage path must be generated under projects/<projectId>/audio/<usage>/"]
  },
  {
    id: "color",
    label: "Color",
    storageFolder: "color",
    extensions: [],
    mimeTypes: [],
    previewBehavior: "Swatch metadata preview",
    uploadEnabled: true,
    inputMode: "palette",
    maxSizeBytes: 1048576,
    usageRoles: ["hud", "text", "background", "border", "accent", "warning", "success", "danger", "shadow", "highlight"],
    validationNeeds: ["Active Palette Tool swatch required", "Palette color metadata must include key, hex, name, and tags when present"]
  },
  {
    id: "data",
    label: "Data",
    storageFolder: "data",
    extensions: [".json", ".csv", ".txt"],
    mimeTypes: ["application/json", "text/csv", "text/plain"],
    previewBehavior: "Data/Table Tool managed preview",
    uploadEnabled: false,
    inputMode: "managed-tool",
    maxSizeBytes: 5242880,
    usageRoles: ["config", "table"],
    validationNeeds: ["Data/Table Tool required", "Structured data must declare format"]
  },
  {
    id: "font",
    label: "Font",
    storageFolder: "font",
    extensions: [".ttf", ".otf", ".woff", ".woff2"],
    mimeTypes: ["font/woff", "font/woff2", "font/ttf", "font/otf"],
    previewBehavior: "Font sample preview",
    uploadEnabled: true,
    inputMode: "file",
    maxSizeBytes: 10485760,
    usageRoles: ["ui", "display"],
    validationNeeds: ["Font files must use approved font formats", "Project storage path must be generated under projects/<projectId>/font/<usage>/"]
  },
  {
    id: "image",
    label: "Image",
    storageFolder: "image",
    extensions: [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"],
    mimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"],
    previewBehavior: "Image metadata preview",
    uploadEnabled: true,
    inputMode: "file",
    maxSizeBytes: 10485760,
    usageRoles: ["sprite", "background", "bezel", "preview", "ui"],
    validationNeeds: ["MIME must be image/* or approved image MIME", "File size must be greater than zero", "Project storage path must be generated under projects/<projectId>/image/<usage>/"]
  },
  {
    id: "localization",
    label: "Localization",
    storageFolder: "localization",
    extensions: [".json", ".po", ".pot", ".xliff", ".xlf"],
    mimeTypes: ["application/json", "text/plain", "application/x-xliff+xml"],
    previewBehavior: "Localization Tool managed preview",
    uploadEnabled: false,
    inputMode: "managed-tool",
    maxSizeBytes: 5242880,
    usageRoles: ["strings", "dialogue"],
    validationNeeds: ["Localization Tool required", "Localization files must declare locale"]
  },
  {
    id: "shader",
    label: "Shader",
    storageFolder: "shader",
    extensions: [".glsl", ".vert", ".frag", ".wgsl"],
    mimeTypes: ["text/plain"],
    previewBehavior: "Advanced shader source metadata preview",
    uploadEnabled: false,
    inputMode: "advanced",
    maxSizeBytes: 2097152,
    usageRoles: ["fragment", "vertex", "compute"],
    validationNeeds: ["Advanced/Admin mode required", "Shader stage metadata is required"]
  },
  {
    id: "video",
    label: "Video",
    storageFolder: "video",
    extensions: [".mp4", ".webm", ".mov"],
    mimeTypes: ["video/mp4", "video/webm", "video/quicktime"],
    previewBehavior: "Browser video metadata preview",
    uploadEnabled: true,
    inputMode: "file",
    maxSizeBytes: 209715200,
    usageRoles: ["cutscene", "loop"],
    validationNeeds: ["MIME must be video/* or approved video MIME", "File size must be greater than zero", "Project storage path must be generated under projects/<projectId>/video/<usage>/"]
  }
]);

export const ASSET_ROLE_LABELS = Object.freeze(ASSET_ROLE_DEFINITIONS.map((role) => role.label));

export const ASSET_USAGE_BY_ROLE = Object.freeze(Object.fromEntries(
  ASSET_ROLE_DEFINITIONS.map((role) => [role.id, Object.freeze([...role.usageRoles])])
));

export const ASSET_TYPES = ASSET_ROLE_LABELS;

export const ASSET_CATALOG_TYPES = Object.freeze([
  "Images",
  "Audio",
  "Fonts",
  "Sprites",
  "Vectors",
  "Palette References",
  "Data"
]);

export const ASSET_USAGE_OPTIONS = Object.freeze([
  "Background",
  "Character",
  "Enemy",
  "Environment",
  "Font",
  "Icon",
  "Interface",
  "Music",
  "Sound Effect",
  "Sprite",
  "Theme",
  "Tile",
  "Voice"
]);

const DEMO_ASSET_PROJECT_ID = "01K8M3K0EX7V5A3W9Q2Y6R4T1B";
const PROJECT_ASSET_STORAGE_ROOT = "projects";
const COLOR_ASSET_MIME_TYPE = "application/x.gamefoundry.palette-color";
const ULID_PATTERN = /^[0-9A-HJKMNP-TV-Z]{26}$/;

const REQUIRED_UPLOAD_FIELDS = Object.freeze([
  {
    field: "name",
    label: "Asset Name",
    action: "Name the asset before importing it."
  },
  {
    field: "assetRole",
    label: "Asset Role",
    action: "Choose an approved asset role."
  },
  {
    field: "usage",
    label: "Usage",
    action: "Choose how the asset is used by the project."
  },
  {
    field: "fileName",
    label: "Upload File",
    action: "Choose a user asset file to add."
  }
]);

const READY_CONFIGURATION_INPUT = Object.freeze({
  audioSetup: "Simple pickup, hazard, and completion sounds.",
  gameBasics: "A playable puzzle configuration ready for asset planning.",
  gameRules: "Collect every key, avoid hazards, and reach the exit.",
  objectSetup: "Keys, doors, hazards, exit marker, and tutorial prompt.",
  playerSetup: "One player starts near the first key with keyboard controls.",
  testReadiness: "Confirm start, collect, fail, retry, and win paths before Build Game.",
  worldSetup: "One compact room with a locked exit and visible goal path."
});

function cloneRows(rows) {
  return rows.map((row) => ({ ...row }));
}

function cloneTables(tables) {
  return Object.fromEntries(
    ASSET_TOOL_TABLES.map((table) => [table, cloneRows(tables[table] || [])])
  );
}

function roleDefinitionRows() {
  return ASSET_ROLE_DEFINITIONS.map((role, index) => ({
    id: role.id,
    label: role.label,
    storageFolder: role.storageFolder,
    extensions: role.extensions.join(", "),
    mimeTypes: role.mimeTypes.join(", "),
    previewBehavior: role.previewBehavior,
    uploadEnabled: role.uploadEnabled,
    inputMode: role.inputMode,
    usageRoles: role.usageRoles.join(", "),
    maxSizeBytes: role.maxSizeBytes,
    dbFields: uploadedAssetMetadataFields().join(", "),
    validationNeeds: role.validationNeeds.join("; "),
    ...auditFields(timestampForIndex(index), ASSET_SYSTEM_USER_KEY)
  }));
}

function createEmptyTables() {
  return {
    asset_import_events: [],
    asset_library_items: [],
    asset_role_definitions: roleDefinitionRows(),
    asset_storage_objects: [],
    asset_validation_items: []
  };
}

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeRoleId(value) {
  const normalized = normalizeText(value).toLowerCase();
  const fromId = ASSET_ROLE_DEFINITIONS.find((role) => role.id === normalized);
  if (fromId) {
    return fromId.id;
  }
  const fromLabel = ASSET_ROLE_DEFINITIONS.find((role) => role.label.toLowerCase() === normalized);
  return fromLabel?.id || "";
}

function normalizeUsage(value, assetRole) {
  const normalized = normalizeText(value);
  const role = roleDefinitionForId(assetRole);
  return role?.usageRoles.includes(normalized) ? normalized : "";
}

function normalizeCatalogAssetType(value) {
  const normalized = normalizeText(value);
  const match = ASSET_CATALOG_TYPES.find((type) => type.toLowerCase() === normalized.toLowerCase());
  return match || "";
}

function normalizeCatalogUsage(value) {
  const normalized = normalizeText(value);
  const match = ASSET_USAGE_OPTIONS.find((usage) => usage.toLowerCase() === normalized.toLowerCase());
  return match || "";
}

function catalogAssetRoleForType(assetType) {
  if (assetType === "Audio") return "audio";
  if (assetType === "Fonts") return "font";
  if (assetType === "Data") return "data";
  return "image";
}

function catalogFileNameForName(name, assetType) {
  const slug = slugify(name || assetType);
  if (assetType === "Audio") return `${slug}.wav`;
  if (assetType === "Fonts") return `${slug}.woff2`;
  if (assetType === "Data") return `${slug}.json`;
  if (assetType === "Vectors") return `${slug}.svg`;
  if (assetType === "Palette References") return `${slug}.palette`;
  return `${slug}.png`;
}

function normalizeAssetTagKeys(values, tagOptions = []) {
  const allowed = new Set(tagOptions.map((tag) => tag.id));
  return (Array.isArray(values) ? values : [])
    .map(normalizeText)
    .filter(Boolean)
    .filter((value, index, all) => all.indexOf(value) === index)
    .filter((value) => allowed.has(value));
}

function normalizeProjectId(value) {
  const normalized = normalizeText(value).toUpperCase();
  return ULID_PATTERN.test(normalized) ? normalized : "";
}

function assetProjectIdForProject(project) {
  if (!project) {
    return "";
  }

  if (project.id === "demo-game") {
    return DEMO_ASSET_PROJECT_ID;
  }

  return normalizeProjectId(project.id);
}

function roleDefinitionForId(roleId) {
  return ASSET_ROLE_DEFINITIONS.find((role) => role.id === roleId) || null;
}

export function pickerDiagnosticForRole(role, paletteSnapshot = null) {
  if (!role) {
    return "Choose an approved asset role.";
  }
  if (role.inputMode === "palette") {
    if (!paletteSnapshot?.activeProject) {
      return "Palette Tool required / active project required.";
    }
    if (!Array.isArray(paletteSnapshot.swatches) || paletteSnapshot.swatches.length === 0) {
      return "Palette Tool required / no swatches available.";
    }
    return "Palette swatch picker ready.";
  }
  if (role.id === "data") {
    return "Data/Table Tool required.";
  }
  if (role.id === "localization") {
    return "Localization Tool required.";
  }
  if (role.inputMode === "advanced") {
    return "Advanced/Admin mode required.";
  }
  return `${role.label} file upload ready.`;
}

function extensionForFileName(fileName) {
  const match = normalizeText(fileName).toLowerCase().match(/(\.[a-z0-9]+)$/);
  return match ? match[1] : "";
}

function mimeMatchesRole(role, mimeType) {
  const normalizedMime = normalizeText(mimeType).toLowerCase();
  if (!normalizedMime) {
    return false;
  }
  if (role.mimeTypes.includes(normalizedMime)) {
    return true;
  }
  return normalizedMime.startsWith(`${role.id}/`);
}

function extensionMatchesRole(role, fileName) {
  const extension = extensionForFileName(fileName);
  return Boolean(extension && role.extensions.includes(extension));
}

function sanitizeFileName(fileName) {
  const raw = normalizeText(fileName) || "asset";
  const extension = extensionForFileName(raw);
  const basename = extension ? raw.slice(0, -extension.length) : raw;
  const safeBasename = basename
    .replace(/[\\/]+/g, "-")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "asset";
  return `${safeBasename}${extension}`;
}

function slugify(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "asset";
}

function slugifyRequired(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function spriteAssetKeyForObjectKey(value) {
  const slug = slugifyRequired(value).replace(/-/g, "_");
  if (!slug) {
    return "";
  }
  return slug.startsWith("sprite_") ? slug : `sprite_${slug}`;
}

function checksumForMetadata({ fileName, mimeType, size, projectId, assetRole }) {
  const text = `${projectId}|${assetRole}|${fileName}|${mimeType}|${size}`;
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = ((hash << 5) - hash + text.charCodeAt(index)) >>> 0;
  }
  return `mock-sha256-${hash.toString(16).padStart(8, "0")}`;
}

function uploadedAssetMetadataFields() {
  return [
    "id",
    "projectId",
    "ownerProjectId",
    "assetRole",
    "originalName",
    "storedPath",
    "mimeType",
    "size",
    "checksum",
    "createdAt",
    "updatedAt"
  ];
}

function storagePathForProjectAsset(projectId, assetRole, usage, fileName) {
  const role = roleDefinitionForId(assetRole);
  const normalizedProjectId = normalizeProjectId(projectId);
  const normalizedUsage = normalizeUsage(usage, assetRole);
  if (!normalizedProjectId || !role || !normalizedUsage || !fileName) {
    return "";
  }
  return `${PROJECT_ASSET_STORAGE_ROOT}/${normalizedProjectId}/${role.storageFolder}/${normalizedUsage}/${sanitizeFileName(fileName)}`;
}

function colorAssetFileName(swatch) {
  if (!swatch) {
    return "";
  }
  return `${slugify(`${swatch.key}-${swatch.name}`)}.color`;
}

function clonePaletteSwatch(swatch) {
  if (!swatch) {
    return null;
  }
  return {
    hex: swatch.hex,
    key: swatch.key,
    name: swatch.name,
    source: swatch.source,
    tags: Array.isArray(swatch.tags) ? [...swatch.tags] : []
  };
}

function projectFolderForProjectId(projectId) {
  const normalizedProjectId = normalizeProjectId(projectId);
  return normalizedProjectId ? `${PROJECT_ASSET_STORAGE_ROOT}/${normalizedProjectId}/` : "";
}

function localFolderCount(storageObjects) {
  const folders = new Set();
  storageObjects.forEach((object) => {
    const parts = normalizeText(object.storedPath).split("/").filter(Boolean);
    for (let index = 3; index < parts.length; index += 1) {
      folders.add(parts.slice(0, index).join("/"));
    }
  });
  return folders.size;
}

function previewKindForRole(role) {
  if (!role) return "Asset metadata preview";
  if (role.id === "image") return "Image preview";
  if (role.id === "audio") return "Audio preview";
  if (role.id === "video") return "Video preview";
  return role.previewBehavior;
}

function timestampForIndex(index) {
  return new Date(Date.now() + (index % 60) * 60_000).toISOString();
}

function auditFields(timestamp, userKey = ASSET_SYSTEM_USER_KEY) {
  return {
    createdAt: timestamp,
    updatedAt: timestamp,
    createdBy: userKey,
    updatedBy: userKey
  };
}

function createReadyGameConfigurationRepository() {
  const repository = createGameConfigurationMockRepository();
  repository.makeValidGameDesign("demo-game");
  repository.updateConfiguration("demo-game", READY_CONFIGURATION_INPUT);
  return repository;
}

function createValidationRows(projectId, findings) {
  const timestamp = new Date().toISOString();
  return findings.map((finding, index) => ({
    action: finding.action,
    field: finding.field,
    id: `${projectId || "asset"}-asset-validation-${index + 1}`,
    label: finding.label,
    projectId,
    status: "Missing",
    ...auditFields(timestamp, ASSET_SYSTEM_USER_KEY)
  }));
}

function tableCounts(tables) {
  return ASSET_TOOL_TABLES.map((table) => ({
    rows: tables[table].length,
    table
  }));
}

function createStorageObject({ assetRole, fileName, mimeType, name, ownerUserKey, project, size, usage }) {
  const role = roleDefinitionForId(assetRole);
  const projectId = project?.id || "";
  const originalName = normalizeText(fileName);
  const storedPath = storagePathForProjectAsset(projectId, assetRole, usage, originalName);
  const checksum = checksumForMetadata({
    assetRole,
    fileName: originalName,
    mimeType,
    projectId,
    size
  });
  const timestamp = new Date().toISOString();

  return {
    assetId: `${projectId}-asset-${assetRole}-${slugify(name || originalName)}`,
    checksum,
    createdAt: timestamp,
    createdBy: ownerUserKey,
    id: `${projectId}-storage-${assetRole}-${slugify(usage)}-${slugify(originalName)}`,
    mimeType,
    originalName,
    ownerProjectId: projectId,
    projectId,
    role: role?.label || assetRole,
    size,
    status: "Stored",
    storedPath,
    updatedAt: timestamp,
    updatedBy: ownerUserKey
  };
}

function createEditableSpriteAssetRecord({ assetKey, ownerUserKey, project }) {
  const assetRole = "image";
  const fileName = `${assetKey}.png`;
  const mimeType = "image/png";
  const projectId = project?.id || "";
  const role = roleDefinitionForId(assetRole);
  const size = 1;
  const storedPath = storagePathForProjectAsset(projectId, assetRole, "sprite", fileName);
  const checksum = checksumForMetadata({
    assetRole,
    fileName,
    mimeType,
    projectId,
    size
  });
  const timestamp = new Date().toISOString();
  const storageObject = {
    assetId: assetKey,
    checksum,
    createdAt: timestamp,
    createdBy: ownerUserKey,
    id: `${projectId}-storage-image-sprite-${assetKey}`,
    mimeType,
    originalName: fileName,
    ownerProjectId: projectId,
    projectId,
    role: role?.label || assetRole,
    size,
    status: "Stored",
    storedPath,
    updatedAt: timestamp,
    updatedBy: ownerUserKey
  };
  const asset = {
    assetRole,
    assetRoleLabel: role.label,
    checksum,
    createdAt: timestamp,
    createdBy: ownerUserKey,
    fileName,
    id: assetKey,
    mimeType,
    name: assetKey,
    originalName: fileName,
    ownerProjectId: projectId,
    ownerUserId: ownerUserKey,
    paletteSwatch: null,
    path: storedPath,
    previewKind: previewKindForRole(role),
    projectId,
    role: role.label,
    size,
    status: "Ready",
    storedPath,
    storageObjectId: storageObject.id,
    type: role.label,
    updatedAt: timestamp,
    updatedBy: ownerUserKey,
    usage: "sprite"
  };

  return { asset, storageObject };
}

export function createAssetToolMockRepository(options = {}) {
  const configurationRepository = options.configurationRepository || createReadyGameConfigurationRepository();
  const paletteRepository = options.paletteRepository || createGameWorkspacePaletteRepository();
  const loadedMockDbTables = loadMockDbTables(ASSET_DB_OWNER, createEmptyTables(), options);
  const databaseCleared = Boolean(loadedMockDbTables.cleared);
  const persistenceEnabled = mockDbPersistenceEnabled(options);
  let hasPersistedTables = Boolean(loadedMockDbTables.persisted);
  let tables = loadedMockDbTables.tables;
  if (!databaseCleared) {
    tables.asset_role_definitions = roleDefinitionRows();
  }
  let selectedAssetId = "";

  function persistTables() {
    saveMockDbTables(ASSET_DB_OWNER, tables, options);
    if (persistenceEnabled || options.memoryDbTables) {
      hasPersistedTables = true;
    }
  }

  function activeUserKey() {
    const sessionUserKey = typeof options.sessionUserKey === "function"
      ? options.sessionUserKey()
      : options.sessionUserKey;
    return normalizeText(sessionUserKey) || DEFAULT_ASSET_USER_KEY;
  }

  function ownedAssetFilter(projectId = "") {
    const ownerUserId = activeUserKey();
    return (asset) => asset.projectId === projectId && asset.ownerUserId === ownerUserId;
  }

  function ownedAssetsForProject(projectId = "") {
    return tables.asset_library_items.filter(ownedAssetFilter(projectId));
  }

  function findOwnedAsset(assetId, projectId = "") {
    return ownedAssetsForProject(projectId).find((asset) => asset.id === assetId) || null;
  }

  function getConfigurationHandoff() {
    const snapshot = configurationRepository.getSnapshot();
    const activeProject = snapshot.handoff.activeProject
      ? {
          ...snapshot.handoff.activeProject,
          id: assetProjectIdForProject(snapshot.handoff.activeProject),
          sourceProjectId: snapshot.handoff.activeProject.id
        }
      : null;
    const ready = Boolean(
      snapshot.handoff.ready
      && snapshot.configuration
      && snapshot.validation.findings.length === 0
      && activeProject?.id
    );

    return {
      activeProject,
      configuration: snapshot.configuration,
      ready,
      validation: snapshot.validation
    };
  }

  function getRoleDiagnostics() {
    return ASSET_ROLE_DEFINITIONS.map((role) => {
      const missing = [];
      if (!role.id) missing.push("id");
      if (!role.label) missing.push("label");
      if (!role.storageFolder) missing.push("storageFolder");
      if (!ASSET_PICKER_MODES.includes(role.inputMode)) missing.push("inputMode");
      if (role.inputMode === "file" && (!Array.isArray(role.extensions) || role.extensions.length === 0)) missing.push("extensions");
      if (role.inputMode === "file" && (!Array.isArray(role.mimeTypes) || role.mimeTypes.length === 0)) missing.push("mimeTypes");
      if (!role.previewBehavior) missing.push("previewBehavior");
      if (!Array.isArray(role.validationNeeds) || role.validationNeeds.length === 0) missing.push("validationNeeds");
      return {
        action: missing.length ? `Add missing role metadata: ${missing.join(", ")}.` : "Role metadata ready.",
        id: `${role.id || "missing"}-role-diagnostic`,
        label: role.label || role.id || "Asset Role",
        status: missing.length ? "Invalid" : "Ready"
      };
    });
  }

  function validateRoleMetadata() {
    const findings = getRoleDiagnostics()
      .filter((diagnostic) => diagnostic.status !== "Ready")
      .map((diagnostic) => ({
        field: "assetRoleMetadata",
        label: diagnostic.label,
        action: diagnostic.action
      }));

    return {
      findings,
      status: findings.length ? "Needs Input" : "Ready"
    };
  }

  function validateAssetInput(input = {}) {
    const handoff = getConfigurationHandoff();
    const activeProject = handoff.activeProject || null;
    const assetRole = normalizeRoleId(input.assetRole || input.type);
    const role = roleDefinitionForId(assetRole);
    const paletteMode = role?.inputMode === "palette";
    const paletteSnapshot = paletteRepository.getSnapshot();
    const selectedPaletteSwatch = paletteMode
      ? paletteRepository.findSwatch(input.paletteColor || input.paletteSwatchKey)
      : null;
    const filePickerMode = role?.inputMode === "file";
    const fileName = filePickerMode
      ? normalizeText(input.fileName || input.originalName)
      : paletteMode
        ? colorAssetFileName(selectedPaletteSwatch)
        : "";
    const mimeType = filePickerMode
      ? normalizeText(input.mimeType).toLowerCase()
      : paletteMode && selectedPaletteSwatch
        ? COLOR_ASSET_MIME_TYPE
        : "";
    const normalized = {
      assetRole,
      fileName,
      mimeType,
      name: normalizeText(input.name),
      paletteColor: normalizeText(input.paletteColor || input.paletteSwatchKey),
      paletteSwatch: clonePaletteSwatch(selectedPaletteSwatch),
      pickerMode: normalizeText(input.pickerMode),
      size: Number(input.size) || 0,
      storedPath: storagePathForProjectAsset(activeProject?.id || "", assetRole, input.usage || input.role, fileName),
      usage: normalizeUsage(input.usage || input.role, assetRole)
    };

    const findings = [...validateRoleMetadata().findings];
    if (!handoff.ready || !activeProject) {
      findings.push({
        field: "activeProject",
        label: "Active Project",
        action: "Open a game and complete a valid Game Configuration before adding user assets."
      });
    }
    if (activeProject && !activeProject.id) {
      findings.push({
        field: "projectId",
        label: "Project ID",
        action: "Open a game with a valid projectId before adding user assets."
      });
    }

    REQUIRED_UPLOAD_FIELDS.forEach((requirement) => {
      if (requirement.field === "fileName" && !filePickerMode) {
        return;
      }
      if (!normalized[requirement.field]) {
        findings.push(requirement);
      }
    });

    if (paletteMode) {
      if (!paletteSnapshot.activeProject) {
        findings.push({
          field: "palette",
          label: "Palette Tool",
          action: "Open Game Workspace before selecting a Palette Tool swatch."
        });
      } else if (paletteSnapshot.swatches.length === 0) {
        findings.push({
          field: "palette",
          label: "Palette Tool",
          action: "Palette Tool required / no swatches available."
        });
      }

      if (!normalized.paletteColor) {
        findings.push({
          field: "paletteColor",
          label: "Palette Color",
          action: "Choose a swatch from the active project palette."
        });
      } else if (!selectedPaletteSwatch) {
        findings.push({
          field: "paletteColor",
          label: "Palette Color",
          action: "Selected palette swatch is not in the active project palette."
        });
      }
    } else if (role && !filePickerMode) {
      findings.push({
        field: "assetRole",
        label: role.label,
        action: pickerDiagnosticForRole(role)
      });
    }

    if (filePickerMode && normalized.fileName && !extensionMatchesRole(role, normalized.fileName)) {
      findings.push({
        field: "fileName",
        label: "File Extension",
        action: `${normalized.fileName} is not an approved ${role.label} file. Expected ${role.extensions.join(", ")}.`
      });
    }

    if (filePickerMode && normalized.mimeType && !mimeMatchesRole(role, normalized.mimeType)) {
      findings.push({
        field: "mimeType",
        label: "MIME Type",
        action: `${normalized.mimeType} is not accepted for ${role.label} assets.`
      });
    }

    if (filePickerMode && normalized.size <= 0) {
      findings.push({
        field: "size",
        label: "File Size",
        action: "Uploaded files must be greater than zero bytes."
      });
    }

    if (filePickerMode && normalized.size > role.maxSizeBytes) {
      findings.push({
        field: "size",
        label: "File Size",
        action: `${role.label} uploads must be ${role.maxSizeBytes} bytes or smaller.`
      });
    }

    if (normalized.storedPath && activeProject?.id) {
      const expectedPrefix = `${PROJECT_ASSET_STORAGE_ROOT}/${activeProject.id}/${role?.storageFolder || ""}/${normalized.usage}/`;
      if (!normalized.storedPath.startsWith(expectedPrefix)) {
        findings.push({
          field: "storedPath",
          label: "Project Storage Path",
          action: `User assets must store under ${expectedPrefix}.`
        });
      }
    }

    return {
      asset: normalized,
      findings,
      status: findings.length === 0 ? "Ready" : "Needs Input"
    };
  }

  function replaceValidationRows(projectId, findings) {
    tables.asset_validation_items = tables.asset_validation_items.filter(
      (row) => row.projectId !== projectId
    );
    tables.asset_validation_items.push(...createValidationRows(projectId, findings));
  }

  function importAsset(input = {}) {
    const handoff = getConfigurationHandoff();
    const project = handoff.activeProject || null;
    const projectId = project?.id || "";
    const validation = validateAssetInput(input);
    replaceValidationRows(projectId, validation.findings);

    if (validation.findings.length > 0 || !projectId) {
      return {
        imported: false,
        message: validation.findings.length === 1
          ? "Asset upload blocked by 1 missing item."
          : `Asset upload blocked by ${validation.findings.length} missing items.`,
        snapshot: getSnapshot()
      };
    }

    const role = roleDefinitionForId(validation.asset.assetRole);
    const ownerUserKey = activeUserKey();
    const storageObject = createStorageObject({
      assetRole: validation.asset.assetRole,
      fileName: validation.asset.fileName,
      mimeType: validation.asset.mimeType,
      name: validation.asset.name,
      ownerUserKey,
      project,
      size: validation.asset.size,
      usage: validation.asset.usage
    });
    const timestamp = storageObject.createdAt;
    const asset = {
      assetRole: validation.asset.assetRole,
      assetRoleLabel: role.label,
      checksum: storageObject.checksum,
      createdAt: timestamp,
      createdBy: ownerUserKey,
      fileName: validation.asset.fileName,
      id: storageObject.assetId,
      mimeType: validation.asset.mimeType,
      name: validation.asset.name,
      originalName: storageObject.originalName,
      ownerProjectId: projectId,
      ownerUserId: ownerUserKey,
      paletteSwatch: clonePaletteSwatch(validation.asset.paletteSwatch),
      path: storageObject.storedPath,
      previewKind: previewKindForRole(role),
      projectId,
      role: role.label,
      size: validation.asset.size,
      status: "Ready",
      storedPath: storageObject.storedPath,
      storageObjectId: storageObject.id,
      type: role.label,
      updatedAt: timestamp,
      updatedBy: ownerUserKey,
      usage: validation.asset.usage
    };

    tables.asset_library_items = tables.asset_library_items.filter((row) => row.id !== asset.id);
    tables.asset_storage_objects = tables.asset_storage_objects.filter((row) => row.id !== storageObject.id);
    tables.asset_library_items.push(asset);
    tables.asset_storage_objects.push(storageObject);
    tables.asset_import_events.push({
      assetId: asset.id,
      createdAt: timestamp,
      createdBy: ownerUserKey,
      fileName: asset.fileName,
      id: `${asset.id}-import-${tables.asset_import_events.length + 1}`,
      mimeType: asset.mimeType,
      projectId,
      status: "Uploaded",
      storedPath: asset.storedPath,
      type: asset.type,
      updatedAt: timestamp,
      updatedBy: ownerUserKey
    });
    if (role.inputMode === "palette" && asset.paletteSwatch) {
      paletteRepository.recordSwatchUsage({
        assetId: asset.id,
        key: asset.paletteSwatch.key,
        toolId: "assets"
      });
    }
    selectedAssetId = asset.id;
    replaceValidationRows(projectId, []);
    persistTables();

    return {
      asset,
      imported: true,
      message: `Added ${asset.name} to your asset library.`,
      snapshot: getSnapshot()
    };
  }

  function ensureSpriteAssetForObject(input = {}) {
    const objectKey = normalizeText(input.objectKey || input.objectName || input.name);
    const objectName = normalizeText(input.objectName || input.name || objectKey);
    const spriteAssetKey = spriteAssetKeyForObjectKey(objectKey);
    const handoff = getConfigurationHandoff();
    const project = handoff.activeProject || null;
    const projectId = project?.id || "";
    const ownerUserKey = activeUserKey();
    const diagnostics = [];
    const findings = [];

    if (!spriteAssetKey) {
      findings.push({
        action: "Name the object before selecting Sprite render type.",
        field: "objectKey",
        label: "Object Key"
      });
    }
    if (!projectId) {
      findings.push({
        action: "Open an active game so sprite assets can be created in your asset library.",
        field: "activeProject",
        label: "Active Project"
      });
    }
    if (projectId && !handoff.ready) {
      diagnostics.push({
        action: "Game Configuration is not ready; created a minimal editable default sprite asset for Sprite Editor ownership only.",
        label: "Game Configuration",
        status: "WARN"
      });
    }

    if (findings.length > 0) {
      replaceValidationRows(projectId, findings);
      return {
        asset: null,
        created: false,
        diagnostics,
        linked: false,
        message: findings.length === 1
          ? "Sprite asset handoff blocked by 1 missing item."
          : `Sprite asset handoff blocked by ${findings.length} missing items.`,
        snapshot: getSnapshot(),
        spriteAssetKey
      };
    }

    const existingAsset = tables.asset_library_items.find(
      (asset) => asset.projectId === projectId && asset.ownerUserId === ownerUserKey && asset.id === spriteAssetKey
    );
    if (existingAsset) {
      selectedAssetId = existingAsset.id;
      replaceValidationRows(projectId, []);
      persistTables();
      return {
        asset: existingAsset,
        created: false,
        diagnostics,
        linked: true,
        message: `Resolved existing sprite asset ${spriteAssetKey} for ${objectName}.`,
        snapshot: getSnapshot(),
        spriteAssetKey
      };
    }

    const record = createEditableSpriteAssetRecord({ assetKey: spriteAssetKey, ownerUserKey, project });
    tables.asset_library_items = tables.asset_library_items.filter((asset) => asset.id !== record.asset.id);
    tables.asset_storage_objects = tables.asset_storage_objects.filter((storageObject) => storageObject.id !== record.storageObject.id);
    tables.asset_library_items.push(record.asset);
    tables.asset_storage_objects.push(record.storageObject);
    tables.asset_import_events.push({
      assetId: record.asset.id,
      createdAt: record.asset.createdAt,
      createdBy: ownerUserKey,
      fileName: record.asset.fileName,
      id: `${record.asset.id}-import-${tables.asset_import_events.length + 1}`,
      mimeType: record.asset.mimeType,
      projectId,
      status: "Created",
      storedPath: record.asset.storedPath,
      type: record.asset.type,
      updatedAt: record.asset.updatedAt,
      updatedBy: ownerUserKey
    });
    selectedAssetId = record.asset.id;
    replaceValidationRows(projectId, []);
    persistTables();

    return {
      asset: record.asset,
      created: true,
      diagnostics,
      linked: true,
      message: `Created editable default sprite asset ${spriteAssetKey} for ${objectName}.`,
      snapshot: getSnapshot(),
      spriteAssetKey
    };
  }

  function listAssets(projectId = "") {
    const handoff = getConfigurationHandoff();
    const targetProjectId = projectId || handoff.activeProject?.id || "";
    return ownedAssetsForProject(targetProjectId)
      .sort((left, right) => left.name.localeCompare(right.name));
  }

  function listTags() {
    return typeof options.tagsRepository?.listTags === "function"
      ? options.tagsRepository.listTags()
      : [];
  }

  function assetTypeForRecord(asset) {
    if (normalizeText(asset.usage).toLowerCase() === "sprite") {
      return "Sprites";
    }
    return normalizeCatalogAssetType(asset.assetType || asset.type || asset.assetRoleLabel) || "Images";
  }

  function listAssetsByType(assetType) {
    const normalizedType = normalizeCatalogAssetType(assetType);
    return listAssets().filter((asset) => assetTypeForRecord(asset) === normalizedType);
  }

  function validateCatalogAssetInput(input = {}, existingAsset = null) {
    const assetType = normalizeCatalogAssetType(input.assetType || input.type);
    const name = normalizeText(input.name);
    const usage = normalizeCatalogUsage(input.usage);
    const description = normalizeText(input.description);
    const tags = listTags();
    const tagKeys = normalizeAssetTagKeys(input.tagKeys, tags);
    const requestedTagKeys = Array.isArray(input.tagKeys) ? input.tagKeys.map(normalizeText).filter(Boolean) : [];
    const invalidTagKeys = requestedTagKeys.filter((tagKey) => !tagKeys.includes(tagKey));
    const findings = [];

    if (!assetType) {
      findings.push({
        action: `Choose an asset type: ${ASSET_CATALOG_TYPES.join(", ")}.`,
        field: "assetType",
        label: "Asset Type"
      });
    }
    if (!name) {
      findings.push({
        action: "Name the asset before saving.",
        field: "name",
        label: "Asset Name"
      });
    }
    if (!usage) {
      findings.push({
        action: `Choose a usage: ${ASSET_USAGE_OPTIONS.join(", ")}.`,
        field: "usage",
        label: "Usage"
      });
    }
    if (invalidTagKeys.length) {
      findings.push({
        action: "Choose tags from the shared Tags tool list.",
        field: "tagKeys",
        label: "Asset Tags"
      });
    }

    return {
      asset: {
        assetType: assetType || existingAsset?.assetType || "",
        description,
        name: name || existingAsset?.name || "",
        tagKeys,
        usage: usage || existingAsset?.usage || ""
      },
      findings,
      status: findings.length === 0 ? "Ready" : "Needs Input"
    };
  }

  function createCatalogAssetRecord(input = {}) {
    const handoff = getConfigurationHandoff();
    const project = handoff.activeProject || null;
    const projectId = project?.id || "";
    const ownerUserKey = activeUserKey();
    const assetType = input.assetType;
    const assetRole = catalogAssetRoleForType(assetType);
    const role = roleDefinitionForId(assetRole) || roleDefinitionForId("image");
    const fileName = catalogFileNameForName(input.name, assetType);
    const storedPath = storagePathForProjectAsset(
      projectId,
      assetRole,
      normalizeUsage(input.usage.toLowerCase().replaceAll(" ", "-"), assetRole) || "sprite",
      fileName
    ) || `${PROJECT_ASSET_STORAGE_ROOT}/${projectId}/${slugify(assetType)}/${slugify(input.usage)}/${fileName}`;
    const checksum = checksumForMetadata({
      assetRole,
      fileName,
      mimeType: "",
      projectId,
      size: 0
    });
    const now = new Date().toISOString();
    const id = `${projectId}-asset-${slugify(assetType)}-${slugify(input.name)}-${tables.asset_library_items.length + 1}`;

    return {
      assetRole,
      assetRoleLabel: role?.label || assetType,
      assetType,
      checksum,
      createdAt: now,
      createdBy: ownerUserKey,
      description: input.description,
      fileName,
      id,
      mimeType: "",
      name: input.name,
      originalName: fileName,
      ownerProjectId: projectId,
      ownerUserId: ownerUserKey,
      paletteSwatch: null,
      path: storedPath,
      previewKind: `${assetType} catalog record`,
      projectId,
      role: assetType,
      size: 0,
      status: "Ready",
      storedPath,
      storageObjectId: `${id}-storage`,
      tagKeys: input.tagKeys,
      type: assetType,
      updatedAt: now,
      updatedBy: ownerUserKey,
      usage: input.usage
    };
  }

  function addAssetRecord(input = {}) {
    const handoff = getConfigurationHandoff();
    const projectId = handoff.activeProject?.id || "";
    const validation = validateCatalogAssetInput(input);
    replaceValidationRows(projectId, validation.findings);
    if (validation.findings.length || !projectId) {
      return {
        added: false,
        message: validation.findings[0]?.action || "Asset add blocked: open an active game first.",
        snapshot: getSnapshot(),
        validation
      };
    }

    const asset = createCatalogAssetRecord(validation.asset);
    tables.asset_library_items.push(asset);
    tables.asset_storage_objects.push({
      assetId: asset.id,
      checksum: asset.checksum,
      createdAt: asset.createdAt,
      createdBy: asset.createdBy,
      id: asset.storageObjectId,
      mimeType: asset.mimeType,
      originalName: asset.originalName,
      ownerProjectId: projectId,
      projectId,
      role: asset.type,
      size: asset.size,
      status: "Cataloged",
      storedPath: asset.storedPath,
      updatedAt: asset.updatedAt,
      updatedBy: asset.updatedBy
    });
    tables.asset_import_events.push({
      assetId: asset.id,
      createdAt: asset.createdAt,
      createdBy: asset.createdBy,
      fileName: asset.fileName,
      id: `${asset.id}-catalog-${tables.asset_import_events.length + 1}`,
      mimeType: asset.mimeType,
      projectId,
      status: "Cataloged",
      storedPath: asset.storedPath,
      type: asset.type,
      updatedAt: asset.updatedAt,
      updatedBy: asset.updatedBy
    });
    selectedAssetId = asset.id;
    replaceValidationRows(projectId, []);
    persistTables();

    return {
      added: true,
      asset,
      message: `Added ${asset.name} to ${asset.assetType}.`,
      snapshot: getSnapshot(),
      validation
    };
  }

  function updateAssetRecord(assetId, input = {}) {
    const handoff = getConfigurationHandoff();
    const projectId = handoff.activeProject?.id || "";
    const asset = findOwnedAsset(assetId, projectId);
    if (!asset) {
      return {
        asset: null,
        message: blockedOwnerMessage("update"),
        snapshot: getSnapshot(),
        updated: false
      };
    }

    const validation = validateCatalogAssetInput(input, asset);
    replaceValidationRows(projectId, validation.findings);
    if (validation.findings.length) {
      return {
        asset,
        message: validation.findings[0].action,
        snapshot: getSnapshot(),
        updated: false,
        validation
      };
    }

    const now = new Date().toISOString();
    asset.assetType = validation.asset.assetType;
    asset.type = validation.asset.assetType;
    asset.role = validation.asset.assetType;
    asset.name = validation.asset.name;
    asset.description = validation.asset.description;
    asset.usage = validation.asset.usage;
    asset.tagKeys = validation.asset.tagKeys;
    asset.updatedAt = now;
    asset.updatedBy = activeUserKey();
    selectedAssetId = asset.id;
    replaceValidationRows(projectId, []);
    persistTables();

    return {
      asset,
      message: `Updated ${asset.name}.`,
      snapshot: getSnapshot(),
      updated: true,
      validation
    };
  }

  function deleteAssetRecord(assetId) {
    return deleteAsset(assetId);
  }

  function assetsByType() {
    return Object.fromEntries(
      ASSET_CATALOG_TYPES.map((assetType) => [assetType, listAssetsByType(assetType)])
    );
  }

  function getSelectedAsset() {
    const handoff = getConfigurationHandoff();
    return findOwnedAsset(selectedAssetId, handoff.activeProject?.id || "");
  }

  function selectAsset(assetId) {
    const handoff = getConfigurationHandoff();
    if (findOwnedAsset(assetId, handoff.activeProject?.id || "")) {
      selectedAssetId = assetId;
    }
    return getSnapshot();
  }

  function blockedOwnerMessage(action) {
    return `Asset ${action} blocked: choose an asset owned by the current user.`;
  }

  function updateAsset(assetId, input = {}) {
    const handoff = getConfigurationHandoff();
    const projectId = handoff.activeProject?.id || "";
    const asset = findOwnedAsset(assetId, projectId);
    if (!asset) {
      return {
        asset: null,
        message: blockedOwnerMessage("update"),
        snapshot: getSnapshot(),
        updated: false
      };
    }

    const role = roleDefinitionForId(asset.assetRole);
    const nextName = normalizeText(input.name) || asset.name;
    const nextUsage = role ? normalizeUsage(input.usage || input.role || asset.usage, asset.assetRole) : "";
    const findings = [];
    if (!role) {
      findings.push({
        action: "Choose an approved asset role before saving changes.",
        field: "assetRole",
        label: "Asset Role"
      });
    }
    if (!nextName) {
      findings.push({
        action: "Name the asset before saving changes.",
        field: "name",
        label: "Asset Name"
      });
    }
    if (!nextUsage) {
      findings.push({
        action: role ? `Choose one of these usages: ${role.usageRoles.join(", ")}.` : "Choose an approved usage for this asset role.",
        field: "usage",
        label: "Usage"
      });
    }

    replaceValidationRows(projectId, findings);
    if (findings.length) {
      return {
        asset,
        message: findings.length === 1
          ? "Asset update blocked by 1 missing item."
          : `Asset update blocked by ${findings.length} missing items.`,
        snapshot: getSnapshot(),
        updated: false
      };
    }

    const timestamp = new Date().toISOString();
    const fileName = role.inputMode === "palette"
      ? colorAssetFileName(asset.paletteSwatch)
      : asset.originalName || asset.fileName;
    const storedPath = storagePathForProjectAsset(projectId, asset.assetRole, nextUsage, fileName);
    asset.name = nextName;
    asset.usage = nextUsage;
    asset.storedPath = storedPath || asset.storedPath;
    asset.path = asset.storedPath;
    asset.updatedAt = timestamp;
    asset.updatedBy = activeUserKey();

    const storageObject = tables.asset_storage_objects.find((row) => row.id === asset.storageObjectId);
    if (storageObject) {
      storageObject.storedPath = asset.storedPath;
      storageObject.updatedAt = timestamp;
      storageObject.updatedBy = asset.updatedBy;
    }

    selectedAssetId = asset.id;
    replaceValidationRows(projectId, []);
    persistTables();
    return {
      asset,
      message: `Updated ${asset.name} in your asset library.`,
      snapshot: getSnapshot(),
      updated: true
    };
  }

  function deleteAsset(assetId) {
    const handoff = getConfigurationHandoff();
    const projectId = handoff.activeProject?.id || "";
    const asset = findOwnedAsset(assetId, projectId);
    if (!asset) {
      return {
        deleted: false,
        message: blockedOwnerMessage("delete"),
        snapshot: getSnapshot()
      };
    }

    tables.asset_library_items = tables.asset_library_items.filter((row) => row.id !== asset.id);
    tables.asset_storage_objects = tables.asset_storage_objects.filter((row) => row.id !== asset.storageObjectId && row.assetId !== asset.id);
    tables.asset_import_events = tables.asset_import_events.filter((row) => row.assetId !== asset.id);
    tables.asset_validation_items = tables.asset_validation_items.filter((row) => row.projectId !== projectId);
    if (selectedAssetId === asset.id) {
      selectedAssetId = ownedAssetsForProject(projectId)[0]?.id || "";
    }
    persistTables();
    return {
      assetId: asset.id,
      deleted: true,
      message: `Deleted ${asset.name} from your asset library.`,
      snapshot: getSnapshot()
    };
  }

  function seedDemoAssets() {
    importAsset({
      assetRole: "image",
      fileName: "player.png",
      mimeType: "image/png",
      name: "Demo Player Sprite",
      size: 2048,
      usage: "sprite"
    });
    return getSnapshot();
  }

  function resetAssetLibrary() {
    const handoff = getConfigurationHandoff();
    const projectId = handoff.activeProject?.id || "";
    if (!projectId) {
      replaceValidationRows("", [
        {
          action: "Open a game with a valid projectId before resetting your asset library.",
          field: "activeProject",
          label: "Active Project"
        }
      ]);
      return {
        deletedFiles: 0,
        deletedFolders: 0,
        message: "Reset Asset Library blocked: no active projectId.",
        projectId: "",
        reset: false,
        snapshot: getSnapshot()
      };
    }

    const projectFolder = projectFolderForProjectId(projectId);
    const ownedAssets = ownedAssetsForProject(projectId);
    const ownedAssetIds = new Set(ownedAssets.map((asset) => asset.id));
    const ownedStorageObjectIds = new Set(ownedAssets.map((asset) => asset.storageObjectId));
    const storageObjects = tables.asset_storage_objects.filter(
      (row) => ownedStorageObjectIds.has(row.id) && row.projectId === projectId && row.storedPath.startsWith(projectFolder)
    );
    const deletedFiles = storageObjects.length;
    const deletedFolders = localFolderCount(storageObjects);

    tables.asset_library_items = tables.asset_library_items.filter((row) => !ownedAssetIds.has(row.id));
    tables.asset_storage_objects = tables.asset_storage_objects.filter((row) => !ownedStorageObjectIds.has(row.id));
    tables.asset_import_events = tables.asset_import_events.filter((row) => !ownedAssetIds.has(row.assetId));
    tables.asset_validation_items = tables.asset_validation_items.filter((row) => row.projectId !== projectId);
    selectedAssetId = "";
    persistTables();
    return {
      deletedFiles,
      deletedFolders,
      message: `Reset Asset Library deleted ${deletedFiles} file${deletedFiles === 1 ? "" : "s"} and ${deletedFolders} folder${deletedFolders === 1 ? "" : "s"} under ${projectFolder}.`,
      projectId,
      reset: true,
      snapshot: getSnapshot()
    };
  }

  function clearAssetLibrary() {
    tables = createEmptyTables();
    selectedAssetId = "";
    persistTables();
    return getSnapshot();
  }

  function makeMissingGameConfiguration() {
    configurationRepository.makeMissingGameDesign();
    return clearAssetLibrary();
  }

  function makeInvalidGameConfiguration() {
    configurationRepository.makeValidGameDesign("demo-game");
    configurationRepository.updateConfiguration("demo-game", {
      gameBasics: "Only basics are present."
    });
    return clearAssetLibrary();
  }

  function makeReadyGameConfiguration() {
    configurationRepository.makeValidGameDesign("demo-game");
    configurationRepository.updateConfiguration("demo-game", READY_CONFIGURATION_INPUT);
    if (hasPersistedTables) {
      const projectId = getConfigurationHandoff().activeProject?.id || "";
      selectedAssetId = ownedAssetsForProject(projectId)[0]?.id || "";
      return getSnapshot();
    }
    clearAssetLibrary();
    seedDemoAssets();
    return getSnapshot();
  }

  function getTables() {
    return normalizeMockDbTables(ASSET_DB_OWNER, cloneTables(tables), options);
  }

  function previewStoragePath(input = {}) {
    const handoff = getConfigurationHandoff();
    const projectId = handoff.activeProject?.id || "";
    const assetRole = normalizeRoleId(input.assetRole || input.type);
    const role = roleDefinitionForId(assetRole);
    const swatch = role?.inputMode === "palette"
      ? paletteRepository.findSwatch(input.paletteColor || input.paletteSwatchKey)
      : null;
    const fileName = role?.inputMode === "palette"
      ? colorAssetFileName(swatch)
      : input.fileName || input.originalName;
    return storagePathForProjectAsset(projectId, assetRole, input.usage || input.role, fileName);
  }

  function getPaletteSnapshot() {
    return paletteRepository.getSnapshot();
  }

  function listPaletteSwatches() {
    return paletteRepository.listSwatches();
  }

  function seedActiveProjectPalette() {
    return paletteRepository.seedActiveProjectPalette();
  }

  function getProgressHandoff() {
    const handoff = getConfigurationHandoff();
    const assets = listAssets();

    if (!handoff.ready) {
      return {
        currentFocus: "Complete Game Configuration",
        libraryStatus: "Blocked",
        nextStep: "Game Configuration",
        projectProgress: "Assets blocked until Game Configuration is ready",
        publishingProgress: "Build Game blocked by missing asset handoff"
      };
    }

    if (assets.length === 0) {
      return {
        currentFocus: "Add User Assets",
        libraryStatus: "Needs Input",
        nextStep: "Assets",
        projectProgress: `${handoff.activeProject.name} needs user asset records`,
        publishingProgress: "Build Game blocked until required assets are ready"
      };
    }

    return {
      currentFocus: "Review Build Game",
      libraryStatus: "Ready",
      nextStep: "Build Game",
      projectProgress: `${handoff.activeProject.name} asset library ready`,
      publishingProgress: "Build Game remains blocked until packaging and testing are complete"
    };
  }

  function getSnapshot() {
    const handoff = getConfigurationHandoff();
    const assets = listAssets();
    const selectedAsset = getSelectedAsset() || assets[0] || null;
    const projectId = handoff.activeProject?.id || "";
    const findings = tables.asset_validation_items.filter((row) => row.projectId === projectId);

    return {
      assets,
      assetsByType: assetsByType(),
      assetTypes: [...ASSET_CATALOG_TYPES],
      handoff,
      metadataFields: uploadedAssetMetadataFields(),
      palette: getPaletteSnapshot(),
      progressHandoff: getProgressHandoff(),
      roleDefinitions: ASSET_ROLE_DEFINITIONS.map((role) => ({ ...role })),
      roleDiagnostics: getRoleDiagnostics(),
      selectedAsset,
      tags: listTags(),
      tableCounts: tableCounts(tables),
      tables: getTables(),
      usageOptions: [...ASSET_USAGE_OPTIONS],
      validation: {
        findings,
        status: findings.length > 0 ? "Needs Input" : assets.length > 0 && handoff.ready ? "Ready" : validateRoleMetadata().status
      }
    };
  }

  if (databaseCleared) {
    selectedAssetId = "";
  } else if (hasPersistedTables) {
    selectedAssetId = tables.asset_library_items[0]?.id || "";
    persistTables();
  } else {
    clearAssetLibrary();
    seedDemoAssets();
  }

  return {
    ASSET_CATALOG_TYPES,
    ASSET_ROLE_DEFINITIONS,
    ASSET_ROLE_LABELS,
    ASSET_TOOL_TABLES,
    ASSET_TYPES,
    ASSET_USAGE_OPTIONS,
    ASSET_USAGE_BY_ROLE,
    addAssetRecord,
    assetsByType,
    clearAssetLibrary,
    deleteAsset,
    deleteAssetRecord,
    ensureSpriteAssetForObject,
    getConfigurationHandoff,
    getPaletteSnapshot,
    getProgressHandoff,
    getRoleDiagnostics,
    getSnapshot,
    getTables,
    importAsset,
    listAssets,
    listAssetsByType,
    listPaletteSwatches,
    listTags,
    makeInvalidGameConfiguration,
    makeMissingGameConfiguration,
    makeReadyGameConfiguration,
    previewStoragePath,
    resetAssetLibrary,
    seedDemoAssets,
    seedActiveProjectPalette,
    selectAsset,
    updateAsset,
    updateAssetRecord,
    validateCatalogAssetInput,
    validateAssetInput
  };
}
