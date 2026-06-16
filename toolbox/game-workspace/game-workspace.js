import {
  GAME_WORKSPACE_MEMBER_ROLES,
  GAME_WORKSPACE_GAME_PURPOSES,
  GAME_WORKSPACE_GAME_STATUSES,
  createGameWorkspaceApiRepository,
} from "./game-workspace-api-client.js";
import { getSessionCurrent } from "../../src/engine/api/session-api-client.js";

const repository = createGameWorkspaceApiRepository();

const elements = {
  activeGameName: document.querySelector("[data-active-game-name]"),
  activeGameOwner: document.querySelector("[data-active-game-owner]"),
  activeGamePurpose: document.querySelector("[data-active-game-purpose]"),
  activeGameStatus: document.querySelector("[data-active-game-status]"),
  currentFocus: document.querySelector("[data-current-focus]"),
  currentUserRole: document.querySelector("[data-current-user-role]"),
  currentUserRoleInput: document.querySelector("[data-current-user-role-input]"),
  deleteOpenGame: document.querySelector("[data-game-delete-active]"),
  form: document.querySelector("[data-game-form]"),
  membersTable: document.querySelector("[data-game-members-table]"),
  nameInput: document.querySelector("[data-game-name-input]"),
  progressChecklist: document.querySelector("[data-game-progress-checklist]"),
  gameList: document.querySelector("[data-game-list]"),
  gameProgress: document.querySelector("[data-game-progress]"),
  gameJourneyLink: document.querySelector("[data-game-journey-link]"),
  purposeInput: document.querySelector("[data-game-purpose-input]"),
  gameStatus: document.querySelector("[data-game-status]"),
  gameStatusInput: document.querySelector("[data-game-status-input]"),
  publishingProgress: document.querySelector("[data-publishing-progress]"),
  recommendedNextTool: document.querySelectorAll("[data-recommended-next-tool]"),
  statusLog: document.querySelector("[data-game-workspace-log]"),
  tableCounts: document.querySelector("[data-game-table-counts]"),
};

function setText(element, value) {
  if (element && typeof element.forEach === "function" && !element.nodeType) {
    element.forEach((item) => {
      item.textContent = value;
    });
    return;
  }

  if (element) {
    element.textContent = value;
  }
}

function setStatusLog(message) {
  setText(elements.statusLog, message);
}

function isRecord(value) {
  return Boolean(value && typeof value === "object");
}

function isRepositoryErrorResult(value) {
  return isRecord(value) && value.error === true;
}

function repositoryErrorMessage(value, context) {
  return String(value?.message || value?.error || `${context} failed through the server API contract.`).trim();
}

function reportRepositoryError(value, context) {
  if (isRepositoryErrorResult(value)) {
    setStatusLog(repositoryErrorMessage(value, context));
    return true;
  }
  return false;
}

function activeGameMembers(activeGame) {
  return Array.isArray(activeGame?.members) ? activeGame.members : [];
}

function normalizeActiveGame(value, context = "Active game") {
  if (reportRepositoryError(value, context)) {
    return null;
  }
  if (!value) {
    return null;
  }
  if (!isRecord(value) || !Array.isArray(value.members)) {
    setStatusLog(`${context} response is malformed. Reload Game Workspace after the server API contract is restored.`);
    return null;
  }
  return value;
}

function normalizeProgress(value) {
  if (reportRepositoryError(value, "Game progress")) {
    return {
      gameStatus: "No Game",
      gameProgress: "Blocked by server API error",
      publishingProgress: "Blocked",
      currentFocus: "Resolve the server API diagnostic",
      recommendedNextTool: "Game Workspace",
      progressChecklist: [
        { label: "Restore server API contract", status: "Blocked" },
      ],
    };
  }
  if (!isRecord(value)) {
    setStatusLog("Game progress response is malformed. Reload Game Workspace after the server API contract is restored.");
  }
  return isRecord(value) ? value : {
    gameStatus: "No Game",
    gameProgress: "No active game",
    publishingProgress: "Not started",
    currentFocus: "Create or seed a game",
    recommendedNextTool: "Game Workspace",
    progressChecklist: [],
  };
}

function currentSessionUserKey() {
  try {
    const session = getSessionCurrent();
    return session?.authenticated && session.userKey ? session.userKey : "";
  } catch {
    return "";
  }
}

function populateSelect(select, options) {
  if (!select) {
    return;
  }

  select.replaceChildren();
  options.forEach((option) => {
    const item = document.createElement("option");
    item.value = option;
    item.textContent = option;
    select.append(item);
  });
}

