import { AccordionSection } from "./AccordionSection.js";

class RepoDestinationControl {
  constructor({ documentRef = document } = {}) {
    this.accordion = new AccordionSection({ content: documentRef.getElementById("repoDestinationContent") });
    this.pickRepoBtn = documentRef.getElementById("pickRepoBtn");
    this.repoSelectedValueEl = documentRef.getElementById("repoSelectedValue");
    this.workspaceContextFieldEl = documentRef.getElementById("workspaceContextField");
    this.workspaceContextValueEl = documentRef.getElementById("workspaceContextValue");
  }

  setRepoDestinationDisplayName(displayName) {
    this.repoSelectedValueEl.textContent = displayName;
    this.repoSelectedValueEl.setAttribute("title", displayName);
  }

  setWorkspaceContextLabel(label) {
    if (!this.workspaceContextFieldEl || !this.workspaceContextValueEl) {
      return;
    }
    const displayLabel = String(label || "").trim();
    this.workspaceContextFieldEl.hidden = !displayLabel;
    this.workspaceContextValueEl.textContent = displayLabel || "not hydrated";
    this.workspaceContextValueEl.setAttribute("title", displayLabel || "not hydrated");
  }

  onPickRepo(handler) {
    this.pickRepoBtn.addEventListener("click", handler);
  }
}

export { RepoDestinationControl };
