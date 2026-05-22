export class ExportControl {
  constructor({ copyJsonButton, exportButton, importButton, locationRef = window.location, nav }) {
    this.copyJsonButton = copyJsonButton;
    this.exportButton = exportButton;
    this.importButton = importButton;
    this.location = locationRef;
    this.nav = nav;
  }

  mount({ onCopyJson, onExport, onImport }) {
    this.applyLaunchMode();
    this.importButton.addEventListener("click", onImport);
    this.exportButton.addEventListener("click", onExport);
    this.copyJsonButton.addEventListener("click", onCopyJson);
  }

  setEnabled(isEnabled) {
    this.importButton.disabled = !isEnabled;
    this.exportButton.disabled = !isEnabled;
    this.copyJsonButton.disabled = !isEnabled;
  }

  applyLaunchMode() {
    const params = new URLSearchParams(this.location.search);
    this.nav.hidden = params.get("launch") === "workspace";
  }
}