function currentGameUserKey(activeGame) {
  const sessionUserKey = currentSessionUserKey();
  const members = activeGameMembers(activeGame);
  if (sessionUserKey && (!activeGame || members.some((member) => member.userKey === sessionUserKey))) {
    return sessionUserKey;
  }
  return activeGame?.ownerKey || members.find((member) => member.permission === "Owner")?.userKey || "";
}

function currentGameMember(activeGame) {
  const userKey = currentGameUserKey(activeGame);
  return activeGameMembers(activeGame).find((member) => member.userKey === userKey) || null;
}

function createGameButton(game, isActive) {
  const button = document.createElement("button");
  button.className = isActive ? "btn primary" : "btn";
  button.type = "button";
  button.dataset.gameOpen = game.id;
  if (isActive) {
    button.dataset.gameActive = "true";
    button.setAttribute("aria-current", "true");
  }
  button.textContent = isActive ? `Open ${game.name} (Active)` : `Open ${game.name}`;
  return button;
}

function renderGameList() {
  if (!elements.gameList) {
    return;
  }

  const activeGame = normalizeActiveGame(repository.getActiveGame());
  const gameUserKey = currentGameUserKey(activeGame);
  const listResult = repository.listGames(gameUserKey ? { userKey: gameUserKey } : {});
  const games = Array.isArray(listResult) ? listResult : [];
  if (!Array.isArray(listResult) && !reportRepositoryError(listResult, "Game list")) {
    setStatusLog("Game list response is malformed. Reload Game Workspace after the server API contract is restored.");
  }

  elements.gameList.replaceChildren();

  if (games.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "status";
    emptyState.textContent = "No games. Create or seed a game to continue.";
    elements.gameList.append(emptyState);
    return;
  }

  games.forEach((game) => {
    const row = document.createElement("article");
    row.className = "callout";
    row.dataset.gameRow = game.id;

    const title = document.createElement("h4");
    title.textContent = game.name;

    const meta = document.createElement("p");
    meta.className = "eyebrow";
    meta.textContent = `${game.purpose} | ${game.status} | ${game.ownerDisplayName}`;

    const isActive = activeGame?.id === game.id;
    const action = createGameButton(game, isActive);

    row.append(title, meta, action);

    elements.gameList.append(row);
  });
}

function renderMembersTable(activeGame) {
  if (!elements.membersTable) {
    return;
  }

  elements.membersTable.replaceChildren();

  if (!activeGame) {
    const row = document.createElement("tr");
    row.innerHTML = "<td>No game</td><td>-</td><td>-</td><td>-</td>";
    elements.membersTable.append(row);
    return;
  }

  activeGameMembers(activeGame).forEach((member) => {
    const row = document.createElement("tr");
    const name = document.createElement("td");
    const userKey = document.createElement("td");
    const role = document.createElement("td");
    const permission = document.createElement("td");

    name.textContent = member.displayName;
    userKey.textContent = member.userKey;
    role.textContent = member.role;
    permission.textContent = member.permission;

    row.append(name, userKey, role, permission);
    elements.membersTable.append(row);
  });
}

function renderTableCounts() {
  if (!elements.tableCounts) {
    return;
  }

  const tableResult = repository.getTables();
  const tables = isRecord(tableResult) && !isRepositoryErrorResult(tableResult)
    ? tableResult
    : { users: [], games: [], game_members: [] };
  if ((!isRecord(tableResult) || isRepositoryErrorResult(tableResult)) && !reportRepositoryError(tableResult, "Repository tables")) {
    setStatusLog("Repository tables response is malformed. Reload Game Workspace after the server API contract is restored.");
  }
  const rows = [
    ["users", Array.isArray(tables.users) ? tables.users.length : 0],
    ["games", Array.isArray(tables.games) ? tables.games.length : 0],
    ["game_members", Array.isArray(tables.game_members) ? tables.game_members.length : 0],
  ];

  elements.tableCounts.replaceChildren();

  rows.forEach(([tableName, count]) => {
    const row = document.createElement("tr");
    const tableCell = document.createElement("td");
    const countCell = document.createElement("td");

    tableCell.textContent = tableName;
    countCell.textContent = String(count);

    row.append(tableCell, countCell);
    elements.tableCounts.append(row);
  });
}

function renderChecklist(progress) {
  if (!elements.progressChecklist) {
    return;
  }

  elements.progressChecklist.replaceChildren();

  const checklist = Array.isArray(progress?.progressChecklist) ? progress.progressChecklist : [];
  checklist.forEach((item) => {
    const row = document.createElement("li");
    row.textContent = `${item.label}: ${item.status}`;
    elements.progressChecklist.append(row);
  });
}

