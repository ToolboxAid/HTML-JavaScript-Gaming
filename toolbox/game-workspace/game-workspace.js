import {
  GAME_WORKSPACE_MEMBER_ROLES,
  GAME_WORKSPACE_GAME_PURPOSES,
  GAME_WORKSPACE_GAME_STATUSES,
  createGameWorkspaceApiRepository,
} from "./game-workspace-api-client.js";
import { getSessionCurrent } from "../../src/api/session-api-client.js";

const repository = createGameWorkspaceApiRepository();

const elements = {
  currentUserRole: document.querySelector("[data-current-user-role]"),
  currentUserRoleInput: document.querySelector("[data-current-user-role-input]"),
  form: document.querySelector("[data-game-form]"),
  nameInput: document.querySelector("[data-game-name-input]"),
  projectRecordStatus: document.querySelector("[data-project-record-status]"),
  projectsTable: document.querySelector("[data-game-projects-table]"),
  purposeInput: document.querySelector("[data-game-purpose-input]"),
  statusInput: document.querySelector("[data-game-status-input]"),
  statusLog: document.querySelector("[data-game-workspace-log]"),
};

const state = {
  expandedGameId: "",
};

function setText(element, value) {
  if (element) {
    element.textContent = value;
  }
}

function setStatusLog(message) {
  setText(elements.statusLog, message);
}

function setProjectRecordStatus(message) {
  setText(elements.projectRecordStatus, message);
}

function isRecord(value) {
  return Boolean(value && typeof value === "object");
}

function isRepositoryErrorResult(value) {
  return isRecord(value) && value.error === true;
}

function repositoryErrorMessage(context) {
  return `${context} is temporarily unavailable. Refresh the page or try again shortly.`;
}

