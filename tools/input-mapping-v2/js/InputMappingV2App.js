import { AccordionSection } from "./controls/AccordionSection.js";
import { ActionPanelControl } from "./controls/ActionPanelControl.js";
import { DeviceListControl } from "./controls/DeviceListControl.js";
import { JsonOutputControl } from "./controls/JsonOutputControl.js";
import { MappingListControl } from "./controls/MappingListControl.js";
import { StatusLogControl } from "./controls/StatusLogControl.js";

const TOOL_ID = "input-mapping-v2";

const DEFAULT_ACTIONS = [
  { id: "moveUp", label: "Move Up", inputs: [] },
  { id: "moveDown", label: "Move Down", inputs: [] },
  { id: "moveLeft", label: "Move Left", inputs: [] },
  { id: "moveRight", label: "Move Right", inputs: [] },
  { id: "primaryAction", label: "Primary Action", inputs: [] },
  { id: "secondaryAction", label: "Secondary Action", inputs: [] },
  { id: "pause", label: "Pause", inputs: [] }
];

export class InputMappingV2App {
  constructor(rootDocument) {
    this.document = rootDocument;
    this.window = rootDocument.defaultView;
    this.actions = cloneActions(DEFAULT_ACTIONS);
    this.selectedActionId = this.actions[0]?.id ?? "";
    this.captureMode = null;
    this.lastInput = null;

    this.banner = this.document.querySelector("[data-input-mapping-v2-banner]");
    this.lastInputElement = this.document.getElementById("inputMappingV2LastInput");
    this.captureStatusElement = this.document.getElementById("inputMappingV2CaptureStatus");
    this.selectedActionElement = this.document.getElementById("inputMappingV2SelectedAction");
    this.returnToWorkspaceButton = this.document.getElementById("returnToWorkspaceButton");

    this.actionPanel = new ActionPanelControl(this.document);
    this.mappingList = new MappingListControl(this.document.getElementById("inputMappingV2MappingList"));
    this.devices = new DeviceListControl(this.document.getElementById("inputMappingV2DeviceList"));
    this.jsonOutput = new JsonOutputControl(this.document.getElementById("inputMappingV2JsonOutput"));
    this.statusLog = new StatusLogControl({
      logElement: this.document.getElementById("statusLog"),
      clearButton: this.document.getElementById("inputMappingV2ClearStatusButton")
    });
  }

  start() {
    this.configureAccordions();
    this.configureLaunchMode();
    this.actionPanel.mount({
      onActionChanged: (actionId) => this.selectAction(actionId),
      onAddAction: (label) => this.addCustomAction(label),
      onClearSelected: () => this.clearSelectedAction(),
      onReset: () => this.resetDefaults()
    });
    this.document.getElementById("inputMappingV2CaptureKeyboardButton")?.addEventListener("click", () => this.startKeyboardCapture());
    this.document.getElementById("inputMappingV2CaptureGamepadButton")?.addEventListener("click", () => this.captureGamepadInput());
    this.document.getElementById("inputMappingV2RefreshDevicesButton")?.addEventListener("click", () => this.refreshDevices("OK"));
    this.document.getElementById("inputMappingV2CopyJsonButton")?.addEventListener("click", () => this.copyJson());
    this.window.addEventListener("keydown", (event) => this.handleKeyDown(event));
    this.window.addEventListener("gamepadconnected", () => this.refreshDevices("OK"));
    this.window.addEventListener("gamepaddisconnected", () => this.refreshDevices("WARN"));
    this.render();
    this.statusLog.ok("Input Mapping V2 ready.");
  }

  configureAccordions() {
    this.document.querySelectorAll("[data-accordion-section]").forEach((section) => {
      new AccordionSection(section).mount();
    });
  }

  configureLaunchMode() {
    const params = new URLSearchParams(this.window.location.search);
    const workspaceLaunch = params.get("launch") === "workspace" || params.get("fromTool") === "workspace-manager-v2";
    this.document.querySelectorAll("[data-launch-mode-nav='workspace']").forEach((element) => {
      element.hidden = !workspaceLaunch;
    });
    this.document.querySelectorAll("[data-launch-mode-nav='tool']").forEach((element) => {
      element.hidden = workspaceLaunch;
    });
    this.returnToWorkspaceButton?.addEventListener("click", () => this.returnToWorkspace(params));
  }

