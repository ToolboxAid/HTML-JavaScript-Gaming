import {
  GAME_JOURNEY_KEYS,
  GAME_JOURNEY_RECOMMENDED_TARGETS,
  GAME_JOURNEY_STATUS_BY_ID,
  GAME_JOURNEY_STATUSES,
  GAME_JOURNEY_SUGGESTED_TOOLS,
  createGameJourneyApiRepository,
  readGameJourneyCompletionMetrics,
} from "../../../js/shared/game-journey-api-client.js";
import {
  getActiveToolRegistry,
  getToolRegistryApiDiagnostic,
} from "../../../../toolbox/tool-registry-api-client.js";
import { createServerRepositoryClient } from "../../../../../src/api/server-api-client.js";

const repository = createGameJourneyApiRepository();
const objectsRepository = createServerRepositoryClient("objects");
const registryDiagnostic = getToolRegistryApiDiagnostic();
const registryTools = getActiveToolRegistry();
const params = new URLSearchParams(window.location.search);
const DELETE_CONFIRMATION_MESSAGE = "It is best to keep the note unless it was created by mistake.";
const FORGE_BOT_INDICATOR_SRC = "assets/theme-v2/images/forge-bot.svg";

const filterButtons = Array.from(document.querySelectorAll("[data-journey-filter]"));
const sortButtons = Array.from(document.querySelectorAll("[data-journey-sort]"));
const sortHeaders = Array.from(document.querySelectorAll("[data-journey-sort-header]"));
const summaryBody = document.querySelector("[data-journey-summary-body]");
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
const completionMetrics = document.querySelector("[data-journey-completion-metrics]");
const objectsReadinessTable = document.querySelector("[data-journey-objects-readiness]");
const objectsReadinessStatus = document.querySelector("[data-journey-objects-readiness-status]");
const objectsReviewChecklist = document.querySelector("[data-journey-objects-review-checklist]");
const recommendedTargets = document.querySelector("[data-journey-recommended-targets]");
const recommendedTargetStatus = document.querySelector("[data-journey-target-status]");
const SUMMARY_TABLE_COLUMN_COUNT = 13;

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
let completionMetricsSnapshot = null;
let completionMetricsDiagnostic = "";
let addNoteRowOpen = false;
let editingNoteKey = "";
let itemTree = null;
let routeForcesNoActiveGame = false;
const recommendedTargetValues = new Map(
  GAME_JOURNEY_RECOMMENDED_TARGETS.map((target) => [target.key, target.suggestedCount]),
);
const OBJECTS_COMPLETION_BUCKET_KEY = "006-objects";
const OBJECTS_STAGE_CRITERIA = Object.freeze([
  Object.freeze({
    key: "saved-objects",
    label: "At least one object is saved for the current game.",
  }),
  Object.freeze({
    key: "named-typed",
    label: "Every saved object has a name, type, and starting state.",
  }),
  Object.freeze({
    key: "interactive-object",
    label: "At least one object represents something the player can use, collect, avoid, or reach.",
  }),
  Object.freeze({
    key: "render-links",
    label: "Sprite-rendered objects have a sprite asset reference.",
  }),
  Object.freeze({
    key: "owner-review-details",
    label: "Object Details include Product Owner review context such as description, tags, or defaults.",
  }),
]);
const OBJECTS_REVIEW_CHECKLIST = Object.freeze([
  "Confirm the object list matches the current Game Hub game.",
  "Confirm each object name and type is understandable to a Creator.",
  "Confirm sprite, audio, and message references are resolved or intentionally empty.",
  "Confirm at least one meaningful player-facing object exists.",
  "Confirm Objects validation is clean before expanding later gameplay work.",
]);
const INTERACTIVE_OBJECT_ROLES = Object.freeze([
  "collectible",
  "enemy",
  "goal",
  "hazard",
  "hero",
  "projectile",
]);
const INTERACTIVE_OBJECT_TRAITS = Object.freeze([
  "collectible",
  "goal",
  "hazard",
  "movable",
  "playerControlled",
  "scores",
]);
let objectsReadinessSnapshot = null;
let objectsReadinessDiagnostic = "";

function currentRecommendedTargets() {
  const result = repository.listRecommendedTargets();
  if (!Array.isArray(result)) {
    return GAME_JOURNEY_RECOMMENDED_TARGETS;
  }
  result.forEach((target) => {
    recommendedTargetValues.set(target.key, normalizeTargetCount(target.suggestedCount));
  });
  return result;
}

function refreshCompletionMetricsSnapshot() {
  try {
    completionMetricsSnapshot = readGameJourneyCompletionMetrics();
    completionMetricsDiagnostic = "";
  } catch (error) {
    completionMetricsSnapshot = null;
    completionMetricsDiagnostic = error instanceof Error ? error.message : String(error || "Journey progress unavailable.");
  }
}

function applyInitialGameRoute() {
  const gameId = params.get("game");
  if (gameId === "none") {
    routeForcesNoActiveGame = true;
    return;
  }

  if (gameId) {
    routeForcesNoActiveGame = false;
    repository.openGame(gameId);
  }

  if (params.get("templateDiagnostic") === "all") {
    repository.injectTemplateDiagnostics();
  }
}

