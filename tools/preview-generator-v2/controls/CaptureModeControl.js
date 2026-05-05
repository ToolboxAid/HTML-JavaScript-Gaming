class CaptureModeControl {
  constructor({ documentRef = document } = {}) {
    this.captureModeInputs = Array.from(documentRef.querySelectorAll('input[name="captureMode"]'));
  }

  getSelectedCaptureMode() {
    const selected = this.captureModeInputs.find(input => input.checked);
    return selected ? selected.value : "canvasOnly";
  }

  getCaptureModeLabel(modeValue = this.getSelectedCaptureMode()) {
    return modeValue === "canvasOnly"
      ? "Canvas Only"
      : "Full Screen";
  }

  hasSelection() {
    return this.captureModeInputs.some(input => input.checked);
  }

  onChange(handler) {
    this.captureModeInputs.forEach(input => {
      input.addEventListener("change", handler);
    });
  }
}

export { CaptureModeControl };
