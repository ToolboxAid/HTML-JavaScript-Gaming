export class WorkspaceSummaryControl {
  constructor({ contextOutput }) {
    this.contextOutput = contextOutput;
  }

  clear() {
    this.contextOutput.textContent = "{}";
  }

  render({ context }) {
    this.contextOutput.textContent = JSON.stringify(context, null, 2);
  }
}
