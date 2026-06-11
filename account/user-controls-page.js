import { createControlsToolApiRepository } from "../toolbox/controls/controls-api-client.js";
import InputService from "../src/engine/input/InputService.js";
import { gamepadProfileInputNames } from "../src/engine/input/GamepadInputClassifier.js";
import {
  normalizeProfileInputMappings,
  normalizedInputIsAnalog,
  physicalInputIsAnalog,
} from "../src/engine/input/NormalizedInputRegistry.js";

const KEYBOARD_MOUSE_INPUTS = Object.freeze(["KeyW", "KeyA", "KeyS", "KeyD", "Space", "Enter", "Escape", "KeyP", "MouseButton0", "MouseButton2", "MouseWheelUp", "MouseWheelDown", "MouseX", "MouseY"]);
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

export class AccountUserControlsPage {
  constructor(root) {
    this.root = root;
    this.repository = createControlsToolApiRepository();
    this.inputService = new InputService({ target: window });
    this.profiles = [];
    this.editingProfile = null;
    this.elements = {
      addProfile: root.querySelector("[data-account-user-controls-add-profile]"),
      deviceSelect: root.querySelector("[data-account-user-controls-device]"),
      deviceStatus: root.querySelector("[data-account-user-controls-device-status]"),
      list: root.querySelector("[data-account-user-controls-list]"),
      refresh: root.querySelector("[data-account-user-controls-refresh]"),
      status: root.querySelector("[data-account-user-controls-status]"),
      types: root.querySelector("[data-account-user-controls-types]"),
    };
  }

