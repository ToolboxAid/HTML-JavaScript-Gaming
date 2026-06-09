import {
  readToolboxVoteSnapshot,
  reorderToolboxVoteRows,
  updateToolboxVoteMetadata,
} from "../src/engine/api/toolbox-votes-api-client.js";

const status = document.querySelector("[data-toolbox-votes-status]");
const dragStatus = document.querySelector("[data-toolbox-votes-drag-status]");
const body = document.querySelector("[data-toolbox-votes-body]");
const sortButtons = Array.from(document.querySelectorAll("[data-toolbox-votes-sort]"));
const sortHeaders = Array.from(document.querySelectorAll("[data-toolbox-votes-sort-header]"));
const sortButtonLabels = new Map(sortButtons.map((button) => [
  button.dataset.toolboxVotesSort,
  button.textContent.trim(),
]));

const RELEASE_CHANNEL_OPTIONS = Object.freeze([
  ["planned", "Planned"],
  ["wireframe", "Wireframe"],
  ["beta", "Beta"],
  ["complete", "Complete"],
]);
const RELEASE_CHANNEL_LABELS = new Map(RELEASE_CHANNEL_OPTIONS);

const SORT_TYPES = Object.freeze({
  down: "number",
  downPercent: "number",
  order: "number",
  totalVotes: "number",
  up: "number",
  upPercent: "number",
});

let selectedToolId = "";
let snapshotRows = [];
let draggedToolId = "";
let sortState = {
  direction: "asc",
  key: "order",
};

function setStatus(message) {
  if (status) {
    status.textContent = message;
  }
}

function sortLabel(key) {
  return sortButtonLabels.get(key) || key;
}

function isOrderSort() {
  return sortState.key === "order";
}

function wholeNumberOrder(value) {
  const order = Number(value);
  return Math.max(1, Math.round(Number.isFinite(order) ? order : 1));
}

function tableCell(value) {
  const cell = document.createElement("td");
  cell.textContent = value === null || value === undefined ? "" : String(value);
  return cell;
}

function percentCell(value) {
  const percent = Number(value);
  return tableCell(`${Number.isFinite(percent) ? percent : 0}%`);
}

function toolNameCell(voteRow) {
  const cell = document.createElement("td");
  const link = document.createElement("a");
  link.href = voteRow.path || "#";
  link.textContent = voteRow.toolName;
  link.setAttribute("aria-label", `Open ${voteRow.toolName}`);
  cell.append(link);
  return cell;
}

function orderCell(voteRow) {
  const cell = tableCell(wholeNumberOrder(voteRow.order));
  cell.dataset.toolboxVotesOrder = voteRow.toolId;
  cell.title = isOrderSort()
    ? "Drag this row to update Toolbox order."
    : "Sort by Order to enable drag/drop ordering.";
  return cell;
}

function releaseChannelLabel(value) {
  return RELEASE_CHANNEL_LABELS.get(value) || RELEASE_CHANNEL_LABELS.get("planned");
}

function stateCell(voteRow) {
  const cell = document.createElement("td");
  const select = document.createElement("select");
  const currentState = RELEASE_CHANNEL_LABELS.has(voteRow.releaseChannel) ? voteRow.releaseChannel : "planned";
  select.dataset.toolboxVotesState = voteRow.toolId;
  select.setAttribute("aria-label", `State for ${voteRow.toolName}`);
  RELEASE_CHANNEL_OPTIONS.forEach(([value, label]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    select.append(option);
  });
  select.value = currentState;
  select.addEventListener("click", (event) => {
    event.stopPropagation();
  });
  select.addEventListener("change", () => {
    handleStateChange(voteRow, select);
  });
  cell.append(select);
  return cell;
}

function handleStateChange(voteRow, select) {
  const nextState = select.value;
  if (nextState === voteRow.releaseChannel) {
    return;
  }
  try {
    const snapshot = updateToolboxVoteMetadata(voteRow.toolId, {
      group: voteRow.group,
      path: voteRow.path,
      releaseChannel: nextState,
    });
    renderSnapshot(snapshot, `${voteRow.toolName} state updated to ${releaseChannelLabel(nextState)}. Toolbox Build Path uses the same metadata.`);
    selectRow(voteRow.toolId);
  } catch (error) {
    select.value = RELEASE_CHANNEL_LABELS.has(voteRow.releaseChannel) ? voteRow.releaseChannel : "planned";
    const message = error instanceof Error ? error.message : String(error || "Toolbox state update unavailable.");
    setStatus(`${voteRow.toolName} state could not be updated. ${message}`);
  }
}

function sortValue(voteRow, key) {
  if (key === "currentUserVote") {
    return voteRow.currentUserVote || "None";
  }
  if (key === "order") {
    return wholeNumberOrder(voteRow.order);
  }
  return voteRow[key] ?? "";
}

function sortedRows() {
  const direction = sortState.direction === "asc" ? 1 : -1;
  return [...snapshotRows].sort((left, right) => {
    const leftValue = sortValue(left, sortState.key);
    const rightValue = sortValue(right, sortState.key);
    if (SORT_TYPES[sortState.key] === "number") {
      return (Number(leftValue) - Number(rightValue)) * direction;
    }
    return String(leftValue).localeCompare(String(rightValue)) * direction;
  });
}

