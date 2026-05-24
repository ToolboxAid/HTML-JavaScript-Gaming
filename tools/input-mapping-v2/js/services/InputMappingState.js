import InputMap from "/src/engine/input/InputMap.js";

const DEFAULT_ACTIONS = Object.freeze([
  { id: "cancel", label: "Cancel" },
  { id: "confirm", label: "Confirm" },
  { id: "fire", label: "Fire" },
  { id: "interact", label: "Interact" },
  { id: "jump", label: "Jump" },
  { id: "menu", label: "Menu" },
  { id: "moveDown", label: "Move Down" },
  { id: "moveLeft", label: "Move Left" },
  { id: "moveRight", label: "Move Right" },
  { id: "moveUp", label: "Move Up" },
  { id: "pause", label: "Pause" },
  { id: "primaryAction", label: "Primary Action" },
  { id: "rotateLeft", label: "Rotate Left" },
  { id: "rotateRight", label: "Rotate Right" },
  { id: "secondaryAction", label: "Secondary Action" },
  { id: "select", label: "Select" },
  { id: "start", label: "Start" },
  { id: "thrust", label: "Thrust" }
]);

export class InputMappingState {
  constructor({ defaultActions = DEFAULT_ACTIONS } = {}) {
    this.defaultActions = defaultActions;
    this.defaultActionIds = new Set(defaultActions.map((action) => action.id));
    this.selectedActionId = defaultActions[0]?.id ?? "";
    this.inputMap = new InputMap();
    this.actionEntries = [];
    this.reset();
  }

  reset() {
    this.actionEntries = sortActions(this.defaultActions.map((action) => ({
      id: action.id,
      label: action.label,
      inputs: [],
      tileVisible: false
    })));
    this.selectedActionId = this.actionEntries[0]?.id ?? "";
    this.syncInputMap();
  }

  loadPayload(payload) {
    const mappedActions = Array.isArray(payload?.actions)
      ? payload.actions
        .map(payloadActionEntry)
        .filter((action) => action.id && action.label && action.inputs.length > 0)
      : [];
    if (!mappedActions.length) {
      return {
        ok: false,
        message: "Workspace launch data did not include any non-empty Input Mapping V2 actions."
      };
    }
    this.actionEntries = sortActions(mappedActions);
    this.selectedActionId = this.actionEntries[0]?.id ?? "";
    this.syncInputMap();
    return {
      ok: true,
      actionCount: this.actionEntries.length,
      inputCount: this.actionEntries.reduce((count, action) => count + action.inputs.length, 0),
      message: `Loaded ${this.actionEntries.length} source-derived action mapping${this.actionEntries.length === 1 ? "" : "s"} from Workspace Manager launch data.`
    };
  }

  actions() {
    return this.actionEntries.map((action) => ({
      id: action.id,
      label: action.label,
      inputs: action.inputs.map((input) => ({ ...input })),
      tileVisible: action.tileVisible === true
    }));
  }

  selectAction(actionId) {
    if (this.actionEntries.some((action) => action.id === actionId)) {
      this.selectedActionId = actionId;
    }
  }

  selectedAction() {
    return this.actionEntries.find((action) => action.id === this.selectedActionId) ?? null;
  }

  selectedActionLabel() {
    return this.selectedAction()?.label ?? "Unknown action";
  }

  selectedActionHasTile() {
    return this.selectedAction()?.tileVisible === true;
  }

  addAction(label) {
    const actionLabel = String(label || "").trim();
    if (!actionLabel) {
      return this.addTileForSelectedAction();
    }
    const actionId = normalizeActionId(actionLabel);
    const existingAction = this.actionEntries.find((action) => action.id === actionId);
    if (existingAction) {
      this.selectedActionId = actionId;
      return this.addTileForSelectedAction();
    }
    this.actionEntries.push({ id: actionId, label: actionLabel, inputs: [], tileVisible: true });
    this.actionEntries = sortActions(this.actionEntries);
    this.selectedActionId = actionId;
    this.syncInputMap();
    return { ok: true, message: `Added empty mapping tile for ${actionLabel}.` };
  }

  addTileForSelectedAction() {
    const action = this.selectedAction();
    if (!action) {
      return { ok: false, message: "Select an action before adding a mapping tile." };
    }
    if (action.tileVisible) {
      return { ok: false, message: `${action.label} already has an action tile. Delete it before creating another.` };
    }
    action.tileVisible = true;
    this.syncInputMap();
    return { ok: true, message: `Added empty mapping tile for ${action.label}.` };
  }

