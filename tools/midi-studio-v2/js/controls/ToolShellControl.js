export class ToolShellControl {
  constructor({ documentRef = document } = {}) {
    this.document = documentRef;
    this.details = this.document.querySelector(".is-collapsible");
    this.summary = this.document.querySelector("[data-midi-studio-summary]");
    this.toolId = "midi-studio-v2";
  }

  mount({ onExpandedChange = () => {} } = {}) {
    this.document.body.dataset.toolId = this.toolId;
    this.document.querySelectorAll("[data-tool-id]").forEach((element) => {
      element.setAttribute("data-tool-id", this.toolId);
    });
    this.applyExpandedState(false);
    this.summary?.addEventListener("click", (event) => {
      event.preventDefault();
      const isExpanded = !this.document.body.classList.contains("midi-studio-v2--expanded");
      if (this.details) {
        this.details.open = true;
      }
      this.applyExpandedState(isExpanded);
      onExpandedChange(isExpanded);
    });
  }

  applyExpandedState(isExpanded) {
    this.document.body.classList.toggle("midi-studio-v2--expanded", isExpanded);
    this.document.body.dataset.midiStudioExpanded = String(isExpanded);
    if (this.details) {
      this.details.open = true;
    }
    if (this.summary) {
      this.summary.textContent = isExpanded ? "Exit Expanded View" : "Enter Expanded View";
    }
  }
}
