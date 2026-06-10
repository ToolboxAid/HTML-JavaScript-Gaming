import { createObjectsToolApiRepository } from "../objects/objects-api-client.js";
import { createInputMappingToolApiRepository } from "./input-mapping-api-client.js";

const DEFAULT_ACTIONS = Object.freeze([
  Object.freeze({ id: "cancel", label: "Cancel" }),
  Object.freeze({ id: "confirm", label: "Confirm" }),
  Object.freeze({ id: "fire", label: "Fire" }),
  Object.freeze({ id: "interact", label: "Interact" }),
  Object.freeze({ id: "jump", label: "Jump" }),
  Object.freeze({ id: "moveDown", label: "Move Down" }),
  Object.freeze({ id: "moveLeft", label: "Move Left" }),
  Object.freeze({ id: "moveRight", label: "Move Right" }),
  Object.freeze({ id: "moveUp", label: "Move Up" }),
  Object.freeze({ id: "pause", label: "Pause" }),
  Object.freeze({ id: "rotateLeft", label: "Rotate Left" }),
  Object.freeze({ id: "rotateRight", label: "Rotate Right" }),
  Object.freeze({ id: "select", label: "Select" }),
  Object.freeze({ id: "start", label: "Start" }),
  Object.freeze({ id: "thrust", label: "Thrust" }),
].sort((left, right) => left.label.localeCompare(right.label, undefined, { sensitivity: "base" })));

const DEVICE_OPTIONS = Object.freeze([
  Object.freeze({ engine: "KeyboardState", label: "Keyboard", source: "keyboard" }),
  Object.freeze({ engine: "MouseState", label: "Mouse", source: "mouse" }),
  Object.freeze({ engine: "GamepadState + GamepadInputAdapter", label: "Gamepad", source: "gamepad" }),
]);

const SOURCE_DIAGNOSTICS = Object.freeze([
  "InputService + KeyboardState",
  "InputService + MouseState",
  "InputService + GamepadState + GamepadInputAdapter",
  "GamepadInputAdapter",
]);

let inputRepository = createInputMappingToolApiRepository();
let objectsRepository = createObjectsToolApiRepository();
let mappings = [];
let objectOptions = [];
let editingRow = null;
let captureMode = "";

