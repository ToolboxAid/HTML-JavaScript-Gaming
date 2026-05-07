import { AccordionSection } from "./AccordionSection.js";

class TargetSourceControl {
  constructor({ documentRef = document } = {}) {
    this.accordion = new AccordionSection({ content: documentRef.getElementById("targetSourceContent") });
    this.targetTypeInputs = Array.from(documentRef.querySelectorAll('input[name="targetType"]'));
    this.baseUrlInput = documentRef.getElementById("baseUrl");
  }

  getSelectedTargetType() {
    const selected = this.targetTypeInputs.find(input => input.checked);
    return selected ? selected.value : "samples";
  }

  setSelectedTargetType(targetType) {
    this.targetTypeInputs.forEach((input) => {
      input.checked = input.value === targetType;
    });
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
