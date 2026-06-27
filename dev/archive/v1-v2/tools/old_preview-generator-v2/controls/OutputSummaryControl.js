import { AccordionSection } from "./AccordionSection.js";

class OutputSummaryControl {
  constructor({ documentRef = document } = {}) {
    this.accordion = new AccordionSection({ content: documentRef.getElementById("outputSummaryContent") });
    this.writeFolderSampleValueEl = documentRef.getElementById("writeFolderSampleValue");
    this.writeFolderActualValueEl = documentRef.getElementById("writeFolderActualValue");
    this.previewTargetValueEl = documentRef.getElementById("previewTargetValue");
  }

  setWriteFolderSample(value) {
    this.writeFolderSampleValueEl.textContent = value;
  }

  setWriteFolderActual(value) {
    this.writeFolderActualValueEl.textContent = value;
  }

  setPreviewTarget(value) {
    this.previewTargetValueEl.textContent = value;
    this.previewTargetValueEl.setAttribute("title", value);
  }
}

export { OutputSummaryControl };
