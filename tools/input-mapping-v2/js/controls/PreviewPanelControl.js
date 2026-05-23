export class PreviewPanelControl {
  constructor({ deleteActionButton, deleteMappingsButton, output }) {
    this.deleteActionButton = deleteActionButton;
    this.deleteMappingsButton = deleteMappingsButton;
    this.output = output;
    this.onDeleteAction = () => {};
    this.onDeleteInput = () => {};
    this.onDeleteMappings = () => {};
    this.onSelectAction = () => {};
  }

  mount({ onDeleteAction, onDeleteInput, onDeleteMappings, onSelectAction }) {
    this.onDeleteAction = typeof onDeleteAction === "function" ? onDeleteAction : () => {};
    this.onDeleteInput = typeof onDeleteInput === "function" ? onDeleteInput : () => {};
    this.onDeleteMappings = typeof onDeleteMappings === "function" ? onDeleteMappings : () => {};
    this.onSelectAction = typeof onSelectAction === "function" ? onSelectAction : () => {};
    this.deleteActionButton.addEventListener("click", () => {
      this.onDeleteAction();
    });
    this.deleteMappingsButton.addEventListener("click", () => {
      this.onDeleteMappings();
    });
  }

  render(actions, selectedActionId) {
    const visibleActions = actions.filter((action) => action.tileVisible || action.inputs.length > 0);
    const selectedScrollTop = this.selectedCardScrollTop(selectedActionId);
    if (!visibleActions.length) {
      this.output.replaceChildren(this.createEmptyState());
      return;
    }
    this.output.replaceChildren(...visibleActions.map((action) => this.createActionCard(action, selectedActionId)));
    this.restoreSelectedCardScrollTop(selectedActionId, selectedScrollTop);
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
      tokens.append(...this.createInputTokens(action, isSelected));
    }

    card.append(actionLabel, tokens);
    return card;
  }

  createInputTokens(action, isSelected) {
    return action.inputs.map((input) => this.createInputToken(action, input, isSelected));
  }

  createInputToken(action, input, isSelected) {
    const token = document.createElement("span");
    const isActive = input.isActionActive === true;
    const tokenText = inputLabelLines(input).map(visibleInputLine).join(", ");
    token.className = [
      "input-mapping-v2__input-token",
      isSelected ? "is-selected-mapping-input" : "",
      isActive ? "is-action-active" : ""
    ].filter(Boolean).join(" ");
    token.textContent = tokenText;
    token.title = input.title || inputLabelLines(input).join("\n") || input.label;
    token.ariaCurrent = isSelected ? "true" : "false";
    token.role = "button";
    token.tabIndex = 0;
    token.setAttribute("aria-label", `Delete ${tokenText} from ${action.label}`);
    token.addEventListener("click", (event) => {
      event.stopPropagation();
      this.onDeleteInput(action.id, input.binding);
    });
    token.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      this.onDeleteInput(action.id, input.binding);
    });
    token.dataset.inputMappingActionId = action.id;
    token.dataset.inputMappingBinding = input.binding;
    token.dataset.inputMappingActionActive = isActive ? "true" : "false";
    return token;
  }

  createEmptyState() {
    const emptyState = document.createElement("p");
    emptyState.textContent = "No inputs captured yet.";
    return emptyState;
  }

  selectedCardScrollTop(selectedActionId) {
    const selectedCard = this.findActionCard(selectedActionId);
    return selectedCard ? selectedCard.scrollTop : null;
  }

  restoreSelectedCardScrollTop(selectedActionId, scrollTop) {
    if (!Number.isFinite(scrollTop)) {
      return;
    }
    const selectedCard = this.findActionCard(selectedActionId);
    if (selectedCard) {
      selectedCard.scrollTop = scrollTop;
    }
  }

  findActionCard(actionId) {
    if (!actionId) {
      return null;
    }
    return Array.from(this.output.querySelectorAll(".input-mapping-v2__mapping-card"))
      .find((card) => card.dataset.inputMappingTileActionId === actionId) ?? null;
  }
}

function inputLabelLines(input) {
  if (Array.isArray(input.displayLabelLines) && input.displayLabelLines.length) {
    return input.displayLabelLines.map((line) => String(line || "").trim()).filter(Boolean);
  }
  return [input.label];
}

function visibleInputLine(line) {
  return String(line || "").replaceAll("Game Controller", "GD");
}
