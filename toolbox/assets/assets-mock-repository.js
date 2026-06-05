import { createGameConfigurationMockRepository } from "../game-configuration/game-configuration-mock-repository.js";

export const ASSET_TOOL_TABLES = Object.freeze([
  "asset_library_items",
  "asset_import_events",
  "asset_validation_items"
]);

export const ASSET_TYPES = Object.freeze([
  "Image",
  "Audio",
  "Font",
  "Data",
  "Video"
]);

export const ASSET_ROLES = Object.freeze([
  "Background",
  "Character",
  "Data",
  "Font",
  "Music",
  "Sound Effect",
  "Sprite",
  "Tile",
  "UI",
  "World"
]);

const REQUIRED_FIELDS = Object.freeze([
  {
    field: "name",
    label: "Asset Name",
    action: "Name the asset before importing it."
  },
  {
    field: "type",
    label: "Asset Type",
    action: "Choose an approved asset type."
  },
  {
    field: "role",
    label: "Asset Role",
    action: "Choose how the asset is used by the project."
  },
  {
    field: "path",
    label: "Asset Path",
    action: "Use a project-relative path under assets/."
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
  return {
    asset_import_events: cloneRows(tables.asset_import_events),
    asset_library_items: cloneRows(tables.asset_library_items),
    asset_validation_items: cloneRows(tables.asset_validation_items)
  };
}

function createEmptyTables() {
  return {
    asset_import_events: [],
    asset_library_items: [],
    asset_validation_items: []
  };
}

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeChoice(value, choices) {
  return choices.includes(value) ? value : "";
}

function normalizeAssetPath(value) {
  return normalizeText(value).replace(/\\/g, "/");
}

function slugify(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "asset";
}

function previewKindForType(type) {
  if (type === "Image") return "Image preview";
  if (type === "Audio") return "Audio preview";
  if (type === "Font") return "Font preview";
  if (type === "Video") return "Video preview";
  return "Data preview";
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

export function createAssetToolMockRepository(options = {}) {
  const configurationRepository = options.configurationRepository || createReadyGameConfigurationRepository();
  let tables = createEmptyTables();
  let selectedAssetId = "";

  function getConfigurationHandoff() {
    const snapshot = configurationRepository.getSnapshot();
    const ready = Boolean(
      snapshot.handoff.ready
      && snapshot.configuration
      && snapshot.validation.findings.length === 0
    );

    return {
      activeProject: snapshot.handoff.activeProject,
      configuration: snapshot.configuration,
      ready,
      validation: snapshot.validation
    };
  }

  function validateAssetInput(input = {}) {
    const handoff = getConfigurationHandoff();
    const normalized = {
      fileName: normalizeText(input.fileName),
      mimeType: normalizeText(input.mimeType),
      name: normalizeText(input.name),
      path: normalizeAssetPath(input.path),
      role: normalizeChoice(input.role, ASSET_ROLES),
      size: Number(input.size) || 0,
      type: normalizeChoice(input.type, ASSET_TYPES)
    };

    const findings = [];
    if (!handoff.ready) {
      findings.push({
        field: "gameConfiguration",
        label: "Game Configuration",
        action: "Complete a valid Game Configuration before importing assets."
      });
    }

    REQUIRED_FIELDS.forEach((requirement) => {
      if (!normalized[requirement.field]) {
        findings.push(requirement);
      }
    });

    if (normalized.path && !normalized.path.startsWith("assets/")) {
      findings.push({
        field: "path",
        label: "Asset Path",
        action: "Asset paths must begin with assets/."
      });
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
    const projectId = handoff.activeProject?.id || "";
    const validation = validateAssetInput(input);
    replaceValidationRows(projectId, validation.findings);

    if (validation.findings.length > 0 || !projectId) {
      return {
        imported: false,
        message: validation.findings.length === 1
          ? "Asset import blocked by 1 missing item."
          : `Asset import blocked by ${validation.findings.length} missing items.`,
        snapshot: getSnapshot()
      };
    }

    const asset = {
      fileName: validation.asset.fileName,
      id: `${projectId}-asset-${slugify(validation.asset.name)}`,
      mimeType: validation.asset.mimeType,
      name: validation.asset.name,
      path: validation.asset.path,
      previewKind: previewKindForType(validation.asset.type),
      projectId,
      role: validation.asset.role,
      size: validation.asset.size,
      status: "Ready",
      type: validation.asset.type,
      updatedAt: new Date().toISOString()
    };

    tables.asset_library_items = tables.asset_library_items.filter((row) => row.id !== asset.id);
    tables.asset_library_items.push(asset);
    tables.asset_import_events.push({
      assetId: asset.id,
      fileName: asset.fileName,
      id: `${asset.id}-import-${tables.asset_import_events.length + 1}`,
      path: asset.path,
      projectId,
      status: "Imported",
      type: asset.type
    });
    selectedAssetId = asset.id;
    replaceValidationRows(projectId, []);

    return {
      asset,
      imported: true,
      message: `Imported ${asset.name} into the asset library.`,
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
      fileName: "player.png",
      mimeType: "image/png",
      name: "Demo Player Sprite",
      path: "assets/images/player.png",
      role: "Sprite",
      size: 2048,
      type: "Image"
    });
    return getSnapshot();
  }

  function resetAssetLibrary() {
    tables = createEmptyTables();
    selectedAssetId = "";
    seedDemoAssets();
    return getSnapshot();
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
    return resetAssetLibrary();
  }

  function getTables() {
    return cloneTables(tables);
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
        currentFocus: "Import Assets",
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
    const validation = validateAssetInput({
      name: selectedAsset?.name,
      path: selectedAsset?.path,
      role: selectedAsset?.role,
      type: selectedAsset?.type
    });
    const projectId = handoff.activeProject?.id || "";
    const findings = tables.asset_validation_items.filter((row) => row.projectId === projectId);

    return {
      assets,
      handoff,
      progressHandoff: getProgressHandoff(),
      selectedAsset,
      tableCounts: tableCounts(tables),
      tables: getTables(),
      validation: {
        findings,
        status: findings.length > 0 ? "Needs Input" : assets.length > 0 && handoff.ready ? "Ready" : validation.status
      }
    };
  }

  resetAssetLibrary();

  return {
    ASSET_ROLES,
    ASSET_TOOL_TABLES,
    ASSET_TYPES,
    clearAssetLibrary,
    getConfigurationHandoff,
    getProgressHandoff,
    getSnapshot,
    getTables,
    importAsset,
    listAssets,
    makeInvalidGameConfiguration,
    makeMissingGameConfiguration,
    makeReadyGameConfiguration,
    resetAssetLibrary,
    seedDemoAssets,
    selectAsset,
    validateAssetInput
  };
}
