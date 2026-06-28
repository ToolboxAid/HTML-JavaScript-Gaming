import {
  COMMON_DEFAULT_GAME_CONTROLS,
  CONTROL_EVENT_OPTIONS,
  ENGINE_OWNED_NORMALIZED_INPUTS,
  GAME_CONTROL_NORMALIZED_INPUTS,
  NORMALIZED_USAGE_LABELS,
  createControlsToolApiRepository,
} from "../../../js/shared/controls-api-client.js";
import {
  normalizeNormalizedInput,
  normalizedInputOptions,
} from "../../../../../src/engine/input/NormalizedInputRegistry.js";

const GAME_CONTROL_NORMALIZED_INPUT_IDS = new Set(GAME_CONTROL_NORMALIZED_INPUTS);

const COMMON_DEFAULT_GAME_CONTROL_IDS = new Set(COMMON_DEFAULT_GAME_CONTROLS);
const ENGINE_OWNED_NORMALIZED_INPUT_IDS = new Set(ENGINE_OWNED_NORMALIZED_INPUTS);

let controlsRepository = createControlsToolApiRepository();
let mappings = [];
let editingRow = null;

const elements = {
  enabledCount: document.querySelector("[data-input-enabled-count]"),
  list: document.querySelector("[data-input-mapping-list]"),
  mappingCount: document.querySelector("[data-input-mapping-count]"),
  outputCount: document.querySelector("[data-input-output-count]"),
  outputStatus: document.querySelector("[data-input-output-status]"),
  returnWorkspace: document.querySelector("[data-input-return-workspace]"),
  saveStatus: document.querySelector("[data-input-save-status]"),
  statusLog: document.querySelector("[data-input-status-log]"),
};

function normalizeText(value) {
  return String(value || "").trim();
}

function keyFromText(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function setText(element, value) {
  if (element) {
    element.textContent = value;
  }
}

function optionElement(value, text) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = text;
  return option;
}

function tableCell(text) {
  const cell = document.createElement("td");
  cell.textContent = text;
  return cell;
}

function controlCell(control) {
  const cell = document.createElement("td");
  cell.append(control);
  return cell;
}

function actionButton(text, dataName, value = "") {
  const button = document.createElement("button");
  button.className = "btn btn--compact";
  button.type = "button";
  button.textContent = text;
  button.dataset[dataName] = value;
  return button;
}

function actionCell(actions) {
  const cell = document.createElement("td");
  const group = document.createElement("div");
  group.className = "action-group action-group--tight";
  group.append(...actions);
  cell.append(group);
  return cell;
}

function selectControl({ ariaLabel, options, selectedValue }) {
  const select = document.createElement("select");
  select.className = "tool-form-control";
  select.setAttribute("aria-label", ariaLabel);
  select.append(...options.map((option) => optionElement(option.value, option.label)));
  select.value = options.some((option) => option.value === selectedValue)
    ? selectedValue
    : options[0]?.value || "";
  return select;
}

function gameControlNormalizedOptions() {
  const optionByValue = new Map(normalizedInputOptions().map((option) => [option.value, option]));
  return GAME_CONTROL_NORMALIZED_INPUTS
    .map((inputId) => optionByValue.get(inputId))
    .filter(Boolean);
}

function normalizeGameControlInput(inputId, fallback = "") {
  const normalizedInput = normalizeNormalizedInput(inputId);
  if (GAME_CONTROL_NORMALIZED_INPUT_IDS.has(normalizedInput)) {
    return normalizedInput;
  }
  return GAME_CONTROL_NORMALIZED_INPUT_IDS.has(fallback) ? fallback : "";
}

function eventControlLabel(option) {
  return `${option.label} = ${option.description}`;
}

function checkboxCell(checked, label) {
  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = Boolean(checked);
  input.disabled = true;
  input.setAttribute("aria-label", label);
  const cell = controlCell(input);
  cell.dataset.inputEventChecked = checked ? "true" : "false";
  cell.title = checked ? `${label} enabled` : `${label} disabled`;
  if (checked) {
    cell.className = "status";
  }
  return cell;
}

function eventCheckboxCell(checked, option) {
  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = Boolean(checked);
  input.disabled = true;
  input.title = option.description;
  input.setAttribute("aria-label", eventControlLabel(option));
  const cell = controlCell(input);
  cell.dataset.inputEventChecked = checked ? "true" : "false";
  cell.title = checked ? `${option.description} enabled` : `${option.description} disabled`;
  if (checked) {
    cell.className = "status";
  }
  return cell;
}

