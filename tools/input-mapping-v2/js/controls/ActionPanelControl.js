export class ActionPanelControl {
  constructor(rootDocument) {
    this.select = rootDocument.getElementById("inputMappingV2ActionSelect");
    this.customInput = rootDocument.getElementById("inputMappingV2CustomActionInput");
    this.addButton = rootDocument.getElementById("inputMappingV2AddActionButton");
    this.clearButton = rootDocument.getElementById("inputMappingV2ClearSelectedButton");
    this.resetButton = rootDocument.getElementById("inputMappingV2ResetButton");
  }

  mount({ onActionChanged, onAddAction, onClearSelected, onReset }) {
    this.select?.addEventListener("change", () => onActionChanged(this.select.value));
    this.addButton?.addEventListener("click", () => {
      onAddAction(this.customInput?.value ?? "");
      if (this.customInput) {
        this.customInput.value = "";
      }
    });
    this.clearButton?.addEventListener("click", () => onClearSelected());
    this.resetButton?.addEventListener("click", () => onReset());
  }

  render(actions, selectedActionId) {
    if (!this.select) {
      return;
    }
    this.select.replaceChildren(...actions.map((action) => {
      const option = document.createElement("option");
      option.value = action.id;
      option.textContent = action.label;
      option.selected = action.id === selectedActionId;
      return option;
    }));
  }
}
