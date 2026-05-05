class RepoDestinationControl {
  constructor({ documentRef = document } = {}) {
    this.pickRepoBtn = documentRef.getElementById("pickRepoBtn");
    this.repoSelectedValueEl = documentRef.getElementById("repoSelectedValue");
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
