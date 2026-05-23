export class PreviewPanelControl {
  constructor({ deleteActionButton, deleteMappingsButton, output }) {
    this.deleteActionButton = deleteActionButton;
    this.deleteMappingsButton = deleteMappingsButton;
    this.output = output;
    this.onDeleteAction = () => {};
    this.onDeleteMappings = () => {};
    this.onSelectAction = () => {};
  }

  mount({ onDeleteAction, onDeleteMappings, onSelectAction }) {
    this.onDeleteAction = onDeleteAction;
    this.onDeleteMappings = onDeleteMappings;
    this.onSelectAction = onSelectAction;
    this.deleteActionButton.addEventListener("click", () => {
      this.onDeleteAction();
    });
    this.deleteMappingsButton.addEventListener("click", () => {
      this.onDeleteMappings();
    });
  }

  render(actions, selectedActionId, activeInputBindings = new Set()) {
    const visibleActions = actions.filter((action) => action.tileVisible || action.inputs.length > 0);
    if (!visibleActions.length) {
      this.output.replaceChildren(this.createEmptyState());
      return;
    }
    this.output.replaceChildren(...visibleActions.map((action) => this.createActionCard(action, selectedActionId, activeInputBindings)));
  }

  createActionCard(action, selectedActionId, activeInputBindings) {
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
      tokens.append(...action.inputs.map((input) => this.createInputToken(action.id, input, isSelected, activeInputBindings)));
    }

    card.append(actionLabel, tokens);
    return card;
  }

  createInputToken(actionId, input, isSelected, activeInputBindings) {
    const token = document.createElement("span");
    const isActive = activeInputBindings.has(input.binding);
    token.className = [
      "input-mapping-v2__input-token",
      isSelected ? "is-selected-mapping-input" : "",
      isActive ? "is-action-active" : ""
    ].filter(Boolean).join(" ");
    token.textContent = inputLabelLines(input).join("\n");
    token.title = input.title || input.label;
    token.ariaCurrent = isSelected ? "true" : "false";
    token.dataset.inputMappingActionId = actionId;
    token.dataset.inputMappingBinding = input.binding;
    token.dataset.inputMappingActionActive = isActive ? "true" : "false";
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
