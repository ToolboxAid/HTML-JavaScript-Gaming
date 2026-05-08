export class SchemaControl {
  constructor({ output }) {
    this.output = output;
  }

  clear() {
    this.output.textContent = "Select a storage entry with a top-level schema section.";
  }

  render(entry) {
    if (!entry) {
      this.clear();
      return;
    }
    const value = entry.parseOk ? entry.parsedValue : null;
    if (!value || typeof value !== "object" || Array.isArray(value) || !Object.prototype.hasOwnProperty.call(value, "schema")) {
      this.output.textContent = `No schema section is present for ${entry.storageType}:${entry.key}. Select a storage entry with a top-level schema section.`;
      return;
    }
    this.output.textContent = JSON.stringify(value.schema, null, 2);
  }
}
