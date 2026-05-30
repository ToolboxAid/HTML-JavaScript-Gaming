import { setUnwiredControlState } from "./UnwiredControlState.js";

export class RenderedExportActionsControl {
  constructor({ exportTargetTypeLabel, exportTargetTypeSelect, saveButton }) {
    this.exportTargetTypeLabel = exportTargetTypeLabel;
    this.exportTargetTypeSelect = exportTargetTypeSelect;
    this.saveButton = saveButton;
  }

  mount({ onExport }) {
    this.updateSaveButtonLabel();
    this.markRenderedExportControlsWired();
    this.exportTargetTypeSelect.addEventListener("change", () => this.updateSaveButtonLabel());
    this.saveButton.addEventListener("click", (event) => {
      event.stopPropagation();
      onExport(this.exportTargetTypeSelect.value);
    });
  }

  updateSaveButtonLabel() {
    const format = String(this.exportTargetTypeSelect.value || "wav").trim().toUpperCase() || "WAV";
    const label = `Save ${format}`;
    this.saveButton.textContent = label;
    this.saveButton.setAttribute("aria-label", label);
  }

  markRenderedExportControlsWired() {
    [
      this.exportTargetTypeLabel,
      this.exportTargetTypeSelect,
      this.saveButton
    ].forEach((control) => {
      setUnwiredControlState(control, { active: false });
    });
  }
}
