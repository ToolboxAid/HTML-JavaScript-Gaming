import {
  GAME_JOURNEY_KEYS,
  GAME_JOURNEY_STATUS_BY_ID,
  GAME_JOURNEY_STATUSES,
  GAME_JOURNEY_SUGGESTED_TOOLS,
  createGameJourneyApiRepository,
} from "./game-journey-api-client.js";
import {
  getActiveToolRegistry,
  getToolRegistryApiDiagnostic,
} from "../tool-registry-api-client.js";

const repository = createGameJourneyApiRepository();
const registryDiagnostic = getToolRegistryApiDiagnostic();
const registryTools = getActiveToolRegistry();
const params = new URLSearchParams(window.location.search);
const DELETE_CONFIRMATION_MESSAGE = "It is best to keep the note unless it was created by mistake.";
const FORGE_BOT_INDICATOR_SRC = "assets/theme-v2/images/forge-bot.svg";

const filterButtons = Array.from(document.querySelectorAll("[data-journey-filter]"));
const sortButtons = Array.from(document.querySelectorAll("[data-journey-sort]"));
const sortHeaders = Array.from(document.querySelectorAll("[data-journey-sort-header]"));
const summaryBody = document.querySelector("[data-journey-summary-body]");
const itemTree = document.querySelector("[data-journey-item-tree]");
const selectedNoteMessage = document.querySelector("[data-journey-selected-note]");
const activeGameMessage = document.querySelector("[data-journey-active-game]");
const editorForm = document.querySelector("[data-journey-editor-form]");
const statusInput = document.querySelector("[data-journey-status-input]");
const titleInput = document.querySelector("[data-journey-title-input]");
const addItemButton = document.querySelector("[data-journey-add-item]");
const updateItemButton = document.querySelector("[data-journey-update-item]");
const newItemTitleInput = document.querySelector("[data-journey-new-item-title-input]");
const moveUpButton = document.querySelector("[data-journey-move-up]");
const moveDownButton = document.querySelector("[data-journey-move-down]");
const indentButton = document.querySelector("[data-journey-indent]");
const outdentButton = document.querySelector("[data-journey-outdent]");
const newNoteNameInput = document.querySelector("[data-journey-new-note-name]");
const newNoteTypeSelect = document.querySelector("[data-journey-new-note-type]");
const addNoteButton = document.querySelector("[data-journey-add-note]");
const noteStatus = document.querySelector("[data-journey-note-status]");
const noteTypeSelect = document.querySelector("[data-journey-note-type-select]");
const typeInput = document.querySelector("[data-journey-type-input]");
const addTypeButton = document.querySelector("[data-journey-add-type]");
const typeStatus = document.querySelector("[data-journey-type-status]");
const editorStatus = document.querySelector("[data-journey-editor-status]");
const statScope = document.querySelector("[data-journey-stat-scope]");
const suggestedTools = document.querySelector("[data-journey-suggested-tools]");
const recentActivity = document.querySelector("[data-journey-recent-activity]");
const diagnostics = document.querySelector("[data-journey-diagnostics]");
const searchInput = document.querySelector("[data-journey-search-input]");
const searchStatus = document.querySelector("[data-journey-search-status]");

const statTargets = {
  open: document.querySelector("[data-journey-stat-open]"),
  total: document.querySelector("[data-journey-stat-total]"),
  "not-started": document.querySelector("[data-journey-stat-not-started]"),
  "in-progress": document.querySelector("[data-journey-stat-in-progress]"),
  complete: document.querySelector("[data-journey-stat-complete]"),
  skipped: document.querySelector("[data-journey-stat-skipped]"),
  blocker: document.querySelector("[data-journey-stat-blocker]"),
  decide: document.querySelector("[data-journey-stat-decide]"),
};
const sortButtonLabels = new Map(
  sortButtons.map((button) => [button.dataset.journeySort, button.textContent.trim()]),
);

let activeFilter = "all";
let selectedSummaryNoteKey = GAME_JOURNEY_KEYS.notes.designPass;
let selectedSummaryNoteKeyBeforeSearch = GAME_JOURNEY_KEYS.notes.designPass;
let searchSelectionSnapshotTaken = false;
let preferredNewNoteTypeKey = "";
let statusSelectionChanged = false;
let summarySort = {
  key: "updated",
  direction: "desc",
};

function applyInitialGameRoute() {
  const gameId = params.get("game");
  if (gameId === "none") {
    repository.clearActiveGame();
    return;
  }

  if (gameId) {
    repository.openGame(gameId);
  }

  if (params.get("templateDiagnostic") === "all") {
    repository.injectTemplateDiagnostics();
  }
}

