import {
  GAME_WORKSPACE_DEFAULT_OWNER_USER_KEY,
  createGameWorkspaceMockRepository,
} from "./game-workspace-mock-repository.js";

export const GAME_DESIGN_TABLES = Object.freeze([
  "game_design_documents",
  "game_design_validation_items",
  "game_design_capability_demos"
]);

export const GAME_DESIGN_GAME_TYPES = Object.freeze([
  "2D Platformer",
  "Arcade Action",
  "Capability Demo",
  "Narrative Adventure",
  "Puzzle",
  "RPG",
  "Sandbox",
  "Simulation",
  "Strategy"
]);

export const GAME_DESIGN_GENRES = Object.freeze([
  "Action",
  "Adventure",
  "Educational",
  "Fantasy",
  "Sci-Fi",
  "Sports",
  "Strategy",
  "Utility"
]);

export const GAME_DESIGN_PLAY_STYLES = Object.freeze([
  "Competitive",
  "Cooperative",
  "Guided Tutorial",
  "Sandbox",
  "Single Player",
  "Turn-Based"
]);

export const GAME_DESIGN_PLAYER_MODES = Object.freeze([
  Object.freeze({
    description: "One active player receives input.",
    label: "1 Player",
    value: "1 Player"
  }),
  Object.freeze({
    description: "Multiple players participate, one active player receives input at a time.",
    label: "2+ Turn Based",
    value: "2+ Turn Based"
  }),
  Object.freeze({
    description: "Multiple players can be active at the same time.",
    label: "2+ Concurrent",
    value: "2+ Concurrent"
  })
]);

const GAME_WORKSPACE_USER_ID = GAME_WORKSPACE_DEFAULT_OWNER_USER_KEY;
const REQUIRED_FIELDS = Object.freeze([
  {
    field: "gameType",
    label: "Game Type",
    action: "Select a game type before configuration handoff."
  },
  {
    field: "genre",
    label: "Genre",
    action: "Select a genre so game discovery and expectations are clear."
  },
  {
    field: "playStyle",
    label: "Play Style",
    action: "Select the play style that best describes the intended experience."
  },
  {
    field: "playerMode",
    label: "Player Mode",
    action: "Select how players participate and receive input."
  },
  {
    field: "designSummary",
    label: "Design Summary",
    action: "Write a short design summary that explains the game promise."
  }
]);

function cloneRows(rows) {
  return rows.map((row) => ({ ...row }));
}

function cloneTables(tables) {
  return {
    game_design_documents: cloneRows(tables.game_design_documents),
    game_design_validation_items: cloneRows(tables.game_design_validation_items),
    game_design_capability_demos: cloneRows(tables.game_design_capability_demos)
  };
}

function normalizeChoice(value, choices) {
  return choices.includes(value) ? value : "";
}

function normalizePlayerMode(value) {
  const normalized = normalizeText(value);
  return GAME_DESIGN_PLAYER_MODES.some((mode) => mode.value === normalized)
    ? normalized
    : "1 Player";
}

function normalizeText(value) {
  return String(value || "").trim();
}

function createEmptyTables() {
  return {
    game_design_documents: [],
    game_design_validation_items: [],
    game_design_capability_demos: []
  };
}

function designIdForGame(gameId) {
  return `${gameId}-game-design`;
}

function createValidationRows(gameId, findings) {
  return findings.map((finding, index) => ({
    id: `${gameId}-validation-${index + 1}`,
    gameId,
    field: finding.field,
    label: finding.label,
    action: finding.action,
    status: "Missing"
  }));
}

