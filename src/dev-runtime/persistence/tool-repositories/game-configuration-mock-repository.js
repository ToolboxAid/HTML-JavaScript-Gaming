import { createGameDesignMockRepository } from "./game-design-mock-repository.js";

export const GAME_CONFIGURATION_TABLES = Object.freeze([
  "game_configuration_documents",
  "game_configuration_validation_items"
]);

export const GAME_CONFIGURATION_SECTIONS = Object.freeze([
  "gameBasics",
  "gameRules",
  "playerSetup",
  "worldSetup",
  "objectSetup",
  "audioSetup",
  "testReadiness"
]);

export const GAME_CONFIGURATION_PLAYER_MODES = Object.freeze([
  Object.freeze({
    description: "One active player.",
    label: "1 Player",
    value: "1 Player"
  }),
  Object.freeze({
    description: "Multiple players, one active player receives input at a time.",
    label: "2+ Turn Based",
    value: "2+ Turn Based"
  }),
  Object.freeze({
    description: "Multiple players active at the same time.",
    label: "2+ Concurrent",
    value: "2+ Concurrent"
  })
]);

const SECTION_LABELS = Object.freeze({
  gameBasics: "Game Basics",
  gameRules: "Game Rules",
  playerSetup: "Player Setup",
  worldSetup: "World Setup",
  objectSetup: "Object Setup",
  audioSetup: "Audio Setup",
  testReadiness: "Test Readiness"
});

function cloneRows(rows) {
  return rows.map((row) => ({ ...row }));
}

function cloneTables(tables) {
  return {
    game_configuration_documents: cloneRows(tables.game_configuration_documents),
    game_configuration_validation_items: cloneRows(tables.game_configuration_validation_items)
  };
}