function routedActiveGame() {
  return routeForcesNoActiveGame ? null : repository.getActiveGame();
}

function routedNotes(filterId) {
  return routeForcesNoActiveGame ? [] : repository.listNotes(filterId);
}

function normalizeText(value) {
  return String(value || "").trim();
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

function objectDetails(object = {}) {
  return object.details && typeof object.details === "object" ? object.details : {};
}

function objectHasNameTypeAndState(object = {}) {
  return Boolean(normalizeText(object.name) && normalizeText(object.role || object.type) && normalizeText(object.state));
}

function normalizedObjectRole(object = {}) {
  return normalizeText(object.role || object.type).toLowerCase();
}

function normalizedObjectTraits(object = {}) {
  return Array.isArray(object.traits)
    ? object.traits.map(normalizeText).filter(Boolean)
    : [];
}

function objectIsInteractive(object = {}) {
  const role = normalizedObjectRole(object);
  if (INTERACTIVE_OBJECT_ROLES.includes(role)) {
    return true;
  }
  const traits = normalizedObjectTraits(object);
  return traits.some((trait) => INTERACTIVE_OBJECT_TRAITS.includes(trait));
}

function objectSpriteReference(object = {}) {
  const details = objectDetails(object);
  return normalizeText(object.render?.assetKey || details.spriteReference);
}

function objectHasRenderReference(object = {}) {
  return normalizeText(object.render?.type) !== "Sprite" || Boolean(objectSpriteReference(object));
}

function objectHasOwnerReviewDetails(object = {}) {
  const details = objectDetails(object);
  return Boolean(
    normalizeText(details.description) ||
    normalizeText(details.defaultValues) ||
    normalizeText(details.spriteReference) ||
    normalizeText(details.audioReference) ||
    normalizeText(details.messageReference) ||
    (Array.isArray(details.tags) && details.tags.length > 0)
  );
}

function evaluateObjectsStageReadiness(objects = []) {
  const savedObjects = Array.isArray(objects) ? objects : [];
  const hasObjects = savedObjects.length > 0;
  const criteriaByKey = {
    "saved-objects": hasObjects,
    "named-typed": hasObjects && savedObjects.every(objectHasNameTypeAndState),
    "interactive-object": savedObjects.some(objectIsInteractive),
    "render-links": hasObjects && savedObjects.every(objectHasRenderReference),
    "owner-review-details": savedObjects.some(objectHasOwnerReviewDetails),
  };
  const criteria = OBJECTS_STAGE_CRITERIA.map((criterion) => ({
    ...criterion,
    complete: Boolean(criteriaByKey[criterion.key]),
  }));
  const completedCriteria = criteria.filter((criterion) => criterion.complete).length;
  return {
    available: true,
    completedCriteria,
    criteria,
    meaningful: completedCriteria >= 3,
    objectCount: savedObjects.length,
    ready: completedCriteria === criteria.length,
    totalCriteria: criteria.length,
  };
}

function unavailableObjectsStageReadiness(message) {
  return {
    available: false,
    completedCriteria: 0,
    criteria: OBJECTS_STAGE_CRITERIA.map((criterion) => ({
      ...criterion,
      complete: false,
    })),
    meaningful: false,
    objectCount: 0,
    ready: false,
    totalCriteria: OBJECTS_STAGE_CRITERIA.length,
    unavailableMessage: message,
  };
}

function objectRepositoryErrorMessage(result) {
  if (result?.error || objectsRepository.__apiDiagnostic?.()) {
    return "Objects readiness is temporarily unavailable. Continue building while the API refreshes.";
  }
  return "Objects readiness is temporarily unavailable. Continue building while the API refreshes.";
}

function refreshObjectsReadinessSnapshot() {
  const activeGame = routedActiveGame();
  if (!activeGame) {
    objectsReadinessDiagnostic = "Open a game in Game Hub before checking Objects readiness.";
    objectsReadinessSnapshot = unavailableObjectsStageReadiness(objectsReadinessDiagnostic);
    return;
  }
  const result = objectsRepository.listObjects(activeGame.id || activeGame.key);
  if (Array.isArray(result)) {
    objectsReadinessDiagnostic = "";
    objectsReadinessSnapshot = evaluateObjectsStageReadiness(result);
    return;
  }
  objectsReadinessDiagnostic = objectRepositoryErrorMessage(result);
  objectsReadinessSnapshot = unavailableObjectsStageReadiness(objectsReadinessDiagnostic);
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

function isSystemNote(note) {
  return Boolean(note?.systemCreated || note?.items?.some((item) => isSystemItem(item)));
}

function noteOwnerLabel(note) {
  if (isSystemNote(note)) {
    return "System-created";
  }

  const sessionUser = repository.getSessionUser();
  if (note?.ownerKey && note.ownerKey === sessionUser?.userKey) {
    return "You";
  }

  return note?.ownerKey || "Unknown";
}

function createCountCell(value) {
  return createElement("td", { text: String(value) });
}

function createReadonlyCountCell() {
  return createElement("td", { text: "-" });
}

function createNoteTypeSelect(selectedTypeKey, disabled = false) {
  const select = createElement("select");
  populateNoteTypeSelect(select, repository.listNoteTypes(), selectedTypeKey);
  select.disabled = disabled;
  return select;
}

function createNoteActions(actions) {
  const cell = createElement("td");
  const group = createElement("div", {
    className: "action-group",
  });
  group.setAttribute("aria-label", "Game Journey note row actions");
  actions.forEach((action) => group.append(action));
  cell.append(group);
  return cell;
}

function createNoteActionButton(label, datasetName, value, options = {}) {
  const button = createElement("button", {
    className: options.primary ? "btn btn--compact primary" : "btn btn--compact",
    text: label,
  });
  button.type = "button";
  button.dataset[datasetName] = value;
  if (options.disabled) {
    button.disabled = true;
  }
  if (options.title) {
    button.title = options.title;
    button.setAttribute("aria-label", options.title);
  }
  return button;
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

function createSummaryCountCells(note) {
  return [
    createCountCell(note.counts["not-started"]),
    createCountCell(note.counts.blocker),
    createCountCell(note.counts.decide),
    createCountCell(note.counts["in-progress"]),
    createCountCell(note.counts.complete),
    createCountCell(note.counts.skipped),
    createCountCell(note.counts.open),
    createCountCell(note.counts.total),
    createElement("td", { text: formatDate(note.updatedAt) }),
  ];
}

function createSummaryNoteButton(note, selected) {
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
  return noteButton;
}

function createSummaryNoteRow(note, editingDisabled) {
  const row = createElement("tr");
  const nameCell = createElement("td");
  const selected = selectedSummaryNoteKey === note.key;
  const systemNote = isSystemNote(note);
  nameCell.append(createSummaryNoteButton(note, selected));
  row.dataset.journeySummaryNoteRow = note.key;
  row.append(
    nameCell,
    createElement("td", { text: note.type?.name || "Unknown" }),
    createElement("td", { text: noteOwnerLabel(note) }),
    ...createSummaryCountCells(note),
    createNoteActions([
      createNoteActionButton("Edit", "journeyEditNote", note.key, {
        disabled: editingDisabled,
      }),
      createNoteActionButton("Delete", "journeyDeleteNote", note.key, {
        disabled: editingDisabled || systemNote,
        title: systemNote ? "System-created notes cannot be deleted" : "Delete note",
      }),
    ]),
  );
  return row;
}

function createSummaryAddRow(editingDisabled) {
  const row = createElement("tr");
  row.dataset.journeyAddNoteRow = "";

  const nameCell = createElement("td");
  const nameInput = createElement("input");
  nameInput.type = "text";
  nameInput.placeholder = "Playtest follow-ups";
  nameInput.disabled = editingDisabled;
  nameInput.dataset.journeyNewNoteName = "";
  nameCell.append(nameInput);

  const typeCell = createElement("td");
  const typeSelect = createNoteTypeSelect(preferredNewNoteTypeKey || repository.listNoteTypes()[0]?.key || "", editingDisabled);
  typeSelect.dataset.journeyNewNoteType = "";
  typeCell.append(typeSelect);

  row.append(
    nameCell,
    typeCell,
    createElement("td", { text: "You" }),
    createReadonlyCountCell(),
    createReadonlyCountCell(),
    createReadonlyCountCell(),
    createReadonlyCountCell(),
    createReadonlyCountCell(),
    createReadonlyCountCell(),
    createReadonlyCountCell(),
    createReadonlyCountCell(),
    createReadonlyCountCell(),
    createNoteActions([
      createNoteActionButton("Save", "journeySaveNewNote", "true", {
        primary: true,
        disabled: editingDisabled,
      }),
      createNoteActionButton("Cancel", "journeyCancelNewNote", "true"),
    ]),
  );
  return row;
}

function createSummaryEditRow(note, editingDisabled) {
  const row = createElement("tr");
  const systemNote = isSystemNote(note);
  const fieldsDisabled = editingDisabled || systemNote;
  row.dataset.journeyEditNoteRow = note.key;

  const nameCell = createElement("td");
  const nameInput = createElement("input");
  nameInput.type = "text";
  nameInput.value = note.name;
  nameInput.disabled = fieldsDisabled;
  nameInput.dataset.journeyNoteNameInput = note.key;
  nameCell.append(nameInput);

  const typeCell = createElement("td");
  const typeSelect = createNoteTypeSelect(note.typeKey, fieldsDisabled);
  typeSelect.dataset.journeyNoteTypeSelect = note.key;
  typeCell.append(typeSelect);

  row.append(
    nameCell,
    typeCell,
    createElement("td", { text: noteOwnerLabel(note) }),
    ...createSummaryCountCells(note),
    createNoteActions([
      createNoteActionButton("Save", "journeySaveNote", note.key, {
        primary: true,
        disabled: fieldsDisabled,
        title: systemNote ? "System-created notes only allow status changes in their item rows" : "Save note",
      }),
      createNoteActionButton("Cancel", "journeyCancelNoteEdit", note.key),
      createNoteActionButton("Delete", "journeyDeleteNote", note.key, {
        disabled: editingDisabled || systemNote,
        title: systemNote ? "System-created notes cannot be deleted" : "Delete note",
      }),
    ]),
  );
  return row;
}

function createSummaryTreeRow(note, editingDisabled) {
  const row = createElement("tr");
  const cell = createElement("td");
  const treeHost = createElement("div");
  row.dataset.journeyNoteTreeRow = note?.key || "new-note";
  cell.colSpan = SUMMARY_TABLE_COLUMN_COUNT;
  treeHost.dataset.journeyItemTree = note?.key || "";
  cell.append(treeHost);
  row.append(cell);
  renderItemTree(note, editingDisabled, treeHost);
  return row;
}

function renderSummary(notes, displayNote, editingDisabled, noteWriteDisabled = editingDisabled) {
  summaryBody.innerHTML = "";
  itemTree = null;
  updateSortHeaders();

  if (addNoteRowOpen) {
    summaryBody.append(createSummaryAddRow(noteWriteDisabled), createSummaryTreeRow(null, editingDisabled));
  }

  if (!notes.length) {
    const row = createElement("tr");
    const cell = createElement("td", {
      text: "No notes match the current Game Journey filter.",
    });
    cell.colSpan = SUMMARY_TABLE_COLUMN_COUNT;
    row.append(cell);
    summaryBody.append(row);
    return;
  }

  sortSummaryNotes(notes).forEach((note) => {
    const editing = editingNoteKey === note.key;
    const row = editing
      ? createSummaryEditRow(note, noteWriteDisabled)
      : createSummaryNoteRow(note, noteWriteDisabled);
    summaryBody.append(row);

    const shouldRenderTree =
      !addNoteRowOpen &&
      (editing || (!editingNoteKey && selectedSummaryNoteKey === note.key));
    if (shouldRenderTree) {
      summaryBody.append(createSummaryTreeRow(displayNote?.key === note.key ? displayNote : note, editingDisabled));
    }
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

function renderItemTree(note, editingDisabled, target = itemTree) {
  itemTree = target;
  if (!target) {
    return;
  }
  target.innerHTML = "";
  const wrapper = createElement("div", {
    className: "table-wrapper",
  });
  const table = createElement("table", {
    className: "data-table data-table--fixed",
  });
  table.setAttribute("aria-label", "Selected note item subtable");
  const head = createElement("thead");
  const headRow = createElement("tr");
  ["Item", "Status", "Details", "Actions"].forEach((label) => {
    const header = createElement("th", { text: label });
    header.scope = "col";
    headRow.append(header);
  });
  head.append(headRow);
  const body = createElement("tbody");

  if (!note || !note.items.length) {
    const emptyRow = createElement("tr");
    const emptyCell = createElement("td", { text: "No journey items yet." });
    emptyCell.colSpan = 4;
    emptyRow.append(emptyCell);
    body.append(emptyRow);
    table.append(head, body);
    wrapper.append(table);
    target.append(wrapper);
    return;
  }

  const selectedItem = getSelectedItem();

  note.items.forEach((item) => {
    const itemRow = createElement("tr");
    const itemCell = createElement("td");
    const statusCell = createElement("td", { text: createStatusText(item.status) });
    const detailsCell = createElement("td", { text: item.userDetails || "-" });
    const actionCell = createElement("td");
    const actionGroup = createElement("div", {
      className: "action-group",
    });
    actionGroup.setAttribute("aria-label", "Journey item row actions");
    itemRow.dataset.journeyItemRow = item.key;
    itemCell.dataset.journeyItemIndent = String(Math.max(0, Math.min(Number(item.indent) || 0, 4)));
    itemCell.append(makeItemButton(item));
    if (isUserItem(item)) {
      actionGroup.append(createDeleteItemButton(item));
    } else {
      actionGroup.append(createSystemItemIndicator());
    }
    actionCell.append(actionGroup);
    itemRow.append(itemCell, statusCell, detailsCell, actionCell);
    body.append(itemRow);
    if (selectedItem?.key === item.key) {
      const detailsRow = createElement("tr");
      const detailsRowCell = createElement("td");
      detailsRow.dataset.journeySelectedItemDetails = item.key;
      detailsRowCell.colSpan = 4;
      detailsRowCell.append(makeSelectedItemDetails(item, editingDisabled));
      detailsRow.append(detailsRowCell);
      body.append(detailsRow);
    }
  });

  table.append(head, body);
  wrapper.append(table);
  target.append(wrapper);
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

function formatCompletionFocusStatus(metric) {
  return metric.active ? "Active focus" : "Planning context";
}

function metricPercentComplete(completedCount, plannedCount) {
  if (!plannedCount) {
    return 0;
  }
  return Math.round((completedCount / plannedCount) * 100);
}

function recalculateCompletionSnapshot(snapshot, records) {
  const plannedCount = records.reduce((total, metric) => total + metric.plannedCount, 0);
  const completedCount = records.reduce((total, metric) => total + metric.completedCount, 0);
  const activeCount = records.filter((metric) => metric.active).length;
  return {
    ...snapshot,
    activeCount,
    completedCount,
    inactiveCount: records.length - activeCount,
    percentComplete: metricPercentComplete(completedCount, plannedCount),
    plannedCount,
    records,
  };
}

function completionSnapshotWithObjectsReadiness(snapshot) {
  if (!snapshot?.records || !objectsReadinessSnapshot?.available || objectsReadinessSnapshot.completedCriteria <= 0) {
    return snapshot;
  }
  const records = snapshot.records.map((metric) => {
    if (metric.bucketKey !== OBJECTS_COMPLETION_BUCKET_KEY) {
      return metric;
    }
    const plannedCount = metric.plannedCount || objectsReadinessSnapshot.totalCriteria;
    const completedCount = Math.min(
      plannedCount,
      Math.max(metric.completedCount, objectsReadinessSnapshot.completedCriteria),
    );
    return {
      ...metric,
      completedCount,
      percentComplete: metricPercentComplete(completedCount, plannedCount),
      plannedCount,
      status: metric.active ? "active" : metric.status,
    };
  });
  return recalculateCompletionSnapshot(snapshot, records);
}

function renderCompletionMetrics() {
  if (!completionMetrics) {
    return;
  }
  completionMetrics.innerHTML = "";
  if (completionMetricsDiagnostic) {
    completionMetrics.append(
      createElement("p", {
        className: "status",
        text: `Journey progress is unavailable right now: ${completionMetricsDiagnostic}`,
      }),
    );
    return;
  }

  const snapshot = completionSnapshotWithObjectsReadiness(completionMetricsSnapshot);
  const records = snapshot?.records || [];
  if (!records.length) {
    completionMetrics.append(createElement("p", { text: "No Journey progress targets are set yet. Add suggested targets to start tracking progress." }));
    return;
  }

  const dashboard = createElement("div", { className: "content-stack content-stack--compact" });
  dashboard.dataset.journeyProgressDashboard = "";
  const summary = createElement("p", {
    className: "status",
    text: `Journey progress: ${snapshot.completedCount} of ${snapshot.plannedCount} planned items done (${snapshot.percentComplete}%). ${snapshot.activeCount} sections are active focus areas; ${snapshot.inactiveCount} are planning context.`,
  });
  const overallHeading = createElement("h3", { text: "Overall Progress" });
  const overallGrid = createElement("div", { className: "grid cols-2" });
  overallGrid.dataset.journeyOverallProgress = "";
  [
    ["Overall", `${snapshot.percentComplete}%`],
    ["Done", String(snapshot.completedCount)],
    ["Planned", String(snapshot.plannedCount)],
    ["Active Focus", String(snapshot.activeCount)],
  ].forEach(([label, value]) => {
    const stat = createElement("article", { className: "mini-stat mini-stat--inline" });
    stat.append(
      createElement("strong", { text: value }),
      createElement("span", { text: label }),
    );
    overallGrid.append(stat);
  });

  const sectionHeading = createElement("h3", { text: "Section Progress" });
  const wrapper = createElement("div", { className: "table-wrapper" });
  wrapper.dataset.journeySectionProgress = "";
  const table = createElement("table", { className: "data-table data-table--fixed" });
  table.setAttribute("aria-label", "Game Journey section progress");
  const head = createElement("thead");
  const headRow = createElement("tr");
  ["Journey Area", "Planned", "Done", "Complete", "Focus"].forEach((heading) => {
    const cell = createElement("th", { text: heading });
    cell.scope = "col";
    headRow.append(cell);
  });
  head.append(headRow);
  const body = createElement("tbody");
  records.forEach((metric) => {
    const row = createElement("tr");
    row.dataset.journeyCompletionBucket = metric.bucketKey;
    row.append(
      createElement("td", { text: metric.bucketName }),
      createElement("td", { text: String(metric.plannedCount) }),
      createElement("td", { text: String(metric.completedCount) }),
      createElement("td", { text: `${metric.percentComplete}%` }),
      createElement("td", { text: formatCompletionFocusStatus(metric) }),
    );
    body.append(row);
  });
  table.append(head, body);
  wrapper.append(table);

  const rankedRecords = records.filter((metric) => metric.plannedCount > 0);
  const mostComplete = [...rankedRecords]
    .sort((left, right) =>
      right.percentComplete - left.percentComplete ||
      right.completedCount - left.completedCount ||
      left.bucketKey.localeCompare(right.bucketKey),
    )
    .slice(0, 3);
  const leastComplete = [...rankedRecords]
    .sort((left, right) =>
      left.percentComplete - right.percentComplete ||
      left.completedCount - right.completedCount ||
      left.bucketKey.localeCompare(right.bucketKey),
    )
    .slice(0, 3);

  const mostHeading = createElement("h3", { text: "Strongest Areas" });
  const mostList = createElement("ol");
  mostList.dataset.journeyMostCompleteAreas = "";
  mostComplete.forEach((metric) => {
    mostList.append(createElement("li", {
      text: `${metric.bucketName}: ${metric.percentComplete}% complete (${metric.completedCount} of ${metric.plannedCount} planned)`,
    }));
  });

  const leastHeading = createElement("h3", { text: "Start Next" });
  const leastList = createElement("ol");
  leastList.dataset.journeyLeastCompleteAreas = "";
  leastComplete.forEach((metric) => {
    leastList.append(createElement("li", {
      text: `${metric.bucketName}: ${metric.percentComplete}% complete (${metric.completedCount} of ${metric.plannedCount} planned)`,
    }));
  });

  const insightHeading = createElement("h3", { text: "What To Do Next" });
  const insightList = createElement("ul");
  insightList.dataset.journeyCompletionInsights = "";
  completionInsightMessages(snapshot, records, mostComplete, leastComplete).forEach((message) => {
    insightList.append(createElement("li", { text: message }));
  });

  dashboard.append(
    summary,
    overallHeading,
    overallGrid,
    sectionHeading,
    wrapper,
    mostHeading,
    mostList,
    leastHeading,
    leastList,
    insightHeading,
    insightList,
  );
  completionMetrics.append(dashboard);
}

function objectsReadinessStatusText(snapshot) {
  if (!snapshot?.available) {
    return snapshot?.unavailableMessage || "Objects readiness is temporarily unavailable.";
  }
  if (snapshot.objectCount === 0) {
    return "Objects readiness: no saved objects for this game yet.";
  }
  if (snapshot.ready) {
    return `Objects readiness: ${snapshot.completedCriteria} of ${snapshot.totalCriteria} criteria complete. Product Owner review can start.`;
  }
  if (snapshot.meaningful) {
    return `Objects readiness: ${snapshot.completedCriteria} of ${snapshot.totalCriteria} criteria complete. Journey progress now reflects meaningful Objects work.`;
  }
  return `Objects readiness: ${snapshot.completedCriteria} of ${snapshot.totalCriteria} criteria complete. Continue Objects before treating this stage as ready.`;
}

function renderObjectsReadiness() {
  const snapshot = objectsReadinessSnapshot || unavailableObjectsStageReadiness("Objects readiness is waiting for API data.");
  if (objectsReadinessStatus) {
    objectsReadinessStatus.textContent = objectsReadinessStatusText(snapshot);
  }
  if (objectsReadinessTable) {
    objectsReadinessTable.replaceChildren();
    snapshot.criteria.forEach((criterion) => {
      const row = createElement("tr");
      row.dataset.journeyObjectsCriterion = criterion.key;
      row.append(
        createElement("td", { text: criterion.label }),
        createElement("td", { text: criterion.complete ? "PASS" : "Needs work" }),
      );
      objectsReadinessTable.append(row);
    });
  }
  if (objectsReviewChecklist) {
    objectsReviewChecklist.replaceChildren();
    OBJECTS_REVIEW_CHECKLIST.forEach((item) => {
      objectsReviewChecklist.append(createElement("li", { text: item }));
    });
  }
}

function normalizeTargetCount(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return Math.max(0, Math.trunc(parsed));
}

function formatAreaList(names) {
  if (names.length <= 1) {
    return names[0] || "";
  }
  if (names.length === 2) {
    return `${names[0]} and ${names[1]}`;
  }
  return `${names.slice(0, -1).join(", ")}, and ${names.at(-1)}`;
}

function completionInsightMessages(snapshot, records, mostComplete, leastComplete) {
  const messages = [];
  if (!snapshot?.plannedCount) {
    messages.push("Completion is low because no planned section targets are available yet. Next action: add suggested targets for the areas this game needs.");
    return messages;
  }

  if (snapshot.percentComplete === 0) {
    messages.push("Completion is low because no planned items are complete yet.");
  } else if (snapshot.percentComplete < 50) {
    messages.push("Completion is low because fewer than half of the planned items are complete.");
  } else if (snapshot.percentComplete >= 80) {
    messages.push("Completion is high because most planned items are already complete.");
  } else {
    messages.push("Completion is growing because completed items are catching up to planned items.");
  }

  if (snapshot.inactiveCount > 0) {
    messages.push(`${snapshot.inactiveCount} section${snapshot.inactiveCount === 1 ? "" : "s"} are planning context, so they stay visible without counting as active focus areas.`);
  }
  const strongest = mostComplete[0];
  if (strongest) {
    messages.push(`${strongest.bucketName} is one of the most complete areas with ${strongest.completedCount} of ${strongest.plannedCount} planned items complete.`);
  }
  const weakest = leastComplete.find((metric) => metric.plannedCount > 0);
  if (weakest) {
    messages.push(`${weakest.bucketName} needs attention: complete one planned item or adjust the planned count if the scope changed.`);
  }
  const lowProgressAreas = records
    .filter((metric) => metric.active && metric.plannedCount > 0 && metric.percentComplete < 50)
    .sort((left, right) =>
      left.percentComplete - right.percentComplete ||
      left.completedCount - right.completedCount ||
      left.bucketKey.localeCompare(right.bucketKey),
    )
    .slice(0, 3);
  if (lowProgressAreas.length) {
    messages.push(`Next focus: ${formatAreaList(lowProgressAreas.map((metric) => metric.bucketName))}. Complete one small item in each area before expanding the plan.`);
  }
  if (records.every((metric) => metric.completedCount === 0)) {
    messages.push("Next action: mark one finished section item complete so overall progress can rise above 0%.");
  }
  return messages;
}

function renderRecommendedTargets() {
  if (!recommendedTargets) {
    return;
  }
  recommendedTargets.innerHTML = "";
  const targets = currentRecommendedTargets();
  if (!targets.length) {
    recommendedTargets.append(createElement("p", { text: "No recommended planning targets are available." }));
    return;
  }

  const wrapper = createElement("div", { className: "table-wrapper" });
  const table = createElement("table", { className: "data-table data-table--fixed" });
  table.setAttribute("aria-label", "Game Journey recommended planning targets");
  const head = createElement("thead");
  const headRow = createElement("tr");
  ["Target", "Section", "Count"].forEach((heading) => {
    const cell = createElement("th", { text: heading });
    cell.scope = "col";
    headRow.append(cell);
  });
  head.append(headRow);
  const body = createElement("tbody");
  targets.forEach((target) => {
    const targetCount = recommendedTargetValues.get(target.key) ?? target.suggestedCount;
    const row = createElement("tr");
    row.dataset.journeyRecommendedTarget = target.key;
    const labelCell = createElement("td");
    const label = createElement("span", { text: target.label });
    const countPreview = createElement("span", { text: ` [${targetCount}]` });
    countPreview.dataset.journeyTargetCountPreview = target.key;
    labelCell.append(label, countPreview);
    const sectionCell = createElement("td", { text: target.sectionName });
    const input = document.createElement("input");
    input.type = "number";
    input.inputMode = "numeric";
    input.min = "0";
    input.step = "1";
    input.value = String(targetCount);
    input.setAttribute("aria-label", `${target.label} count`);
    input.dataset.journeyTargetInput = target.key;
    const inputCell = createElement("td");
    inputCell.append(input);
    row.append(labelCell, sectionCell, inputCell);
    body.append(row);
  });
  table.append(head, body);
  wrapper.append(table);
  recommendedTargets.append(wrapper);
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

function isRepositoryErrorResult(result) {
  return Boolean(result && typeof result === "object" && result.error === true);
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
    messages.push("No active game is open. Open a game in Game Hub to enable editing.");
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
  const activeGame = routedActiveGame();
  const searchQuery = currentSearchQuery();
  const notes = applySearch(routedNotes(activeFilter), searchQuery);
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
  if (selectedNoteMessage) {
    selectedNoteMessage.textContent = note
      ? `${note.name} (${note.type?.name || "Unknown"})`
      : "Choose a note from the summary table.";
  }
  if (editingNoteKey && !notes.some((item) => item.key === editingNoteKey)) {
    editingNoteKey = "";
  }

  setEditingDisabled(editingDisabled);
  setGameScopedControlsDisabled(gameControlsDisabled);
  setGameWriteControlsDisabled(gameWriteControlsDisabled);
  updateFilterButtons();
  renderNoteTypeOptions(note);
  renderSummary(notes, displayNote, editingDisabled, gameWriteControlsDisabled);
  renderEditor(editingDisabled, displayNote);
  enableGuestSignInWriteActions(activeGame, canWrite);
  renderStatScope(selectedStatsNote, notes);
  renderStats(statCounts);
  renderCompletionMetrics();
  renderObjectsReadiness();
  renderRecommendedTargets();
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

  const saveNewNoteButton = event.target.closest("[data-journey-save-new-note]");
  if (saveNewNoteButton) {
    event.preventDefault();
    if (redirectGuestWriteAction(noteStatus)) {
      return;
    }
    const row = saveNewNoteButton.closest("[data-journey-add-note-row]");
    const nameInput = row?.querySelector("[data-journey-new-note-name]");
    const typeSelect = row?.querySelector("[data-journey-new-note-type]");
    const note = repository.addNote({
      name: nameInput?.value || "",
      typeKey: typeSelect?.value || "",
    });
    if (!note || isRepositoryErrorResult(note)) {
      if (noteStatus) {
        noteStatus.textContent = note?.message || (sessionUserCanWrite()
          ? "Open a game before adding a Game Journey note."
          : "Log in as a user before adding a Game Journey note.");
      }
      return;
    }
    activeFilter = "all";
    addNoteRowOpen = false;
    editingNoteKey = "";
    selectedSummaryNoteKey = note.key;
    selectedSummaryNoteKeyBeforeSearch = note.key;
    preferredNewNoteTypeKey = note.typeKey;
    if (noteStatus) {
      noteStatus.textContent = `Added ${note.name} to the summary table.`;
    }
    render();
    return;
  }

  const cancelNewNoteButton = event.target.closest("[data-journey-cancel-new-note]");
  if (cancelNewNoteButton) {
    event.preventDefault();
    addNoteRowOpen = false;
    render();
    return;
  }

  const editNoteButton = event.target.closest("[data-journey-edit-note]");
  if (editNoteButton) {
    event.preventDefault();
    addNoteRowOpen = false;
    editingNoteKey = editNoteButton.dataset.journeyEditNote;
    selectedSummaryNoteKey = editingNoteKey;
    selectedSummaryNoteKeyBeforeSearch = editingNoteKey;
    repository.selectNote(editingNoteKey);
    render();
    return;
  }

  const saveNoteButton = event.target.closest("[data-journey-save-note]");
  if (saveNoteButton) {
    event.preventDefault();
    if (redirectGuestWriteAction(noteStatus)) {
      return;
    }
    const row = saveNoteButton.closest("[data-journey-edit-note-row]");
    const note = repository.updateNote(saveNoteButton.dataset.journeySaveNote, {
      name: row?.querySelector("[data-journey-note-name-input]")?.value || "",
      typeKey: row?.querySelector("[data-journey-note-type-select]")?.value || "",
    });
    if (note && !isRepositoryErrorResult(note)) {
      selectedSummaryNoteKey = note.key;
      selectedSummaryNoteKeyBeforeSearch = note.key;
      if (noteStatus) {
        noteStatus.textContent = `Saved ${note.name} in the summary table.`;
      }
    } else if (noteStatus) {
      noteStatus.textContent = note?.message || "The selected note could not be saved.";
    }
    editingNoteKey = "";
    render();
    return;
  }

  const cancelNoteEditButton = event.target.closest("[data-journey-cancel-note-edit]");
  if (cancelNoteEditButton) {
    event.preventDefault();
    editingNoteKey = "";
    render();
    return;
  }

  const deleteNoteButton = event.target.closest("[data-journey-delete-note]");
  if (deleteNoteButton) {
    event.preventDefault();
    if (!window.confirm(DELETE_CONFIRMATION_MESSAGE)) {
      return;
    }
    const result = repository.deleteNote(deleteNoteButton.dataset.journeyDeleteNote);
    if (isRepositoryErrorResult(result)) {
      if (noteStatus) {
        noteStatus.textContent = result.message || "The selected note could not be deleted.";
      }
      return;
    }
    if (result?.selectedNoteKey !== undefined) {
      selectedSummaryNoteKey = result.selectedNoteKey;
      selectedSummaryNoteKeyBeforeSearch = result.selectedNoteKey;
    }
    editingNoteKey = "";
    if (noteStatus && result?.reason) {
      noteStatus.textContent = result.reason;
    }
    render();
    return;
  }

  const itemButton = event.target.closest("[data-journey-item-button]");
  if (itemButton) {
    repository.selectItem(itemButton.dataset.journeyItemButton);
    render();
    return;
  }

  const noteButton = event.target.closest("[data-journey-note-button]");
  if (!noteButton) {
    return;
  }
  addNoteRowOpen = false;
  editingNoteKey = "";
  selectedSummaryNoteKey = noteButton.dataset.journeyNoteButton;
  if (!currentSearchQuery()) {
    selectedSummaryNoteKeyBeforeSearch = selectedSummaryNoteKey;
    searchSelectionSnapshotTaken = false;
  }
  repository.selectNote(selectedSummaryNoteKey);
  render();
});

summaryBody.addEventListener("input", (event) => {
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
  renderDiagnostics(routedActiveGame(), routeForcesNoActiveGame ? null : repository.getSelectedNote(), applySearch(routedNotes(activeFilter), currentSearchQuery()));
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

  const detailsInput = itemTree?.querySelector("[data-journey-item-details-input]");
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

recommendedTargets?.addEventListener("input", (event) => {
  const input = event.target.closest("[data-journey-target-input]");
  if (!input) {
    return;
  }
  const target = GAME_JOURNEY_RECOMMENDED_TARGETS.find((item) => item.key === input.dataset.journeyTargetInput);
  if (!target) {
    return;
  }
  const value = normalizeTargetCount(input.value);
  if (redirectGuestWriteAction(recommendedTargetStatus)) {
    input.value = String(recommendedTargetValues.get(target.key) ?? target.suggestedCount);
    return;
  }
  const updated = repository.updateRecommendedTarget(target.key, value);
  if (!updated || updated.error) {
    if (recommendedTargetStatus) {
      recommendedTargetStatus.textContent = "Open a game before saving recommended targets.";
    }
    input.value = String(recommendedTargetValues.get(target.key) ?? target.suggestedCount);
    return;
  }
  const savedValue = normalizeTargetCount(updated.suggestedCount);
  recommendedTargetValues.set(target.key, savedValue);
  input.value = String(savedValue);
  const preview = recommendedTargets.querySelector(`[data-journey-target-count-preview='${target.key}']`);
  if (preview) {
    preview.textContent = ` [${savedValue}]`;
  }
  if (recommendedTargetStatus) {
    recommendedTargetStatus.textContent = `Saved ${target.label} target at ${savedValue}.`;
  }
});

window.addEventListener("focus", () => {
  refreshObjectsReadinessSnapshot();
  render();
});

window.addEventListener("pageshow", () => {
  refreshObjectsReadinessSnapshot();
  render();
});

addNoteButton?.addEventListener("click", () => {
  if (redirectGuestWriteAction(noteStatus)) {
    return;
  }
  addNoteRowOpen = true;
  editingNoteKey = "";
  if (noteStatus) {
    noteStatus.textContent = "Add the new note in the inline summary table row.";
  }
  render();
});

noteTypeSelect?.addEventListener("change", () => {
  repository.updateSelectedNoteType(noteTypeSelect.value);
  render();
});

addTypeButton?.addEventListener("click", () => {
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
refreshCompletionMetricsSnapshot();
applyInitialGameRoute();
refreshObjectsReadinessSnapshot();
render();
