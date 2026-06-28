import {
  readToolboxVoteSnapshot,
  reorderToolboxVoteRows,
  updateToolboxVoteMetadata,
} from "../../src/api/toolbox-votes-api-client.js";
import { getToolboxContract } from "../toolbox/tool-registry-api-client.js";

const status = document.querySelector("[data-toolbox-votes-status]");
const dragStatus = document.querySelector("[data-toolbox-votes-drag-status]");
const body = document.querySelector("[data-toolbox-votes-body]");
const sortButtons = Array.from(document.querySelectorAll("[data-toolbox-votes-sort]"));
const sortHeaders = Array.from(document.querySelectorAll("[data-toolbox-votes-sort-header]"));
const stateHelp = document.querySelector("[data-toolbox-votes-state-help]");
const sortButtonLabels = new Map(sortButtons.map((button) => [
  button.dataset.toolboxVotesSort,
  button.textContent.trim(),
]));

const toolboxContract = getToolboxContract();
const releaseChannelLabels = toolboxContract.releaseChannelLabels || {};
const releaseChannelHelpText = toolboxContract.releaseChannelHelpText || {};
const RELEASE_CHANNEL_OPTIONS = Object.freeze((toolboxContract.releaseChannels || []).map((channel) => [
  channel,
  releaseChannelLabels[channel] || channel,
]));
const RELEASE_CHANNEL_LABELS = new Map(RELEASE_CHANNEL_OPTIONS);
const GROUP_OPTIONS = Object.freeze([...(toolboxContract.groups || [])]);
const DEFAULT_RELEASE_CHANNEL = RELEASE_CHANNEL_OPTIONS[0]?.[0] || "planned";

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
  const path = String(voteRow.path || "").trim().replace(/^\/+/, "");
  link.href = path ? `/${path}` : "#";
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

function updateMetadata(voteRow, updates, successLabel) {
  const nextGroup = updates.group ?? voteRow.group;
  const nextPath = updates.path ?? voteRow.path;
  const nextState = updates.status ?? rowReleaseChannel(voteRow);
  try {
    const snapshot = updateToolboxVoteMetadata(voteRow.toolId, {
      group: nextGroup,
      path: nextPath,
      status: nextState,
      releaseChannel: nextState,
    });
    window.setTimeout(() => {
      renderSnapshot(snapshot, `${voteRow.toolName} ${successLabel}. Toolbox Build Path uses the same metadata.`);
      selectRow(voteRow.toolId);
    }, 0);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error || "Toolbox metadata update unavailable.");
    setStatus(`${voteRow.toolName} metadata could not be updated. ${message}`);
    renderRows(snapshotRows);
  }
}

function groupCell(voteRow) {
  const cell = document.createElement("td");
  const select = document.createElement("select");
  const currentGroup = String(voteRow.group || "").trim();
  const options = GROUP_OPTIONS.includes(currentGroup) || !currentGroup
    ? [...GROUP_OPTIONS]
    : [...GROUP_OPTIONS, currentGroup];
  select.dataset.toolboxVotesGroup = voteRow.toolId;
  select.setAttribute("aria-label", `Group for ${voteRow.toolName}`);
  options.forEach((group) => {
    const option = document.createElement("option");
    option.value = group;
    option.textContent = group;
    select.append(option);
  });
  select.value = currentGroup || GROUP_OPTIONS[0] || "";
  select.addEventListener("click", (event) => {
    event.stopPropagation();
  });
  select.addEventListener("change", () => {
    if (select.value !== currentGroup) {
      updateMetadata(voteRow, { group: select.value }, `group updated to ${select.value}`);
    }
  });
  cell.append(select);
  return cell;
}

function pathCell(voteRow) {
  const cell = document.createElement("td");
  const input = document.createElement("input");
  input.dataset.toolboxVotesPath = voteRow.toolId;
  input.setAttribute("aria-label", `Path for ${voteRow.toolName}`);
  input.type = "text";
  input.value = voteRow.path || "";
  input.addEventListener("click", (event) => {
    event.stopPropagation();
  });
  input.addEventListener("change", () => {
    const nextPath = input.value.trim().replace(/^\/+/, "");
    if (nextPath !== voteRow.path) {
      updateMetadata(voteRow, { path: nextPath }, "path updated");
    }
  });
  cell.append(input);
  return cell;
}

function releaseChannelLabel(value) {
  return RELEASE_CHANNEL_LABELS.get(value) || RELEASE_CHANNEL_LABELS.get(DEFAULT_RELEASE_CHANNEL) || value || DEFAULT_RELEASE_CHANNEL;
}

function releaseChannelHelp(value) {
  return releaseChannelHelpText[value] || releaseChannelHelpText[DEFAULT_RELEASE_CHANNEL] || "";
}

function compactHelpText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function statusHelpSummary() {
  return RELEASE_CHANNEL_OPTIONS.map(([value, label]) => {
    const help = compactHelpText(releaseChannelHelp(value));
    return help ? `${label}: ${help}` : label;
  }).join(" ");
}

function renderStatusHelp() {
  const summary = statusHelpSummary();
  if (stateHelp) {
    stateHelp.textContent = `State definitions: ${summary}`;
    stateHelp.title = summary;
  }
  const stateSortButton = sortButtons.find((button) => button.dataset.toolboxVotesSort === "releaseChannelLabel");
  if (stateSortButton) {
    stateSortButton.title = summary;
  }
}

function rowReleaseChannel(voteRow) {
  const value = String(voteRow.status || voteRow.releaseChannel || "").trim().toLowerCase();
  return RELEASE_CHANNEL_LABELS.has(value) ? value : DEFAULT_RELEASE_CHANNEL;
}

function stateCell(voteRow) {
  const cell = document.createElement("td");
  const select = document.createElement("select");
  const currentState = rowReleaseChannel(voteRow);
  select.dataset.toolboxVotesState = voteRow.toolId;
  select.setAttribute("aria-label", `State for ${voteRow.toolName}`);
  select.title = `${releaseChannelLabel(currentState)}: ${compactHelpText(releaseChannelHelp(currentState))}`;
  const options = RELEASE_CHANNEL_OPTIONS.length ? RELEASE_CHANNEL_OPTIONS : [[currentState, currentState]];
  options.forEach(([value, label]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    option.title = `${label}: ${compactHelpText(releaseChannelHelp(value))}`;
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
  if (nextState === rowReleaseChannel(voteRow)) {
    return;
  }
  updateMetadata(voteRow, { status: nextState }, `state updated to ${releaseChannelLabel(nextState)}`);
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
      groupCell(voteRow),
      pathCell(voteRow),
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

renderStatusHelp();
renderToolboxVotes();
