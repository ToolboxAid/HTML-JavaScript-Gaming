export class RenderedExportActionsControl {
  constructor({ exportTargetTypeSelect, saveButton }) {
    this.exportTargetTypeSelect = exportTargetTypeSelect;
    this.saveButton = saveButton;
  }

  mount({ onExport }) {
    this.saveButton.addEventListener("click", (event) => {
      event.stopPropagation();
      onExport(this.exportTargetTypeSelect.value);
    });
  }
}