function renderWorkspace() {
  const activeGame = normalizeActiveGame(repository.getActiveGame());
  const progress = normalizeProgress(repository.getGameProgress());
  const currentMember = currentGameMember(activeGame);

  setText(elements.activeGameName, activeGame?.name || "No game open");
  setText(elements.activeGameOwner, activeGame?.ownerDisplayName || "No owner");
  setText(elements.activeGamePurpose, activeGame?.purpose || "No purpose");
  setText(elements.activeGameStatus, activeGame?.status || "No Game");
  setText(elements.currentUserRole, currentMember?.role || "Viewer");
  setText(elements.gameStatus, progress.gameStatus);
  setText(elements.gameProgress, progress.gameProgress);
  setText(elements.publishingProgress, progress.publishingProgress);
  setText(elements.currentFocus, progress.currentFocus);
  setText(elements.recommendedNextTool, progress.recommendedNextTool);
  if (elements.purposeInput && activeGame?.purpose) {
    elements.purposeInput.value = activeGame.purpose;
  }
  if (elements.gameStatusInput && activeGame?.status) {
    elements.gameStatusInput.value = activeGame.status;
  }
  if (elements.currentUserRoleInput) {
    elements.currentUserRoleInput.value = currentMember?.role || "Viewer";
  }
  if (elements.gameJourneyLink) {
    if (activeGame) {
      elements.gameJourneyLink.href = `toolbox/game-journey/index.html?game=${encodeURIComponent(activeGame.id)}`;
      elements.gameJourneyLink.setAttribute("aria-disabled", "false");
    } else {
      elements.gameJourneyLink.href = "toolbox/game-journey/index.html?game=none";
      elements.gameJourneyLink.setAttribute("aria-disabled", "true");
    }
  }

  renderGameList();
  renderMembersTable(activeGame);
  renderTableCounts();
  renderChecklist(progress);
}

elements.form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const activeGame = normalizeActiveGame(repository.getActiveGame());
  const game = repository.createGame({
    name: elements.nameInput?.value,
    ownerKey: currentGameUserKey(activeGame),
    purpose: elements.purposeInput?.value,
    status: elements.gameStatusInput?.value,
  });

  if (reportRepositoryError(game, "Create Game") || !isRecord(game) || !String(game.name || "").trim()) {
    if (!isRepositoryErrorResult(game)) {
      setStatusLog("Create Game did not return a valid game. Restore the server API contract and try again.");
    }
    renderWorkspace();
    return;
  }

  if (elements.nameInput) {
    elements.nameInput.value = "";
  }

  setStatusLog(`Created and opened ${game.name}.`);
  renderWorkspace();
});

elements.gameList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-game-open]");

  if (!button) {
    return;
  }

  const game = repository.openGame(button.dataset.gameOpen);

  if (game) {
    setStatusLog(`Opened ${game.name}.`);
    renderWorkspace();
  }
});

elements.deleteOpenGame?.addEventListener("click", () => {
  const activeGame = normalizeActiveGame(repository.getActiveGame(), "Delete active game");

  if (!activeGame) {
    setStatusLog("No game is open for deletion.");
    renderWorkspace();
    return;
  }

  repository.deleteGame(activeGame.id);
  setStatusLog(`Deleted ${activeGame.name}.`);
  renderWorkspace();
});

elements.purposeInput?.addEventListener("change", () => {
  const activeGame = normalizeActiveGame(repository.getActiveGame(), "Update game purpose");
  if (!activeGame) {
    return;
  }

  const game = repository.updateGamePurpose(activeGame.id, elements.purposeInput.value);
  setStatusLog(`Updated ${game.name} purpose to ${game.purpose}.`);
  renderWorkspace();
});

elements.gameStatusInput?.addEventListener("change", () => {
  const activeGame = normalizeActiveGame(repository.getActiveGame(), "Update game status");
  if (!activeGame) {
    return;
  }

  const game = repository.updateGameStatus(activeGame.id, elements.gameStatusInput.value);
  setStatusLog(`Updated ${game.name} status to ${game.status}.`);
  renderWorkspace();
});

elements.currentUserRoleInput?.addEventListener("change", () => {
  const activeGame = normalizeActiveGame(repository.getActiveGame(), "Update current user role");
  if (!activeGame) {
    return;
  }

  repository.updateGameMemberRole(activeGame.id, currentGameUserKey(activeGame), elements.currentUserRoleInput.value);
  setStatusLog(`Updated current user role to ${elements.currentUserRoleInput.value}.`);
  renderWorkspace();
});

populateSelect(elements.purposeInput, GAME_WORKSPACE_GAME_PURPOSES);
populateSelect(elements.gameStatusInput, GAME_WORKSPACE_GAME_STATUSES);
populateSelect(elements.currentUserRoleInput, GAME_WORKSPACE_MEMBER_ROLES);
reportRepositoryError(repository.resetGameData(), "Reset Game Workspace data");
renderWorkspace();
