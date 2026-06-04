export class DirtyControl {
  constructor({ headerValue, output }) {
    this.headerValue = headerValue;
    this.output = output;
  }

  setHeaderValue(value) {
    this.headerValue.textContent = `Dirty: ${value}`;
  }

  clear() {
    this.setHeaderValue("unknown");
    this.output.textContent = "Select a normalized tool entry with a top-level dirty section.";
  }

  text() {
    return String(this.output.textContent || "");
  }

  render(entry) {
    if (!entry) {
      this.clear();
      return;
    }
    const value = entry.parseOk ? entry.parsedValue : null;
    if (!value || typeof value !== "object" || Array.isArray(value) || !Object.prototype.hasOwnProperty.call(value, "dirty")) {
      this.setHeaderValue("unknown");
      this.output.textContent = `No dirty section is present for ${entry.storageType}:${entry.key}. Select a normalized tool entry with a top-level dirty section.`;
      return;
    }
    this.setHeaderValue(typeof value.dirty?.isDirty === "boolean" ? String(value.dirty.isDirty) : "unknown");
    this.output.textContent = JSON.stringify(value.dirty, null, 2);
  }
}
