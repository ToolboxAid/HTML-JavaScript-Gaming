export class OutputSummaryControl {
  constructor({ summary }) {
    this.summary = summary;
  }

  render(state) {
    this.summary.textContent = JSON.stringify(state || [], null, 2);
  }
}
