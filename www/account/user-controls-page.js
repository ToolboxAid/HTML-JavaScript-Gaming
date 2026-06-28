import { createControlsToolApiRepository } from "../assets/js/shared/controls-api-client.js";
import { getSessionCurrent } from "../../src/api/session-api-client.js";
import InputService from "../../src/engine/input/InputService.js";
import InputCaptureService from "../../src/engine/input/InputCaptureService.js";
import { gamepadProfileInputNames } from "../../src/engine/input/GamepadInputClassifier.js";
import {
  normalizeProfileInputMappings,
  physicalInputSensitivityDescriptor,
  normalizedInputIsAnalog,
  physicalInputIsAnalog,
} from "../../src/engine/input/NormalizedInputRegistry.js";

const DEVICE_POLL_INTERVAL_MS = 1200;
const INPUT_CAPTURE_TIMEOUT_MS = 5000;
const INPUT_CAPTURE_CLICK_SUPPRESSION_MS = 250;
const KEYBOARD_INPUTS = Object.freeze(["KeyW", "KeyA", "KeyS", "KeyD", "Space", "ShiftLeft", "ControlLeft", "Enter", "Backspace", "KeyP"]);
const MOUSE_INPUTS = Object.freeze(["MouseButton0", "MouseButton2", "MouseButton1", "MouseWheelUp", "MouseWheelDown", "MouseX-", "MouseX+", "MouseY-", "MouseY+"]);
const KEYBOARD_MOUSE_EXCLUDED_NORMALIZED_PREFIXES = Object.freeze(["dpad.", "trigger."]);
const SUPPORTED_CONTROL_TYPES = Object.freeze([
  "Gamepad Axis",
  "Gamepad Bumper",
  "Gamepad Button",
  "Gamepad Stick Button",
  "Gamepad Trigger",
  "Joystick Axis",
  "Joystick Button",
  "Keyboard Key",
  "Mouse Axis",
  "Mouse Button",
  "Mouse Wheel",
  "Pointer Drag",
  "Touch Axis / Pad",
  "Touch Button",
]);

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
  return normalizeText(value).split(",").map(normalizeText).filter(Boolean);
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

function labeledControl(labelText, control) {
  const label = document.createElement("label");
  label.textContent = labelText;
  label.append(control);
  return label;
}

function rangeValueLabel(value, unit = "") {
  return `${value}${unit}`;
}

function physicalInputSupportsDeadzoneInvert(physicalInput) {
  const normalizedInput = normalizeText(physicalInput);
  const lowerName = normalizedInput.toLowerCase();
  return physicalInputIsAnalog(normalizedInput)
    || lowerName.includes("trigger")
    || normalizedInput === "LT"
    || normalizedInput === "RT";
}

function createSliderControl({ ariaLabel, dataName, defaultValue, index, max, min, step, unit, value }) {
  const input = document.createElement("input");
  input.type = "range";
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  input.value = String(value);
  input.dataset[dataName] = String(index);
  input.dataset.defaultValue = String(defaultValue);
  input.dataset.unit = unit;
  input.setAttribute("aria-label", ariaLabel);
  const valueLabel = document.createElement("span");
  valueLabel.className = "status";
  valueLabel.dataset.sliderValueFor = dataName;
  valueLabel.textContent = rangeValueLabel(input.value, unit);
  const wrapper = document.createElement("div");
  wrapper.className = "content-cluster";
  wrapper.append(input, valueLabel);
  return wrapper;
}

export class AccountUserControlsPage {
  constructor(root) {
    this.root = root;
    this.repository = createControlsToolApiRepository();
    this.inputService = new InputService({ target: window });
    this.captureService = new InputCaptureService({ inputService: this.inputService });
    this.profiles = [];
    this.editingProfile = null;
    this.selectedInputDevices = new Map();
    this.sessionUserKey = "";
    this.viewingDefaultFamily = "";
    this.devicePollingTimer = null;
    this.inputCapture = null;
    this.elements = {
      addProfile: root.querySelector("[data-account-user-controls-add-profile]"),
      defaultLists: [...root.querySelectorAll("[data-account-user-controls-default-list]")],
      deviceSelect: root.querySelector("[data-account-user-controls-device]"),
      deviceStatus: root.querySelector("[data-account-user-controls-device-status]"),
      familyButtons: [...root.querySelectorAll("[data-account-user-controls-edit-family]")],
      lists: [...root.querySelectorAll("[data-account-user-controls-list]")],
      refresh: root.querySelector("[data-account-user-controls-refresh]"),
      selectedDeviceStatus: root.querySelector("[data-account-user-controls-selected-device-status]"),
      status: root.querySelector("[data-account-user-controls-status]"),
      types: root.querySelector("[data-account-user-controls-types]"),
    };
  }

  init() {
    this.inputService.attach();
    this.sessionUserKey = this.currentSessionUserKey();
    this.profiles = this.readProfiles();
    this.selectedInputDevices = this.readSelectedInputDevices();
    this.renderDeviceSelect();
    this.renderDefaultFallbacks();
    this.renderTypes();
    this.renderProfiles();
    this.renderSelectedInputDevices();
    this.elements.refresh?.addEventListener("click", () => {
      this.renderDeviceSelect();
      this.renderSelectedInputDevices();
      this.renderProfiles();
      this.setStatus(this.deviceRefreshMessage());
    });
    this.elements.addProfile?.addEventListener("click", () => this.addProfileForSelectedDevice());
    this.elements.deviceSelect?.addEventListener("change", () => this.renderDeviceStatus());
    this.elements.familyButtons.forEach((button) => {
      button.addEventListener("click", () => this.editFamilyMappings(button.dataset.accountUserControlsEditFamily || ""));
    });
    this.elements.lists.forEach((list) => {
      list.addEventListener("click", (event) => this.handleListClick(event));
      list.addEventListener("change", (event) => this.handleListChange(event));
      list.addEventListener("input", (event) => this.handleListInput(event));
      list.addEventListener("dblclick", (event) => this.handleListDoubleClick(event));
    });
    window.addEventListener("gamefoundry:session-user-changed", () => this.refreshForSessionUser());
    this.startDevicePolling();
  }

  setStatus(message) {
    if (this.elements.status) {
      this.elements.status.textContent = message;
    }
  }

  setDeviceStatus(message) {
    if (this.elements.deviceStatus) {
      this.elements.deviceStatus.textContent = message;
    }
  }

  currentSessionUserKey() {
    try {
      return normalizeText(getSessionCurrent()?.userKey);
    } catch {
      return "";
    }
  }