  returnToWorkspace(params) {
    const nextParams = new URLSearchParams();
    nextParams.set("returnFromTool", TOOL_ID);
    const hostContextId = params.get("hostContextId");
    if (hostContextId) {
      nextParams.set("hostContextId", hostContextId);
    }
    if (params.get("workspaceMode") === "uat") {
      nextParams.set("workspace", "uat");
    }
    this.window.location.href = `../workspace-manager-v2/index.html?${nextParams.toString()}`;
  }

  startKeyboardCapture() {
    if (!this.selectedActionId) {
      this.statusLog.fail("Select an action before capturing keyboard input.");
      return;
    }
    this.captureMode = "keyboard";
    this.setStatus("Press a keyboard key to bind it to the selected action.");
    this.statusLog.ok(`Keyboard capture armed for ${this.selectedActionLabel()}.`);
  }

  handleKeyDown(event) {
    if (this.captureMode !== "keyboard") {
      return;
    }
    event.preventDefault();
    this.captureMode = null;
    const input = {
      type: "keyboard",
      code: event.code,
      key: event.key,
      label: `Keyboard ${event.code || event.key}`
    };
    this.addInputToSelectedAction(input);
  }

  captureGamepadInput() {
    if (!this.selectedActionId) {
      this.statusLog.fail("Select an action before capturing gamepad input.");
      return;
    }
    const gamepads = this.readGamepads();
    if (!gamepads.length) {
      this.setStatus("No connected gamepad detected.");
      this.statusLog.warn("Connect a gamepad before capturing gamepad input.");
      this.refreshDevices("WARN");
      return;
    }
    const captured = findActiveGamepadInput(gamepads);
    if (!captured) {
      this.setStatus("Press a gamepad button or move an axis, then capture again.");
      this.statusLog.warn("No active gamepad button or axis was detected.");
      this.refreshDevices("WARN");
      return;
    }
    this.addInputToSelectedAction(captured);
  }

  addInputToSelectedAction(input) {
    const action = this.actions.find((candidate) => candidate.id === this.selectedActionId);
    if (!action) {
      this.statusLog.fail("Selected action is no longer available.");
      return;
    }
    const duplicate = action.inputs.some((candidate) => candidate.type === input.type && candidate.code === input.code);
    this.lastInput = input;
    if (duplicate) {
      this.setStatus(`${input.label} is already mapped to ${action.label}.`);
      this.statusLog.warn(`${input.label} was already mapped to ${action.label}.`);
      this.render();
      return;
    }
    action.inputs.push(input);
    this.setStatus(`${input.label} mapped to ${action.label}.`);
    this.statusLog.ok(`${input.label} mapped to ${action.label}.`);
    this.render();
  }

  addCustomAction(label) {
    const normalizedId = normalizeActionId(label);
    if (!normalizedId) {
      this.statusLog.fail("Enter an action name before adding it.");
      return;
    }
    if (this.actions.some((action) => action.id === normalizedId)) {
      this.selectAction(normalizedId);
      this.statusLog.warn(`${label} already exists and is now selected.`);
      return;
    }
    const action = { id: normalizedId, label: label.trim(), inputs: [] };
    this.actions.push(action);
    this.selectedActionId = action.id;
    this.statusLog.ok(`Added action ${action.label}.`);
    this.render();
  }

  selectAction(actionId) {
    if (!this.actions.some((action) => action.id === actionId)) {
      return;
    }
    this.selectedActionId = actionId;
    this.render();
  }

  clearSelectedAction() {
    const action = this.actions.find((candidate) => candidate.id === this.selectedActionId);
    if (!action) {
      this.statusLog.fail("Select an action before clearing inputs.");
      return;
    }
    action.inputs = [];
    this.statusLog.ok(`Cleared inputs for ${action.label}.`);
    this.render();
  }

