import {
  GAME_WORKSPACE_MEMBER_ROLES,
  GAME_WORKSPACE_GAME_PURPOSES,
  GAME_WORKSPACE_GAME_STATUSES,
  createGameWorkspaceApiRepository,
} from "./game-workspace-api-client.js";
import { getSessionCurrent } from "../../src/engine/api/session-api-client.js";

const repository = createGameWorkspaceApiRepository();
repository.resetGameData();

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

function currentGameUserId(activeGame) {
  const sessionUserKey = currentSessionUserKey();
  if (sessionUserKey && (!activeGame || activeGame.members.some((member) => member.userId === sessionUserKey))) {
    return sessionUserKey;
  }
  return activeGame?.ownerUserId || activeGame?.members.find((member) => member.permission === "Owner")?.userId || "";
}

function currentGameMember(activeGame) {
  const userId = currentGameUserId(activeGame);
  return activeGame?.members.find((member) => member.userId === userId) || null;
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

  const activeGame = repository.getActiveGame();
  const gameUserId = currentGameUserId(activeGame);
  const games = repository.listGames(gameUserId ? { userId: gameUserId } : {});

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

  activeGame.members.forEach((member) => {
    const row = document.createElement("tr");
    const name = document.createElement("td");
    const userId = document.createElement("td");
    const role = document.createElement("td");
    const permission = document.createElement("td");

    name.textContent = member.displayName;
    userId.textContent = member.userId;
    role.textContent = member.role;
    permission.textContent = member.permission;

    row.append(name, userId, role, permission);
    elements.membersTable.append(row);
  });
}

function renderTableCounts() {
  if (!elements.tableCounts) {
    return;
  }

  const tables = repository.getTables();
  const rows = [
    ["users", tables.users.length],
    ["games", tables.games.length],
    ["game_members", tables.game_members.length],
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

  progress.progressChecklist.forEach((item) => {
    const row = document.createElement("li");
    row.textContent = `${item.label}: ${item.status}`;
    elements.progressChecklist.append(row);
  });
}

function renderWorkspace() {
  const activeGame = repository.getActiveGame();
  const progress = repository.getGameProgress();
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
  const game = repository.createGame({
    name: elements.nameInput?.value,
    ownerUserId: currentGameUserId(repository.getActiveGame()),
    purpose: elements.purposeInput?.value,
    status: elements.gameStatusInput?.value,
  });

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
  const activeGame = repository.getActiveGame();

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
  const activeGame = repository.getActiveGame();
  if (!activeGame) {
    return;
  }

  const game = repository.updateGamePurpose(activeGame.id, elements.purposeInput.value);
  setStatusLog(`Updated ${game.name} purpose to ${game.purpose}.`);
  renderWorkspace();
});

elements.gameStatusInput?.addEventListener("change", () => {
  const activeGame = repository.getActiveGame();
  if (!activeGame) {
    return;
  }

  const game = repository.updateGameStatus(activeGame.id, elements.gameStatusInput.value);
  setStatusLog(`Updated ${game.name} status to ${game.status}.`);
  renderWorkspace();
});

elements.currentUserRoleInput?.addEventListener("change", () => {
  const activeGame = repository.getActiveGame();
  if (!activeGame) {
    return;
  }

  repository.updateGameMemberRole(activeGame.id, currentGameUserId(activeGame), elements.currentUserRoleInput.value);
  setStatusLog(`Updated current user role to ${elements.currentUserRoleInput.value}.`);
  renderWorkspace();
});

populateSelect(elements.purposeInput, GAME_WORKSPACE_GAME_PURPOSES);
populateSelect(elements.gameStatusInput, GAME_WORKSPACE_GAME_STATUSES);
populateSelect(elements.currentUserRoleInput, GAME_WORKSPACE_MEMBER_ROLES);
renderWorkspace();
