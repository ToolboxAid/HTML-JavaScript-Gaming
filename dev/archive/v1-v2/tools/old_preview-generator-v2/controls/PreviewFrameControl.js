class PreviewFrameControl {
  constructor({ documentRef = document } = {}) {
    this.frame = documentRef.getElementById("frame");
  }

  getFrame() {
    return this.frame;
  }
}

export { PreviewFrameControl };
