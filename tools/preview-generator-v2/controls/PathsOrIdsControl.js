import { AccordionSection } from "./AccordionSection.js";

class PathsOrIdsControl {
  constructor({ documentRef = document } = {}) {
    this.accordion = new AccordionSection({ content: documentRef.getElementById("pathsOrIdsContent") });
    this.sampleListInput = documentRef.getElementById("sampleList");
  }

  getValue() {
    return this.sampleListInput.value;
  }

  setValue(value) {
    this.sampleListInput.value = String(value || "");
  }

  onInput(handler) {
    this.sampleListInput.addEventListener("input", handler);
  }
}

export { PathsOrIdsControl };
