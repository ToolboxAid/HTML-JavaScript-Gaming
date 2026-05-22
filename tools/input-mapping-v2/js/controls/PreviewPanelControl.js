export class PreviewPanelControl {
  constructor({ deleteAllButton, output }) {
    this.deleteAllButton = deleteAllButton;
    this.output = output;
    this.onDeleteAllMappings = () => {};
    this.onDeleteBinding = () => {};
    this.onSelectAction = () => {};
  }

  mount({ onDeleteAllMappings, onDeleteBinding, onSelectAction }) {
    this.onDeleteAllMappings = onDeleteAllMappings;
    this.onDeleteBinding = onDeleteBinding;
    this.onSelectAction = onSelectAction;
    this.deleteAllButton.addEventListener("click", () => {
      this.onDeleteAllMappings();
    });
  }

  render(actions, selectedActionId) {
    const visibleActions = actions.filter((action) => action.tileVisible || action.inputs.length > 0);
    if (!visibleActions.length) {
      this.output.replaceChildren(this.createEmptyState());
      return;
    }
    this.output.replaceChildren(...visibleActions.map((action) => this.createActionCard(action, selectedActionId)));
  }

  createActionCard(action, selectedActionId) {
    const card = document.createElement("article");
    const isSelected = action.id === selectedActionId;
    card.className = `input-mapping-v2__mapping-card${isSelected ? " is-selected" : ""}`;
    card.dataset.inputMappingTileActionId = action.id;
    card.tabIndex = 0;
    card.role = "button";
    card.ariaCurrent = isSelected ? "true" : "false";
    card.setAttribute("aria-label", `Select ${action.label} mapping`);
    card.addEventListener("click", () => {
      this.onSelectAction(action.id);
    });
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }
      event.preventDefault();
      this.onSelectAction(action.id);
    });

    const actionLabel = document.createElement("strong");
    actionLabel.className = "input-mapping-v2__tile-action-label";
    actionLabel.dataset.inputMappingTileActionId = action.id;
    actionLabel.textContent = action.label;

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

    card.append(actionLabel, tokens);
    return card;
  }

  createInputToken(actionId, input) {
    const token = document.createElement("button");
    token.type = "button";
    token.className = "input-mapping-v2__input-token";
    token.textContent = inputLabelLines(input).join("\n");
    token.title = input.title || input.label;
    token.dataset.inputMappingActionId = actionId;
    token.dataset.inputMappingBinding = input.binding;
    token.addEventListener("click", (event) => {
      event.stopPropagation();
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

function inputLabelLines(input) {
  if (Array.isArray(input.displayLabelLines) && input.displayLabelLines.length) {
    return input.displayLabelLines.map((line) => String(line || "").trim()).filter(Boolean);
  }
  return [input.label];
}
