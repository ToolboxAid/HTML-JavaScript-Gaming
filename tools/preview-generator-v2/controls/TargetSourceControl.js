class TargetSourceControl {
  constructor({ documentRef = document } = {}) {
    this.targetTypeInputs = Array.from(documentRef.querySelectorAll('input[name="targetType"]'));
    this.baseUrlInput = documentRef.getElementById("baseUrl");
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
