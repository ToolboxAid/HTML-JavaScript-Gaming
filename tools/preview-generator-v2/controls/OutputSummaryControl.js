class OutputSummaryControl {
  constructor({ documentRef = document } = {}) {
    this.writeFolderSampleValueEl = documentRef.getElementById("writeFolderSampleValue");
    this.writeFolderActualValueEl = documentRef.getElementById("writeFolderActualValue");
  }

  setWriteFolderSample(value) {
    this.writeFolderSampleValueEl.textContent = value;
  }

  setWriteFolderActual(value) {
    this.writeFolderActualValueEl.textContent = value;
  }
}

export { OutputSummaryControl };