function createElement(tagName, options = {}) {
  const element = document.createElement(tagName);
  if (options.className) {
    element.className = options.className;
  }
  if (options.text !== undefined) {
    element.textContent = options.text;
  }
  return element;
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function setEditingDisabled(disabled) {
  [
    statusInput,
    titleInput,
    newItemTitleInput,
    addItemButton,
    updateItemButton,
    moveUpButton,
    moveDownButton,
    indentButton,
    outdentButton,
    newNoteNameInput,
    newNoteTypeSelect,
    addNoteButton,
    noteTypeSelect,
    typeInput,
    addTypeButton,
    searchInput,
  ].forEach((control) => {
    if (control) {
      control.disabled = disabled;
    }
  });
}

function setGameScopedControlsDisabled(disabled) {
  [
    searchInput,
  ].forEach((control) => {
    if (control) {
      control.disabled = disabled;
    }
  });
}

function setGameWriteControlsDisabled(disabled) {
  [
    newNoteNameInput,
    newNoteTypeSelect,
    addNoteButton,
    typeInput,
    addTypeButton,
  ].forEach((control) => {
    if (control) {
      control.disabled = disabled;
    }
  });
}

function updateFilterButtons() {
  filterButtons.forEach((button) => {
    const selected = button.dataset.journeyFilter === activeFilter;
    button.setAttribute("aria-pressed", String(selected));
    button.classList.toggle("primary", selected);
    if (selected) {
      button.setAttribute("aria-current", "true");
    } else {
      button.removeAttribute("aria-current");
    }
  });
}

function renderStatusOptions() {
  statusInput.innerHTML = "";
  GAME_JOURNEY_STATUSES.forEach((status) => {
    const option = createElement("option", {
      text: `${status.icon} ${status.label}`,
    });
    option.value = status.id;
    statusInput.append(option);
  });
}

function populateNoteTypeSelect(selectElement, types, selectedTypeId) {
  if (!selectElement) {
    return;
  }
  selectElement.innerHTML = "";
  types.forEach((type) => {
    const option = createElement("option", { text: type.name });
    option.value = type.key;
    selectElement.append(option);
  });
  selectElement.value = selectedTypeId || types[0]?.key || "";
}

function renderNoteTypeOptions(note) {
  const types = repository.listNoteTypes();
  populateNoteTypeSelect(noteTypeSelect, types, note?.typeKey || "");
  populateNoteTypeSelect(newNoteTypeSelect, types, preferredNewNoteTypeKey || note?.typeKey || "");
}

function createStatusText(statusId) {
  const status = GAME_JOURNEY_STATUS_BY_ID[statusId];
  return status ? `${status.icon} ${status.label}` : "Unknown";
}

function isSystemGeneratedFilter() {
  return activeFilter === "system";
}

function systemUserKey() {
  return repository.getSystemUser().userKey;
}

function isSystemItem(item) {
  return Boolean(item && item.createdBy === systemUserKey());
}

function isUserItem(item) {
  return Boolean(item && !isSystemItem(item));
}

function countItems(items) {
  return items.reduce((counts, item) => {
    const status = GAME_JOURNEY_STATUS_BY_ID[item.status];
    if (!status) {
      return counts;
    }
    counts.total += 1;
    counts[item.status] += 1;
    if (status.open) {
      counts.open += 1;
    }
    return counts;
  }, emptyCounts());
}

function filterNoteItemsForDisplay(note) {
  if (!note || !isSystemGeneratedFilter()) {
    return note;
  }
  const items = note.items.filter(isSystemItem);
  return {
    ...note,
    items,
    counts: countItems(items),
  };
}

function ensureSelectedItemMatchesFilter(note) {
  if (!note || !isSystemGeneratedFilter()) {
    return;
  }

  const selectedItem = getSelectedItem();
  const selectedVisible = note.items.some(
    (item) => item.key === selectedItem?.key && isSystemItem(item),
  );
  if (!selectedVisible) {
    const firstSystemItem = note.items.find(isSystemItem);
    if (firstSystemItem) {
      repository.selectItem(firstSystemItem.key);
    }
  }
}

function getSelectedItem() {
  return repository.getSelectedItem();
}

function summarySortValue(note, key) {
  if (key === "name") {
    return note.name.toLowerCase();
  }
  if (key === "type") {
    return (note.type?.name || "Unknown").toLowerCase();
  }
  if (key === "updated") {
    return note.updatedAt;
  }
  if (["not-started", "blocker", "decide", "in-progress", "complete", "skipped", "open", "total"].includes(key)) {
    return note.counts?.[key] || 0;
  }
  return "";
}

function sortSummaryNotes(notes) {
  const direction = summarySort.direction === "asc" ? 1 : -1;
  return [...notes].sort((left, right) => {
    const leftValue = summarySortValue(left, summarySort.key);
    const rightValue = summarySortValue(right, summarySort.key);
    if (typeof leftValue === "number" && typeof rightValue === "number") {
      return (leftValue - rightValue) * direction;
    }
    return String(leftValue).localeCompare(String(rightValue)) * direction;
  });
}

function updateSortHeaders() {
  sortHeaders.forEach((header) => {
    const selected = header.dataset.journeySortHeader === summarySort.key;
    header.setAttribute("aria-sort", selected ? (summarySort.direction === "asc" ? "ascending" : "descending") : "none");
    const button = header.querySelector("[data-journey-sort]");
    if (button) {
      const baseLabel = sortButtonLabels.get(button.dataset.journeySort) || button.textContent.trim();
      button.textContent = selected ? `${baseLabel} ${summarySort.direction === "asc" ? "↑" : "↓"}` : baseLabel;
      button.classList.toggle("primary", selected);
      button.setAttribute("aria-pressed", String(selected));
    }
  });
}

function renderSummary(notes) {
  summaryBody.innerHTML = "";
  updateSortHeaders();

  if (!notes.length) {
    const row = createElement("tr");
    const cell = createElement("td", {
      text: "No notes match the current Game Journey filter.",
    });
    cell.colSpan = 11;
    row.append(cell);
    summaryBody.append(row);
    return;
  }

  sortSummaryNotes(notes).forEach((note) => {
    const row = createElement("tr");
    const nameCell = createElement("td");
    const selected = selectedSummaryNoteKey === note.key;
    const noteButton = createElement("button", {
      className: selected ? "btn btn--compact primary" : "btn btn--compact",
      text: note.name,
    });
    noteButton.type = "button";
    noteButton.dataset.journeyNoteButton = note.key;
    noteButton.setAttribute("aria-pressed", String(selected));
    if (selected) {
      noteButton.setAttribute("aria-current", "true");
    }
    nameCell.append(noteButton);
    row.append(
      nameCell,
      createElement("td", { text: note.type?.name || "Unknown" }),
      createElement("td", { text: String(note.counts["not-started"]) }),
      createElement("td", { text: String(note.counts.blocker) }),
      createElement("td", { text: String(note.counts.decide) }),
      createElement("td", { text: String(note.counts["in-progress"]) }),
      createElement("td", { text: String(note.counts.complete) }),
      createElement("td", { text: String(note.counts.skipped) }),
      createElement("td", { text: String(note.counts.open) }),
      createElement("td", { text: String(note.counts.total) }),
      createElement("td", { text: formatDate(note.updatedAt) }),
    );
    summaryBody.append(row);
  });
}

function makeItemButton(item) {
  const selectedItem = getSelectedItem();
  const selected = selectedItem?.key === item.key;
  const detailsPreview = item.userDetails ? ` - ${item.userDetails}` : "";
  const button = createElement("button", {
    className: selected ? "btn btn--compact primary tool-tree-row__content" : "btn btn--compact tool-tree-row__content",
    text: `${createStatusText(item.status)} ${item.title}${detailsPreview}`,
  });
  button.type = "button";
  button.dataset.journeyItemButton = item.key;
  button.dataset.journeyItemStatus = item.status;
  button.setAttribute("aria-pressed", String(selected));
  return button;
}

function createSystemItemIndicator() {
  const indicator = createElement("img", {
    className: "tool-icon-32 tool-tree-row__action",
  });
  indicator.src = FORGE_BOT_INDICATOR_SRC;
  indicator.alt = "forge-bot created";
  indicator.title = "forge-bot created";
  indicator.width = 32;
  indicator.height = 32;
  indicator.dataset.journeySystemItemIndicator = "";
  return indicator;
}

function createDeleteItemButton(item) {
  const button = createElement("button", {
    className: "btn btn--compact tool-icon-button tool-tree-row__action",
  });
  const icon = createElement("span", {
    className: "fa fa-trash",
  });
  button.type = "button";
  button.title = "Delete user-created item";
  button.setAttribute("aria-label", "Delete user-created item");
  icon.setAttribute("aria-hidden", "true");
  button.append(icon);
  button.dataset.journeyDeleteItem = item.key;
  return button;
}

function makeItemRowContent(item) {
  const row = createElement("span", {
    className: "tool-tree-row tool-tree-row--single-line",
  });
  row.dataset.journeyItemRow = item.key;
  row.append(makeItemButton(item));
  if (isUserItem(item)) {
    row.append(createDeleteItemButton(item));
  } else {
    row.append(createSystemItemIndicator());
  }
  return row;
}

function makeSelectedItemDetails(item, editingDisabled) {
  const details = createElement("div", {
    className: "content-stack content-stack--compact",
  });
  details.dataset.journeySelectedItemDetails = item.key;

  if (isSystemItem(item)) {
    const guidance = createElement("div", {
      className: "status content-cluster tool-guidance-block",
    });
    guidance.dataset.journeySystemGuidance = "";
    const heading = createElement("strong", { text: "System Guidance" });
    const body = createElement("span", {
      text: item.systemGuidance || "System guidance is unavailable until the linked template is repaired.",
    });
    guidance.append(heading, body);
    details.append(guidance);
  }

  const label = createElement("label");
  label.setAttribute("for", "journeyItemDetailsInput");
  label.textContent = "Item Details";
  const textarea = createElement("textarea");
  textarea.id = "journeyItemDetailsInput";
  textarea.rows = 4;
  textarea.value = item.userDetails || "";
  textarea.disabled = editingDisabled;
  textarea.dataset.journeyItemDetailsInput = "";
  const wrapper = createElement("div", {
    className: "table-wrapper",
  });
  const table = createElement("table", {
    className: "data-table tool-form-table",
  });
  table.setAttribute("aria-label", "Selected journey item details");
  const tableBody = createElement("tbody");
  const row = createElement("tr");
  const header = createElement("th");
  header.scope = "row";
  const cell = createElement("td");
  header.append(label);
  cell.append(textarea);
  row.append(header, cell);
  tableBody.append(row);
  table.append(tableBody);
  wrapper.append(table);
  details.append(wrapper);
  return details;
}

function renderItemTree(note, editingDisabled) {
  itemTree.innerHTML = "";

  if (!note || !note.items.length) {
    itemTree.append(createElement("p", { text: "No journey items yet." }));
    return;
  }

  const selectedItem = getSelectedItem();
  const root = createElement("ul", {
    className: "tool-tree--compact",
  });
  root.setAttribute("role", "tree");
  const lists = [root];
  const lastItems = [];

  note.items.forEach((item) => {
    let indent = Math.max(0, Math.min(Number(item.indent) || 0, 4));
    if (indent > lastItems.length) {
      indent = lastItems.length;
    }

    while (lists.length > indent + 1) {
      lists.pop();
      lastItems.pop();
    }

    if (indent > 0 && !lists[indent]) {
      const parent = lastItems[indent - 1];
      if (parent) {
        const childList = createElement("ul");
        parent.append(childList);
        lists[indent] = childList;
      }
    }

    const itemElement = createElement("li");
    itemElement.setAttribute("role", "treeitem");
    itemElement.append(makeItemRowContent(item));
    if (selectedItem?.key === item.key) {
      itemElement.append(makeSelectedItemDetails(item, editingDisabled));
    }
    lists[indent].append(itemElement);
    lastItems[indent] = itemElement;
  });

  itemTree.append(root);
}

function renderEditor(editingDisabled, note) {
  const selectedItem = getSelectedItem();
  statusSelectionChanged = false;
  if (!selectedItem) {
    const canAddItem = Boolean(!editingDisabled && note);
    statusInput.value = "not-started";
    titleInput.value = "";
    statusInput.disabled = !canAddItem;
    titleInput.disabled = !canAddItem;
    addItemButton.disabled = !canAddItem;
    updateItemButton.disabled = true;
    moveUpButton.disabled = true;
    moveDownButton.disabled = true;
    indentButton.disabled = true;
    outdentButton.disabled = true;
    if (editorStatus) {
      if (canAddItem) {
        editorStatus.textContent = "No item selected. Add Item will create a user-created editable item.";
      } else if (!repository.getSessionUser().userKey) {
        editorStatus.textContent = "Guest is unauthenticated. Log in as a user before editing Game Journey records.";
      } else {
        editorStatus.textContent = "Select a journey item to review ownership.";
      }
    }
    return;
  }

  statusInput.value = selectedItem.status;
  titleInput.value = selectedItem.title;
  statusInput.disabled = editingDisabled;
  titleInput.disabled = Boolean(editingDisabled || isSystemItem(selectedItem));
  addItemButton.disabled = editingDisabled;
  updateItemButton.disabled = editingDisabled;
  moveUpButton.disabled = editingDisabled;
  moveDownButton.disabled = editingDisabled;
  indentButton.disabled = editingDisabled;
  outdentButton.disabled = editingDisabled;
  if (editorStatus) {
    editorStatus.textContent =
      isSystemItem(selectedItem)
        ? `System-created item. Title and guidance are template-owned by ${selectedItem.template?.templateSlug || selectedItem.templateKey || "missing template"}; status and Item Details are editable. Original meaning: ${selectedItem.originalMeaning || "Unavailable"}`
        : "User-created item. Title, status, and Item Details are editable.";
  }
}

function emptyCounts() {
  return {
    total: 0,
    open: 0,
    "not-started": 0,
    "in-progress": 0,
    complete: 0,
    skipped: 0,
    blocker: 0,
    decide: 0,
  };
}

function aggregateCounts(notes) {
  return notes.reduce((counts, note) => {
    Object.keys(counts).forEach((key) => {
      counts[key] += note.counts?.[key] || 0;
    });
    return counts;
  }, emptyCounts());
}

function normalizeSearchText(value) {
  return String(value || "").trim().toLowerCase();
}

function currentSearchQuery() {
  return normalizeSearchText(searchInput?.value || "");
}

function matchesSearch(value, query) {
  return normalizeSearchText(value).includes(query);
}

function itemMatchesSearch(item, query) {
  const status = GAME_JOURNEY_STATUS_BY_ID[item.status];
  const values = [
    item.title,
    item.userDetails,
    item.systemGuidance,
    status?.label,
    status ? `${status.icon} ${status.label}` : "",
    ...(item.linkedToolContexts || []),
  ];
  return values.some((value) => matchesSearch(value, query));
}

function noteMatchesSearch(note, query) {
  const values = [
    note.name,
    note.type?.name,
    note.type?.typeSlug,
    ...note.items.flatMap((item) => item.linkedToolContexts || []),
    ...getSuggestedToolNames(note),
  ];
  return values.some((value) => matchesSearch(value, query));
}

function visibleItemsForActiveFilter(note) {
  if (!note) {
    return [];
  }
  if (isSystemGeneratedFilter()) {
    return note.items.filter(isSystemItem);
  }
  return note.items;
}

function applySearch(notes, query) {
  if (!query) {
    return notes;
  }

  return notes
    .map((note) => {
      const visibleItems = visibleItemsForActiveFilter(note);
      const matchedItems = visibleItems.filter((item) => itemMatchesSearch(item, query));
      const noteMatched = noteMatchesSearch(note, query);
      const items = noteMatched && !matchedItems.length ? visibleItems : matchedItems;
      if (!noteMatched && !matchedItems.length) {
        return null;
      }
      return {
        ...note,
        items,
        counts: countItems(items),
      };
    })
    .filter(Boolean);
}

function activeFilterLabel() {
  return (
    filterButtons.find((button) => button.dataset.journeyFilter === activeFilter)?.textContent?.trim() ||
    "All Notes"
  );
}

function renderStatScope(selectedStatsNote, notes) {
  if (!statScope) {
    return;
  }
  if (selectedStatsNote) {
    statScope.textContent = `Statistics for selected note: ${selectedStatsNote.name}.`;
    return;
  }
  statScope.textContent = `Statistics for filtered result set: ${activeFilterLabel()} (${notes.length} notes).`;
}

function renderStats(counts) {
  Object.entries(statTargets).forEach(([key, target]) => {
    if (target) {
      target.textContent = String(counts[key] || 0);
    }
  });
}

function renderSearchStatus(query, notes) {
  if (!searchStatus) {
    return;
  }
  searchStatus.textContent = query
    ? `Search matched ${notes.length} note${notes.length === 1 ? "" : "s"}.`
    : "Search is clear.";
}

function sessionUserCanWrite() {
  return Boolean(repository.getSessionUser().userKey);
}

function redirectGuestWriteAction(statusTarget) {
  if (sessionUserCanWrite()) {
    return false;
  }
  const message = "Sign in before saving Game Journey changes.";
  if (statusTarget) {
    statusTarget.textContent = message;
  }
  window.location.href = new URL("../../account/sign-in.html", window.location.href).href;
  return true;
}

function enableGuestSignInWriteActions(activeGame, canWrite) {
  if (!activeGame || canWrite) {
    return;
  }
  [
    addItemButton,
    updateItemButton,
    moveUpButton,
    moveDownButton,
    indentButton,
    outdentButton,
    addNoteButton,
    addTypeButton,
  ].forEach((control) => {
    if (control) {
      control.disabled = false;
    }
  });
}

function captureSearchSelectionSnapshot() {
  if (!searchSelectionSnapshotTaken) {
    selectedSummaryNoteKeyBeforeSearch = selectedSummaryNoteKey;
    searchSelectionSnapshotTaken = true;
  }
}

function restoreSearchSelectionSnapshot() {
  selectedSummaryNoteKey = selectedSummaryNoteKeyBeforeSearch;
  if (selectedSummaryNoteKey) {
    repository.selectNote(selectedSummaryNoteKey);
  }
  searchSelectionSnapshotTaken = false;
  selectedSummaryNoteKeyBeforeSearch = selectedSummaryNoteKey;
}

function ensureSelectedItemVisible(note) {
  if (!note?.items.length) {
    return;
  }
  const selectedItem = getSelectedItem();
  if (!note.items.some((item) => item.key === selectedItem?.key)) {
    repository.selectItem(note.items[0].key);
  }
}

function findToolByName(name) {
  return registryTools.find((tool) => tool.displayName === name || tool.name === name);
}

function getSuggestedToolNames(note) {
  if (!note) {
    return GAME_JOURNEY_SUGGESTED_TOOLS.default || [];
  }

  const selectedItem = getSelectedItem();
  const templateToolNames = selectedItem?.linkedToolContexts?.filter((context) =>
    registryTools.some((tool) => tool.displayName === context || tool.name === context),
  ) || [];
  const noteTypeSlug = note.type?.typeSlug || "";
  const names = [
    ...templateToolNames,
    ...(
      GAME_JOURNEY_SUGGESTED_TOOLS.byNoteType?.[noteTypeSlug] ||
      GAME_JOURNEY_SUGGESTED_TOOLS.default ||
      []
    ),
  ];

  if (note.counts?.blocker > 0) {
    return [...(GAME_JOURNEY_SUGGESTED_TOOLS.blocker || []), ...names];
  }

  return names;
}

function groupSlug(groupName) {
  return String(groupName || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function renderSuggestedTools(note) {
  suggestedTools.innerHTML = "";
  if (registryDiagnostic) {
    suggestedTools.append(
      createElement("p", {
        text: `Suggested Tools could not load from the server API: ${registryDiagnostic}`,
      }),
    );
    return;
  }

  const seen = new Set();
  const toolNames = getSuggestedToolNames(note);
  const matchedTools = toolNames
    .map(findToolByName)
    .filter(Boolean)
    .filter((tool) => {
      if (seen.has(tool.id)) {
        return false;
      }
      seen.add(tool.id);
      return true;
    });

  if (!matchedTools.length) {
    suggestedTools.append(
      createElement("p", {
        text: "No suggested tools are available for the selected note yet.",
      }),
    );
    return;
  }

  matchedTools.forEach((tool) => {
    const link = createElement("a", {
      className: "btn btn--compact",
      text: tool.displayName || tool.name,
    });
    const group = groupSlug(tool.toolboxGroup || tool.category);
    link.href = `toolbox/index.html?view=group&group=${encodeURIComponent(group)}&context=game-journey&tool=${encodeURIComponent(tool.id)}`;
    suggestedTools.append(link);
  });
}

function renderRecentActivity() {
  recentActivity.innerHTML = "";
  const activity = repository.listRecentActivity();
  if (!activity.length) {
    recentActivity.append(
      createElement("p", {
        text: "No Game Journey activity is available for the active game yet.",
      }),
    );
    return;
  }

  const list = createElement("ul");
  activity.forEach((item) => {
    list.append(
      createElement("li", {
        text: `${item.message} (${formatDate(item.createdAt)})`,
      }),
    );
  });
  recentActivity.append(list);
}

function renderDiagnostics(activeGame, note, notes) {
  diagnostics.innerHTML = "";
  const messages = [];
  const canWrite = sessionUserCanWrite();

  if (!activeGame) {
    messages.push("No active game is open. Open a game in Game Workspace to enable editing.");
  } else {
    messages.push(`Active game: ${activeGame.name}.`);
  }

  if (activeGame && !canWrite) {
    messages.push("Guest is unauthenticated. Log in as User 1, User 2, User 3, or Admin before adding or editing Game Journey records.");
  }

  if (activeGame && !notes.length) {
    messages.push("The selected filter has no matching notes; switch filters or add items to an existing note.");
  }

  if (note) {
    const selectedItem = getSelectedItem();
    messages.push(`Selected note: ${note.name}.`);
    messages.push(`Total counts every item; Open counts ${GAME_JOURNEY_STATUS_BY_ID["not-started"].icon}, ${GAME_JOURNEY_STATUS_BY_ID.blocker.icon}, ${GAME_JOURNEY_STATUS_BY_ID.decide.icon}, and ${GAME_JOURNEY_STATUS_BY_ID["in-progress"].icon} items.`);
    if (selectedItem) {
      messages.push(`Selected item updatedBy: ${selectedItem.updatedBy}.`);
      messages.push(`Selected item createdBy: ${selectedItem.createdBy}.`);
    }
  }

  const templateDiagnostics = activeGame ? repository.getTemplateDiagnostics() : [];
  if (templateDiagnostics.length) {
    templateDiagnostics.forEach((diagnostic) => messages.push(diagnostic.message));
  } else if (activeGame) {
    messages.push("All system-created Game Journey items resolve active templates.");
  }

  const list = createElement("ul");
  messages.forEach((message) => {
    list.append(createElement("li", { text: message }));
  });
  diagnostics.append(list);
}

function selectFirstVisibleNote(notes) {
  const current = repository.getSelectedNote();
  const currentVisibleNote = notes.find((note) => note.key === current?.key);
  if (currentVisibleNote) {
    return currentVisibleNote;
  }

  if (notes[0]) {
    repository.selectNote(notes[0].key);
    return notes[0];
  }

  return null;
}

function render() {
  const activeGame = repository.getActiveGame();
  const searchQuery = currentSearchQuery();
  const notes = applySearch(repository.listNotes(activeFilter), searchQuery);
  const note = selectFirstVisibleNote(notes);
  ensureSelectedItemMatchesFilter(note);
  const displayNote = filterNoteItemsForDisplay(note);
  ensureSelectedItemVisible(displayNote);
  const selectedStatsNote = selectedSummaryNoteKey
    ? notes.find((item) => item.key === selectedSummaryNoteKey) || null
    : null;
  const statCounts = selectedStatsNote ? selectedStatsNote.counts : aggregateCounts(notes);
  const canWrite = sessionUserCanWrite();
  const editingDisabled = !activeGame || !note || !canWrite;
  const gameControlsDisabled = !activeGame;
  const gameWriteControlsDisabled = !activeGame || !canWrite;

  activeGameMessage.textContent = activeGame
    ? `Active game: ${activeGame.name}.`
    : "No active game is open. Editing actions are disabled.";
  selectedNoteMessage.textContent = note
    ? `${note.name} (${note.type?.name || "Unknown"})`
    : "Choose a note from the summary table.";

  setEditingDisabled(editingDisabled);
  setGameScopedControlsDisabled(gameControlsDisabled);
  setGameWriteControlsDisabled(gameWriteControlsDisabled);
  updateFilterButtons();
  renderNoteTypeOptions(note);
  renderSummary(notes);
  renderItemTree(displayNote, editingDisabled);
  renderEditor(editingDisabled, displayNote);
  enableGuestSignInWriteActions(activeGame, canWrite);
  renderStatScope(selectedStatsNote, notes);
  renderStats(statCounts);
  renderSuggestedTools(displayNote);
  renderRecentActivity();
  renderDiagnostics(activeGame, displayNote, notes);
  renderSearchStatus(searchQuery, notes);
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (currentSearchQuery()) {
      captureSearchSelectionSnapshot();
    } else {
      searchSelectionSnapshotTaken = false;
    }
    activeFilter = button.dataset.journeyFilter || "all";
    selectedSummaryNoteKey = "";
    if (!currentSearchQuery()) {
      selectedSummaryNoteKeyBeforeSearch = "";
    }
    render();
  });
});

sortButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const key = button.dataset.journeySort || "updated";
    summarySort = {
      key,
      direction: summarySort.key === key && summarySort.direction === "asc" ? "desc" : "asc",
    };
    render();
  });
});

summaryBody.addEventListener("click", (event) => {
  const button = event.target.closest("[data-journey-note-button]");
  if (!button) {
    return;
  }
  selectedSummaryNoteKey = button.dataset.journeyNoteButton;
  if (!currentSearchQuery()) {
    selectedSummaryNoteKeyBeforeSearch = selectedSummaryNoteKey;
    searchSelectionSnapshotTaken = false;
  }
  repository.selectNote(selectedSummaryNoteKey);
  render();
});

itemTree.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("[data-journey-delete-item]");
  if (deleteButton) {
    event.preventDefault();
    event.stopPropagation();
    if (!window.confirm(DELETE_CONFIRMATION_MESSAGE)) {
      return;
    }
    repository.deleteItem(deleteButton.dataset.journeyDeleteItem);
    render();
    return;
  }

  const button = event.target.closest("[data-journey-item-button]");
  if (!button) {
    return;
  }
  repository.selectItem(button.dataset.journeyItemButton);
  render();
});

itemTree.addEventListener("input", (event) => {
  const detailsInput = event.target.closest("[data-journey-item-details-input]");
  if (!detailsInput) {
    return;
  }
  const selectedItem = getSelectedItem();
  if (!selectedItem) {
    return;
  }
  repository.updateItem(selectedItem.key, {
    userDetails: detailsInput.value,
  });
  renderDiagnostics(repository.getActiveGame(), repository.getSelectedNote(), applySearch(repository.listNotes(activeFilter), currentSearchQuery()));
});

