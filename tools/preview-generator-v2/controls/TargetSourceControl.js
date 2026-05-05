class TargetSourceControl {
  constructor({ targetTypeInputs, baseUrlInput }) {
    this.targetTypeInputs = targetTypeInputs;
    this.baseUrlInput = baseUrlInput;
  }

  getSelectedTargetType() {
    const selected = this.targetTypeInputs.find(input => input.checked);
    return selected ? selected.value : "samples";
  }

  hasSelection() {
    return this.targetTypeInputs.some(input => input.checked);
  }

  getBaseUrl() {
    return this.baseUrlInput.value.trim().replace(/\/+$/, "");
  }

  hasBaseUrl() {
    return this.baseUrlInput.value.trim().length > 0;
  }

  onBaseUrlInput(handler) {
    this.baseUrlInput.addEventListener("input", handler);
  }

  onTargetChange(handler) {
    this.targetTypeInputs.forEach(input => {
      input.addEventListener("change", handler);
    });
  }
}

export { TargetSourceControl };