  resetDefaults() {
    this.actions = cloneActions(DEFAULT_ACTIONS);
    this.selectedActionId = this.actions[0]?.id ?? "";
    this.lastInput = null;
    this.captureMode = null;
    this.statusLog.ok("Reset input actions to defaults.");
    this.render();
  }

  refreshDevices(level = "OK") {
    this.devices.render(this.readDevices());
    const message = "Device list refreshed.";
    if (level === "WARN") {
      this.statusLog.warn(message);
    } else {
      this.statusLog.ok(message);
    }
  }

  readDevices() {
    const devices = [{ type: "keyboard", name: "Keyboard", detail: "Available through key capture." }];
    const gamepads = this.readGamepads();
    gamepads.forEach((gamepad) => {
      devices.push({
        type: "gamepad",
        name: gamepad.id || `Gamepad ${gamepad.index}`,
        detail: `Index ${gamepad.index} · ${gamepad.buttons.length} buttons · ${gamepad.axes.length} axes`
      });
    });
    if (!gamepads.length) {
      devices.push({ type: "gamepad", name: "No gamepad connected", detail: "Connect a controller and refresh devices." });
    }
    return devices;
  }

  readGamepads() {
    if (!this.window.navigator?.getGamepads) {
      return [];
    }
    return Array.from(this.window.navigator.getGamepads()).filter(Boolean);
  }

  payload() {
    return {
      toolId: TOOL_ID,
      version: 1,
      mappings: this.actions.map((action) => ({
        action: action.id,
        label: action.label,
        inputs: action.inputs.map((input) => ({ ...input }))
      }))
    };
  }

  async copyJson() {
    const text = JSON.stringify(this.payload(), null, 2);
    if (!this.window.navigator?.clipboard?.writeText) {
      this.statusLog.fail("Clipboard API is unavailable in this browser context.");
      return;
    }
    await this.window.navigator.clipboard.writeText(text);
    this.statusLog.ok("Copied mapping JSON to clipboard.");
  }

  selectedActionLabel() {
    return this.actions.find((action) => action.id === this.selectedActionId)?.label ?? "Unknown action";
  }

  setStatus(message) {
    if (this.banner) {
      this.banner.textContent = message;
    }
    if (this.captureStatusElement) {
      this.captureStatusElement.textContent = message;
    }
  }

  render() {
    this.actionPanel.render(this.actions, this.selectedActionId);
    this.mappingList.render(this.actions, this.selectedActionId);
    this.devices.render(this.readDevices());
    this.jsonOutput.render(this.payload());
    if (this.selectedActionElement) {
      this.selectedActionElement.textContent = `Selected action: ${this.selectedActionLabel()}`;
    }
    if (this.lastInputElement) {
      this.lastInputElement.textContent = this.lastInput ? JSON.stringify(this.lastInput, null, 2) : "No input captured yet.";
    }
  }
}

function cloneActions(actions) {
  return actions.map((action) => ({
    id: action.id,
    label: action.label,
    inputs: action.inputs.map((input) => ({ ...input }))
  }));
}

function normalizeActionId(label) {
  const value = String(label ?? "").trim();
  if (!value) {
    return "";
  }
  return value
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, character) => character.toUpperCase())
    .replace(/^[A-Z]/, (character) => character.toLowerCase());
}

function findActiveGamepadInput(gamepads) {
  for (const gamepad of gamepads) {
    const buttonIndex = gamepad.buttons.findIndex((button) => button.pressed || button.value > 0.5);
    if (buttonIndex >= 0) {
      return {
        type: "gamepad",
        code: `gamepad${gamepad.index}.button${buttonIndex}`,
        label: `Gamepad ${gamepad.index} Button ${buttonIndex}`
      };
    }
    const axisIndex = gamepad.axes.findIndex((axis) => Math.abs(axis) > 0.5);
    if (axisIndex >= 0) {
      const direction = gamepad.axes[axisIndex] < 0 ? "-" : "+";
      return {
        type: "gamepad",
        code: `gamepad${gamepad.index}.axis${axisIndex}${direction}`,
        label: `Gamepad ${gamepad.index} Axis ${axisIndex} ${direction}`
      };
    }
  }
  return null;
}
