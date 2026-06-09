import { readToolboxVoteSnapshot } from "../src/engine/api/toolbox-votes-api-client.js";

const status = document.querySelector("[data-toolbox-votes-status]");
const body = document.querySelector("[data-toolbox-votes-body]");

function setStatus(message) {
  if (status) {
    status.textContent = message;
  }
}

function tableCell(value) {
  const cell = document.createElement("td");
  cell.textContent = String(value || "");
  return cell;
}

function renderRows(rows) {
  if (!body) {
    return;
  }
  if (!rows.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 6;
    cell.textContent = "No Toolbox vote rows are available.";
    row.append(cell);
    body.replaceChildren(row);
    return;
  }

  body.replaceChildren(...rows.map((voteRow) => {
    const row = document.createElement("tr");
    row.dataset.toolboxVotesToolId = voteRow.toolId;
    row.append(
      tableCell(voteRow.toolName),
      tableCell(voteRow.group),
      tableCell(voteRow.releaseChannelLabel),
      tableCell(voteRow.up),
      tableCell(voteRow.down),
      tableCell(voteRow.currentUserVote || "None"),
    );
    return row;
  }));
}

function renderToolboxVotes() {
  if (window.GameFoundrySessionGuard?.blocked) {
    return;
  }
  try {
    const snapshot = readToolboxVoteSnapshot();
    renderRows(snapshot.rows || []);
    setStatus(`Showing Toolbox vote totals for ${snapshot.currentUserName || "current session"}.`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error || "Toolbox votes unavailable.");
    renderRows([]);
    setStatus(`Toolbox votes unavailable. ${message}`);
  }
}

renderToolboxVotes();