  refreshForSessionUser() {
    this.clearInputCapture({ restore: true });
    this.repository = createControlsToolApiRepository();
    this.sessionUserKey = this.currentSessionUserKey();
    this.profiles = this.readProfiles();
    this.selectedInputDevices = this.readSelectedInputDevices();
    this.editingProfile = null;
    this.viewingDefaultFamily = "";
    this.renderDeviceSelect();
    this.renderProfiles();
    this.renderSelectedInputDevices();
    this.setStatus(this.sessionUserKey
      ? "User Controls loaded for the selected user."
      : "Signed out. User Controls profile data cleared.");
  }

  availableGamepads() {
    this.inputService.update();
    return this.inputService.getGamepads();
  }

  deviceOptions() {
    return this.availableGamepads().map((gamepad) => {
      const controllerName = gamepad.id || `Gamepad ${gamepad.index}`;
      return {
        controllerId: gamepad.id || `gamepad-${gamepad.index}`,
        controllerName,
        deviceType: "Gamepad",
        inputs: gamepadProfileInputNames(gamepad),
        label: controllerName,
        mappingProfile: `${controllerName} Profile`,
        value: `gamepad-${gamepad.index}`,
      };
    });
  }

  familyDevice(family) {
    if (family === "Mouse") {
      return {
        controllerId: "generic-mouse",
        controllerName: "Mouse",
        deviceType: "Mouse",
        inputs: [...MOUSE_INPUTS],
        label: "Mouse",
        mappingProfile: "Mouse Profile",
        value: "mouse",
      };
    }
    return {
      controllerId: "generic-keyboard",
      controllerName: "Keyboard",
      deviceType: "Keyboard",
      inputs: [...KEYBOARD_INPUTS],
      label: "Keyboard",
      mappingProfile: "Keyboard Profile",
      value: "keyboard",
    };
  }

  deviceRefreshMessage() {
    const gamepadCount = this.availableGamepads().length;
    if (gamepadCount > 0) {
      return `PASS: ${gamepadCount} game controller${gamepadCount === 1 ? "" : "s"} detected automatically.`;
    }
    return "PASS: Game controllers auto-detect after the browser exposes them.";
  }

  selectedControllerDevice() {
    const selectedValue = this.elements.deviceSelect?.value || "";
    return this.deviceOptions().find((device) => device.value === selectedValue) || null;
  }

  profileIdFor(profile) {
    return keyFromText(`${profile.controllerId}-${profile.mappingProfile}`) || `profile-${Date.now()}`;
  }

  normalizeProfile(source = {}) {
    const inputs = normalizeList(source.inputs);
    const profileName = normalizeText(source.mappingProfile || source.profileName);
    const profile = {
      controllerId: normalizeText(source.controllerId),
      controllerName: normalizeText(source.controllerName),
      deviceType: normalizeText(source.deviceType) || "Gamepad",
      id: normalizeText(source.id),
      inputMappings: normalizeProfileInputMappings(inputs, source.inputMappings),
      inputs,
      mappingProfile: profileName,
    };
    return {
      ...profile,
      id: profile.id || this.profileIdFor(profile),
    };
  }

  readProfiles() {
    if (!this.currentSessionUserKey()) {
      return [];
    }
    let result = this.repository.listControllerProfiles();
    if (Array.isArray(result)) {
      return result.map((profile) => this.normalizeProfile(profile));
    }
    this.repository = createControlsToolApiRepository();
    result = this.repository.listControllerProfiles();
    return Array.isArray(result) ? result.map((profile) => this.normalizeProfile(profile)) : [];
  }

  selectionFamily(selection = {}) {
    const deviceType = normalizeText(selection.deviceType);
    if (deviceType === "Keyboard" || deviceType === "Mouse") {
      return deviceType;
    }
    return "Gamepad";
  }

  selectedInputDeviceForFamily(family) {
    return this.selectedInputDevices.get(this.selectionFamily({ deviceType: family })) || null;
  }

  selectedInputDeviceMapFromList(selections = []) {
    const selectedInputDevices = new Map();
    (Array.isArray(selections) ? selections : []).forEach((selection) => {
      if (selection?.selectionKey) {
        selectedInputDevices.set(this.selectionFamily(selection), selection);
      }
    });
    return selectedInputDevices;
  }

  readSelectedInputDevices() {
    if (!this.currentSessionUserKey()) {
      return new Map();
    }
    let result = this.repository.listSelectedInputDevices();
    if (result?.error) {
      this.repository = createControlsToolApiRepository();
      result = this.repository.listSelectedInputDevices();
    }
    if (Array.isArray(result)) {
      return this.selectedInputDeviceMapFromList(result);
    }
    result = this.repository.getSelectedInputDevice();
    if (result?.error) {
      this.repository = createControlsToolApiRepository();
      result = this.repository.getSelectedInputDevice();
    }
    return result && !result.error ? this.selectedInputDeviceMapFromList([result]) : new Map();
  }

  saveSelectedInputDevice(selection) {
    if (!this.currentSessionUserKey()) {
      this.setStatus("WARN: Log in to save User Controls.");
      return false;
    }
    let result = this.repository.saveSelectedInputDevice(selection);
    if (result?.error) {
      this.repository = createControlsToolApiRepository();
      result = this.repository.saveSelectedInputDevice(selection);
    }
    if (Array.isArray(result?.selectedInputDevices)) {
      this.selectedInputDevices = this.selectedInputDeviceMapFromList(result.selectedInputDevices);
      this.renderSelectedInputDevices();
      return true;
    }
    if (result?.selectedInputDevice) {
      this.selectedInputDevices.set(this.selectionFamily(result.selectedInputDevice), result.selectedInputDevice);
      this.renderSelectedInputDevices();
      return true;
    }
    this.setStatus(result?.message || "WARN: Selected Device could not reach the shared DB adapter.");
    return false;
  }

  saveProfiles(nextProfiles) {
    if (!this.currentSessionUserKey()) {
      this.setStatus("WARN: Log in to save User Controls.");
      return false;
    }
    const normalizedProfiles = nextProfiles.map((profile) => this.normalizeProfile(profile));
    let result = this.repository.replaceControllerProfiles(normalizedProfiles);
    if (!Array.isArray(result?.profiles) && result?.error) {
      this.repository = createControlsToolApiRepository();
      result = this.repository.replaceControllerProfiles(normalizedProfiles);
    }
    if (Array.isArray(result?.profiles)) {
      this.profiles = result.profiles.map((profile) => this.normalizeProfile(profile));
      return true;
    }
    this.setStatus(result?.message || "WARN: User Controls could not reach the shared DB adapter.");
    return false;
  }

  profileFromDevice(device) {
    return this.normalizeProfile({
      controllerId: device.controllerId,
      controllerName: device.controllerName,
      deviceType: device.deviceType,
      inputMappings: normalizeProfileInputMappings(device.inputs),
      inputs: device.inputs,
      mappingProfile: device.mappingProfile,
    });
  }

