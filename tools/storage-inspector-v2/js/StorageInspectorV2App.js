import SessionStorageService from '/src/engine/persistence/SessionStorageService.js';

const WORKSPACE_RETURN_HISTORY_CONTEXT_KEY = "workspace-manager-v2-return-history-context-id";

export class StorageInspectorV2App {
  constructor({
    accordions,
    clearAllButton,
    clearLocalButton,
    clearSessionButton,
    clearToolStateButton,
    copyAllButton,
    data,
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
    this.clearAllButton = clearAllButton;
    this.clearLocalButton = clearLocalButton;
    this.clearSessionButton = clearSessionButton;
    this.clearToolStateButton = clearToolStateButton;
    this.copyAllButton = copyAllButton;
    this.data = data;
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
    this.sessionStorage = new SessionStorageService(this.window.sessionStorage);
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
    this.copyAllButton.addEventListener("click", () => {
      void this.copyAll();
    });
    this.clearSessionButton.addEventListener("click", () => this.clearStorageAction("session", () => this.storageService.clearSessionStorage()));
    this.clearLocalButton.addEventListener("click", () => this.clearStorageAction("local", () => this.storageService.clearLocalStorage()));
    this.clearToolStateButton.addEventListener("click", () => this.clearStorageAction("workspace tool state", () => this.storageService.clearToolState()));
    this.clearAllButton.addEventListener("click", () => this.clearStorageAction("all", () => this.storageService.clearAllStorage()));
    this.returnToWorkspaceButton.addEventListener("click", () => this.returnToWorkspace());
    this.refresh({ silent: true });
    this.statusLog.ok(`Storage Inspector V2 ready. Storage is ${this.runtimeContract.storageAccess}.`);
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
    const cookieCount = this.entries.filter((entry) => entry.storageType === "cookies").length;
    const totalCount = this.entries.length;
    return { cookieCount, localCount, sessionCount, totalCount };
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
      const runtimeBinding = this.runtimeBindingForEntry(entry);
      if (runtimeBinding) {
        this.statusLog.info(`Runtime binding status for ${entry.storageType}:${entry.key}: hasLiveRepoHandle=${runtimeBinding.hasLiveRepoHandle}; sourceBindingState=${runtimeBinding.sourceBindingState}; boundManifestPath=${runtimeBinding.boundManifestPath || "(none)"}; bindingSource=${runtimeBinding.bindingSource || "(none)"}.`);
      }
    }
  }

