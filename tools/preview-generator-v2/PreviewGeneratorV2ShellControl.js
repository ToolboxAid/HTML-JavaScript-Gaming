class PreviewGeneratorV2ShellControl {
  constructor({ documentRef = document, windowRef = window } = {}) {
    this.document = documentRef;
    this.window = windowRef;
    this.toolId = "preview-generator-v2";
    this.toolName = "Preview Generator V2";
    this.toolDescription = "First-Class Tools Surface";
    this.headerText = `${this.toolName} - ${this.toolDescription}`;
    this.introText = this.toolDescription;
    this.runtimeParams = new URLSearchParams(this.window.location.search);
    this.suppressFullscreenSync = false;
  }

  getHeaderDetails() {
    return this.document.querySelector(".is-collapsible");
  }

  getSummaryElement() {
    return this.document.querySelector("[data-preview-generator-v2-summary]");
  }

  applyFullscreenState(isActive) {
    this.document.body.classList.toggle("tools-platform-fullscreen-active", isActive);
    this.document.documentElement.classList.toggle("tools-platform-fullscreen-active", isActive);
    if (isActive) {
      this.document.body.setAttribute("data-tools-platform-fullscreen", "1");
      this.document.documentElement.setAttribute("data-tools-platform-fullscreen", "1");
    } else {
      this.document.body.removeAttribute("data-tools-platform-fullscreen");
      this.document.documentElement.removeAttribute("data-tools-platform-fullscreen");
    }
  }

  updateSummary() {
    const details = this.getHeaderDetails();
    const summary = this.getSummaryElement();
    if (!(details instanceof HTMLDetailsElement) || !(summary instanceof HTMLElement)) {
      return;
    }

    const isFullscreen = Boolean(this.document.fullscreenElement);
    const isExpanded = details.open === true;
    summary.textContent = isExpanded
      ? "Hide Header and Details"
      : (isFullscreen ? this.headerText : "Show Header and Details");

    if (isFullscreen) {
      summary.style.maxWidth = "calc(100vw - 24px)";
      summary.style.whiteSpace = "nowrap";
      summary.style.overflow = "hidden";
      summary.style.textOverflow = "ellipsis";
    } else {
      summary.style.removeProperty("max-width");
      summary.style.removeProperty("white-space");
      summary.style.removeProperty("overflow");
      summary.style.removeProperty("text-overflow");
    }

    summary.setAttribute("data-tools-platform-summary-active", "1");
    summary.setAttribute("data-tools-platform-summary-error", "0");
    summary.setAttribute("data-tools-platform-summary-state", isExpanded ? "expanded" : "collapsed");
    summary.setAttribute("data-tools-platform-summary-mode", isFullscreen ? "fullscreen" : "normal");
    summary.setAttribute("data-tool-id", this.toolId);
    summary.setAttribute("title", `${this.headerText}\n${this.introText}`);
  }

  isWorkspaceLaunch() {
    return this.runtimeParams.get("launch") === "workspace"
      && this.runtimeParams.get("fromTool") === "workspace-manager-v2";
  }

  workspaceManagerUrl() {
    const url = new URL("../workspace-manager-v2/index.html", this.window.location.href);
    const hostContextId = this.runtimeParams.get("hostContextId") || "";
    if (hostContextId) {
      url.searchParams.set("hostContextId", hostContextId);
    }
    if (this.runtimeParams.get("workspaceMode")?.toLowerCase() === "uat") {
      url.searchParams.set("workspace", "uat");
    }
    return url.href;
  }

  configureWorkspaceNav() {
    const isWorkspaceLaunch = this.isWorkspaceLaunch();
    const toolNav = this.document.querySelector('[data-launch-mode-nav="tool"]');
    const workspaceNav = this.document.querySelector('[data-launch-mode-nav="workspace"]');
    const returnButton = this.document.getElementById("returnToWorkspaceButton");
    if (toolNav) {
      toolNav.hidden = isWorkspaceLaunch;
    }
    if (workspaceNav) {
      workspaceNav.hidden = !isWorkspaceLaunch;
    }
    if (returnButton) {
      returnButton.addEventListener("click", () => {
        this.window.location.href = this.workspaceManagerUrl();
      });
    }
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
      // Non-fatal: collapsed header state remains usable without fullscreen.
    }
  }

  async exitFullscreenIfActive() {
    if (!this.document.fullscreenElement || typeof this.document.exitFullscreen !== "function") {
      return;
    }
    try {
      await this.document.exitFullscreen();
    } catch {
      // Non-fatal: the fullscreenchange listener will resync if the browser exits later.
    }
  }

  bindHeaderDetails() {
    const details = this.getHeaderDetails();
    if (!(details instanceof HTMLDetailsElement)) {
      return;
    }

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

  init() {
    if (this.runtimeParams.get("mode") === "runtime") {
      return;
    }

    this.document.body.classList.add("tools-platform-surface", "preview-generator-v2-local-shell");
    this.configureWorkspaceNav();
    this.applyFullscreenState(Boolean(this.document.fullscreenElement));
    this.bindHeaderDetails();
    this.updateSummary();
  }
}

export { PreviewGeneratorV2ShellControl };
