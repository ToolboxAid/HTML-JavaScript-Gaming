class RenderControlsControl {
  constructor({ waitMsInput, forceRewriteInput }) {
    this.waitMsInput = waitMsInput;
    this.forceRewriteInput = forceRewriteInput;
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
