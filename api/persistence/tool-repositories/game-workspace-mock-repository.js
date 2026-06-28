import { MOCK_DB_KEYS } from "../mock-db-store.js";

export const GAME_WORKSPACE_DEFAULT_OWNER_USER_KEY = MOCK_DB_KEYS.users.user1;
export const GAME_WORKSPACE_ADMIN_USER_KEY = MOCK_DB_KEYS.users.admin;
export const GAME_WORKSPACE_VIEWER_USER_KEY = MOCK_DB_KEYS.users.user3;

const SEED_USERS = Object.freeze([
  {
    key: GAME_WORKSPACE_ADMIN_USER_KEY,
    displayName: "DavidQ",
    email: "admin@example.test",
    role: "Admin",
  },
  {
    key: GAME_WORKSPACE_DEFAULT_OWNER_USER_KEY,
    displayName: "User 1",
    email: "creator@example.test",
    role: "Creator",
  },
  {
    key: GAME_WORKSPACE_VIEWER_USER_KEY,
    displayName: "User 3",
    email: "guest@example.test",
    role: "Guest",
  },
]);

const DEMO_GAME = Object.freeze({
  id: "demo-game",
  ownerKey: GAME_WORKSPACE_DEFAULT_OWNER_USER_KEY,
  name: "Demo Game",
  purpose: "Game",
  status: "Under Construction",
});

const CAPABILITY_DEMO_GAMES = Object.freeze([
  {
    id: "gravity-demo",
    ownerKey: GAME_WORKSPACE_DEFAULT_OWNER_USER_KEY,
    name: "Gravity Demo",
    purpose: "Capability Demo",
    status: "Wireframe",
  },
  {
    id: "collision-demo",
    ownerKey: GAME_WORKSPACE_DEFAULT_OWNER_USER_KEY,
    name: "Collision Demo",
    purpose: "Capability Demo",
    status: "Wireframe",
  },
  {
    id: "camera-follow-demo",
    ownerKey: GAME_WORKSPACE_DEFAULT_OWNER_USER_KEY,
    name: "Camera Follow Demo",
    purpose: "Capability Demo",
    status: "Wireframe",
  },
]);

const DEMO_GAME_MEMBERS = Object.freeze([
  {
    gameId: "demo-game",
    userKey: GAME_WORKSPACE_DEFAULT_OWNER_USER_KEY,
    permission: "Owner",
    role: "Owner",
  },
  {
    gameId: "demo-game",
    userKey: GAME_WORKSPACE_ADMIN_USER_KEY,
    permission: "Admin",
    role: "Owner",
  },
  {
    gameId: "demo-game",
    userKey: GAME_WORKSPACE_VIEWER_USER_KEY,
    permission: "Viewer",
    role: "Viewer",
  },
]);

const CAPABILITY_DEMO_GAME_MEMBERS = Object.freeze(
  CAPABILITY_DEMO_GAMES.flatMap((game) => [
    {
      gameId: game.id,
      userKey: GAME_WORKSPACE_DEFAULT_OWNER_USER_KEY,
      permission: "Owner",
      role: "Owner",
    },
    {
      gameId: game.id,
      userKey: GAME_WORKSPACE_ADMIN_USER_KEY,
      permission: "Admin",
      role: "Owner",
    },
    {
      gameId: game.id,
      userKey: GAME_WORKSPACE_VIEWER_USER_KEY,
      permission: "Viewer",
      role: "Viewer",
    },
  ]),
);

const SEED_GAMES = Object.freeze([
  DEMO_GAME,
  ...CAPABILITY_DEMO_GAMES,
]);

const SEED_GAME_MEMBERS = Object.freeze([
  ...DEMO_GAME_MEMBERS,
  ...CAPABILITY_DEMO_GAME_MEMBERS,
]);

export const GAME_WORKSPACE_GAME_PURPOSES = Object.freeze([
  "Game",
  "Capability Demo",
  "Learning Game",
  "Template Game",
]);

export const GAME_WORKSPACE_GAME_STATUSES = Object.freeze([
  "Planning",
  "Under Construction",
  "Ready for Testing",
  "Ready for Publish",
]);

export const GAME_WORKSPACE_MEMBER_ROLES = Object.freeze([
  "Owner",
  "Designer",
  "World Builder",
  "Artist",
  "Audio Creator",
  "Translator",
  "Tester",
  "Publisher",
  "Viewer",
]);

export const GAME_WORKSPACE_TABLES = Object.freeze([
  "users",
  "games",
  "game_members",
]);

