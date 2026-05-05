class StatusControl {
  constructor({ statusEl, logEl, clearLogBtn }) {
    this.statusEl = statusEl;
    this.logEl = logEl;
    this.clearLogBtn = clearLogBtn;
  }

  onClear(handler) {
    this.clearLogBtn.addEventListener("click", handler);
  }
}

export { StatusControl };