function reportRepositoryError(value, context) {
  if (isRepositoryErrorResult(value)) {
    setStatusLog(repositoryErrorMessage(context));
    return true;
  }
  return false;
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

function activeGameMembers(activeGame) {
  return Array.isArray(activeGame?.members) ? activeGame.members : [];
}

function normalizeGame(value, context = "Project") {
  if (reportRepositoryError(value, context)) {
    return null;
  }
  if (!value) {
    return null;
  }
  if (!isRecord(value) || !Array.isArray(value.members)) {
    setStatusLog(repositoryErrorMessage(context));
    return null;
  }
  return value;
}

function normalizeGameList(value) {
  if (Array.isArray(value)) {
    return value.map((game) => normalizeGame(game)).filter(Boolean);
  }
  if (!reportRepositoryError(value, "Projects")) {
    setStatusLog(repositoryErrorMessage("Projects"));
  }
  return [];
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

function sourceIdeaFor(game) {
  const sourceIdea = isRecord(game?.sourceIdea) ? game.sourceIdea : null;
  const idea = String(sourceIdea?.idea || "").trim();
  const pitch = String(sourceIdea?.pitch || "").trim();
  const notes = Array.isArray(sourceIdea?.notes)
    ? sourceIdea.notes.map((note) => String(note || "").trim()).filter(Boolean)
    : [];

  return { idea, notes, pitch };
}

function projectDescription(game) {
  const sourceIdea = sourceIdeaFor(game);
  if (sourceIdea.pitch) {
    return sourceIdea.pitch;
  }
  return `${game?.purpose || "Game"} project`;
}

function projectUpdated(game) {
  const updated = String(game?.updated || game?.updatedAt || game?.lastUpdated || "").trim();
  if (updated) {
    return updated;
  }
  return new Date().toISOString().slice(0, 10);
}

function journeyItemsFor(game) {
  return sourceIdeaFor(game).notes.map((note) => ({
    status: "Planned",
    text: note,
  }));
}

function journeyCountLabel(game) {
  const count = journeyItemsFor(game).length;
  return `${count} ${count === 1 ? "Item" : "Items"}`;
}

function createCell(text, datasetName) {
  const cell = document.createElement("td");
  cell.textContent = text;
  if (datasetName) {
    cell.dataset[datasetName] = "true";
  }
  return cell;
}

function createProjectCell(game, expanded, active) {
  const cell = document.createElement("td");
  cell.dataset.gameToggle = game.id;
  cell.dataset.tableParentCell = "true";
  cell.setAttribute("aria-expanded", expanded ? "true" : "false");
  cell.setAttribute("role", "button");
  cell.tabIndex = 0;

  const label = document.createElement("span");
  label.className = "table-parent-label";

  const chevron = document.createElement("span");
  chevron.className = `table-parent-chevron table-parent-chevron--${expanded ? "up" : "down"}`;
  chevron.setAttribute("aria-hidden", "true");

  const text = document.createElement("span");
  text.className = "table-parent-label__text";
  text.textContent = game.name;
  if (active) {
    text.dataset.activeGameName = "true";
  }

  label.append(chevron, text);
  cell.append(label);
  return cell;
}

function createOpenButton(game, active) {
  const button = document.createElement("button");
  button.className = active ? "btn primary" : "btn";
  button.type = "button";
  button.dataset.gameOpen = game.id;
  button.textContent = "Open";
  button.setAttribute("aria-label", `Open ${game.name}`);
  if (active) {
    button.dataset.gameActive = "true";
    button.setAttribute("aria-current", "true");
  }
  return button;
}

function createDeleteButton(game) {
  const button = document.createElement("button");
  button.className = "btn";
  button.type = "button";
  button.dataset.gameDelete = game.id;
  button.textContent = "Delete";
  button.disabled = !projectRecordsSaveAllowed();
  button.setAttribute("aria-label", `Delete ${game.name}`);
  return button;
}

function createJourneyLink(game, compact = false) {
  const link = document.createElement("a");
  link.className = compact ? "btn btn--compact" : "btn";
  link.href = `toolbox/game-journey/index.html?game=${encodeURIComponent(game.id)}`;
  link.dataset.gameJourneyLink = "true";
  link.textContent = compact ? "Open" : "Open Journey";
  link.setAttribute("aria-label", `Open Game Journey for ${game.name}`);
  return link;
}

function createActionCell(game, active) {
  const cell = document.createElement("td");
  const group = document.createElement("div");
  group.className = "action-group";
  group.append(createOpenButton(game, active), createJourneyLink(game), createDeleteButton(game));
  cell.append(group);
  return cell;
}

function appendSourceIdeaSection(surface, game) {
  const sourceIdea = sourceIdeaFor(game);
  const section = document.createElement("section");
  section.className = "content-stack content-stack--compact";
  section.dataset.sourceIdeaSection = "true";
  section.setAttribute("aria-label", "Source Idea");

  const heading = document.createElement("h3");
  heading.dataset.sourceIdeaName = "true";
  heading.textContent = "Source Idea";

  const wrapper = document.createElement("div");
  wrapper.className = "table-wrapper";

  const table = document.createElement("table");
  table.className = "data-table";
  table.setAttribute("aria-label", `Source Idea for ${game.name}`);

  const body = document.createElement("tbody");

  const rows = [
    ["Idea", sourceIdea.idea || "No source idea yet", "sourceIdeaDisplay"],
    ["Pitch", sourceIdea.pitch || "Create a project from Idea Board to see source details.", "sourceIdeaPitch"],
  ];

  rows.forEach(([label, value, datasetName]) => {
    const row = document.createElement("tr");
    const header = document.createElement("th");
    header.scope = "row";
    header.textContent = label;
    const cell = createCell(value, datasetName);
    row.append(header, cell);
    body.append(row);
  });

  const notesRow = document.createElement("tr");
  const notesHeader = document.createElement("th");
  notesHeader.scope = "row";
  notesHeader.textContent = "Notes";
  const notesCell = document.createElement("td");
  const notesList = document.createElement("ul");
  notesList.className = "content-list";
  notesList.dataset.sourceIdeaNotes = "true";
  const notes = sourceIdea.notes.length ? sourceIdea.notes : ["No source notes."];
  notes.forEach((note) => {
    const item = document.createElement("li");
    item.textContent = note;
    notesList.append(item);
  });
  notesCell.append(notesList);
  notesRow.append(notesHeader, notesCell);
  body.append(notesRow);

  table.append(body);
  wrapper.append(table);
  section.append(heading, wrapper);
  surface.append(section);
}

function appendJourneyItemsSection(surface, game) {
  const section = document.createElement("section");
  section.className = "content-stack content-stack--compact";
  section.setAttribute("aria-label", "Game Journey Items");

  const heading = document.createElement("h3");
  heading.textContent = "Game Journey Items";

  const wrapper = document.createElement("div");
  wrapper.className = "table-wrapper";

  const table = document.createElement("table");
  table.className = "data-table";
  table.setAttribute("aria-label", `Game Journey Items for ${game.name}`);

  const head = document.createElement("thead");
  const headRow = document.createElement("tr");
  ["Item", "Status", "Actions"].forEach((label) => {
    const header = document.createElement("th");
    header.scope = "col";
    header.textContent = label;
    headRow.append(header);
  });
  head.append(headRow);

  const body = document.createElement("tbody");
  const items = journeyItemsFor(game);
  if (!items.length) {
    const emptyRow = document.createElement("tr");
    const emptyCell = document.createElement("td");
    emptyCell.colSpan = 3;
    emptyCell.textContent = "No journey items yet.";
    emptyRow.append(emptyCell);
    body.append(emptyRow);
  } else {
    items.forEach((item) => {
      const row = document.createElement("tr");
      row.className = "table-child-row";

      const itemCell = createCell(item.text);
      const statusCell = document.createElement("td");
      const checkboxLabel = document.createElement("label");
      checkboxLabel.className = "checkbox-label";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.disabled = true;
      checkbox.setAttribute("aria-label", `${item.text} planned`);
      const statusText = document.createElement("span");
      statusText.textContent = item.status;
      checkboxLabel.append(checkbox, statusText);
      statusCell.append(checkboxLabel);

      const actionsCell = document.createElement("td");
      actionsCell.append(createJourneyLink(game, true));

      row.append(itemCell, statusCell, actionsCell);
      body.append(row);
    });
  }

  table.append(head, body);
  wrapper.append(table);
  section.append(heading, wrapper);
  surface.append(section);
}

function createExpandedRow(game) {
  const row = document.createElement("tr");
  row.dataset.gameProjectExpandedRow = game.id;
  row.className = "table-child-row";

  const cell = document.createElement("td");
  cell.colSpan = 6;

  const surface = document.createElement("div");
  surface.className = "table-child-surface content-stack";
  surface.dataset.gameProjectChildSurface = "true";

  appendSourceIdeaSection(surface, game);
  appendJourneyItemsSection(surface, game);

  cell.append(surface);
  row.append(cell);
  return row;
}

function renderProjectRow(game, activeGame) {
  const active = activeGame?.id === game.id;
  const expanded = state.expandedGameId === game.id;
  const row = document.createElement("tr");
  row.dataset.gameRow = game.id;
  if (active) {
    row.dataset.gameActiveRow = "true";
  }

  const descriptionCell = createCell(projectDescription(game), active ? "activeGamePurpose" : "");
  const statusCell = createCell(game.status || "Planning", active ? "activeGameStatus" : "");
  const updatedCell = createCell(projectUpdated(game));
  const journeyCell = createCell(journeyCountLabel(game));

  row.append(
    createProjectCell(game, expanded, active),
    descriptionCell,
    statusCell,
    updatedCell,
    journeyCell,
    createActionCell(game, active),
  );

  return [row, expanded ? createExpandedRow(game) : null].filter(Boolean);
}

function renderProjectsTable() {
  if (!elements.projectsTable) {
    return null;
  }

  const activeGame = normalizeGame(repository.getActiveGame(), "Active project");
  const userKey = currentSessionUserKey();
  const listResult = repository.listGames(userKey ? { userKey } : {});
  const games = normalizeGameList(listResult);

  if (state.expandedGameId && !games.some((game) => game.id === state.expandedGameId)) {
    state.expandedGameId = "";
  }

  elements.projectsTable.replaceChildren();

  if (!games.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 6;
    cell.textContent = "No projects yet. Create a project to get started.";
    row.append(cell);
    elements.projectsTable.append(row);
  } else {
    games.flatMap((game) => renderProjectRow(game, activeGame)).forEach((row) => {
      elements.projectsTable.append(row);
    });
  }

  setProjectRecordStatus(projectRecordsSaveAllowed()
    ? "Projects loaded."
    : "Projects loaded. Sign in to create or update projects.");

  return activeGame;
}

function refreshSaveControls() {
  const saveAllowed = projectRecordsSaveAllowed();
  [elements.nameInput, elements.purposeInput, elements.statusInput, elements.currentUserRoleInput].forEach((control) => {
    if (control) {
      control.disabled = !saveAllowed;
    }
  });

  const submitButton = elements.form?.querySelector("button[type='submit']");
  if (submitButton) {
    submitButton.disabled = !saveAllowed;
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

function renderRole(activeGame) {
  const currentMember = currentGameMember(activeGame);
  const role = currentMember?.role || "Viewer";
  setText(elements.currentUserRole, role);
  if (elements.currentUserRoleInput) {
    elements.currentUserRoleInput.value = role;
  }
}

function renderWorkspace() {
  const activeGame = renderProjectsTable();
  renderRole(activeGame);
  refreshSaveControls();
}

function toggleProject(projectId) {
  state.expandedGameId = state.expandedGameId === projectId ? "" : projectId;
  renderWorkspace();
}

elements.form?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!ensureProjectRecordsSaveAllowed("create")) {
    return;
  }

  const game = repository.createGame({
    name: elements.nameInput?.value,
    purpose: elements.purposeInput?.value,
    status: elements.statusInput?.value,
  });

  if (reportRepositoryError(game, "Create Project") || !isRecord(game) || !String(game.name || "").trim()) {
    if (!isRepositoryErrorResult(game)) {
      setStatusLog("Create Project could not be completed. Refresh the page or try again shortly.");
    }
    renderWorkspace();
    return;
  }

  if (elements.nameInput) {
    elements.nameInput.value = "";
  }
  state.expandedGameId = game.id;
  setStatusLog(`Created and opened ${game.name}.`);
  renderWorkspace();
});

elements.projectsTable?.addEventListener("click", (event) => {
  const toggleCell = event.target.closest("[data-game-toggle]");
  if (toggleCell && elements.projectsTable.contains(toggleCell)) {
    toggleProject(toggleCell.dataset.gameToggle);
    return;
  }

  const openButton = event.target.closest("[data-game-open]");
  if (openButton && elements.projectsTable.contains(openButton)) {
    const game = repository.openGame(openButton.dataset.gameOpen);
    if (reportRepositoryError(game, "Open Project")) {
      renderWorkspace();
      return;
    }
    if (game) {
      setStatusLog(`Opened ${game.name}.`);
      renderWorkspace();
    }
    return;
  }

  const deleteButton = event.target.closest("[data-game-delete]");
  if (deleteButton && elements.projectsTable.contains(deleteButton)) {
    if (!ensureProjectRecordsSaveAllowed("delete")) {
      return;
    }
    const gameId = deleteButton.dataset.gameDelete;
    const gameName = deleteButton.getAttribute("aria-label")?.replace(/^Delete\s+/, "") || "project";
    repository.deleteGame(gameId);
    if (state.expandedGameId === gameId) {
      state.expandedGameId = "";
    }
    setStatusLog(`Deleted ${gameName}.`);
    renderWorkspace();
  }
});

elements.projectsTable?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  const toggleCell = event.target.closest("[data-game-toggle]");
  if (!toggleCell || !elements.projectsTable.contains(toggleCell)) {
    return;
  }

  event.preventDefault();
  toggleProject(toggleCell.dataset.gameToggle);
});

