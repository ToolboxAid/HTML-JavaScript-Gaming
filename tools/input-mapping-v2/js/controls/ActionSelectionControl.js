export class ActionSelectionControl {
  constructor({
    actionHint,
    actionSelect,
    addActionButton,
    clearActionButton,
    customActionInput
  }) {
    this.actionHint = actionHint;
    this.actionSelect = actionSelect;
    this.addActionButton = addActionButton;
    this.clearActionButton = clearActionButton;
    this.customActionInput = customActionInput;
  }

  mount({ onActionChanged, onAddAction, onClearAction }) {
    this.actionSelect.addEventListener("change", () => onActionChanged(this.actionSelect.value));
    this.addActionButton.addEventListener("click", () => {
      onAddAction(this.customActionInput.value);
      this.customActionInput.value = "";
    });
    this.clearActionButton.addEventListener("click", () => onClearAction());
  }

  render(actions, selectedActionId) {
    this.actionSelect.replaceChildren(...actions.map((action) => {
      const option = document.createElement("option");
      option.value = action.id;
      option.textContent = action.label;
      option.selected = action.id === selectedActionId;
      return option;
    }));
    this.actionHint.textContent = `${actions.length} actions available. Actions are sorted alphabetically.`;
  }
}
