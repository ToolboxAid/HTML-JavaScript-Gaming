import { createControlsToolApiRepository } from "../toolbox/controls/controls-api-client.js";
import InputService from "../src/engine/input/InputService.js";
import { gamepadProfileInputNames } from "../src/engine/input/GamepadInputClassifier.js";
import {
  normalizeProfileInputMappings,
  physicalInputSensitivityDescriptor,
  normalizedInputIsAnalog,
  physicalInputIsAnalog,
} from "../src/engine/input/NormalizedInputRegistry.js";

const DEVICE_POLL_INTERVAL_MS = 1200;
const KEYBOARD_INPUTS = Object.freeze(["KeyW", "KeyA", "KeyS", "KeyD", "Space", "Enter", "Escape", "KeyP"]);
const MOUSE_INPUTS = Object.freeze(["MouseButton0", "MouseButton2", "MouseX", "MouseY"]);
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

function rangeValueLabel(value, unit = "") {
  return `${value}${unit}`;
}

function physicalInputSupportsTuning(physicalInput) {
  return physicalInputIsAnalog(physicalInput) || Boolean(physicalInputSensitivityDescriptor(physicalInput));
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
    this.profiles = [];
    this.editingProfile = null;
    this.devicePollingTimer = null;
    this.elements = {
      addProfile: root.querySelector("[data-account-user-controls-add-profile]"),
      defaultLists: [...root.querySelectorAll("[data-account-user-controls-default-list]")],
      deviceSelect: root.querySelector("[data-account-user-controls-device]"),
      deviceStatus: root.querySelector("[data-account-user-controls-device-status]"),
      familyButtons: [...root.querySelectorAll("[data-account-user-controls-edit-family]")],
      lists: [...root.querySelectorAll("[data-account-user-controls-list]")],
      refresh: root.querySelector("[data-account-user-controls-refresh]"),
      status: root.querySelector("[data-account-user-controls-status]"),
      types: root.querySelector("[data-account-user-controls-types]"),
    };
  }

  init() {
    this.inputService.attach();
    this.profiles = this.readProfiles();
    this.renderDeviceSelect();
    this.renderDefaultFallbacks();
    this.renderTypes();
    this.renderProfiles();
    this.elements.refresh?.addEventListener("click", () => {
      this.renderDeviceSelect();
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
        label: `Gamepad: ${controllerName}`,
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
      { label: "Choose a game controller", value: "" },
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
      this.setDeviceStatus(this.deviceRefreshMessage());
      return;
    }
    this.setDeviceStatus(`${device.label} selected. Create a user control profile to map physical inputs to normalized controls. ${this.deviceRefreshMessage()}`);
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
          tableCell("Default profile in use"),
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

  renderProfiles() {
    if (!this.elements.lists.length) {
      return;
    }
    const rowsByFamily = new Map(this.elements.lists.map((list) => [
      list.dataset.accountUserControlsListFamily || "Gamepad",
      [],
    ]));
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
        cell.colSpan = 7;
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
    row.append(
      tableCell(`${profile.deviceType}: ${profile.controllerName}`),
      tableCell(`${profile.inputMappings.length} Physical Inputs`),
      tableCell(this.profileInputSummary(profile)),
      tableCell(this.profileAnalogSummary(profile)),
      tableCell(profile.inputMappings.some((mapping) => mapping.invert) ? "Invert configured" : "No invert"),
      tableCell(this.profileSensitivitySummary(profile)),
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
    const row = document.createElement("tr");
    row.dataset.accountUserControlsInputPair = "true";
    const editablePhysicalInput = profile.deviceType === "Keyboard" || profile.deviceType === "Mouse";
    const physicalInputControl = editablePhysicalInput
      ? document.createElement("input")
      : document.createElement("strong");
    const physicalInputCell = document.createElement("td");
    if (editablePhysicalInput) {
      physicalInputControl.type = "text";
      physicalInputControl.value = inputMapping.physicalInput;
      physicalInputControl.dataset.accountUserControlsPhysicalInput = String(index);
      physicalInputControl.setAttribute("aria-label", `${profile.deviceType} physical input`);
    } else {
      physicalInputControl.textContent = inputMapping.physicalInput;
    }
    physicalInputCell.append(physicalInputControl);
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
    const validation = document.createElement("p");
    validation.className = "status";
    validation.dataset.accountUserControlsInputValidation = String(index);
    stack.append(validation);

    const deadzoneCell = document.createElement("td");
    if (physicalInputSupportsTuning(inputMapping.physicalInput)) {
      const deadzone = document.createElement("input");
      deadzone.type = "number";
      deadzone.min = "0";
      deadzone.max = "1";
      deadzone.step = "0.05";
      deadzone.value = String(inputMapping.deadzone);
      deadzone.dataset.accountUserControlsDeadzone = String(index);
      deadzoneCell.append(deadzone);
    } else {
      deadzoneCell.textContent = "Not applicable";
    }

    const invertCell = document.createElement("td");
    if (physicalInputSupportsTuning(inputMapping.physicalInput)) {
      const invert = document.createElement("input");
      invert.type = "checkbox";
      invert.checked = Boolean(inputMapping.invert);
      invert.dataset.accountUserControlsInvert = String(index);
      invertCell.append(invert);
    } else {
      invertCell.textContent = "Not applicable";
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
      sensitivityCell.textContent = "Not applicable";
    }

    row.append(physicalInputCell, controlCell(stack), deadzoneCell, invertCell, sensitivityCell);
    return row;
  }

  renderEditingRows(values = {}) {
    const profile = this.normalizeProfile(values);
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
    row.append(
      controllerCell,
      tableCell(`${profile.inputMappings.length} Physical Inputs`),
      tableCell(this.profileInputSummary(profile)),
      tableCell(this.profileAnalogSummary(profile)),
      tableCell(profile.inputMappings.some((mapping) => mapping.invert) ? "Invert configured" : "No invert"),
      tableCell(this.profileSensitivitySummary(profile)),
      actions,
    );

    const detailsRow = document.createElement("tr");
    detailsRow.dataset.accountUserControlsEditingDetails = "true";
    const detailsCell = document.createElement("td");
    detailsCell.colSpan = 7;
    const wrapper = document.createElement("div");
    wrapper.className = "table-wrapper";
    const table = document.createElement("table");
    table.className = "data-table";
    table.dataset.accountUserControlsGeneratedInputTable = "true";
    table.setAttribute("aria-label", `${profile.controllerName} generated controller inputs`);
    const head = document.createElement("thead");
    const headRow = document.createElement("tr");
    ["Physical Input", "Normalized Control", "Deadzone", "Invert", "Sensitivity"].forEach((heading) => {
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

  editFamilyMappings(family) {
    const normalizedFamily = family === "Mouse" ? "Mouse" : "Keyboard";
    const device = this.familyDevice(normalizedFamily);
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

  renderInputValidation(validation) {
    const invalidIndexes = new Set(validation.invalidIndexes || []);
    this.root.querySelectorAll("[data-account-user-controls-input-validation]").forEach((status) => {
      const index = Number(status.dataset.accountUserControlsInputValidation);
      status.textContent = invalidIndexes.has(index)
        ? "Needs normalized control, valid deadzone, and valid sensitivity."
        : "";
    });
  }

  saveEditingProfile() {
    const profile = this.profileFromEditingRow();
    const validation = this.validateProfile(profile);
    this.renderInputValidation(validation);
    if (!validation.ok) {
      this.setStatus(`FAIL: ${validation.message}`);
      return;
    }
    const nextProfiles = this.editingProfile?.id && this.profiles.some((candidate) => candidate.id === this.editingProfile.id)
      ? this.profiles.map((candidate) => (candidate.id === this.editingProfile.id ? profile : candidate))
      : [profile, ...this.profiles];
    if (!this.saveProfiles(nextProfiles)) {
      this.setStatus("FAIL: Account user controls could not reach the shared DB adapter.");
      return;
    }
    this.editingProfile = null;
    this.renderProfiles();
    this.setStatus(`PASS: Saved ${profile.mappingProfile}.`);
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