const elements = {
  actionSelect: document.querySelector("[data-input-action-select]"),
  addMapping: document.querySelector("[data-input-add-mapping]"),
  captureGamepad: document.querySelector("[data-input-capture-gamepad]"),
  captureKeyboard: document.querySelector("[data-input-capture-keyboard]"),
  captureMouse: document.querySelector("[data-input-capture-mouse]"),
  captureSelection: document.querySelector("[data-input-capture-selection]"),
  captureStatus: document.querySelector("[data-input-capture-status]"),
  defaultActions: document.querySelector("[data-input-default-actions]"),
  deviceCount: document.querySelector("[data-input-device-count]"),
  list: document.querySelector("[data-input-mapping-list]"),
  mappingCount: document.querySelector("[data-input-mapping-count]"),
  mappingJson: document.querySelector("[data-input-mapping-json]"),
  objectSelect: document.querySelector("[data-input-object-select]"),
  outputCount: document.querySelector("[data-input-output-count]"),
  outputStatus: document.querySelector("[data-input-output-status]"),
  refreshDevices: document.querySelector("[data-input-refresh-devices]"),
  resetMappings: document.querySelector("[data-input-reset-mappings]"),
  returnWorkspace: document.querySelector("[data-input-return-workspace]"),
  saveStatus: document.querySelector("[data-input-save-status]"),
  sourceDiagnostics: document.querySelector("[data-input-source-diagnostics]"),
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

function actionById(actionId) {
  return DEFAULT_ACTIONS.find((action) => action.id === actionId) || DEFAULT_ACTIONS[0];
}

function deviceBySource(source) {
  return DEVICE_OPTIONS.find((device) => device.source === source) || DEVICE_OPTIONS[0];
}

function selectedObject() {
  const objectKey = elements.objectSelect?.value || "global";
  return objectOptions.find((object) => object.key === objectKey) || objectOptions[0];
}

function selectedAction() {
  return actionById(elements.actionSelect?.value);
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
  select.setAttribute("aria-label", ariaLabel);
  options.forEach((option) => {
    select.append(optionElement(option.value, option.label));
  });
  select.value = selectedValue || options[0]?.value || "";
  return select;
}

function textControl({ ariaLabel, value }) {
  const input = document.createElement("input");
  input.setAttribute("aria-label", ariaLabel);
  input.type = "text";
  input.value = value || "";
  return input;
}

function controlCell(control) {
  const cell = document.createElement("td");
  cell.append(control);
  return cell;
}

function mappingIdFor(mapping) {
  const base = [
    mapping.objectKey || "global",
    mapping.action,
    mapping.source,
    mapping.binding,
  ].join("-");
  return keyFromText(base) || `mapping-${Date.now()}`;
}

function normalizeMapping(source = {}) {
  const action = actionById(source.action);
  const device = deviceBySource(source.source || source.inputDevice?.toLowerCase());
  const binding = normalizeText(source.binding || source.input);
  const objectKey = normalizeText(source.objectKey) || "global";
  const objectName = normalizeText(source.objectName) || objectOptions.find((object) => object.key === objectKey)?.label || "Global";
  const mapping = {
    action: action.id,
    actionLabel: action.label,
    binding,
    engine: normalizeText(source.engine) || device.engine,
    id: normalizeText(source.id),
    inputDevice: device.label,
    label: normalizeText(source.label) || inputLabel(device.source, binding),
    objectKey,
    objectName,
    source: device.source,
    state: normalizeText(source.state) || "Active",
  };
  return {
    ...mapping,
    id: mapping.id || mappingIdFor(mapping),
  };
}

function inputLabel(source, binding) {
  if (!binding) {
    return "";
  }
  const device = deviceBySource(source);
  if (source === "keyboard") {
    return `${device.label} ${binding}`;
  }
  if (source === "mouse") {
    return `${device.label} ${binding.replace(/^MouseButton/, "Button ")}`;
  }
  if (source === "gamepad") {
    return `${device.label} ${binding.replace(/^Pad\d+:/, "")}`;
  }
  return `${device.label} ${binding}`;
}

function payloadActions() {
  return DEFAULT_ACTIONS.map((action) => {
    const inputs = mappings
      .filter((mapping) => mapping.action === action.id && mapping.state === "Active")
      .map((mapping) => ({
        binding: mapping.binding,
        engine: mapping.engine,
        label: mapping.label,
        source: mapping.source,
      }));
    return {
      action: action.id,
      inputs,
      label: action.label,
    };
  }).filter((action) => action.inputs.length > 0);
}

function payloadJson() {
  return {
    actions: payloadActions(),
    engineInputModel: "src/engine/input/InputMap",
    toolId: "input-mapping-v2",
    version: 1,
  };
}

function readMappings() {
  let result = inputRepository.listMappings();
  if (Array.isArray(result)) {
    return result.map(normalizeMapping);
  }
  inputRepository = createInputMappingToolApiRepository();
  result = inputRepository.listMappings();
  return Array.isArray(result) ? result.map(normalizeMapping) : [];
}

function saveMappings(nextMappings) {
  const normalizedMappings = nextMappings.map(normalizeMapping);
  let result = inputRepository.replaceMappings(normalizedMappings);
  if (!Array.isArray(result?.mappings) && result?.error) {
    inputRepository = createInputMappingToolApiRepository();
    result = inputRepository.replaceMappings(normalizedMappings);
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
  let result = inputRepository.resetMappings();
  if (!Array.isArray(result?.mappings) && result?.error) {
    inputRepository = createInputMappingToolApiRepository();
    result = inputRepository.resetMappings();
  }
  mappings = Array.isArray(result?.mappings) ? result.mappings.map(normalizeMapping) : [];
}

function readObjectOptions() {
  let result = objectsRepository.listObjects();
  if (!Array.isArray(result)) {
    objectsRepository = createObjectsToolApiRepository();
    result = objectsRepository.listObjects();
  }
  const objects = Array.isArray(result) ? result : [];
  return [
    { key: "global", label: "Global" },
    ...objects.map((object) => ({
      key: normalizeText(object.id) || keyFromText(object.name),
      label: normalizeText(object.name),
    })).filter((object) => object.key && object.label),
  ];
}

function renderSelect(select, options, selectedValue) {
  if (!select) {
    return;
  }
  select.replaceChildren(...options.map((option) => optionElement(option.value, option.label)));
  select.value = selectedValue || options[0]?.value || "";
}

function renderDefaults() {
  if (!elements.defaultActions) {
    return;
  }
  elements.defaultActions.replaceChildren(...DEFAULT_ACTIONS.map((action) => {
    const item = document.createElement("li");
    item.textContent = action.label;
    return item;
  }));
}

function renderActionsAndObjects() {
  const previousAction = elements.actionSelect?.value || "moveLeft";
  const previousObject = elements.objectSelect?.value || "global";
  renderSelect(
    elements.actionSelect,
    DEFAULT_ACTIONS.map((action) => ({ label: action.label, value: action.id })),
    previousAction,
  );
  renderSelect(
    elements.objectSelect,
    objectOptions.map((object) => ({ label: object.label, value: object.key })),
    previousObject,
  );
  updateCaptureSelection();
}

function renderDiagnostics(message = "") {
  const gamepadStatus = gamepadSummary();
  const mouseAvailable = typeof window.PointerEvent === "function" || typeof window.MouseEvent === "function";
  const diagnostics = SOURCE_DIAGNOSTICS.map((source) => {
    if (source === "InputService + MouseState") {
      return `${source}: ${mouseAvailable ? "Ready" : "WARN: Mouse capture is unavailable in this browser context."}`;
    }
    if (source === "InputService + GamepadState + GamepadInputAdapter" || source === "GamepadInputAdapter") {
      return `${source}: ${gamepadStatus}`;
    }
    return `${source}: Ready`;
  });
  if (elements.sourceDiagnostics) {
    elements.sourceDiagnostics.replaceChildren(...diagnostics.map((diagnostic) => {
      const item = document.createElement("li");
      item.textContent = diagnostic;
      return item;
    }));
  }
  setText(elements.deviceCount, String(diagnostics.length));
  if (message) {
    setText(elements.statusLog, message);
  }
}

function gamepadSummary() {
  if (typeof navigator.getGamepads !== "function") {
    return "WARN: Gamepad API unavailable. Use a browser with navigator.getGamepads support.";
  }
  const pads = Array.from(navigator.getGamepads() || []).filter(Boolean);
  if (!pads.length) {
    return "WARN: No live gamepad value. Click inside this page, connect a gamepad, and press a button.";
  }
  return `${pads.length} live gamepad value${pads.length === 1 ? "" : "s"} available`;
}

function statusLabel() {
  if (!mappings.length) {
    return "Not Configured";
  }
  if (mappings.some((mapping) => mapping.state !== "Active")) {
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

function tokenButton(mapping) {
  const button = actionButton(mapping.label, "inputDeleteToken", mapping.id, "btn btn--compact cyan");
  button.title = `Delete ${mapping.label}`;
  return button;
}

function renderMappingRow(mapping) {
  const row = document.createElement("tr");
  row.dataset.inputMappingRow = mapping.id;
  row.append(
    tableCell(mapping.objectName),
    tableCell(mapping.actionLabel),
    tableCell(mapping.inputDevice),
  );
  const inputCell = document.createElement("td");
  inputCell.append(tokenButton(mapping));
  row.append(inputCell, tableCell(mapping.state));
  row.append(actionCell([
    actionButton("Edit", "inputEditMapping", mapping.id),
    actionButton("Trash", "inputTrashMapping", mapping.id),
  ]));
  return row;
}

function renderEditingRow(values = {}) {
  const row = document.createElement("tr");
  row.dataset.inputEditingRow = "true";

  const objectSelect = selectControl({
    ariaLabel: "Mapping Object",
    options: objectOptions.map((object) => ({ label: object.label, value: object.key })),
    selectedValue: values.objectKey || elements.objectSelect?.value || "global",
  });
  objectSelect.dataset.inputRowObject = "true";

  const actionSelect = selectControl({
    ariaLabel: "Mapping Action",
    options: DEFAULT_ACTIONS.map((action) => ({ label: action.label, value: action.id })),
    selectedValue: values.action || elements.actionSelect?.value || DEFAULT_ACTIONS[0]?.id,
  });
  actionSelect.dataset.inputRowAction = "true";

  const deviceSelect = selectControl({
    ariaLabel: "Mapping Input Device",
    options: DEVICE_OPTIONS.map((device) => ({ label: device.label, value: device.source })),
    selectedValue: values.source || "keyboard",
  });
  deviceSelect.dataset.inputRowDevice = "true";

  const input = textControl({ ariaLabel: "Mapping Input", value: values.binding || "" });
  input.dataset.inputRowBinding = "true";

  const stateSelect = selectControl({
    ariaLabel: "Mapping State",
    options: [
      { label: "Active", value: "Active" },
      { label: "Disabled", value: "Disabled" },
    ],
    selectedValue: values.state || "Active",
  });
  stateSelect.dataset.inputRowState = "true";

  row.append(
    controlCell(objectSelect),
    controlCell(actionSelect),
    controlCell(deviceSelect),
    controlCell(input),
    controlCell(stateSelect),
    actionCell([
      actionButton("Save", "inputSaveMapping"),
      actionButton("Cancel", "inputCancelMapping"),
    ]),
  );
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
  rows.push(...mappings.map(renderMappingRow));
  if (!rows.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 6;
    cell.textContent = "No mappings added yet.";
    row.append(cell);
    rows.push(row);
  }
  elements.list.replaceChildren(...rows);
  if (elements.addMapping) {
    elements.addMapping.disabled = Boolean(editingRow);
  }
  renderOutput();
}

function renderAll(message = "") {
  objectOptions = readObjectOptions();
  renderActionsAndObjects();
  renderDefaults();
  renderDiagnostics(message);
  renderMappings();
}

function updateCaptureSelection() {
  const action = selectedAction();
  setText(elements.captureSelection, `Selected action: ${action.label}`);
}

function selectedCaptureContext() {
  const object = selectedObject();
  const action = selectedAction();
  return {
    action: action.id,
    actionLabel: action.label,
    objectKey: object.key,
    objectName: object.label,
  };
}

function addCapturedInput({ binding, label, source }) {
  const device = deviceBySource(source);
  const nextMapping = normalizeMapping({
    ...selectedCaptureContext(),
    binding,
    engine: device.engine,
    inputDevice: device.label,
    label,
    source: device.source,
    state: "Active",
  });
  mappings = [
    ...mappings.filter((mapping) => !(
      mapping.objectKey === nextMapping.objectKey &&
      mapping.action === nextMapping.action &&
      mapping.source === nextMapping.source &&
      mapping.binding === nextMapping.binding
    )),
    nextMapping,
  ];
  saveMappings(mappings);
  editingRow = null;
  captureMode = "";
  renderAll(`${label} mapped to ${nextMapping.actionLabel}.`);
  setText(elements.captureStatus, `${label} mapped to ${nextMapping.actionLabel}.`);
}

function warnCapture(message) {
  captureMode = "";
  setText(elements.captureStatus, message);
  setText(elements.statusLog, message);
  renderDiagnostics();
}

function captureKeyboardEvent(event) {
  if (captureMode !== "keyboard") {
    return;
  }
  event.preventDefault();
  const binding = normalizeText(event.code || event.key);
  if (!binding) {
    warnCapture("WARN: Keyboard capture did not receive a key code. Press a physical key and try again.");
    return;
  }
  addCapturedInput({
    binding,
    label: inputLabel("keyboard", binding),
    source: "keyboard",
  });
}

function captureMouseEvent(event) {
  if (captureMode !== "mouse") {
    return;
  }
  event.preventDefault();
  const button = Number.isInteger(event.button) ? event.button : 0;
  const binding = `MouseButton${button}`;
  addCapturedInput({
    binding,
    label: inputLabel("mouse", binding),
    source: "mouse",
  });
}

function activeGamepadInput() {
  if (typeof navigator.getGamepads !== "function") {
    return {
      message: "WARN: Gamepad capture unavailable. Use a browser with navigator.getGamepads support, then connect a gamepad.",
      ok: false,
    };
  }
  const pads = Array.from(navigator.getGamepads() || []).filter(Boolean);
  for (const pad of pads) {
    const buttonIndex = (pad.buttons || []).findIndex((button) => Number(button?.value || 0) > 0.5 || button?.pressed);
    if (buttonIndex >= 0) {
      const binding = `Pad${Number(pad.index) || 0}:Button${buttonIndex}`;
      return {
        binding,
        label: inputLabel("gamepad", binding),
        ok: true,
      };
    }
    const axisIndex = (pad.axes || []).findIndex((axis) => Math.abs(Number(axis) || 0) > 0.25);
    if (axisIndex >= 0) {
      const direction = Number(pad.axes[axisIndex]) < 0 ? "-" : "+";
      const binding = `Pad${Number(pad.index) || 0}:Axis${axisIndex}${direction}`;
      return {
        binding,
        label: inputLabel("gamepad", binding),
        ok: true,
      };
    }
  }
  return {
    message: "WARN: Gamepad capture unavailable. Click inside this page, connect a gamepad, press a button or move an axis, then click Capture Gamepad again.",
    ok: false,
  };
}

function startKeyboardCapture() {
  captureMode = "keyboard";
  setText(elements.captureStatus, "Press a keyboard key to map the selected action.");
  setText(elements.statusLog, "Keyboard capture armed.");
}

function startMouseCapture() {
  if (typeof window.PointerEvent !== "function" && typeof window.MouseEvent !== "function") {
    warnCapture("WARN: Mouse capture unavailable. Use a browser context that supports pointer or mouse events.");
    return;
  }
  captureMode = "mouse";
  setText(elements.captureStatus, "Click a mouse button to map the selected action.");
  setText(elements.statusLog, "Mouse capture armed.");
}

function captureGamepadInput() {
  const result = activeGamepadInput();
  if (!result.ok) {
    warnCapture(result.message);
    return;
  }
  addCapturedInput({
    binding: result.binding,
    label: result.label,
    source: "gamepad",
  });
}

function mappingFromEditingRow(row) {
  const objectKey = row.querySelector("[data-input-row-object]")?.value || "global";
  const object = objectOptions.find((candidate) => candidate.key === objectKey) || objectOptions[0];
  const action = actionById(row.querySelector("[data-input-row-action]")?.value);
  const source = row.querySelector("[data-input-row-device]")?.value || "keyboard";
  const binding = normalizeText(row.querySelector("[data-input-row-binding]")?.value);
  const device = deviceBySource(source);
  return normalizeMapping({
    action: action.id,
    actionLabel: action.label,
    binding,
    engine: device.engine,
    id: editingRow?.id || "",
    inputDevice: device.label,
    label: inputLabel(source, binding),
    objectKey: object.key,
    objectName: object.label,
    source,
    state: row.querySelector("[data-input-row-state]")?.value || "Active",
  });
}

function saveEditingRow() {
  const row = elements.list?.querySelector("[data-input-editing-row]");
  if (!row) {
    return;
  }
  const mapping = mappingFromEditingRow(row);
  if (!mapping.binding) {
    setText(elements.statusLog, "WARN: Add an input before saving the mapping row.");
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
  } else if (target.dataset.inputDeleteToken !== undefined) {
    deleteMapping(target.dataset.inputDeleteToken || "", "Deleted captured input token.");
  }
}

function showWorkspaceReturnIfNeeded() {
  if (!elements.returnWorkspace) {
    return;
  }
  const params = new URLSearchParams(window.location.search);
  const returnTo = normalizeText(params.get("returnTo"));
  const shouldShow = params.has("workspace") || params.has("project") || params.get("source") === "workspace" || params.has("workspaceLaunch") || returnTo;
  if (returnTo.startsWith("/toolbox/project-workspace/")) {
    elements.returnWorkspace.href = returnTo;
  }
  elements.returnWorkspace.hidden = !shouldShow;
}

function init() {
  showWorkspaceReturnIfNeeded();
  objectOptions = readObjectOptions();
  mappings = readMappings();
  renderActionsAndObjects();
  renderDefaults();
  renderDiagnostics();
  renderMappings();
  elements.actionSelect?.addEventListener("change", updateCaptureSelection);
  elements.objectSelect?.addEventListener("change", () => {
    setText(elements.statusLog, `Selected ${selectedObject().label} for new mappings.`);
  });
  elements.addMapping?.addEventListener("click", () => {
    editingRow = {
      id: "",
      values: {
        action: selectedAction().id,
        objectKey: selectedObject().key,
        source: "keyboard",
        state: "Active",
      },
    };
    renderMappings();
    setText(elements.statusLog, "Add a mapping row.");
  });
  elements.resetMappings?.addEventListener("click", () => {
    resetStoredMappings();
    editingRow = null;
    renderAll("Reset input mappings.");
  });
  elements.captureKeyboard?.addEventListener("click", startKeyboardCapture);
  elements.captureMouse?.addEventListener("click", startMouseCapture);
  elements.captureGamepad?.addEventListener("click", captureGamepadInput);
  elements.refreshDevices?.addEventListener("click", () => {
    renderDiagnostics("Device diagnostics refreshed.");
  });
  elements.list?.addEventListener("click", handleListClick);
  window.addEventListener("keydown", captureKeyboardEvent);
  window.addEventListener("pointerdown", captureMouseEvent);
}

init();