  init() {
    this.inputService.attach();
    this.profiles = this.readProfiles();
    this.renderDeviceSelect();
    this.renderTypes();
    this.renderProfiles();
    this.elements.refresh?.addEventListener("click", () => {
      this.renderDeviceSelect();
      this.setStatus("Device list refreshed.");
    });
    this.elements.addProfile?.addEventListener("click", () => this.addProfileForSelectedDevice());
    this.elements.deviceSelect?.addEventListener("change", () => this.renderDeviceStatus());
    this.elements.list?.addEventListener("click", (event) => this.handleListClick(event));
    this.elements.list?.addEventListener("change", (event) => this.handleListChange(event));
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

  availableGamepads() {
    this.inputService.update();
    return this.inputService.getGamepads();
  }

  deviceOptions() {
    const keyboardMouse = {
      controllerId: "keyboard-mouse",
      controllerName: "Keyboard/Mouse",
      deviceType: "Keyboard/Mouse",
      inputs: [...KEYBOARD_MOUSE_INPUTS],
      label: "Keyboard/Mouse",
      mappingProfile: "Keyboard/Mouse Profile",
      value: "keyboard-mouse",
    };
    const gamepads = this.availableGamepads().map((gamepad) => {
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
    return [keyboardMouse, ...gamepads];
  }

  selectedDevice() {
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
    let result = this.repository.listControllerProfiles();
    if (Array.isArray(result)) {
      return result.map((profile) => this.normalizeProfile(profile));
    }
    this.repository = createControlsToolApiRepository();
    result = this.repository.listControllerProfiles();
    return Array.isArray(result) ? result.map((profile) => this.normalizeProfile(profile)) : [];
  }

  saveProfiles(nextProfiles) {
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
    this.setStatus(result?.message || "WARN: Account user controls could not reach the shared DB adapter.");
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

  renderDeviceSelect() {
    if (!this.elements.deviceSelect) {
      return;
    }
    const selectedValue = this.elements.deviceSelect.value;
    const options = [
      { label: "Choose a physical controller", value: "" },
      ...this.deviceOptions().map((device) => ({ label: device.label, value: device.value })),
    ];
    this.elements.deviceSelect.classList.add("tool-form-control");
    this.elements.deviceSelect.replaceChildren(...options.map((option) => optionElement(option.value, option.label)));
    this.elements.deviceSelect.value = options.some((option) => option.value === selectedValue) ? selectedValue : "";
    this.renderDeviceStatus();
  }

  renderDeviceStatus() {
    const device = this.selectedDevice();
    if (!device) {
      this.setDeviceStatus("Choose a physical controller before creating a user control profile.");
      return;
    }
    this.setDeviceStatus(`${device.label} selected. Create a user control profile to map physical inputs to normalized controls.`);
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

  renderProfiles() {
    if (!this.elements.list) {
      return;
    }
    const rows = [];
    if (this.editingProfile) {
      rows.push(...this.renderEditingRows(this.editingProfile.values));
    }
    const visibleProfiles = this.editingProfile?.id
      ? this.profiles.filter((profile) => profile.id !== this.editingProfile.id)
      : this.profiles;
    rows.push(...visibleProfiles.map((profile) => this.renderProfileRow(profile)));
    if (!rows.length) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 6;
      cell.textContent = "No account user control profiles saved yet.";
      row.append(cell);
      rows.push(row);
    }
    this.elements.list.replaceChildren(...rows);
    if (this.elements.addProfile) {
      this.elements.addProfile.disabled = Boolean(this.editingProfile);
    }
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

  renderProfileRow(profile) {
    const row = document.createElement("tr");
    row.dataset.accountUserControlsProfileRow = profile.id;
    row.append(
      tableCell(`${profile.deviceType}: ${profile.controllerName}`),
      tableCell(`${profile.inputMappings.length} Physical Inputs`),
      tableCell(this.profileInputSummary(profile)),
      tableCell(this.profileAnalogSummary(profile)),
      tableCell(profile.inputMappings.some((mapping) => mapping.invert) ? "Invert configured" : "No invert"),
    );
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
    const wrapper = document.createElement("div");
    wrapper.className = "content-grid";
    wrapper.dataset.accountUserControlsInputPair = "true";
    const label = document.createElement("strong");
    label.textContent = inputMapping.physicalInput;
    const stack = document.createElement("div");
    stack.className = "content-stack content-stack--compact";
    const normalizedOptions = [
      { label: "Unassigned", value: "" },
      ...this.inputService.getNormalizedInputOptions(),
    ];
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
    if (physicalInputIsAnalog(inputMapping.physicalInput) || normalizedInputIsAnalog(inputMapping.normalizedInput)) {
      const deadzone = document.createElement("input");
      deadzone.type = "number";
      deadzone.min = "0";
      deadzone.max = "1";
      deadzone.step = "0.05";
      deadzone.value = String(inputMapping.deadzone);
      deadzone.dataset.accountUserControlsDeadzone = String(index);
      const invert = document.createElement("input");
      invert.type = "checkbox";
      invert.checked = Boolean(inputMapping.invert);
      invert.dataset.accountUserControlsInvert = String(index);
      stack.append(labeledControl("Deadzone", deadzone), labeledControl("Invert", invert));
    }
    wrapper.append(label, stack);
    return wrapper;
  }

  renderEditingRows(values = {}) {
    const profile = this.normalizeProfile(values);
    const row = document.createElement("tr");
    row.dataset.accountUserControlsEditingRow = "true";
    const actions = document.createElement("td");
    const group = document.createElement("div");
    group.className = "action-group action-group--tight";
    group.append(
      actionButton("Save", "accountUserControlsSave"),
      actionButton("Cancel", "accountUserControlsCancel"),
    );
    actions.append(group);
    row.append(
      tableCell(`${profile.deviceType}: ${profile.controllerName}`),
      tableCell(`${profile.inputMappings.length} Physical Inputs`),
      tableCell(this.profileInputSummary(profile)),
      tableCell(this.profileAnalogSummary(profile)),
      tableCell(profile.inputMappings.some((mapping) => mapping.invert) ? "Invert configured" : "No invert"),
      actions,
    );

    const detailsRow = document.createElement("tr");
    detailsRow.dataset.accountUserControlsEditingDetails = "true";
    const detailsCell = document.createElement("td");
    detailsCell.colSpan = 6;
    const grid = document.createElement("div");
    grid.className = "content-grid content-grid--three";
    grid.append(...profile.inputMappings.map((inputMapping, index) => this.inputControl(profile, inputMapping, index)));
    detailsCell.append(grid);
    detailsRow.append(detailsCell);
    return [row, detailsRow];
  }

  addProfileForSelectedDevice() {
    const device = this.selectedDevice();
    if (!device) {
      this.setStatus("WARN: Choose a physical controller before creating a user control profile.");
      return;
    }
    const existing = this.profiles.find((profile) => profile.deviceType === device.deviceType && profile.controllerId === device.controllerId);
    if (existing) {
      this.editingProfile = { id: existing.id, values: existing };
      this.renderProfiles();
      this.setStatus(`Editing existing ${existing.mappingProfile}.`);
      return;
    }
    const profile = this.profileFromDevice(device);
    this.editingProfile = { id: profile.id, values: profile };
    this.renderProfiles();
    this.setStatus(`Review ${profile.mappingProfile} before saving.`);
  }

  profileFromEditingRow() {
    const values = this.editingProfile?.values || {};
    const details = this.elements.list?.querySelector("[data-account-user-controls-editing-details]");
    const inputMappings = (values.inputMappings || []).map((mapping, index) => {
      const normalizedSelect = details?.querySelector(`[data-account-user-controls-input-normalized="${index}"]`);
      const negativeSelect = details?.querySelector(`[data-account-user-controls-input-negative="${index}"]`);
      const positiveSelect = details?.querySelector(`[data-account-user-controls-input-positive="${index}"]`);
      const deadzoneInput = details?.querySelector(`[data-account-user-controls-deadzone="${index}"]`);
      const invertInput = details?.querySelector(`[data-account-user-controls-invert="${index}"]`);
      const negativeNormalizedInput = normalizeText(negativeSelect?.value ?? mapping.negativeNormalizedInput);
      const positiveNormalizedInput = normalizeText(positiveSelect?.value ?? mapping.positiveNormalizedInput);
      return {
        deadzone: Number(deadzoneInput?.value ?? mapping.deadzone),
        invert: Boolean(invertInput?.checked ?? mapping.invert),
        negativeNormalizedInput,
        normalizedInput: positiveNormalizedInput || normalizeText(normalizedSelect?.value ?? mapping.normalizedInput) || negativeNormalizedInput,
        physicalInput: mapping.physicalInput,
        positiveNormalizedInput,
      };
    });
    return this.normalizeProfile({
      ...values,
      id: this.editingProfile?.id || "",
      inputMappings,
    });
  }

  saveEditingProfile() {
    const profile = this.profileFromEditingRow();
    const nextProfiles = this.editingProfile?.id && this.profiles.some((candidate) => candidate.id === this.editingProfile.id)
      ? this.profiles.map((candidate) => (candidate.id === this.editingProfile.id ? profile : candidate))
      : [profile, ...this.profiles];
    if (!this.saveProfiles(nextProfiles)) {
      return;
    }
    this.editingProfile = null;
    this.renderProfiles();
    this.setStatus(`Saved ${profile.mappingProfile}.`);
  }

  handleListClick(event) {
    const target = event.target instanceof Element ? event.target.closest("button") : null;
    if (!target) {
      return;
    }
    if (target.dataset.accountUserControlsSave !== undefined) {
      this.saveEditingProfile();
    } else if (target.dataset.accountUserControlsCancel !== undefined) {
      this.editingProfile = null;
      this.renderProfiles();
      this.setStatus("Canceled user control profile edit.");
    } else if (target.dataset.accountUserControlsEdit !== undefined) {
      const profile = this.profiles.find((candidate) => candidate.id === target.dataset.accountUserControlsEdit);
      if (profile) {
        this.editingProfile = { id: profile.id, values: profile };
        this.renderProfiles();
        this.setStatus(`Editing ${profile.mappingProfile}.`);
      }
    } else if (target.dataset.accountUserControlsTrash !== undefined) {
      const profileId = target.dataset.accountUserControlsTrash || "";
      this.profiles = this.profiles.filter((profile) => profile.id !== profileId);
      this.saveProfiles(this.profiles);
      this.editingProfile = null;
      this.renderProfiles();
      this.setStatus("Deleted user control profile.");
    }
  }

  handleListChange() {
    this.setStatus("Unsaved user control profile changes.");
  }
}
