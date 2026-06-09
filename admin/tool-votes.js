import {
  readToolboxVoteSnapshot,
  updateToolboxVoteOrder,
} from "../src/engine/api/toolbox-votes-api-client.js";

const status = document.querySelector("[data-toolbox-votes-status]");
const body = document.querySelector("[data-toolbox-votes-body]");
const selectedOrder = document.querySelector("[data-toolbox-votes-selected-order]");
const selectedGroup = document.querySelector("[data-toolbox-votes-selected-group]");
const selectedPath = document.querySelector("[data-toolbox-votes-selected-path]");

let selectedToolId = "";
let snapshotRows = [];

function setStatus(message) {
  if (status) {
    status.textContent = message;
  }
}

function tableCell(value) {
  const cell = document.createElement("td");
  cell.textContent = value === null || value === undefined ? "" : String(value);
  return cell;
}

function setSelectedDetails(voteRow) {
  if (selectedOrder) {
    selectedOrder.textContent = voteRow ? String(voteRow.order) : "None";
  }
  if (selectedGroup) {
    selectedGroup.textContent = voteRow?.group || "None";
  }
  if (selectedPath) {
    selectedPath.textContent = voteRow?.path || "None";
  }
}

function selectRow(toolId) {
  selectedToolId = String(toolId || "");
  const selectedRow = snapshotRows.find((row) => row.toolId === selectedToolId);
  setSelectedDetails(selectedRow);
  body?.querySelectorAll("tr[data-toolbox-votes-tool-id]").forEach((row) => {
    row.setAttribute("aria-selected", String(row.dataset.toolboxVotesToolId === selectedToolId));
  });
}

function orderCell(voteRow) {
  const cell = document.createElement("td");
  const input = document.createElement("input");
  input.type = "number";
  input.min = "0";
  input.step = "1";
  input.value = String(voteRow.order);
  input.dataset.toolboxVotesOrderInput = voteRow.toolId;
  input.setAttribute("aria-label", `Order for ${voteRow.toolName}`);
  input.addEventListener("change", () => {
    updateOrder(voteRow, input.value);
  });
  input.addEventListener("focus", () => {
    selectRow(voteRow.toolId);
  });
  cell.append(input);
  return cell;
}

function renderRows(rows) {
  if (!body) {
    return;
  }
  snapshotRows = rows;
  if (!rows.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 8;
    cell.textContent = "No Toolbox vote rows are available.";
    row.append(cell);
    body.replaceChildren(row);
    setSelectedDetails(null);
    return;
  }

  body.replaceChildren(...rows.map((voteRow) => {
    const row = document.createElement("tr");
    row.dataset.toolboxVotesToolId = voteRow.toolId;
    row.addEventListener("click", () => {
      selectRow(voteRow.toolId);
    });
    row.append(
      tableCell(voteRow.toolName),
      orderCell(voteRow),
      tableCell(voteRow.group),
      tableCell(voteRow.path),
      tableCell(voteRow.releaseChannelLabel),
      tableCell(voteRow.up),
      tableCell(voteRow.down),
      tableCell(voteRow.currentUserVote || "None"),
    );
    return row;
  }));

  selectRow(selectedToolId || rows[0].toolId);
}

function renderSnapshot(snapshot, message) {
  renderRows(snapshot.rows || []);
  setStatus(message || `Showing Toolbox vote totals for ${snapshot.currentUserName || "current session"}.`);
}

function updateOrder(voteRow, value) {
  try {
    const snapshot = updateToolboxVoteOrder(voteRow.toolId, Number(value));
    renderSnapshot(snapshot, `${voteRow.toolName} order updated to ${Number(value)}.`);
    selectRow(voteRow.toolId);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error || "Toolbox vote order unavailable.");
    setStatus(`Toolbox vote order could not be updated. ${message}`);
  }
}

function renderToolboxVotes() {
  if (window.GameFoundrySessionGuard?.blocked) {
    return;
  }
  try {
    renderSnapshot(readToolboxVoteSnapshot());
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error || "Toolbox votes unavailable.");
    renderRows([]);
    setStatus(`Toolbox votes unavailable. ${message}`);
  }
}

renderToolboxVotes();