function editableCheckboxCell({ checked, datasetName, option }) {
  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = Boolean(checked);
  input.dataset[datasetName] = "true";
  input.title = option.description;
  input.setAttribute("aria-label", eventControlLabel(option));
  const cell = controlCell(input);
  cell.dataset.inputEventChecked = checked ? "true" : "false";
  cell.title = checked ? `${option.description} enabled` : `${option.description} disabled`;
  if (checked) {
    cell.className = "status";
  }
  return cell;
}

function defaultEventFieldsForNormalizedInput(normalizedInput) {
  if (normalizedInput.startsWith("move.") || normalizedInput.startsWith("aim.")) {
    return {
      eventD: false,
      eventDC: false,
      eventH: true,
      eventU: false,
    };
  }
  return {
    eventD: true,
    eventDC: false,
    eventH: false,
    eventU: false,
  };
}

function isEngineOwnedMapping(mapping = {}) {
  return ENGINE_OWNED_NORMALIZED_INPUT_IDS.has(normalizeGameControlInput(mapping.normalizedInput));
}

function mappingNeedsEngineOwnedRepair(source = {}) {
  if (normalizeGameControlInput(source.normalizedInput) !== "action.pause") {
    return false;
  }
  const usageLabel = normalizeText(source.usageLabel || source.actionLabel || source.gameActionLabel || source.action);
  return source.enabled === false
    || usageLabel !== "Pause"
    || source.eventD !== true
    || source.eventDC === true
    || source.eventH === true
    || source.eventU === true;
}

function legacyEventFields(source = {}) {
  const phase = normalizeText(source.inputEventPhase);
  const fallbackD = phase === "Release" ? false : true;
  return {
    eventD: fallbackD,
    eventDC: false,
    eventH: phase === "Down",
    eventU: phase === "Release",
  };
}

function normalizedEventFields(source = {}) {
  const legacy = legacyEventFields(source);
  const eventFields = {
    eventD: source.eventD === undefined ? legacy.eventD : Boolean(source.eventD),
    eventDC: source.eventDC === undefined ? legacy.eventDC : Boolean(source.eventDC),
    eventH: source.eventH === undefined ? legacy.eventH : Boolean(source.eventH),
    eventU: source.eventU === undefined ? legacy.eventU : Boolean(source.eventU),
  };
  if (!Object.values(eventFields).some(Boolean) && (source.eventAxis || source.eventDrag)) {
    eventFields.eventD = true;
  }
  return {
    ...eventFields,
    eventAxis: false,
    eventDrag: false,
  };
}

function mappingIdFor(mapping) {
  const eventKey = CONTROL_EVENT_OPTIONS
    .filter((option) => Boolean(mapping[option.field]))
    .map((option) => option.label)
    .join("-");
  return keyFromText(["game-control", mapping.usageLabel, mapping.normalizedInput, eventKey].join("-"))
    || `game-control-${Date.now()}`;
}

function normalizeMapping(source = {}) {
  const sourceNormalizedInput = normalizeText(source.normalizedInput);
  const normalizedInput = normalizeGameControlInput(sourceNormalizedInput, sourceNormalizedInput ? "" : "action.primary");
  const engineOwned = ENGINE_OWNED_NORMALIZED_INPUT_IDS.has(normalizedInput);
  const usageLabel = engineOwned
    ? NORMALIZED_USAGE_LABELS[normalizedInput]
    : normalizeText(source.usageLabel || source.actionLabel || source.gameActionLabel || source.action);
  const enabled = engineOwned || source.enabled === undefined ? true : Boolean(source.enabled);
  const eventFields = normalizedEventFields(source);
  const resolvedEventFields = engineOwned
    ? defaultEventFieldsForNormalizedInput(normalizedInput)
    : eventFields;
  const mapping = {
    action: keyFromText(usageLabel),
    actionLabel: usageLabel,
    enabled,
    ...resolvedEventFields,
    id: normalizeText(source.id),
    inputFamily: "",
    normalizedInput,
    objectKey: "global",
    objectName: "Global",
    state: enabled ? "Active" : "Disabled",
    usageLabel,
  };
  return {
    ...mapping,
    id: mapping.id || mappingIdFor(mapping),
  };
}

