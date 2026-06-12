import { createControlsToolApiRepository } from "./controls-api-client.js";
import {
  normalizeNormalizedInput,
  normalizedInputOptions,
} from "../../src/engine/input/NormalizedInputRegistry.js";

const CONTROL_EVENT_OPTIONS = Object.freeze([
  Object.freeze({ field: "eventD", label: "D" }),
  Object.freeze({ field: "eventH", label: "H" }),
  Object.freeze({ field: "eventU", label: "U" }),
  Object.freeze({ field: "eventDC", label: "DC" }),
]);

const NORMALIZED_USAGE_LABELS = Object.freeze({
  "action.cancel": "Cancel",
  "action.confirm": "Confirm",
  "action.menu": "Menu",
  "action.pause": "Pause",
  "action.primary": "Primary Action",
  "action.quaternary": "Fourth Action",
  "action.secondary": "Secondary Action",
  "action.select": "Select",
  "action.start": "Start",
  "action.tertiary": "Third Action",
  "aim.x-": "Aim Left",
  "aim.x+": "Aim Right",
  "aim.y-": "Aim Up",
  "aim.y+": "Aim Down",
  "dpad.down": "D-Pad Down",
  "dpad.left": "D-Pad Left",
  "dpad.right": "D-Pad Right",
  "dpad.up": "D-Pad Up",
  "move.x-": "Move Left",
  "move.x+": "Move Right",
  "move.y-": "Move Up",
  "move.y+": "Move Down",
  "trigger.left": "Left Trigger",
  "trigger.right": "Right Trigger",
});

const COMMON_DEFAULT_GAME_CONTROLS = new Set([
  "action.cancel",
  "action.confirm",
  "action.pause",
  "action.primary",
  "action.secondary",
  "action.start",
  "move.x-",
  "move.x+",
  "move.y-",
  "move.y+",
]);

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

function editableCheckboxCell({ checked, datasetName, label }) {
  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = Boolean(checked);
  input.dataset[datasetName] = "true";
  input.setAttribute("aria-label", label);
  const cell = controlCell(input);
  cell.dataset.inputEventChecked = checked ? "true" : "false";
  cell.title = checked ? `${label} enabled` : `${label} disabled`;
  if (checked) {
    cell.className = "status";
  }
  return cell;
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
  const normalizedInput = normalizeNormalizedInput(sourceNormalizedInput, sourceNormalizedInput ? "" : "action.primary");
  const usageLabel = normalizeText(source.usageLabel || source.actionLabel || source.gameActionLabel || source.action);
  const enabled = source.enabled === undefined ? true : Boolean(source.enabled);
  const eventFields = normalizedEventFields(source);
  const mapping = {
    action: keyFromText(usageLabel),
    actionLabel: usageLabel,
    enabled,
    ...eventFields,
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

function readMappings() {
  let result = controlsRepository.listMappings();
  if (!Array.isArray(result)) {
    controlsRepository = createControlsToolApiRepository();
    result = controlsRepository.listMappings();
  }
  return Array.isArray(result) ? result.map((mapping) => normalizeMapping(mapping)) : [];
}

function createDefaultGameControlMappings() {
  return normalizedInputOptions().map((option, index) => {
    const enabled = COMMON_DEFAULT_GAME_CONTROLS.has(option.value);
    return normalizeMapping({
      enabled,
      eventD: true,
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
  if (saveMappings(createDefaultGameControlMappings())) {
    return "Loaded default Game Controls. Common rows are enabled; alternate rows are disabled.";
  }
  return "";
}

function saveMappings(nextMappings) {
  const normalizedMappings = nextMappings.map((mapping) => normalizeMapping(mapping));
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
  if (!normalizeNormalizedInput(mapping.normalizedInput)) {
    return {
      ok: false,
      message: "Choose a normalized action from the registry.",
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
    ...CONTROL_EVENT_OPTIONS.map((option) => checkboxCell(mapping[option.field], option.label)),
  );
  const actions = actionCell([
    actionButton("Edit", "inputEditMapping", mapping.id),
    actionButton("Trash", "inputTrashMapping", mapping.id),
  ]);
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

  const enabledInput = document.createElement("input");
  enabledInput.type = "checkbox";
  enabledInput.checked = values.enabled !== false;
  enabledInput.dataset.inputRowEnabled = "true";
  enabledInput.setAttribute("aria-label", "Game control enabled");

  const normalizedInputSelect = selectControl({
    ariaLabel: "Normalized Action",
    options: normalizedInputOptions(),
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
      label: option.label,
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
  const rows = [];
  if (editingRow) {
    rows.push(renderEditingRow(editingRow.values));
  }
  const visibleMappings = editingRow?.id
    ? mappings.filter((mapping) => mapping.id !== editingRow.id)
    : mappings;
  rows.push(...visibleMappings.map((mapping) => renderMappingRow(mapping)));
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
  editingRow = {
    id: mapping.id,
    values: mapping,
  };
  renderMappings();
  setText(elements.statusLog, `Editing ${mapping.usageLabel} game control.`);
}

function deleteMapping(mappingId) {
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
  if (returnTo.startsWith("/toolbox/game-workspace/")) {
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
