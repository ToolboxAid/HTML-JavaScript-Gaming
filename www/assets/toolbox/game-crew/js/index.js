import { getSessionCurrent } from "../../../../../src/api/session-api-client.js";
import {
  createServerRepositoryClient,
  readServerToolConstants,
  requireServerConstant,
} from "../../../../../src/api/server-api-client.js";

const constants = readServerToolConstants("game-crew");

export const GAME_CREW_TABLES = Object.freeze(requireServerConstant(constants, "GAME_CREW_TABLES", "game-crew"));
export const GAME_CREW_MEMBER_ROLES = Object.freeze(requireServerConstant(constants, "GAME_CREW_MEMBER_ROLES", "game-crew"));

export function createGameCrewApiRepository(options = {}) {
  return createServerRepositoryClient("game-crew", options);
}

const repository = createGameCrewApiRepository();

const elements = {
  action: document.querySelector("[data-game-crew-action]"),
  add: document.querySelector("[data-game-crew-add]"),
  count: document.querySelector("[data-game-crew-count]"),
  guidance: document.querySelector("[data-game-crew-guidance]"),
  log: document.querySelector("[data-game-crew-log]"),
  outputStatus: document.querySelector("[data-game-crew-output-status]"),
  owner: document.querySelector("[data-game-crew-owner]"),
  projectName: document.querySelector("[data-game-crew-project-name]"),
  refresh: document.querySelector("[data-game-crew-refresh]"),
  selected: document.querySelector("[data-game-crew-selected]"),
  status: document.querySelector("[data-game-crew-status]"),
  table: document.querySelector("[data-game-crew-table]"),
  tableCounts: document.querySelector("[data-game-crew-table-counts]"),
};

function setText(target, value) {
  if (target) {
    target.textContent = value;
  }
}

function createCell(text) {
  const cell = document.createElement("td");
  cell.textContent = text;
  return cell;
}

function createButton(label, datasetName, value, options = {}) {
  const button = document.createElement("button");
  button.className = options.secondary ? "btn btn--secondary btn--compact" : "btn btn--compact";
  button.type = "button";
  button.dataset[datasetName] = value;
  button.textContent = label;
  if (options.disabled) {
    button.disabled = true;
  }
  return button;
}

function currentSession() {
  try {
    return getSessionCurrent();
  } catch {
    return { authenticated: false };
  }
}

function redirectGuestWriteAction() {
  if (currentSession()?.authenticated === true) {
    return false;
  }
  setText(elements.log, "Sign in before changing project crew membership.");
  window.location.href = new URL("/account/sign-in.html", window.location.href).href;
  return true;
}

function renderTableCounts(snapshot) {
  if (!elements.tableCounts) {
    return;
  }
  elements.tableCounts.replaceChildren();
  snapshot.tableCounts.forEach((count) => {
    const row = document.createElement("tr");
    row.append(createCell(count.table), createCell(String(count.rows)));
    elements.tableCounts.append(row);
  });
}

function renderMembers(snapshot) {
  if (!elements.table) {
    return;
  }
  elements.table.replaceChildren();

  if (!snapshot.members.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;
    cell.textContent = "No crew members yet.";
    row.append(cell);
    elements.table.append(row);
    return;
  }

  snapshot.members.forEach((member) => {
    const row = document.createElement("tr");
    row.dataset.gameCrewMemberRow = member.userKey;
    const actions = document.createElement("div");
    actions.className = "action-group action-group--tight";
    actions.append(createButton(
      member.role === "Owner" ? "Owner locked" : "Remove",
      "gameCrewRemove",
      member.userKey,
      { disabled: member.role === "Owner", secondary: true },
    ));
    const actionCell = document.createElement("td");
    actionCell.append(actions);
    row.append(
      createCell(member.displayName),
      createCell(member.role),
      createCell(member.status),
      createCell(member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : "Ready"),
      actionCell,
    );
    elements.table.append(row);
  });
}

function normalizeSnapshot(value) {
  return value && typeof value === "object" && Array.isArray(value.members)
    ? value
    : {
        activeProject: null,
        guidance: "Project crew is temporarily unavailable. Refresh the page.",
        members: [],
        owner: null,
        status: "Unavailable",
        tableCounts: GAME_CREW_TABLES.map((table) => ({ rows: 0, table })),
      };
}

function render() {
  const snapshot = normalizeSnapshot(repository.getSnapshot());
  setText(elements.status, snapshot.status);
  setText(elements.outputStatus, snapshot.status);
  setText(elements.owner, snapshot.owner?.displayName || snapshot.activeProject?.ownerDisplayName || "Unknown");
  setText(elements.count, String(snapshot.members.length));
  setText(elements.projectName, snapshot.activeProject?.name || "No project selected");
  setText(elements.guidance, snapshot.guidance);
  renderMembers(snapshot);
  renderTableCounts(snapshot);
}

elements.add?.addEventListener("click", () => {
  if (redirectGuestWriteAction()) {
    return;
  }
  const result = repository.addMember();
  setText(elements.action, result.message);
  setText(elements.log, result.message);
  render();
});

elements.refresh?.addEventListener("click", () => {
  setText(elements.log, "Project crew refreshed from the API.");
  render();
});

elements.table?.addEventListener("click", (event) => {
  const remove = event.target.closest("[data-game-crew-remove]");
  if (!remove || remove.disabled) {
    return;
  }
  if (redirectGuestWriteAction()) {
    return;
  }
  const result = repository.removeMember(remove.dataset.gameCrewRemove);
  setText(elements.selected, result.member?.displayName || "Selected member");
  setText(elements.action, result.message);
  setText(elements.log, result.message);
  render();
});

render();
