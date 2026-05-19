const WORKSPACE_RETURN_HISTORY_CONTEXT_KEY = "workspace-manager-v2-return-history-context-id";

export class CollisionInspectorV2Shell {
  constructor({ documentRef = document, windowRef = window } = {}) {
    this.document = documentRef;
    this.window = windowRef;
    this.toolId = "collision-inspector-v2";
    this.toolName = "Collision Inspector V2";
    this.toolDescription = "Shared Manifest Collision Tool";
    this.headerText = `${this.toolName} - ${this.toolDescription}`;
    this.suppressFullscreenSync = false;
  }

  mount() {
    this.applyFullscreenState(Boolean(this.document.fullscreenElement));
    this.bindHeaderDetails();
    this.updateSummary();
  }

  getHeaderDetails() {
    return this.document.querySelector(".is-collapsible");
  }

  getSummaryElement() {
    return this.document.querySelector("[data-collision-inspector-summary]");
  }

  hostContextId() {
    return new URLSearchParams(this.window.location.search || "").get("hostContextId") || "";
  }

  isWorkspaceLaunch() {
    const params = new URLSearchParams(this.window.location.search || "");
    return params.get("launch") === "workspace"
      && params.get("fromTool") === "workspace-manager-v2"
      && Boolean(params.get("hostContextId"));
  }

  workspaceManagerUrl() {
    const url = new URL("../workspace-manager-v2/index.html", this.window.location.href);
    const params = new URLSearchParams(this.window.location.search || "");
    const hostContextId = this.hostContextId();
    if (hostContextId) {
      url.searchParams.set("hostContextId", hostContextId);
    }
    if (params.get("workspaceMode")?.toLowerCase() === "uat") {
      url.searchParams.set("workspace", "uat");
    }
    return url.href;
  }

  returnToWorkspace() {
    const hostContextId = this.hostContextId();
    if (this.window.sessionStorage.getItem(WORKSPACE_RETURN_HISTORY_CONTEXT_KEY) === hostContextId
      && this.window.history.length > 1) {
      this.window.history.back();
      return;
    }
    this.window.location.href = this.workspaceManagerUrl();
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
    summary.textContent = isExpanded
      ? "Hide Header and Details"
      : (isFullscreen ? this.headerText : "Show Header and Details");
    summary.setAttribute("data-tools-platform-summary-active", "1");
    summary.setAttribute("data-tools-platform-summary-error", "0");
    summary.setAttribute("data-tools-platform-summary-state", isExpanded ? "expanded" : "collapsed");
    summary.setAttribute("data-tools-platform-summary-mode", isFullscreen ? "fullscreen" : "normal");
    summary.setAttribute("data-tool-id", this.toolId);
    summary.setAttribute("title", this.headerText);
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
      // Collapsed header remains usable when fullscreen is unavailable.
    }
  }

  async exitFullscreenIfActive() {
    if (!this.document.fullscreenElement || typeof this.document.exitFullscreen !== "function") {
      return;
    }
    try {
      await this.document.exitFullscreen();
    } catch {
      // The fullscreenchange listener will resync if the browser exits later.
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
}
