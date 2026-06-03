export class ToolShellControl {
  constructor({ documentRef = document } = {}) {
    this.document = documentRef;
    this.headerText = "MIDI Studio V2 - First-Class Tools Surface V2";
    this.introText = "Manifest-owned game music review, preview, and director planning.";
    this.suppressFullscreenSync = false;
    this.toolId = "midi-studio-v2";
  }

  mount({ onExpandedChange = () => {} } = {}) {
    this.document.body.classList.add("tools-platform-surface", "tool-starter-local-shell");
    this.document.body.dataset.toolId = this.toolId;
    this.document.querySelectorAll("[data-tool-id]").forEach((element) => {
      element.setAttribute("data-tool-id", this.toolId);
    });
    this.applyFullscreenState(Boolean(this.document.fullscreenElement));
    this.bindHeaderDetails(onExpandedChange);
    this.updateSummary();
  }

  getHeaderDetails() {
    return this.document.querySelector(".is-collapsible");
  }

  getSummaryElement() {
    return this.document.querySelector("[data-midi-studio-summary]");
  }

  applyFullscreenState(isActive) {
    this.document.body.classList.toggle("tools-platform-fullscreen-active", isActive);
    this.document.documentElement.classList.toggle("tools-platform-fullscreen-active", isActive);
    if (isActive) {
      this.document.body.setAttribute("data-tools-platform-fullscreen", "1");
      this.document.documentElement.setAttribute("data-tools-platform-fullscreen", "1");
      return;
    }
    this.document.body.removeAttribute("data-tools-platform-fullscreen");
    this.document.documentElement.removeAttribute("data-tools-platform-fullscreen");
  }

  isFullscreenActive() {
    return Boolean(this.document.fullscreenElement)
      || this.document.body.classList.contains("tools-platform-fullscreen-active");
  }

  updateSummary() {
    const details = this.getHeaderDetails();
    const summary = this.getSummaryElement();
    if (!(details instanceof HTMLDetailsElement) || !(summary instanceof HTMLElement)) {
      return;
    }
    const isFullscreen = this.isFullscreenActive();
    const isExpanded = details.open === true;
    summary.textContent = isExpanded
      ? "Hide Header and Details"
      : (isFullscreen ? this.headerText : "Show Header and Details");
    summary.setAttribute("data-tools-platform-summary-active", "1");
    summary.setAttribute("data-tools-platform-summary-error", "0");
    summary.setAttribute("data-tools-platform-summary-state", isExpanded ? "expanded" : "collapsed");
    summary.setAttribute("data-tools-platform-summary-mode", isFullscreen ? "fullscreen" : "normal");
    summary.setAttribute("data-tool-id", this.toolId);
    summary.setAttribute("title", `${this.headerText}\n${this.introText}`);
  }

  async enterFullscreenIfAvailable() {
    if (this.document.fullscreenElement || !this.document.fullscreenEnabled) {
      return;
    }
    if (typeof this.document.documentElement?.requestFullscreen !== "function") {
      return;
    }
    try {
      await this.document.documentElement.requestFullscreen();
    } catch {
      this.updateSummary();
    }
  }

  async exitFullscreenIfActive() {
    if (!this.document.fullscreenElement || typeof this.document.exitFullscreen !== "function") {
      return;
    }
    try {
      await this.document.exitFullscreen();
    } catch {
      this.updateSummary();
    }
  }

  bindHeaderDetails(onExpandedChange) {
    const details = this.getHeaderDetails();
    if (!(details instanceof HTMLDetailsElement) || details.dataset.midiStudioV2ShellBound === "true") {
      return;
    }
    details.dataset.midiStudioV2ShellBound = "true";
    details.addEventListener("toggle", () => {
      this.updateSummary();
      if (this.suppressFullscreenSync) {
        this.suppressFullscreenSync = false;
        return;
      }
      if (details.open) {
        void this.exitFullscreenIfActive();
        onExpandedChange(false);
        return;
      }
      void this.enterFullscreenIfAvailable();
    });

    this.document.addEventListener("fullscreenchange", () => {
      const isFullscreen = Boolean(this.document.fullscreenElement);
      this.applyFullscreenState(isFullscreen);
      if (!isFullscreen && !details.open) {
        this.suppressFullscreenSync = true;
        details.open = true;
      }
      this.updateSummary();
      onExpandedChange(isFullscreen);
    });
  }
}
