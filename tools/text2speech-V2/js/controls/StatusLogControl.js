export class StatusLogControl {
  constructor({ clearButton, log }) {
    this.clearButton = clearButton;
    this.log = log;
  }

  mount() {
    this.clearButton.addEventListener("click", (event) => {
      event.stopPropagation();
      this.clear();
    });
  }

  clear() {
    this.log.value = "";
  }

  write(message) {
    const line = String(message || "");
    this.log.value = this.log.value
      ? `${this.log.value}\n${line}`
      : line;
    this.log.scrollTop = this.log.scrollHeight;
  }

  ok(message) {
    this.write(`OK ${message}`);
  }

  fail(message) {
    this.write(`FAIL ${message}`);
  }
}
