import {
  GAME_HUB_MEMBER_ROLES,
  GAME_HUB_GAME_PURPOSES,
  GAME_HUB_GAME_STATUSES,
  createGameHubApiRepository,
} from "./game-hub-api-client.js";
import { getSessionCurrent } from "../../../src/api/session-api-client.js";

const repository = createGameHubApiRepository();

const elements = {
  currentUserRoleInput: document.querySelector("[data-current-user-role-input]"),
  deleteOpenGame: document.querySelector("[data-game-delete-active]"),
  membersTable: document.querySelector("[data-game-members-table]"),
  progressChecklist: document.querySelector("[data-game-progress-checklist]"),
  gameList: document.querySelector("[data-game-list]"),
  projectRecordStatus: document.querySelector("[data-project-record-status]"),
  statusLog: document.querySelector("[data-game-hub-log]"),
  tableCounts: document.querySelector("[data-game-table-counts]"),
};

const state = {
  addingGame: false,
  editingGameId: "",
  expandedGameId: "",
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

function notifySelectedGameChanged(activeGame) {
  window.dispatchEvent(new CustomEvent("gamefoundry:toolbox-selected-game-changed", {
    detail: {
      selectedGameId: activeGame?.id || "",
      source: "game-hub",
    },
  }));
}

function isRecord(value) {
  return Boolean(value && typeof value === "object");
}

function isRepositoryErrorResult(value) {
  return isRecord(value) && value.error === true;
}

function isSourceLinkedGame(activeGame) {
  return isRecord(activeGame?.sourceIdea);
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

function refreshSaveControls(activeGame = null) {
  const saveAllowed = projectRecordsSaveAllowed();
  [elements.currentUserRoleInput].forEach((control) => {
    if (control) {
      control.disabled = !saveAllowed;
    }
  });
  if (elements.deleteOpenGame) {
    const sourceLinked = isSourceLinkedGame(activeGame);
    elements.deleteOpenGame.disabled = !saveAllowed || sourceLinked;
    elements.deleteOpenGame.hidden = sourceLinked;
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

function redirectGuestToSignIn() {
  window.location.href = "account/sign-in.html";
}

function ensureProjectRecordsSaveAllowedForSave() {
  if (projectRecordsSaveAllowed()) {
    return true;
  }
  redirectGuestToSignIn();
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

function createActionButton(label, action, options = {}) {
  const button = document.createElement("button");
  button.className = options.primary ? "btn btn--compact primary" : "btn btn--compact";
  button.type = "button";
  button.dataset.gameAction = action;
  if (options.gameId) {
    button.dataset.gameId = options.gameId;
  }
  if (options.disabled) {
    button.disabled = true;
  }
  if (options.ariaLabel) {
    button.setAttribute("aria-label", options.ariaLabel);
  }
  button.textContent = label;
  return button;
}

function createGameButton(game) {
  const button = createActionButton("Edit", "edit-game", {
    ariaLabel: `Edit ${game.name}`,
    gameId: game.id,
  });
  return button;
}

function createGameListStatus(message, state) {
  const emptyState = document.createElement("p");
  emptyState.className = "status";
  emptyState.dataset.gameListStatus = state;
  emptyState.textContent = message;
  return emptyState;
}

function createCell(value, tagName = "td") {
  const cell = document.createElement(tagName);
  cell.textContent = value;
  return cell;
}

function createSelect(options, selectedValue, datasetName, ariaLabel) {
  const select = document.createElement("select");
  select.dataset[datasetName] = "true";
  select.setAttribute("aria-label", ariaLabel);
  options.forEach((option) => {
    const item = document.createElement("option");
    item.value = option;
    item.textContent = option;
    select.append(item);
  });
  select.value = options.includes(selectedValue) ? selectedValue : options[0] || "";
  return select;
}

function createInput(value, datasetName, ariaLabel, options = {}) {
  const input = document.createElement("input");
  input.dataset[datasetName] = "true";
  input.type = "text";
  input.value = value || "";
  input.placeholder = options.placeholder || "";
  input.setAttribute("aria-label", ariaLabel);
  if (options.required) {
    input.required = true;
  }
  if (options.readOnly) {
    input.readOnly = true;
  }
  return input;
}

function createGameToggleButton(game, expanded, active) {
  const button = document.createElement("button");
  button.className = active ? "btn btn--compact primary" : "btn btn--compact";
  button.type = "button";
  button.dataset.gameToggle = game.id;
  if (active) {
    button.dataset.gameActive = "true";
    button.setAttribute("aria-current", "true");
  }
  button.setAttribute("aria-expanded", String(expanded));
  button.setAttribute("aria-controls", `game-child-source-idea-${game.id} game-child-readiness-output-${game.id}`);
  button.textContent = game.name;
  return button;
}

function gameSourceIdeaDetails(game) {
  const sourceIdea = isRecord(game?.sourceIdea) ? game.sourceIdea : null;
  const name = String(sourceIdea?.idea || "").trim();
  const pitch = String(sourceIdea?.pitch || "").trim();
  const notes = Array.isArray(sourceIdea?.notes)
    ? sourceIdea.notes.map((note) => String(note || "").trim()).filter(Boolean)
    : [];
  return {
    name,
    notes,
    pitch,
  };
}

function hasSourceIdeaDetails(game) {
  const sourceIdea = gameSourceIdeaDetails(game);
  return Boolean(sourceIdea.name || sourceIdea.pitch || sourceIdea.notes.length);
}

function renderGameSummaryChildTable(parent, game) {
  const wrapper = document.createElement("div");
  wrapper.className = "table-wrapper";
  const table = document.createElement("table");
  table.className = "data-table data-table--fixed";
  table.dataset.gameChildTable = "summary";
  table.setAttribute("aria-label", `${game.name} game summary`);
  table.innerHTML = "<caption>Game Summary</caption><thead><tr><th scope=\"col\">Field</th><th scope=\"col\">Value</th></tr></thead>";
  const body = document.createElement("tbody");
  [
    ["Project", game.name],
    ["Purpose", game.purpose],
    ["Status", game.status],
  ].forEach(([label, value]) => {
    const row = document.createElement("tr");
    row.append(createCell(label, "th"), createCell(value || "Not set"));
    row.firstElementChild.scope = "row";
    body.append(row);
  });
  table.append(body);
  wrapper.append(table);
  parent.append(wrapper);
}

function renderSourceIdeaChildTable(parent, game) {
  const sourceIdea = gameSourceIdeaDetails(game);
  const wrapper = document.createElement("div");
  wrapper.className = "table-wrapper";
  const table = document.createElement("table");
  table.className = "data-table data-table--fixed";
  table.dataset.gameChildTable = "source-idea";
  table.setAttribute("aria-label", `${game.name} source idea`);
  table.innerHTML = "<caption>Source Idea</caption><thead><tr><th scope=\"col\">Context</th><th scope=\"col\">Details</th></tr></thead>";
  const body = document.createElement("tbody");
  [
    ["Idea", sourceIdea.name || "No source idea yet"],
    ["Pitch", sourceIdea.pitch || "Create a project from Idea Board to see source details."],
  ].forEach(([label, value]) => {
    const row = document.createElement("tr");
    row.append(createCell(label, "th"), createCell(value));
    row.firstElementChild.scope = "row";
    body.append(row);
  });

  const notes = sourceIdea.notes.length ? sourceIdea.notes : ["No source notes."];
  notes.forEach((note, index) => {
    const row = document.createElement("tr");
    row.dataset.sourceIdeaNoteRow = String(index + 1);
    row.append(createCell(`Note ${index + 1}`, "th"), createCell(note));
    row.firstElementChild.scope = "row";
    body.append(row);
  });

  table.append(body);
  wrapper.append(table);
  parent.append(wrapper);
}

function renderReadinessOutputChildTable(parent, game, progress, active) {
  const readiness = active && isRecord(progress)
    ? progress
    : {
      currentFocus: "Open this game to review readiness",
      gameProgress: `${game.name} identity ready`,
      gameStatus: game.status || "No status",
      publishingProgress: "Open this game to review launch progress",
      recommendedNextTool: "Game Hub",
      progressChecklist: [],
    };
  const wrapper = document.createElement("div");
  wrapper.className = "table-wrapper";
  const table = document.createElement("table");
  table.className = "data-table data-table--fixed";
  table.dataset.gameChildTable = "readiness-output";
  table.setAttribute("aria-label", `${game.name} readiness output`);
  table.innerHTML = "<caption>Readiness Output</caption><thead><tr><th scope=\"col\">Output</th><th scope=\"col\">Status</th></tr></thead>";
  const body = document.createElement("tbody");
  [
    ["Game Status", readiness.gameStatus],
    ["Game Progress", readiness.gameProgress],
    ["Launch Progress", readiness.publishingProgress],
    ["Current Focus", readiness.currentFocus],
    ["Recommended Next Tool", readiness.recommendedNextTool],
  ].forEach(([label, value]) => {
    const row = document.createElement("tr");
    row.append(createCell(label, "th"), createCell(value || "Not available"));
    row.firstElementChild.scope = "row";
    body.append(row);
  });

  const checklist = Array.isArray(readiness.progressChecklist) ? readiness.progressChecklist : [];
  checklist.forEach((item) => {
    const row = document.createElement("tr");
    row.dataset.readinessChecklistRow = item.label || "Checklist";
    row.append(createCell(item.label || "Checklist", "th"), createCell(item.status || "Not available"));
    row.firstElementChild.scope = "row";
    body.append(row);
  });

  table.append(body);
  wrapper.append(table);
  parent.append(wrapper);
}

function renderExpandedGameRow(tbody, game, progress, active) {
  [
    {
      id: `game-child-source-idea-${game.id}`,
      render: (parent) => renderSourceIdeaChildTable(parent, game),
      type: "source-idea",
    },
    {
      id: `game-child-readiness-output-${game.id}`,
      render: (parent) => renderReadinessOutputChildTable(parent, game, progress, active),
      type: "readiness-output",
    },
  ].forEach(({ id, render, type }) => {
    const row = document.createElement("tr");
    row.dataset.gameExpandedRow = game.id;
    row.dataset.gameChildRow = type;
    row.id = id;
    const content = document.createElement("td");
    content.colSpan = 4;
    render(content);
    row.append(content);
    tbody.append(row);
  });
}

function renderAddGameRow(tbody) {
  const row = document.createElement("tr");
  row.dataset.gameAddRow = state.addingGame ? "input" : "button";

  if (!state.addingGame) {
    const cell = document.createElement("td");
    cell.colSpan = 4;
    cell.append(createActionButton("Add Game", "start-add-game"));
    row.append(cell);
    tbody.append(row);
    return;
  }

  const nameCell = document.createElement("th");
  nameCell.scope = "row";
  nameCell.append(createInput("", "gameNameInput", "Game", {
    placeholder: "Untitled game",
    required: true,
  }));

  const purposeCell = document.createElement("td");
  purposeCell.append(createSelect(GAME_HUB_GAME_PURPOSES, "Game", "gamePurposeInput", "Purpose"));

  const statusCell = document.createElement("td");
  statusCell.append(createSelect(GAME_HUB_GAME_STATUSES, "Planning", "gameStatusInput", "Status"));

  const actions = document.createElement("td");
  actions.append(
    createActionButton("Save", "save-add-game", { primary: true }),
    createActionButton("Cancel", "cancel-add-game"),
  );

  row.append(nameCell, purposeCell, statusCell, actions);
  tbody.append(row);
}

function renderEditGameRow(tbody, game) {
  const row = document.createElement("tr");
  row.dataset.gameEditRow = game.id;

  const nameCell = document.createElement("th");
  nameCell.scope = "row";
  nameCell.append(createInput(game.name, "gameNameInput", "Game", {
    readOnly: true,
  }));

  const purposeCell = document.createElement("td");
  purposeCell.append(createSelect(GAME_HUB_GAME_PURPOSES, game.purpose, "gamePurposeInput", "Purpose"));

  const statusCell = document.createElement("td");
  statusCell.append(createSelect(GAME_HUB_GAME_STATUSES, game.status, "gameStatusInput", "Status"));

  const actions = document.createElement("td");
  actions.append(
    createActionButton("Save", "save-edit-game", {
      gameId: game.id,
      primary: true,
    }),
    createActionButton("Cancel", "cancel-edit-game", {
      gameId: game.id,
    }),
  );

  row.append(
    nameCell,
    purposeCell,
    statusCell,
    actions,
  );
  tbody.append(row);
}

function renderGameParentRow(tbody, game, activeGame, progress) {
  const expanded = state.expandedGameId === game.id;
  const active = activeGame?.id === game.id;
  const editing = state.editingGameId === game.id;

  if (editing) {
    renderEditGameRow(tbody, game);
    return;
  }

  const row = document.createElement("tr");
  row.dataset.gameRow = game.id;

  const nameCell = document.createElement("th");
  nameCell.scope = "row";
  nameCell.append(createGameToggleButton(game, expanded, active));
  row.append(
    nameCell,
    createCell(game.purpose || "Game"),
    createCell(game.status || "No status"),
  );

  const actions = document.createElement("td");
  actions.append(createGameButton(game));
  row.append(actions);
  tbody.append(row);

  if (expanded) {
    renderExpandedGameRow(tbody, game, progress, active);
  }
}

function renderGameTableStatus() {
  setProjectRecordStatus(projectRecordsSaveAllowed()
    ? "Game table loaded."
    : "Game table loaded. Sign in to save changes.");
}

function renderGameList(progress) {
  if (!elements.gameList) {
    return;
  }

  const activeGame = normalizeActiveGame(repository.getActiveGame());
  const gameUserKey = currentGameUserKey(activeGame);
  const listResult = repository.listGames(gameUserKey ? { userKey: gameUserKey } : {});

  elements.gameList.replaceChildren();

  if (!Array.isArray(listResult)) {
    const message = "Game Hub projects are temporarily unavailable. Refresh the page or try again shortly.";
    reportRepositoryError(listResult, "Game Hub projects");
    setStatusLog(message);
    elements.gameList.append(createGameListStatus(message, "unavailable"));
    return;
  }

  if (listResult.length === 0) {
    elements.gameList.append(createGameListStatus("No Game Hub projects yet. Add a game to start building.", "empty"));
  }

  const wrapper = document.createElement("div");
  wrapper.className = "table-wrapper";
  const table = document.createElement("table");
  table.className = "data-table data-table--fixed";
  table.dataset.gameParentTable = "open-games";
  table.dataset.gameRowsTable = "true";
  table.setAttribute("aria-label", "Open Games");
  table.innerHTML = "<caption>Open Games</caption><thead><tr><th scope=\"col\">Game</th><th scope=\"col\">Purpose</th><th scope=\"col\">Status</th><th scope=\"col\">Actions</th></tr></thead>";
  const body = document.createElement("tbody");
  listResult.forEach((game) => renderGameParentRow(body, game, activeGame, progress));
  renderAddGameRow(body);
  table.append(body);
  wrapper.append(table);
  elements.gameList.append(wrapper);
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

  if (elements.currentUserRoleInput) {
    elements.currentUserRoleInput.value = currentMember?.role || "Viewer";
  }

  renderGameList(progress);
  renderMembersTable(activeGame);
  renderTableCounts();
  renderChecklist(progress);
  renderGameTableStatus();
  refreshSaveControls(activeGame);
  notifySelectedGameChanged(activeGame);
}

function readGameRowFields(row) {
  return {
    name: row?.querySelector("[data-game-name-input]")?.value,
    purpose: row?.querySelector("[data-game-purpose-input]")?.value,
    status: row?.querySelector("[data-game-status-input]")?.value,
  };
}

function validateAddedGameFields(row) {
  const input = readGameRowFields(row);
  const nameInput = row?.querySelector("[data-game-name-input]");
  input.name = String(input.name || "").trim();
  if (!input.name) {
    if (nameInput) {
      nameInput.setAttribute("aria-invalid", "true");
      nameInput.focus();
    }
    setStatusLog("Enter a game name before saving.");
    return null;
  }
  if (nameInput) {
    nameInput.removeAttribute("aria-invalid");
  }
  return input;
}

function saveAddedGame(row) {
  if (!ensureProjectRecordsSaveAllowedForSave()) {
    return;
  }
  const input = validateAddedGameFields(row);
  if (!input) {
    return;
  }
  const game = repository.createGame({
    name: input.name,
    purpose: input.purpose,
    status: input.status,
  });

  if (reportRepositoryError(game, "Add game") || !isRecord(game) || !String(game.name || "").trim()) {
    if (!isRepositoryErrorResult(game)) {
      setStatusLog("Add game could not be completed. Refresh the page or try again shortly.");
    }
    renderWorkspace();
    return;
  }

  state.addingGame = false;
  state.editingGameId = "";
  setStatusLog(`Created and opened ${game.name}.`);
  renderWorkspace();
}

function saveEditedGame(row, gameId) {
  if (!ensureProjectRecordsSaveAllowedForSave()) {
    return;
  }
  const input = readGameRowFields(row);
  let game = repository.openGame(gameId);
  if (reportRepositoryError(game, "Edit game") || !isRecord(game)) {
    if (!isRepositoryErrorResult(game)) {
      setStatusLog("Edit game could not be completed. Refresh the page or try again shortly.");
    }
    renderWorkspace();
    return;
  }

  if (input.purpose && input.purpose !== game.purpose) {
    game = repository.updateGamePurpose(gameId, input.purpose);
    if (reportRepositoryError(game, "Update game purpose") || !isRecord(game)) {
      if (!isRepositoryErrorResult(game)) {
        setStatusLog("Update game purpose could not be completed. Refresh the page or try again shortly.");
      }
      renderWorkspace();
      return;
    }
  }

  if (input.status && input.status !== game.status) {
    game = repository.updateGameStatus(gameId, input.status);
    if (reportRepositoryError(game, "Update game status") || !isRecord(game)) {
      if (!isRepositoryErrorResult(game)) {
        setStatusLog("Update game status could not be completed. Refresh the page or try again shortly.");
      }
      renderWorkspace();
      return;
    }
  }

  state.editingGameId = "";
  setStatusLog(`Saved ${game.name}.`);
  renderWorkspace();
}

elements.gameList?.addEventListener("click", (event) => {
  const toggle = event.target.closest("[data-game-toggle]");
  if (toggle) {
    const game = repository.openGame(toggle.dataset.gameToggle);
    if (reportRepositoryError(game, "Select game")) {
      renderWorkspace();
      return;
    }
    state.expandedGameId = state.expandedGameId === toggle.dataset.gameToggle ? "" : toggle.dataset.gameToggle;
    renderWorkspace();
    return;
  }

  const action = event.target.closest("[data-game-action]");

  if (!action) {
    return;
  }

  if (action.dataset.gameAction === "start-add-game") {
    state.addingGame = true;
    state.editingGameId = "";
    renderWorkspace();
    return;
  }

  if (action.dataset.gameAction === "cancel-add-game") {
    state.addingGame = false;
    setStatusLog("Cancelled game add.");
    renderWorkspace();
    return;
  }

  if (action.dataset.gameAction === "save-add-game") {
    saveAddedGame(action.closest("[data-game-add-row='input']"));
    return;
  }

  if (action.dataset.gameAction === "edit-game") {
    const game = repository.openGame(action.dataset.gameId);
    if (reportRepositoryError(game, "Edit game") || !isRecord(game)) {
      if (!isRepositoryErrorResult(game)) {
        setStatusLog("Edit game could not be completed. Refresh the page or try again shortly.");
      }
      renderWorkspace();
      return;
    }
    state.addingGame = false;
    state.editingGameId = game.id;
    setStatusLog(`Editing ${game.name}.`);
    renderWorkspace();
    return;
  }

  if (action.dataset.gameAction === "cancel-edit-game") {
    state.editingGameId = "";
    setStatusLog("Cancelled game edit.");
    renderWorkspace();
    return;
  }

  if (action.dataset.gameAction === "save-edit-game") {
    saveEditedGame(action.closest("[data-game-edit-row]"), action.dataset.gameId);
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
  if (isSourceLinkedGame(activeGame)) {
    setStatusLog("Source-linked projects stay connected to Idea Board.");
    renderWorkspace();
    return;
  }

  repository.deleteGame(activeGame.id);
  setStatusLog(`Deleted ${activeGame.name}.`);
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

populateSelect(elements.currentUserRoleInput, GAME_HUB_MEMBER_ROLES);
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
