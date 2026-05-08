export class DataControl {
  constructor({ output }) {
    this.output = output;
  }

  clear() {
    this.output.textContent = "Select a normalized tool entry with a top-level data section.";
  }

  render(entry) {
    if (!entry) {
      this.clear();
      return;
    }
    const value = entry.parseOk ? entry.parsedValue : null;
    if (!value || typeof value !== "object" || Array.isArray(value) || !Object.prototype.hasOwnProperty.call(value, "data")) {
      this.output.textContent = `No data section is present for ${entry.storageType}:${entry.key}. Select a normalized tool entry with a top-level data section.`;
      return;
    }
    this.output.textContent = JSON.stringify(value.data, null, 2);
  }
}
