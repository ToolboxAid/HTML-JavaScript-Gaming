import { createObjectsToolApiRepository } from "../objects/objects-api-client.js";
import { createControlsToolApiRepository } from "./controls-api-client.js";
import InputService from "../../src/engine/input/InputService.js";
import {
  normalizeNormalizedInput,
} from "../../src/engine/input/NormalizedInputRegistry.js";

const CONTROL_EVENT_OPTIONS = Object.freeze([
  Object.freeze({ field: "eventD", label: "Down" }),
  Object.freeze({ field: "eventH", label: "Hold" }),
  Object.freeze({ field: "eventU", label: "Up" }),
  Object.freeze({ field: "eventDC", label: "Double Click" }),
  Object.freeze({ field: "eventDrag", label: "Drag" }),
  Object.freeze({ field: "eventAxis", label: "Axis" }),
]);
const INPUT_FAMILY_OPTIONS = Object.freeze([
  Object.freeze({ label: "Keyboard", value: "Keyboard" }),
  Object.freeze({ label: "Mouse", value: "Mouse" }),
  Object.freeze({ label: "Gamepad", value: "Gamepad" }),
  Object.freeze({ label: "Joystick", value: "Joystick" }),
]);
const SUPPORTED_CONTROL_TYPES = Object.freeze([
  "Keyboard Key",
  "Mouse Button",
  "Mouse Axis",
  "Mouse Wheel",
  "Gamepad Button",
  "Gamepad Trigger",
  "Gamepad Bumper",
  "Gamepad Stick Button",
  "Gamepad Axis",
  "Joystick Button",
  "Joystick Axis",
  "Touch Button",
  "Touch Axis / Pad",
  "Pointer Drag",
]);
const NORMALIZED_CONTROL_DESCRIPTIONS = Object.freeze({
  "action.cancel": "Cancel an action or leave a menu.",
  "action.confirm": "Confirm a menu choice or prompt.",
  "action.menu": "Open or close a game menu.",
  "action.pause": "Pause gameplay.",
  "action.primary": "Primary game action.",
  "action.quaternary": "Fourth game action.",
  "action.secondary": "Secondary game action.",
  "action.select": "Select a menu item.",
  "action.start": "Start or resume the game.",
  "action.tertiary": "Third game action.",
  "aim.x-": "Aim left.",
  "aim.x+": "Aim right.",
  "aim.y-": "Aim up.",
  "aim.y+": "Aim down.",
  "dpad.down": "Directional pad down.",
  "dpad.left": "Directional pad left.",
  "dpad.right": "Directional pad right.",
  "dpad.up": "Directional pad up.",
  "move.x-": "Move left.",
  "move.x+": "Move right.",
  "move.y-": "Move up.",
  "move.y+": "Move down.",
  "trigger.left": "Left trigger.",
  "trigger.right": "Right trigger.",
});
const COMMON_FULL_CONTROL_INPUTS = new Set([
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
const GENERIC_INPUT_FAMILY_ROWS = Object.freeze({
  Keyboard: Object.freeze([
    "move.x-",
    "move.x+",
    "move.y-",
    "move.y+",
    "action.primary",
    "action.secondary",
    "action.confirm",
    "action.cancel",
    "action.pause",
    "action.start",
  ]),
  Mouse: Object.freeze([
    "aim.x-",
    "aim.x+",
    "aim.y-",
    "aim.y+",
    "action.primary",
    "action.secondary",
  ]),
});
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
const GAME_CONTROL_PRESETS = Object.freeze({
  fighting: Object.freeze([
    Object.freeze({ enabled: true, eventD: true, normalizedInput: "move.x-", usageLabel: "Move Left" }),
    Object.freeze({ enabled: true, eventD: true, normalizedInput: "move.x+", usageLabel: "Move Right" }),
    Object.freeze({ enabled: true, eventD: true, normalizedInput: "action.primary", usageLabel: "Light Attack" }),
    Object.freeze({ enabled: true, eventD: true, normalizedInput: "action.secondary", usageLabel: "Heavy Attack" }),
    Object.freeze({ enabled: false, eventD: true, normalizedInput: "action.tertiary", usageLabel: "Block" }),
    Object.freeze({ enabled: false, eventD: true, normalizedInput: "trigger.right", usageLabel: "Special" }),
    Object.freeze({ enabled: true, eventD: true, normalizedInput: "action.start", usageLabel: "Pause" }),
  ]),
  menu: Object.freeze([
    Object.freeze({ enabled: true, eventD: true, normalizedInput: "move.y-", usageLabel: "Menu Up" }),
    Object.freeze({ enabled: true, eventD: true, normalizedInput: "move.y+", usageLabel: "Menu Down" }),
    Object.freeze({ enabled: true, eventD: true, normalizedInput: "action.confirm", usageLabel: "Confirm" }),
    Object.freeze({ enabled: true, eventD: true, normalizedInput: "action.cancel", usageLabel: "Cancel" }),
    Object.freeze({ enabled: false, eventD: true, normalizedInput: "action.menu", usageLabel: "Menu" }),
  ]),
  "paddle-ball": Object.freeze([
    Object.freeze({ enabled: true, eventD: true, normalizedInput: "move.x-", usageLabel: "Move Left" }),
    Object.freeze({ enabled: true, eventD: true, normalizedInput: "move.x+", usageLabel: "Move Right" }),
    Object.freeze({ enabled: true, eventD: true, normalizedInput: "action.primary", usageLabel: "Serve" }),
    Object.freeze({ enabled: true, eventD: true, normalizedInput: "action.start", usageLabel: "Pause" }),
    Object.freeze({ enabled: false, eventAxis: true, normalizedInput: "aim.x+", usageLabel: "Aim Paddle" }),
  ]),
  "party-arena": Object.freeze([
    Object.freeze({ enabled: true, eventD: true, normalizedInput: "move.x-", usageLabel: "Move Left" }),
    Object.freeze({ enabled: true, eventD: true, normalizedInput: "move.x+", usageLabel: "Move Right" }),
    Object.freeze({ enabled: true, eventD: true, normalizedInput: "move.y-", usageLabel: "Move Up" }),
    Object.freeze({ enabled: true, eventD: true, normalizedInput: "move.y+", usageLabel: "Move Down" }),
    Object.freeze({ enabled: true, eventD: true, normalizedInput: "action.primary", usageLabel: "Jump" }),
    Object.freeze({ enabled: true, eventD: true, normalizedInput: "action.secondary", usageLabel: "Attack" }),
    Object.freeze({ enabled: false, eventD: true, normalizedInput: "trigger.right", usageLabel: "Special" }),
    Object.freeze({ enabled: true, eventD: true, normalizedInput: "action.start", usageLabel: "Pause" }),
  ]),
  platformer: Object.freeze([
    Object.freeze({ enabled: true, eventD: true, normalizedInput: "move.x-", usageLabel: "Move Left" }),
    Object.freeze({ enabled: true, eventD: true, normalizedInput: "move.x+", usageLabel: "Move Right" }),
    Object.freeze({ enabled: true, eventD: true, normalizedInput: "action.primary", usageLabel: "Jump" }),
    Object.freeze({ enabled: true, eventD: true, normalizedInput: "action.secondary", usageLabel: "Attack" }),
    Object.freeze({ enabled: true, eventD: true, normalizedInput: "action.start", usageLabel: "Pause" }),
    Object.freeze({ enabled: false, eventD: true, normalizedInput: "move.y-", usageLabel: "Look Up" }),
    Object.freeze({ enabled: false, eventD: true, normalizedInput: "move.y+", usageLabel: "Crouch" }),
  ]),
  shooter: Object.freeze([
    Object.freeze({ enabled: true, eventD: true, normalizedInput: "move.x-", usageLabel: "Move Left" }),
    Object.freeze({ enabled: true, eventD: true, normalizedInput: "move.x+", usageLabel: "Move Right" }),
    Object.freeze({ enabled: true, eventD: true, normalizedInput: "move.y-", usageLabel: "Move Up" }),
    Object.freeze({ enabled: true, eventD: true, normalizedInput: "move.y+", usageLabel: "Move Down" }),
    Object.freeze({ enabled: true, eventD: true, normalizedInput: "action.primary", usageLabel: "Fire" }),
    Object.freeze({ enabled: false, eventH: true, normalizedInput: "action.primary", usageLabel: "Charge Shot" }),
    Object.freeze({ enabled: false, eventU: true, normalizedInput: "action.primary", usageLabel: "Release Shot" }),
    Object.freeze({ enabled: true, eventD: true, normalizedInput: "action.start", usageLabel: "Pause" }),
  ]),
  vehicle: Object.freeze([
    Object.freeze({ enabled: true, eventD: true, normalizedInput: "trigger.right", usageLabel: "Thrust" }),
    Object.freeze({ enabled: true, eventD: true, normalizedInput: "trigger.left", usageLabel: "Brake" }),
    Object.freeze({ enabled: true, eventD: true, normalizedInput: "move.x-", usageLabel: "Steer Left" }),
    Object.freeze({ enabled: true, eventD: true, normalizedInput: "move.x+", usageLabel: "Steer Right" }),
    Object.freeze({ enabled: true, eventD: true, normalizedInput: "action.start", usageLabel: "Pause" }),
    Object.freeze({ enabled: false, eventAxis: true, normalizedInput: "aim.x+", usageLabel: "Analog Steering" }),
    Object.freeze({ enabled: false, eventD: true, normalizedInput: "action.primary", usageLabel: "Thrust" }),
    Object.freeze({ enabled: false, eventD: true, normalizedInput: "action.secondary", usageLabel: "Brake" }),
  ]),
});
let controlsRepository = createControlsToolApiRepository();
let objectsRepository = createObjectsToolApiRepository();
let mappings = [];
let objectOptions = [];
let editingRow = null;
const inputService = new InputService({ target: window });

const elements = {
  actionSelect: document.querySelector("[data-input-action-select]"),
  addKeyboardFamily: document.querySelector("[data-input-add-keyboard-family]"),
  addMapping: document.querySelector("[data-input-add-mapping]"),
  addMouseFamily: document.querySelector("[data-input-add-mouse-family]"),
  accountUserControlsLink: document.querySelector("[data-account-user-controls-link]"),
  customActionStatus: document.querySelector("[data-input-custom-action-status]"),
  defaultActions: document.querySelector("[data-input-default-actions]"),
  deviceCount: document.querySelector("[data-input-device-count]"),
  controlTypeList: document.querySelector("[data-input-control-type-list]"),
  list: document.querySelector("[data-input-mapping-list]"),
  mappingCount: document.querySelector("[data-input-mapping-count]"),
  mappingJson: document.querySelector("[data-input-mapping-json]"),
  objectSummaryActions: document.querySelector("[data-input-object-summary-actions]"),
  objectSummaryName: document.querySelector("[data-input-object-summary-name]"),
  objectSummaryRole: document.querySelector("[data-input-object-summary-role]"),
  objectSelect: document.querySelector("[data-input-object-select]"),
  outputCount: document.querySelector("[data-input-output-count]"),
  outputStatus: document.querySelector("[data-input-output-status]"),
  refreshDevices: document.querySelector("[data-input-refresh-devices]"),
  resetMappings: document.querySelector("[data-input-reset-mappings]"),
  returnWorkspace: document.querySelector("[data-input-return-workspace]"),
  saveStatus: document.querySelector("[data-input-save-status]"),
  sourceDiagnostics: document.querySelector("[data-input-source-diagnostics]"),
  statusLog: document.querySelector("[data-input-status-log]"),
  presetButtons: document.querySelectorAll("[data-input-preset]"),
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

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.map(normalizeText).filter(Boolean);
  }
  return normalizeText(value)
    .split(",")
    .map(normalizeText)
    .filter(Boolean);
}

function listLabel(values, fallback = "Not configured") {
  const normalizedValues = normalizeList(values);
  return normalizedValues.length ? normalizedValues.join(", ") : fallback;
}

function normalizeInputFamily(value) {
  const normalized = normalizeText(value);
  return INPUT_FAMILY_OPTIONS.some((option) => option.value === normalized) ? normalized : "Keyboard";
}

function legacyEventFields(source = {}) {
  const phase = normalizeText(source.inputEventPhase);
  if (phase === "Release") {
    return {
      eventAxis: false,
      eventD: false,
      eventDC: false,
      eventDrag: false,
      eventH: false,
      eventU: true,
    };
  }
  if (phase === "Press" || phase === "Down") {
    return {
      eventAxis: false,
      eventD: true,
      eventDC: false,
      eventDrag: false,
      eventH: false,
      eventU: false,
    };
  }
  return {
    eventAxis: false,
    eventD: true,
    eventDC: false,
    eventDrag: false,
    eventH: false,
    eventU: false,
  };
}

function normalizedEventFields(source = {}) {
  const legacy = legacyEventFields(source);
  return {
    eventAxis: source.eventAxis === undefined ? legacy.eventAxis : Boolean(source.eventAxis),
    eventD: source.eventD === undefined ? legacy.eventD : Boolean(source.eventD),
    eventDC: source.eventDC === undefined ? legacy.eventDC : Boolean(source.eventDC),
    eventDrag: source.eventDrag === undefined ? legacy.eventDrag : Boolean(source.eventDrag),
    eventH: source.eventH === undefined ? legacy.eventH : Boolean(source.eventH),
    eventU: source.eventU === undefined ? legacy.eventU : Boolean(source.eventU),
  };
}

function setText(element, value) {
  if (element) {
    element.textContent = value;
  }
}

function normalizedControlCatalog() {
  return inputService.getNormalizedInputOptions().map((option) => ({
    description: NORMALIZED_CONTROL_DESCRIPTIONS[option.value] || "Generic normalized control.",
    id: option.value,
    label: option.label,
  }));
}

function availableGamepads() {
  inputService.update();
  return inputService.getGamepads();
}

function selectedObject() {
  const objectKey = elements.objectSelect?.value || "global";
  return objectOptions.find((object) => object.key === objectKey) || objectOptions[0];
}

function selectedAction() {
  const normalized = normalizeNormalizedInput(elements.actionSelect?.value, "action.primary");
  return {
    id: normalized,
    label: inputService.getNormalizedInputLabel(normalized),
  };
}

function objectByKey(objectKey) {
  return objectOptions.find((object) => object.key === objectKey) || null;
}

function validateMappingAction(mapping) {
  const object = objectByKey(mapping.objectKey);
  if (!object && mapping.objectKey !== "global") {
    return {
      ok: false,
      message: `${mapping.objectName || "This mapping"} needs an object that still exists. Edit this row and choose an existing object.`,
    };
  }
  if (!mapping.enabled) {
    return { ok: true, message: "" };
  }
  if (!normalizeNormalizedInput(mapping.normalizedInput)) {
    return {
      ok: false,
      message: "Choose a fixed normalized action type from the registry.",
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
      message: "Choose at least one event: Down, Hold, Up, Double Click, Drag, or Axis.",
    };
  }
  return { ok: true, message: "" };
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

function actionButton(text, dataName, value = "", className = "btn btn--compact") {
  const button = document.createElement("button");
  button.className = className;
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
  options.forEach((option) => {
    select.append(optionElement(option.value, option.label));
  });
  select.value = options.some((option) => option.value === selectedValue)
    ? selectedValue
    : options[0]?.value || "";
  return select;
}

function controlCell(control) {
  const cell = document.createElement("td");
  cell.append(control);
  return cell;
}

function checkboxCell(checked, label) {
  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = Boolean(checked);
  input.disabled = true;
  input.setAttribute("aria-label", label);
  return controlCell(input);
}

function editableCheckboxCell({ checked, dataName, label }) {
  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = Boolean(checked);
  input.dataset[dataName] = "true";
  input.setAttribute("aria-label", label);
  return controlCell(input);
}

function labeledControl(labelText, control) {
  const label = document.createElement("label");
  label.textContent = labelText;
  label.append(control);
  return label;
}

function mappingIdFor(mapping) {
  const base = [
    "game-controls",
    mapping.objectKey || "global",
    mapping.usageLabel || mapping.actionLabel || mapping.action,
    mapping.inputFamily,
    mapping.normalizedInput,
    CONTROL_EVENT_OPTIONS
      .filter((option) => Boolean(mapping[option.field]))
      .map((option) => option.label)
      .join("-"),
  ].join("-");
  return keyFromText(base) || `mapping-${Date.now()}`;
}

function normalizeMapping(source = {}) {
  const binding = normalizeText(source.binding || source.input);
  const sourceNormalizedInput = normalizeText(source.normalizedInput);
  const normalizedInput = normalizeNormalizedInput(
    sourceNormalizedInput,
    sourceNormalizedInput ? "" : inputService.getDefaultNormalizedInputForPhysicalInput(binding) || "action.primary",
  );
  const usageLabel = normalizeText(source.usageLabel || source.actionLabel || source.gameActionLabel || source.action);
  const eventFields = normalizedEventFields(source);
  const objectKey = normalizeText(source.objectKey) || "global";
  const objectName = normalizeText(source.objectName) || objectOptions.find((object) => object.key === objectKey)?.label || "Global";
  const mapping = {
    action: normalizeText(source.action) || keyFromText(usageLabel),
    actionLabel: usageLabel,
    enabled: source.enabled === undefined ? true : Boolean(source.enabled),
    ...eventFields,
    id: normalizeText(source.id),
    inputFamily: normalizeInputFamily(source.inputFamily),
    label: inputService.getNormalizedInputLabel(normalizedInput),
    normalizedInput,
    objectKey,
    objectName,
    state: normalizeText(source.state) || "Active",
    usageLabel,
  };
  return {
    ...mapping,
    id: mapping.id || mappingIdFor(mapping),
  };
}

function payloadActions() {
  return mappings
    .filter((mapping) => mapping.enabled && mapping.state === "Active")
    .map((mapping) => ({
      engine: "src/engine/input/NormalizedInputRegistry",
      events: Object.fromEntries(CONTROL_EVENT_OPTIONS.map((option) => [option.label, Boolean(mapping[option.field])])),
      inputFamily: mapping.inputFamily,
      normalizedInput: mapping.normalizedInput,
      objectKey: mapping.objectKey,
      source: "normalized",
      usageLabel: mapping.usageLabel,
    }));
}

function payloadJson() {
  return {
    actions: payloadActions(),
    engineInputModel: "src/engine/input/InputMap",
    toolId: "controls",
    version: 1,
  };
}

function readMappings() {
  let result = controlsRepository.listMappings();
  if (Array.isArray(result)) {
    return result.map(normalizeMapping);
  }
  controlsRepository = createControlsToolApiRepository();
  result = controlsRepository.listMappings();
  return Array.isArray(result) ? result.map(normalizeMapping) : [];
}

function saveMappings(nextMappings) {
  const normalizedMappings = nextMappings.map(normalizeMapping);
  let result = controlsRepository.replaceMappings(normalizedMappings);
  if (!Array.isArray(result?.mappings) && result?.error) {
    controlsRepository = createControlsToolApiRepository();
    result = controlsRepository.replaceMappings(normalizedMappings);
  }
  if (Array.isArray(result?.mappings)) {
    mappings = result.mappings.map(normalizeMapping);
    return true;
  }
  mappings = normalizedMappings;
  setText(elements.statusLog, result?.message || "WARN: Mapping save could not reach the shared DB adapter.");
  return false;
}

function resetStoredMappings() {
  let result = controlsRepository.resetMappings();
  if (!Array.isArray(result?.mappings) && result?.error) {
    controlsRepository = createControlsToolApiRepository();
    result = controlsRepository.resetMappings();
  }
  mappings = Array.isArray(result?.mappings) ? result.mappings.map(normalizeMapping) : [];
}

function defaultInputFamilyForNormalizedInput(normalizedInput) {
  if (normalizedInput.startsWith("aim.")) {
    return "Mouse";
  }
  if (normalizedInput.startsWith("trigger.") || normalizedInput.startsWith("dpad.")) {
    return "Gamepad";
  }
  return "Keyboard";
}

function defaultEventFieldsForNormalizedInput(normalizedInput) {
  const isContinuous = normalizedInput.startsWith("aim.") || normalizedInput.startsWith("trigger.");
  return {
    eventAxis: isContinuous,
    eventD: !isContinuous,
    eventDC: false,
    eventDrag: false,
    eventH: false,
    eventU: false,
  };
}

function createFullGameControlSet(object = selectedObject()) {
  return normalizedControlCatalog().map((control, index) => {
    const normalizedInput = control.id;
    const enabled = COMMON_FULL_CONTROL_INPUTS.has(normalizedInput);
    return normalizeMapping({
      ...defaultEventFieldsForNormalizedInput(normalizedInput),
      enabled,
      id: `full-game-control-${keyFromText(object.key)}-${index + 1}-${keyFromText(normalizedInput)}`,
      inputFamily: defaultInputFamilyForNormalizedInput(normalizedInput),
      normalizedInput,
      objectKey: object.key,
      objectName: object.label,
      state: enabled ? "Active" : "Disabled",
      usageLabel: NORMALIZED_USAGE_LABELS[normalizedInput] || control.label,
    });
  });
}

function createGenericInputFamilyRows(inputFamily, object = selectedObject()) {
  const family = normalizeInputFamily(inputFamily);
  const normalizedInputs = GENERIC_INPUT_FAMILY_ROWS[family] || [];
  return normalizedInputs.map((normalizedInput, index) => normalizeMapping({
    ...defaultEventFieldsForNormalizedInput(normalizedInput),
    enabled: true,
    id: `generic-${keyFromText(family)}-control-${keyFromText(object.key)}-${index + 1}-${keyFromText(normalizedInput)}`,
    inputFamily: family,
    normalizedInput,
    objectKey: object.key,
    objectName: object.label,
    state: "Active",
    usageLabel: NORMALIZED_USAGE_LABELS[normalizedInput] || inputService.getNormalizedInputLabel(normalizedInput),
  }));
}

function renderCurrentState(message = "") {
  renderActionsAndObjects();
  renderDefaults();
  renderDiagnostics(message);
  renderMappings();
}

function addFullGameControlSet() {
  const existingIds = new Set(mappings.map((mapping) => mapping.id));
  const nextMappings = [...mappings];
  createFullGameControlSet().forEach((mapping) => {
    if (!existingIds.has(mapping.id)) {
      nextMappings.push(mapping);
    }
  });
  saveMappings(nextMappings);
  editingRow = null;
  renderCurrentState("Added the full normalized game control set. Common rows are enabled; alternate rows are disabled.");
}

function addGenericInputFamilyRows(inputFamily) {
  const existingIds = new Set(mappings.map((mapping) => mapping.id));
  const nextMappings = [...mappings];
  createGenericInputFamilyRows(inputFamily).forEach((mapping) => {
    if (!existingIds.has(mapping.id)) {
      nextMappings.push(mapping);
    }
  });
  saveMappings(nextMappings);
  editingRow = null;
  renderCurrentState(`Added generic ${inputFamily} game control rows.`);
}

function applyGameControlPreset(presetKey) {
  const preset = GAME_CONTROL_PRESETS[presetKey];
  if (!preset) {
    setText(elements.statusLog, "WARN: Choose a known game control preset.");
    return;
  }
  const nextMappings = preset.map((row, index) => normalizeMapping({
    ...row,
    id: `${presetKey}-${index + 1}`,
    inputFamily: row.inputFamily || "Keyboard",
    objectKey: "global",
    objectName: "Global",
    state: "Active",
  }));
  saveMappings(nextMappings);
  editingRow = null;
  renderCurrentState(`Applied ${presetKey.replace(/-/g, " ")} preset. Common rows are enabled; alternate rows are disabled.`);
}

function readObjectOptions() {
  let result = objectsRepository.listObjects();
  if (!Array.isArray(result)) {
    objectsRepository = createObjectsToolApiRepository();
    result = objectsRepository.listObjects();
  }
  const objects = Array.isArray(result) ? result : [];
  return [
    { capabilities: [], key: "global", label: "Global", role: "Global" },
    ...objects.map((object) => ({
      capabilities: normalizeList(object.traits || object.capabilities),
      key: normalizeText(object.id) || keyFromText(object.name),
      label: normalizeText(object.name),
      role: normalizeText(object.role || object.type) || "Custom",
    })).filter((object) => object.key && object.label),
  ];
}

function renderSelect(select, options, selectedValue) {
  if (!select) {
    return;
  }
  select.classList.add("tool-form-control");
  select.replaceChildren(...options.map((option) => optionElement(option.value, option.label)));
  select.value = options.some((option) => option.value === selectedValue)
    ? selectedValue
    : options[0]?.value || "";
}

function renderDefaults() {
  if (!elements.defaultActions) {
    return;
  }
  elements.defaultActions.replaceChildren(...normalizedControlCatalog().map((action) => {
    const row = document.createElement("tr");
    row.dataset.inputActionCatalogRow = action.id;
    const labelCell = document.createElement("td");
    const label = document.createElement("strong");
    label.dataset.inputActionLabel = action.id;
    label.textContent = action.label;
    labelCell.append(label);
    const descriptionCell = document.createElement("td");
    const description = document.createElement("span");
    description.className = "status";
    description.dataset.inputActionDescription = action.id;
    description.textContent = action.description;
    descriptionCell.append(description);
    row.append(labelCell, descriptionCell);
    return row;
  }));
  if (elements.controlTypeList) {
    elements.controlTypeList.replaceChildren(...SUPPORTED_CONTROL_TYPES.map((controlType) => {
      const item = document.createElement("li");
      item.textContent = controlType;
      return item;
    }));
  }
  setText(elements.customActionStatus, "Normalized control types loaded. Custom normalized action types are not accepted.");
}

function renderActionsAndObjects() {
  const previousAction = elements.actionSelect?.value || "action.primary";
  const previousObject = elements.objectSelect?.value || "global";
  renderSelect(
    elements.objectSelect,
    objectOptions.map((object) => ({ label: object.label, value: object.key })),
    previousObject,
  );
  const object = selectedObject();
  renderSelect(
    elements.actionSelect,
    normalizedControlCatalog().map((control) => ({ label: control.label, value: control.id })),
    previousAction,
  );
  renderObjectSummary(object);
}

function renderObjectSummary(object = selectedObject()) {
  const availableActions = normalizedControlCatalog().map((action) => action.label).join(", ");
  setText(elements.objectSummaryName, object?.label || "Global");
  setText(elements.objectSummaryRole, object?.role || "Global");
  setText(elements.objectSummaryActions, availableActions || "No normalized controls available");
}

function renderDiagnostics(message = "") {
  const pads = availableGamepads();
  const gamepadWarning = pads.length ? "" : gamepadSummary();
  const diagnostics = inputService.getInputDeviceCapabilities({
    gamepadCount: pads.length,
    gamepadWarning,
    webXrAvailable: typeof navigator !== "undefined" && Boolean(navigator.xr),
  });
  if (elements.sourceDiagnostics) {
    elements.sourceDiagnostics.replaceChildren(...diagnostics.map((diagnostic) => {
      const item = document.createElement("li");
      const detail = diagnostic.emptyState || diagnostic.detail || "No additional setup guidance.";
      const status = diagnostic.available === false ? "WARN" : "Ready";
      item.dataset.inputDeviceDiagnostic = diagnostic.id;
      item.dataset.inputDeviceStatus = diagnostic.available === false ? "warn" : "ready";
      item.title = detail;
      item.setAttribute("aria-label", `${diagnostic.label}: ${status}. ${detail}`);
      item.textContent = `${diagnostic.label}: ${status}. ${detail}`;
      return item;
    }));
  }
  setText(elements.deviceCount, String(diagnostics.length));
  if (message) {
    setText(elements.statusLog, message);
  }
}

function gamepadSummary() {
  const pads = availableGamepads();
  if (!pads.length) {
    return "WARN: No live gamepad value. Click inside this page, connect a gamepad, and press a button.";
  }
  return `${pads.length} live gamepad value${pads.length === 1 ? "" : "s"} available. Configure physical mappings in Account User Controls.`;
}

function statusLabel() {
  if (!mappings.length) {
    return "Missing Game Control Mapping";
  }
  if (mappings.some((mapping) => !validateMappingAction(mapping).ok)) {
    return "Pending Setup";
  }
  if (mappings.some((mapping) => mapping.enabled && mapping.state !== "Active")) {
    return "Pending Setup";
  }
  return "Complete";
}

function renderOutput() {
  const status = statusLabel();
  setText(elements.mappingCount, String(mappings.length));
  setText(elements.outputCount, String(mappings.length));
  setText(elements.outputStatus, status);
  setText(elements.saveStatus, status);
  if (elements.mappingJson) {
    elements.mappingJson.textContent = JSON.stringify(payloadJson(), null, 2);
  }
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
    tableCell(mapping.inputFamily),
    ...CONTROL_EVENT_OPTIONS.map((option) => checkboxCell(mapping[option.field], option.label)),
    tableCell(mapping.objectName),
    tableCell(mapping.state),
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
  const selectedObjectKey = values.objectKey || elements.objectSelect?.value || "global";
  const object = objectByKey(selectedObjectKey) || objectOptions[0];

  const objectSelect = selectControl({
    ariaLabel: "Mapping Object",
    options: objectOptions.map((object) => ({ label: object.label, value: object.key })),
    selectedValue: selectedObjectKey,
  });
  objectSelect.dataset.inputRowObject = "true";

  const enabledInput = document.createElement("input");
  enabledInput.type = "checkbox";
  enabledInput.checked = values.enabled !== false;
  enabledInput.dataset.inputRowEnabled = "true";
  enabledInput.setAttribute("aria-label", "Game control enabled");

  const usageInput = document.createElement("input");
  usageInput.type = "text";
  usageInput.value = values.usageLabel || values.actionLabel || "";
  usageInput.placeholder = "Jump";
  usageInput.dataset.inputRowUsageLabel = "true";
  usageInput.setAttribute("aria-label", "Usage Label");

  const inputFamilySelect = selectControl({
    ariaLabel: "Mapping Input Family",
    options: INPUT_FAMILY_OPTIONS,
    selectedValue: values.inputFamily || "Keyboard",
  });
  inputFamilySelect.dataset.inputRowFamily = "true";

  const normalizedInputSelect = selectControl({
    ariaLabel: "Normalized Action Type",
    options: inputService.getNormalizedInputOptions(),
    selectedValue: values.normalizedInput || elements.actionSelect?.value || "action.primary",
  });
  normalizedInputSelect.dataset.inputRowNormalized = "true";

  const stateSelect = selectControl({
    ariaLabel: "Mapping State",
    options: [
      { label: "Active", value: "Active" },
      { label: "Disabled", value: "Disabled" },
    ],
    selectedValue: values.state || "Active",
  });
  stateSelect.dataset.inputRowState = "true";

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
    controlCell(inputFamilySelect),
    ...CONTROL_EVENT_OPTIONS.map((option) => editableCheckboxCell({
      checked: values[option.field],
      dataName: `inputRow${option.field[0].toUpperCase()}${option.field.slice(1)}`,
      label: option.label,
    })),
    controlCell(objectSelect),
    controlCell(stateSelect),
    actionsCell,
  );
  updateEditingRowValidation(row);
  return row;
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
  rows.push(...visibleMappings.map(renderMappingRow));
  if (!rows.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 13;
    cell.textContent = "Missing Game Control Mapping. Add a normalized input to game action mapping.";
    row.append(cell);
    rows.push(row);
  }
  elements.list.replaceChildren(...rows);
  [elements.addMapping, elements.addKeyboardFamily, elements.addMouseFamily].forEach((button) => {
    if (button) {
      button.disabled = Boolean(editingRow);
    }
  });
  renderOutput();
}

function renderAll(message = "") {
  objectOptions = readObjectOptions();
  mappings = readMappings();
  renderActionsAndObjects();
  renderDefaults();
  renderDiagnostics(message);
  renderMappings();
}

function editingRowElement() {
  return elements.list?.querySelector("[data-input-editing-row]") || null;
}

function mappingFromEditingRow(row) {
  const objectKey = row.querySelector("[data-input-row-object]")?.value || "global";
  const object = objectOptions.find((candidate) => candidate.key === objectKey) || objectOptions[0];
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
    inputFamily: row.querySelector("[data-input-row-family]")?.value || "Keyboard",
    normalizedInput,
    objectKey: object.key,
    objectName: object.label,
    state: row.querySelector("[data-input-row-state]")?.value || "Active",
    usageLabel,
  });
}

