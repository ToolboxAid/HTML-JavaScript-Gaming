export class ManifestMenuControl {
  constructor({
    cancelButton,
    closeButton,
    saveButton,
    uatButton
  }) {
    this.cancelButton = cancelButton;
    this.closeButton = closeButton;
    this.saveButton = saveButton;
    this.uatButton = uatButton;
  }

  mount({
    isUatMode,
    onCancelToolState,
    onCloseWorkspace,
    onSaveWorkspace,
    onSeedUat
  }) {
    this.saveButton.addEventListener("click", onSaveWorkspace);
    this.closeButton.addEventListener("click", onCloseWorkspace);
    this.cancelButton.addEventListener("click", onCancelToolState);
    this.uatButton.addEventListener("click", onSeedUat);
    this.uatButton.hidden = !isUatMode;
  }

  setSaveEnabled(isEnabled) {
    this.saveButton.disabled = !isEnabled;
  }

  setCloseEnabled(isEnabled) {
    this.closeButton.disabled = !isEnabled;
  }

  setCancelEnabled(isEnabled) {
    this.cancelButton.disabled = !isEnabled;
  }
}
