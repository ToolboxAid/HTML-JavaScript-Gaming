import { createObjectsToolApiRepository } from "../objects/objects-api-client.js";
import { createInputMappingToolApiRepository } from "./input-mapping-api-client.js";

const DEFAULT_ACTIONS = Object.freeze([
  Object.freeze({ description: "Back out of a menu or choice.", id: "cancel", label: "Cancel" }),
  Object.freeze({ description: "Accept a choice or prompt.", id: "confirm", label: "Confirm" }),
  Object.freeze({ description: "Use the primary attack or tool.", id: "fire", label: "Fire" }),
  Object.freeze({ description: "Use nearby objects or prompts.", id: "interact", label: "Interact" }),
  Object.freeze({ description: "Make the object jump.", id: "jump", label: "Jump" }),
  Object.freeze({ description: "Move the object downward.", id: "moveDown", label: "Move Down" }),
  Object.freeze({ description: "Move the object left.", id: "moveLeft", label: "Move Left" }),
  Object.freeze({ description: "Move the object right.", id: "moveRight", label: "Move Right" }),
  Object.freeze({ description: "Move the object upward.", id: "moveUp", label: "Move Up" }),
  Object.freeze({ description: "Pause gameplay or open the pause menu.", id: "pause", label: "Pause" }),
  Object.freeze({ description: "Turn the object counterclockwise.", id: "rotateLeft", label: "Rotate Left" }),
  Object.freeze({ description: "Turn the object clockwise.", id: "rotateRight", label: "Rotate Right" }),
  Object.freeze({ description: "Highlight or choose menu items.", id: "select", label: "Select" }),
  Object.freeze({ description: "Begin gameplay or open the start menu.", id: "start", label: "Start" }),
  Object.freeze({ description: "Push the object forward.", id: "thrust", label: "Thrust" }),
].sort((left, right) => left.label.localeCompare(right.label, undefined, { sensitivity: "base" })));

const DEVICE_OPTIONS = Object.freeze([
  Object.freeze({ engine: "KeyboardState", label: "Keyboard", source: "keyboard" }),
  Object.freeze({ engine: "MouseState", label: "Mouse", source: "mouse" }),
  Object.freeze({ engine: "GamepadState + GamepadInputAdapter", label: "Gamepad", source: "gamepad" }),
]);

