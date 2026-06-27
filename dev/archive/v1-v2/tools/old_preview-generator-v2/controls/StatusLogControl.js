import { AccordionSection } from "./AccordionSection.js";

class StatusLogControl {
  constructor({ documentRef = document } = {}) {
    this.accordion = new AccordionSection({ content: documentRef.getElementById("statusAccordionContent") });
    this.statusEl = documentRef.getElementById("status");
    this.logEl = documentRef.getElementById("log");
    this.copyLogBtn = documentRef.getElementById("copyLogBtn");
    this.clearLogBtn = documentRef.getElementById("clearLogBtn");
  }

  getStatusElement() {
    return this.statusEl;
  }

  getLogElement() {
    return this.logEl;
  }

  getLogText() {
    return this.logEl.textContent || "";
  }

  onCopy(handler) {
    this.copyLogBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      handler(event);
    });
  }

  onClear(handler) {
    this.clearLogBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      handler(event);
    });
  }
}

export { StatusLogControl };
