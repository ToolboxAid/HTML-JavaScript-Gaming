export class OutputSummaryControl {
  constructor({ preview, summary }) {
    this.preview = preview;
    this.summary = summary;
  }

  render(state) {
    const text = String(state?.text || "").trim();
    this.preview.textContent = text || "No speech request has been queued.";
    this.summary.textContent = JSON.stringify(state || {}, null, 2);
  }
}