  uniqueProfileForDevice(device) {
    const family = this.profileListFamily(device);
    const baseControllerName = normalizeText(device.controllerName) || family;
    const baseProfileName = normalizeText(device.mappingProfile) || `${baseControllerName} Profile`;
    const profileIds = new Set(this.profiles.map((profile) => normalizeText(profile.id)));
    const profileNames = new Set(this.profiles
      .filter((profile) => this.profileListFamily(profile) === family)
      .map((profile) => normalizeText(profile.mappingProfile).toLowerCase()));
    let controllerName = baseControllerName;
    let mappingProfile = baseProfileName;
    let suffix = 2;
    while (profileNames.has(mappingProfile.toLowerCase())) {
      controllerName = `${baseControllerName} ${suffix}`;
      mappingProfile = `${baseControllerName} ${suffix} Profile`;
      suffix += 1;
    }
    const baseProfileId = this.profileIdFor({ controllerId: device.controllerId, mappingProfile });
    let profileId = baseProfileId;
    let idSuffix = 2;
    while (profileIds.has(profileId)) {
      profileId = `${baseProfileId}-${idSuffix}`;
      idSuffix += 1;
    }
    return this.normalizeProfile({
      controllerId: device.controllerId,
      controllerName,
      deviceType: device.deviceType,
      id: profileId,
      inputMappings: normalizeProfileInputMappings(device.inputs),
      inputs: device.inputs,
      mappingProfile,
    });
  }

  createProfile(device, { persistImmediately = true } = {}) {
    const knownProfiles = new Map();
    this.readProfiles().forEach((profile) => {
      knownProfiles.set(profile.id, profile);
    });
    this.profiles.forEach((profile) => {
      knownProfiles.set(profile.id, profile);
    });
    this.profiles = [...knownProfiles.values()];
    const profile = this.uniqueProfileForDevice(device);
    let createdProfile = profile;
    if (persistImmediately) {
      if (!this.saveProfiles([...this.profiles, profile])) {
        this.setStatus("FAIL: User Controls could not reach the shared DB adapter.");
        return;
      }
      createdProfile = this.profiles.find((candidate) => candidate.id === profile.id) || profile;
    }
    this.editingProfile = { id: createdProfile.id, values: createdProfile };
    this.viewingDefaultFamily = "";
    this.renderProfiles();
    this.setStatus(`PASS: Created ${createdProfile.mappingProfile}. Editing the new profile.`);
  }

  renderDeviceSelect() {
    if (!this.elements.deviceSelect) {
      this.renderDeviceStatus();
      return;
    }
    const selectedValue = this.elements.deviceSelect.value;
    const options = [
      { label: "Choose a game controller", value: "" },
      ...this.deviceOptions().map((device) => ({ label: device.label, value: device.value })),
    ];
    this.elements.deviceSelect.classList.add("tool-form-control");
    this.elements.deviceSelect.replaceChildren(...options.map((option) => optionElement(option.value, option.label)));
    this.elements.deviceSelect.value = options.some((option) => option.value === selectedValue) ? selectedValue : "";
    this.renderDeviceStatus();
  }

  renderDeviceStatus() {
    const device = this.selectedControllerDevice();
    if (!device) {
      this.setDeviceStatus(this.deviceRefreshMessage());
      return;
    }
    this.setDeviceStatus(`${device.label} selected. Create a user control profile to map physical inputs to normalized controls. ${this.deviceRefreshMessage()}`);
  }

  defaultProfileForFamily(family) {
    const normalizedFamily = family === "Mouse" ? "Mouse" : family === "Gamepad" ? "Gamepad" : "Keyboard";
    const systemDefault = this.inputService.getSystemDefaultProfileForDevice(
      normalizedFamily === "Gamepad" ? "Gamepad" : "Keyboard/Mouse",
    );
    const inputs = normalizedFamily === "Gamepad"
      ? null
      : normalizedFamily === "Mouse" ? MOUSE_INPUTS : KEYBOARD_INPUTS;
    const inputMappings = (systemDefault.inputMappings || [])
      .filter((mapping) => !inputs || inputs.includes(mapping.physicalInput));
    return this.normalizeProfile({
      controllerId: `system-default-${normalizedFamily.toLowerCase()}`,
      controllerName: "Default Profile",
      deviceType: normalizedFamily,
      id: `default-${normalizedFamily.toLowerCase()}`,
      inputMappings,
      inputs: inputMappings.map((mapping) => mapping.physicalInput),
      mappingProfile: "Default Profile",
    });
  }

  defaultSelectionChoice(family) {
    const profile = this.defaultProfileForFamily(family);
    return {
      controllerId: profile.controllerId,
      deviceType: family,
      label: `${family} Default Profile`,
      profileId: "",
      selectionKey: `default:${family.toLowerCase()}`,
      selectionType: "default",
    };
  }

  profileSelectionChoice(profile) {
    return {
      controllerId: profile.controllerId,
      deviceType: this.profileListFamily(profile),
      label: `${profile.controllerName} (${profile.mappingProfile})`,
      profileId: profile.id,
      selectionKey: `profile:${profile.id}`,
      selectionType: "profile",
    };
  }

  selectedInputDeviceChoices() {
    const choices = [];
    const seenKeys = new Set();
    const addChoice = (choice) => {
      if (seenKeys.has(choice.selectionKey)) {
        return;
      }
      seenKeys.add(choice.selectionKey);
      choices.push(choice);
    };
    ["Keyboard", "Mouse", "Gamepad"].forEach((family) => addChoice(this.defaultSelectionChoice(family)));
    this.profiles.forEach((profile) => {
      addChoice(this.profileSelectionChoice(profile));
    });
    return choices;
  }

  selectedInputDeviceConnected(selection) {
    if (!selection) {
      return false;
    }
    if (selection.selectionType === "profile") {
      const profile = this.profiles.find((candidate) => candidate.id === selection.profileId);
      if (!profile) {
        return false;
      }
      if (profile.deviceType === "Keyboard" || profile.deviceType === "Mouse") {
        return true;
      }
      return this.deviceOptions().some((device) => device.controllerId === profile.controllerId);
    }
    if (selection.selectionType === "default") {
      return true;
    }
    if (selection.deviceType === "Keyboard" || selection.deviceType === "Mouse") {
      return true;
    }
    if (selection.deviceType === "Gamepad") {
      return this.deviceOptions().some((device) => device.controllerId === selection.controllerId);
    }
    return false;
  }

  renderSelectedInputDeviceStatus() {
    if (!this.elements.selectedDeviceStatus) {
      return;
    }
    const selections = ["Keyboard", "Mouse", "Gamepad"]
      .map((family) => this.selectedInputDeviceForFamily(family))
      .filter(Boolean);
    if (!selections.length) {
      this.elements.selectedDeviceStatus.textContent = "Default Profile";
      return;
    }
    const labels = selections.map((selection) => (
      this.selectedInputDeviceConnected(selection)
        ? selection.label || selection.deviceType
        : `${selection.deviceType} selected device not connected. Using Default Profile`
    ));
    this.elements.selectedDeviceStatus.textContent = labels.length === 1
      ? `Selected Device: ${labels[0]}.`
      : `Selected Devices: ${labels.join("; ")}.`;
  }

