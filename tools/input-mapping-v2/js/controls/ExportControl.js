export class ExportControl {
  constructor({ copyJsonButton, exportButton, locationRef = window.location, nav }) {
    this.copyJsonButton = copyJsonButton;
    this.exportButton = exportButton;
    this.location = locationRef;
    this.nav = nav;
  }

  mount({ onCopyJson, onExport }) {
    this.applyLaunchMode();
    this.exportButton.addEventListener("click", onExport);
    this.copyJsonButton.addEventListener("click", onCopyJson);
  }

  setEnabled(isEnabled) {
    this.exportButton.disabled = !isEnabled;
    this.copyJsonButton.disabled = !isEnabled;
  }

  applyLaunchMode() {
    const params = new URLSearchParams(this.location.search);
    this.nav.hidden = params.get("launch") === "workspace";
  }
}