elements.currentUserRoleInput?.addEventListener("change", () => {
  if (!ensureProjectRecordsSaveAllowed("update")) {
    return;
  }
  const activeGame = normalizeGame(repository.getActiveGame(), "Update current role");
  if (!activeGame) {
    return;
  }

  repository.updateGameMemberRole(activeGame.id, currentGameUserKey(activeGame), elements.currentUserRoleInput.value);
  setStatusLog(`Updated current role to ${elements.currentUserRoleInput.value}.`);
  renderWorkspace();
});

populateSelect(elements.purposeInput, GAME_WORKSPACE_GAME_PURPOSES);
populateSelect(elements.statusInput, GAME_WORKSPACE_GAME_STATUSES);
populateSelect(elements.currentUserRoleInput, GAME_WORKSPACE_MEMBER_ROLES);
if (elements.statusInput && GAME_WORKSPACE_GAME_STATUSES.includes("Under Construction")) {
  elements.statusInput.value = "Under Construction";
}

const requestedGameId = new URL(window.location.href).searchParams.get("game");
if (requestedGameId) {
  const openedGame = repository.openGame(requestedGameId);
  if (isRepositoryErrorResult(openedGame)) {
    setStatusLog(repositoryErrorMessage("Open Project"));
  } else if (openedGame) {
    state.expandedGameId = openedGame.id;
    setStatusLog(`Opened ${openedGame.name}.`);
  } else {
    setStatusLog("That Game Hub project could not be found.");
  }
}

renderWorkspace();
