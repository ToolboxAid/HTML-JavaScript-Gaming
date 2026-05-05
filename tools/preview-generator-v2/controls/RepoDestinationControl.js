class RepoDestinationControl {
  constructor({ pickRepoBtn, repoSelectedValueEl }) {
    this.pickRepoBtn = pickRepoBtn;
    this.repoSelectedValueEl = repoSelectedValueEl;
  }

  setRepoDestinationDisplayName(displayName) {
    this.repoSelectedValueEl.textContent = displayName;
    this.repoSelectedValueEl.setAttribute("title", displayName);
  }

  onPickRepo(handler) {
    this.pickRepoBtn.addEventListener("click", handler);
  }
}

export { RepoDestinationControl };
