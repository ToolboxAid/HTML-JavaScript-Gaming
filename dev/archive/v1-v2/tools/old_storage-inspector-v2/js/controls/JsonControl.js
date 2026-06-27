export class JsonControl {
  constructor({ output }) {
    this.output = output;
  }

  clear() {
    this.output.textContent = "{}";
  }

  text() {
    return String(this.output.textContent || "");
  }

  render(entry) {
    if (!entry) {
      this.clear();
      return;
    }
    const value = entry.parseOk ? entry.parsedValue : entry.rawValue;
    this.output.textContent = JSON.stringify(value, null, 2);
  }
}
