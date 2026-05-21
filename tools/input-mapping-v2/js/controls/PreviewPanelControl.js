export class PreviewPanelControl {
  constructor(output) {
    this.output = output;
    this.onChangeTileAction = () => {};
    this.onDeleteBinding = () => {};
  }

  mount({ onChangeTileAction, onDeleteBinding }) {
    this.onChangeTileAction = onChangeTileAction;
    this.onDeleteBinding = onDeleteBinding;
  }

  render(actions) {
    const visibleActions = actions.filter((action) => action.tileVisible || action.inputs.length > 0);
    if (!visibleActions.length) {
      this.output.replaceChildren(this.createEmptyState());
      return;
    }
    this.output.replaceChildren(...visibleActions.map((action) => this.createActionCard(action, actions)));
  }

  createActionCard(action, actions) {
    const card = document.createElement("article");
    card.className = "input-mapping-v2__mapping-card";

    const actionField = document.createElement("label");
    actionField.className = "input-mapping-v2__tile-action-field";

    const actionLabel = document.createElement("span");
    actionLabel.textContent = "Captured Mappings Action";

    const actionSelect = document.createElement("select");
    actionSelect.className = "input-mapping-v2__tile-action-select";
    actionSelect.dataset.inputMappingTileActionId = action.id;
    actionSelect.append(...actions.map((entry) => {
      const option = document.createElement("option");
      option.value = entry.id;
      option.textContent = entry.label;
      option.selected = entry.id === action.id;
      return option;
    }));
    actionSelect.addEventListener("change", () => {
      this.onChangeTileAction({ actionId: action.id, nextActionId: actionSelect.value });
    });

    actionField.append(actionLabel, actionSelect);

    const tokens = document.createElement("div");
    tokens.className = "input-mapping-v2__token-list";
    if (!action.inputs.length) {
      const empty = document.createElement("span");
      empty.className = "input-mapping-v2__empty-token";
      empty.textContent = "No inputs captured.";
      tokens.append(empty);
    } else {
      tokens.append(...action.inputs.map((input) => this.createInputToken(action.id, input)));
    }

    card.append(actionField, tokens);
    return card;
  }

  createInputToken(actionId, input) {
    const token = document.createElement("button");
    token.type = "button";
    token.className = "input-mapping-v2__input-token";
    token.textContent = input.label;
    token.title = `Delete ${input.label}`;
    token.dataset.inputMappingActionId = actionId;
    token.dataset.inputMappingBinding = input.binding;
    token.addEventListener("click", () => {
      this.onDeleteBinding({ actionId, binding: input.binding });
    });
    return token;
  }

  createEmptyState() {
    const emptyState = document.createElement("p");
    emptyState.textContent = "No inputs captured yet.";
    return emptyState;
  }
}