  addBindingToSelectedAction(input) {
    const action = this.selectedAction();
    if (!action) {
      return { ok: false, message: "Select an action before capturing input." };
    }
    if (!action.tileVisible) {
      return { ok: false, message: "Capture requires an existing selected mapping tile. Select an action and click Add before capturing input." };
    }
    if (action.inputs.some((candidate) => candidate.binding === input.binding)) {
      return { ok: false, message: `${input.label} is already mapped to ${action.label}.` };
    }
    action.inputs.push({ ...input });
    this.syncInputMap();
    return { ok: true, message: `${input.label} mapped to ${action.label}.` };
  }

  deleteSelectedAction() {
    const action = this.selectedAction();
    if (!action) {
      return { ok: false, message: "Select an action before deleting it." };
    }
    if (!action.tileVisible && action.inputs.length === 0) {
      return { ok: false, message: `${action.label} does not have an action tile to delete.` };
    }

    const deletedLabel = action.label;
    if (this.defaultActionIds.has(action.id)) {
      action.inputs = [];
      action.tileVisible = false;
    } else {
      this.actionEntries = this.actionEntries.filter((candidate) => candidate.id !== action.id);
    }

    this.selectedActionId = this.nextSelectableActionId() ?? this.actionEntries[0]?.id ?? "";
    this.syncInputMap();
    return { ok: true, message: `Deleted action tile for ${deletedLabel}.` };
  }

  deleteSelectedMappings() {
    const action = this.selectedAction();
    if (!action) {
      return { ok: false, message: "Select an action before deleting its mappings." };
    }
    if (!action.tileVisible) {
      return { ok: false, message: `${action.label} does not have an action tile.` };
    }
    if (!action.inputs.length) {
      return { ok: false, message: `${action.label} has no action mappings to delete.` };
    }
    action.inputs = [];
    action.tileVisible = true;
    this.syncInputMap();
    return { ok: true, message: `Deleted action mappings from ${action.label}.` };
  }

  deleteActionInput(actionId, binding) {
    const action = this.actionEntries.find((candidate) => candidate.id === actionId) ?? null;
    if (!action) {
      return { ok: false, message: "Select an action before deleting an action mapping." };
    }
    const input = action.inputs.find((candidate) => candidate.binding === binding) ?? null;
    if (!input) {
      this.selectedActionId = action.id;
      return { ok: false, message: `${action.label} does not have that action mapping.` };
    }

    action.inputs = action.inputs.filter((candidate) => candidate.binding !== binding);
    action.tileVisible = true;
    this.selectedActionId = action.id;
    this.syncInputMap();
    return { ok: true, message: `Deleted ${input.label} from ${action.label}.` };
  }

  payload() {
    return {
      toolId: "input-mapping-v2",
      version: 1,
      engineInputModel: "src/engine/input/InputMap",
      actions: this.actions()
        .filter((action) => action.inputs.length > 0)
        .map((action) => ({
          action: action.id,
          label: action.label,
          inputs: action.inputs.map(schemaInput)
        }))
    };
  }

  toolState() {
    return {
      toolId: "input-mapping-v2",
      version: 1,
      payload: this.payload()
    };
  }

  syncInputMap() {
    const bindings = Object.fromEntries(this.actionEntries.map((action) => [
      action.id,
      action.inputs.map((input) => input.binding)
    ]));
    this.inputMap.setBindings(bindings);
  }

  nextSelectableActionId() {
    return this.actionEntries.find((action) => !action.tileVisible)?.id ?? null;
  }
}

function normalizeActionId(label) {
  return String(label || "")
    .trim()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, character) => character.toUpperCase())
    .replace(/^[A-Z]/, (character) => character.toLowerCase());
}

function sortActions(actions) {
  return [...actions].sort((left, right) => left.label.localeCompare(right.label, undefined, { sensitivity: "base" }));
}

function schemaInput(input) {
  return {
    source: input.source,
    binding: input.binding,
    label: input.label,
    engine: input.engine
  };
}

function payloadActionEntry(action) {
  return {
    id: String(action?.action || "").trim(),
    label: String(action?.label || action?.action || "").trim(),
    inputs: Array.isArray(action?.inputs)
      ? action.inputs.map(payloadInputEntry).filter((input) => input.binding)
      : [],
    tileVisible: true
  };
}