function ensureEngineOwnedMappings(nextMappings) {
  const normalizedMappings = nextMappings.map((mapping) => normalizeMapping(mapping));
  const pauseIndex = normalizedMappings.findIndex((mapping) => mapping.normalizedInput === "action.pause");
  if (pauseIndex >= 0) {
    return normalizedMappings;
  }
  const pauseMapping = normalizeMapping({
    id: "default-game-control-action-pause",
    normalizedInput: "action.pause",
    usageLabel: "Pause",
  });
  const canonicalIndex = GAME_CONTROL_NORMALIZED_INPUTS.indexOf("action.pause");
  const insertIndex = normalizedMappings.findIndex((mapping) => (
    GAME_CONTROL_NORMALIZED_INPUTS.indexOf(mapping.normalizedInput) > canonicalIndex
  ));
  if (insertIndex >= 0) {
    normalizedMappings.splice(insertIndex, 0, pauseMapping);
  } else {
    normalizedMappings.push(pauseMapping);
  }
  return normalizedMappings;
}

function persistedMappingFieldsChanged(leftMappings, rightMappings) {
  if (leftMappings.length !== rightMappings.length) {
    return true;
  }
  return leftMappings.some((mapping, index) => {
    const other = rightMappings[index];
    return mapping.id !== other.id
      || mapping.enabled !== other.enabled
      || mapping.eventD !== other.eventD
      || mapping.eventDC !== other.eventDC
      || mapping.eventH !== other.eventH
      || mapping.eventU !== other.eventU
      || mapping.normalizedInput !== other.normalizedInput
      || mapping.usageLabel !== other.usageLabel;
  });
}

function readMappings() {
  let result = controlsRepository.listMappings();
  if (!Array.isArray(result)) {
    controlsRepository = createControlsToolApiRepository();
    result = controlsRepository.listMappings();
  }
  if (!Array.isArray(result)) {
    return [];
  }
  if (!result.length) {
    return [];
  }
  const engineOwnedRepairNeeded = result.some((mapping) => mappingNeedsEngineOwnedRepair(mapping));
  const normalizedMappings = result.map((mapping) => normalizeMapping(mapping));
  const gameControlMappings = normalizedMappings.filter((mapping) => GAME_CONTROL_NORMALIZED_INPUT_IDS.has(mapping.normalizedInput));
  const engineSafeMappings = ensureEngineOwnedMappings(gameControlMappings);
  if (engineOwnedRepairNeeded || gameControlMappings.length !== normalizedMappings.length || persistedMappingFieldsChanged(gameControlMappings, engineSafeMappings)) {
    return engineSafeMappings;
  }
  return engineSafeMappings;
}

function createDefaultGameControlMappings() {
  return gameControlNormalizedOptions().map((option, index) => {
    const enabled = COMMON_DEFAULT_GAME_CONTROL_IDS.has(option.value);
    return normalizeMapping({
      enabled,
      ...defaultEventFieldsForNormalizedInput(option.value),
      id: `default-game-control-${index + 1}-${keyFromText(option.value)}`,
      normalizedInput: option.value,
      state: enabled ? "Active" : "Disabled",
      usageLabel: NORMALIZED_USAGE_LABELS[option.value] || option.label,
    });
  });
}

function ensureDefaultMappings() {
  if (mappings.length) {
    return "";
  }
  mappings = createDefaultGameControlMappings();
  return "Loaded default Game Controls for review. Save to persist changes through the server API.";
}

function saveMappings(nextMappings) {
  const normalizedMappings = ensureEngineOwnedMappings(nextMappings);
  let result = controlsRepository.replaceMappings(normalizedMappings);
  if (!Array.isArray(result?.mappings) && result?.error) {
    controlsRepository = createControlsToolApiRepository();
    result = controlsRepository.replaceMappings(normalizedMappings);
  }
  if (Array.isArray(result?.mappings)) {
    mappings = result.mappings.map((mapping) => normalizeMapping(mapping));
    return true;
  }
  setText(elements.statusLog, result?.message || "WARN: Controls could not reach the shared DB adapter.");
  return false;
}

function validateMappingAction(mapping) {
  if (!mapping.enabled) {
    return { ok: true, message: "" };
  }
  if (!normalizeGameControlInput(mapping.normalizedInput)) {
    return {
      ok: false,
      message: "Choose a game-level normalized action.",
    };
  }
  if (!normalizeText(mapping.usageLabel)) {
    return {
      ok: false,
      message: "Add a Usage Label or disable this alternate row.",
    };
  }
  if (!CONTROL_EVENT_OPTIONS.some((option) => Boolean(mapping[option.field]))) {
    return {
      ok: false,
      message: "Choose at least one event: D, H, U, or DC.",
    };
  }
  return { ok: true, message: "" };
}

function statusLabel() {
  if (!mappings.length) {
    return "Missing Game Control Mapping";
  }
  if (mappings.some((mapping) => !validateMappingAction(mapping).ok)) {
    return "Pending Setup";
  }
  return "Complete";
}