  runtimeBindingForEntry(entry) {
    const value = entry?.parseOk ? entry.parsedValue : null;
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return null;
    }
    const candidate = Object.prototype.hasOwnProperty.call(value, "hasLiveRepoHandle")
      ? value
      : value.workspace;
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
      return null;
    }
    if (!Object.prototype.hasOwnProperty.call(candidate, "hasLiveRepoHandle")
      || !Object.prototype.hasOwnProperty.call(candidate, "sourceBindingState")
      || !Object.prototype.hasOwnProperty.call(candidate, "boundManifestPath")
      || !Object.prototype.hasOwnProperty.call(candidate, "bindingSource")) {
      return null;
    }
    return {
      hasLiveRepoHandle: candidate.hasLiveRepoHandle === true,
      sourceBindingState: String(candidate.sourceBindingState || "unknown"),
      boundManifestPath: String(candidate.boundManifestPath || ""),
      bindingSource: String(candidate.bindingSource || "")
    };
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

  clearStorageAction(label, action) {
    const result = action();
    if (!result.deleted.length && !result.failed.length) {
      this.statusLog.warn(`Clear ${label} skipped: no matching storage entries were found.`);
      this.refresh({ silent: true });
      return;
    }
    result.deleted.forEach((entry) => {
      this.statusLog.ok(`Deleted ${entry.storageType}:${entry.key}.`);
    });
    if (result.failed.length) {
      result.failed.forEach(({ entry, message }) => {
        this.statusLog.fail(`Delete failed for ${entry.storageType}:${entry.key}: ${message}`);
      });
    }
    this.statusLog.ok(`Cleared ${result.deleted.length} ${label} storage entr${result.deleted.length === 1 ? "y" : "ies"}.`);
    this.selectedId = "";
    this.refresh({ silent: true });
  }

  selectedStorageLabel(entry) {
    return entry ? `${entry.storageType}:${entry.key}` : "(none)";
  }

  copyAllPayload(entry) {
    const storageLine = `Storage: ${this.selectedStorageLabel(entry)}`;
    return [
      "=== JSON ===",
      storageLine,
      this.json.text().trim(),
      "",
      "=== Data ===",
      storageLine,
      this.data.text().trim(),
      "",
      "=== Dirty ===",
      storageLine,
      this.dirty.text().trim()
    ].join("\n");
  }

  missingSelectedSections(entry) {
    const value = entry?.parseOk ? entry.parsedValue : null;
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return ["Data", "Dirty"];
    }
    return ["Data", "Dirty"].filter((sectionName) => (
      !Object.prototype.hasOwnProperty.call(value, sectionName.toLowerCase())
    ));
  }

  async copyAll() {
    const selectedEntry = this.entries.find((entry) => entry.id === this.selectedId);
    if (!selectedEntry) {
      this.statusLog.fail("Copy All failed: select a storage entry before copying JSON, Data, and Dirty.");
      return;
    }
    const jsonText = this.json.text().trim();
    if (!jsonText) {
      this.statusLog.warn("Copy All skipped: no JSON content is shown for the selected storage entry.");
      return;
    }
    if (typeof this.window.navigator?.clipboard?.writeText !== "function") {
      this.statusLog.fail("Copy All failed: clipboard API is unavailable.");
      return;
    }
    const payload = this.copyAllPayload(selectedEntry);
    const missingSections = this.missingSelectedSections(selectedEntry);
    try {
      await this.window.navigator.clipboard.writeText(payload);
      if (missingSections.length) {
        this.statusLog.warn(`Copied JSON, Data, and Dirty sections with empty-state text for missing ${missingSections.join(" and ")}.`);
        return;
      }
      this.statusLog.ok("Copied JSON, Data, and Dirty sections to clipboard.");
    } catch (error) {
      this.statusLog.fail(`Copy All failed: ${error.message}`);
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
    const targetUrl = this.workspaceManagerUrl();
    const params = new URLSearchParams(this.window.location.search || "");
    const hostContextId = params.get("hostContextId") || "";
    if (this.sessionStorage.getItem(WORKSPACE_RETURN_HISTORY_CONTEXT_KEY, null) === hostContextId
      && this.window.history.length > 1) {
      this.window.history.back();
      return;
    }
    this.window.location.href = targetUrl;
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
    this.document.body.classList.add("tools-platform-surface", "storage-inspector-v2-local-shell");
    this.applyFullscreenState(Boolean(this.document.fullscreenElement));
    this.bindHeaderDetails();
    this.updateSummary();
  }

  getHeaderDetails() {
    return this.document.querySelector(".is-collapsible");
  }

  getSummaryElement() {
    return this.document.querySelector("[data-storage-inspector-v2-summary]");
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
    const headerText = "Storage Inspector V2 - Browser storage visibility";
    summary.textContent = isExpanded
      ? "Hide Header and Details"
      : (isFullscreen ? headerText : "Show Header and Details");
    summary.setAttribute("data-tools-platform-summary-active", "1");
    summary.setAttribute("data-tools-platform-summary-error", "0");
    summary.setAttribute("data-tools-platform-summary-state", isExpanded ? "expanded" : "collapsed");
    summary.setAttribute("data-tools-platform-summary-mode", isFullscreen ? "fullscreen" : "normal");
    summary.setAttribute("data-tool-id", "storage-inspector-v2");
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
    if (!(details instanceof HTMLDetailsElement) || details.dataset.storageInspectorV2ShellBound === "true") {
      return;
    }
    details.dataset.storageInspectorV2ShellBound = "true";
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
