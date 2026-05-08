export class StateControl {
  constructor({ output }) {
    this.output = output;
  }

  clear() {
    this.output.textContent = "Select a normalized tool entry with a top-level state section.";
  }

  render(entry) {
    if (!entry) {
      this.clear();
      return;
    }
    const value = entry.parseOk ? entry.parsedValue : null;
    if (!value || typeof value !== "object" || Array.isArray(value) || !Object.prototype.hasOwnProperty.call(value, "state")) {
      this.output.textContent = `No state section is present for ${entry.storageType}:${entry.key}. Select a normalized tool entry with a top-level state section.`;
      return;
    }
    this.output.textContent = JSON.stringify(value.state, null, 2);
  }
}
