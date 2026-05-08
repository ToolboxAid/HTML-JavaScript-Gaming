export class SessionInspectorV2App {
  constructor({
    accordions,
    copyJsonButton,
    data,
    deleteAllButton,
    dirty,
    entryList,
    filters,
    json,
    refreshButton,
    returnToWorkspaceButton,
    runtimeContract,
    statusLog,
    storageService,
    windowRef = window
  }) {
    this.accordions = accordions;
    this.copyJsonButton = copyJsonButton;
    this.data = data;
    this.deleteAllButton = deleteAllButton;
    this.dirty = dirty;
    this.entries = [];
    this.entryList = entryList;
    this.filters = filters;
    this.json = json;
    this.refreshButton = refreshButton;
    this.returnToWorkspaceButton = returnToWorkspaceButton;
    this.runtimeContract = runtimeContract || { storageAccess: "read-only" };
    this.statusLog = statusLog;
    this.storageService = storageService;
    this.selectedId = "";
    this.window = windowRef;
    this.document = this.window.document;
    this.suppressFullscreenSync = false;
  }

  start() {
    this.mountShell();
    this.configureWorkspaceNav();
    this.accordions.forEach((accordion) => accordion.mount());
    this.statusLog.mount();
    this.filters.mount({
      onFilterChanged: () => this.refresh({ silent: true })
    });
    this.entryList.mount({
      onDelete: (entryId) => this.deleteEntry(entryId),
      onSelected: (entryId) => this.selectEntry(entryId)
    });
    this.refreshButton.addEventListener("click", () => this.refresh());
    this.copyJsonButton.addEventListener("click", () => {
      void this.copyJson();
    });
    this.deleteAllButton.addEventListener("click", () => this.deleteAllShownEntries());
    this.returnToWorkspaceButton.addEventListener("click", () => this.returnToWorkspace());
    this.refresh({ silent: true });
    this.statusLog.ok(`Session Inspector V2 ready. Storage is ${this.runtimeContract.storageAccess}.`);
  }

  refresh({ silent = false } = {}) {
    this.entries = this.storageService.readEntries({
      filterText: this.filters.filterText(),
      scope: this.filters.scope()
    });
    if (!this.entries.some((entry) => entry.id === this.selectedId)) {
      this.selectedId = this.entries[0]?.id || "";
    }
    this.entryList.render(this.entries, this.selectedId);
    const selectedEntry = this.entries.find((entry) => entry.id === this.selectedId);
    this.json.render(selectedEntry);
    this.data.render(selectedEntry);
    this.dirty.render(selectedEntry);
    this.filters.setSummary(this.summaryCounts());
    if (!silent) {
      this.statusLog.ok(`Loaded ${this.entries.length} matching storage entries.`);
    }
  }

  summaryCounts() {
    const sessionCount = this.entries.filter((entry) => entry.storageType === "sessionStorage").length;
    const localCount = this.entries.filter((entry) => entry.storageType === "localStorage").length;
    const totalCount = this.entries.length;
    return { localCount, sessionCount, totalCount };
  }

  selectEntry(entryId) {
    this.selectedId = entryId;
    this.entryList.render(this.entries, this.selectedId);
    const entry = this.entries.find((candidate) => candidate.id === entryId);
    this.json.render(entry);
    this.data.render(entry);
    this.dirty.render(entry);
    if (entry) {
      this.statusLog.info(`Selected ${entry.storageType}:${entry.key}.`);
    }
  }

  deleteEntry(entryId) {
    const entry = this.entries.find((candidate) => candidate.id === entryId);
    if (!entry) {
      this.statusLog.warn(`Delete skipped: storage entry ${entryId || "(empty)"} is no longer shown.`);
      this.refresh({ silent: true });
      return;
    }
    const result = this.storageService.deleteEntry(entry);
    if (result.ok) {
      this.statusLog.ok(`Deleted ${entry.storageType}:${entry.key}.`);
    } else {
      this.statusLog.fail(`Delete failed for ${entry.storageType}:${entry.key}: ${result.message}`);
    }
    this.refresh({ silent: true });
  }

  deleteAllShownEntries() {
    if (!this.entries.length) {
      this.statusLog.warn("Delete All skipped: no matching storage entries are shown.");
      return;
    }
    const result = this.storageService.deleteEntries(this.entries);
    if (result.failed.length) {
      result.deleted.forEach((entry) => {
        this.statusLog.ok(`Deleted ${entry.storageType}:${entry.key}.`);
      });
      result.failed.forEach(({ entry, message }) => {
        this.statusLog.fail(`Delete failed for ${entry.storageType}:${entry.key}: ${message}`);
      });
    } else {
      this.statusLog.ok(`Deleted ${result.deleted.length} shown storage entr${result.deleted.length === 1 ? "y" : "ies"}.`);
    }
    this.selectedId = "";
    this.refresh({ silent: true });
  }

  async copyJson() {
    const jsonText = this.json.text().trim();
    if (!jsonText || jsonText === "{}") {
      this.statusLog.warn("Copy skipped: no JSON content is shown.");
      return;
    }
    if (typeof this.window.navigator?.clipboard?.writeText !== "function") {
      this.statusLog.fail("Copy failed: clipboard API is unavailable.");
      return;
    }
    try {
      await this.window.navigator.clipboard.writeText(jsonText);
      this.statusLog.ok("Copied JSON content to clipboard.");
    } catch (error) {
      this.statusLog.fail(`Copy failed: ${error.message}`);
    }
  }

  workspaceManagerUrl() {
    const url = new URL("../workspace-manager-v2/index.html", this.window.location.href);
    const params = new URLSearchParams(this.window.location.search || "");
    const hostContextId = params.get("hostContextId") || "";
    if (hostContextId) {
      url.searchParams.set("hostContextId", hostContextId);
    }
    if (params.get("workspaceMode")?.toLowerCase() === "uat") {
      url.searchParams.set("workspace", "uat");
    }
    return url.href;
  }

  returnToWorkspace() {
    this.window.location.href = this.workspaceManagerUrl();
  }

  isWorkspaceLaunch() {
    const params = new URLSearchParams(this.window.location.search || "");
    return params.get("launch") === "workspace" && params.get("fromTool") === "workspace-manager-v2";
  }

  configureWorkspaceNav() {
    const workspaceNav = this.document.querySelector('[data-launch-mode-nav="workspace"]');
    if (workspaceNav) {
      workspaceNav.hidden = !this.isWorkspaceLaunch();
    }
  }

  mountShell() {
    this.document.body.classList.add("tools-platform-surface", "session-inspector-v2-local-shell");
    this.applyFullscreenState(Boolean(this.document.fullscreenElement));
    this.bindHeaderDetails();
    this.updateSummary();
  }

  getHeaderDetails() {
    return this.document.querySelector(".is-collapsible");
  }

  getSummaryElement() {
    return this.document.querySelector("[data-session-inspector-v2-summary]");
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
    const isFullscreen = Boolean(this.document.fullscreenElement);
    const isExpanded = details.open === true;
    const headerText = "Session Inspector V2 - Session storage visibility";
    summary.textContent = isExpanded
      ? "Hide Header and Details"
      : (isFullscreen ? headerText : "Show Header and Details");
    summary.setAttribute("data-tools-platform-summary-active", "1");
    summary.setAttribute("data-tools-platform-summary-error", "0");
    summary.setAttribute("data-tools-platform-summary-state", isExpanded ? "expanded" : "collapsed");
    summary.setAttribute("data-tools-platform-summary-mode", isFullscreen ? "fullscreen" : "normal");
    summary.setAttribute("data-tool-id", "session-inspector-v2");
    summary.setAttribute("title", `${headerText}\nInspect and clear current-origin storage values without cross-tool handoff writes.`);
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

  bindHeaderDetails() {
    const details = this.getHeaderDetails();
    if (!(details instanceof HTMLDetailsElement) || details.dataset.sessionInspectorV2ShellBound === "true") {
      return;
    }
    details.dataset.sessionInspectorV2ShellBound = "true";
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
