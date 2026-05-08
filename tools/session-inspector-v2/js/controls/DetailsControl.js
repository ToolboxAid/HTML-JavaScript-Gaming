export class DetailsControl {
  constructor({ output }) {
    this.output = output;
  }

  clear() {
    this.output.textContent = "{}";
  }

  render(entry) {
    if (!entry) {
      this.clear();
      return;
    }
    this.output.textContent = JSON.stringify({
      storageType: entry.storageType,
      key: entry.key,
      valueType: entry.valueType,
      sizeBytes: entry.sizeBytes,
      parseOk: entry.parseOk,
      parsedValue: entry.parsedValue,
      rawValue: entry.rawValue
    }, null, 2);
  }
}