addItemButton.addEventListener("click", () => {
  if (redirectGuestWriteAction(editorStatus)) {
    return;
  }
  const selectedItem = getSelectedItem();
  const addStatus = statusSelectionChanged ? statusInput.value : "not-started";
  const title = newItemTitleInput?.value || (!selectedItem || isUserItem(selectedItem) ? titleInput.value : "");
  repository.addItem({
    title,
    status: addStatus,
    userDetails: "",
    indent: selectedItem?.indent || 0,
  });
  if (newItemTitleInput) {
    newItemTitleInput.value = "";
  }
  statusSelectionChanged = false;
  render();
});

editorForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (redirectGuestWriteAction(editorStatus)) {
    return;
  }
  const selectedItem = getSelectedItem();
  if (!selectedItem) {
    return;
  }

  const detailsInput = itemTree.querySelector("[data-journey-item-details-input]");
  repository.updateItem(selectedItem.key, {
    title: titleInput.value,
    status: statusInput.value,
    userDetails: detailsInput?.value || selectedItem.userDetails || "",
  });
  render();
});

moveUpButton.addEventListener("click", () => {
  if (redirectGuestWriteAction(editorStatus)) {
    return;
  }
  repository.moveSelectedItem(-1);
  render();
});

moveDownButton.addEventListener("click", () => {
  if (redirectGuestWriteAction(editorStatus)) {
    return;
  }
  repository.moveSelectedItem(1);
  render();
});

