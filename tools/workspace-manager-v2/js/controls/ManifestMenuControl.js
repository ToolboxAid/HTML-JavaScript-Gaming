export class ManifestMenuControl {
  constructor({
    exportButton,
    importButton,
    importInput,
    loadAsteroidsButton,
    uatButton
  }) {
    this.exportButton = exportButton;
    this.importButton = importButton;
    this.importInput = importInput;
    this.loadAsteroidsButton = loadAsteroidsButton;
    this.uatButton = uatButton;
  }

  mount({
    isUatMode,
    onExportManifest,
    onImportManifest,
    onLoadAsteroids,
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
    this.loadAsteroidsButton.addEventListener("click", onLoadAsteroids);
    this.uatButton.addEventListener("click", onSeedUat);
    this.uatButton.hidden = !isUatMode;
  }

  setExportEnabled(isEnabled) {
    this.exportButton.disabled = !isEnabled;
  }
}
