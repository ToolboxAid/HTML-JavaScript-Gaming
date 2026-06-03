class GeneratePreviewControl {
  constructor({ documentRef = document } = {}) {
    this.executeBtn = documentRef.getElementById("executeBtn");
    this.stopBtn = documentRef.getElementById("stopBtn");
  }

  syncGeneratePreviewButton(isGenerating, canGenerate) {
    this.executeBtn.hidden = false;
    this.executeBtn.disabled = isGenerating || !canGenerate;
  }

  setStopDisabled(isDisabled) {
    this.stopBtn.disabled = isDisabled;
  }

  onGeneratePreview(handler) {
    this.executeBtn.addEventListener("click", handler);
  }

  onStop(handler) {
    this.stopBtn.addEventListener("click", handler);
  }
}

export { GeneratePreviewControl };
