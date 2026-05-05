class MenuSampleControl {
  constructor({ executeBtn, stopBtn }) {
    this.executeBtn = executeBtn;
    this.stopBtn = stopBtn;
  }

  syncGeneratePreviewButton(isGenerating, canGenerate) {
    this.executeBtn.hidden = false;
    this.executeBtn.disabled = isGenerating || !canGenerate;
  }

  setStopDisabled(isDisabled) {
    this.stopBtn.disabled = isDisabled;
  }

  onExecute(handler) {
    this.executeBtn.addEventListener("click", handler);
  }

  onStop(handler) {
    this.stopBtn.addEventListener("click", handler);
  }
}

export { MenuSampleControl };