indentButton.addEventListener("click", () => {
  if (redirectGuestWriteAction(editorStatus)) {
    return;
  }
  repository.changeSelectedIndent(1);
  render();
});

outdentButton.addEventListener("click", () => {
  if (redirectGuestWriteAction(editorStatus)) {
    return;
  }
  repository.changeSelectedIndent(-1);
  render();
});

statusInput.addEventListener("change", () => {
  statusSelectionChanged = true;
});

searchInput?.addEventListener("input", () => {
  if (currentSearchQuery()) {
    captureSearchSelectionSnapshot();
  } else if (searchSelectionSnapshotTaken) {
    restoreSearchSelectionSnapshot();
  }
  render();
});

addNoteButton.addEventListener("click", () => {
  if (redirectGuestWriteAction(noteStatus)) {
    return;
  }
  const note = repository.addNote({
    name: newNoteNameInput.value,
    typeKey: newNoteTypeSelect.value,
  });
  if (!note) {
    if (noteStatus) {
      noteStatus.textContent = sessionUserCanWrite()
        ? "Open a game before adding a Game Journey note."
        : "Log in as a user before adding a Game Journey note.";
    }
    return;
  }
  activeFilter = "all";
  selectedSummaryNoteKey = note.key;
  selectedSummaryNoteKeyBeforeSearch = note.key;
  preferredNewNoteTypeKey = note.typeKey;
  newNoteNameInput.value = "";
  if (noteStatus) {
    noteStatus.textContent = `Added ${note.name} to the summary table.`;
  }
  render();
});

noteTypeSelect.addEventListener("change", () => {
  repository.updateSelectedNoteType(noteTypeSelect.value);
  render();
});

addTypeButton.addEventListener("click", () => {
  if (redirectGuestWriteAction(typeStatus)) {
    return;
  }
  const result = repository.addNoteType(typeInput.value);
  typeStatus.textContent = result.message;
  if (result.created) {
    typeInput.value = "";
    preferredNewNoteTypeKey = result.type.key;
  }
  render();
});

renderStatusOptions();
applyInitialGameRoute();
render();
