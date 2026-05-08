export class RepoDestinationControl {
  constructor({ pickRepoButton, repoSelectedValue }) {
    this.pickRepoButton = pickRepoButton;
    this.repoSelectedValue = repoSelectedValue;
  }

  mount({ onPickRepo } = {}) {
    this.setRepoDestinationDisplayName("not selected");
    if (typeof onPickRepo === "function") {
      this.onPickRepo(onPickRepo);
    }
  }

  setRepoDestinationDisplayName(displayName) {
    this.repoSelectedValue.textContent = displayName;
    this.repoSelectedValue.setAttribute("title", displayName);
  }

  setPickRepoVisible(isVisible) {
    this.pickRepoButton.hidden = !isVisible;
  }

  onPickRepo(handler) {
    this.pickRepoButton.addEventListener("click", handler);
  }
}
