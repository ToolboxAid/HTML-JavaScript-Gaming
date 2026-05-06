export class StatusLogControl {
  constructor({ log, clearButton }) {
    this.log = log;
    this.clearButton = clearButton;
  }

  mount() {
    this.clearButton.addEventListener("click", () => this.clear());
  }

  clear() {
    this.log.value = "";
  }

  error(message) {
    this.write(`ERROR: ${message}`);
  }

  write(message) {
    const timestamp = new Date().toLocaleTimeString();
    const nextLine = `[${timestamp}] ${message}`;
    this.log.value = this.log.value ? `${this.log.value}\n${nextLine}` : nextLine;
    this.log.scrollTop = this.log.scrollHeight;
  }
}

