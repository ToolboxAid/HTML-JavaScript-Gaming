import { createGameConfigurationMockRepository } from "../game-configuration/game-configuration-mock-repository.js";

export const ASSET_TOOL_TABLES = Object.freeze([
  "asset_role_definitions",
  "asset_library_items",
  "asset_storage_objects",
  "asset_import_events",
  "asset_validation_items"
]);

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
    uploadEnabled: false,
    inputMode: "palette",
    maxSizeBytes: 1048576,
    usageRoles: ["hud", "text", "background", "border", "accent", "warning", "success", "danger", "shadow", "highlight"],
    validationNeeds: ["Palette Tool required", "Palette color metadata must include hex and name"]
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

const DEMO_ASSET_PROJECT_ID = "01K8M3K0EX7V5A3W9Q2Y6R4T1B";
const PROJECT_ASSET_STORAGE_ROOT = "projects";
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
    action: "Choose a project asset file to upload."
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
  return ASSET_ROLE_DEFINITIONS.map((role) => ({
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
    validationNeeds: role.validationNeeds.join("; ")
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

function normalizeProjectId(value) {
  const normalized = normalizeText(value).toUpperCase();
  return ULID_PATTERN.test(normalized) ? normalized : "";
}

function assetProjectIdForProject(project) {
  if (!project) {
    return "";
  }

  if (project.id === "demo-project") {
    return DEMO_ASSET_PROJECT_ID;
  }

  return normalizeProjectId(project.id);
}

function roleDefinitionForId(roleId) {
  return ASSET_ROLE_DEFINITIONS.find((role) => role.id === roleId) || null;
}

export function pickerDiagnosticForRole(role) {
  if (!role) {
    return "Choose an approved asset role.";
  }
  if (role.inputMode === "palette") {
    return "Palette Tool required.";
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

function createReadyGameConfigurationRepository() {
  const repository = createGameConfigurationMockRepository();
  repository.makeValidGameDesign("demo-project");
  repository.updateConfiguration("demo-project", READY_CONFIGURATION_INPUT);
  return repository;
}

function createValidationRows(projectId, findings) {
  return findings.map((finding, index) => ({
    action: finding.action,
    field: finding.field,
    id: `${projectId || "asset"}-asset-validation-${index + 1}`,
    label: finding.label,
    projectId,
    status: "Missing"
  }));
}

function tableCounts(tables) {
  return ASSET_TOOL_TABLES.map((table) => ({
    rows: tables[table].length,
    table
  }));
}

function createStorageObject({ assetRole, fileName, mimeType, name, project, size, usage }) {
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
    id: `${projectId}-storage-${assetRole}-${slugify(usage)}-${slugify(originalName)}`,
    mimeType,
    originalName,
    ownerProjectId: projectId,
    projectId,
    role: role?.label || assetRole,
    size,
    status: "Stored",
    storedPath,
    updatedAt: timestamp
  };
}

export function createAssetToolMockRepository(options = {}) {
  const configurationRepository = options.configurationRepository || createReadyGameConfigurationRepository();
  let tables = createEmptyTables();
  let selectedAssetId = "";

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
    const normalized = {
      assetRole,
      fileName: normalizeText(input.fileName || input.originalName),
      mimeType: normalizeText(input.mimeType).toLowerCase(),
      name: normalizeText(input.name),
      pickerMode: normalizeText(input.pickerMode),
      size: Number(input.size) || 0,
      storedPath: storagePathForProjectAsset(activeProject?.id || "", assetRole, input.usage || input.role, input.fileName || input.originalName),
      usage: normalizeUsage(input.usage || input.role, assetRole)
    };

    const findings = [...validateRoleMetadata().findings];
    if (!handoff.ready || !activeProject) {
      findings.push({
        field: "activeProject",
        label: "Active Project",
        action: "Open a project and complete a valid Game Configuration before uploading project assets."
      });
    }
    if (activeProject && !activeProject.id) {
      findings.push({
        field: "projectId",
        label: "Project ID",
        action: "Open a project with a ULID projectId before uploading project assets."
      });
    }

    const filePickerMode = role?.inputMode === "file";
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
          action: `Uploaded project assets must store under ${expectedPrefix}.`
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
    const storageObject = createStorageObject({
      assetRole: validation.asset.assetRole,
      fileName: validation.asset.fileName,
      mimeType: validation.asset.mimeType,
      name: validation.asset.name,
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
      fileName: validation.asset.fileName,
      id: storageObject.assetId,
      mimeType: validation.asset.mimeType,
      name: validation.asset.name,
      originalName: storageObject.originalName,
      ownerProjectId: projectId,
      ownerUserId: project.ownerUserId,
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
      usage: validation.asset.usage
    };

    tables.asset_library_items = tables.asset_library_items.filter((row) => row.id !== asset.id);
    tables.asset_storage_objects = tables.asset_storage_objects.filter((row) => row.id !== storageObject.id);
    tables.asset_library_items.push(asset);
    tables.asset_storage_objects.push(storageObject);
    tables.asset_import_events.push({
      assetId: asset.id,
      fileName: asset.fileName,
      id: `${asset.id}-import-${tables.asset_import_events.length + 1}`,
      mimeType: asset.mimeType,
      projectId,
      status: "Uploaded",
      storedPath: asset.storedPath,
      type: asset.type
    });
    selectedAssetId = asset.id;
    replaceValidationRows(projectId, []);

    return {
      asset,
      imported: true,
      message: `Uploaded ${asset.name} to project asset storage.`,
      snapshot: getSnapshot()
    };
  }

  function listAssets(projectId = "") {
    const handoff = getConfigurationHandoff();
    const targetProjectId = projectId || handoff.activeProject?.id || "";
    return tables.asset_library_items
      .filter((asset) => asset.projectId === targetProjectId)
      .sort((left, right) => left.name.localeCompare(right.name));
  }

  function getSelectedAsset() {
    return tables.asset_library_items.find((asset) => asset.id === selectedAssetId) || null;
  }

  function selectAsset(assetId) {
    if (tables.asset_library_items.some((asset) => asset.id === assetId)) {
      selectedAssetId = assetId;
    }
    return getSnapshot();
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
          action: "Open a project with a ULID projectId before resetting project asset storage.",
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
    const storageObjects = tables.asset_storage_objects.filter(
      (row) => row.projectId === projectId && row.storedPath.startsWith(projectFolder)
    );
    const deletedFiles = storageObjects.length;
    const deletedFolders = localFolderCount(storageObjects);

    tables.asset_library_items = tables.asset_library_items.filter((row) => row.projectId !== projectId);
    tables.asset_storage_objects = tables.asset_storage_objects.filter((row) => row.projectId !== projectId);
    tables.asset_import_events = tables.asset_import_events.filter((row) => row.projectId !== projectId);
    tables.asset_validation_items = tables.asset_validation_items.filter((row) => row.projectId !== projectId);
    selectedAssetId = "";
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
    return getSnapshot();
  }

  function makeMissingGameConfiguration() {
    configurationRepository.makeMissingGameDesign();
    return clearAssetLibrary();
  }

  function makeInvalidGameConfiguration() {
    configurationRepository.makeValidGameDesign("demo-project");
    configurationRepository.updateConfiguration("demo-project", {
      gameBasics: "Only basics are present."
    });
    return clearAssetLibrary();
  }

  function makeReadyGameConfiguration() {
    configurationRepository.makeValidGameDesign("demo-project");
    configurationRepository.updateConfiguration("demo-project", READY_CONFIGURATION_INPUT);
    clearAssetLibrary();
    seedDemoAssets();
    return getSnapshot();
  }

  function getTables() {
    return cloneTables(tables);
  }

  function previewStoragePath(input = {}) {
    const handoff = getConfigurationHandoff();
    const projectId = handoff.activeProject?.id || "";
    const assetRole = normalizeRoleId(input.assetRole || input.type);
    return storagePathForProjectAsset(projectId, assetRole, input.usage || input.role, input.fileName || input.originalName);
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
        currentFocus: "Upload Project Assets",
        libraryStatus: "Needs Input",
        nextStep: "Assets",
        projectProgress: `${handoff.activeProject.name} needs project asset records`,
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
      handoff,
      metadataFields: uploadedAssetMetadataFields(),
      progressHandoff: getProgressHandoff(),
      roleDefinitions: ASSET_ROLE_DEFINITIONS.map((role) => ({ ...role })),
      roleDiagnostics: getRoleDiagnostics(),
      selectedAsset,
      tableCounts: tableCounts(tables),
      tables: getTables(),
      validation: {
        findings,
        status: findings.length > 0 ? "Needs Input" : assets.length > 0 && handoff.ready ? "Ready" : validateRoleMetadata().status
      }
    };
  }

  clearAssetLibrary();
  seedDemoAssets();

  return {
    ASSET_ROLE_DEFINITIONS,
    ASSET_ROLE_LABELS,
    ASSET_TOOL_TABLES,
    ASSET_TYPES,
    ASSET_USAGE_BY_ROLE,
    clearAssetLibrary,
    getConfigurationHandoff,
    getProgressHandoff,
    getRoleDiagnostics,
    getSnapshot,
    getTables,
    importAsset,
    listAssets,
    makeInvalidGameConfiguration,
    makeMissingGameConfiguration,
    makeReadyGameConfiguration,
    previewStoragePath,
    resetAssetLibrary,
    seedDemoAssets,
    selectAsset,
    validateAssetInput
  };
}