function saveEditingRow() {
  const row = elements.list?.querySelector("[data-input-editing-row]");
  if (!row) {
    return;
  }
  const mapping = mappingFromEditingRow(row);
  if (!mapping.normalizedInput) {
    updateEditingRowValidation(row);
    setText(elements.statusLog, "WARN: Choose a Normalized Input before saving the game control.");
    return;
  }
  const validation = validateMappingAction(mapping);
  if (!validation.ok) {
    updateEditingRowValidation(row);
    setText(elements.statusLog, `WARN: ${validation.message}`);
    return;
  }
  mappings = editingRow?.id
    ? mappings.map((candidate) => (candidate.id === editingRow.id ? mapping : candidate))
    : [mapping, ...mappings];
  saveMappings(mappings);
  editingRow = null;
  renderAll(`Saved ${mapping.actionLabel} mapping.`);
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
  setText(elements.statusLog, `Editing ${mapping.actionLabel} mapping.`);
}

function deleteMapping(mappingId, message = "Deleted mapping.") {
  mappings = mappings.filter((mapping) => mapping.id !== mappingId);
  saveMappings(mappings);
  editingRow = null;
  renderAll(message);
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
    setText(elements.statusLog, "Canceled mapping edit.");
  } else if (target.dataset.inputEditMapping !== undefined) {
    editMapping(target.dataset.inputEditMapping || "");
  } else if (target.dataset.inputTrashMapping !== undefined) {
    deleteMapping(target.dataset.inputTrashMapping || "");
  }
}

