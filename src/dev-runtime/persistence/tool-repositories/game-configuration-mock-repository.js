import { createGameDesignMockRepository } from "./game-design-mock-repository.js";
import { GAME_WORKSPACE_DEFAULT_OWNER_USER_KEY } from "./game-workspace-mock-repository.js";
import { makeSeedUlid } from "../../seed/seed-db-keys.mjs";

export const GAME_CONFIGURATION_TABLES = Object.freeze([
  "game_configuration_records",
  "game_configuration_validation_items",
]);

export const GAME_CONFIGURATION_SECTIONS = Object.freeze([
  "gameDetails",
  "version",
  "resolution",
  "platforms",
  "visibility",
  "startupSettings",
  "gameBasics",
  "gameRules",
  "playerSetup",
  "worldSetup",
  "objectSetup",
  "audioSetup",
  "testReadiness",
]);

export const GAME_CONFIGURATION_PLAYER_MODES = Object.freeze([
  Object.freeze({
    description: "One active player.",
    label: "1 Player",
    value: "1 Player",
  }),
  Object.freeze({
    description: "Multiple players, one active player receives input at a time.",
    label: "2+ Turn Based",
    value: "2+ Turn Based",
  }),
  Object.freeze({
    description: "Multiple players active at the same time.",
    label: "2+ Concurrent",
    value: "2+ Concurrent",
  }),
]);

export const GAME_CONFIGURATION_VISIBILITY_OPTIONS = Object.freeze(["Private", "Unlisted", "Public"]);
export const GAME_CONFIGURATION_RESOLUTION_OPTIONS = Object.freeze(["1280x720", "1366x768", "1920x1080"]);

const SECTION_LABELS = Object.freeze({
  audioSetup: "Audio Setup",
  gameBasics: "Game Basics",
  gameDetails: "Game Details",
  gameRules: "Game Rules",
  objectSetup: "Object Setup",
  platforms: "Platforms",
  playerSetup: "Player Setup",
  resolution: "Resolution",
  startupSettings: "Startup Settings",
  testReadiness: "Test Readiness",
  version: "Version",
  visibility: "Visibility",
  worldSetup: "World Setup",
});

function cloneRows(rows) {
  return rows.map((row) => ({ ...row }));
}

function cloneTables(tables) {
  return {
    game_configuration_records: cloneRows(tables.game_configuration_records),
    game_configuration_validation_items: cloneRows(tables.game_configuration_validation_items),
  };
}

function createEmptyTables() {
  return {
    game_configuration_records: [],
    game_configuration_validation_items: [],
  };
}

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizePlayerMode(value) {
  const normalized = normalizeText(value);
  return GAME_CONFIGURATION_PLAYER_MODES.some((mode) => mode.value === normalized)
    ? normalized
    : "1 Player";
}

function normalizeChoice(value, options, fallback) {
  const normalized = normalizeText(value);
  return options.includes(normalized) ? normalized : fallback;
}

function auditFields(index = 0, userKey = GAME_WORKSPACE_DEFAULT_OWNER_USER_KEY) {
  const timestamp = new Date(Date.UTC(2026, 0, 1, 14, index, 0)).toISOString();
  return {
    createdAt: timestamp,
    createdBy: userKey,
    updatedAt: timestamp,
    updatedBy: userKey,
  };
}

function hashKeySource(value) {
  return Array.from(String(value || "game-configuration")).reduce(
    (hash, character) => ((hash * 31) + character.charCodeAt(0)) % 97,
    0,
  );
}

function keySequenceForProject(baseSequence, projectId, index = 0) {
  return baseSequence + (hashKeySource(projectId) * 20) + index;
}

function configurationKeyForProject(projectId) {
  return makeSeedUlid(keySequenceForProject(8800, projectId));
}

function validationKeyForProject(projectId, index) {
  return makeSeedUlid(keySequenceForProject(8900, projectId, index));
}

function configurationIdForProject(projectId) {
  return `${projectId}-game-configuration`;
}

function createValidationRows(projectId, findings) {
  return findings.map((finding, index) => ({
    key: validationKeyForProject(projectId, index),
    projectKey: projectId,
    projectId,
    section: finding.section,
    label: finding.label,
    action: finding.action,
    status: "Missing",
    ...auditFields(index + 20),
  }));
}

function designRequiresAudio(handoff) {
  if (handoff.activeProject?.purpose === "Capability Demo") {
    return false;
  }
  return handoff.activeDesign?.gameType !== "Capability Demo";
}

function requiredSectionsForHandoff(handoff) {
  const sections = [
    "gameDetails",
    "version",
    "resolution",
    "platforms",
    "visibility",
    "startupSettings",
    "gameBasics",
    "gameRules",
    "playerSetup",
    "worldSetup",
    "objectSetup",
    "testReadiness",
  ];

  if (designRequiresAudio(handoff)) {
    sections.splice(11, 0, "audioSetup");
  }

  return sections;
}

