class RenderControlsControl {
  constructor({ documentRef = document } = {}) {
    this.waitMsInput = documentRef.getElementById("waitMs");
    this.forceRewriteInput = documentRef.getElementById("forceRewrite");
  }

  getWaitMs() {
    return Math.max(3000, Number(this.waitMsInput.value) || 3500);
  }

  isForceRewrite() {
    return this.forceRewriteInput.checked;
  }

  onWaitInput(handler) {
    this.waitMsInput.addEventListener("input", handler);
  }
}

export { RenderControlsControl };