const DEVICE_TYPE_OPTIONS = Object.freeze([
  Object.freeze({ label: "Gamepad", value: "Gamepad" }),
  Object.freeze({ label: "Keyboard", value: "Keyboard" }),
  Object.freeze({ label: "Mouse", value: "Mouse" }),
  Object.freeze({ label: "Custom", value: "Custom" }),
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
let controllerProfiles = [];
let objectOptions = [];
let editingRow = null;
let profileEditingRow = null;
let rowCaptureSource = "";

const elements = {
  actionSelect: document.querySelector("[data-input-action-select]"),
  addMapping: document.querySelector("[data-input-add-mapping]"),
  controllerProfileAdd: document.querySelector("[data-controller-profile-add]"),
  controllerProfileList: document.querySelector("[data-controller-profile-list]"),
  controllerProfileStatus: document.querySelector("[data-controller-profile-status]"),
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

function profileById(profileId) {
  return controllerProfiles.find((profile) => profile.id === profileId) || null;
}

function profileOptions() {
  return [
    { label: "No saved profile", value: "" },
    ...controllerProfiles.map((profile) => ({
      label: profile.mappingProfile,
      value: profile.id,
    })),
  ];
}

function profileLabel(profileId) {
  return profileById(profileId)?.mappingProfile || "No saved profile";
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

function captureButtonConfig(source) {
  if (source === "mouse") {
    return {
      dataName: "inputRowCaptureMouse",
      label: "Capture Mouse",
    };
  }
  if (source === "gamepad") {
    return {
      dataName: "inputRowCaptureGamepad",
      label: "Capture Gamepad",
    };
  }
  return {
    dataName: "inputRowCaptureKeyboard",
    label: "Capture Keyboard",
  };
}

function captureButtonForSource(source) {
  const config = captureButtonConfig(source);
  return actionButton(config.label, config.dataName, "", "btn btn--compact");
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

function hiddenControl({ value }) {
  const input = document.createElement("input");
  input.type = "hidden";
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

function controllerProfileIdFor(profile) {
  const base = [
    profile.controllerId,
    profile.mappingProfile,
  ].join("-");
  return keyFromText(base) || `profile-${Date.now()}`;
}

function normalizeControllerProfile(source = {}) {
  const profile = {
    actions: normalizeList(source.actions),
    controllerId: normalizeText(source.controllerId),
    controllerName: normalizeText(source.controllerName),
    deviceType: normalizeText(source.deviceType) || "Gamepad",
    id: normalizeText(source.id),
    inputs: normalizeList(source.inputs),
    mappingProfile: normalizeText(source.mappingProfile),
  };
  return {
    ...profile,
    id: profile.id || controllerProfileIdFor(profile),
  };
}

function normalizeMapping(source = {}) {
  const action = actionById(source.action);
  const device = deviceBySource(source.source || source.inputDevice?.toLowerCase());
  const binding = normalizeText(source.binding || source.input);
  const objectKey = normalizeText(source.objectKey) || "global";
  const objectName = normalizeText(source.objectName) || objectOptions.find((object) => object.key === objectKey)?.label || "Global";
  const profile = profileById(normalizeText(source.controllerProfileId));
  const mapping = {
    action: action.id,
    actionLabel: action.label,
    binding,
    controllerProfileId: profile?.id || "",
    engine: normalizeText(source.engine) || device.engine,
    id: normalizeText(source.id),
    inputDevice: device.label,
    label: normalizeText(source.label) || inputLabel(device.source, binding),
    mappingProfile: profile?.mappingProfile || "",
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
        ...(mapping.controllerProfileId ? { controllerProfileId: mapping.controllerProfileId } : {}),
        engine: mapping.engine,
        label: mapping.label,
        ...(mapping.mappingProfile ? { mappingProfile: mapping.mappingProfile } : {}),
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

function readControllerProfiles() {
  let result = inputRepository.listControllerProfiles();
  if (Array.isArray(result)) {
    return result.map(normalizeControllerProfile);
  }
  inputRepository = createInputMappingToolApiRepository();
  result = inputRepository.listControllerProfiles();
  return Array.isArray(result) ? result.map(normalizeControllerProfile) : [];
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

function saveControllerProfiles(nextProfiles) {
  const normalizedProfiles = nextProfiles.map(normalizeControllerProfile);
  let result = inputRepository.replaceControllerProfiles(normalizedProfiles);
  if (!Array.isArray(result?.profiles) && result?.error) {
    inputRepository = createInputMappingToolApiRepository();
    result = inputRepository.replaceControllerProfiles(normalizedProfiles);
  }
  if (Array.isArray(result?.profiles)) {
    controllerProfiles = result.profiles.map(normalizeControllerProfile);
    return true;
  }
  setText(elements.controllerProfileStatus, result?.message || "WARN: Controller profiles could not reach the shared DB adapter.");
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
}

function renderActionsAndObjects() {
  const previousAction = elements.actionSelect?.value || DEFAULT_ACTIONS[0]?.id;
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
}

function renderControllerProfileStatus() {
  if (!elements.controllerProfileStatus) {
    return;
  }
  if (!controllerProfiles.length) {
    elements.controllerProfileStatus.textContent = "WARN: Unknown controller. Refresh Devices after connecting a controller; use Add Profile to save the controller identity when known.";
    return;
  }
  const suffix = controllerProfiles.length === 1 ? "profile" : "profiles";
  elements.controllerProfileStatus.textContent = `${controllerProfiles.length} controller ${suffix} saved. Unknown controllers still need Add Profile before mappings use them.`;
}

function renderControllerProfileRow(profile) {
  const row = document.createElement("tr");
  row.dataset.controllerProfileRow = profile.id;
  row.append(
    tableCell(profile.deviceType),
    tableCell(profile.controllerName),
    tableCell(profile.controllerId),
    tableCell(profile.mappingProfile),
    tableCell(listLabel(profile.inputs)),
  );
  const actionsCell = tableCell(listLabel(profile.actions));
  const group = document.createElement("div");
  group.className = "action-group action-group--tight";
  group.append(
    actionButton("Edit", "controllerProfileEdit", profile.id),
    actionButton("Trash", "controllerProfileTrash", profile.id),
  );
  actionsCell.append(group);
  row.append(actionsCell);
  return row;
}

function renderControllerProfileEditingRow(values = {}) {
  const row = document.createElement("tr");
  row.dataset.controllerProfileEditingRow = "true";

  const deviceType = selectControl({
    ariaLabel: "Controller Device Type",
    options: DEVICE_TYPE_OPTIONS,
    selectedValue: values.deviceType || "Gamepad",
  });
  deviceType.dataset.controllerProfileDeviceType = "true";

  const controllerName = textControl({ ariaLabel: "Controller Name", value: values.controllerName || "" });
  controllerName.dataset.controllerProfileName = "true";

  const controllerId = textControl({ ariaLabel: "Controller ID", value: values.controllerId || "" });
  controllerId.dataset.controllerProfileIdValue = "true";

  const mappingProfile = textControl({ ariaLabel: "Mapping Profile", value: values.mappingProfile || "" });
  mappingProfile.dataset.controllerProfileMapping = "true";

  const inputs = textControl({ ariaLabel: "Controller Inputs", value: listLabel(values.inputs, "") });
  inputs.dataset.controllerProfileInputs = "true";

  const actions = textControl({ ariaLabel: "Controller Actions", value: listLabel(values.actions, "") });
  actions.dataset.controllerProfileActions = "true";

  const actionsCell = controlCell(actions);
  const group = document.createElement("div");
  group.className = "action-group action-group--tight";
  group.append(
    actionButton("Save", "controllerProfileSave"),
    actionButton("Cancel", "controllerProfileCancel"),
  );
  actionsCell.append(group);
  row.append(
    controlCell(deviceType),
    controlCell(controllerName),
    controlCell(controllerId),
    controlCell(mappingProfile),
    controlCell(inputs),
    actionsCell,
  );
  return row;
}

function renderControllerProfiles() {
  if (!elements.controllerProfileList) {
    return;
  }
  const rows = [];
  if (profileEditingRow) {
    rows.push(renderControllerProfileEditingRow(profileEditingRow.values));
  }
  const visibleProfiles = profileEditingRow?.id
    ? controllerProfiles.filter((profile) => profile.id !== profileEditingRow.id)
    : controllerProfiles;
  rows.push(...visibleProfiles.map(renderControllerProfileRow));
  if (!rows.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 7;
    cell.textContent = "No controller profiles saved yet.";
    row.append(cell);
    rows.push(row);
  }
  elements.controllerProfileList.replaceChildren(...rows);
  if (elements.controllerProfileAdd) {
    elements.controllerProfileAdd.disabled = Boolean(profileEditingRow);
  }
  renderControllerProfileStatus();
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
  const label = mapping.label || "No input";
  const button = actionButton(label, "inputToken", mapping.id, "btn btn--compact cyan");
  button.title = label;
  button.setAttribute("aria-label", `${label} input`);
  return button;
}

function renderMappingRow(mapping) {
  const row = document.createElement("tr");
  row.dataset.inputMappingRow = mapping.id;
  row.append(
    tableCell(mapping.objectName),
    tableCell(mapping.actionLabel),
    tableCell(mapping.inputDevice),
    tableCell(profileLabel(mapping.controllerProfileId)),
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

function inputCaptureCell(values = {}) {
  const cell = document.createElement("td");
  const stack = document.createElement("div");
  stack.className = "content-stack content-stack--compact";

  const source = values.source || "keyboard";
  const binding = normalizeText(values.binding);
  const currentInput = actionButton(inputLabel(source, binding) || "No input captured", "inputRowBindingValue", "", "btn btn--compact cyan");
  currentInput.hidden = !binding;
  currentInput.setAttribute("aria-label", "Current mapping input. Choose Input Device to change capture path.");
  const hiddenInput = hiddenControl({ value: binding });
  hiddenInput.dataset.inputRowBinding = "true";

  const group = document.createElement("div");
  group.className = "action-group action-group--tight";
  group.dataset.inputRowCaptureActions = "true";
  if (binding) {
    group.hidden = true;
  } else {
    group.append(captureButtonForSource(source));
  }

  stack.append(currentInput, hiddenInput, group);
  cell.append(stack);
  return cell;
}

function updateInputCaptureCell(row, source, binding = "") {
  const normalizedSource = deviceBySource(source).source;
  const normalizedBinding = normalizeText(binding);
  const label = inputLabel(normalizedSource, normalizedBinding);
  const currentInput = row.querySelector("[data-input-row-binding-value]");
  const hiddenInput = row.querySelector("[data-input-row-binding]");
  const group = row.querySelector("[data-input-row-capture-actions]");
  if (hiddenInput) {
    hiddenInput.value = normalizedBinding;
  }
  if (currentInput) {
    currentInput.textContent = label || "No input captured";
    currentInput.title = label || "No input captured";
    currentInput.hidden = !normalizedBinding;
    currentInput.setAttribute("aria-label", `${label || "No input captured"} input. Choose Input Device to change capture path.`);
  }
  if (group) {
    group.replaceChildren();
    group.hidden = Boolean(normalizedBinding);
    if (!normalizedBinding) {
      group.append(captureButtonForSource(normalizedSource));
    }
  }
  return label;
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

  const profileSelect = selectControl({
    ariaLabel: "Mapping Profile",
    options: profileOptions(),
    selectedValue: values.controllerProfileId || "",
  });
  profileSelect.dataset.inputRowProfile = "true";

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
    controlCell(profileSelect),
    inputCaptureCell(values),
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
  const visibleMappings = editingRow?.id
    ? mappings.filter((mapping) => mapping.id !== editingRow.id)
    : mappings;
  rows.push(...visibleMappings.map(renderMappingRow));
  if (!rows.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 7;
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
  controllerProfiles = readControllerProfiles();
  mappings = readMappings();
  renderActionsAndObjects();
  renderDefaults();
  renderControllerProfiles();
  renderDiagnostics(message);
  renderMappings();
}

function editingRowElement() {
  return elements.list?.querySelector("[data-input-editing-row]") || null;
}

function setEditingRowInput(row, source, binding) {
  const normalizedSource = deviceBySource(source).source;
  const normalizedBinding = normalizeText(binding);
  const deviceSelect = row.querySelector("[data-input-row-device]");
  if (deviceSelect) {
    deviceSelect.value = normalizedSource;
  }
  return updateInputCaptureCell(row, normalizedSource, normalizedBinding);
}

function focusEditingRowDevice(row) {
  const deviceSelect = row?.querySelector("[data-input-row-device]");
  if (!deviceSelect) {
    return;
  }
  deviceSelect.focus();
  deviceSelect.click();
  setText(elements.statusLog, "Choose an Input Device, then capture input for this row.");
}

function changeEditingRowDevice(row, source) {
  const normalizedSource = deviceBySource(source).source;
  rowCaptureSource = "";
  updateInputCaptureCell(row, normalizedSource, "");
  setText(elements.statusLog, `Selected ${deviceBySource(normalizedSource).label}. Capture input for this row.`);
}

function applyCapturedInputToEditingRow({ binding, label, source }) {
  const row = editingRowElement();
  if (!row) {
    warnCapture("WARN: Add or edit a mapping row before capturing input.");
    return;
  }
  const capturedLabel = setEditingRowInput(row, source, binding) || label;
  rowCaptureSource = "";
  setText(elements.statusLog, `${capturedLabel} captured. Save the mapping row to persist it.`);
  renderDiagnostics();
}

function warnCapture(message) {
  rowCaptureSource = "";
  setText(elements.statusLog, message);
  renderDiagnostics();
}

function captureKeyboardEvent(event) {
  if (rowCaptureSource !== "keyboard") {
    return;
  }
  event.preventDefault();
  const binding = normalizeText(event.code || event.key);
  if (!binding) {
    warnCapture("WARN: Keyboard capture did not receive a key code. Press a physical key and try again.");
    return;
  }
  applyCapturedInputToEditingRow({
    binding,
    label: inputLabel("keyboard", binding),
    source: "keyboard",
  });
}

function captureMouseEvent(event) {
  if (rowCaptureSource !== "mouse") {
    return;
  }
  event.preventDefault();
  const button = Number.isInteger(event.button) ? event.button : 0;
  const binding = `MouseButton${button}`;
  applyCapturedInputToEditingRow({
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

function startRowCapture(source) {
  const row = editingRowElement();
  if (!row) {
    warnCapture("WARN: Add or edit a mapping row before capturing input.");
    return;
  }
  if (source === "mouse" && typeof window.PointerEvent !== "function" && typeof window.MouseEvent !== "function") {
    warnCapture("WARN: Mouse capture unavailable. Use a browser context that supports pointer or mouse events.");
    return;
  }
  rowCaptureSource = source;
  if (source === "keyboard") {
    setText(elements.statusLog, "Press a keyboard key to capture input for this row.");
    return;
  }
  if (source === "mouse") {
    setText(elements.statusLog, "Click a mouse button to capture input for this row.");
  }
}

function captureGamepadInputForRow() {
  const row = editingRowElement();
  if (!row) {
    warnCapture("WARN: Add or edit a mapping row before capturing gamepad input.");
    return;
  }
  const result = activeGamepadInput();
  if (!result.ok) {
    warnCapture(result.message);
    return;
  }
  applyCapturedInputToEditingRow({
    binding: result.binding,
    label: result.label,
    source: "gamepad",
  });
}

function startKeyboardCapture() {
  startRowCapture("keyboard");
}

function startMouseCapture() {
  if (typeof window.PointerEvent !== "function" && typeof window.MouseEvent !== "function") {
    warnCapture("WARN: Mouse capture unavailable. Use a browser context that supports pointer or mouse events.");
    return;
  }
  startRowCapture("mouse");
}

function captureGamepadInput() {
  captureGamepadInputForRow();
}

function mappingFromEditingRow(row) {
  const objectKey = row.querySelector("[data-input-row-object]")?.value || "global";
  const object = objectOptions.find((candidate) => candidate.key === objectKey) || objectOptions[0];
  const action = actionById(row.querySelector("[data-input-row-action]")?.value);
  const source = row.querySelector("[data-input-row-device]")?.value || "keyboard";
  const profile = profileById(row.querySelector("[data-input-row-profile]")?.value || "");
  const binding = normalizeText(row.querySelector("[data-input-row-binding]")?.value);
  const device = deviceBySource(source);
  return normalizeMapping({
    action: action.id,
    actionLabel: action.label,
    binding,
    controllerProfileId: profile?.id || "",
    engine: device.engine,
    id: editingRow?.id || "",
    inputDevice: device.label,
    label: inputLabel(source, binding),
    mappingProfile: profile?.mappingProfile || "",
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

function controllerProfileFromEditingRow(row) {
  const actions = normalizeList(row.querySelector("[data-controller-profile-actions]")?.value);
  const controllerId = normalizeText(row.querySelector("[data-controller-profile-id-value]")?.value);
  const mappingProfile = normalizeText(row.querySelector("[data-controller-profile-mapping]")?.value);
  return normalizeControllerProfile({
    actions,
    controllerId,
    controllerName: normalizeText(row.querySelector("[data-controller-profile-name]")?.value),
    deviceType: row.querySelector("[data-controller-profile-device-type]")?.value || "Gamepad",
    id: profileEditingRow?.id || "",
    inputs: normalizeList(row.querySelector("[data-controller-profile-inputs]")?.value),
    mappingProfile,
  });
}

function saveControllerProfileEditingRow() {
  const row = elements.controllerProfileList?.querySelector("[data-controller-profile-editing-row]");
  if (!row) {
    return;
  }
  const profile = controllerProfileFromEditingRow(row);
  if (!profile.controllerId || !profile.mappingProfile) {
    setText(elements.controllerProfileStatus, "WARN: Add Controller ID and Mapping Profile before saving the controller profile.");
    return;
  }
  const nextProfiles = profileEditingRow?.id
    ? controllerProfiles.map((candidate) => (candidate.id === profileEditingRow.id ? profile : candidate))
    : [profile, ...controllerProfiles];
  if (!saveControllerProfiles(nextProfiles)) {
    controllerProfiles = readControllerProfiles();
    renderControllerProfiles();
    return;
  }
  profileEditingRow = null;
  renderAll(`Saved ${profile.mappingProfile} controller profile.`);
}

function editControllerProfile(profileId) {
  const profile = controllerProfiles.find((candidate) => candidate.id === profileId);
  if (!profile) {
    return;
  }
  profileEditingRow = {
    id: profile.id,
    values: profile,
  };
  renderControllerProfiles();
  setText(elements.controllerProfileStatus, `Editing ${profile.mappingProfile} controller profile.`);
}

function deleteControllerProfile(profileId) {
  const profile = controllerProfiles.find((candidate) => candidate.id === profileId);
  const nextProfiles = controllerProfiles.filter((candidate) => candidate.id !== profileId);
  const nextMappings = mappings.map((mapping) => (
    mapping.controllerProfileId === profileId
      ? normalizeMapping({ ...mapping, controllerProfileId: "", mappingProfile: "" })
      : mapping
  ));
  const savedProfiles = saveControllerProfiles(nextProfiles);
  const savedMappings = saveMappings(nextMappings);
  if (!savedProfiles || !savedMappings) {
    controllerProfiles = readControllerProfiles();
    mappings = readMappings();
    renderAll("WARN: Controller profile delete could not reach the shared DB adapter.");
    return;
  }
  profileEditingRow = null;
  renderAll(profile ? `Deleted ${profile.mappingProfile} controller profile.` : "Deleted controller profile.");
}

function editMapping(mappingId, options = {}) {
  const mapping = mappings.find((candidate) => candidate.id === mappingId);
  if (!mapping) {
    return;
  }
  rowCaptureSource = "";
  editingRow = {
    id: mapping.id,
    values: mapping,
  };
  renderMappings();
  if (options.focusDevice) {
    focusEditingRowDevice(editingRowElement());
  }
  setText(elements.statusLog, `Editing ${mapping.actionLabel} mapping.`);
}

function deleteMapping(mappingId, message = "Deleted mapping.") {
  mappings = mappings.filter((mapping) => mapping.id !== mappingId);
  saveMappings(mappings);
  editingRow = null;
  rowCaptureSource = "";
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
    rowCaptureSource = "";
    renderMappings();
    setText(elements.statusLog, "Canceled mapping edit.");
  } else if (target.dataset.inputEditMapping !== undefined) {
    editMapping(target.dataset.inputEditMapping || "");
  } else if (target.dataset.inputTrashMapping !== undefined) {
    deleteMapping(target.dataset.inputTrashMapping || "");
  } else if (target.dataset.inputToken !== undefined) {
    editMapping(target.dataset.inputToken || "", { focusDevice: true });
  } else if (target.dataset.inputRowBindingValue !== undefined) {
    focusEditingRowDevice(editingRowElement());
  } else if (target.dataset.inputRowCaptureKeyboard !== undefined) {
    startKeyboardCapture();
  } else if (target.dataset.inputRowCaptureMouse !== undefined) {
    startMouseCapture();
  } else if (target.dataset.inputRowCaptureGamepad !== undefined) {
    captureGamepadInput();
  }
}

function handleListChange(event) {
  const target = event.target instanceof Element ? event.target : null;
  if (!target?.matches("[data-input-row-device]")) {
    return;
  }
  const row = target.closest("[data-input-editing-row]");
  if (!row) {
    return;
  }
  changeEditingRowDevice(row, target.value);
}

function handleControllerProfileClick(event) {
  const target = event.target instanceof Element ? event.target.closest("button") : null;
  if (!target) {
    return;
  }
  if (target.dataset.controllerProfileSave !== undefined) {
    saveControllerProfileEditingRow();
  } else if (target.dataset.controllerProfileCancel !== undefined) {
    profileEditingRow = null;
    renderControllerProfiles();
    setText(elements.controllerProfileStatus, "Canceled controller profile edit.");
  } else if (target.dataset.controllerProfileEdit !== undefined) {
    editControllerProfile(target.dataset.controllerProfileEdit || "");
  } else if (target.dataset.controllerProfileTrash !== undefined) {
    deleteControllerProfile(target.dataset.controllerProfileTrash || "");
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
  controllerProfiles = readControllerProfiles();
  mappings = readMappings();
  renderActionsAndObjects();
  renderDefaults();
  renderControllerProfiles();
  renderDiagnostics();
  renderMappings();
  elements.actionSelect?.addEventListener("change", () => {
    setText(elements.statusLog, `Selected ${selectedAction().label} action for new mappings.`);
  });
  elements.objectSelect?.addEventListener("change", () => {
    setText(elements.statusLog, `Selected ${selectedObject().label} for new mappings.`);
  });
  elements.addMapping?.addEventListener("click", () => {
    rowCaptureSource = "";
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
  elements.controllerProfileAdd?.addEventListener("click", () => {
    profileEditingRow = {
      id: "",
      values: {
        actions: [selectedAction().label],
        deviceType: "Gamepad",
        inputs: [],
      },
    };
    renderControllerProfiles();
    setText(elements.controllerProfileStatus, "Add a controller profile row.");
  });
  elements.resetMappings?.addEventListener("click", () => {
    resetStoredMappings();
    editingRow = null;
    rowCaptureSource = "";
    renderAll("Reset input mappings.");
  });
  elements.refreshDevices?.addEventListener("click", () => {
    renderDiagnostics("Device diagnostics refreshed.");
    renderControllerProfileStatus();
  });
  elements.controllerProfileList?.addEventListener("click", handleControllerProfileClick);
  elements.list?.addEventListener("click", handleListClick);
  elements.list?.addEventListener("change", handleListChange);
  window.addEventListener("keydown", captureKeyboardEvent);
  window.addEventListener("pointerdown", captureMouseEvent);
}

init();