function updateSortHeaders() {
  sortHeaders.forEach((header) => {
    const selected = header.dataset.toolboxVotesSortHeader === sortState.key;
    header.setAttribute("aria-sort", selected ? (sortState.direction === "asc" ? "ascending" : "descending") : "none");
    const button = header.querySelector("[data-toolbox-votes-sort]");
    if (!button) {
      return;
    }
    const baseLabel = sortButtonLabels.get(button.dataset.toolboxVotesSort) || button.textContent.trim();
    button.textContent = selected ? `${baseLabel} ${sortState.direction === "asc" ? "↑" : "↓"}` : baseLabel;
    button.classList.toggle("primary", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}

function updateDragStatus() {
  if (!dragStatus) {
    return;
  }
  if (isOrderSort()) {
    dragStatus.textContent = "Drag/drop row ordering is enabled while sorted by Order.";
    return;
  }
  dragStatus.textContent = `Drag/drop row ordering is disabled while sorted by ${sortLabel(sortState.key)}. Sort by Order to reorder.`;
}

function selectRow(toolId) {
  selectedToolId = String(toolId || "");
  body?.querySelectorAll("tr[data-toolbox-votes-tool-id]").forEach((row) => {
    row.setAttribute("aria-selected", String(row.dataset.toolboxVotesToolId === selectedToolId));
  });
}

function orderedToolIdsAfterDrop(targetToolId, event) {
  const displayToolIds = sortedRows().map((row) => row.toolId).filter((toolId) => toolId !== draggedToolId);
  const targetIndex = displayToolIds.indexOf(targetToolId);
  if (targetIndex === -1) {
    return null;
  }
  const targetRow = event.currentTarget;
  const targetBox = targetRow.getBoundingClientRect();
  const insertAfterTarget = event.clientY > targetBox.top + (targetBox.height / 2);
  displayToolIds.splice(targetIndex + (insertAfterTarget ? 1 : 0), 0, draggedToolId);
  return sortState.direction === "desc" ? displayToolIds.reverse() : displayToolIds;
}

function handleDragStart(event, voteRow) {
  if (!isOrderSort()) {
    event.preventDefault();
    updateDragStatus();
    return;
  }
  draggedToolId = voteRow.toolId;
  selectRow(voteRow.toolId);
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", voteRow.toolId);
}

function handleDragOver(event) {
  if (!isOrderSort() || !draggedToolId) {
    return;
  }
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
}

function handleDrop(event, targetToolId) {
  if (!isOrderSort() || !draggedToolId || draggedToolId === targetToolId) {
    draggedToolId = "";
    return;
  }
  event.preventDefault();
  const orderedToolIds = orderedToolIdsAfterDrop(targetToolId, event);
  if (!orderedToolIds) {
    draggedToolId = "";
    return;
  }
  const movedToolId = draggedToolId;
  try {
    const snapshot = reorderToolboxVoteRows(orderedToolIds);
    renderSnapshot(snapshot, "Toolbox vote order updated. Rows were renumbered with whole-number order values.");
    selectRow(movedToolId);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error || "Toolbox vote row order unavailable.");
    setStatus(`Toolbox vote rows could not be reordered. ${message}`);
  } finally {
    draggedToolId = "";
  }
}

function renderRows(rows) {
  if (!body) {
    return;
  }
  snapshotRows = rows;
  updateSortHeaders();
  updateDragStatus();
  const displayRows = sortedRows();
  if (!displayRows.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 11;
    cell.textContent = "No Toolbox vote rows are available.";
    row.append(cell);
    body.replaceChildren(row);
    selectedToolId = "";
    return;
  }

  const allowDrag = isOrderSort();
  body.replaceChildren(...displayRows.map((voteRow) => {
    const row = document.createElement("tr");
    row.dataset.toolboxVotesToolId = voteRow.toolId;
    row.dataset.toolboxVotesDrag = allowDrag ? "enabled" : "disabled";
    row.setAttribute("aria-disabled", String(!allowDrag));
    row.setAttribute("draggable", String(allowDrag));
    row.title = allowDrag
      ? "Drag this row to reorder Toolbox tools."
      : `Drag/drop disabled while sorted by ${sortLabel(sortState.key)}.`;
    row.addEventListener("click", () => {
      selectRow(voteRow.toolId);
    });
    row.addEventListener("dragstart", (event) => {
      handleDragStart(event, voteRow);
    });
    row.addEventListener("dragover", handleDragOver);
    row.addEventListener("drop", (event) => {
      handleDrop(event, voteRow.toolId);
    });
    row.append(
      toolNameCell(voteRow),
      orderCell(voteRow),
      tableCell(voteRow.group),
      tableCell(voteRow.path),
      stateCell(voteRow),
      tableCell(voteRow.up),
      tableCell(voteRow.down),
      tableCell(voteRow.totalVotes),
      percentCell(voteRow.upPercent),
      percentCell(voteRow.downPercent),
      tableCell(voteRow.currentUserVote || "None"),
    );
    return row;
  }));

  const selectedRow = snapshotRows.find((row) => row.toolId === selectedToolId);
  selectRow(selectedRow ? selectedToolId : displayRows[0].toolId);
}

function renderSnapshot(snapshot, message) {
  renderRows(snapshot.rows || []);
  setStatus(message || `Showing Toolbox vote totals for ${snapshot.currentUserName || "current session"}.`);
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

sortButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const nextKey = button.dataset.toolboxVotesSort;
    if (sortState.key === nextKey) {
      sortState = {
        direction: sortState.direction === "asc" ? "desc" : "asc",
        key: nextKey,
      };
    } else {
      sortState = {
        direction: "asc",
        key: nextKey,
      };
    }
    renderRows(snapshotRows);
  });
});

renderToolboxVotes();
