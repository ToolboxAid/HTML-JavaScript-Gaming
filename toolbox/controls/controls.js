import { createObjectsToolApiRepository } from "../objects/objects-api-client.js";
import { createControlsToolApiRepository } from "./controls-api-client.js";
import InputCaptureService from "../../src/engine/input/InputCaptureService.js";
import InputService from "../../src/engine/input/InputService.js";
import {
  activeGamepadProfileInputNames,
  captureGamepadInput as captureGamepadInputFromEngine,
  gamepadProfileInputNames,
} from "../../src/engine/input/GamepadInputClassifier.js";
import { mouseButtonLabel } from "../../src/engine/input/InputCapabilityDescriptors.js";

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

const OBJECT_ACTION_IDS = Object.freeze({
  collectible: Object.freeze(["confirm", "interact", "select"]),
  custom: Object.freeze(DEFAULT_ACTIONS.map((action) => action.id)),
  decoration: Object.freeze(["select"]),
  enemy: Object.freeze(["fire", "interact", "moveDown", "moveLeft", "moveRight", "moveUp", "rotateLeft", "rotateRight", "thrust"]),
  global: Object.freeze(DEFAULT_ACTIONS.map((action) => action.id)),
  goal: Object.freeze(["confirm", "interact", "select"]),
  hazard: Object.freeze(["fire", "interact", "select"]),
  hero: Object.freeze(DEFAULT_ACTIONS.map((action) => action.id)),
  platform: Object.freeze(["interact", "select"]),
  projectile: Object.freeze(["fire", "rotateLeft", "rotateRight", "thrust"]),
  "spawn-point": Object.freeze(["confirm", "select", "start"]),
  wall: Object.freeze(["interact", "select"]),
});

const CAPABILITY_ACTION_IDS = Object.freeze({
  collectible: Object.freeze(["confirm", "interact", "select"]),
  collides: Object.freeze(["interact", "select"]),
  damageable: Object.freeze(["fire", "interact", "select"]),
  goal: Object.freeze(["confirm", "interact", "select"]),
  hazard: Object.freeze(["fire", "interact", "select"]),
  killable: Object.freeze(["fire", "interact", "select"]),
  movable: Object.freeze(["moveDown", "moveLeft", "moveRight", "moveUp", "rotateLeft", "rotateRight", "thrust"]),
  playerControlled: Object.freeze(DEFAULT_ACTIONS.map((action) => action.id)),
  scores: Object.freeze(["confirm", "interact", "select"]),
});

const DEVICE_OPTIONS = Object.freeze([
  Object.freeze({ engine: "KeyboardState", label: "Keyboard", source: "keyboard" }),
  Object.freeze({ engine: "MouseState", label: "Mouse", source: "mouse" }),
  Object.freeze({ engine: "GamepadState + GamepadInputAdapter", label: "Gamepad", source: "gamepad" }),
]);

const DEVICE_TYPE_OPTIONS = Object.freeze([
  Object.freeze({ label: "Gamepad", value: "Gamepad" }),
]);

const KEYBOARD_MOUSE_PROFILE_SCOPE = "keyboard-mouse-profile";

const SOURCE_DIAGNOSTICS = Object.freeze([
  "InputService + KeyboardState",
  "InputService + MouseState",
  "InputService + GamepadState + GamepadInputAdapter",
  "GamepadInputAdapter",
]);

let controlsRepository = createControlsToolApiRepository();
let objectsRepository = createObjectsToolApiRepository();
let mappings = [];
let controllerProfiles = [];
let customActions = [];
let objectOptions = [];
let editingRow = null;
let profileEditingRow = null;
let rowCaptureSource = "";
let profileInputMonitorId = 0;
const inputService = new InputService({ target: window });
const inputCaptureService = new InputCaptureService({ inputService });

