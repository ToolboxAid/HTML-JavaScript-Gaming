export class StatusLogControl {
  constructor({ logElement, clearButton }) {
    this.logElement = logElement;
    this.clearButton = clearButton;
    this.lines = [];
    this.clearButton?.addEventListener("click", () => this.clear());
  }

  ok(message) {
    this.write("OK", message);
  }

  warn(message) {
    this.write("WARN", message);
  }

  fail(message) {
    this.write("FAIL", message);
  }

  write(level, message) {
    this.lines.push(`[${level}] ${message}`);
    if (this.logElement) {
      this.logElement.textContent = this.lines.join("\n");
      this.logElement.scrollTop = this.logElement.scrollHeight;
    }
  }

  clear() {
    this.lines = [];
    if (this.logElement) {
      this.logElement.textContent = "";
    }
  }
}