function createDocument(projectId, handoff, input = {}) {
  const activeProject = handoff.activeProject || {};
  const document = {
    key: configurationKeyForProject(projectId),
    id: configurationIdForProject(projectId),
    projectKey: projectId,
    projectId,
    gameName: activeProject.name || "",
    gameDetails: normalizeText(input.gameDetails),
    version: normalizeText(input.version) || "0.1.0",
    resolution: normalizeChoice(input.resolution, GAME_CONFIGURATION_RESOLUTION_OPTIONS, "1280x720"),
    platforms: normalizeText(input.platforms),
    visibility: normalizeChoice(input.visibility, GAME_CONFIGURATION_VISIBILITY_OPTIONS, "Private"),
    startupSettings: normalizeText(input.startupSettings),
    projectPurpose: activeProject.purpose || "",
    gameType: activeProject.gameType || handoff.activeDesign?.gameType || activeProject.purpose || "",
    genre: handoff.activeDesign?.genre || "",
    playStyle: handoff.activeDesign?.playStyle || "",
    playerMode: normalizePlayerMode(handoff.activeDesign?.playerMode),
    gameBasics: normalizeText(input.gameBasics),
    gameRules: normalizeText(input.gameRules),
    playerSetup: normalizeText(input.playerSetup),
    worldSetup: normalizeText(input.worldSetup),
    objectSetup: normalizeText(input.objectSetup),
    audioSetup: normalizeText(input.audioSetup),
    testReadiness: normalizeText(input.testReadiness),
    status: "Under Construction",
    ...auditFields(0, activeProject.ownerKey),
  };
  const validation = validateDocument(document, handoff);
  document.status = validation.findings.length === 0 ? "Ready" : "Under Construction";
  return document;
}

function validateDocument(document, handoff) {
  const findings = [];

  if (!handoff.ready) {
    findings.push({
      action: "Complete a valid Game Design before editing Game Configuration.",
      label: "Game Design",
      section: "gameDesign",
    });
    return {
      findings,
      status: "Blocked",
    };
  }

  requiredSectionsForHandoff(handoff).forEach((section) => {
    if (!normalizeText(document?.[section])) {
      findings.push({
        action: `Complete ${SECTION_LABELS[section]} before Build Game readiness.`,
        label: SECTION_LABELS[section],
        section,
      });
    }
  });

  return {
    findings,
    status: findings.length === 0 ? "Ready" : "Needs Input",
  };
}

function createSeededGameDesignRepository() {
  const repository = createGameDesignMockRepository();
  repository.resetDesignData();
  repository.saveDesign({
    designSummary: "A compact puzzle adventure with a clear rules handoff for configuration.",
    gameType: "Puzzle",
    genre: "Adventure",
    playerMode: "1 Player",
    playStyle: "Single Player",
  });
  return repository;
}

