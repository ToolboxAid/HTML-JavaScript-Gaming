import { setUnwiredControlState } from "./UnwiredControlState.js";

const RENDERED_EXPORT_NOT_IMPLEMENTED = "Rendered audio export generation is not implemented yet; use the Export tab rendered target paths until export rendering is added.";

export class RenderedExportActionsControl {
  constructor({ exportTargetTypeLabel, exportTargetTypeSelect, saveButton }) {
    this.exportTargetTypeLabel = exportTargetTypeLabel;
    this.exportTargetTypeSelect = exportTargetTypeSelect;
    this.saveButton = saveButton;
  }

  mount({ onExport }) {
    this.updateSaveButtonLabel();
    this.markRenderedExportControlsUnwired();
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
    if (this.saveButton.dataset.midiStudioUnwired) {
      this.saveButton.setAttribute("aria-label", `${label} (${this.saveButton.dataset.midiStudioUnwiredStatus || "Not implemented"})`);
    }
  }

  markRenderedExportControlsUnwired() {
    [
      this.exportTargetTypeLabel,
      this.exportTargetTypeSelect,
      this.saveButton
    ].forEach((control) => {
      setUnwiredControlState(control, {
        active: true,
        detail: RENDERED_EXPORT_NOT_IMPLEMENTED,
        status: "Not implemented"
      });
    });
  }
}
