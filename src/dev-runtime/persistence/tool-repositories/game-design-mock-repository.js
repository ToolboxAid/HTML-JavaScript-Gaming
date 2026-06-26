import {
  GAME_WORKSPACE_DEFAULT_OWNER_USER_KEY,
  createGameWorkspaceMockRepository,
} from "./game-workspace-mock-repository.js";
import { makeSeedUlid } from "../../seed/seed-db-keys.mjs";

export const GAME_DESIGN_TABLES = Object.freeze([
  "game_design_documents",
  "game_design_validation_items",
  "game_design_sections",
  "game_design_capability_demos",
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
  "Strategy",
]);

export const GAME_DESIGN_GENRES = Object.freeze([
  "Action",
  "Adventure",
  "Educational",
  "Fantasy",
  "Sci-Fi",
  "Sports",
  "Strategy",
  "Utility",
]);

export const GAME_DESIGN_PLAY_STYLES = Object.freeze([
  "Competitive",
  "Cooperative",
  "Guided Tutorial",
  "Sandbox",
  "Single Player",
  "Turn-Based",
]);

export const GAME_DESIGN_PLAYER_MODES = Object.freeze([
  Object.freeze({
    description: "One active player receives input.",
    label: "1 Player",
    value: "1 Player",
  }),
  Object.freeze({
    description: "Multiple players participate, one active player receives input at a time.",
    label: "2+ Turn Based",
    value: "2+ Turn Based",
  }),
  Object.freeze({
    description: "Multiple players can be active at the same time.",
    label: "2+ Concurrent",
    value: "2+ Concurrent",
  }),
]);

const GAME_WORKSPACE_USER_KEY = GAME_WORKSPACE_DEFAULT_OWNER_USER_KEY;
const DESIGN_FIELD_DEFINITIONS = Object.freeze([
  Object.freeze({
    action: "Write a short summary that explains the game promise.",
    field: "summary",
    label: "Summary",
    sectionKey: "summary",
  }),
  Object.freeze({
    action: "Describe the story or situation players enter.",
    field: "story",
    label: "Story",
    sectionKey: "story",
  }),
  Object.freeze({
    action: "Describe what players repeatedly do during play.",
    field: "coreLoop",
    label: "Core Loop",
    sectionKey: "core-loop",
  }),
  Object.freeze({
    action: "Describe how players win.",
    field: "winCondition",
    label: "Win Condition",
    sectionKey: "win-condition",
  }),
  Object.freeze({
    action: "Describe how players lose or fail.",
    field: "loseCondition",
    label: "Lose Condition",
    sectionKey: "lose-condition",
  }),
  Object.freeze({
    action: "Describe the intended players or audience.",
    field: "targetAudience",
    label: "Target Audience",
    sectionKey: "target-audience",
  }),
]);

const REQUIRED_FIELDS = Object.freeze([
  {
    action: "Select a game type before configuration handoff.",
    field: "gameType",
    label: "Game Type",
  },
  {
    action: "Select a genre so game discovery and expectations are clear.",
    field: "genre",
    label: "Genre",
  },
  {
    action: "Select the play style that best describes the intended experience.",
    field: "playStyle",
    label: "Play Style",
  },
  {
    action: "Select how players participate and receive input.",
    field: "playerMode",
    label: "Player Mode",
  },
  ...DESIGN_FIELD_DEFINITIONS,
]);

function cloneRows(rows) {
  return rows.map((row) => ({ ...row }));
}