function renderOutput() {
  const status = statusLabel();
  const enabledCount = mappings.filter((mapping) => mapping.enabled).length;
  setText(elements.mappingCount, String(mappings.length));
  setText(elements.enabledCount, String(enabledCount));
  setText(elements.outputCount, String(mappings.length));
  setText(elements.outputStatus, status);
  setText(elements.saveStatus, status);
}

function renderMappingRow(mapping) {
  const row = document.createElement("tr");
  row.dataset.inputMappingRow = mapping.id;
  const validation = validateMappingAction(mapping);
  if (!validation.ok) {
    row.dataset.inputMappingValidationState = "invalid";
  }
  row.append(
    checkboxCell(mapping.enabled, `${mapping.usageLabel || "Game control"} enabled`),
    tableCell(mapping.normalizedInput),
    tableCell(mapping.usageLabel || "Unmapped"),
    ...CONTROL_EVENT_OPTIONS.map((option) => eventCheckboxCell(mapping[option.field], option)),
  );
  let actions;
  if (isEngineOwnedMapping(mapping)) {
    row.dataset.inputEngineOwned = "true";
    const lockedMessage = document.createElement("p");
    lockedMessage.className = "status";
    lockedMessage.dataset.inputEngineOwnedStatus = mapping.id;
    lockedMessage.textContent = "Pause is handled by the engine.";
    actions = actionCell([lockedMessage]);
  } else {
    actions = actionCell([
      actionButton("Edit", "inputEditMapping", mapping.id),
      actionButton("Trash", "inputTrashMapping", mapping.id),
    ]);
  }
  if (!validation.ok) {
    const warning = document.createElement("p");
    warning.className = "status";
    warning.dataset.inputMappingValidation = mapping.id;
    warning.textContent = `Needs update: ${validation.message}`;
    actions.append(warning);
  }
  row.append(actions);
  return row;
}

function renderEditingRow(values = {}) {
  const row = document.createElement("tr");
  row.dataset.inputEditingRow = "true";
  row.dataset.inputEditingRowId = values.id || "";

  const enabledInput = document.createElement("input");
  enabledInput.type = "checkbox";
  enabledInput.checked = values.enabled !== false;
  enabledInput.dataset.inputRowEnabled = "true";
  enabledInput.setAttribute("aria-label", "Game control enabled");

  const normalizedInputSelect = selectControl({
    ariaLabel: "Normalized Action",
    options: gameControlNormalizedOptions(),
    selectedValue: values.normalizedInput || "action.primary",
  });
  normalizedInputSelect.dataset.inputRowNormalized = "true";

  const usageInput = document.createElement("input");
  usageInput.type = "text";
  usageInput.value = values.usageLabel || values.actionLabel || "";
  usageInput.placeholder = "Jump";
  usageInput.dataset.inputRowUsageLabel = "true";
  usageInput.setAttribute("aria-label", "Usage Label");

  const actionsCell = actionCell([
    actionButton("Save", "inputSaveMapping"),
    actionButton("Cancel", "inputCancelMapping"),
  ]);
  const validation = document.createElement("p");
  validation.className = "status";
  validation.dataset.inputRowValidation = "true";
  actionsCell.append(validation);

  row.append(
    controlCell(enabledInput),
    controlCell(normalizedInputSelect),
    controlCell(usageInput),
    ...CONTROL_EVENT_OPTIONS.map((option) => editableCheckboxCell({
      checked: values[option.field],
      datasetName: `inputRow${option.field[0].toUpperCase()}${option.field.slice(1)}`,
      option,
    })),
    actionsCell,
  );
  updateEditingRowValidation(row);
  return row;
}

function renderMappings() {
  if (!elements.list) {
    return;
  }
  const rows = mappings.map((mapping) => (
    editingRow?.id === mapping.id
      ? renderEditingRow(editingRow.values)
      : renderMappingRow(mapping)
  ));
  if (!rows.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 8;
    cell.textContent = "Missing Game Control Mapping. Default Game Controls load when the shared DB is available.";
    row.append(cell);
    rows.push(row);
  }
  elements.list.replaceChildren(...rows);
  renderOutput();
}

function editingRowElement() {
  return document.querySelector("[data-input-editing-row]") || null;
}