export const GAME_WORKSPACE_PERMISSIONS = Object.freeze([
  "Owner",
  "Editor",
  "Viewer",
  "Admin",
]);

export const GAME_WORKSPACE_SCHEMA = Object.freeze({
  users: Object.freeze(["key", "displayName", "email", "role"]),
  games: Object.freeze(["id", "ownerKey", "name", "purpose", "status"]),
  game_members: Object.freeze(["gameId", "userKey", "permission", "role"]),
});

function normalizeSourceIdea(sourceIdea) {
  if (!sourceIdea || typeof sourceIdea !== "object") {
    return null;
  }

  const idea = String(sourceIdea.idea || "").trim();
  const pitch = String(sourceIdea.pitch || "").trim();
  const notes = Array.isArray(sourceIdea.notes)
    ? sourceIdea.notes.map((note) => String(note || "").trim()).filter(Boolean)
    : [];

  if (!idea && !pitch && !notes.length) {
    return null;
  }

  return { idea, pitch, notes };
}

function cloneRow(row) {
  const cloned = { ...row };
  const sourceIdea = normalizeSourceIdea(row.sourceIdea);
  if (sourceIdea) {
    cloned.sourceIdea = sourceIdea;
  } else {
    delete cloned.sourceIdea;
  }
  return cloned;
}

function cloneRows(rows) {
  return rows.map(cloneRow);
}

function cloneTables(tables) {
  return {
    users: cloneRows(tables.users),
    games: cloneRows(tables.games),
    game_members: cloneRows(tables.game_members),
  };
}

function slugifyGameName(name) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "game";
}

function createSeedTables() {
  return {
    users: cloneRows(SEED_USERS),
    games: cloneRows(SEED_GAMES),
    game_members: cloneRows(SEED_GAME_MEMBERS),
  };
}

