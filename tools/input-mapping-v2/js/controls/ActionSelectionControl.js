export class ActionSelectionControl {
  constructor({
    actionHint,
    actionSelect,
    addActionButton,
    clearActionButton,
    customActionInput,
    deleteActionButton,
    rumbleFeedbackCheckbox
  }) {
    this.actionHint = actionHint;
    this.actionSelect = actionSelect;
    this.addActionButton = addActionButton;
    this.clearActionButton = clearActionButton;
    this.customActionInput = customActionInput;
    this.deleteActionButton = deleteActionButton;
    this.rumbleFeedbackCheckbox = rumbleFeedbackCheckbox;
  }

  mount({ onActionChanged, onAddAction, onClearAction, onDeleteAction, onRumbleFeedbackChanged }) {
    this.actionSelect.addEventListener("change", () => onActionChanged(this.actionSelect.value));
    this.addActionButton.addEventListener("click", () => {
      onAddAction(this.customActionInput.value);
      this.customActionInput.value = "";
    });
    this.clearActionButton.addEventListener("click", () => onClearAction());
    this.deleteActionButton.addEventListener("click", () => onDeleteAction());
    this.rumbleFeedbackCheckbox.addEventListener("change", () => {
      onRumbleFeedbackChanged(this.rumbleFeedbackCheckbox.checked);
    });
  }

  render(actions, selectedActionId) {
    this.actionSelect.replaceChildren(...actions.map((action) => {
      const option = document.createElement("option");
      option.value = action.id;
      option.textContent = action.label;
      option.disabled = action.tileVisible;
      option.selected = action.id === selectedActionId;
      return option;
    }));
    const availableCount = actions.filter((action) => !action.tileVisible).length;
    this.actionHint.textContent = `${availableCount} actions available. Created action tiles are single-instance.`;
  }
}
