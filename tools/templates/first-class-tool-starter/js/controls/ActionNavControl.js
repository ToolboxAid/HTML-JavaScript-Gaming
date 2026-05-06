export class ActionNavControl {
  constructor({ runButton, resetButton, exportButton }) {
    this.runButton = runButton;
    this.resetButton = resetButton;
    this.exportButton = exportButton;
  }

  mount({ onRun, onReset, onExport }) {
    this.runButton.addEventListener("click", onRun);
    this.resetButton.addEventListener("click", onReset);
    this.exportButton.addEventListener("click", onExport);
  }

  setRunEnabled(isEnabled) {
    this.runButton.disabled = !isEnabled;
    this.exportButton.disabled = !isEnabled;
  }
}

