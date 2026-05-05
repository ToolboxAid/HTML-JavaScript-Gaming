class PathsOrIdsControl {
  constructor({ sampleListInput }) {
    this.sampleListInput = sampleListInput;
  }

  getValue() {
    return this.sampleListInput.value;
  }

  onInput(handler) {
    this.sampleListInput.addEventListener("input", handler);
  }
}

export { PathsOrIdsControl };
