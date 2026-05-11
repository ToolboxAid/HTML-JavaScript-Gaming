export class TextToSpeechShellControl {
  constructor({ documentRef = document } = {}) {
    this.document = documentRef;
    this.suppressFullscreenSync = false;
  }

  mount() {
    this.document.body.classList.add("tools-platform-surface", "text2speach-V2-local-shell");
    this.applyFullscreenState(Boolean(this.document.fullscreenElement));
    this.bindHeaderDetails();
    this.updateSummary();
  }

  getHeaderDetails() {
    return this.document.querySelector(".is-collapsible");
  }

  getSummaryElement() {
    return this.document.querySelector('[data-tool-summary="text2speach-V2"]');
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

  updateSummary() {
    const details = this.getHeaderDetails();
    const summary = this.getSummaryElement();
    if (!(details instanceof HTMLDetailsElement) || !(summary instanceof HTMLElement)) {
      return;
    }
    const isFullscreen = Boolean(this.document.fullscreenElement)
      || this.document.body.classList.contains("tools-platform-fullscreen-active");
    const isExpanded = details.open === true;
    const headerText = "Text to Speech V2 - Browser speech synthesis";
    summary.textContent = isExpanded
      ? "Hide Header and Details"
      : (isFullscreen ? headerText : "Show Header and Details");
    summary.setAttribute("data-tools-platform-summary-active", "1");
    summary.setAttribute("data-tools-platform-summary-error", "0");
    summary.setAttribute("data-tools-platform-summary-state", isExpanded ? "expanded" : "collapsed");
    summary.setAttribute("data-tools-platform-summary-mode", isFullscreen ? "fullscreen" : "normal");
    summary.setAttribute("data-tool-id", "text2speach-V2");
    summary.setAttribute("title", `${headerText}\nConfigure voices, helper filters, presets, named sentences, queue behavior, and runtime playback.`);
  }

  async enterFullscreenIfAvailable() {
    this.applyFullscreenState(true);
    if (this.document.fullscreenElement || !this.document.fullscreenEnabled) {
      this.updateSummary();
      return;
    }
    if (typeof this.document.documentElement?.requestFullscreen !== "function") {
      this.updateSummary();
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
      this.applyFullscreenState(false);
      this.updateSummary();
      return;
    }
    try {
      await this.document.exitFullscreen();
    } catch {
      this.applyFullscreenState(false);
      this.updateSummary();
    }
  }

  bindHeaderDetails() {
    const details = this.getHeaderDetails();
    if (!(details instanceof HTMLDetailsElement) || details.dataset.text2speachV2ShellBound === "true") {
      return;
    }
    details.dataset.text2speachV2ShellBound = "true";
    details.addEventListener("toggle", () => {
      this.updateSummary();
      if (this.suppressFullscreenSync) {
        this.suppressFullscreenSync = false;
        return;
      }
      if (details.open) {
        void this.exitFullscreenIfActive();
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
    });
  }
}
