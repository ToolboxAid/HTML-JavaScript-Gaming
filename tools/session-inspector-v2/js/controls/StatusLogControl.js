export class StatusLogControl {
  constructor({ clearButton, output }) {
    this.clearButton = clearButton;
    this.output = output;
  }

  mount() {
    this.clearButton.addEventListener("click", () => {
      this.clear();
    });
  }

  clear() {
    this.output.value = "";
  }

  write(level, message) {
    const prefix = String(level || "INFO").toUpperCase();
    const nextLine = `${prefix} ${message}`;
    this.output.value = this.output.value ? `${this.output.value}\n${nextLine}` : nextLine;
    this.output.scrollTop = this.output.scrollHeight;
  }

  ok(message) {
    this.write("OK", message);
  }

  info(message) {
    this.write("INFO", message);
  }

  warn(message) {
    this.write("WARN", message);
  }

  fail(message) {
    this.write("FAIL", message);
  }
}