function handleListChange(event) {
  const target = event.target instanceof Element ? event.target : null;
  if (!target?.matches("[data-input-row-enabled], [data-input-row-normalized], [data-input-row-object], [data-input-row-family], [data-input-row-usage-label], [data-input-row-event-d], [data-input-row-event-h], [data-input-row-event-u], [data-input-row-event-d-c], [data-input-row-event-drag], [data-input-row-event-axis]")) {
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
  inputService.attach();
  showWorkspaceReturnIfNeeded();
  objectOptions = readObjectOptions();
  mappings = readMappings();
  renderActionsAndObjects();
  renderDefaults();
  renderDiagnostics();
  renderMappings();
  elements.actionSelect?.addEventListener("change", () => {
    setText(elements.statusLog, `Selected ${selectedAction().label} normalized action type for new mappings.`);
  });
  elements.objectSelect?.addEventListener("change", () => {
    const object = selectedObject();
    renderSelect(elements.actionSelect, normalizedControlCatalog().map((control) => ({ label: control.label, value: control.id })), elements.actionSelect?.value || "");
    renderObjectSummary(object);
    setText(elements.statusLog, `Selected ${object.label} for new mappings.`);
  });
  elements.addMapping?.addEventListener("click", addFullGameControlSet);
  elements.addKeyboardFamily?.addEventListener("click", () => {
    addGenericInputFamilyRows("Keyboard");
  });
  elements.addMouseFamily?.addEventListener("click", () => {
    addGenericInputFamilyRows("Mouse");
  });
  elements.resetMappings?.addEventListener("click", () => {
    if (!window.confirm("This will delete all Mappings, are you sure?")) {
      setText(elements.statusLog, "Reset canceled.");
      return;
    }
    resetStoredMappings();
    editingRow = null;
    renderAll("Reset input mappings.");
  });
  elements.refreshDevices?.addEventListener("click", () => {
    renderDiagnostics("Device diagnostics refreshed.");
  });
  elements.list?.addEventListener("click", handleListClick);
  elements.list?.addEventListener("change", handleListChange);
  elements.list?.addEventListener("input", handleListChange);
  elements.presetButtons?.forEach((button) => {
    button.addEventListener("click", () => {
      applyGameControlPreset(button.dataset.inputPreset || "");
    });
  });
}

init();
