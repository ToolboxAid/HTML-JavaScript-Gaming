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

  showWorkspaceGamesOnly() {
    this.targetTypeInputs.forEach((input) => {
      const isGames = input.value === "games";
      input.disabled = !isGames;
      const label = input.closest("label");
      if (label) {
        label.hidden = !isGames;
        label.style.display = isGames ? "" : "none";
      }
    });
    this.setSelectedTargetType("games");
  }

  hasSelection() {
    return this.targetTypeInputs.some(input => input.checked);
  }

  getBaseUrl() {
    return this.baseUrlInput.value.trim().replace(/\/+$/, "");
  }

  setBaseUrl(value) {
    this.baseUrlInput.value = String(value || "").trim().replace(/\/+$/, "");
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
