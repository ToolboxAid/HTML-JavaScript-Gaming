import InputMap from "/src/engine/input/InputMap.js";

const DEFAULT_ACTIONS = Object.freeze([
  { id: "moveUp", label: "Move Up" },
  { id: "moveDown", label: "Move Down" },
  { id: "moveLeft", label: "Move Left" },
  { id: "moveRight", label: "Move Right" },
  { id: "confirm", label: "Confirm" },
  { id: "cancel", label: "Cancel" },
  { id: "primaryAction", label: "Primary Action" },
  { id: "secondaryAction", label: "Secondary Action" },
  { id: "menu", label: "Menu" },
  { id: "interact", label: "Interact" },
  { id: "jump", label: "Jump" },
  { id: "fire", label: "Fire" },
  { id: "thrust", label: "Thrust" },
  { id: "rotateLeft", label: "Rotate Left" },
  { id: "rotateRight", label: "Rotate Right" }
]);

export class InputMappingState {
  constructor({ defaultActions = DEFAULT_ACTIONS } = {}) {
    this.defaultActions = defaultActions;
    this.selectedActionId = defaultActions[0]?.id ?? "";
    this.inputMap = new InputMap();
    this.actionEntries = [];
    this.reset();
  }

  reset() {
    this.actionEntries = this.defaultActions.map((action) => ({
      id: action.id,
      label: action.label,
      inputs: []
    }));
    this.selectedActionId = this.actionEntries[0]?.id ?? "";
    this.syncInputMap();
  }

  actions() {
    return this.actionEntries.map((action) => ({
      id: action.id,
      label: action.label,
      inputs: action.inputs.map((input) => ({ ...input }))
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

  addAction(label) {
    const actionLabel = String(label || "").trim();
    const actionId = normalizeActionId(actionLabel);
    if (!actionId) {
      return { ok: false, message: "Enter an action name before adding it." };
    }
    if (this.actionEntries.some((action) => action.id === actionId)) {
      this.selectedActionId = actionId;
      return { ok: false, message: `${actionLabel} already exists and is now selected.` };
    }
    this.actionEntries.push({ id: actionId, label: actionLabel, inputs: [] });
    this.selectedActionId = actionId;
    this.syncInputMap();
    return { ok: true, message: `Added action ${actionLabel}.` };
  }

  addBindingToSelectedAction(input) {
    const action = this.selectedAction();
    if (!action) {
      return { ok: false, message: "Select an action before capturing input." };
    }
    if (action.inputs.some((candidate) => candidate.binding === input.binding)) {
      return { ok: false, message: `${input.label} is already mapped to ${action.label}.` };
    }
    action.inputs.push({ ...input });
    this.syncInputMap();
    return { ok: true, message: `${input.label} mapped to ${action.label}.` };
  }

  removeBinding(actionId, binding) {
    const action = this.actionEntries.find((candidate) => candidate.id === actionId);
    if (!action) {
      return { ok: false, message: "Captured input could not be deleted because the action no longer exists." };
    }
    const beforeCount = action.inputs.length;
    action.inputs = action.inputs.filter((input) => input.binding !== binding);
    if (action.inputs.length === beforeCount) {
      return { ok: false, message: `Captured input ${binding} was not found.` };
    }
    this.syncInputMap();
    return { ok: true, message: `Deleted captured input ${binding} from ${action.label}.` };
  }

  clearSelectedAction() {
    const action = this.selectedAction();
    if (!action) {
      return { ok: false, message: "Select an action before clearing inputs." };
    }
    action.inputs = [];
    this.syncInputMap();
    return { ok: true, message: `Cleared inputs for ${action.label}.` };
  }

  payload() {
    return {
      toolId: "input-mapping-v2",
      version: 1,
      engineInputModel: "src/engine/input/InputMap",
      actions: this.actions().map((action) => ({
        action: action.id,
        label: action.label,
        inputs: action.inputs
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
}

function normalizeActionId(label) {
  return String(label || "")
    .trim()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, character) => character.toUpperCase())
    .replace(/^[A-Z]/, (character) => character.toLowerCase());
}
