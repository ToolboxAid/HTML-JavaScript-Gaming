export class ManifestMenuControl {
  constructor({
    closeButton,
    exportButton,
    importButton,
    importInput,
    saveButton,
    uatButton
  }) {
    this.closeButton = closeButton;
    this.exportButton = exportButton;
    this.importButton = importButton;
    this.importInput = importInput;
    this.saveButton = saveButton;
    this.uatButton = uatButton;
  }

  mount({
    isUatMode,
    onCloseWorkspace,
    onExportManifest,
    onImportManifest,
    onSaveWorkspace,
    onSeedUat
  }) {
    this.importButton.addEventListener("click", () => {
      this.importInput.value = "";
      this.importInput.click();
    });
    this.importInput.addEventListener("change", () => {
      onImportManifest(this.importInput.files?.[0] || null);
    });
    this.saveButton.addEventListener("click", onSaveWorkspace);
    this.exportButton.addEventListener("click", onExportManifest);
    this.closeButton.addEventListener("click", onCloseWorkspace);
    this.uatButton.addEventListener("click", onSeedUat);
    this.uatButton.hidden = !isUatMode;
  }

  setSaveEnabled(isEnabled) {
    this.saveButton.disabled = !isEnabled;
  }

  setExportEnabled(isEnabled) {
    this.exportButton.disabled = !isEnabled;
  }

  setCloseEnabled(isEnabled) {
    this.closeButton.disabled = !isEnabled;
  }
}