function createEmptyTables() {
  return {
    game_configuration_documents: [],
    game_configuration_validation_items: []
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

function configurationIdForProject(projectId) {
  return `${projectId}-game-configuration`;
}

function createValidationRows(projectId, findings) {
  return findings.map((finding, index) => ({
    id: `${projectId}-configuration-validation-${index + 1}`,
    projectId,
    section: finding.section,
    label: finding.label,
    action: finding.action,
    status: "Missing"
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
    "gameBasics",
    "gameRules",
    "playerSetup",
    "worldSetup",
    "objectSetup",
    "testReadiness"
  ];

  if (designRequiresAudio(handoff)) {
    sections.splice(5, 0, "audioSetup");
  }

  return sections;
}

function createDocument(projectId, handoff, input = {}) {
  const document = {
    id: configurationIdForProject(projectId),
    projectId,
    projectPurpose: handoff.activeProject?.purpose || "",
    gameType: handoff.activeDesign?.gameType || "",
    genre: handoff.activeDesign?.genre || "",
    playStyle: handoff.activeDesign?.playStyle || "",
    playerMode: normalizePlayerMode(input.playerMode),
    gameBasics: normalizeText(input.gameBasics),
    gameRules: normalizeText(input.gameRules),
    playerSetup: normalizeText(input.playerSetup),
    worldSetup: normalizeText(input.worldSetup),
    objectSetup: normalizeText(input.objectSetup),
    audioSetup: normalizeText(input.audioSetup),
    testReadiness: normalizeText(input.testReadiness),
    status: "Under Construction",
    updatedAt: new Date().toISOString()
  };
  const validation = validateDocument(document, handoff);
  document.status = validation.findings.length === 0 ? "Ready" : "Under Construction";
  return document;
}

function validateDocument(document, handoff) {
  const findings = [];

  if (!handoff.ready) {
    findings.push({
      section: "gameDesign",
      label: "Game Design",
      action: "Complete a valid Game Design before editing Game Configuration."
    });
    return {
      findings,
      status: "Blocked"
    };
  }

  requiredSectionsForHandoff(handoff).forEach((section) => {
    if (!normalizeText(document?.[section])) {
      findings.push({
        section,
        label: SECTION_LABELS[section],
        action: `Complete ${SECTION_LABELS[section]} before Build Game readiness.`
      });
    }
  });

  return {
    findings,
    status: findings.length === 0 ? "Ready" : "Needs Input"
  };
}

function createSeededGameDesignRepository() {
  const repository = createGameDesignMockRepository();
  repository.resetDesignData();
  repository.saveDesign({
    designSummary: "A compact puzzle adventure with a clear rules handoff for configuration.",
    gameType: "Puzzle",
    genre: "Adventure",
    playStyle: "Single Player"
  });
  return repository;
}

export function createGameConfigurationMockRepository(options = {}) {
  const gameDesignRepository = options.gameDesignRepository || createSeededGameDesignRepository();
  let tables = createEmptyTables();

  function getGameDesignHandoff() {
    const activeProject = gameDesignRepository.getActiveProject();
    const activeDesign = gameDesignRepository.getActiveDesign();
    const validation = gameDesignRepository.validateDesign(activeDesign || {});
    const ready = Boolean(activeProject && activeDesign && validation.findings.length === 0);

    return {
      activeDesign,
      activeProject,
      ready,
      validation
    };
  }

  function getConfiguration(projectId) {
    return tables.game_configuration_documents.find((document) => document.projectId === projectId) || null;
  }

  function createConfiguration(projectId, input = {}) {
    const handoff = getGameDesignHandoff();
    if (!handoff.ready || handoff.activeProject?.id !== projectId) {
      return null;
    }

    const document = createDocument(projectId, handoff, input);
    tables.game_configuration_documents = tables.game_configuration_documents.filter(
      (row) => row.projectId !== projectId
    );
    tables.game_configuration_documents.push(document);
    replaceValidationRows(projectId, validateConfiguration(projectId, document).findings);
    return document;
  }

  function updateConfiguration(projectId, input = {}) {
    return createConfiguration(projectId, input);
  }

  function replaceValidationRows(projectId, findings) {
    tables.game_configuration_validation_items = tables.game_configuration_validation_items.filter(
      (row) => row.projectId !== projectId
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
    tables.game_configuration_documents = tables.game_configuration_documents.filter(
      (row) => row.projectId !== projectId
    );
    tables.game_configuration_validation_items = tables.game_configuration_validation_items.filter(
      (row) => row.projectId !== projectId
    );
    return getSnapshot();
  }

  function resetAll() {
    tables = createEmptyTables();
    return getSnapshot();
  }

  function makeMissingGameDesign() {
    gameDesignRepository.clearProjectContext();
    tables = createEmptyTables();
    return getSnapshot();
  }

  function openRequestedProject(projectId) {
    if (projectId) {
      gameDesignRepository.openProjectContext(projectId);
    }
  }

  function makeInvalidGameDesign(projectId = "") {
    gameDesignRepository.resetDesignData();
    openRequestedProject(projectId);
    gameDesignRepository.saveDesign({
      gameType: "Puzzle"
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
      playStyle: "Single Player"
    });
    if (!projectId) {
      tables = createEmptyTables();
    }
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
        projectProgress: "Game Configuration blocked until Game Design is ready",
        publishingProgress: "Build Game blocked by missing Game Design handoff",
        recommendedNextTool: "Game Design",
        readinessStatus: "Blocked"
      };
    }

    if (!configuration || validation.findings.length > 0) {
      return {
        currentFocus: "Complete Game Configuration",
        projectProgress: `${handoff.activeProject.name} configuration needs ${validation.findings.length} item${validation.findings.length === 1 ? "" : "s"}`,
        publishingProgress: "Build Game blocked until configuration is ready",
        recommendedNextTool: "Game Configuration",
        readinessStatus: validation.status
      };
    }

    return {
      currentFocus: "Prepare Assets",
      projectProgress: `${handoff.activeProject.name} Game Configuration ready`,
      publishingProgress: "Build Game remains blocked until required assets are ready",
      recommendedNextTool: "Assets",
      readinessStatus: "Ready"
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
      validation
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
    validateConfiguration
  };
}
