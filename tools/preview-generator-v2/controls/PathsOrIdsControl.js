class PathsOrIdsControl {
  constructor({ documentRef = document } = {}) {
    this.sampleListInput = documentRef.getElementById("sampleList");
  }

  getValue() {
    return this.sampleListInput.value;
  }

  onInput(handler) {
    this.sampleListInput.addEventListener("input", handler);
  }
}

export { PathsOrIdsControl };
