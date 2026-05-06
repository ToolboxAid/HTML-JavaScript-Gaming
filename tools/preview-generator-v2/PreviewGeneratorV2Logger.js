class PreviewGeneratorV2Logger {
  constructor({ statusEl, logEl }) {
    this.statusEl = statusEl;
    this.logEl = logEl;
  }

  log(message = "") {
    const now = new Date().toLocaleTimeString();
    this.logEl.textContent += `[${now}] ${message}\n`;
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }

  clear() {
    this.statusEl.textContent = "";
    this.logEl.textContent = "";
  }

  clearStatus() {
    this.statusEl.textContent = "";
  }
}

export { PreviewGeneratorV2Logger };
