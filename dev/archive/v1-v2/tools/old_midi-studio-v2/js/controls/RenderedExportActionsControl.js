import { setUnwiredControlState } from "./UnwiredControlState.js";

export class RenderedExportActionsControl {
  constructor({ exportTargetTypeLabel, exportTargetTypeSelect, saveButton }) {
    this.exportTargetTypeLabel = exportTargetTypeLabel;
    this.exportTargetTypeSelect = exportTargetTypeSelect;
    this.onFormatChange = () => {};
    this.saveButton = saveButton;
  }

  mount({ onExport, onFormatChange = () => {} }) {
    this.onFormatChange = onFormatChange;
    this.updateSaveButtonLabel();
    this.markRenderedExportControlsWired();
    this.exportTargetTypeSelect.addEventListener("change", () => {
      this.updateSaveButtonLabel();
      this.onFormatChange(this.exportTargetTypeSelect.value);
    });
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
    this.updateFormatCapability();
  }

  updateFormatCapability() {
    const format = String(this.exportTargetTypeSelect.value || "wav").trim().toLowerCase();
    if (format === "wav") {
      setUnwiredControlState(this.saveButton, { active: false });
      setUnwiredControlState(this.exportTargetTypeSelect, { active: false });
      return;
    }
    const label = format.toUpperCase();
    const detail = `${label} encoding is unavailable in this browser build. Save ${label} reports an honest failure and no ${label} file is created.`;
    setUnwiredControlState(this.saveButton, {
      active: true,
      detail,
      status: "Encoder unavailable"
    });
    setUnwiredControlState(this.exportTargetTypeSelect, {
      active: true,
      detail,
      status: "Encoder unavailable"
    });
  }

  markRenderedExportControlsWired() {
    setUnwiredControlState(this.exportTargetTypeLabel, { active: false });
    this.updateFormatCapability();
  }
}