function payloadInputEntry(input) {
  const source = String(input?.source || "").trim();
  const binding = String(input?.binding || "").trim();
  const label = String(input?.label || "").trim();
  const displayLabelLines = displayLabelLinesForPayloadInput({ binding, label, source });
  return {
    source,
    binding,
    label: label || displayLabelLines.join(" "),
    engine: String(input?.engine || "").trim(),
    displayLabelLines,
    title: displayLabelLines.join("\n")
  };
}

function displayLabelLinesForPayloadInput({ binding, label, source }) {
  if (source === "keyboard") {
    return ["Keyboard", baseBinding(binding), keyboardGestureLabel(binding, label)];
  }
  if (source === "gamepad") {
    return ["Game Controller", gamepadInputLabel(binding, label), gamepadGestureLabel(binding, label)];
  }
  if (source === "mouse") {
    return ["Mouse", mouseInputLabel(binding, label), mouseGestureLabel(binding, label)];
  }
  return [label || binding].filter(Boolean);
}

function baseBinding(binding) {
  return String(binding || "").split(":")[0];
}

function suffix(binding) {
  return String(binding || "").split(":").at(-1) || "";
}

function keyboardGestureLabel(binding, label) {
  const gesture = suffix(binding);
  if (gesture === "KeyboardHold" || /\bHold\b/i.test(label)) {
    return "Hold";
  }
  if (gesture === "KeyboardRelease" || /\bRelease\b/i.test(label)) {
    return "Release";
  }
  return "Press";
}

function gamepadGestureLabel(binding, label) {
  const gesture = suffix(binding);
  const labels = {
    GameControllerButtonPress: "Btn Press",
    GameControllerButtonHold: "Btn Hold",
    GameControllerButtonRelease: "Btn Release",
    GameControllerDPad: "DPad",
    GameControllerStick: "Stick",
    GameControllerTrigger: "Trigger"
  };
  if (labels[gesture]) {
    return labels[gesture];
  }
  const match = String(label || "").match(/\b(Btn Press|Btn Hold|Btn Release|DPad|Stick|Trigger)\b/i);
  return match?.[1] ?? "Button";
}

function gamepadInputLabel(binding, label) {
  const axisMatch = String(binding || "").match(/^Pad\d+:Axis(\d+)([+-]?)/);
  if (axisMatch) {
    return `Axis ${axisMatch[1]}${axisMatch[2] || ""}`;
  }
  const buttonMatch = String(binding || "").match(/^Pad\d+:Button(\d+)/);
  if (!buttonMatch) {
    return label.replace(/^Game Controller\s+/i, "").replace(/\s+(?:Btn Press|Btn Hold|Btn Release|DPad|Stick|Trigger)$/i, "").trim() || binding;
  }
  const buttonIndex = Number(buttonMatch[1]);
  const dpadLabels = {
    12: "DPad Up",
    13: "DPad Down",
    14: "DPad Left",
    15: "DPad Right"
  };
  return dpadLabels[buttonIndex] || `Button ${buttonIndex}`;
}

function mouseGestureLabel(binding, label) {
  if (suffix(binding) === "MouseDoubleClick" || /\bDouble Click\b/i.test(label)) {
    return "Double Click";
  }
  if (suffix(binding) === "MousePrimaryDragRelease" || /\bDrag Release\b/i.test(label)) {
    return "Drag Release";
  }
  if (suffix(binding) === "MousePrimaryDrag" || /\bDrag\b/i.test(label)) {
    return "Drag";
  }
  if (/Wheel/i.test(binding) || /Wheel/i.test(label)) {
    return "Wheel";
  }
  return "Click";
}

function mouseInputLabel(binding, label) {
  const buttonMatch = String(binding || "").match(/^MouseButton(\d+)/);
  if (!buttonMatch) {
    return label.replace(/^Mouse\s+/i, "").trim() || binding;
  }
  const buttonNumber = Number(buttonMatch[1]);
  if (buttonNumber === 0) {
    return "Left Button";
  }
  if (buttonNumber === 1) {
    return "Middle Button";
  }
  if (buttonNumber === 2) {
    return "Right Button";
  }
  return `Button ${buttonNumber + 1}`;
}
