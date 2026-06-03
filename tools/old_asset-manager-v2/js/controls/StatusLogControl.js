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

  info(message) {
    this.write("INFO", message);
  }

  ok(message) {
    this.write("OK", message);
  }

  fail(message) {
    this.write("FAIL", message);
  }

  write(level, message) {
    const timestamp = new Date().toLocaleTimeString();
    const nextLine = `[${timestamp}] ${level} ${message}`;
    this.log.value = this.log.value ? `${this.log.value}\n${nextLine}` : nextLine;
    this.log.scrollTop = this.log.scrollHeight;
  }
}