const elements = {
  actionSelect: document.querySelector("[data-input-action-select]"),
  addMapping: document.querySelector("[data-input-add-mapping]"),
  controllerDeviceSelect: document.querySelector("[data-controller-device-select]"),
  controllerProfileAdd: document.querySelector("[data-controller-profile-add]"),
  controllerProfileCreateDefault: document.querySelector("[data-controller-profile-create-default]"),
  controllerProfileFallbackStatus: document.querySelector("[data-controller-profile-fallback-status]"),
  controllerProfileList: document.querySelector("[data-controller-profile-list]"),
  controllerProfileStatus: document.querySelector("[data-controller-profile-status]"),
  customActionAdd: document.querySelector("[data-input-custom-action-add]"),
  customActionInput: document.querySelector("[data-input-custom-action-name]"),
  customActionStatus: document.querySelector("[data-input-custom-action-status]"),
  defaultActions: document.querySelector("[data-input-default-actions]"),
  deviceCount: document.querySelector("[data-input-device-count]"),
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

function normalizeCustomAction(source = {}) {
  const label = normalizeText(source.label || source.actionLabel || source.action);
  const idBase = keyFromText(source.id || label);
  const id = idBase.startsWith("custom-") ? idBase : `custom-${idBase || Date.now()}`;
  return {
    description: "Custom action for this game.",
    id,
    label: label || id,
  };
}

function actionCatalog() {
  const byId = new Map(DEFAULT_ACTIONS.map((action) => [action.id, action]));
  customActions.map(normalizeCustomAction).forEach((action) => {
    byId.set(action.id, action);
  });
  return [...byId.values()].sort((left, right) =>
    left.label.localeCompare(right.label, undefined, { sensitivity: "base" }),
  );
}

function customActionIds() {
  return customActions.map((action) => normalizeCustomAction(action).id);
}

function actionById(actionId) {
  return actionCatalog().find((action) => action.id === actionId) || DEFAULT_ACTIONS[0];
}

function deviceBySource(source) {
  return DEVICE_OPTIONS.find((device) => device.source === source) || DEVICE_OPTIONS[0];
}

function profileById(profileId) {
  return controllerProfiles.find((profile) => profile.id === profileId) || null;
}

function availableGamepads() {
  inputService.update();
  return inputService.getGamepads();
}

function matchingGamepadForProfile(profile) {
  return availableGamepads().find((gamepad) =>
    gamepad.id === profile.controllerId || `gamepad-${gamepad.index}` === profile.controllerId,
  ) || null;
}

function activeProfileGamepadInputNames(profile) {
  const gamepad = matchingGamepadForProfile(profile);
  if (!gamepad) {
    return [];
  }
  return activeGamepadProfileInputNames(gamepad);
}

function controllerDeviceOptions() {
  return availableGamepads().map((gamepad) => {
    const controllerName = gamepad.id || `Gamepad ${gamepad.index}`;
    return {
      controllerId: gamepad.id || `gamepad-${gamepad.index}`,
      controllerName,
      deviceType: "Gamepad",
      inputs: gamepadProfileInputNames(gamepad),
      label: `Gamepad: ${controllerName}`,
      mappingProfile: `${controllerName} Profile`,
      value: `gamepad-${gamepad.index}`,
    };
  });
}

function selectedControllerDevice() {
  const selectedValue = elements.controllerDeviceSelect?.value || "";
  return controllerDeviceOptions().find((candidate) => candidate.value === selectedValue) || null;
}

function exactProfileForDevice(device) {
  if (!device || device.unavailable) {
    return null;
  }
  return controllerProfiles.find((profile) =>
    profile.deviceType === device.deviceType &&
      profile.controllerId === device.controllerId &&
      profile.mappingProfile === device.mappingProfile,
  ) || null;
}

function selectedControllerProfile() {
  return exactProfileForDevice(selectedControllerDevice())
    || profileById(profileEditingRow?.id || "")
    || null;
}

function profileFromDevice(device, source = "detected") {
  const profile = normalizeControllerProfile({
    actions: [],
    controllerId: device.controllerId,
    controllerName: device.controllerName,
    deviceType: device.deviceType,
    inputs: device.inputs,
    mappingProfile: device.mappingProfile,
  });
  return {
    ...profile,
    source,
  };
}

function renderControllerProfileFallback() {
  const device = selectedControllerDevice();
  if (elements.controllerProfileCreateDefault) {
    elements.controllerProfileCreateDefault.hidden = true;
  }
  if (!elements.controllerProfileFallbackStatus) {
    return;
  }
  if (!device || device.unavailable) {
    setText(elements.controllerProfileFallbackStatus, "Missing Mapping. Missing saved profile for this controller.");
    return;
  }
  const exactProfile = exactProfileForDevice(device);
  if (exactProfile) {
    setText(elements.controllerProfileFallbackStatus, `Exact saved profile: ${exactProfile.mappingProfile}`);
    return;
  }
  if (device.deviceType === "Gamepad") {
    setText(elements.controllerProfileFallbackStatus, "Using Default Gamepad Mapping. Missing saved profile for this controller.");
    if (elements.controllerProfileCreateDefault) {
      elements.controllerProfileCreateDefault.hidden = false;
    }
    return;
  }
}

function selectedObject() {
  const objectKey = elements.objectSelect?.value || "global";
  return objectOptions.find((object) => object.key === objectKey) || objectOptions[0];
}

function selectedAction() {
  return actionById(elements.actionSelect?.value);
}

function actionOptions(actions) {
  return actions.map((action) => ({ label: action.label, value: action.id }));
}

function objectByKey(objectKey) {
  return objectOptions.find((object) => object.key === objectKey) || null;
}

function roleKeyForObject(object) {
  return keyFromText(object?.role || object?.label || "global");
}

function validActionIdsForObject(object) {
  const addCustomActionIds = (ids) => {
    customActionIds().forEach((actionId) => ids.add(actionId));
    return ids;
  };
  if (!object || object.key === "global") {
    return addCustomActionIds(new Set(OBJECT_ACTION_IDS.global));
  }
  const roleKey = roleKeyForObject(object);
  if (OBJECT_ACTION_IDS[roleKey] && roleKey !== "custom") {
    return addCustomActionIds(new Set(OBJECT_ACTION_IDS[roleKey]));
  }
  const ids = new Set(OBJECT_ACTION_IDS[roleKey] || []);
  normalizeList(object.capabilities).forEach((capability) => {
    (CAPABILITY_ACTION_IDS[capability] || []).forEach((actionId) => ids.add(actionId));
  });
  if (!ids.size) {
    return addCustomActionIds(new Set(OBJECT_ACTION_IDS.custom));
  }
  return addCustomActionIds(ids);
}

function actionsForObject(object) {
  const validIds = validActionIdsForObject(object);
  return actionCatalog().filter((action) => validIds.has(action.id));
}

function actionOptionsForObject(object) {
  return actionOptions(actionsForObject(object));
}

function validateMappingAction(mapping) {
  const object = objectByKey(mapping.objectKey);
  if (!object && mapping.objectKey !== "global") {
    return {
      ok: false,
      message: `${mapping.objectName || "This mapping"} needs an object that still exists. Edit this row and choose an existing object.`,
    };
  }
  const action = actionById(mapping.action);
  const targetObject = object || objectOptions[0];
  if (!validActionIdsForObject(targetObject).has(action.id)) {
    const availableActions = actionsForObject(targetObject).map((candidate) => candidate.label).join(", ");
    return {
      ok: false,
      message: `${action.label} is not available for ${targetObject.role || targetObject.label}. Edit this row and choose: ${availableActions}.`,
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
  select.value = options.some((option) => option.value === selectedValue)
    ? selectedValue
    : options[0]?.value || "";
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
    mapping.controllerProfileId || "default-profile",
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
    actions: Array.isArray(source.actions)
      ? source.actions.map(normalizeText)
      : normalizeList(source.actions),
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
  const requestedProfileId = normalizeText(source.controllerProfileId);
  const profile = profileById(requestedProfileId);
  const controllerProfileId = device.source === "keyboard" || device.source === "mouse"
    ? KEYBOARD_MOUSE_PROFILE_SCOPE
    : profile?.id || requestedProfileId;
  const mapping = {
    action: action.id,
    actionLabel: action.label,
    binding,
    controllerProfileId,
    engine: normalizeText(source.engine) || device.engine,
    id: normalizeText(source.id),
    inputDevice: device.label,
    label: normalizeText(source.label) || inputLabel(device.source, binding),
    mappingProfile: "",
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
    if (binding.startsWith("MouseWheel")) {
      return inputService.getWheelDescriptor(binding)?.label || `${device.label} ${binding}`;
    }
    if (binding.startsWith("MouseButton")) {
      return mouseButtonLabel(Number(binding.replace(/^MouseButton/, "")));
    }
    return `${device.label} ${binding}`;
  }
  if (source === "gamepad") {
    return `${device.label} ${binding.replace(/^Pad\d+:/, "")}`;
  }
  return `${device.label} ${binding}`;
}

function payloadActions() {
  return actionCatalog().map((action) => {
    const inputs = mappings
      .filter((mapping) => mapping.action === action.id && mapping.state === "Active")
      .map((mapping) => ({
        binding: mapping.binding,
        ...(mapping.controllerProfileId ? { controllerProfileId: mapping.controllerProfileId } : {}),
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

function readControllerProfiles() {
  let result = controlsRepository.listControllerProfiles();
  if (Array.isArray(result)) {
    return result.map(normalizeControllerProfile);
  }
  controlsRepository = createControlsToolApiRepository();
  result = controlsRepository.listControllerProfiles();
  return Array.isArray(result) ? result.map(normalizeControllerProfile) : [];
}

function readCustomActions() {
  if (typeof controlsRepository.listCustomActions !== "function") {
    return [];
  }
  let result = controlsRepository.listCustomActions();
  if (Array.isArray(result)) {
    return result.map(normalizeCustomAction);
  }
  controlsRepository = createControlsToolApiRepository();
  result = typeof controlsRepository.listCustomActions === "function"
    ? controlsRepository.listCustomActions()
    : [];
  return Array.isArray(result) ? result.map(normalizeCustomAction) : [];
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

function saveControllerProfiles(nextProfiles) {
  const normalizedProfiles = nextProfiles.map(normalizeControllerProfile);
  let result = controlsRepository.replaceControllerProfiles(normalizedProfiles);
  if (!Array.isArray(result?.profiles) && result?.error) {
    controlsRepository = createControlsToolApiRepository();
    result = controlsRepository.replaceControllerProfiles(normalizedProfiles);
  }
  if (Array.isArray(result?.profiles)) {
    controllerProfiles = result.profiles.map(normalizeControllerProfile);
    return true;
  }
  setText(elements.controllerProfileStatus, result?.message || "WARN: Controller profiles could not reach the shared DB adapter.");
  return false;
}

function saveCustomActions(nextActions) {
  const normalizedActions = nextActions.map(normalizeCustomAction);
  if (typeof controlsRepository.replaceCustomActions !== "function") {
    setText(elements.customActionStatus, "WARN: Custom actions could not reach the shared DB adapter.");
    return false;
  }
  let result = controlsRepository.replaceCustomActions(normalizedActions);
  if (!Array.isArray(result?.customActions) && result?.error) {
    controlsRepository = createControlsToolApiRepository();
    result = controlsRepository.replaceCustomActions(normalizedActions);
  }
  if (Array.isArray(result?.customActions)) {
    customActions = result.customActions.map(normalizeCustomAction);
    return true;
  }
  setText(elements.customActionStatus, result?.message || "WARN: Custom actions could not reach the shared DB adapter.");
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
  select.replaceChildren(...options.map((option) => optionElement(option.value, option.label)));
  select.value = options.some((option) => option.value === selectedValue)
    ? selectedValue
    : options[0]?.value || "";
}

function renderDefaults() {
  if (!elements.defaultActions) {
    return;
  }
  elements.defaultActions.replaceChildren(...actionCatalog().map((action) => {
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
  const suffix = customActions.length === 1 ? "custom action" : "custom actions";
  setText(elements.customActionStatus, customActions.length ? `${customActions.length} ${suffix} saved.` : "Default actions loaded.");
}

function renderActionsAndObjects() {
  const previousAction = elements.actionSelect?.value || DEFAULT_ACTIONS[0]?.id;
  const previousObject = elements.objectSelect?.value || "global";
  renderSelect(
    elements.objectSelect,
    objectOptions.map((object) => ({ label: object.label, value: object.key })),
    previousObject,
  );
  const object = selectedObject();
  renderSelect(
    elements.actionSelect,
    actionOptionsForObject(object),
    previousAction,
  );
  renderObjectSummary(object);
}

function renderObjectSummary(object = selectedObject()) {
  const availableActions = actionsForObject(object).map((action) => action.label).join(", ");
  setText(elements.objectSummaryName, object?.label || "Global");
  setText(elements.objectSummaryRole, object?.role || "Global");
  setText(elements.objectSummaryActions, availableActions || "No actions available");
}

function addCustomAction() {
  const action = normalizeCustomAction({ label: elements.customActionInput?.value || "" });
  if (!normalizeText(elements.customActionInput?.value)) {
    setText(elements.customActionStatus, "WARN: Add a Custom Action name before saving.");
    return;
  }
  const exists = actionCatalog().some((candidate) =>
    candidate.id === action.id ||
      candidate.label.toLowerCase() === action.label.toLowerCase(),
  );
  if (exists) {
    setText(elements.customActionStatus, `${action.label} already exists.`);
    return;
  }
  if (!saveCustomActions([...customActions, action])) {
    return;
  }
  if (elements.customActionInput) {
    elements.customActionInput.value = "";
  }
  renderAll(`Saved ${action.label} custom action.`);
  if (elements.actionSelect && actionOptionsForObject(selectedObject()).some((option) => option.value === action.id)) {
    elements.actionSelect.value = action.id;
    renderObjectSummary(selectedObject());
  }
  setText(elements.customActionStatus, `${action.label} saved.`);
}

function renderControllerDeviceSelect(selectedValue = elements.controllerDeviceSelect?.value || "") {
  renderSelect(
    elements.controllerDeviceSelect,
    [
      { label: "Choose a game controller", value: "" },
      ...controllerDeviceOptions().map((device) => ({ label: device.label, value: device.value })),
    ],
    selectedValue,
  );
  renderControllerProfileFallback();
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

function profileInputActionControl(profile, inputName, index) {
  const wrapper = document.createElement("div");
  wrapper.className = "content-grid";
  wrapper.dataset.controllerProfileInputPair = "true";
  wrapper.dataset.controllerProfileInputName = inputName;
  const label = document.createElement("strong");
  label.textContent = inputName;
  const select = selectControl({
    ariaLabel: `${inputName} Action`,
    options: [
      { label: "Unassigned", value: "" },
      ...actionOptions(actionCatalog()),
    ],
    selectedValue: profile.actions[index] || "",
  });
  select.dataset.controllerProfileInputAction = profile.id || "editing";
  select.dataset.controllerProfileInputIndex = String(index);
  const actionStack = document.createElement("div");
  actionStack.className = "content-stack content-stack--compact";
  const assignedAction = document.createElement("span");
  assignedAction.className = "status";
  assignedAction.dataset.controllerProfileInputAssignedAction = "true";
  assignedAction.textContent = `Assigned Action: ${controllerProfileActionLabel(select)}`;
  actionStack.append(select, assignedAction);
  wrapper.append(label, actionStack);
  return wrapper;
}

function controllerProfileActionLabel(select) {
  return select?.selectedOptions?.[0]?.textContent || "Unassigned";
}

function updateProfileInputAssignedAction(select) {
  const pair = select?.closest("[data-controller-profile-input-pair]");
  const status = pair?.querySelector("[data-controller-profile-input-assigned-action]");
  if (!status) {
    return;
  }
  const prefix = pair.dataset.controllerProfileInputActive === "true" ? "Selected Action" : "Assigned Action";
  status.textContent = `${prefix}: ${controllerProfileActionLabel(select)}`;
}

function clearControllerProfileInputHighlight() {
  elements.controllerProfileList?.querySelectorAll("[data-controller-profile-input-pair]").forEach((pair) => {
    delete pair.dataset.controllerProfileInputActive;
    const status = pair.querySelector("[data-controller-profile-input-assigned-action]");
    status?.classList.remove("text-gold");
    updateProfileInputAssignedAction(pair.querySelector("[data-controller-profile-input-action]"));
  });
}

function highlightControllerProfileInputs(inputNames = []) {
  clearControllerProfileInputHighlight();
  if (!inputNames.length) {
    return;
  }
  const selectedMessages = [];
  const activeNames = new Set(inputNames);
  elements.controllerProfileList?.querySelectorAll("[data-controller-profile-input-pair]").forEach((pair) => {
    if (!activeNames.has(pair.dataset.controllerProfileInputName)) {
      return;
    }
    pair.dataset.controllerProfileInputActive = "true";
    const select = pair.querySelector("[data-controller-profile-input-action]");
    updateProfileInputAssignedAction(select);
    const status = pair.querySelector("[data-controller-profile-input-assigned-action]");
    status?.classList.add("text-gold");
    selectedMessages.push(`${pair.dataset.controllerProfileInputName}: ${controllerProfileActionLabel(select)}`);
  });
  if (selectedMessages.length) {
    setText(elements.controllerProfileStatus, `Selected inputs: ${selectedMessages.join(", ")}.`);
  }
}

function updateControllerProfileInputHighlight() {
  if (!profileEditingRow?.values) {
    highlightControllerProfileInputs();
    return;
  }
  highlightControllerProfileInputs(activeProfileGamepadInputNames(profileEditingRow.values));
}

function stopControllerProfileInputMonitor() {
  if (profileInputMonitorId) {
    window.clearInterval(profileInputMonitorId);
    profileInputMonitorId = 0;
  }
}

function syncControllerProfileInputMonitor() {
  if (!profileEditingRow?.values) {
    stopControllerProfileInputMonitor();
    clearControllerProfileInputHighlight();
    return;
  }
  if (!profileInputMonitorId) {
    profileInputMonitorId = window.setInterval(updateControllerProfileInputHighlight, 120);
  }
  updateControllerProfileInputHighlight();
}

function controllerProfileInputActions(profile) {
  const actionControls = document.createElement("div");
  actionControls.className = "content-grid content-grid--three";
  if (profile.inputs.length) {
    actionControls.append(...profile.inputs.map((inputName, index) =>
      profileInputActionControl(profile, inputName, index),
    ));
    return actionControls;
  }
  const required = document.createElement("p");
  required.className = "status";
  required.textContent = "No generated inputs.";
  actionControls.append(required);
  return actionControls;
}

function profileActionSummary(profile) {
  const assigned = profile.actions.filter(Boolean).length;
  const total = profile.inputs.length;
  if (!total) {
    return "No generated inputs";
  }
  return `${assigned}/${total} Actions assigned`;
}

function renderControllerProfileRow(profile) {
  const row = document.createElement("tr");
  row.dataset.controllerProfileRow = profile.id;
  row.append(
    tableCell(profile.deviceType),
    tableCell(profile.controllerName),
    tableCell(profile.controllerId),
    tableCell(profile.mappingProfile),
  );
  const actionsCell = tableCell(profileActionSummary(profile));
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

function renderControllerProfileEditingRows(values = {}) {
  const row = document.createElement("tr");
  row.dataset.controllerProfileEditingRow = "true";

  const actionsCell = document.createElement("td");
  const profile = normalizeControllerProfile({
    actions: values.actions,
    controllerId: values.controllerId,
    controllerName: values.controllerName,
    deviceType: values.deviceType,
    id: profileEditingRow?.id || "",
    inputs: values.inputs,
    mappingProfile: values.mappingProfile,
  });
  const group = document.createElement("div");
  group.className = "action-group action-group--tight";
  group.append(
    actionButton("Save", "controllerProfileSave"),
    actionButton("Cancel", "controllerProfileCancel"),
  );
  actionsCell.append(group);
  row.append(
    tableCell(profile.deviceType),
    tableCell(profile.controllerName),
    tableCell(profile.controllerId),
    tableCell(profile.mappingProfile),
    actionsCell,
  );

  const actionsRow = document.createElement("tr");
  actionsRow.dataset.controllerProfileEditingActionsRow = "true";
  const detailsCell = document.createElement("td");
  detailsCell.colSpan = 5;
  const stack = document.createElement("div");
  stack.className = "content-stack content-stack--compact";
  stack.append(controllerProfileInputActions(profile));
  detailsCell.append(stack);
  actionsRow.append(detailsCell);
  return [row, actionsRow];
}

function renderControllerProfiles() {
  if (!elements.controllerProfileList) {
    return;
  }
  const rows = [];
  if (profileEditingRow) {
    rows.push(...renderControllerProfileEditingRows(profileEditingRow.values));
  }
  const visibleProfiles = profileEditingRow?.id
    ? controllerProfiles.filter((profile) => profile.id !== profileEditingRow.id)
    : controllerProfiles;
  rows.push(...visibleProfiles.map(renderControllerProfileRow));
  if (!rows.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;
    cell.textContent = "No controller profiles saved yet.";
    row.append(cell);
    rows.push(row);
  }
  elements.controllerProfileList.replaceChildren(...rows);
  if (elements.controllerProfileAdd) {
    elements.controllerProfileAdd.disabled = Boolean(profileEditingRow);
  }
  renderControllerProfileStatus();
  renderControllerProfileFallback();
  syncControllerProfileInputMonitor();
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
  const pads = availableGamepads();
  if (!pads.length) {
    return "WARN: No live gamepad value. Click inside this page, connect a gamepad, and press a button.";
  }
  const activeInputs = [...new Set(pads.flatMap(activeGamepadProfileInputNames))];
  const activeLabel = activeInputs.length ? ` Active inputs: ${activeInputs.join(", ")}.` : "";
  return `${pads.length} live gamepad value${pads.length === 1 ? "" : "s"} available.${activeLabel}`;
}

function statusLabel() {
  if (!mappings.length) {
    return "Not Configured";
  }
  if (mappings.some((mapping) => !validateMappingAction(mapping).ok)) {
    return "Pending Setup";
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
  const validation = validateMappingAction(mapping);
  if (!validation.ok) {
    row.dataset.inputMappingValidationState = "invalid";
  }
  row.append(
    tableCell(mapping.objectName),
    tableCell(mapping.actionLabel),
    tableCell(mapping.inputDevice),
  );
  const inputCell = document.createElement("td");
  inputCell.append(tokenButton(mapping));
  row.append(inputCell, tableCell(mapping.state));
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

function inputCaptureCell(values = {}) {
  const cell = document.createElement("td");
  const stack = document.createElement("div");
  stack.className = "content-stack content-stack--compact";

  const source = values.source || "keyboard";
  const binding = normalizeText(values.binding);
  const currentInput = actionButton(inputLabel(source, binding) || "No input captured", "inputRowBindingValue", "", "btn btn--compact cyan");
  currentInput.hidden = !binding;
  currentInput.setAttribute("aria-label", "Current mapping input. Click while editing to capture a new input for this row.");
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
    currentInput.classList.remove("text-gold");
    currentInput.textContent = label || "No input captured";
    currentInput.title = label || "No input captured";
    currentInput.hidden = !normalizedBinding;
    currentInput.setAttribute("aria-label", `${label || "No input captured"} input. Click while editing to capture a new input for this row.`);
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

function highlightEditingRowInput(row) {
  row?.querySelector("[data-input-row-binding-value]")?.classList.add("text-gold");
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

  const actionSelect = selectControl({
    ariaLabel: "Mapping Action",
    options: actionOptionsForObject(object),
    selectedValue: values.action || elements.actionSelect?.value || DEFAULT_ACTIONS[0]?.id,
  });
  actionSelect.dataset.inputRowAction = "true";

  const deviceSelect = selectControl({
    ariaLabel: "Mapping Input Device",
    options: DEVICE_OPTIONS.map((device) => ({ label: device.label, value: device.source })),
    selectedValue: values.source || "keyboard",
  });
  deviceSelect.dataset.inputRowDevice = "true";

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
    controlCell(objectSelect),
    controlCell(actionSelect),
    controlCell(deviceSelect),
    inputCaptureCell(values),
    controlCell(stateSelect),
    actionsCell,
  );
  updateEditingRowValidation(row);
  return row;
}

function updateEditingRowActionOptions(row) {
  const object = objectByKey(row.querySelector("[data-input-row-object]")?.value || "global") || objectOptions[0];
  const actionSelect = row.querySelector("[data-input-row-action]");
  if (!actionSelect) {
    return;
  }
  renderSelect(actionSelect, actionOptionsForObject(object), actionSelect.value);
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
  controllerProfiles = readControllerProfiles();
  customActions = readCustomActions();
  mappings = readMappings();
  renderActionsAndObjects();
  renderDefaults();
  renderControllerDeviceSelect();
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

function startEditingRowCaptureFromValue(row) {
  const source = deviceBySource(row?.querySelector("[data-input-row-device]")?.value || "keyboard").source;
  if (source === "gamepad") {
    captureGamepadInputForRow();
    return;
  }
  startRowCapture(source);
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
  highlightEditingRowInput(row);
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
  const input = inputCaptureService.captureKeyboard(event);
  if (!normalizeText(input.binding)) {
    warnCapture("WARN: Keyboard capture did not receive a key code. Press a physical key and try again.");
    return;
  }
  applyCapturedInputToEditingRow({
    binding: input.binding,
    label: input.label,
    source: input.source,
  });
}

function captureMouseEvent(event) {
  if (rowCaptureSource !== "mouse") {
    return;
  }
  event.preventDefault();
  const input = inputCaptureService.captureMouse(event);
  applyCapturedInputToEditingRow({
    binding: input.binding,
    label: input.label,
    source: input.source,
  });
}

function captureWheelEvent(event) {
  if (rowCaptureSource !== "mouse") {
    return;
  }
  event.preventDefault();
  const input = inputCaptureService.captureWheel(event);
  applyCapturedInputToEditingRow({
    binding: input.binding,
    label: input.label,
    source: input.source,
  });
}

function activeGamepadInput() {
  inputService.update();
  const selectedDevice = selectedControllerDevice();
  const gamepads = inputService.getGamepads();
  const gamepadIndex = Number.isInteger(Number(selectedDevice?.value?.replace(/^gamepad-/, "")))
    ? Number(selectedDevice.value.replace(/^gamepad-/, ""))
    : gamepads[0]?.index;
  const pad = Number.isInteger(gamepadIndex)
    ? inputService.getGamepad(gamepadIndex)
    : null;
  if (!pad) {
    return {
      message: "WARN: Gamepad capture unavailable. Click inside this page, connect a gamepad, refresh devices, then press a button or move an axis.",
      ok: false,
    };
  }
  const result = captureGamepadInputFromEngine({ gamepadIndex, pad });
  if (result.ok) {
    return {
      binding: result.input.binding,
      label: inputLabel("gamepad", result.input.binding),
      ok: true,
    };
  }
  return {
    message: `WARN: ${result.message}`,
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
    setText(elements.statusLog, "Click a mouse button or move the mouse wheel to capture input for this row.");
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

function controllerProfileIdForMappingSource(source) {
  if (source === "keyboard" || source === "mouse") {
    return KEYBOARD_MOUSE_PROFILE_SCOPE;
  }
  return selectedControllerProfile()?.id || "";
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
    controllerProfileId: controllerProfileIdForMappingSource(source),
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
  if (mapping.source === "gamepad" && !profileById(mapping.controllerProfileId)) {
    setText(elements.statusLog, "WARN: Select a saved Controller Profile before saving a Gamepad mapping.");
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

function controllerProfileFromEditingRow(row) {
  const actionsRow = elements.controllerProfileList?.querySelector("[data-controller-profile-editing-actions-row]");
  const actionSelects = [...(actionsRow || row).querySelectorAll("[data-controller-profile-input-action]")];
  const actions = actionSelects.length
    ? actionSelects.map((select) => normalizeText(select.value))
    : normalizeList(profileEditingRow?.values?.actions);
  const values = profileEditingRow?.values || {};
  return normalizeControllerProfile({
    actions,
    controllerId: values.controllerId,
    controllerName: values.controllerName,
    deviceType: values.deviceType,
    id: profileEditingRow?.id || "",
    inputs: values.inputs,
    mappingProfile: values.mappingProfile,
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

function addProfileForDevice(device, source = "detected") {
  if (!device || device.unavailable) {
    setText(
      elements.controllerProfileStatus,
      "WARN: Unknown or unavailable controller. Connect the device, press a button, refresh devices, then select the detected controller before saving a profile.",
    );
    renderControllerProfileFallback();
    return;
  }
  const existingProfile = exactProfileForDevice(device);
  if (existingProfile) {
    setText(elements.controllerProfileStatus, `Exact saved profile: ${existingProfile.mappingProfile}`);
    renderControllerProfileFallback();
    return;
  }
  const profile = profileFromDevice(device, source);
  if (!saveControllerProfiles([profile, ...controllerProfiles])) {
    controllerProfiles = readControllerProfiles();
    renderControllerProfiles();
    return;
  }
  const savedProfile = controllerProfiles.find((candidate) => candidate.id === profile.id) || profile;
  if (source === "default-gamepad") {
    profileEditingRow = {
      id: savedProfile.id,
      values: savedProfile,
    };
    renderAll(`${savedProfile.mappingProfile} saved. Review generated profile inputs.`);
    setText(elements.controllerProfileStatus, `Editing ${savedProfile.mappingProfile} controller profile.`);
    return;
  }
  profileEditingRow = null;
  renderAll(`${profile.mappingProfile} saved. Generated inputs may stay unassigned.`);
}

function selectControllerDevice(value) {
  const device = controllerDeviceOptions().find((candidate) => candidate.value === value);
  if (!device || device.unavailable) {
    profileEditingRow = null;
    renderControllerProfiles();
    renderControllerProfileFallback();
    setText(
      elements.controllerProfileStatus,
      "WARN: Unknown or unavailable controller. Connect the device, press a button, refresh devices, then select the detected controller before saving a profile.",
    );
    return;
  }
  profileEditingRow = null;
  renderControllerProfiles();
  renderControllerProfileFallback();
  setText(elements.controllerProfileStatus, `${device.label} selected. Use Add Profile to save a controller profile for this device.`);
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

function editMapping(mappingId) {
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
    return;
  } else if (target.dataset.inputRowBindingValue !== undefined) {
    startEditingRowCaptureFromValue(editingRowElement());
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
  if (!target?.matches("[data-input-row-device], [data-input-row-object], [data-input-row-action]")) {
    return;
  }
  const row = target.closest("[data-input-editing-row]");
  if (!row) {
    return;
  }
  if (target.matches("[data-input-row-device]")) {
    changeEditingRowDevice(row, target.value);
    return;
  }
  if (target.matches("[data-input-row-object]")) {
    updateEditingRowActionOptions(row);
  }
  updateEditingRowValidation(row);
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

function handleControllerProfileChange(event) {
  const target = event.target instanceof Element ? event.target : null;
  if (!target?.matches("[data-controller-profile-input-action]")) {
    return;
  }
  updateProfileInputAssignedAction(target);
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
  inputService.attach();
  showWorkspaceReturnIfNeeded();
  objectOptions = readObjectOptions();
  controllerProfiles = readControllerProfiles();
  customActions = readCustomActions();
  mappings = readMappings();
  renderActionsAndObjects();
  renderDefaults();
  renderControllerDeviceSelect();
  renderControllerProfiles();
  renderDiagnostics();
  renderMappings();
  elements.actionSelect?.addEventListener("change", () => {
    setText(elements.statusLog, `Selected ${selectedAction().label} action for new mappings.`);
  });
  elements.objectSelect?.addEventListener("change", () => {
    const object = selectedObject();
    renderSelect(elements.actionSelect, actionOptionsForObject(object), elements.actionSelect?.value || "");
    renderObjectSummary(object);
    setText(elements.statusLog, `Selected ${object.label} for new mappings.`);
  });
  elements.controllerDeviceSelect?.addEventListener("change", () => {
    selectControllerDevice(elements.controllerDeviceSelect.value);
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
    addProfileForDevice(selectedControllerDevice(), "detected");
  });
  elements.controllerProfileCreateDefault?.addEventListener("click", () => {
    addProfileForDevice(selectedControllerDevice(), "default-gamepad");
  });
  elements.customActionAdd?.addEventListener("click", addCustomAction);
  elements.customActionInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addCustomAction();
    }
  });
  elements.resetMappings?.addEventListener("click", () => {
    if (!window.confirm("This will delete all Mappings, are you sure?")) {
      setText(elements.statusLog, "Reset canceled.");
      return;
    }
    resetStoredMappings();
    editingRow = null;
    rowCaptureSource = "";
    renderAll("Reset input mappings.");
  });
  elements.refreshDevices?.addEventListener("click", () => {
    renderControllerDeviceSelect();
    renderDiagnostics("Device diagnostics refreshed.");
    renderControllerProfileStatus();
    renderControllerProfileFallback();
  });
  elements.controllerProfileList?.addEventListener("click", handleControllerProfileClick);
  elements.controllerProfileList?.addEventListener("change", handleControllerProfileChange);
  elements.list?.addEventListener("click", handleListClick);
  elements.list?.addEventListener("change", handleListChange);
  window.addEventListener("keydown", captureKeyboardEvent);
  window.addEventListener("pointerdown", captureMouseEvent);
  window.addEventListener("wheel", captureWheelEvent, { passive: false });
}

init();
