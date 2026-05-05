import { AccordionSection } from "./AccordionSection.js";

class StatusLogControl {
  constructor({ documentRef = document } = {}) {
    this.accordion = new AccordionSection({ content: documentRef.getElementById("statusAccordionContent") });
    this.statusEl = documentRef.getElementById("status");
    this.logEl = documentRef.getElementById("log");
    this.clearLogBtn = documentRef.getElementById("clearLogBtn");
  }

  getStatusElement() {
    return this.statusEl;
  }

  getLogElement() {
    return this.logEl;
  }

  onClear(handler) {
    this.clearLogBtn.addEventListener("click", handler);
  }
}

export { StatusLogControl };