function cloneTables(tables) {
  return {
    game_design_documents: cloneRows(tables.game_design_documents),
    game_design_validation_items: cloneRows(tables.game_design_validation_items),
    game_design_sections: cloneRows(tables.game_design_sections),
    game_design_capability_demos: cloneRows(tables.game_design_capability_demos),
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

function auditFields(index = 0, userKey = GAME_WORKSPACE_DEFAULT_OWNER_USER_KEY) {
  const timestamp = new Date(Date.UTC(2026, 0, 1, 13, index, 0)).toISOString();
  return {
    createdAt: timestamp,
    createdBy: userKey,
    updatedAt: timestamp,
    updatedBy: userKey,
  };
}

function createEmptyTables() {
  return {
    game_design_documents: [],
    game_design_validation_items: [],
    game_design_sections: [],
    game_design_capability_demos: [],
  };
}

function hashKeySource(value) {
  return Array.from(String(value || "")).reduce((hash, character) => (
    ((hash * 31) + character.charCodeAt(0)) >>> 0
  ), 0) % 100000;
}

function keySequenceForGame(base, gameId, index = 0) {
  return base + (hashKeySource(gameId) * 100) + index;
}

function designKeyForGame(gameId) {
  return makeSeedUlid(keySequenceForGame(8_400_000_000, gameId));
}

function sectionKeyForGame(gameId, index) {
  return makeSeedUlid(keySequenceForGame(8_500_000_000, gameId, index));
}

function validationKeyForGame(gameId, index) {
  return makeSeedUlid(keySequenceForGame(8_600_000_000, gameId, index));
}

function capabilityKeyForGame(gameId) {
  return makeSeedUlid(keySequenceForGame(8_700_000_000, gameId));
}

function designIdForGame(gameId) {
  return `${gameId}-game-design`;
}

function normalizeDesignInput(input = {}) {
  const summary = normalizeText(input.summary || input.designSummary);
  return {
    capabilityDemoAuthoring: Boolean(input.capabilityDemoAuthoring),
    capabilityDemoNotes: normalizeText(input.capabilityDemoNotes),
    coreLoop: normalizeText(input.coreLoop),
    designNotes: normalizeText(input.designNotes || input.notes),
    designSummary: summary,
    gameType: normalizeChoice(input.gameType, GAME_DESIGN_GAME_TYPES),
    genre: normalizeChoice(input.genre, GAME_DESIGN_GENRES),
    loseCondition: normalizeText(input.loseCondition),
    playerMode: normalizePlayerMode(input.playerMode),
    playStyle: normalizeChoice(input.playStyle, GAME_DESIGN_PLAY_STYLES),
    story: normalizeText(input.story),
    summary,
    targetAudience: normalizeText(input.targetAudience),
    winCondition: normalizeText(input.winCondition),
  };
}

function createValidationRows(gameId, findings) {
  return findings.map((finding, index) => ({
    key: validationKeyForGame(gameId, index),
    gameKey: gameId,
    gameId,
    field: finding.field,
    label: finding.label,
    action: finding.action,
    status: "Missing",
    ...auditFields(index + 20),
  }));
}

function createSectionRows(game, document) {
  return [
    ...DESIGN_FIELD_DEFINITIONS.map((definition, index) => ({
      key: sectionKeyForGame(game.id, index),
      gameKey: game.id,
      gameId: game.id,
      documentKey: document.key,
      sectionKey: definition.sectionKey,
      heading: definition.label,
      body: document[definition.field],
      sortOrder: index + 1,
      ...auditFields(index + 40, game.ownerKey),
    })),
    {
      key: sectionKeyForGame(game.id, 90),
      gameKey: game.id,
      gameId: game.id,
      documentKey: document.key,
      sectionKey: "design-notes",
      heading: "Design Notes",
      body: document.designNotes,
      sortOrder: 99,
      ...auditFields(90, game.ownerKey),
    },
  ];
}

function createDesignForGame(game, input = {}) {
  const normalized = normalizeDesignInput(input);
  const document = {
    key: designKeyForGame(game.id),
    id: designIdForGame(game.id),
    gameKey: game.id,
    gameId: game.id,
    gamePurpose: game.purpose,
    title: `${game.name} design`,
    gameType: normalized.gameType,
    genre: normalized.genre,
    playStyle: normalized.playStyle,
    playerMode: normalized.playerMode,
    summary: normalized.summary,
    designSummary: normalized.summary,
    story: normalized.story,
    coreLoop: normalized.coreLoop,
    winCondition: normalized.winCondition,
    loseCondition: normalized.loseCondition,
    targetAudience: normalized.targetAudience,
    designNotes: normalized.designNotes,
    capabilityDemoAuthoring: game.purpose === "Capability Demo" || normalized.capabilityDemoAuthoring,
    capabilityDemoNotes: normalized.capabilityDemoNotes,
    status: "Under Construction",
    ...auditFields(0, game.ownerKey),
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
      .listGames({ userKey: GAME_WORKSPACE_USER_KEY })
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  function listCapabilityDemoGames() {
    return gameWorkspaceRepository
      .listGames({ userKey: GAME_WORKSPACE_USER_KEY })
      .filter((game) => game.purpose === "Capability Demo")
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  function getActiveDesign() {
    const activeGame = getActiveGame();
    if (!activeGame) {
      return null;
    }

    return tables.game_design_documents.find((document) => (
      document.gameId === activeGame.id || document.gameKey === activeGame.id
    )) || null;
  }

  function validateDesign(input = {}) {
    const activeGame = getActiveGame();

    if (!activeGame) {
      return {
        findings: [
          {
            action: "Open or seed a Game Hub game before saving Game Design.",
            field: "game",
            label: "Game Context",
          },
        ],
        status: "Blocked",
      };
    }

    const design = normalizeDesignInput(input);
    const findings = REQUIRED_FIELDS.filter((requirement) => !design[requirement.field]);

    return {
      findings,
      status: findings.length === 0 ? "Ready" : "Needs Input",
    };
  }

  function replaceValidationRows(gameId, findings) {
    tables.game_design_validation_items = tables.game_design_validation_items.filter(
      (row) => row.gameId !== gameId && row.gameKey !== gameId,
    );
    tables.game_design_validation_items.push(...createValidationRows(gameId, findings));
  }

  function replaceSectionRows(game, document) {
    tables.game_design_sections = tables.game_design_sections.filter(
      (row) => row.gameId !== game.id && row.gameKey !== game.id,
    );
    tables.game_design_sections.push(...createSectionRows(game, document));
  }

  function replaceCapabilityDemoRow(game, document) {
    tables.game_design_capability_demos = tables.game_design_capability_demos.filter(
      (row) => row.gameId !== game.id && row.gameKey !== game.id,
    );

    if (!document.capabilityDemoAuthoring) {
      return;
    }

    tables.game_design_capability_demos.push({
      key: capabilityKeyForGame(game.id),
      gameKey: game.id,
      gameId: game.id,
      gameName: game.name,
      gamePurpose: game.purpose,
      authoringMode: "Game-owned capability demo",
      status: document.status,
      ...auditFields(80, game.ownerKey),
    });
  }

  function saveDesign(input = {}) {
    const activeGame = getActiveGame();

    if (!activeGame) {
      return {
        message: "Open or seed a game before saving Game Design.",
        saved: false,
        snapshot: getSnapshot(),
      };
    }

    const { document, findings } = createDesignForGame(activeGame, input);
    tables.game_design_documents = tables.game_design_documents.filter(
      (row) => row.gameId !== activeGame.id && row.gameKey !== activeGame.id,
    );
    tables.game_design_documents.push(document);
    replaceValidationRows(activeGame.id, findings);
    replaceSectionRows(activeGame, document);
    replaceCapabilityDemoRow(activeGame, document);

    return {
      message: findings.length === 0
        ? `Saved ${activeGame.name} as ready for Game Design.`
        : `Saved ${activeGame.name} with ${findings.length} missing Game Design requirement${findings.length === 1 ? "" : "s"}.`,
      saved: true,
      snapshot: getSnapshot(),
    };
  }

  function seedCapabilityDemoDesigns() {
    listCapabilityDemoGames().forEach((game) => {
      const { document, findings } = createDesignForGame(game, {
        capabilityDemoAuthoring: true,
        capabilityDemoNotes: `${game.name} remains a Game Hub game.`,
        coreLoop: "Try the featured capability, observe feedback, and restart quickly.",
        designNotes: "Capability demo authoring remains game-owned.",
        gameType: "Capability Demo",
        genre: "Utility",
        loseCondition: "The demo ends when the capability cannot complete its expected feedback.",
        playStyle: "Guided Tutorial",
        playerMode: "1 Player",
        story: `${game.name} teaches one focused capability.`,
        summary: `${game.name} demonstrates one planned capability as a game-owned demo.`,
        targetAudience: "Creators validating a single game capability.",
        winCondition: "The player completes the guided capability interaction.",
      });
      tables.game_design_documents = tables.game_design_documents.filter(
        (row) => row.gameId !== game.id && row.gameKey !== game.id,
      );
      tables.game_design_documents.push(document);
      replaceValidationRows(game.id, findings);
      replaceSectionRows(game, document);
      replaceCapabilityDemoRow(game, document);
    });
  }

  function seedActiveGameDesign() {
    const game = getActiveGame();
    if (!game) {
      return;
    }
    const { document, findings } = createDesignForGame(game, {
      coreLoop: "Explore a compact room, solve a tile puzzle, and unlock the next shelf.",
      designNotes: "Seeded Game Design data stays scoped to the current Game Hub game.",
      gameType: "Puzzle",
      genre: "Adventure",
      loseCondition: "The room resets after too many missed moves.",
      playStyle: "Single Player",
      playerMode: "1 Player",
      story: "A curious maker enters a clockwork library.",
      summary: "A compact puzzle adventure with one clear game promise.",
      targetAudience: "Puzzle fans and first-time creators.",
      winCondition: "Restore the library clock before the final bell.",
    });
    tables.game_design_documents = tables.game_design_documents.filter(
      (row) => row.gameId !== game.id && row.gameKey !== game.id,
    );
    tables.game_design_documents.push(document);
    replaceValidationRows(game.id, findings);
    replaceSectionRows(game, document);
    replaceCapabilityDemoRow(game, document);
  }

  function openGameContext(gameId) {
    const game = gameWorkspaceRepository.openGame(gameId);
    return {
      opened: Boolean(game),
      snapshot: getSnapshot(),
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
    seedActiveGameDesign();
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
        currentFocus: "Open a Game Hub game",
        gameProgress: "No active game",
        progressChecklist: [
          "Game context: Missing",
          "Game Design document: Blocked",
          "Game Configuration handoff: Blocked",
        ],
        publishingProgress: "Blocked until Game Hub has an active game",
        recommendedNextTool: "Game Hub",
      };
    }

    const validation = validateDesign(design || {});
    const ready = validation.findings.length === 0;

    return {
      currentFocus: ready ? "Review Game Configuration" : "Complete Game Design",
      gameProgress: ready
        ? `${activeGame.name} Game Design ready`
        : `${activeGame.name} Game Design needs ${validation.findings.length} requirement${validation.findings.length === 1 ? "" : "s"}`,
      progressChecklist: [
        `Game purpose: ${activeGame.purpose}`,
        `Game type: ${design?.gameType || "Missing"}`,
        `Genre: ${design?.genre || "Missing"}`,
        `Play style: ${design?.playStyle || "Missing"}`,
        `Player mode: ${design?.playerMode || "Missing"}`,
        `Summary: ${design?.summary || "Missing"}`,
        `Core loop: ${design?.coreLoop || "Missing"}`,
        `Validation: ${validation.status}`,
      ],
      publishingProgress: ready
        ? "Publish remains blocked until Game Configuration and release gates are ready"
        : "Publish blocked until Game Design requirements are complete",
      recommendedNextTool: ready ? "Game Configuration" : "Game Design",
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
      tables: getTables(),
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
    validateDesign,
  };
}