function createDesignForGame(game, input = {}) {
  const document = {
    id: designIdForGame(game.id),
    gameId: game.id,
    gamePurpose: game.purpose,
    gameType: normalizeChoice(input.gameType, GAME_DESIGN_GAME_TYPES),
    genre: normalizeChoice(input.genre, GAME_DESIGN_GENRES),
    playStyle: normalizeChoice(input.playStyle, GAME_DESIGN_PLAY_STYLES),
    playerMode: normalizePlayerMode(input.playerMode),
    designSummary: normalizeText(input.designSummary),
    capabilityDemoAuthoring: game.purpose === "Capability Demo" || Boolean(input.capabilityDemoAuthoring),
    capabilityDemoNotes: normalizeText(input.capabilityDemoNotes),
    status: "Under Construction",
    updatedAt: new Date().toISOString()
  };

  const findings = REQUIRED_FIELDS.filter((requirement) => !document[requirement.field]);
  document.status = findings.length === 0 ? "Ready" : "Under Construction";
  return { document, findings };
}

export function createGameDesignMockRepository(options = {}) {
  const gameWorkspaceRepository =
    options.gameWorkspaceRepository || options.projectRepository || createGameWorkspaceMockRepository();
  let tables = createEmptyTables();

  function getActiveGame() {
    return gameWorkspaceRepository.getActiveGame();
  }

  function listGameContexts() {
    return gameWorkspaceRepository
      .listGames({ userId: GAME_WORKSPACE_USER_ID })
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  function listCapabilityDemoGames() {
    return gameWorkspaceRepository
      .listGames({ userId: GAME_WORKSPACE_USER_ID })
      .filter((game) => game.purpose === "Capability Demo")
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  function getActiveDesign() {
    const activeGame = getActiveGame();
    if (!activeGame) {
      return null;
    }

    return tables.game_design_documents.find((document) => document.gameId === activeGame.id) || null;
  }

  function validateDesign(input = {}) {
    const activeGame = getActiveGame();

    if (!activeGame) {
      return {
        status: "Blocked",
        findings: [
          {
            field: "game",
            label: "Game Context",
            action: "Open or seed a Game Workspace game before saving Game Design."
          }
        ]
      };
    }

    const design = {
      gameType: normalizeChoice(input.gameType, GAME_DESIGN_GAME_TYPES),
      genre: normalizeChoice(input.genre, GAME_DESIGN_GENRES),
      playStyle: normalizeChoice(input.playStyle, GAME_DESIGN_PLAY_STYLES),
      playerMode: normalizePlayerMode(input.playerMode),
      designSummary: normalizeText(input.designSummary)
    };
    const findings = REQUIRED_FIELDS.filter((requirement) => !design[requirement.field]);

    return {
      status: findings.length === 0 ? "Ready" : "Needs Input",
      findings
    };
  }

  function replaceValidationRows(gameId, findings) {
    tables.game_design_validation_items = tables.game_design_validation_items.filter(
      (row) => row.gameId !== gameId
    );
    tables.game_design_validation_items.push(...createValidationRows(gameId, findings));
  }

  function replaceCapabilityDemoRow(game, document) {
    tables.game_design_capability_demos = tables.game_design_capability_demos.filter(
      (row) => row.gameId !== game.id
    );

    if (!document.capabilityDemoAuthoring) {
      return;
    }

    tables.game_design_capability_demos.push({
      id: `${game.id}-capability-demo-authoring`,
      gameId: game.id,
      gameName: game.name,
      gamePurpose: game.purpose,
      authoringMode: "Game-owned capability demo",
      status: document.status
    });
  }

  function saveDesign(input = {}) {
    const activeGame = getActiveGame();

    if (!activeGame) {
      return {
        saved: false,
        message: "Open or seed a game before saving Game Design.",
        snapshot: getSnapshot()
      };
    }

    const { document, findings } = createDesignForGame(activeGame, input);
    tables.game_design_documents = tables.game_design_documents.filter(
      (row) => row.gameId !== activeGame.id
    );
    tables.game_design_documents.push(document);
    replaceValidationRows(activeGame.id, findings);
    replaceCapabilityDemoRow(activeGame, document);

    return {
      saved: true,
      message: findings.length === 0
        ? `Saved ${activeGame.name} as ready for Game Design.`
        : `Saved ${activeGame.name} with ${findings.length} missing Game Design requirement${findings.length === 1 ? "" : "s"}.`,
      snapshot: getSnapshot()
    };
  }

  function seedCapabilityDemoDesigns() {
    listCapabilityDemoGames().forEach((game) => {
      const { document, findings } = createDesignForGame(game, {
        capabilityDemoAuthoring: true,
        capabilityDemoNotes: `${game.name} remains a Game Workspace game.`,
        designSummary: `${game.name} demonstrates one planned capability as a game-owned demo.`,
        gameType: "Capability Demo",
        genre: "Utility",
        playStyle: "Guided Tutorial",
        playerMode: "1 Player"
      });
      tables.game_design_documents = tables.game_design_documents.filter(
        (row) => row.gameId !== game.id
      );
      tables.game_design_documents.push(document);
      replaceValidationRows(game.id, findings);
      replaceCapabilityDemoRow(game, document);
    });
  }

  function openGameContext(gameId) {
    const game = gameWorkspaceRepository.openGame(gameId);
    return {
      opened: Boolean(game),
      snapshot: getSnapshot()
    };
  }

  function clearGameContext() {
    gameWorkspaceRepository.clearTestData();
    tables = createEmptyTables();
    return getSnapshot();
  }

  function clearProjectContext() {
    return clearGameContext();
  }

  function resetDesignData() {
    gameWorkspaceRepository.resetGameData();
    tables = createEmptyTables();
    seedCapabilityDemoDesigns();
    return getSnapshot();
  }

  function getTables() {
    return cloneTables(tables);
  }

  function getGameProgressHandoff() {
    const activeGame = getActiveGame();
    const design = getActiveDesign();

    if (!activeGame) {
      return {
        gameProgress: "No active game",
        publishingProgress: "Blocked until Game Workspace has an active game",
        currentFocus: "Open a Game Workspace game",
        recommendedNextTool: "Game Workspace",
        progressChecklist: [
          "Game context: Missing",
          "Game Design document: Blocked",
          "Game Configuration handoff: Blocked"
        ]
      };
    }

    const validation = validateDesign(design || {});
    const ready = validation.findings.length === 0;

    return {
      gameProgress: ready
        ? `${activeGame.name} Game Design ready`
        : `${activeGame.name} Game Design needs ${validation.findings.length} requirement${validation.findings.length === 1 ? "" : "s"}`,
      publishingProgress: ready
        ? "Publish remains blocked until Game Configuration and release gates are ready"
        : "Publish blocked until Game Design requirements are complete",
      currentFocus: ready ? "Review Game Configuration" : "Complete Game Design",
      recommendedNextTool: ready ? "Game Configuration" : "Game Design",
      progressChecklist: [
        `Game purpose: ${activeGame.purpose}`,
        `Game type: ${design?.gameType || "Missing"}`,
        `Genre: ${design?.genre || "Missing"}`,
        `Play style: ${design?.playStyle || "Missing"}`,
        `Player mode: ${design?.playerMode || "Missing"}`,
        `Validation: ${validation.status}`
      ]
    };
  }

  function getSnapshot() {
    return {
      activeDesign: getActiveDesign(),
      activeProject: getActiveGame(),
      activeGame: getActiveGame(),
      capabilityDemoGames: listCapabilityDemoGames(),
      capabilityDemoProjects: listCapabilityDemoGames(),
      progressHandoff: getGameProgressHandoff(),
      tables: getTables()
    };
  }

  resetDesignData();

  return {
    clearGameContext,
    clearProjectContext,
    getActiveDesign,
    getActiveProject: getActiveGame,
    getActiveGame,
    getGameProgressHandoff,
    getSnapshot,
    getTables,
    listCapabilityDemoGames,
    listProjectContexts: listGameContexts,
    listGameContexts,
    openGameContext,
    resetDesignData,
    saveDesign,
    seedCapabilityDemoDesigns,
    validateDesign
  };
}
