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

  addAction(label) {
    const actionLabel = String(label || "").trim();
    if (!actionLabel) {
      return this.addTileForSelectedAction();
    }
    const actionId = normalizeActionId(actionLabel);
    if (this.actionEntries.some((action) => action.id === actionId)) {
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
    action.tileVisible = true;
    this.syncInputMap();
    return { ok: true, message: `Added empty mapping tile for ${action.label}.` };
  }

  changeTileAction(actionId, nextActionId) {
    const action = this.actionEntries.find((candidate) => candidate.id === actionId);
    const nextAction = this.actionEntries.find((candidate) => candidate.id === nextActionId);
    if (!action || !nextAction) {
      return { ok: false, message: "Captured mapping tile action could not be changed because an action is missing." };
    }
    if (action.id === nextAction.id) {
      this.selectedActionId = nextAction.id;
      nextAction.tileVisible = true;
      return { ok: true, message: `Captured mapping tile remains assigned to ${nextAction.label}.` };
    }
    const movedCount = action.inputs.length;
    action.inputs.forEach((input) => {
      if (!nextAction.inputs.some((candidate) => candidate.binding === input.binding)) {
        nextAction.inputs.push({ ...input });
      }
    });
    action.inputs = [];
    action.tileVisible = false;
    nextAction.tileVisible = true;
    this.selectedActionId = nextAction.id;
    this.syncInputMap();
    return {
      ok: true,
      message: `Captured mapping tile changed from ${action.label} to ${nextAction.label}${movedCount ? ` with ${movedCount} input${movedCount === 1 ? "" : "s"}` : ""}.`
    };
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
    action.tileVisible = true;
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

function sortActions(actions) {
  return [...actions].sort((left, right) => left.label.localeCompare(right.label, undefined, { sensitivity: "base" }));
}