export function createGameWorkspaceMockRepository() {
  let tables = createSeedTables();
  let activeGameId = DEMO_GAME.id;
  let gameCounter = 1;

  function getUserByKey(userKey) {
    return tables.users.find((user) => user.key === userKey) || null;
  }

  function getGameById(gameId) {
    return tables.games.find((game) => game.id === gameId) || null;
  }

  function ensureSeedUsers() {
    SEED_USERS.forEach((seedUser) => {
      if (!getUserByKey(seedUser.key)) {
        tables.users.push({ ...seedUser });
      }
    });
  }

  function getGameMembers(gameId) {
    return tables.game_members
      .filter((member) => member.gameId === gameId)
      .map((member) => ({
        ...member,
        permission: member.permission || member.role || "Viewer",
        role: member.role || member.permission || "Viewer",
        displayName: getUserByKey(member.userKey)?.displayName || member.userKey,
      }));
  }

  function describeGame(game) {
    if (!game) {
      return null;
    }

    const owner = getUserByKey(game.ownerKey);

    return {
      ...game,
      purpose: game.purpose || "Game",
      sourceIdea: normalizeSourceIdea(game.sourceIdea),
      ownerDisplayName: owner?.displayName || game.ownerKey,
      members: getGameMembers(game.id),
    };
  }

  function getTables() {
    return cloneTables(tables);
  }

  function listGames(options = {}) {
    const { userKey } = options;

    if (!userKey) {
      return tables.games.map(describeGame);
    }

    const gameIds = new Set(
      tables.game_members
        .filter((member) => member.userKey === userKey)
        .map((member) => member.gameId),
    );

    return tables.games
      .filter((game) => gameIds.has(game.id))
      .map(describeGame);
  }

  function getActiveGame() {
    return describeGame(getGameById(activeGameId));
  }

  function getGameProgress(gameId = activeGameId) {
    const game = getGameById(gameId);

    if (!game) {
      return {
        gameStatus: "No Game",
        gameProgress: "No active game",
        publishingProgress: "Not started",
        currentFocus: "Create or seed a game",
        recommendedNextTool: "Game Hub",
        requiredForTestable: false,
        requiredForPublish: false,
        progressChecklist: [
          { label: "Create game identity", status: "Ready" },
          { label: "Configure game details", status: "Planned" },
          { label: "Prepare publish requirements", status: "Planned" },
        ],
      };
    }

    return {
      gameStatus: game.status,
      gameProgress: `${game.name} identity ready`,
      publishingProgress: "Publish blocked until configuration and required assets are ready",
      currentFocus: "Complete Game Configuration",
      recommendedNextTool: "Game Configuration",
      requiredForTestable: true,
      requiredForPublish: true,
      progressChecklist: [
        { label: "Game identity", status: "Complete" },
        { label: "Game configuration", status: "Under Construction" },
        { label: "Playable build", status: "Planned" },
        { label: "Publishing review", status: "Planned" },
      ],
    };
  }

  function getSnapshot() {
    return {
      tables: getTables(),
      activeGame: getActiveGame(),
      progress: getGameProgress(),
    };
  }

  function resetGameData() {
    tables = createSeedTables();
    activeGameId = DEMO_GAME.id;
    gameCounter = 1;
    return getSnapshot();
  }

  function seedDemoGame() {
    ensureSeedUsers();

    SEED_GAMES.forEach((seedGame) => {
      if (!getGameById(seedGame.id)) {
        tables.games.push({ ...seedGame });
      }
    });

    SEED_GAME_MEMBERS.forEach((seedMember) => {
      const exists = tables.game_members.some(
        (member) =>
          member.gameId === seedMember.gameId &&
          member.userKey === seedMember.userKey,
      );

      if (!exists) {
        tables.game_members.push({ ...seedMember });
      }
    });

    activeGameId = DEMO_GAME.id;
    return getSnapshot();
  }

  function clearTestData() {
    tables = {
      users: cloneRows(SEED_USERS),
      games: [],
      game_members: [],
    };
    activeGameId = null;
    return getSnapshot();
  }

  function createGame(input = {}) {
    ensureSeedUsers();

    const name = String(input.name || "").trim() || "Untitled Game";
    const ownerKey = input.ownerKey || GAME_WORKSPACE_DEFAULT_OWNER_USER_KEY;
    const purpose = GAME_WORKSPACE_GAME_PURPOSES.includes(input.purpose)
      ? input.purpose
      : "Game";
    const baseId = slugifyGameName(name);
    let candidateId = `${baseId}-${gameCounter}`;
    gameCounter += 1;

    while (getGameById(candidateId)) {
      candidateId = `${baseId}-${gameCounter}`;
      gameCounter += 1;
    }

    const status = GAME_WORKSPACE_GAME_STATUSES.includes(input.status)
      ? input.status
      : "Under Construction";

    const game = {
      id: candidateId,
      ownerKey,
      name,
      purpose,
      status,
    };
    const sourceIdea = normalizeSourceIdea(input.sourceIdea);
    if (sourceIdea) {
      game.sourceIdea = sourceIdea;
    }

    tables.games.push(game);
    tables.game_members.push({
      gameId: game.id,
      userKey: ownerKey,
      permission: "Owner",
      role: "Owner",
    });

    activeGameId = game.id;
    return describeGame(game);
  }

  function updateGamePurpose(gameId, purpose) {
    const game = getGameById(gameId);

    if (!game || !GAME_WORKSPACE_GAME_PURPOSES.includes(purpose)) {
      return describeGame(game);
    }

    game.purpose = purpose;
    return describeGame(game);
  }

  function updateGameStatus(gameId, status) {
    const game = getGameById(gameId);

    if (!game || !GAME_WORKSPACE_GAME_STATUSES.includes(status)) {
      return describeGame(game);
    }

    game.status = status;
    return describeGame(game);
  }

  function updateGameMemberRole(gameId, userKey, role) {
    if (!GAME_WORKSPACE_MEMBER_ROLES.includes(role)) {
      return getSnapshot();
    }

    const member = tables.game_members.find(
      (item) => item.gameId === gameId && item.userKey === userKey,
    );

    if (member) {
      member.role = role;
      if (!member.permission) {
        member.permission = role === "Owner" ? "Owner" : role === "Viewer" ? "Viewer" : "Editor";
      }
    }

    return getSnapshot();
  }

  function openGame(gameId) {
    const game = getGameById(gameId);

    if (!game) {
      return null;
    }

    activeGameId = game.id;
    return describeGame(game);
  }

  function deleteGame(gameId) {
    const game = getGameById(gameId);

    if (!game) {
      return getSnapshot();
    }

    tables.games = tables.games.filter((item) => item.id !== game.id);
    tables.game_members = tables.game_members.filter(
      (member) => member.gameId !== game.id,
    );

    if (activeGameId === game.id) {
      activeGameId = tables.games[0]?.id || null;
    }

    return getSnapshot();
  }

  return {
    createGame,
    deleteGame,
    getActiveGame,
    getGameProgress,
    getSnapshot,
    getTables,
    listGames,
    openGame,
    resetGameData,
    seedDemoGame,
    clearTestData,
    updateGameMemberRole,
    updateGamePurpose,
    updateGameStatus,
  };
}
