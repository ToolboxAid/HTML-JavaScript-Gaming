const IMPORT_DISABLED_REASON = "Import disabled: Input Mapping V2 imports through Workspace Manager game.manifest launch data. Edit game.manifest.json or relaunch from Workspace Manager with updated tool data.";

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
    this.disableImportAction();
    this.importButton.addEventListener("click", onImport);
    this.exportButton.addEventListener("click", onExport);
    this.copyJsonButton.addEventListener("click", onCopyJson);
  }

  setEnabled(isEnabled) {
    this.disableImportAction();
    this.exportButton.disabled = !isEnabled;
    this.copyJsonButton.disabled = !isEnabled;
  }

  applyLaunchMode() {
    const params = new URLSearchParams(this.location.search);
    this.nav.hidden = params.get("launch") === "workspace";
  }

  disableImportAction() {
    this.importButton.disabled = true;
    this.importButton.dataset.disabledReason = IMPORT_DISABLED_REASON;
    this.importButton.title = IMPORT_DISABLED_REASON;
  }
}