export function createGameConfigurationMockRepository(options = {}) {
  const gameDesignRepository = options.gameDesignRepository || createSeededGameDesignRepository();
  let tables = createEmptyTables();

  function getGameDesignHandoff() {
    const activeProject = gameDesignRepository.getActiveGame?.() || gameDesignRepository.getActiveProject();
    const activeDesign = gameDesignRepository.getActiveDesign();
    const validation = gameDesignRepository.validateDesign(activeDesign || {});
    const ready = Boolean(activeProject && activeDesign && validation.findings.length === 0);

    return {
      activeDesign,
      activeGame: activeProject,
      activeProject,
      ready,
      validation,
    };
  }

  function getConfiguration(projectId) {
    return tables.game_configuration_records.find((document) => (
      document.projectId === projectId || document.projectKey === projectId
    )) || null;
  }

  function createConfiguration(projectId, input = {}) {
    const handoff = getGameDesignHandoff();
    if (!handoff.ready || handoff.activeProject?.id !== projectId) {
      return null;
    }

    const document = createDocument(projectId, handoff, input);
    tables.game_configuration_records = tables.game_configuration_records.filter(
      (row) => row.projectId !== projectId && row.projectKey !== projectId,
    );
    tables.game_configuration_records.push(document);
    replaceValidationRows(projectId, validateConfiguration(projectId, document).findings);
    return document;
  }

  function updateConfiguration(projectId, input = {}) {
    return createConfiguration(projectId, input);
  }

  function seedConfigurationForActiveProject() {
    const handoff = getGameDesignHandoff();
    const projectId = handoff.activeProject?.id || "";
    if (!handoff.ready || !projectId || getConfiguration(projectId)) {
      return null;
    }

    return createConfiguration(projectId, {
      audioSetup: "Simple pickup, hazard, and completion sounds.",
      gameBasics: "Seeded playable setup for the current Game Hub game.",
      gameDetails: "A friendly puzzle game prepared for sharing and discovery.",
      gameRules: "Collect every key, avoid hazards, and reach the exit.",
      objectSetup: "Keys, doors, hazards, exit marker, and tutorial prompt.",
      platforms: "Web",
      playerSetup: "One player starts near the first key with keyboard controls.",
      resolution: "1280x720",
      startupSettings: "Open on the title screen and start in the first room.",
      testReadiness: "Confirm start, collect, fail, retry, and win paths before Build Game.",
      version: "0.1.0",
      visibility: "Private",
      worldSetup: "One compact room with a locked exit and visible goal path.",
    });
  }

  function replaceValidationRows(projectId, findings) {
    tables.game_configuration_validation_items = tables.game_configuration_validation_items.filter(
      (row) => row.projectId !== projectId && row.projectKey !== projectId,
    );
    tables.game_configuration_validation_items.push(...createValidationRows(projectId, findings));
  }

  function validateConfiguration(projectId, input = null) {
    const handoff = getGameDesignHandoff();
    const source = input || getConfiguration(projectId);
    const validation = validateDocument(source || {}, handoff);

    if (projectId) {
      replaceValidationRows(projectId, validation.findings);
    }

    return validation;
  }

  function resetConfiguration(projectId) {
    tables.game_configuration_records = tables.game_configuration_records.filter(
      (row) => row.projectId !== projectId && row.projectKey !== projectId,
    );
    tables.game_configuration_validation_items = tables.game_configuration_validation_items.filter(
      (row) => row.projectId !== projectId && row.projectKey !== projectId,
    );
    return getSnapshot();
  }

  function resetAll() {
    tables = createEmptyTables();
    return getSnapshot();
  }

  function makeMissingGameDesign() {
    gameDesignRepository.clearGameContext();
    tables = createEmptyTables();
    return getSnapshot();
  }

  function openRequestedProject(projectId) {
    if (projectId) {
      gameDesignRepository.openGameContext(projectId);
    }
  }

  function makeInvalidGameDesign(projectId = "") {
    gameDesignRepository.resetDesignData();
    openRequestedProject(projectId);
    gameDesignRepository.saveDesign({
      gameType: "Puzzle",
    });
    tables = createEmptyTables();
    return getSnapshot();
  }

  function makeValidGameDesign(projectId = "") {
    gameDesignRepository.resetDesignData();
    openRequestedProject(projectId);
    gameDesignRepository.saveDesign({
      designSummary: "A compact puzzle adventure with a clear rules handoff for configuration.",
      gameType: "Puzzle",
      genre: "Adventure",
      playerMode: "1 Player",
      playStyle: "Single Player",
    });
    seedConfigurationForActiveProject();
    return getSnapshot();
  }

  function getTables() {
    return cloneTables(tables);
  }

  function getProjectProgressHandoff() {
    const handoff = getGameDesignHandoff();
    const projectId = handoff.activeProject?.id || "";
    const configuration = projectId ? getConfiguration(projectId) : null;
    const validation = validateConfiguration(projectId, configuration);

    if (!handoff.ready) {
      return {
        currentFocus: "Complete Game Design",
        gameProgress: "Game Configuration blocked until Game Design is ready",
        projectProgress: "Game Configuration blocked until Game Design is ready",
        publishingProgress: "Build Game blocked by missing Game Design handoff",
        readinessStatus: "Blocked",
        recommendedNextTool: "Game Design",
      };
    }

    if (!configuration || validation.findings.length > 0) {
      return {
        currentFocus: "Complete Game Configuration",
        gameProgress: `${handoff.activeProject.name} configuration needs ${validation.findings.length} item${validation.findings.length === 1 ? "" : "s"}`,
        projectProgress: `${handoff.activeProject.name} configuration needs ${validation.findings.length} item${validation.findings.length === 1 ? "" : "s"}`,
        publishingProgress: "Build Game blocked until configuration is ready",
        readinessStatus: validation.status,
        recommendedNextTool: "Game Configuration",
      };
    }

    return {
      currentFocus: "Prepare Assets",
      gameProgress: `${handoff.activeProject.name} Game Configuration ready`,
      projectProgress: `${handoff.activeProject.name} Game Configuration ready`,
      publishingProgress: "Build Game remains blocked until required assets are ready",
      readinessStatus: "Ready",
      recommendedNextTool: "Assets",
    };
  }

  function getSnapshot() {
    const handoff = getGameDesignHandoff();
    const projectId = handoff.activeProject?.id || "";
    const configuration = projectId ? getConfiguration(projectId) : null;
    const validation = validateConfiguration(projectId, configuration);

    return {
      configuration,
      handoff,
      progressHandoff: getProjectProgressHandoff(),
      tables: getTables(),
      validation,
    };
  }

  return {
    createConfiguration,
    getConfiguration,
    getGameDesignHandoff,
    getProjectProgressHandoff,
    getSnapshot,
    getTables,
    makeInvalidGameDesign,
    makeMissingGameDesign,
    makeValidGameDesign,
    resetAll,
    resetConfiguration,
    updateConfiguration,
    validateConfiguration,
  };
}
