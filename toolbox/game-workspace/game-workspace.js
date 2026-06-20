import {
  GAME_WORKSPACE_MEMBER_ROLES,
  GAME_WORKSPACE_GAME_PURPOSES,
  GAME_WORKSPACE_GAME_STATUSES,
  createGameWorkspaceApiRepository,
} from "./game-workspace-api-client.js";
import { getSessionCurrent } from "../../src/api/session-api-client.js";

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
  projectRecordStatus: document.querySelector("[data-project-record-status]"),
  projectRecordsTable: document.querySelector("[data-project-records-table]"),
  purposeInput: document.querySelector("[data-game-purpose-input]"),
  sourceIdeaDisplay: document.querySelector("[data-source-idea-display]"),
  sourceIdeaName: document.querySelector("[data-source-idea-name]"),
  sourceIdeaNotes: document.querySelector("[data-source-idea-notes]"),
  sourceIdeaPitch: document.querySelector("[data-source-idea-pitch]"),
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
  return `${context} is temporarily unavailable. Refresh the page or try again shortly.`;
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
    setStatusLog(`${context} is temporarily unavailable. Refresh the page or try again shortly.`);
    return null;
  }
  return value;
}

function normalizeProgress(value) {
  if (reportRepositoryError(value, "Game progress")) {
    return {
      gameStatus: "No Game",
      gameProgress: "Progress is temporarily unavailable",
      publishingProgress: "Unavailable",
      currentFocus: "Refresh Game Hub",
      recommendedNextTool: "Game Hub",
      progressChecklist: [
        { label: "Project information", status: "Unavailable" },
      ],
    };
  }
  if (!isRecord(value)) {
    setStatusLog("Game progress is temporarily unavailable. Refresh the page or try again shortly.");
  }
  return isRecord(value) ? value : {
    gameStatus: "No Game",
    gameProgress: "No active game",
    publishingProgress: "Not started",
    currentFocus: "Create a game",
    recommendedNextTool: "Game Hub",
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

function projectRecordsSaveAllowed() {
  return Boolean(currentSessionUserKey());
}

function setProjectRecordStatus(message) {
  setText(elements.projectRecordStatus, message);
}

function refreshSaveControls() {
  const saveAllowed = projectRecordsSaveAllowed();
  [elements.nameInput, elements.purposeInput, elements.gameStatusInput, elements.currentUserRoleInput].forEach((control) => {
    if (control) {
      control.disabled = !saveAllowed;
    }
  });
  const submitButton = elements.form?.querySelector("button[type='submit']");
  if (submitButton) {
    submitButton.disabled = !saveAllowed;
  }
  if (elements.deleteOpenGame) {
    elements.deleteOpenGame.disabled = !saveAllowed;
  }
  if (!saveAllowed) {
    const currentStatus = String(elements.statusLog?.textContent || "");
    if (!/failed|Sign in required|unavailable/i.test(currentStatus)) {
      setStatusLog("Sign in to create or update Game Hub projects.");
    }
  }
}

function ensureProjectRecordsSaveAllowed(action) {
  if (projectRecordsSaveAllowed()) {
    return true;
  }
  const message = `Sign in required to ${action} Game Hub projects.`;
  setStatusLog(message);
  setProjectRecordStatus(message);
  refreshSaveControls();
  return false;
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

function renderProjectInformation(activeGame, currentMember, progress) {
  if (!elements.projectRecordsTable) {
    return;
  }

  elements.projectRecordsTable.replaceChildren();
  const row = document.createElement("tr");
  [
    { datasetName: "activeGameName", value: activeGame?.name || "No game open" },
    { datasetName: "activeGameStatus", value: activeGame?.status || progress?.gameStatus || "No Game" },
    { datasetName: "activeGamePurpose", value: activeGame?.purpose || "No purpose" },
    { datasetName: "activeGameOwner", value: activeGame?.ownerDisplayName || "No owner" },
    { datasetName: "currentUserRole", value: currentMember?.role || "Viewer" },
    { datasetName: "recommendedNextTool", value: progress?.recommendedNextTool || "Game Hub" },
  ].forEach(({ datasetName, value }) => {
    const cell = document.createElement("td");
    cell.dataset[datasetName] = "true";
    cell.textContent = value;
    row.append(cell);
  });
  elements.projectRecordsTable.append(row);

  setProjectRecordStatus(projectRecordsSaveAllowed()
    ? "Project Information loaded."
    : "Project Information loaded. Sign in to save changes.");
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
    setStatusLog("Game list is temporarily unavailable. Refresh the page or try again shortly.");
  }

  elements.gameList.replaceChildren();

  if (games.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "status";
    emptyState.textContent = "No games. Create a game to continue.";
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
    setStatusLog("Game Hub project details are temporarily unavailable. Refresh the page or try again shortly.");
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

function renderSourceIdea(activeGame) {
  const sourceIdea = isRecord(activeGame?.sourceIdea) ? activeGame.sourceIdea : null;
  const name = String(sourceIdea?.idea || "").trim();
  const pitch = String(sourceIdea?.pitch || "").trim();
  const notes = Array.isArray(sourceIdea?.notes)
    ? sourceIdea.notes.map((note) => String(note || "").trim()).filter(Boolean)
    : [];

  setText(elements.sourceIdeaName, name || "No source idea yet");
  setText(elements.sourceIdeaDisplay, name || "No source idea yet");
  setText(elements.sourceIdeaPitch, pitch || "Create a project from Idea Board to see source details.");

  if (elements.sourceIdeaNotes) {
    elements.sourceIdeaNotes.replaceChildren();
    const visibleNotes = notes.length ? notes : ["No source notes."];
    visibleNotes.forEach((note) => {
      const item = document.createElement("li");
      item.textContent = note;
      elements.sourceIdeaNotes.append(item);
    });
  }
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
  renderProjectInformation(activeGame, currentMember, progress);
  renderSourceIdea(activeGame);
  refreshSaveControls();
}

elements.form?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!ensureProjectRecordsSaveAllowed("create")) {
    return;
  }
  const activeGame = normalizeActiveGame(repository.getActiveGame());
  const game = repository.createGame({
    name: elements.nameInput?.value,
    purpose: elements.purposeInput?.value,
    status: elements.gameStatusInput?.value,
  });

  if (reportRepositoryError(game, "Create Game") || !isRecord(game) || !String(game.name || "").trim()) {
    if (!isRepositoryErrorResult(game)) {
      setStatusLog("Create Game could not be completed. Refresh the page or try again shortly.");
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
  if (!ensureProjectRecordsSaveAllowed("delete")) {
    return;
  }
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
  if (!ensureProjectRecordsSaveAllowed("update")) {
    return;
  }
  const activeGame = normalizeActiveGame(repository.getActiveGame(), "Update game purpose");
  if (!activeGame) {
    return;
  }

  const game = repository.updateGamePurpose(activeGame.id, elements.purposeInput.value);
  setStatusLog(`Updated ${game.name} purpose to ${game.purpose}.`);
  renderWorkspace();
});

elements.gameStatusInput?.addEventListener("change", () => {
  if (!ensureProjectRecordsSaveAllowed("update")) {
    return;
  }
  const activeGame = normalizeActiveGame(repository.getActiveGame(), "Update game status");
  if (!activeGame) {
    return;
  }

  const game = repository.updateGameStatus(activeGame.id, elements.gameStatusInput.value);
  setStatusLog(`Updated ${game.name} status to ${game.status}.`);
  renderWorkspace();
});

elements.currentUserRoleInput?.addEventListener("change", () => {
  if (!ensureProjectRecordsSaveAllowed("update")) {
    return;
  }
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
const requestedGameId = new URL(window.location.href).searchParams.get("game");
if (requestedGameId) {
  const openedGame = repository.openGame(requestedGameId);
  if (isRepositoryErrorResult(openedGame)) {
    setStatusLog(repositoryErrorMessage(openedGame, "Open Game"));
  } else if (openedGame) {
    setStatusLog(`Opened ${openedGame.name}.`);
  } else {
    setStatusLog("That Game Hub project could not be found.");
  }
}
renderWorkspace();
