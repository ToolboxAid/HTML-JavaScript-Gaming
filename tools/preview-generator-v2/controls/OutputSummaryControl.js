class OutputSummaryControl {
  constructor({ writeFolderSampleValueEl, writeFolderActualValueEl }) {
    this.writeFolderSampleValueEl = writeFolderSampleValueEl;
    this.writeFolderActualValueEl = writeFolderActualValueEl;
  }

  setWriteFolderSample(value) {
    this.writeFolderSampleValueEl.textContent = value;
  }

  setWriteFolderActual(value) {
    this.writeFolderActualValueEl.textContent = value;
  }
}

export { OutputSummaryControl };
