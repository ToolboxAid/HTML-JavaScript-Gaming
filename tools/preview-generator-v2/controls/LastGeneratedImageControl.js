class LastGeneratedImageControl {
  constructor({
    lastGeneratedImageEmptyEl,
    lastGeneratedImagePreviewEl,
    lastGeneratedImageEl,
    lastGeneratedImageMetaEl
  }) {
    this.lastGeneratedImageEmptyEl = lastGeneratedImageEmptyEl;
    this.lastGeneratedImagePreviewEl = lastGeneratedImagePreviewEl;
    this.lastGeneratedImageEl = lastGeneratedImageEl;
    this.lastGeneratedImageMetaEl = lastGeneratedImageMetaEl;
    this.lastGeneratedImageObjectUrl = "";
  }

  setLastGeneratedImage(svgContent, label) {
    if (this.lastGeneratedImageObjectUrl) {
      URL.revokeObjectURL(this.lastGeneratedImageObjectUrl);
    }

    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    this.lastGeneratedImageObjectUrl = URL.createObjectURL(blob);
    this.lastGeneratedImageEl.src = this.lastGeneratedImageObjectUrl;
    this.lastGeneratedImageMetaEl.textContent = `Last generated: ${label}`;
    this.lastGeneratedImageEmptyEl.hidden = true;
    this.lastGeneratedImagePreviewEl.hidden = false;
  }
}

export { LastGeneratedImageControl };
