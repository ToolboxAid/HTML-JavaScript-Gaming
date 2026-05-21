export class ActionSelectionControl {
  constructor({
    actionHint,
    actionSelect,
    addActionButton,
    clearActionButton,
    customActionInput,
    resetActionsButton
  }) {
    this.actionHint = actionHint;
    this.actionSelect = actionSelect;
    this.addActionButton = addActionButton;
    this.clearActionButton = clearActionButton;
    this.customActionInput = customActionInput;
    this.resetActionsButton = resetActionsButton;
  }

  mount({ onActionChanged, onAddAction, onClearAction, onResetActions }) {
    this.actionSelect.addEventListener("change", () => onActionChanged(this.actionSelect.value));
    this.addActionButton.addEventListener("click", () => {
      onAddAction(this.customActionInput.value);
      this.customActionInput.value = "";
    });
    this.clearActionButton.addEventListener("click", () => onClearAction());
    this.resetActionsButton.addEventListener("click", () => onResetActions());
  }

  render(actions, selectedActionId) {
    this.actionSelect.replaceChildren(...actions.map((action) => {
      const option = document.createElement("option");
      option.value = action.id;
      option.textContent = action.label;
      option.selected = action.id === selectedActionId;
      return option;
    }));
    this.actionHint.textContent = `${actions.length} actions available. Pause is not part of the default action set.`;
  }
}
