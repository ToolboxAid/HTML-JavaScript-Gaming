export class JsonOutputControl {
  constructor(outputElement) {
    this.outputElement = outputElement;
  }

  render(payload) {
    if (!this.outputElement) {
      return;
    }
    this.outputElement.textContent = JSON.stringify(payload, null, 2);
  }
}
