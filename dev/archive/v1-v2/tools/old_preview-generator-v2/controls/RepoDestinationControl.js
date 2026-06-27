import { AccordionSection } from "./AccordionSection.js";

class RepoDestinationControl {
  constructor({ documentRef = document } = {}) {
    this.accordion = new AccordionSection({ content: documentRef.getElementById("repoDestinationContent") });
    this.section = documentRef.getElementById("repoDestinationSection");
    this.pickRepoBtn = documentRef.getElementById("pickRepoBtn");
    this.repoSelectedValueEl = documentRef.getElementById("repoSelectedValue");
  }

  setRepoDestinationDisplayName(displayName) {
    this.repoSelectedValueEl.textContent = displayName;
    this.repoSelectedValueEl.setAttribute("title", displayName);
  }

  setPickRepoVisible(isVisible) {
    this.pickRepoBtn.hidden = !isVisible;
  }

  setRepoDestinationVisible(isVisible) {
    this.section.hidden = !isVisible;
  }

  setPickRepoEnabled(isEnabled) {
    this.pickRepoBtn.disabled = !isEnabled;
  }

  onPickRepo(handler) {
    this.pickRepoBtn.addEventListener("click", handler);
  }
}

export { RepoDestinationControl };
