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
      actions: this.actions().map((action) => ({
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
