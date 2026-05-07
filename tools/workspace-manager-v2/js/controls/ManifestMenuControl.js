export class ManifestMenuControl {
  constructor({
    exportButton,
    importButton,
    importInput,
    uatButton
  }) {
    this.exportButton = exportButton;
    this.importButton = importButton;
    this.importInput = importInput;
    this.uatButton = uatButton;
  }

  mount({
    isUatMode,
    onExportManifest,
    onImportManifest,
    onSeedUat
  }) {
    this.importButton.addEventListener("click", () => {
      this.importInput.value = "";
      this.importInput.click();
    });
    this.importInput.addEventListener("change", () => {
      onImportManifest(this.importInput.files?.[0] || null);
    });
    this.exportButton.addEventListener("click", onExportManifest);
    this.uatButton.addEventListener("click", onSeedUat);
    this.uatButton.hidden = !isUatMode;
  }

  setExportEnabled(isEnabled) {
    this.exportButton.disabled = !isEnabled;
  }
}
