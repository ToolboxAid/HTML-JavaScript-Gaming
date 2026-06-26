import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
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
const WORKSPACE_GAME_STORAGE_IDS = new Map();

export const ASSET_PICKER_MODES = Object.freeze([
  "file",
  "managed-tool"
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
    validationNeeds: ["MIME must be audio/* or approved audio MIME", "File size must be greater than zero", "Project storage path must be generated under projects/<projectId>/audio/"]
  },
  {
    id: "data",
    label: "Data",
    storageFolder: "data",
    extensions: [".json", ".csv", ".txt"],
    mimeTypes: ["application/json", "text/csv", "text/plain"],
    previewBehavior: "Data/Table Tool managed preview",
    uploadEnabled: true,
    inputMode: "file",
    maxSizeBytes: 5242880,
    usageRoles: ["config", "table"],
    validationNeeds: ["Data files must use .json, .csv, or .txt", "Project storage path must be generated under projects/<projectId>/data/"]
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
    validationNeeds: ["Font files must use approved font formats", "Project storage path must be generated under projects/<projectId>/font/"]
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
    validationNeeds: ["MIME must be image/* or approved image MIME", "File size must be greater than zero", "Project storage path must be generated under projects/<projectId>/image/"]
  },
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

const UPLOAD_SOURCE_MODE = "Upload";
const REFERENCE_SOURCE_MODE = "Reference";
const ASSET_SOURCE_MODES = Object.freeze([UPLOAD_SOURCE_MODE, REFERENCE_SOURCE_MODE]);
const PROJECT_ASSET_STORAGE_ROOT = "projects";
const ULID_PATTERN = /^[0-9A-HJKMNP-TV-Z]{26}$/;
const ULID_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

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
    key: role.id,
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

function isReferenceCatalogType(assetType) {
  return assetType === "Sprites" || assetType === "Vectors" || assetType === "Palette References";
}

function normalizeCatalogSourceMode(value) {
  const normalized = normalizeText(value);
  return ASSET_SOURCE_MODES.find((mode) => mode.toLowerCase() === normalized.toLowerCase()) || "";
}

function catalogAssetRoleForType(assetType) {
  if (assetType === "Audio") return "audio";
  if (assetType === "Fonts") return "font";
  if (assetType === "Data") return "data";
  return "image";
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

function projectStorageIdForGameId(value) {
  const rawValue = normalizeText(value);
  const normalizedProjectId = normalizeProjectId(rawValue);
  if (normalizedProjectId || !rawValue) {
    return normalizedProjectId;
  }
  if (!WORKSPACE_GAME_STORAGE_IDS.has(rawValue)) {
    WORKSPACE_GAME_STORAGE_IDS.set(rawValue, createProjectStorageId());
  }
  return WORKSPACE_GAME_STORAGE_IDS.get(rawValue);
}

function encodeUlidValue(value, length) {
  let remaining = BigInt(value);
  let encoded = "";
  for (let index = 0; index < length; index += 1) {
    encoded = ULID_ALPHABET[Number(remaining % 32n)] + encoded;
    remaining /= 32n;
  }
  return encoded;
}

function createProjectStorageId() {
  const timePart = encodeUlidValue(Date.now(), 10);
  const randomPart = Array.from(randomBytes(16))
    .map((byte) => ULID_ALPHABET[byte % 32])
    .join("")
    .slice(0, 16);
  return `${timePart}${randomPart}`;
}

function roleDefinitionForId(roleId) {
  return ASSET_ROLE_DEFINITIONS.find((role) => role.id === roleId) || null;
}

export function pickerDiagnosticForRole(role, paletteSnapshot = null) {
  if (!role) {
    return "Choose an approved asset role.";
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

function catalogUploadStoredPath(projectId, assetRole, fileName) {
  const role = roleDefinitionForId(assetRole);
  const normalizedProjectId = normalizeProjectId(projectId);
  if (!normalizedProjectId || !role || !fileName) {
    return "";
  }
  return `${PROJECT_ASSET_STORAGE_ROOT}/${normalizedProjectId}/${role.storageFolder}/${sanitizeFileName(fileName)}`;
}

function catalogStoredPath({ assetRole, assetType, fileName, projectId, reference, source, usage }) {
  if (source === REFERENCE_SOURCE_MODE) {
    return `${PROJECT_ASSET_STORAGE_ROOT}/${projectId}/${slugify(assetType)}/${slugify(usage)}/reference/${slugify(reference)}`;
  }
  return catalogUploadStoredPath(projectId, assetRole, fileName);
}

function normalizeProjectRelativePath(value) {
  return normalizeText(value).replace(/\\/g, "/").replace(/^\/+/, "");
}

function normalizeStorageObjectKey(value) {
  const normalized = normalizeText(value).replace(/\\/g, "/");
  if (!normalized) {
    return "";
  }
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
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
  let mode = "ready";
  let configuration = { ...READY_CONFIGURATION_INPUT, playerMode: "1 Player", status: "Ready" };
  const activeProject = {
    id: "demo-game",
    name: "Demo Game",
    purpose: "Game",
  };
  const activeDesign = {
    gameType: "Puzzle",
    genre: "Adventure",
    playerMode: "1 Player",
    playStyle: "Single Player",
  };

  function snapshot() {
    const ready = mode !== "missing";
    return {
      configuration: ready ? configuration : null,
      handoff: {
        activeDesign: ready ? activeDesign : null,
        activeGame: ready ? activeProject : null,
        activeProject: ready ? activeProject : null,
        ready,
        validation: {
          findings: ready ? [] : [
            {
              action: "Complete a valid Game Design before editing Game Configuration.",
              label: "Game Design",
              status: "Missing",
            },
          ],
          status: ready ? "Ready" : "Blocked",
        },
      },
      progressHandoff: {
        currentFocus: ready ? "Prepare Assets" : "Complete Game Design",
        gameProgress: ready ? "Demo Game Game Configuration ready" : "Game Configuration blocked until Game Design is ready",
        publishingProgress: ready ? "Build Game remains blocked until required assets are ready" : "Build Game blocked by missing Game Design handoff",
        readinessStatus: ready ? configuration.status : "Blocked",
        recommendedNextTool: ready ? "Assets" : "Game Design",
      },
      validation: {
        findings: [],
        status: ready ? configuration.status : "Blocked",
      },
    };
  }

  return {
    getSnapshot: snapshot,
    makeMissingGameDesign() {
      mode = "missing";
      return snapshot();
    },
    makeValidGameDesign() {
      mode = "ready";
      return snapshot();
    },
    updateConfiguration(projectId, input = {}) {
      mode = "ready";
      configuration = {
        ...configuration,
        ...input,
        playerMode: "1 Player",
        status: Object.values(input).every((value) => normalizeText(value)) ? "Ready" : "Under Construction",
      };
      return configuration;
    },
  };
}

function createValidationRows(projectId, findings) {
  const timestamp = new Date().toISOString();
  return findings.map((finding, index) => ({
    action: finding.action,
    field: finding.field,
    id: `${projectId || "asset"}-asset-validation-${index + 1}`,
    key: `${projectId || "asset"}-asset-validation-${index + 1}`,
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
  const assetId = `${projectId}-asset-${assetRole}-${slugify(name || originalName)}`;
  const storageId = `${projectId}-storage-${assetRole}-${slugify(usage)}-${slugify(originalName)}`;

  return {
    assetId,
    checksum,
    createdAt: timestamp,
    createdBy: ownerUserKey,
    id: storageId,
    key: storageId,
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
  const storageId = `${projectId}-storage-image-sprite-${assetKey}`;
  const storageObject = {
    assetId: assetKey,
    checksum,
    createdAt: timestamp,
    createdBy: ownerUserKey,
    id: storageId,
    key: storageId,
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
    key: assetKey,
    mimeType,
    name: assetKey,
    originalName: fileName,
    ownerProjectId: projectId,
    ownerUserId: ownerUserKey,
    paletteSwatch: null,
    path: storedPath,
    previewKind: previewKindForRole(role),
    projectId,
    reference: "",
    role: role.label,
    size,
    source: UPLOAD_SOURCE_MODE,
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
  let uploadProjectId = "";
  let uploadFileWritesEnabled = options.uploadFileWritesEnabled !== false;
  const projectAssetStorage = options.projectAssetStorage || null;
  let unsafeDeletePathForTest = false;
  let unsafeUploadPathForTest = false;

  function persistTables() {
    saveMockDbTables(ASSET_DB_OWNER, tables, options);
    if (persistenceEnabled || options.memoryDbTables) {
      hasPersistedTables = true;
    }
  }

  function sessionUserKey() {
    const sessionUserKey = typeof options.sessionUserKey === "function"
      ? options.sessionUserKey()
      : options.sessionUserKey;
    return normalizeText(sessionUserKey);
  }

  function hasExplicitGuestSession() {
    return Object.prototype.hasOwnProperty.call(options, "sessionUserKey") && !sessionUserKey();
  }

  function activeUserKey() {
    const userKey = sessionUserKey();
    return userKey || DEFAULT_ASSET_USER_KEY;
  }

  function configuredProjectId(snapshot = configurationRepository.getSnapshot()) {
    return normalizeProjectId(snapshot.handoff?.activeProject?.id || "");
  }

  function existingOwnedProjectId() {
    const ownerUserId = activeUserKey();
    const asset = tables.asset_library_items.find(
      (record) => record.ownerUserId === ownerUserId && normalizeProjectId(record.projectId)
    );
    return normalizeProjectId(uploadProjectId) || normalizeProjectId(asset?.projectId);
  }

  function currentProjectId(snapshot = configurationRepository.getSnapshot()) {
    return configuredProjectId(snapshot) || existingOwnedProjectId();
  }

  function ensureUploadProject() {
    if (hasExplicitGuestSession()) {
      return {
        created: false,
        message: "Uploads require a Game Foundry account.",
        projectId: "",
        snapshot: getSnapshot()
      };
    }

    const existingProjectId = currentProjectId();
    if (existingProjectId) {
      uploadProjectId = existingProjectId;
      return {
        created: false,
        message: `Using existing project path projects/${existingProjectId}/.`,
        projectId: existingProjectId,
        snapshot: getSnapshot()
      };
    }

    uploadProjectId = createProjectStorageId();
    persistTables();
    return {
      created: true,
      message: `Created project path projects/${uploadProjectId}/.`,
      projectId: uploadProjectId,
      snapshot: getSnapshot()
    };
  }

  function repositoryRoot() {
    return path.resolve(options.repoRoot || process.cwd());
  }

  function resolveProjectRelativeFile(relativePath, projectId = "") {
    const normalizedPath = normalizeProjectRelativePath(relativePath);
    const normalizedProjectId = normalizeProjectId(projectId);
    const projectsRoot = path.resolve(repositoryRoot(), PROJECT_ASSET_STORAGE_ROOT);
    const absolutePath = path.resolve(repositoryRoot(), normalizedPath);
    const relativeToProjects = path.relative(projectsRoot, absolutePath);
    const relativeToProject = normalizedProjectId
      ? path.relative(path.resolve(projectsRoot, normalizedProjectId), absolutePath)
      : "";
    const projectPrefix = normalizedProjectId
      ? `${PROJECT_ASSET_STORAGE_ROOT}/${normalizedProjectId}/`
      : `${PROJECT_ASSET_STORAGE_ROOT}/`;
    if (
      !normalizedPath.startsWith(projectPrefix)
      || normalizedPath.split("/").includes("..")
      || relativeToProjects === ""
      || relativeToProjects.startsWith("..")
      || path.isAbsolute(relativeToProjects)
      || (normalizedProjectId && (
        relativeToProject === ""
        || relativeToProject.startsWith("..")
        || path.isAbsolute(relativeToProject)
      ))
    ) {
      return {
        absolutePath: "",
        error: "Upload file write failed: target path must stay under /projects/<projectId>/.",
        relativePath: normalizedPath
      };
    }
    return {
      absolutePath,
      error: "",
      relativePath: normalizedPath
    };
  }

  function createWriteDiagnostics({
    bytesWritten = 0,
    directoryStatus = "",
    message = "",
    ok = false,
    projectId = "",
    targetDirectory = "",
    targetDirectoryResult = "",
    targetFilePath = "",
    storageObjectKey = "",
    viewPath = "",
    writeResult = ""
  } = {}) {
    const normalizedFilePath = normalizeProjectRelativePath(targetFilePath);
    const normalizedStorageObjectKey = normalizeStorageObjectKey(storageObjectKey);
    const normalizedTargetDirectory = normalizeProjectRelativePath(
      targetDirectory || path.posix.dirname(normalizedFilePath || `${PROJECT_ASSET_STORAGE_ROOT}/${projectId}`)
    );
    return {
      bytesWritten,
      directoryStatus,
      ok,
      projectId,
      storageObjectKey: normalizedStorageObjectKey,
      targetDirectory: normalizedTargetDirectory,
      targetDirectoryResult,
      targetFilePath: normalizedFilePath,
      targetFolder: normalizedTargetDirectory,
      viewPath: normalizeProjectRelativePath(viewPath || normalizedFilePath),
      writeResult,
      message
    };
  }

  function hasProjectAssetStorage() {
    return typeof projectAssetStorage?.putObject === "function";
  }

  function storageObjectKeyForProjectPath(targetFilePath) {
    return typeof projectAssetStorage?.objectKeyForProjectPath === "function"
      ? projectAssetStorage.objectKeyForProjectPath(targetFilePath)
      : normalizeProjectRelativePath(targetFilePath);
  }

  function storagePrefix() {
    return normalizeProjectRelativePath(projectAssetStorage?.config?.projectsPrefix || "");
  }

  function validateProjectTargetDirectory(targetFilePath, projectId = "") {
    const resolved = resolveProjectRelativeFile(targetFilePath, projectId);
    const directoryRelativePath = normalizeProjectRelativePath(path.posix.dirname(resolved.relativePath || targetFilePath));
    if (resolved.error) {
      return {
        ...resolved,
        directoryAbsolutePath: "",
        directoryRelativePath,
        directoryStatus: "failed",
        message: resolved.error
      };
    }

    const directoryAbsolutePath = path.dirname(resolved.absolutePath);
    const normalizedProjectId = normalizeProjectId(projectId);
    const projectRoot = path.resolve(repositoryRoot(), PROJECT_ASSET_STORAGE_ROOT, normalizedProjectId);
    const relativeDirectoryToProject = path.relative(projectRoot, directoryAbsolutePath);
    if (
      !normalizedProjectId
      || relativeDirectoryToProject === ""
      || relativeDirectoryToProject.startsWith("..")
      || path.isAbsolute(relativeDirectoryToProject)
    ) {
      return {
        ...resolved,
        directoryAbsolutePath,
        directoryRelativePath,
        directoryStatus: "failed",
        error: "Upload directory validation failed: target directory must stay under /projects/<projectId>/<asset-type>/.",
        message: "Upload directory validation failed: target directory must stay under /projects/<projectId>/<asset-type>/."
      };
    }

    try {
      if (existsSync(directoryAbsolutePath)) {
        if (!statSync(directoryAbsolutePath).isDirectory()) {
          return {
            ...resolved,
            directoryAbsolutePath,
            directoryRelativePath,
            directoryStatus: "failed",
            error: "Upload directory validation failed: target path exists but is not a directory.",
            message: "Upload directory validation failed: target path exists but is not a directory."
          };
        }
        return {
          ...resolved,
          directoryAbsolutePath,
          directoryRelativePath,
          directoryStatus: "exists",
          message: `Directory exists: ${directoryRelativePath}.`
        };
      }

      mkdirSync(directoryAbsolutePath, { recursive: true });
      if (!existsSync(directoryAbsolutePath) || !statSync(directoryAbsolutePath).isDirectory()) {
        return {
          ...resolved,
          directoryAbsolutePath,
          directoryRelativePath,
          directoryStatus: "failed",
          error: "Upload directory creation failed: target directory was not created.",
          message: "Upload directory creation failed: target directory was not created."
        };
      }

      return {
        ...resolved,
        directoryAbsolutePath,
        directoryRelativePath,
        directoryStatus: "created",
        message: `Directory created: ${directoryRelativePath}.`
      };
    } catch (error) {
      return {
        ...resolved,
        directoryAbsolutePath,
        directoryRelativePath,
        directoryStatus: "failed",
        error: `Upload directory creation failed: ${error.message}`,
        message: `Upload directory creation failed: ${error.message}`
      };
    }
  }

  function catalogUploadTargetPath(projectId, assetRole, fileName) {
    const targetFilePath = catalogUploadStoredPath(projectId, assetRole, fileName);
    if (!unsafeUploadPathForTest || !targetFilePath) {
      return targetFilePath;
    }
    const normalizedProjectId = normalizeProjectId(projectId);
    const role = roleDefinitionForId(assetRole);
    return `${PROJECT_ASSET_STORAGE_ROOT}/${normalizedProjectId}/${role?.storageFolder || "image"}/../outside/${sanitizeFileName(fileName)}`;
  }

  function writeCatalogUploadFile(input, projectId) {
    if (hasProjectAssetStorage()) {
      return writeStorageUploadFile(input, projectId);
    }
    const assetRole = catalogAssetRoleForType(input.assetType);
    const targetFilePath = catalogUploadTargetPath(projectId, assetRole, input.fileName);
    if (!uploadFileWritesEnabled) {
      return createWriteDiagnostics({
        message: "Upload file write failed: browser file writes are not supported by this runtime.",
        ok: false,
        projectId,
        targetFilePath,
        writeResult: "FAIL: Browser file writes are not supported"
      });
    }
    if (input.hasFileBytes !== true || typeof input.fileContentBase64 !== "string") {
      return createWriteDiagnostics({
        message: "Upload file write failed: selected file bytes were not provided by the browser.",
        ok: false,
        projectId,
        targetFilePath,
        writeResult: "FAIL: Missing file bytes"
      });
    }

    const directoryValidation = validateProjectTargetDirectory(targetFilePath, projectId);
    if (directoryValidation.error) {
      return createWriteDiagnostics({
        directoryStatus: directoryValidation.directoryStatus,
        message: directoryValidation.message || directoryValidation.error,
        ok: false,
        projectId,
        targetDirectory: directoryValidation.directoryRelativePath,
        targetDirectoryResult: directoryValidation.message || directoryValidation.error,
        targetFilePath: directoryValidation.relativePath || targetFilePath,
        writeResult: "FAIL: Directory validation"
      });
    }

    try {
      const fileBytes = Buffer.from(input.fileContentBase64, "base64");
      if (existsSync(directoryValidation.absolutePath)) {
        return createWriteDiagnostics({
          directoryStatus: directoryValidation.directoryStatus,
          message: `Upload file blocked: ${directoryValidation.relativePath} already exists. Rename the file or remove the existing asset before uploading.`,
          ok: false,
          projectId,
          targetDirectory: directoryValidation.directoryRelativePath,
          targetDirectoryResult: directoryValidation.message,
          targetFilePath: directoryValidation.relativePath,
          writeResult: "FAIL: Duplicate project path"
        });
      }
      writeFileSync(directoryValidation.absolutePath, fileBytes);
      if (!existsSync(directoryValidation.absolutePath)) {
        return createWriteDiagnostics({
          directoryStatus: directoryValidation.directoryStatus,
          message: "Upload file write failed: target file does not exist after write.",
          ok: false,
          projectId,
          targetDirectory: directoryValidation.directoryRelativePath,
          targetDirectoryResult: directoryValidation.message,
          targetFilePath: directoryValidation.relativePath,
          writeResult: "FAIL: Missing after write"
        });
      }
      return createWriteDiagnostics({
        bytesWritten: fileBytes.length,
        directoryStatus: directoryValidation.directoryStatus,
        message: `Wrote ${input.fileName} to ${directoryValidation.relativePath}.`,
        ok: true,
        projectId,
        targetDirectory: directoryValidation.directoryRelativePath,
        targetDirectoryResult: directoryValidation.message,
        targetFilePath: directoryValidation.relativePath,
        writeResult: "Written"
      });
    } catch (error) {
      return createWriteDiagnostics({
        directoryStatus: directoryValidation.directoryStatus,
        message: `Upload file write failed: ${error.message}`,
        ok: false,
        projectId,
        targetDirectory: directoryValidation.directoryRelativePath,
        targetDirectoryResult: directoryValidation.message,
        targetFilePath: directoryValidation.relativePath || targetFilePath,
        writeResult: "FAIL: Write error"
      });
    }
  }

  async function writeStorageUploadFile(input, projectId) {
    const assetRole = catalogAssetRoleForType(input.assetType);
    const targetFilePath = catalogUploadTargetPath(projectId, assetRole, input.fileName);
    if (!uploadFileWritesEnabled) {
      return createWriteDiagnostics({
        message: "Upload file write failed: server storage uploads are disabled for this runtime.",
        ok: false,
        projectId,
        targetFilePath,
        writeResult: "FAIL: Storage uploads disabled"
      });
    }
    if (input.hasFileBytes !== true || typeof input.fileContentBase64 !== "string") {
      return createWriteDiagnostics({
        message: "Upload file write failed: selected file bytes were not provided by the browser.",
        ok: false,
        projectId,
        targetFilePath,
        writeResult: "FAIL: Missing file bytes"
      });
    }

    const resolved = resolveProjectRelativeFile(targetFilePath, projectId);
    if (resolved.error) {
      return createWriteDiagnostics({
        directoryStatus: "failed",
        message: "Upload file write failed: target path must stay under /projects/<projectId>/.",
        ok: false,
        projectId,
        targetFilePath: resolved.relativePath || targetFilePath,
        writeResult: "FAIL: Storage path validation"
      });
    }

    const objectKey = storageObjectKeyForProjectPath(targetFilePath);
    const requiredPrefix = storagePrefix();
    if (requiredPrefix && !normalizeProjectRelativePath(objectKey).startsWith(requiredPrefix)) {
      return createWriteDiagnostics({
        directoryStatus: "failed",
        message: `Upload file write failed: storage object key must stay under ${projectAssetStorage.config.projectsPrefix}.`,
        ok: false,
        projectId,
        storageObjectKey: objectKey,
        targetFilePath: objectKey,
        writeResult: "FAIL: Storage prefix validation"
      });
    }

    const listed = await projectAssetStorage.listProjectObjects(projectId);
    if (!listed.ok) {
      return createWriteDiagnostics({
        directoryStatus: "failed",
        message: listed.message,
        ok: false,
        projectId,
        storageObjectKey: objectKey,
        targetFilePath: objectKey,
        writeResult: "FAIL: Storage list"
      });
    }
    if (listed.keys.includes(objectKey)) {
      return createWriteDiagnostics({
        directoryStatus: "exists",
        message: `Upload file blocked: ${objectKey} already exists. Rename the file or remove the existing asset before uploading.`,
        ok: false,
        projectId,
        storageObjectKey: objectKey,
        targetFilePath: objectKey,
        writeResult: "FAIL: Duplicate storage object"
      });
    }

    const fileBytes = Buffer.from(input.fileContentBase64, "base64");
    const uploaded = await projectAssetStorage.putObject({
      bytes: fileBytes,
      contentType: input.mimeType || "application/octet-stream",
      objectKey,
    });
    return createWriteDiagnostics({
      bytesWritten: uploaded.bytesWritten || 0,
      directoryStatus: uploaded.ok ? "storage-prefix" : "failed",
      message: uploaded.ok ? `Uploaded ${input.fileName} to ${objectKey}.` : uploaded.message,
      ok: uploaded.ok,
      projectId,
      storageObjectKey: objectKey,
      targetDirectory: objectKey.split("/").slice(0, -1).join("/"),
      targetDirectoryResult: listed.message,
      targetFilePath: objectKey,
      viewPath: `api/storage/project-assets/read?key=${encodeURIComponent(objectKey)}`,
      writeResult: uploaded.writeResult || (uploaded.ok ? "Stored" : "FAIL: Storage upload")
    });
  }

  function verifyExistingCatalogUploadFile(input, projectId) {
    if (hasProjectAssetStorage()) {
      return verifyExistingStorageUploadFile(input, projectId);
    }
    const assetRole = catalogAssetRoleForType(input.assetType);
    const targetFilePath = catalogUploadStoredPath(projectId, assetRole, input.fileName);
    const resolved = resolveProjectRelativeFile(targetFilePath, projectId);
    if (resolved.error) {
      return createWriteDiagnostics({
        message: resolved.error,
        ok: false,
        projectId,
        targetFilePath: resolved.relativePath || targetFilePath,
        writeResult: "FAIL: Unsafe target path"
      });
    }
    if (!existsSync(resolved.absolutePath)) {
      return createWriteDiagnostics({
        message: "Upload file write failed: selected file bytes were not provided and the stored file is missing.",
        ok: false,
        projectId,
        targetFilePath: resolved.relativePath,
        writeResult: "FAIL: Missing stored file"
      });
    }
    return createWriteDiagnostics({
      bytesWritten: Number(input.size) || 0,
      message: `Verified existing upload at ${resolved.relativePath}.`,
      ok: true,
      projectId,
      targetFilePath: resolved.relativePath,
      writeResult: "Existing file verified"
    });
  }

  async function verifyExistingStorageUploadFile(input, projectId) {
    const assetRole = catalogAssetRoleForType(input.assetType);
    const targetFilePath = catalogUploadStoredPath(projectId, assetRole, input.fileName);
    const resolved = resolveProjectRelativeFile(targetFilePath, projectId);
    if (resolved.error) {
      return createWriteDiagnostics({
        message: resolved.error,
        ok: false,
        projectId,
        targetFilePath: resolved.relativePath || targetFilePath,
        writeResult: "FAIL: Unsafe target path"
      });
    }
    const objectKey = storageObjectKeyForProjectPath(targetFilePath);
    const readResult = await projectAssetStorage.readObject(objectKey);
    if (!readResult.ok) {
      return createWriteDiagnostics({
        message: readResult.message,
        ok: false,
        projectId,
        storageObjectKey: objectKey,
        targetFilePath: objectKey,
        writeResult: "FAIL: Missing storage object"
      });
    }
    return createWriteDiagnostics({
      bytesWritten: readResult.bytes?.length || Number(input.size) || 0,
      message: `Verified existing upload at ${objectKey}.`,
      ok: true,
      projectId,
      storageObjectKey: objectKey,
      targetFilePath: objectKey,
      viewPath: `api/storage/project-assets/read?key=${encodeURIComponent(objectKey)}`,
      writeResult: "Existing storage object verified"
    });
  }

  function catalogDeleteTargetPath(asset) {
    const targetFilePath = asset?.storedPath || asset?.path || "";
    if (!unsafeDeletePathForTest || !targetFilePath) {
      return targetFilePath;
    }
    const normalizedProjectId = normalizeProjectId(asset.projectId);
    const role = roleDefinitionForId(asset.assetRole || catalogAssetRoleForType(asset.assetType || asset.type));
    return `${PROJECT_ASSET_STORAGE_ROOT}/${normalizedProjectId}/${role?.storageFolder || "image"}/../outside/${sanitizeFileName(asset.fileName || asset.originalName || "asset")}`;
  }

  function createDeleteDiagnostics({
    deleteResult = "",
    deleted = false,
    message = "",
    ok = false,
    projectId = "",
    skipped = false,
    storageObjectKey = "",
    targetFilePath = ""
  } = {}) {
    const normalizedFilePath = normalizeProjectRelativePath(targetFilePath);
    const normalizedStorageObjectKey = normalizeStorageObjectKey(storageObjectKey || targetFilePath);
    return {
      deleteResult,
      deleted,
      message,
      ok,
      projectId,
      skipped,
      storageObjectKey: normalizedStorageObjectKey,
      targetFilePath: normalizedFilePath,
      viewPath: normalizedFilePath
    };
  }

  async function deleteStoredAssetObject(asset) {
    if (!asset || asset.source !== UPLOAD_SOURCE_MODE) {
      return createDeleteDiagnostics({
        deleteResult: "SKIP: Reference asset",
        message: "No uploaded storage object to delete.",
        ok: true,
        projectId: asset?.projectId || "",
        skipped: true
      });
    }
    if (typeof projectAssetStorage?.deleteObject !== "function") {
      return createDeleteDiagnostics({
        deleteResult: "FAIL: Storage delete unavailable",
        message: "Upload object delete failed: configured project asset storage does not support delete.",
        ok: false,
        projectId: asset.projectId,
        targetFilePath: asset.storedPath || asset.path || ""
      });
    }
    const objectKey = normalizeStorageObjectKey(
      asset.storageObjectKey || storageObjectKeyForProjectPath(asset.targetFilePath || asset.storedPath || asset.path)
    );
    const requiredPrefix = storagePrefix();
    if (!objectKey || (requiredPrefix && !normalizeProjectRelativePath(objectKey).startsWith(requiredPrefix))) {
      return createDeleteDiagnostics({
        deleteResult: "FAIL: Storage prefix validation",
        message: `Upload object delete failed: storage object key must stay under ${projectAssetStorage.config.projectsPrefix}.`,
        ok: false,
        projectId: asset.projectId,
        storageObjectKey: objectKey,
        targetFilePath: objectKey
      });
    }
    const result = await projectAssetStorage.deleteObject(objectKey);
    return createDeleteDiagnostics({
      deleteResult: result.ok ? "Deleted" : "FAIL: Storage delete",
      deleted: result.deleted === true,
      message: result.ok ? `Deleted storage object ${objectKey}.` : result.message,
      ok: result.ok,
      projectId: asset.projectId,
      storageObjectKey: objectKey,
      targetFilePath: objectKey
    });
  }

  function deletePhysicalAssetFile(asset) {
    if (!asset || asset.source !== UPLOAD_SOURCE_MODE) {
      return createDeleteDiagnostics({
        deleteResult: "SKIP: Reference asset",
        message: "No uploaded physical file to delete.",
        ok: true,
        projectId: asset?.projectId || "",
        skipped: true
      });
    }
    const targetFilePath = catalogDeleteTargetPath(asset);
    const resolved = resolveProjectRelativeFile(targetFilePath, asset.projectId);
    if (resolved.error || !resolved.absolutePath) {
      return createDeleteDiagnostics({
        deleteResult: "FAIL: Unsafe target path",
        message: resolved.error
          ? "Upload file delete failed: target path must stay under /projects/<projectId>/."
          : "Upload file delete failed: target path could not be resolved.",
        ok: false,
        projectId: asset.projectId,
        targetFilePath: resolved.relativePath || targetFilePath
      });
    }
    if (!existsSync(resolved.absolutePath)) {
      return createDeleteDiagnostics({
        deleteResult: "FAIL: Missing physical file",
        message: `Upload file delete failed: ${resolved.relativePath} does not exist.`,
        ok: false,
        projectId: asset.projectId,
        targetFilePath: resolved.relativePath
      });
    }
    try {
      unlinkSync(resolved.absolutePath);
    } catch (error) {
      return createDeleteDiagnostics({
        deleteResult: "FAIL: Delete error",
        message: `Upload file delete failed: ${error.message}`,
        ok: false,
        projectId: asset.projectId,
        targetFilePath: resolved.relativePath
      });
    }
    if (existsSync(resolved.absolutePath)) {
      return createDeleteDiagnostics({
        deleteResult: "FAIL: File still exists",
        message: `Upload file delete failed: ${resolved.relativePath} still exists after delete.`,
        ok: false,
        projectId: asset.projectId,
        targetFilePath: resolved.relativePath
      });
    }
    return createDeleteDiagnostics({
      deleteResult: "Deleted",
      deleted: true,
      message: `Deleted file ${resolved.relativePath}.`,
      ok: true,
      projectId: asset.projectId,
      storageObjectKey: "",
      targetFilePath: resolved.relativePath
    });
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
    const projectId = currentProjectId(snapshot);
    const activeProject = snapshot.handoff.activeProject
      ? {
          ...snapshot.handoff.activeProject,
          id: projectId,
          sourceProjectId: snapshot.handoff.activeProject.id
        }
      : projectId
        ? {
            id: projectId,
            name: "Asset Upload Project",
            sourceProjectId: "",
          }
      : null;
    const ready = Boolean(
      activeProject?.id
      && (
        (
          snapshot.handoff.ready
          && snapshot.configuration
          && snapshot.validation.findings.length === 0
        )
        || existingOwnedProjectId()
      )
    );

    return {
      activeProject,
      configuration: snapshot.configuration,
      ready,
      validation: snapshot.validation
    };
  }

  function workspaceActiveProject() {
    const activeGame = options.gameWorkspaceRepository?.getActiveGame?.();
    const projectId = projectStorageIdForGameId(activeGame?.id || "");
    return projectId
      ? {
          ...activeGame,
          id: projectId,
          sourceProjectId: activeGame?.id || projectId,
        }
      : null;
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
    const filePickerMode = role?.inputMode === "file";
    const fileName = filePickerMode
      ? normalizeText(input.fileName || input.originalName)
      : "";
    const mimeType = filePickerMode
      ? normalizeText(input.mimeType).toLowerCase()
      : "";
    const normalized = {
      assetRole,
      fileName,
      mimeType,
      name: normalizeText(input.name),
      paletteSwatch: null,
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

    if (role && !filePickerMode) {
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
    const project = handoff.activeProject?.id ? handoff.activeProject : workspaceActiveProject();
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
      key: storageObject.assetId,
      mimeType: validation.asset.mimeType,
      name: validation.asset.name,
      originalName: storageObject.originalName,
      ownerProjectId: projectId,
      ownerUserId: ownerUserKey,
      paletteSwatch: clonePaletteSwatch(validation.asset.paletteSwatch),
      path: storageObject.storedPath,
      previewKind: previewKindForRole(role),
      projectId,
      reference: "",
      role: role.label,
      size: validation.asset.size,
      source: UPLOAD_SOURCE_MODE,
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
      key: `${asset.id}-import-${tables.asset_import_events.length + 1}`,
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
    const project = handoff.activeProject?.id ? handoff.activeProject : workspaceActiveProject();
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
      key: `${record.asset.id}-import-${tables.asset_import_events.length + 1}`,
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

  function referenceValuesForAssetType(assetType, projectId, currentAssetId = "") {
    if (assetType === "Palette References") {
      return paletteRepository.listSwatches().map((swatch) => swatch.key);
    }
    return ownedAssetsForProject(projectId)
      .filter((asset) => asset.id !== currentAssetId && assetTypeForRecord(asset) === assetType)
      .map((asset) => asset.id);
  }

  function validateCatalogAssetInput(input = {}, existingAsset = null) {
    const assetType = existingAsset
      ? normalizeCatalogAssetType(existingAsset.assetType || existingAsset.type)
      : normalizeCatalogAssetType(input.assetType || input.type);
    const projectId = existingAsset?.projectId || getConfigurationHandoff().activeProject?.id || "";
    const existingSource = normalizeCatalogSourceMode(existingAsset?.source);
    const requestedSource = existingAsset ? "" : normalizeCatalogSourceMode(input.source);
    const source = requestedSource || existingSource || (isReferenceCatalogType(assetType) ? REFERENCE_SOURCE_MODE : "");
    const reference = source === REFERENCE_SOURCE_MODE
      ? normalizeText(existingAsset?.reference || input.reference || input.name)
      : "";
    const fileName = source === UPLOAD_SOURCE_MODE
      ? normalizeText(existingAsset?.fileName || input.fileName || input.file)
      : "";
    const name = existingAsset?.name || (source === REFERENCE_SOURCE_MODE ? reference : fileName);
    const usage = normalizeCatalogUsage(input.usage);
    const description = existingAsset ? normalizeText(existingAsset.description) : normalizeText(input.description);
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
    if (assetType && !source) {
      findings.push({
        action: "Choose Upload or Reference before saving.",
        field: "source",
        label: "Source"
      });
    }
    if (assetType && isReferenceCatalogType(assetType) && source !== REFERENCE_SOURCE_MODE) {
      findings.push({
        action: "Use Reference for this asset type.",
        field: "source",
        label: "Source"
      });
    }
    if (assetType && source === REFERENCE_SOURCE_MODE && !reference) {
      findings.push({
        action: "Choose a reference source before saving.",
        field: "reference",
        label: "Reference"
      });
    }
    if (assetType && source === REFERENCE_SOURCE_MODE && reference) {
      const referenceValues = referenceValuesForAssetType(assetType, projectId, existingAsset?.id || "");
      if (!referenceValues.includes(reference)) {
        findings.push({
          action: "Choose a valid reference source before saving.",
          field: "reference",
          label: "Reference"
        });
      }
    }
    if (assetType && source === UPLOAD_SOURCE_MODE && !fileName) {
      findings.push({
        action: "Choose an upload file before saving.",
        field: "fileName",
        label: "File"
      });
    }
    if (assetType && source === UPLOAD_SOURCE_MODE && fileName) {
      const role = roleDefinitionForId(catalogAssetRoleForType(assetType));
      if (role && !extensionMatchesRole(role, fileName)) {
        findings.push({
          action: `Choose an approved ${assetType} file: ${role.extensions.join(", ")}.`,
          field: "fileName",
          label: "File"
        });
      }
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
        fileName,
        fileContentBase64: existingAsset ? undefined : (typeof input.fileContentBase64 === "string" ? input.fileContentBase64 : undefined),
        hasFileBytes: existingAsset ? false : input.hasFileBytes === true,
        mimeType: normalizeText(existingAsset?.mimeType || input.mimeType),
        name: name || existingAsset?.name || "",
        reference,
        size: Number(existingAsset?.size ?? input.size) || 0,
        source,
        tagKeys,
        usage: usage || existingAsset?.usage || ""
      },
      findings,
      status: findings.length === 0 ? "Ready" : "Needs Input"
    };
  }

  function createCatalogAssetRecord(input = {}, writeDiagnostics = null) {
    const handoff = getConfigurationHandoff();
    const project = handoff.activeProject || null;
    const projectId = project?.id || "";
    const ownerUserKey = activeUserKey();
    const assetType = input.assetType;
    const assetRole = catalogAssetRoleForType(assetType);
    const role = roleDefinitionForId(assetRole) || roleDefinitionForId("image");
    const fileName = input.source === UPLOAD_SOURCE_MODE ? input.fileName : "";
    const originalName = fileName || input.reference;
    const storedPath = writeDiagnostics?.storageObjectKey || writeDiagnostics?.targetFilePath || catalogStoredPath({
      assetRole,
      assetType,
      fileName,
      projectId,
      reference: input.reference,
      source: input.source,
      usage: input.usage
    });
    const mimeType = normalizeText(input.mimeType);
    const size = Number(input.size) || Number(writeDiagnostics?.bytesWritten) || 0;
    const checksum = checksumForMetadata({
      assetRole,
      fileName: originalName,
      mimeType,
      projectId,
      size
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
      key: id,
      mimeType,
      name: input.name,
      originalName,
      ownerProjectId: projectId,
      ownerUserId: ownerUserKey,
      paletteSwatch: null,
      path: storedPath,
      previewKind: `${assetType} catalog record`,
      projectId,
      role: assetType,
      source: input.source,
      reference: input.reference,
      size,
      status: "Ready",
      storedPath,
      storageObjectId: `${id}-storage`,
      storageObjectKey: writeDiagnostics?.storageObjectKey || "",
      tagKeys: input.tagKeys,
      targetFilePath: writeDiagnostics?.targetFilePath || storedPath,
      targetDirectory: writeDiagnostics?.targetDirectory || writeDiagnostics?.targetFolder || "",
      targetDirectoryResult: writeDiagnostics?.targetDirectoryResult || "",
      targetFolder: writeDiagnostics?.targetFolder || "",
      directoryStatus: writeDiagnostics?.directoryStatus || "",
      type: assetType,
      updatedAt: now,
      updatedBy: ownerUserKey,
      usage: input.usage,
      viewPath: writeDiagnostics?.viewPath || storedPath,
      writeDiagnostics: writeDiagnostics ? { ...writeDiagnostics } : null,
      writeResult: writeDiagnostics?.writeResult || (input.source === REFERENCE_SOURCE_MODE ? "Reference" : "")
    };
  }

  function addAssetRecord(input = {}) {
    const handoff = getConfigurationHandoff();
    const validation = validateCatalogAssetInput(input);
    const projectId = validation.findings.length
      ? handoff.activeProject?.id || ""
      : (validation.asset.source === UPLOAD_SOURCE_MODE
          ? ensureUploadProject().projectId
          : handoff.activeProject?.id || "");
    replaceValidationRows(projectId, validation.findings);
    if (validation.findings.length || !projectId) {
      return {
        added: false,
        message: validation.findings[0]?.action || "Asset add blocked: open an active game first.",
        snapshot: getSnapshot(),
        validation
      };
    }

    const writeDiagnostics = validation.asset.source === UPLOAD_SOURCE_MODE
      ? writeCatalogUploadFile(validation.asset, projectId)
      : null;
    if (writeDiagnostics && typeof writeDiagnostics.then === "function") {
      return writeDiagnostics.then((resolvedDiagnostics) => finishAddAssetRecord({
        projectId,
        validation,
        writeDiagnostics: resolvedDiagnostics,
      }));
    }
    return finishAddAssetRecord({
      projectId,
      validation,
      writeDiagnostics,
    });
  }

  function finishAddAssetRecord({ projectId, validation, writeDiagnostics }) {
    if (writeDiagnostics && !writeDiagnostics.ok) {
      replaceValidationRows(projectId, [
        {
          action: writeDiagnostics.message,
          field: "fileWrite",
          label: "File Write"
        }
      ]);
      return {
        added: false,
        message: writeDiagnostics.message,
        snapshot: getSnapshot(),
        validation,
        writeDiagnostics
      };
    }

    const asset = createCatalogAssetRecord(validation.asset, writeDiagnostics);
    tables.asset_library_items.push(asset);
    tables.asset_storage_objects.push({
      assetId: asset.id,
      checksum: asset.checksum,
      createdAt: asset.createdAt,
      createdBy: asset.createdBy,
      id: asset.storageObjectId,
      key: asset.storageObjectId,
      mimeType: asset.mimeType,
      originalName: asset.originalName,
      ownerProjectId: projectId,
      projectId,
      role: asset.type,
      size: asset.size,
      status: "Cataloged",
      storedPath: asset.storedPath,
      storageObjectKey: asset.storageObjectKey || "",
      targetFilePath: asset.targetFilePath,
      targetDirectory: asset.targetDirectory,
      targetDirectoryResult: asset.targetDirectoryResult,
      targetFolder: asset.targetFolder,
      directoryStatus: asset.directoryStatus,
      updatedAt: asset.updatedAt,
      updatedBy: asset.updatedBy,
      viewPath: asset.viewPath,
      writeResult: asset.writeResult
    });
    tables.asset_import_events.push({
      assetId: asset.id,
      createdAt: asset.createdAt,
      createdBy: asset.createdBy,
      fileName: asset.fileName,
      id: `${asset.id}-catalog-${tables.asset_import_events.length + 1}`,
      key: `${asset.id}-catalog-${tables.asset_import_events.length + 1}`,
      mimeType: asset.mimeType,
      projectId,
      status: "Cataloged",
      storedPath: asset.storedPath,
      targetFilePath: asset.targetFilePath,
      targetDirectory: asset.targetDirectory,
      targetDirectoryResult: asset.targetDirectoryResult,
      directoryStatus: asset.directoryStatus,
      type: asset.type,
      updatedAt: asset.updatedAt,
      updatedBy: asset.updatedBy,
      viewPath: asset.viewPath,
      writeResult: asset.writeResult
    });
    selectedAssetId = asset.id;
    replaceValidationRows(projectId, []);
    persistTables();

    return {
      added: true,
      asset,
      message: `Added ${asset.name} to ${asset.assetType}.`,
      snapshot: getSnapshot(),
      validation,
      writeDiagnostics: asset.writeDiagnostics
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

    const writeDiagnostics = validation.asset.source === UPLOAD_SOURCE_MODE
      ? (validation.asset.hasFileBytes
          ? writeCatalogUploadFile(validation.asset, projectId)
          : verifyExistingCatalogUploadFile(validation.asset, projectId))
      : null;
    if (writeDiagnostics && typeof writeDiagnostics.then === "function") {
      return writeDiagnostics.then((resolvedDiagnostics) => finishUpdateAssetRecord({
        asset,
        projectId,
        validation,
        writeDiagnostics: resolvedDiagnostics,
      }));
    }
    return finishUpdateAssetRecord({
      asset,
      projectId,
      validation,
      writeDiagnostics,
    });
  }

  function finishUpdateAssetRecord({ asset, projectId, validation, writeDiagnostics }) {
    if (writeDiagnostics && !writeDiagnostics.ok) {
      replaceValidationRows(projectId, [
        {
          action: writeDiagnostics.message,
          field: "fileWrite",
          label: "File Write"
        }
      ]);
      return {
        asset,
        message: writeDiagnostics.message,
        snapshot: getSnapshot(),
        updated: false,
        validation,
        writeDiagnostics
      };
    }

    const now = new Date().toISOString();
    asset.assetType = validation.asset.assetType;
    asset.type = validation.asset.assetType;
    asset.role = validation.asset.assetType;
    asset.assetRole = catalogAssetRoleForType(validation.asset.assetType);
    asset.assetRoleLabel = roleDefinitionForId(asset.assetRole)?.label || validation.asset.assetType;
    asset.checksum = checksumForMetadata({
      assetRole: asset.assetRole,
      fileName: validation.asset.fileName || validation.asset.reference,
      mimeType: validation.asset.mimeType,
      projectId,
      size: validation.asset.size
    });
    asset.name = validation.asset.name;
    asset.description = validation.asset.description;
    asset.fileName = validation.asset.fileName;
    asset.originalName = asset.fileName || validation.asset.reference;
    asset.mimeType = validation.asset.mimeType;
    asset.reference = validation.asset.reference;
    asset.size = validation.asset.size;
    asset.source = validation.asset.source;
    asset.usage = validation.asset.usage;
    asset.tagKeys = validation.asset.tagKeys;
    asset.updatedAt = now;
    asset.updatedBy = activeUserKey();
    const nextStoredPath = writeDiagnostics?.storageObjectKey || writeDiagnostics?.targetFilePath || catalogStoredPath({
      assetRole: asset.assetRole,
      assetType: asset.assetType,
      fileName: asset.fileName,
      projectId,
      reference: asset.reference,
      source: asset.source,
      usage: asset.usage
    });
    asset.storedPath = nextStoredPath;
    asset.storageObjectKey = writeDiagnostics?.storageObjectKey || "";
    asset.path = nextStoredPath;
    asset.targetFilePath = writeDiagnostics?.targetFilePath || nextStoredPath;
    asset.targetDirectory = writeDiagnostics?.targetDirectory || writeDiagnostics?.targetFolder || "";
    asset.targetDirectoryResult = writeDiagnostics?.targetDirectoryResult || "";
    asset.targetFolder = writeDiagnostics?.targetFolder || "";
    asset.directoryStatus = writeDiagnostics?.directoryStatus || "";
    asset.viewPath = writeDiagnostics?.viewPath || nextStoredPath;
    asset.writeDiagnostics = writeDiagnostics ? { ...writeDiagnostics } : null;
    asset.writeResult = writeDiagnostics?.writeResult || (asset.source === REFERENCE_SOURCE_MODE ? "Reference" : "");
    const storageObject = tables.asset_storage_objects.find((row) => row.id === asset.storageObjectId);
    if (storageObject) {
      storageObject.checksum = asset.checksum;
      storageObject.mimeType = asset.mimeType;
      storageObject.originalName = asset.originalName;
      storageObject.role = asset.type;
      storageObject.size = asset.size;
      storageObject.storedPath = nextStoredPath;
      storageObject.storageObjectKey = asset.storageObjectKey || "";
      storageObject.targetFilePath = asset.targetFilePath;
      storageObject.targetDirectory = asset.targetDirectory;
      storageObject.targetDirectoryResult = asset.targetDirectoryResult;
      storageObject.targetFolder = asset.targetFolder;
      storageObject.directoryStatus = asset.directoryStatus;
      storageObject.updatedAt = now;
      storageObject.updatedBy = asset.updatedBy;
      storageObject.viewPath = asset.viewPath;
      storageObject.writeResult = asset.writeResult;
    }
    tables.asset_import_events.push({
      assetId: asset.id,
      createdAt: now,
      createdBy: asset.updatedBy,
      fileName: asset.fileName,
      id: `${asset.id}-catalog-${tables.asset_import_events.length + 1}`,
      key: `${asset.id}-catalog-${tables.asset_import_events.length + 1}`,
      mimeType: asset.mimeType,
      projectId,
      status: "Updated",
      storedPath: asset.storedPath,
      targetFilePath: asset.targetFilePath,
      targetDirectory: asset.targetDirectory,
      targetDirectoryResult: asset.targetDirectoryResult,
      directoryStatus: asset.directoryStatus,
      type: asset.type,
      updatedAt: now,
      updatedBy: asset.updatedBy,
      viewPath: asset.viewPath,
      writeResult: asset.writeResult
    });
    selectedAssetId = asset.id;
    replaceValidationRows(projectId, []);
    persistTables();

    return {
      asset,
      message: `Updated ${asset.name}.`,
      snapshot: getSnapshot(),
      updated: true,
      validation,
      writeDiagnostics: asset.writeDiagnostics
    };
  }

  async function listStoredProjectObjects(projectId = "") {
    if (!hasProjectAssetStorage()) {
      return {
        keys: [],
        message: "Project asset storage is not configured for this repository.",
        ok: false
      };
    }
    return projectAssetStorage.listProjectObjects(projectId || getConfigurationHandoff().activeProject?.id || "");
  }

  async function readStoredProjectObject(objectKey = "") {
    if (!hasProjectAssetStorage()) {
      return {
        bytesBase64: "",
        message: "Project asset storage is not configured for this repository.",
        ok: false
      };
    }
    const result = await projectAssetStorage.readObject(objectKey);
    return {
      contentType: result.contentType || "",
      bytesBase64: result.bytes ? Buffer.from(result.bytes).toString("base64") : "",
      message: result.message,
      ok: result.ok
    };
  }

  function deleteAssetRecord(assetId) {
    return hasProjectAssetStorage() ? deleteStorageBackedAsset(assetId) : deleteAsset(assetId);
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
    const fileName = asset.originalName || asset.fileName;
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

  function deleteAssetFailure(asset, projectId, deleteDiagnostics) {
    replaceValidationRows(projectId, [
      {
        action: deleteDiagnostics.message,
        field: "fileDelete",
        label: "File Delete"
      }
    ]);
    return {
      assetId: asset.id,
      deleted: false,
      fileDeleteDiagnostics: deleteDiagnostics,
      message: `FAIL: ${deleteDiagnostics.message}`,
      snapshot: getSnapshot()
    };
  }

  function deleteAssetSuccess(asset, projectId, deleteDiagnostics) {
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
      fileDeleteDiagnostics: deleteDiagnostics,
      message: deleteDiagnostics.deleted
        ? `Deleted ${asset.name} from your asset library. ${deleteDiagnostics.message}`
        : `Deleted ${asset.name} from your asset library.`,
      snapshot: getSnapshot()
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

    const deleteDiagnostics = deletePhysicalAssetFile(asset);
    if (!deleteDiagnostics.ok) {
      return deleteAssetFailure(asset, projectId, deleteDiagnostics);
    }

    return deleteAssetSuccess(asset, projectId, deleteDiagnostics);
  }

  async function deleteStorageBackedAsset(assetId) {
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

    const deleteDiagnostics = await deleteStoredAssetObject(asset);
    if (!deleteDiagnostics.ok) {
      return deleteAssetFailure(asset, projectId, deleteDiagnostics);
    }

    return deleteAssetSuccess(asset, projectId, deleteDiagnostics);
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
    const deletedPhysicalFiles = ownedAssets
      .map((asset) => deletePhysicalAssetFile(asset))
      .filter((result) => result.deleted).length;
    const deletedFiles = Math.max(storageObjects.length, deletedPhysicalFiles);
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
    return getSnapshot();
  }

  function setUploadFileWriteSupport(enabled) {
    uploadFileWritesEnabled = enabled !== false;
    return getSnapshot();
  }

  function setUnsafeUploadPathForTest(enabled) {
    unsafeUploadPathForTest = enabled === true;
    return getSnapshot();
  }

  function setUnsafeDeletePathForTest(enabled) {
    unsafeDeletePathForTest = enabled === true;
    return getSnapshot();
  }

  function getTables() {
    return normalizeMockDbTables(ASSET_DB_OWNER, cloneTables(tables), options);
  }

  function previewStoragePath(input = {}) {
    const handoff = getConfigurationHandoff();
    const projectId = handoff.activeProject?.id || "";
    const assetRole = normalizeRoleId(input.assetRole || input.type);
    const fileName = input.fileName || input.originalName;
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
    ensureUploadProject,
    listAssets,
    listAssetsByType,
    listPaletteSwatches,
    listStoredProjectObjects,
    listTags,
    makeInvalidGameConfiguration,
    makeMissingGameConfiguration,
    makeReadyGameConfiguration,
    previewStoragePath,
    resetAssetLibrary,
    seedDemoAssets,
    seedActiveProjectPalette,
    readStoredProjectObject,
    selectAsset,
    setUnsafeDeletePathForTest,
    setUnsafeUploadPathForTest,
    setUploadFileWriteSupport,
    updateAsset,
    updateAssetRecord,
    validateCatalogAssetInput,
    validateAssetInput
  };
}
