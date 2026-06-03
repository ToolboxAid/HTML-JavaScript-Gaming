export class InspectorControl {
  constructor(output) {
    this.output = output;
  }

  showObject(value) {
    this.output.textContent = JSON.stringify(value, null, 2);
  }
}