function mappingFromEditingRow(row) {
  const normalizedInput = normalizeText(row.querySelector("[data-input-row-normalized]")?.value);
  const usageLabel = normalizeText(row.querySelector("[data-input-row-usage-label]")?.value);
  const eventFields = Object.fromEntries(CONTROL_EVENT_OPTIONS.map((option) => [
    option.field,
    Boolean(row.querySelector(`[data-input-row-${option.field.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}]`)?.checked),
  ]));
  return normalizeMapping({
    action: keyFromText(usageLabel),
    actionLabel: usageLabel,
    enabled: Boolean(row.querySelector("[data-input-row-enabled]")?.checked),
    ...eventFields,
    id: editingRow?.id || "",
    normalizedInput,
    state: row.querySelector("[data-input-row-enabled]")?.checked ? "Active" : "Disabled",
    usageLabel,
  });
}

function updateEditingRowValidation(row) {
  const validation = row.querySelector("[data-input-row-validation]");
  if (!validation) {
    return;
  }
  const mapping = mappingFromEditingRow(row);
  const result = validateMappingAction(mapping);
  validation.textContent = result.ok ? "" : `Needs update: ${result.message}`;
}

function saveEditingRow() {
  const row = editingRowElement();
  if (!row) {
    return;
  }
  const mapping = mappingFromEditingRow(row);
  const validation = validateMappingAction(mapping);
  if (!validation.ok) {
    updateEditingRowValidation(row);
    setText(elements.statusLog, `WARN: ${validation.message}`);
    return;
  }
  const nextMappings = editingRow?.id
    ? mappings.map((candidate) => (candidate.id === editingRow.id ? mapping : candidate))
    : [mapping, ...mappings];
  if (!saveMappings(nextMappings)) {
    return;
  }
  editingRow = null;
  renderMappings();
  setText(elements.statusLog, `Saved ${mapping.usageLabel} game control.`);
}

function editMapping(mappingId) {
  const mapping = mappings.find((candidate) => candidate.id === mappingId);
  if (!mapping) {
    return;
  }
  if (isEngineOwnedMapping(mapping)) {
    setText(elements.statusLog, "Pause is handled by the engine.");
    return;
  }
  editingRow = {
    id: mapping.id,
    values: mapping,
  };
  renderMappings();
  setText(elements.statusLog, `Editing ${mapping.usageLabel} game control.`);
}

function deleteMapping(mappingId) {
  const mapping = mappings.find((candidate) => candidate.id === mappingId);
  if (mapping && isEngineOwnedMapping(mapping)) {
    setText(elements.statusLog, "Pause is handled by the engine.");
    return;
  }
  const nextMappings = mappings.filter((mapping) => mapping.id !== mappingId);
  if (!saveMappings(nextMappings)) {
    return;
  }
  editingRow = null;
  renderMappings();
  setText(elements.statusLog, "Deleted game control.");
}

function handleListClick(event) {
  const target = event.target instanceof Element ? event.target.closest("button") : null;
  if (!target) {
    return;
  }
  if (target.dataset.inputSaveMapping !== undefined) {
    saveEditingRow();
  } else if (target.dataset.inputCancelMapping !== undefined) {
    editingRow = null;
    renderMappings();
    setText(elements.statusLog, "Canceled game control edit.");
  } else if (target.dataset.inputEditMapping !== undefined) {
    editMapping(target.dataset.inputEditMapping || "");
  } else if (target.dataset.inputTrashMapping !== undefined) {
    deleteMapping(target.dataset.inputTrashMapping || "");
  }
}

function handleListChange(event) {
  const target = event.target instanceof Element ? event.target : null;
  if (!target?.matches("[data-input-row-enabled], [data-input-row-normalized], [data-input-row-usage-label], [data-input-row-event-d], [data-input-row-event-h], [data-input-row-event-u], [data-input-row-event-d-c]")) {
    return;
  }
  const row = target.closest("[data-input-editing-row]");
  if (!row) {
    return;
  }
  updateEditingRowValidation(row);
}

function showWorkspaceReturnIfNeeded() {
  if (!elements.returnWorkspace) {
    return;
  }
  const params = new URLSearchParams(window.location.search);
  const returnTo = normalizeText(params.get("returnTo"));
  const shouldShow = params.has("workspace") || params.has("project") || params.get("source") === "workspace" || params.has("workspaceLaunch") || returnTo;
  if (returnTo.startsWith("/toolbox/game-hub/")) {
    elements.returnWorkspace.href = returnTo;
  }
  elements.returnWorkspace.hidden = !shouldShow;
}

function init() {
  showWorkspaceReturnIfNeeded();
  mappings = readMappings();
  const defaultMessage = ensureDefaultMappings();
  renderMappings();
  if (defaultMessage) {
    setText(elements.statusLog, defaultMessage);
  }
  elements.list?.addEventListener("click", handleListClick);
  elements.list?.addEventListener("change", handleListChange);
  elements.list?.addEventListener("input", handleListChange);
}

init();
