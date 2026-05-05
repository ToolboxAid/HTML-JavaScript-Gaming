class StatusLogControl {
  constructor({ documentRef = document } = {}) {
    this.statusEl = documentRef.getElementById("status");
    this.logEl = documentRef.getElementById("log");
    this.clearLogBtn = documentRef.getElementById("clearLogBtn");
  }

  getStatusElement() {
    return this.statusEl;
  }

  getLogElement() {
    return this.logEl;
  }

  onClear(handler) {
    this.clearLogBtn.addEventListener("click", handler);
  }
}

export { StatusLogControl };
