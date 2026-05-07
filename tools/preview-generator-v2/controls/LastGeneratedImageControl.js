import { AccordionSection } from "./AccordionSection.js";

class LastGeneratedImageControl {
  constructor({ documentRef = document } = {}) {
    this.accordion = new AccordionSection({ content: documentRef.getElementById("lastGeneratedImageContent") });
    this.lastGeneratedImageEmptyEl = documentRef.getElementById("lastGeneratedImageEmpty");
    this.lastGeneratedImagePreviewEl = documentRef.getElementById("lastGeneratedImagePreview");
    this.lastGeneratedImageEl = documentRef.getElementById("lastGeneratedImage");
    this.lastGeneratedImageMetaEl = documentRef.getElementById("lastGeneratedImageMeta");
    this.lastGeneratedImageObjectUrl = "";
  }

  setLastGeneratedImage(svgContent, label) {
    if (this.lastGeneratedImageObjectUrl) {
      URL.revokeObjectURL(this.lastGeneratedImageObjectUrl);
      this.lastGeneratedImageObjectUrl = "";
    }

    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    this.lastGeneratedImageObjectUrl = URL.createObjectURL(blob);
    this.lastGeneratedImageEl.src = this.lastGeneratedImageObjectUrl;
    this.lastGeneratedImageMetaEl.textContent = `Last generated: ${label}`;
    this.lastGeneratedImageEmptyEl.hidden = true;
    this.lastGeneratedImagePreviewEl.hidden = false;
  }

  setPreviewTargetImage(imagePath) {
    if (this.lastGeneratedImageObjectUrl) {
      URL.revokeObjectURL(this.lastGeneratedImageObjectUrl);
      this.lastGeneratedImageObjectUrl = "";
    }

    this.lastGeneratedImageEl.src = `/${imagePath}`;
    this.lastGeneratedImageMetaEl.textContent = `Preview target: ${imagePath}`;
    this.lastGeneratedImageEmptyEl.hidden = true;
    this.lastGeneratedImagePreviewEl.hidden = false;
  }
}

export { LastGeneratedImageControl };