  renderSelectedInputDevices() {
    this.renderSelectedInputDeviceStatus();
  }

  handleSelectedInputDeviceChange(event) {
    const target = event.target instanceof HTMLInputElement
      ? event.target.closest("[data-account-user-controls-selected-device]")
      : null;
    if (!(target instanceof HTMLInputElement) || !target.checked) {
      return;
    }
    const choice = this.selectedInputDeviceChoices().find((candidate) => candidate.selectionKey === target.value);
    if (!choice) {
      return;
    }
    if (this.saveSelectedInputDevice(choice)) {
      this.setStatus(`PASS: Selected Device saved as ${choice.label}.`);
    }
  }

  renderTypes() {
    if (!this.elements.types) {
      return;
    }
    this.elements.types.replaceChildren(...SUPPORTED_CONTROL_TYPES.map((controlType) => {
      const item = document.createElement("li");
      item.textContent = controlType;
      return item;
    }));
  }

  renderDefaultFallbacks() {
    if (!this.elements.defaultLists.length) {
      return;
    }
    const systemDefault = this.inputService.getSystemDefaultProfileForDevice("Keyboard/Mouse");
    const rowsByFamily = new Map([
      ["Keyboard", []],
      ["Mouse", []],
    ]);
    (systemDefault.inputMappings || [])
      .filter((mapping) => KEYBOARD_INPUTS.includes(mapping.physicalInput) || MOUSE_INPUTS.includes(mapping.physicalInput))
      .forEach((mapping) => {
        const row = document.createElement("tr");
        row.dataset.accountUserControlsDefaultRow = mapping.physicalInput;
        const family = MOUSE_INPUTS.includes(mapping.physicalInput) ? "Mouse" : "Keyboard";
        row.append(
          tableCell(mapping.physicalInput),
          tableCell(mapping.normalizedInput || mapping.positiveNormalizedInput || mapping.negativeNormalizedInput || "Unassigned"),
          tableCell("Default profile"),
        );
        rowsByFamily.get(family)?.push(row);
      });
    this.elements.defaultLists.forEach((list) => {
      const family = list.dataset.accountUserControlsDefaultFamily || "Keyboard";
      const rows = rowsByFamily.get(family) || [];
      if (!rows.length) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 3;
        cell.textContent = `No ${family} fallback controls available.`;
        row.append(cell);
        rows.push(row);
      }
      list.replaceChildren(...rows);
    });
  }

  startDevicePolling() {
    if (this.devicePollingTimer || typeof window.setInterval !== "function") {
      return;
    }
    this.devicePollingTimer = window.setInterval(() => {
      this.renderDeviceSelect();
      if (!this.editingProfile) {
        this.renderProfiles();
      }
    }, DEVICE_POLL_INTERVAL_MS);
    window.addEventListener("pagehide", () => {
      if (this.devicePollingTimer) {
        window.clearInterval(this.devicePollingTimer);
        this.devicePollingTimer = null;
      }
    }, { once: true });
  }

  profileListFamily(profile) {
    const deviceType = normalizeText(profile?.deviceType);
    if (deviceType === "Keyboard" || deviceType === "Mouse") {
      return deviceType;
    }
    return "Gamepad";
  }

  emptyProfileMessage(family) {
    if (family === "Keyboard") {
      return "No keyboard user control profile saved yet.";
    }
    if (family === "Mouse") {
      return "No mouse user control profile saved yet.";
    }
    return "No game controller profiles saved yet.";
  }

  tableColumnCountForFamily(family) {
    return family === "Keyboard" ? 5 : 8;
  }

  normalizedOptionsForProfile(profile) {
    const allOptions = this.inputService.getNormalizedInputOptions();
    const normalizedFamily = this.profileListFamily(profile);
    const filteredOptions = normalizedFamily === "Keyboard" || normalizedFamily === "Mouse"
      ? allOptions.filter((option) =>
        !KEYBOARD_MOUSE_EXCLUDED_NORMALIZED_PREFIXES.some((prefix) => option.value.startsWith(prefix)),
      )
      : allOptions;
    return [
      { label: "Unassigned", value: "" },
      ...filteredOptions,
    ];
  }

  generatedInputHeadings(profile) {
    if (this.profileListFamily(profile) === "Keyboard") {
      return ["Physical Input", "Normalized Control"];
    }
    return ["Physical Input", "Normalized Control", "Deadzone", "Invert", "Sensitivity"];
  }

  renderProfiles() {
    if (!this.elements.lists.length) {
      return;
    }
    const rowsByFamily = new Map(this.elements.lists.map((list) => [
      list.dataset.accountUserControlsListFamily || "Gamepad",
      [],
    ]));
    rowsByFamily.forEach((rows, family) => {
      const defaultProfile = this.defaultProfileForFamily(family);
      rows.push(this.renderDefaultProfileRow(defaultProfile, family));
      if (this.viewingDefaultFamily === family) {
        rows.push(this.renderReadonlyProfileDetailsRow(defaultProfile, family));
      }
    });
    if (this.editingProfile) {
      const family = this.profileListFamily(this.editingProfile.values);
      rowsByFamily.get(family)?.push(...this.renderEditingRows(this.editingProfile.values));
    }
    const visibleProfiles = this.editingProfile?.id
      ? this.profiles.filter((profile) => profile.id !== this.editingProfile.id)
      : this.profiles;
    visibleProfiles.forEach((profile) => {
      const family = this.profileListFamily(profile);
      rowsByFamily.get(family)?.push(this.renderProfileRow(profile));
    });
    this.elements.lists.forEach((list) => {
      const family = list.dataset.accountUserControlsListFamily || "Gamepad";
      const rows = rowsByFamily.get(family) || [];
      if (!rows.length) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = this.tableColumnCountForFamily(family);
        cell.textContent = this.emptyProfileMessage(family);
        row.append(cell);
        rows.push(row);
      }
      list.replaceChildren(...rows);
    });
    if (this.elements.addProfile) {
      this.elements.addProfile.disabled = Boolean(this.editingProfile);
    }
    this.elements.familyButtons.forEach((button) => {
      button.disabled = Boolean(this.editingProfile);
    });
    this.renderSelectedInputDevices();
  }

  selectedDeviceCell(choice) {
    const cell = document.createElement("td");
    const input = document.createElement("input");
    const family = this.selectionFamily(choice);
    input.type = "radio";
    input.name = `account-user-controls-selected-device-${family.toLowerCase()}`;
    input.value = choice.selectionKey;
    input.dataset.accountUserControlsSelectedDevice = choice.selectionKey;
    input.checked = this.selectedInputDeviceForFamily(family)?.selectionKey === choice.selectionKey;
    input.setAttribute("aria-label", `Select ${choice.label}`);
    cell.append(input);
    return cell;
  }

  readonlyNormalizedSummary(mapping) {
    if (physicalInputIsAnalog(mapping.physicalInput)) {
      const negative = normalizeText(mapping.negativeNormalizedInput) || "Unassigned";
      const positive = normalizeText(mapping.positiveNormalizedInput) || "Unassigned";
      return `Negative ${negative}; Positive ${positive}`;
    }
    return normalizeText(mapping.normalizedInput) || "Unassigned";
  }

  renderReadonlyInputRow(profile, inputMapping) {
    const row = document.createElement("tr");
    row.dataset.accountUserControlsDefaultInput = inputMapping.physicalInput;
    row.append(
      tableCell(inputMapping.physicalInput),
      tableCell(this.readonlyNormalizedSummary(inputMapping)),
    );
    if (this.profileListFamily(profile) === "Keyboard") {
      return row;
    }
    row.append(
      tableCell(physicalInputSupportsDeadzoneInvert(inputMapping.physicalInput) ? String(inputMapping.deadzone) : "N/A"),
      tableCell(physicalInputSupportsDeadzoneInvert(inputMapping.physicalInput) && inputMapping.invert ? "On" : physicalInputSupportsDeadzoneInvert(inputMapping.physicalInput) ? "Off" : "N/A"),
      tableCell(physicalInputSensitivityDescriptor(inputMapping.physicalInput)
        ? rangeValueLabel(inputMapping.sensitivity ?? physicalInputSensitivityDescriptor(inputMapping.physicalInput).defaultValue, physicalInputSensitivityDescriptor(inputMapping.physicalInput).unit)
        : "N/A"),
    );
    return row;
  }

  renderReadonlyProfileDetailsRow(profile, family) {
    const detailsRow = document.createElement("tr");
    detailsRow.dataset.accountUserControlsDefaultDetails = family;
    const detailsCell = document.createElement("td");
    detailsCell.colSpan = this.tableColumnCountForFamily(family);
    const wrapper = document.createElement("div");
    wrapper.className = "table-wrapper";
    const table = document.createElement("table");
    table.className = "data-table";
    table.dataset.accountUserControlsDefaultInputTable = family;
    table.setAttribute("aria-label", `${family} Default Profile inputs`);
    const head = document.createElement("thead");
    const headRow = document.createElement("tr");
    this.generatedInputHeadings(profile).forEach((heading) => {
      const cell = document.createElement("th");
      cell.textContent = heading;
      headRow.append(cell);
    });
    head.append(headRow);
    const body = document.createElement("tbody");
    body.append(...profile.inputMappings.map((inputMapping) => this.renderReadonlyInputRow(profile, inputMapping)));
    table.append(head, body);
    wrapper.append(table);
    detailsCell.append(wrapper);
    detailsRow.append(detailsCell);
    return detailsRow;
  }

  renderDefaultProfileRow(profile, family) {
    const row = document.createElement("tr");
    row.dataset.accountUserControlsDefaultProfile = family;
    if (family === "Keyboard") {
      row.append(
        this.selectedDeviceCell(this.defaultSelectionChoice(family)),
        tableCell("Default Profile"),
        tableCell(`${profile.inputMappings.length} Physical Inputs`),
        tableCell(this.profileInputSummary(profile)),
      );
    } else {
      row.append(
        this.selectedDeviceCell(this.defaultSelectionChoice(family)),
        tableCell("Default Profile"),
        tableCell(`${profile.inputMappings.length} Physical Inputs`),
        tableCell(this.profileInputSummary(profile)),
        tableCell(this.profileAnalogSummary(profile)),
        tableCell(profile.inputMappings.some((mapping) => mapping.invert) ? "Invert configured" : "No invert"),
        tableCell(this.profileSensitivitySummary(profile)),
      );
    }
    const actions = document.createElement("td");
    const group = document.createElement("div");
    group.className = "action-group action-group--tight";
    group.append(actionButton("View", "accountUserControlsViewDefault", family));
    actions.append(group);
    row.append(actions);
    return row;
  }

  profileInputSummary(profile) {
    const assigned = profile.inputMappings.reduce((count, mapping) => {
      if (!physicalInputIsAnalog(mapping.physicalInput)) {
        return count + (mapping.normalizedInput ? 1 : 0);
      }
      return count + (mapping.negativeNormalizedInput ? 1 : 0) + (mapping.positiveNormalizedInput ? 1 : 0);
    }, 0);
    const total = profile.inputMappings.reduce((count, mapping) => count + (physicalInputIsAnalog(mapping.physicalInput) ? 2 : 1), 0);
    return total ? `${assigned}/${total} Normalized Controls` : "No generated inputs";
  }

  profileAnalogSummary(profile) {
    const analogMappings = profile.inputMappings.filter((mapping) =>
      physicalInputIsAnalog(mapping.physicalInput) || normalizedInputIsAnalog(mapping.normalizedInput),
    );
    if (!analogMappings.length) {
      return "No analog axes";
    }
    const inverted = analogMappings.filter((mapping) => mapping.invert).length;
    return `${analogMappings.length} analog axes, ${inverted} inverted`;
  }

  profileSensitivitySummary(profile) {
    const sensitiveInputs = profile.inputMappings.filter((mapping) => physicalInputSensitivityDescriptor(mapping.physicalInput));
    if (!sensitiveInputs.length) {
      return "No sensitivity controls";
    }
    const adjusted = sensitiveInputs.filter((mapping) => {
      const descriptor = physicalInputSensitivityDescriptor(mapping.physicalInput);
      return descriptor && Number(mapping.sensitivity ?? descriptor.defaultValue) !== descriptor.defaultValue;
    }).length;
    return `${sensitiveInputs.length} sensitivity controls, ${adjusted} adjusted`;
  }

  renderProfileRow(profile) {
    const row = document.createElement("tr");
    row.dataset.accountUserControlsProfileRow = profile.id;
    const family = this.profileListFamily(profile);
    if (family === "Keyboard") {
      row.append(
        this.selectedDeviceCell(this.profileSelectionChoice(profile)),
        tableCell(profile.controllerName),
        tableCell(`${profile.inputMappings.length} Physical Inputs`),
        tableCell(this.profileInputSummary(profile)),
      );
    } else {
      row.append(
        this.selectedDeviceCell(this.profileSelectionChoice(profile)),
        tableCell(profile.controllerName),
        tableCell(`${profile.inputMappings.length} Physical Inputs`),
        tableCell(this.profileInputSummary(profile)),
        tableCell(this.profileAnalogSummary(profile)),
        tableCell(profile.inputMappings.some((mapping) => mapping.invert) ? "Invert configured" : "No invert"),
        tableCell(this.profileSensitivitySummary(profile)),
      );
    }
    const actions = document.createElement("td");
    const group = document.createElement("div");
    group.className = "action-group action-group--tight";
    group.append(
      actionButton("Edit", "accountUserControlsEdit", profile.id),
      actionButton("Trash", "accountUserControlsTrash", profile.id),
    );
    actions.append(group);
    row.append(actions);
    return row;
  }

  inputControl(profile, inputMapping, index) {
    const row = document.createElement("tr");
    row.dataset.accountUserControlsInputPair = "true";
    const family = this.profileListFamily(profile);
    const editablePhysicalInput = family === "Keyboard" || family === "Mouse";
    const physicalInputControl = editablePhysicalInput
      ? document.createElement("input")
      : document.createElement("strong");
    const physicalInputCell = document.createElement("td");
    if (editablePhysicalInput) {
      physicalInputControl.type = "text";
      physicalInputControl.value = inputMapping.physicalInput;
      physicalInputControl.readOnly = true;
      physicalInputControl.dataset.accountUserControlsPhysicalInput = String(index);
      physicalInputControl.dataset.accountUserControlsCaptureDevice = family;
      physicalInputControl.title = `Click to capture the next ${family.toLowerCase()} input.`;
      physicalInputControl.setAttribute("aria-label", `${family} physical input`);
    } else {
      physicalInputControl.textContent = inputMapping.physicalInput;
    }
    physicalInputCell.append(physicalInputControl);
    const stack = document.createElement("div");
    stack.className = "content-stack content-stack--compact";
    const normalizedOptions = this.normalizedOptionsForProfile(profile);
    if (physicalInputIsAnalog(inputMapping.physicalInput)) {
      const negativeSelect = selectControl({
        ariaLabel: `${inputMapping.physicalInput} negative normalized control`,
        options: normalizedOptions,
        selectedValue: inputMapping.negativeNormalizedInput,
      });
      negativeSelect.dataset.accountUserControlsInputNegative = String(index);
      const positiveSelect = selectControl({
        ariaLabel: `${inputMapping.physicalInput} positive normalized control`,
        options: normalizedOptions,
        selectedValue: inputMapping.positiveNormalizedInput,
      });
      positiveSelect.dataset.accountUserControlsInputPositive = String(index);
      stack.append(labeledControl("Negative", negativeSelect), labeledControl("Positive", positiveSelect));
    } else {
      const select = selectControl({
        ariaLabel: `${inputMapping.physicalInput} normalized control`,
        options: normalizedOptions,
        selectedValue: inputMapping.normalizedInput,
      });
      select.dataset.accountUserControlsInputNormalized = String(index);
      stack.append(select);
    }
    const validation = document.createElement("p");
    validation.className = "status";
    validation.dataset.accountUserControlsInputValidation = String(index);
    stack.append(validation);

    if (family === "Keyboard") {
      row.append(physicalInputCell, controlCell(stack));
      return row;
    }

    const deadzoneCell = document.createElement("td");
    if (physicalInputSupportsDeadzoneInvert(inputMapping.physicalInput)) {
      const deadzone = document.createElement("input");
      deadzone.type = "number";
      deadzone.min = "0";
      deadzone.max = "1";
      deadzone.step = "0.05";
      deadzone.value = String(inputMapping.deadzone);
      deadzone.dataset.accountUserControlsDeadzone = String(index);
      deadzoneCell.append(deadzone);
    } else {
      deadzoneCell.textContent = "N/A";
    }

    const invertCell = document.createElement("td");
    if (physicalInputSupportsDeadzoneInvert(inputMapping.physicalInput)) {
      const invert = document.createElement("input");
      invert.type = "checkbox";
      invert.checked = Boolean(inputMapping.invert);
      invert.dataset.accountUserControlsInvert = String(index);
      invertCell.append(invert);
    } else {
      invertCell.textContent = "N/A";
    }

    const sensitivityCell = document.createElement("td");
    const sensitivity = physicalInputSensitivityDescriptor(inputMapping.physicalInput);
    if (sensitivity) {
      const value = Number.isFinite(Number(inputMapping.sensitivity))
        ? Number(inputMapping.sensitivity)
        : sensitivity.defaultValue;
      sensitivityCell.append(createSliderControl({
        ariaLabel: sensitivity.label,
        dataName: "accountUserControlsSensitivity",
        defaultValue: sensitivity.defaultValue,
        index,
        max: sensitivity.max,
        min: sensitivity.min,
        step: sensitivity.step,
        unit: sensitivity.unit,
        value,
      }));
    } else {
      sensitivityCell.textContent = "N/A";
    }

    row.append(physicalInputCell, controlCell(stack), deadzoneCell, invertCell, sensitivityCell);
    return row;
  }

  renderEditingRows(values = {}) {
    const profile = this.normalizeProfile(values);
    const family = this.profileListFamily(profile);
    const row = document.createElement("tr");
    row.dataset.accountUserControlsEditingRow = "true";
    const controllerName = document.createElement("input");
    controllerName.type = "text";
    controllerName.value = profile.controllerName;
    controllerName.dataset.accountUserControlsControllerName = "true";
    controllerName.setAttribute("aria-label", "Physical Controller name");
    const controllerCell = document.createElement("td");
    const controllerStack = document.createElement("div");
    controllerStack.className = "content-stack content-stack--compact";
    const deviceType = document.createElement("span");
    deviceType.className = "status";
    deviceType.textContent = profile.deviceType;
    controllerStack.append(deviceType, labeledControl("Physical Controller", controllerName));
    controllerCell.append(controllerStack);
    const actions = document.createElement("td");
    const group = document.createElement("div");
    group.className = "action-group action-group--tight";
    group.append(
      actionButton("Save", "accountUserControlsSave"),
      actionButton("Cancel", "accountUserControlsCancel"),
    );
    actions.append(group);
    if (family === "Keyboard") {
      row.append(
        tableCell("Editing"),
        controllerCell,
        tableCell(`${profile.inputMappings.length} Physical Inputs`),
        tableCell(this.profileInputSummary(profile)),
        actions,
      );
    } else {
      row.append(
        tableCell("Editing"),
        controllerCell,
        tableCell(`${profile.inputMappings.length} Physical Inputs`),
        tableCell(this.profileInputSummary(profile)),
        tableCell(this.profileAnalogSummary(profile)),
        tableCell(profile.inputMappings.some((mapping) => mapping.invert) ? "Invert configured" : "No invert"),
        tableCell(this.profileSensitivitySummary(profile)),
        actions,
      );
    }

    const detailsRow = document.createElement("tr");
    detailsRow.dataset.accountUserControlsEditingDetails = "true";
    const detailsCell = document.createElement("td");
    detailsCell.colSpan = this.tableColumnCountForFamily(family);
    const wrapper = document.createElement("div");
    wrapper.className = "table-wrapper";
    const table = document.createElement("table");
    table.className = "data-table";
    table.dataset.accountUserControlsGeneratedInputTable = "true";
    table.setAttribute("aria-label", `${profile.controllerName} generated controller inputs`);
    const head = document.createElement("thead");
    const headRow = document.createElement("tr");
    this.generatedInputHeadings(profile).forEach((heading) => {
      const cell = document.createElement("th");
      cell.textContent = heading;
      headRow.append(cell);
    });
    head.append(headRow);
    const body = document.createElement("tbody");
    body.append(...profile.inputMappings.map((inputMapping, index) => this.inputControl(profile, inputMapping, index)));
    table.append(head, body);
    wrapper.append(table);
    detailsCell.append(wrapper);
    detailsRow.append(detailsCell);
    return [row, detailsRow];
  }

  addProfileForSelectedDevice() {
    const device = this.selectedControllerDevice();
    if (!device) {
      this.setStatus("WARN: Choose a detected game controller before creating a user control profile.");
      return;
    }
    this.createProfile(device, { persistImmediately: false });
  }

  editFamilyMappings(family) {
    const normalizedFamily = family === "Mouse" ? "Mouse" : "Keyboard";
    const device = this.familyDevice(normalizedFamily);
    this.createProfile(device);
  }

  profileFromEditingRow() {
    const values = this.editingProfile?.values || {};
    const details = this.root.querySelector("[data-account-user-controls-editing-details]");
    const controllerNameInput = this.root.querySelector("[data-account-user-controls-controller-name]");
    const previousControllerName = normalizeText(values.controllerName);
    const controllerName = normalizeText(controllerNameInput?.value ?? previousControllerName)
      || previousControllerName
      || normalizeText(values.deviceType)
      || "Game Controller";
    const previousProfileName = normalizeText(values.mappingProfile || values.profileName);
    const mappingProfile = previousProfileName === `${previousControllerName} Profile`
      ? `${controllerName} Profile`
      : previousProfileName || `${controllerName} Profile`;
    const inputMappings = (values.inputMappings || []).map((mapping, index) => {
      const physicalInputControl = details?.querySelector(`[data-account-user-controls-physical-input="${index}"]`);
      const normalizedSelect = details?.querySelector(`[data-account-user-controls-input-normalized="${index}"]`);
      const negativeSelect = details?.querySelector(`[data-account-user-controls-input-negative="${index}"]`);
      const positiveSelect = details?.querySelector(`[data-account-user-controls-input-positive="${index}"]`);
      const deadzoneInput = details?.querySelector(`[data-account-user-controls-deadzone="${index}"]`);
      const invertInput = details?.querySelector(`[data-account-user-controls-invert="${index}"]`);
      const sensitivityInput = details?.querySelector(`[data-account-user-controls-sensitivity="${index}"]`);
      const physicalInput = normalizeText(physicalInputControl?.value ?? mapping.physicalInput);
      const negativeNormalizedInput = normalizeText(negativeSelect?.value ?? mapping.negativeNormalizedInput);
      const positiveNormalizedInput = normalizeText(positiveSelect?.value ?? mapping.positiveNormalizedInput);
      return {
        deadzone: Number(deadzoneInput?.value ?? mapping.deadzone),
        invert: Boolean(invertInput?.checked ?? mapping.invert),
        negativeNormalizedInput,
        normalizedInput: positiveNormalizedInput || normalizeText(normalizedSelect?.value ?? mapping.normalizedInput) || negativeNormalizedInput,
        physicalInput,
        positiveNormalizedInput,
        sensitivity: sensitivityInput ? Number(sensitivityInput.value) : mapping.sensitivity,
      };
    });
    return this.normalizeProfile({
      ...values,
      controllerName,
      id: this.editingProfile?.id || "",
      inputMappings,
      inputs: inputMappings.map((mapping) => mapping.physicalInput),
      mappingProfile,
    });
  }

  mappingHasNormalizedControl(mapping) {
    return Boolean(
      normalizeText(mapping.normalizedInput)
        || normalizeText(mapping.negativeNormalizedInput)
        || normalizeText(mapping.positiveNormalizedInput),
    );
  }

  validateProfile(profile) {
    if (!normalizeText(profile.controllerId) || !normalizeText(profile.mappingProfile)) {
      return {
        invalidIndexes: [],
        message: "Choose a physical controller before saving.",
        ok: false,
      };
    }
    const invalidIndexes = [];
    let assignedCount = 0;
    profile.inputMappings.forEach((mapping, index) => {
      if (this.mappingHasNormalizedControl(mapping)) {
        assignedCount += 1;
      }
      const deadzone = Number(mapping.deadzone);
      const descriptor = physicalInputSensitivityDescriptor(mapping.physicalInput);
      const sensitivity = Number(mapping.sensitivity ?? descriptor?.defaultValue);
      const invalidDeadzone = Number.isFinite(deadzone) && (deadzone < 0 || deadzone > 1);
      const invalidSensitivity = descriptor && (!Number.isFinite(sensitivity) || sensitivity < descriptor.min || sensitivity > descriptor.max);
      if (invalidDeadzone || invalidSensitivity) {
        invalidIndexes.push(index);
      }
    });
    if (!assignedCount) {
      return {
        invalidIndexes: profile.inputMappings.map((_, index) => index),
        message: "Assign at least one physical input to a normalized control before saving.",
        ok: false,
      };
    }
    if (invalidIndexes.length) {
      return {
        invalidIndexes,
        message: "Resolve highlighted input rows before saving.",
        ok: false,
      };
    }
    return {
      invalidIndexes: [],
      message: "",
      ok: true,
    };
  }

  duplicateProfileName(profile) {
    const profileName = normalizeText(profile.mappingProfile).toLowerCase();
    if (!profileName) {
      return null;
    }
    const family = this.profileListFamily(profile);
    return this.profiles.find((candidate) =>
      candidate.id !== profile.id
        && this.profileListFamily(candidate) === family
        && normalizeText(candidate.mappingProfile).toLowerCase() === profileName,
    ) || null;
  }

  renderInputValidation(validation) {
    const invalidIndexes = new Set(validation.invalidIndexes || []);
    this.root.querySelectorAll("[data-account-user-controls-input-validation]").forEach((status) => {
      const index = Number(status.dataset.accountUserControlsInputValidation);
      status.textContent = invalidIndexes.has(index)
        ? "Needs normalized control, valid deadzone, and valid sensitivity."
        : "";
    });
  }

  clearInputCapture({ restore = false } = {}) {
    if (!this.inputCapture) {
      return;
    }
    const { listeners, previousValue, target, timer } = this.inputCapture;
    if (timer) {
      window.clearTimeout(timer);
    }
    listeners.forEach(({ handler, type }) => {
      window.removeEventListener(type, handler, true);
    });
    if (restore && target?.isConnected) {
      target.value = previousValue;
    }
    this.inputCapture = null;
  }

  capturedInputBinding(deviceType, event) {
    if (deviceType === "Keyboard") {
      return this.captureService.captureKeyboard(event)?.binding || "";
    }
    if (event.type === "wheel") {
      return this.captureService.captureWheel(event)?.binding || "";
    }
    return this.captureService.captureMouse(event)?.binding || "";
  }

  beginPhysicalInputCapture(target) {
    const deviceType = target.dataset.accountUserControlsCaptureDevice || "";
    if (deviceType !== "Keyboard" && deviceType !== "Mouse") {
      return;
    }
    const previousValue = target.value;
    this.clearInputCapture({ restore: true });
    target.value = "";
    target.focus();
    const captureLabel = deviceType === "Keyboard" ? "keyboard key" : "mouse input";
    this.setStatus(`Waiting for ${captureLabel}. Previous value returns after 5 seconds with no input.`);
    const listeners = [];
    const finishCapture = (event) => {
      event.preventDefault();
      event.stopPropagation();
      const binding = this.capturedInputBinding(deviceType, event);
      if (!binding) {
        return;
      }
      this.clearInputCapture();
      if (target.isConnected) {
        target.value = binding;
        target.focus();
        if (deviceType === "Mouse" && event.type === "mousedown") {
          target.dataset.accountUserControlsSuppressCaptureClick = "true";
          window.setTimeout(() => {
            if (target.isConnected) {
              delete target.dataset.accountUserControlsSuppressCaptureClick;
            }
          }, INPUT_CAPTURE_CLICK_SUPPRESSION_MS);
        }
      }
      this.setStatus(`Captured ${binding}. Save the profile to keep it.`);
    };
    const timeout = window.setTimeout(() => {
      this.clearInputCapture({ restore: true });
      this.setStatus(`No ${captureLabel} captured. Restored ${previousValue}.`);
    }, INPUT_CAPTURE_TIMEOUT_MS);
    this.inputCapture = {
      listeners,
      previousValue,
      target,
      timer: timeout,
    };
    window.setTimeout(() => {
      if (!this.inputCapture || this.inputCapture.target !== target) {
        return;
      }
      const types = deviceType === "Keyboard" ? ["keydown"] : ["mousedown", "wheel"];
      types.forEach((type) => {
        window.addEventListener(type, finishCapture, true);
        listeners.push({ handler: finishCapture, type });
      });
    }, 0);
  }

  saveEditingProfile() {
    this.clearInputCapture();
    const profile = this.profileFromEditingRow();
    const validation = this.validateProfile(profile);
    this.renderInputValidation(validation);
    if (!validation.ok) {
      this.setStatus(`FAIL: ${validation.message}`);
      return;
    }
    if (this.duplicateProfileName(profile)) {
      this.setStatus(`FAIL: ${profile.mappingProfile} already exists for ${this.profileListFamily(profile)}.`);
      return;
    }
    const nextProfiles = this.editingProfile?.id && this.profiles.some((candidate) => candidate.id === this.editingProfile.id)
      ? this.profiles.map((candidate) => (candidate.id === this.editingProfile.id ? profile : candidate))
      : [...this.profiles, profile];
    if (!this.saveProfiles(nextProfiles)) {
      this.setStatus("FAIL: User Controls could not reach the shared DB adapter.");
      return;
    }
    this.editingProfile = null;
    this.renderProfiles();
    this.setStatus(`PASS: Saved ${profile.mappingProfile}.`);
  }

  handleListClick(event) {
    const physicalInputTarget = event.target instanceof Element
      ? event.target.closest("[data-account-user-controls-physical-input]")
      : null;
    if (physicalInputTarget instanceof HTMLInputElement) {
      if (physicalInputTarget.dataset.accountUserControlsSuppressCaptureClick === "true") {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      this.beginPhysicalInputCapture(physicalInputTarget);
      return;
    }
    const target = event.target instanceof Element ? event.target.closest("button") : null;
    if (!target) {
      return;
    }
    if (target.dataset.accountUserControlsSave !== undefined) {
      this.saveEditingProfile();
    } else if (target.dataset.accountUserControlsCancel !== undefined) {
      this.clearInputCapture({ restore: true });
      this.editingProfile = null;
      this.renderProfiles();
      this.setStatus("Canceled user control profile edit.");
    } else if (target.dataset.accountUserControlsEdit !== undefined) {
      this.clearInputCapture({ restore: true });
      const profile = this.profiles.find((candidate) => candidate.id === target.dataset.accountUserControlsEdit);
      if (profile) {
        this.editingProfile = { id: profile.id, values: profile };
        this.viewingDefaultFamily = "";
        this.renderProfiles();
        this.setStatus(`Editing ${profile.mappingProfile}.`);
      }
    } else if (target.dataset.accountUserControlsTrash !== undefined) {
      this.clearInputCapture({ restore: true });
      const profileId = target.dataset.accountUserControlsTrash || "";
      this.profiles = this.profiles.filter((profile) => profile.id !== profileId);
      this.saveProfiles(this.profiles);
      this.editingProfile = null;
      this.renderProfiles();
      this.setStatus("Deleted user control profile.");
    } else if (target.dataset.accountUserControlsViewDefault !== undefined) {
      const family = target.dataset.accountUserControlsViewDefault || "";
      this.viewingDefaultFamily = this.viewingDefaultFamily === family ? "" : family;
      this.renderProfiles();
      this.setStatus(`${family} Default Profile is read-only.`);
    }
  }

  handleListChange(event) {
    const selectedDeviceTarget = event.target instanceof Element
      ? event.target.closest("[data-account-user-controls-selected-device]")
      : null;
    if (selectedDeviceTarget instanceof HTMLInputElement) {
      this.handleSelectedInputDeviceChange(event);
      return;
    }
    this.setStatus("Unsaved user control profile changes.");
  }

  handleListInput(event) {
    const target = event.target instanceof HTMLInputElement ? event.target : null;
    if (target?.matches("[data-account-user-controls-sensitivity]")) {
      const valueLabel = target.parentElement?.querySelector("[data-slider-value-for='accountUserControlsSensitivity']");
      if (valueLabel) {
        valueLabel.textContent = rangeValueLabel(target.value, target.dataset.unit || "");
      }
    }
    this.setStatus("Unsaved user control profile changes.");
  }

  handleListDoubleClick(event) {
    const target = event.target instanceof HTMLInputElement ? event.target : null;
    if (!target?.matches("[data-account-user-controls-sensitivity]")) {
      return;
    }
    target.value = target.dataset.defaultValue || "100";
    const valueLabel = target.parentElement?.querySelector("[data-slider-value-for='accountUserControlsSensitivity']");
    if (valueLabel) {
      valueLabel.textContent = rangeValueLabel(target.value, target.dataset.unit || "");
    }
    target.dispatchEvent(new Event("input", { bubbles: true }));
  }
}
