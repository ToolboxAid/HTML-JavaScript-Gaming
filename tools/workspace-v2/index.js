class WorkspaceV2SessionProducer {
  constructor() {
    document.title = "Workspace V2";
    document.body.dataset.toolId = "workspace-v2";
    this.libraryStorageKey = "v2-session-library";
    this.historyStorageKey = "v2-session-history";
    this.errorLogsStorageKey = "v2-error-logs";
    this.mergeAuditStorageKey = "v2-merge-audit-log";
    this.sessionSelectionStorageKey = "v2-session-selection";
    this.historyMaxEntries = 10;
    this.urlLengthLimit = 2000;
    this.sessionPayloadBytesLimit = 1024 * 1024;
    this.toolSelect = document.getElementById("workspaceV2ToolSelect");
    this.backButton = document.getElementById("workspaceV2BackButton");
    this.loadFixtureButton = document.getElementById("workspaceV2LoadFixtureButton");
    this.launchButton = document.getElementById("workspaceV2LaunchButton");
    this.importJsonNode = document.getElementById("workspaceV2ImportJson");
    this.importFileNode = document.getElementById("workspaceV2ImportFile");
    this.importButton = document.getElementById("workspaceV2ImportButton");
    this.exportButton = document.getElementById("workspaceV2ExportButton");
    this.shareUrlNode = document.getElementById("workspaceV2ShareUrl");
    this.createShareLinkButton = document.getElementById("workspaceV2CreateShareLinkButton");
    this.applyShareLinkButton = document.getElementById("workspaceV2ApplyShareLinkButton");
    this.sessionNameNode = document.getElementById("workspaceV2SessionName");
    this.saveSessionButton = document.getElementById("workspaceV2SaveSessionButton");
    this.overwriteSessionButton = document.getElementById("workspaceV2OverwriteSessionButton");
    this.loadSessionButton = document.getElementById("workspaceV2LoadSessionButton");
    this.deleteSessionButton = document.getElementById("workspaceV2DeleteSessionButton");
    this.libraryStatusNode = document.getElementById("workspaceV2LibraryStatus");
    this.libraryEmptyState = document.getElementById("workspaceV2LibraryEmptyState");
    this.sessionListNode = document.getElementById("workspaceV2SessionList");
    this.refreshSessionHistoryButton = document.getElementById("workspaceV2RefreshSessionHistoryButton");
    this.sessionHistoryEmptyState = document.getElementById("workspaceV2SessionHistoryEmptyState");
    this.sessionHistoryListNode = document.getElementById("workspaceV2SessionHistoryList");
    this.diffLeftSelect = document.getElementById("workspaceV2DiffLeftSelect");
    this.diffRightSelect = document.getElementById("workspaceV2DiffRightSelect");
    this.diffLeftSelectedLabelNode = document.getElementById("workspaceV2DiffLeftSelectedLabel");
    this.diffRightSelectedLabelNode = document.getElementById("workspaceV2DiffRightSelectedLabel");
    this.diffSelectionStateNode = document.getElementById("workspaceV2DiffSelectionState");
    this.computeDiffButton = document.getElementById("workspaceV2ComputeDiffButton");
    this.diffEmptyState = document.getElementById("workspaceV2DiffEmptyState");
    this.diffOutputNode = document.getElementById("workspaceV2DiffOutput");
    this.mergeLeftSelect = document.getElementById("workspaceV2MergeLeftSelect");
    this.mergeRightSelect = document.getElementById("workspaceV2MergeRightSelect");
    this.mergeLeftSelectedLabelNode = document.getElementById("workspaceV2MergeLeftSelectedLabel");
    this.mergeRightSelectedLabelNode = document.getElementById("workspaceV2MergeRightSelectedLabel");
    this.mergeSelectionStateNode = document.getElementById("workspaceV2MergeSelectionState");
    this.computeMergeButton = document.getElementById("workspaceV2ComputeMergeButton");
    this.confirmMergeButton = document.getElementById("workspaceV2ConfirmMergeButton");
    this.applyMergeButton = document.getElementById("workspaceV2ApplyMergeButton");
    this.mergeEmptyState = document.getElementById("workspaceV2MergeEmptyState");
    this.mergeOutputNode = document.getElementById("workspaceV2MergeOutput");
    this.refreshErrorLogsButton = document.getElementById("workspaceV2RefreshErrorLogsButton");
    this.clearErrorLogsButton = document.getElementById("workspaceV2ClearErrorLogsButton");
    this.errorLogsEmptyState = document.getElementById("workspaceV2ErrorLogsEmptyState");
    this.errorLogsListNode = document.getElementById("workspaceV2ErrorLogsList");
    this.refreshDiagnosticsButton = document.getElementById("workspaceV2RefreshDiagnosticsButton");
    this.exportSnapshotButton = document.getElementById("workspaceV2ExportSnapshotButton");
    this.diagnosticsActiveStateNode = document.getElementById("workspaceV2DiagnosticsActiveState");
    this.diagnosticsHostContextIdNode = document.getElementById("workspaceV2DiagnosticsHostContextId");
    this.diagnosticsUrlParamsNode = document.getElementById("workspaceV2DiagnosticsUrlParams");
    this.diagnosticsSessionStorageNode = document.getElementById("workspaceV2DiagnosticsSessionStorage");
    this.diagnosticsSessionLibraryNode = document.getElementById("workspaceV2DiagnosticsSessionLibrary");
    this.diagnosticsErrorLogsNode = document.getElementById("workspaceV2DiagnosticsErrorLogs");
    this.diagnosticsPayloadNode = document.getElementById("workspaceV2DiagnosticsPayload");
    this.snapshotOutputNode = document.getElementById("workspaceV2SnapshotOutput");
    this.clearSessionStorageButton = document.getElementById("workspaceV2ClearSessionStorageButton");
    this.clearSavedSessionsButton = document.getElementById("workspaceV2ClearSavedSessionsButton");
    this.resetClearErrorLogsButton = document.getElementById("workspaceV2ResetClearErrorLogsButton");
    this.fullResetButton = document.getElementById("workspaceV2FullResetButton");
    this.statusNode = document.getElementById("workspaceV2Status");
    this.currentSessionPayload = null;
    this.currentSessionSource = "";
    this.currentHostContextId = "";
    this.pendingMergePreview = null;
    this.recentSessionInventory = [];
    this.loadFixtureButton.addEventListener("click", () => {
      this.loadSelectedFixture();
    });
    this.launchButton.addEventListener("click", () => {
      this.createSessionAndLaunch();
    });
    this.importButton.addEventListener("click", () => {
      this.importSessionJson();
    });
    this.exportButton.addEventListener("click", () => {
      this.exportCurrentSessionJson();
    });
    this.createShareLinkButton.addEventListener("click", () => {
      this.createShareLink();
    });
    this.applyShareLinkButton.addEventListener("click", () => {
      this.applyShareLink();
    });
    this.importFileNode.addEventListener("change", () => {
      this.readImportFile();
    });
    this.saveSessionButton.addEventListener("click", () => {
      this.saveNamedSession(false);
    });
    this.overwriteSessionButton.addEventListener("click", () => {
      this.saveNamedSession(true);
    });
    this.loadSessionButton.addEventListener("click", () => {
      this.loadNamedSession();
    });
    this.deleteSessionButton.addEventListener("click", () => {
      this.deleteNamedSession();
    });
    this.refreshSessionHistoryButton.addEventListener("click", () => {
      this.renderSessionHistory();
    });
    this.computeDiffButton.addEventListener("click", () => {
      this.computeSelectedSessionDiff();
    });
    this.diffLeftSelect.addEventListener("change", () => {
      this.updateDiffSelectionFeedbackAndState();
    });
    this.diffRightSelect.addEventListener("change", () => {
      this.updateDiffSelectionFeedbackAndState();
    });
    this.computeMergeButton.addEventListener("click", () => {
      this.computeSelectedSessionMerge();
    });
    this.mergeLeftSelect.addEventListener("change", () => {
      this.updateMergeSelectionFeedbackAndState();
    });
    this.mergeRightSelect.addEventListener("change", () => {
      this.updateMergeSelectionFeedbackAndState();
    });
    this.confirmMergeButton.addEventListener("click", () => {
      this.confirmSelectedSessionMergePreview();
    });
    this.applyMergeButton.addEventListener("click", () => {
      this.applySelectedSessionMerge();
    });
    this.refreshErrorLogsButton.addEventListener("click", () => {
      this.renderErrorLogsViewer();
    });
    this.clearErrorLogsButton.addEventListener("click", () => {
      this.clearErrorLogs();
    });
    this.refreshDiagnosticsButton.addEventListener("click", () => {
      this.renderDiagnosticsPanel();
    });
    this.exportSnapshotButton.addEventListener("click", () => {
      this.exportRuntimeSnapshot();
    });
    this.clearSessionStorageButton.addEventListener("click", () => {
      this.clearSessionStorage();
    });
    this.clearSavedSessionsButton.addEventListener("click", () => {
      this.clearSavedSessions();
    });
    this.resetClearErrorLogsButton.addEventListener("click", () => {
      this.clearErrorLogs();
    });
    this.fullResetButton.addEventListener("click", () => {
      this.fullReset();
    });
    this.backButton.addEventListener("click", () => {
      window.location.href = "../index.html";
    });
    window.addEventListener("storage", (event) => {
      if (event.key === this.errorLogsStorageKey) {
        this.renderErrorLogsViewer();
      }
      if (event.key === this.errorLogsStorageKey || event.key === this.libraryStorageKey) {
        this.renderDiagnosticsPanel();
      }
      if (event.key === this.historyStorageKey) {
        this.renderSessionHistory();
      }
    });
    this.decodeSessionParamFromUrl();
    this.registerSnapshotHook();
    this.renderSessionLibrary();
    this.renderSessionHistory();
    this.renderSessionDiffInputs();
    this.renderSessionMergeInputs();
    this.renderErrorLogsViewer();
    this.renderDiagnosticsPanel();
  }

  selectedToolId() {
    return typeof this.toolSelect.value === "string" ? this.toolSelect.value.trim() : "";
  }

  selectedSessionName() {
    return typeof this.sessionNameNode.value === "string" ? this.sessionNameNode.value.trim() : "";
  }

  setLibraryStatus(message) {
    this.libraryStatusNode.textContent = message;
    this.statusNode.textContent = message;
  }

  readActiveSessionPayloadForLibraryActions() {
    if (!this.currentHostContextId || typeof this.currentHostContextId !== "string" || !this.currentHostContextId.trim()) {
      return null;
    }
    const raw = sessionStorage.getItem(this.currentHostContextId.trim());
    if (typeof raw !== "string") {
      return null;
    }
    const parsed = this.safeParseJson(raw);
    if (!parsed.ok || !this.isValidSessionPayload(parsed.value)) {
      return null;
    }
    return parsed.value;
  }

  readSessionPayloadFromRecentSessionId(sessionId) {
    if (typeof sessionId !== "string" || !sessionId.trim()) {
      return null;
    }
    const history = this.readSessionHistory();
    const recentEntry = history.find((entry) => entry.hostContextId === sessionId.trim());
    if (!recentEntry) {
      return null;
    }
    return this.resolveSessionPayloadFromContextId(sessionId.trim(), recentEntry.payload);
  }

  readSessionPayloadForLibraryWrite(sessionId) {
    if (typeof sessionId !== "string" || !sessionId.trim()) {
      return null;
    }
    const raw = sessionStorage.getItem(sessionId.trim());
    if (typeof raw !== "string") {
      return null;
    }
    const parsed = this.safeParseJson(raw);
    if (!parsed.ok || !this.isValidSessionPayload(parsed.value)) {
      return null;
    }
    return parsed.value;
  }

  looksLikeWorkspaceHostContextId(sessionId) {
    if (typeof sessionId !== "string" || !sessionId.trim()) {
      return false;
    }
    return /-v2-\d{13}-[a-z0-9]{8}$/i.test(sessionId.trim());
  }

  cleanupStaleInvalidSavedEntries(library) {
    if (!library || typeof library !== "object" || Array.isArray(library)) {
      return false;
    }
    let removedAny = false;
    Object.keys(library).forEach((sessionId) => {
      const payload = library[sessionId];
      if (!this.isValidSessionPayload(payload)) {
        return;
      }
      if (!this.looksLikeWorkspaceHostContextId(sessionId)) {
        return;
      }
      const storagePayload = this.readSessionPayloadForLibraryWrite(sessionId);
      const hasMatchingStorage = this.isValidSessionPayload(storagePayload);
      const payloadHostContextId = typeof payload.hostContextId === "string" ? payload.hostContextId.trim() : "";
      const payloadToolId = typeof payload.toolId === "string" ? payload.toolId.trim() : "";
      const idMatchesPayloadHostContext = payloadHostContextId && payloadHostContextId === sessionId;
      const idMatchesToolMetadata = payloadToolId && sessionId.startsWith(`${payloadToolId}-`);
      if (!hasMatchingStorage && !idMatchesPayloadHostContext && !idMatchesToolMetadata) {
        delete library[sessionId];
        removedAny = true;
      }
    });
    return removedAny;
  }

  fixturePathForTool(toolId) {
    return `../../tests/fixtures/v2-tools/${toolId}.json`;
  }

  setCurrentSessionPayload(sessionPayload, sourceLabel) {
    this.currentSessionPayload = sessionPayload;
    this.currentSessionSource = sourceLabel;
    this.renderDiagnosticsPanel();
  }

  isValidSessionPayload(sessionPayload) {
    return Boolean(sessionPayload && typeof sessionPayload === "object" && !Array.isArray(sessionPayload));
  }

  sessionPayloadMetrics(sessionPayload) {
    const serializedPayload = JSON.stringify(sessionPayload);
    return {
      serializedPayload,
      bytes: new TextEncoder().encode(serializedPayload).length
    };
  }

  validateSessionPayloadSize(sessionPayload) {
    const metrics = this.sessionPayloadMetrics(sessionPayload);
    if (metrics.bytes > this.sessionPayloadBytesLimit) {
      return {
        ok: false,
        message: `Session size exceeds allowed limit. Payload is ${metrics.bytes} bytes and limit is ${this.sessionPayloadBytesLimit} bytes.`,
        metrics
      };
    }
    return { ok: true, message: "", metrics };
  }

  withSessionVersion(sessionPayload) {
    return {
      ...sessionPayload,
      version: "v2"
    };
  }

  applySessionPayload(sessionPayload, sourceLabel) {
    if (!this.isValidSessionPayload(sessionPayload)) {
      this.statusNode.textContent = "Session payload is invalid. Expected a JSON object payload.";
      return false;
    }
    const toolId = this.selectedToolId();
    if (!toolId) {
      this.statusNode.textContent = "Select a V2 tool before applying session payload.";
      return false;
    }
    const versionedPayload = this.withSessionVersion(sessionPayload);
    const sizeValidation = this.validateSessionPayloadSize(versionedPayload);
    if (!sizeValidation.ok) {
      this.statusNode.textContent = sizeValidation.message;
      return false;
    }
    const hostContextId = this.createHostContextId(toolId);
    sessionStorage.setItem(hostContextId, sizeValidation.metrics.serializedPayload);
    this.currentHostContextId = hostContextId;
    this.setCurrentSessionPayload(versionedPayload, sourceLabel);
    this.importJsonNode.value = JSON.stringify(versionedPayload, null, 2);
    this.renderDiagnosticsPanel();
    return true;
  }

  encodeSessionPayload(sessionPayload) {
    const json = JSON.stringify(sessionPayload);
    const bytes = new TextEncoder().encode(json);
    let binary = "";
    for (let index = 0; index < bytes.length; index += 1) {
      binary += String.fromCharCode(bytes[index]);
    }
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  decodeSessionPayload(encodedPayload) {
    if (typeof encodedPayload !== "string" || !encodedPayload.trim()) {
      throw new Error("Missing encoded session payload.");
    }
    if (encodedPayload.trim().length > this.urlLengthLimit) {
      throw new Error(`Session size exceeds allowed limit for URL payload. Encoded payload length is ${encodedPayload.trim().length} and limit is ${this.urlLengthLimit}.`);
    }
    const normalized = encodedPayload.trim().replace(/-/g, "+").replace(/_/g, "/");
    const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
    const binary = atob(`${normalized}${padding}`);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json);
    if (!this.isValidSessionPayload(parsed)) {
      throw new Error("Decoded session payload is invalid. Expected an object payload.");
    }
    return parsed;
  }

  decodeSessionParamFromUrl() {
    const params = new URL(window.location.href).searchParams;
    if (!params.has("session")) {
      return;
    }
    try {
      const decoded = this.decodeSessionPayload(params.get("session"));
      if (!this.applySessionPayload(decoded, "share-link")) {
        return;
      }
      this.statusNode.textContent = `Share session link decoded.\nTool: ${this.selectedToolId()}\nHostContextId: ${this.currentHostContextId}\nReady to launch.`;
      this.shareUrlNode.value = window.location.href;
    } catch (error) {
      this.statusNode.textContent = `Share session decode failed: ${error instanceof Error ? error.message : "unknown error"}`;
    }
  }

  readSessionLibrary() {
    const rawLibrary = localStorage.getItem(this.libraryStorageKey);
    if (!rawLibrary) {
      return {};
    }
    try {
      const parsed = JSON.parse(rawLibrary);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        this.statusNode.textContent = "Session library is invalid. Expected object map under localStorage key v2-session-library.";
        return null;
      }
      for (const sessionName of Object.keys(parsed)) {
        if (!this.isValidSessionPayload(parsed[sessionName])) {
          this.statusNode.textContent = `Session library entry '${sessionName}' is invalid.`;
          return null;
        }
      }
      return parsed;
    } catch (error) {
      this.statusNode.textContent = `Session library parse failed: ${error instanceof Error ? error.message : "unknown error"}`;
      return null;
    }
  }

  writeSessionLibrary(library) {
    localStorage.setItem(this.libraryStorageKey, JSON.stringify(library));
    this.renderSessionDiffInputs();
    this.renderSessionMergeInputs();
    this.renderDiagnosticsPanel();
  }

  renderSessionLibrary() {
    const library = this.readSessionLibrary();
    if (library === null) {
      this.sessionListNode.replaceChildren();
      this.libraryEmptyState.hidden = false;
      this.libraryEmptyState.textContent = "Session library is invalid. Fix stored JSON or clear v2-session-library.";
      return;
    }
    if (this.cleanupStaleInvalidSavedEntries(library)) {
      localStorage.setItem(this.libraryStorageKey, JSON.stringify(library));
    }
    const sessionNames = Object.keys(library).sort((left, right) => left.localeCompare(right));
    this.sessionListNode.replaceChildren();
    this.libraryEmptyState.hidden = sessionNames.length > 0;
    this.libraryEmptyState.textContent = "No saved sessions in library.";
    sessionNames.forEach((sessionName) => {
      const item = document.createElement("li");
      const payload = library[sessionName];
      const label = document.createElement("strong");
      const idLine = document.createElement("div");
      const idLabel = document.createElement("span");
      const idCode = document.createElement("code");
      const copyIdButton = document.createElement("button");
      const useInLibraryButton = document.createElement("button");
      const loadButton = document.createElement("button");
      const deleteSavedButton = document.createElement("button");
      const readableLabel = payload && typeof payload.toolId === "string" && payload.toolId.trim()
        ? payload.toolId.trim()
        : "saved-session";
      label.textContent = `${readableLabel} (${sessionName})`;
      idLabel.textContent = "Session ID: ";
      idCode.textContent = sessionName;
      idCode.title = sessionName;
      idLine.append(idLabel, idCode);
      copyIdButton.type = "button";
      copyIdButton.textContent = "Copy ID";
      copyIdButton.addEventListener("click", () => {
        this.copySavedSessionIdToClipboard(sessionName);
      });
      useInLibraryButton.type = "button";
      useInLibraryButton.textContent = "Use in Library";
      useInLibraryButton.addEventListener("click", () => {
        this.useSavedSessionIdInLibraryInput(sessionName);
      });
      loadButton.type = "button";
      loadButton.textContent = "Load";
      loadButton.addEventListener("click", () => {
        this.loadSavedSessionById(sessionName);
      });
      deleteSavedButton.type = "button";
      deleteSavedButton.textContent = "Delete Saved";
      deleteSavedButton.addEventListener("click", () => {
        this.deleteSavedSessionById(sessionName);
      });
      item.append(label, idLine, copyIdButton, useInLibraryButton, loadButton, deleteSavedButton);
      this.sessionListNode.appendChild(item);
    });
    this.renderSessionDiffInputs();
    this.renderSessionMergeInputs();
  }

  async copySavedSessionIdToClipboard(sessionId) {
    if (typeof sessionId !== "string" || !sessionId.trim()) {
      this.setLibraryStatus("Copy ID failed: saved session ID is missing.");
      return;
    }
    try {
      if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
        this.setLibraryStatus("Copy ID is unavailable in this browser context.");
        return;
      }
      await navigator.clipboard.writeText(sessionId.trim());
      this.setLibraryStatus(`Saved session ID copied: ${sessionId.trim()}`);
    } catch (error) {
      this.setLibraryStatus(`Copy ID failed: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  }

  useSavedSessionIdInLibraryInput(sessionId) {
    if (typeof sessionId !== "string" || !sessionId.trim()) {
      this.setLibraryStatus("Use in Library failed: saved session ID is missing.");
      return;
    }
    this.sessionNameNode.value = sessionId.trim();
    this.syncDiffAndMergeSelectionSlotsFromContextId(sessionId.trim());
    this.setLibraryStatus(`Saved session ID ready for Library actions: ${sessionId.trim()}`);
  }

  loadSavedSessionById(sessionId) {
    if (typeof sessionId !== "string" || !sessionId.trim()) {
      this.setLibraryStatus("Enter a saved session ID before loading.");
      return;
    }
    this.sessionNameNode.value = sessionId.trim();
    this.loadNamedSession();
    this.syncDiffAndMergeSelectionSlotsFromContextId(sessionId.trim());
    this.renderSessionLibrary();
  }

  deleteSavedSessionById(sessionId) {
    if (typeof sessionId !== "string" || !sessionId.trim()) {
      this.setLibraryStatus("Enter a saved session ID before deleting.");
      return;
    }
    this.sessionNameNode.value = sessionId.trim();
    this.deleteNamedSession();
  }

  isValidSessionHistoryEntry(entry) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return false;
    if (typeof entry.hostContextId !== "string" || !entry.hostContextId.trim()) return false;
    if (typeof entry.tool !== "string" || !entry.tool.trim()) return false;
    if (typeof entry.timestamp !== "string" || !entry.timestamp.trim()) return false;
    if (!this.isValidSessionPayload(entry.payload)) return false;
    return true;
  }

  readSessionHistory() {
    const rawHistory = localStorage.getItem(this.historyStorageKey);
    if (!rawHistory) {
      return [];
    }
    let parsedHistory = null;
    try {
      parsedHistory = JSON.parse(rawHistory);
    } catch (error) {
      console.warn(`[WorkspaceV2SessionHistory] Ignoring invalid v2-session-history JSON: ${error instanceof Error ? error.message : "unknown error"}`);
      return [];
    }
    if (!Array.isArray(parsedHistory)) {
      console.warn("[WorkspaceV2SessionHistory] Ignoring invalid v2-session-history value: expected array.");
      return [];
    }
    const validEntries = [];
    let invalidCount = 0;
    parsedHistory.forEach((entry) => {
      if (this.isValidSessionHistoryEntry(entry)) {
        validEntries.push(entry);
        return;
      }
      invalidCount += 1;
    });
    if (invalidCount > 0) {
      console.warn(`[WorkspaceV2SessionHistory] Ignored ${invalidCount} invalid history entr${invalidCount === 1 ? "y" : "ies"}.`);
    }
    return validEntries;
  }

  writeSessionHistory(entries) {
    localStorage.setItem(this.historyStorageKey, JSON.stringify(entries));
    this.renderSessionDiffInputs();
    this.renderSessionMergeInputs();
    this.renderDiagnosticsPanel();
  }

  addRecentSessionEntry(hostContextId, toolId, payload) {
    if (typeof hostContextId !== "string" || !hostContextId.trim()) return;
    if (typeof toolId !== "string" || !toolId.trim()) return;
    if (!this.isValidSessionPayload(payload)) return;

    const history = this.readSessionHistory();
    const deduped = history.filter((entry) => entry.hostContextId !== hostContextId.trim());
    deduped.unshift({
      hostContextId: hostContextId.trim(),
      tool: toolId.trim(),
      timestamp: new Date().toISOString(),
      payload
    });
    if (deduped.length > this.historyMaxEntries) {
      deduped.length = this.historyMaxEntries;
    }
    this.writeSessionHistory(deduped);
    this.renderSessionHistory();
  }

  renderSessionHistory() {
    const history = this.readSessionHistory();
    this.recentSessionInventory = this.buildRecentSessionInventory(history);
    this.sessionHistoryListNode.replaceChildren();
    this.sessionHistoryEmptyState.hidden = history.length > 0;
    this.sessionHistoryEmptyState.textContent = "No recent sessions.";
    history.forEach((entry) => {
      const item = document.createElement("li");
      const title = document.createElement("strong");
      const idLine = document.createElement("div");
      const idLabel = document.createElement("span");
      const idCode = document.createElement("code");
      const meta = document.createElement("div");
      const reopenButton = document.createElement("button");
      const copyIdButton = document.createElement("button");
      const useInLibraryButton = document.createElement("button");
      const deleteRecentButton = document.createElement("button");
      title.textContent = `${entry.tool} (${entry.hostContextId})`;
      idLabel.textContent = "Session ID: ";
      idCode.textContent = entry.hostContextId;
      idCode.title = entry.hostContextId;
      idLine.append(idLabel, idCode);
      meta.textContent = entry.timestamp;
      reopenButton.type = "button";
      reopenButton.textContent = "Reopen";
      reopenButton.addEventListener("click", () => {
        this.reopenSessionHistoryEntry(entry.hostContextId);
      });
      copyIdButton.type = "button";
      copyIdButton.textContent = "Copy ID";
      copyIdButton.addEventListener("click", () => {
        this.copySessionIdToClipboard(entry.hostContextId);
      });
      useInLibraryButton.type = "button";
      useInLibraryButton.textContent = "Use in Library";
      useInLibraryButton.addEventListener("click", () => {
        this.useSessionIdInLibraryInput(entry.hostContextId);
      });
      deleteRecentButton.type = "button";
      deleteRecentButton.textContent = "Delete";
      deleteRecentButton.addEventListener("click", () => {
        this.deleteRecentSessionEntry(entry.hostContextId);
      });
      item.append(title, idLine, meta, reopenButton, copyIdButton, useInLibraryButton, deleteRecentButton);
      this.sessionHistoryListNode.appendChild(item);
    });
    this.renderSessionDiffInputs();
    this.renderSessionMergeInputs();
  }

  async copySessionIdToClipboard(hostContextId) {
    if (typeof hostContextId !== "string" || !hostContextId.trim()) {
      this.statusNode.textContent = "Copy ID failed: session ID is missing.";
      return;
    }
    try {
      if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
        this.statusNode.textContent = "Copy ID is unavailable in this browser context.";
        return;
      }
      await navigator.clipboard.writeText(hostContextId.trim());
      this.statusNode.textContent = `Session ID copied: ${hostContextId.trim()}`;
    } catch (error) {
      this.statusNode.textContent = `Copy ID failed: ${error instanceof Error ? error.message : "unknown error"}`;
    }
  }

  useSessionIdInLibraryInput(hostContextId) {
    if (typeof hostContextId !== "string" || !hostContextId.trim()) {
      this.statusNode.textContent = "Use in Library failed: session ID is missing.";
      return;
    }
    this.sessionNameNode.value = hostContextId.trim();
    this.statusNode.textContent = `Session ID ready for Library actions: ${hostContextId.trim()}`;
  }

  deleteRecentSessionEntry(hostContextId) {
    if (typeof hostContextId !== "string" || !hostContextId.trim()) {
      this.statusNode.textContent = "Delete Recent failed: session ID is missing.";
      return;
    }
    const sessionId = hostContextId.trim();
    const history = this.readSessionHistory();
    const exists = history.some((entry) => entry.hostContextId === sessionId);
    if (!exists) {
      this.statusNode.textContent = `Recent session '${sessionId}' was not found.`;
      return;
    }
    const nextHistory = history.filter((entry) => entry.hostContextId !== sessionId);
    this.writeSessionHistory(nextHistory);
    sessionStorage.removeItem(sessionId);
    if (this.currentHostContextId === sessionId) {
      this.currentHostContextId = "";
      this.setCurrentSessionPayload(null, "");
    }
    this.renderSessionHistory();
    this.statusNode.textContent = `Recent session '${sessionId}' deleted.`;
  }

  resolveSessionPayloadFromContextId(contextId, fallbackPayload) {
    if (typeof contextId === "string" && contextId.trim()) {
      const raw = sessionStorage.getItem(contextId.trim());
      if (typeof raw === "string") {
        const parsed = this.safeParseJson(raw);
        if (parsed.ok && this.isValidSessionPayload(parsed.value)) {
          return parsed.value;
        }
      }
    }
    if (this.isValidSessionPayload(fallbackPayload)) {
      return fallbackPayload;
    }
    return null;
  }

  buildRecentSessionInventory(history) {
    const inventory = [];
    if (!Array.isArray(history)) {
      return inventory;
    }
    history.forEach((entry) => {
      if (!this.isValidSessionHistoryEntry(entry)) {
        return;
      }
      const resolvedPayload = this.resolveSessionPayloadFromContextId(entry.hostContextId, entry.payload);
      if (!this.isValidSessionPayload(resolvedPayload)) {
        return;
      }
      inventory.push({
        id: `history:${entry.hostContextId}`,
        label: `History | ${entry.tool} | ${entry.hostContextId} | ${entry.timestamp}`,
        contextId: entry.hostContextId,
        toolId: entry.tool,
        payload: resolvedPayload,
        version: typeof resolvedPayload.version === "string" ? resolvedPayload.version : "",
        payloadSource: "history"
      });
    });
    return inventory;
  }

  resolveWorkspaceSessionInventory() {
    const inventory = [];
    if (Array.isArray(this.recentSessionInventory)) {
      this.recentSessionInventory.forEach((entry) => {
        if (!entry || typeof entry !== "object") {
          return;
        }
        if (!this.isValidSessionPayload(entry.payload)) {
          return;
        }
        inventory.push(entry);
      });
    }
    const library = this.readSessionLibrary();
    if (library && typeof library === "object" && !Array.isArray(library)) {
      Object.keys(library)
        .sort((left, right) => left.localeCompare(right))
        .forEach((sessionName) => {
          if (!this.isValidSessionPayload(library[sessionName])) {
            return;
          }
          inventory.push({
            id: `library:${sessionName}`,
            label: `Library | ${sessionName}`,
            payload: library[sessionName],
            contextId: sessionName,
            toolId: typeof library[sessionName].toolId === "string" ? library[sessionName].toolId : "",
            version: typeof library[sessionName].version === "string" ? library[sessionName].version : "",
            payloadSource: "library"
          });
        });
    }
    return inventory;
  }

  readPersistedSessionSelection() {
    const raw = localStorage.getItem(this.sessionSelectionStorageKey);
    if (!raw) {
      return { sessionA: "", sessionB: "" };
    }
    const parsed = this.safeParseJson(raw);
    if (!parsed.ok || !parsed.value || typeof parsed.value !== "object" || Array.isArray(parsed.value)) {
      return { sessionA: "", sessionB: "" };
    }
    const sessionA = typeof parsed.value.sessionA === "string" ? parsed.value.sessionA.trim() : "";
    const sessionB = typeof parsed.value.sessionB === "string" ? parsed.value.sessionB.trim() : "";
    return { sessionA, sessionB };
  }

  writePersistedSessionSelection(leftEntry, rightEntry) {
    const sessionA = leftEntry && typeof leftEntry.contextId === "string" ? leftEntry.contextId : "";
    const sessionB = rightEntry && typeof rightEntry.contextId === "string" ? rightEntry.contextId : "";
    localStorage.setItem(this.sessionSelectionStorageKey, JSON.stringify({ sessionA, sessionB }));
  }

  clearPersistedSessionSelection() {
    localStorage.removeItem(this.sessionSelectionStorageKey);
  }

  findSessionEntryByContextId(entries, contextId) {
    if (!Array.isArray(entries) || typeof contextId !== "string" || !contextId.trim()) {
      return null;
    }
    return entries.find((entry) => entry.contextId === contextId.trim()) || null;
  }

  resolvePersistedSelectionIds(entries) {
    if (!Array.isArray(entries) || entries.length < 2) {
      return { leftId: "", rightId: "" };
    }
    const persisted = this.readPersistedSessionSelection();
    if (!persisted.sessionA || !persisted.sessionB || persisted.sessionA === persisted.sessionB) {
      return { leftId: "", rightId: "" };
    }
    const leftEntry = this.findSessionEntryByContextId(entries, persisted.sessionA);
    const rightEntry = this.findSessionEntryByContextId(entries, persisted.sessionB);
    if (!leftEntry || !rightEntry || leftEntry.id === rightEntry.id) {
      return { leftId: "", rightId: "" };
    }
    return { leftId: leftEntry.id, rightId: rightEntry.id };
  }

  findSessionEntryById(entries, selectedId) {
    if (!Array.isArray(entries) || typeof selectedId !== "string" || !selectedId.trim()) {
      return null;
    }
    return entries.find((entry) => entry.id === selectedId) || null;
  }

  syncSelectionSlotsFromContextId(leftSelectNode, rightSelectNode, candidates, contextId) {
    if (
      !leftSelectNode ||
      !rightSelectNode ||
      !Array.isArray(candidates) ||
      typeof contextId !== "string" ||
      !contextId.trim()
    ) {
      return false;
    }
    const selectedEntry = this.findSessionEntryByContextId(candidates, contextId.trim());
    if (!selectedEntry) {
      return false;
    }
    const leftEntry = this.findSessionEntryById(candidates, leftSelectNode.value);
    const rightEntry = this.findSessionEntryById(candidates, rightSelectNode.value);
    if (!leftEntry) {
      if (rightEntry && rightEntry.id === selectedEntry.id) {
        return false;
      }
      leftSelectNode.value = selectedEntry.id;
      return true;
    }
    if (!rightEntry) {
      if (leftEntry.id === selectedEntry.id) {
        return false;
      }
      rightSelectNode.value = selectedEntry.id;
      return true;
    }
    return false;
  }

  syncDiffAndMergeSelectionSlotsFromContextId(contextId) {
    this.syncSelectionSlotsFromContextId(this.diffLeftSelect, this.diffRightSelect, this.diffCandidates, contextId);
    this.syncSelectionSlotsFromContextId(this.mergeLeftSelect, this.mergeRightSelect, this.mergeCandidates, contextId);
    this.updateDiffSelectionFeedbackAndState();
    this.updateMergeSelectionFeedbackAndState();
  }

  formatSelectionLabel(entry) {
    if (!entry || typeof entry !== "object") {
      return "No session selected";
    }
    const toolId = typeof entry.toolId === "string" && entry.toolId.trim()
      ? entry.toolId.trim()
      : (entry.payload && typeof entry.payload.toolId === "string" ? entry.payload.toolId : "session");
    const contextId = typeof entry.contextId === "string" && entry.contextId.trim()
      ? entry.contextId.trim()
      : (typeof entry.id === "string" ? entry.id : "");
    const shortContext = contextId.length > 16
      ? `${contextId.slice(0, 8)}...${contextId.slice(-4)}`
      : contextId;
    return shortContext ? `${toolId} | ${shortContext}` : toolId;
  }

  hasFreshMergePreviewContext(preview) {
    if (!preview || typeof preview !== "object") {
      return false;
    }
    const source = this.findSessionEntryById(this.mergeCandidates, preview.source && preview.source.id ? preview.source.id : "");
    const target = this.findSessionEntryById(this.mergeCandidates, preview.target && preview.target.id ? preview.target.id : "");
    if (!source || !target) {
      return false;
    }
    return JSON.stringify(source.payload) === preview.source.hash && JSON.stringify(target.payload) === preview.target.hash;
  }

  updateDiffSelectionFeedbackAndState() {
    const left = this.findSessionEntryById(this.diffCandidates, this.diffLeftSelect.value);
    const right = this.findSessionEntryById(this.diffCandidates, this.diffRightSelect.value);
    this.writePersistedSessionSelection(left, right);
    this.diffLeftSelectedLabelNode.textContent = this.formatSelectionLabel(left);
    this.diffRightSelectedLabelNode.textContent = this.formatSelectionLabel(right);
    const canRunDiff = Boolean(left && right && left.id !== right.id);
    this.computeDiffButton.disabled = !canRunDiff;
    if (left && right && left.id === right.id) {
      this.diffSelectionStateNode.textContent = "Choose two different sessions.";
      return;
    }
    this.diffSelectionStateNode.textContent = canRunDiff
      ? "Selections are valid."
      : "Select two different sessions to compute diff.";
  }

  updateMergeSelectionFeedbackAndState() {
    const left = this.findSessionEntryById(this.mergeCandidates, this.mergeLeftSelect.value);
    const right = this.findSessionEntryById(this.mergeCandidates, this.mergeRightSelect.value);
    this.writePersistedSessionSelection(left, right);
    this.mergeLeftSelectedLabelNode.textContent = this.formatSelectionLabel(left);
    this.mergeRightSelectedLabelNode.textContent = this.formatSelectionLabel(right);
    const canPreviewMerge = Boolean(left && right && left.id !== right.id);
    this.computeMergeButton.disabled = !canPreviewMerge;
    if (left && right && left.id === right.id) {
      this.mergeSelectionStateNode.textContent = "Choose two different sessions.";
    } else if (canPreviewMerge) {
      this.mergeSelectionStateNode.textContent = "Selections are valid.";
    } else {
      this.mergeSelectionStateNode.textContent = "Select two different sessions to preview merge.";
    }

    const previewIsFresh = this.hasFreshMergePreviewContext(this.pendingMergePreview);
    const previewHasConflicts = this.pendingMergePreview && Object.keys(this.pendingMergePreview.conflicts).length > 0;
    const previewReadyForConfirm = Boolean(this.pendingMergePreview && !this.pendingMergePreview.confirmed && previewIsFresh && !previewHasConflicts);
    const previewReadyForApply = Boolean(this.pendingMergePreview && this.pendingMergePreview.confirmed && previewIsFresh && !previewHasConflicts);
    this.confirmMergeButton.disabled = !previewReadyForConfirm;
    this.applyMergeButton.disabled = !previewReadyForApply;
  }

  renderSessionDiffInputs() {
    this.diffCandidates = this.resolveWorkspaceSessionInventory();
    const currentLeft = this.diffLeftSelect.value;
    const currentRight = this.diffRightSelect.value;
    const persistedSelections = this.resolvePersistedSelectionIds(this.diffCandidates);
    this.diffLeftSelect.replaceChildren();
    this.diffRightSelect.replaceChildren();

    const leftPlaceholder = document.createElement("option");
    leftPlaceholder.value = "";
    leftPlaceholder.textContent = "No session selected";
    leftPlaceholder.disabled = true;
    this.diffLeftSelect.appendChild(leftPlaceholder);
    const rightPlaceholder = document.createElement("option");
    rightPlaceholder.value = "";
    rightPlaceholder.textContent = "No session selected";
    rightPlaceholder.disabled = true;
    this.diffRightSelect.appendChild(rightPlaceholder);

    this.diffCandidates.forEach((candidate) => {
      const leftOption = document.createElement("option");
      leftOption.value = candidate.id;
      leftOption.textContent = candidate.label;
      this.diffLeftSelect.appendChild(leftOption);
      const rightOption = document.createElement("option");
      rightOption.value = candidate.id;
      rightOption.textContent = candidate.label;
      this.diffRightSelect.appendChild(rightOption);
    });

    this.diffLeftSelect.value = this.diffCandidates.some((entry) => entry.id === currentLeft)
      ? currentLeft
      : persistedSelections.leftId;
    this.diffRightSelect.value = this.diffCandidates.some((entry) => entry.id === currentRight)
      ? currentRight
      : persistedSelections.rightId;

    this.diffEmptyState.hidden = this.diffCandidates.length >= 2;
    this.diffEmptyState.textContent = "Create or reopen at least two Workspace V2 sessions before comparing.";
    if (this.diffCandidates.length < 2) {
      this.diffOutputNode.textContent = "Create or reopen at least two Workspace V2 sessions before comparing.";
    }
    this.updateDiffSelectionFeedbackAndState();
  }

  buildSessionMergeCandidates() {
    return this.resolveWorkspaceSessionInventory();
  }

  renderSessionMergeInputs() {
    const previousPreview = this.pendingMergePreview;
    this.mergeCandidates = this.buildSessionMergeCandidates();
    this.pendingMergePreview = null;
    this.confirmMergeButton.disabled = true;
    this.applyMergeButton.disabled = true;
    const currentLeft = this.mergeLeftSelect.value;
    const currentRight = this.mergeRightSelect.value;
    const persistedSelections = this.resolvePersistedSelectionIds(this.mergeCandidates);
    this.mergeLeftSelect.replaceChildren();
    this.mergeRightSelect.replaceChildren();

    const leftPlaceholder = document.createElement("option");
    leftPlaceholder.value = "";
    leftPlaceholder.textContent = "No session selected";
    leftPlaceholder.disabled = true;
    this.mergeLeftSelect.appendChild(leftPlaceholder);
    const rightPlaceholder = document.createElement("option");
    rightPlaceholder.value = "";
    rightPlaceholder.textContent = "No session selected";
    rightPlaceholder.disabled = true;
    this.mergeRightSelect.appendChild(rightPlaceholder);

    this.mergeCandidates.forEach((candidate) => {
      const leftOption = document.createElement("option");
      leftOption.value = candidate.id;
      leftOption.textContent = candidate.label;
      this.mergeLeftSelect.appendChild(leftOption);
      const rightOption = document.createElement("option");
      rightOption.value = candidate.id;
      rightOption.textContent = candidate.label;
      this.mergeRightSelect.appendChild(rightOption);
    });

    this.mergeLeftSelect.value = this.mergeCandidates.some((entry) => entry.id === currentLeft)
      ? currentLeft
      : persistedSelections.leftId;
    this.mergeRightSelect.value = this.mergeCandidates.some((entry) => entry.id === currentRight)
      ? currentRight
      : persistedSelections.rightId;

    this.mergeEmptyState.hidden = this.mergeCandidates.length >= 2;
    this.mergeEmptyState.textContent = "Create or reopen at least two Workspace V2 sessions before previewing a merge.";
    if (previousPreview) {
      const refreshedSource = this.mergeCandidates.find((entry) => entry.id === previousPreview.source.id);
      const refreshedTarget = this.mergeCandidates.find((entry) => entry.id === previousPreview.target.id);
      if (refreshedSource && refreshedTarget) {
        const sourceMatches = JSON.stringify(refreshedSource.payload) === previousPreview.source.hash;
        const targetMatches = JSON.stringify(refreshedTarget.payload) === previousPreview.target.hash;
        if (sourceMatches && targetMatches) {
          this.pendingMergePreview = previousPreview;
          this.mergeLeftSelect.value = previousPreview.source.id;
          this.mergeRightSelect.value = previousPreview.target.id;
          this.confirmMergeButton.disabled = false;
          this.applyMergeButton.disabled = !previousPreview.confirmed;
          this.updateMergeSelectionFeedbackAndState();
          return;
        }
      }
      this.statusNode.textContent = "Merge preview cleared because source or target session changed. Run Preview Merge (Dry Run) again.";
      this.mergeOutputNode.textContent = "No merge preview available.";
      return;
    }
    if (this.mergeCandidates.length < 2) {
      this.mergeOutputNode.textContent = "Create or reopen at least two Workspace V2 sessions before previewing a merge.";
    }
    this.updateMergeSelectionFeedbackAndState();
  }

  cloneSessionValue(value) {
    if (value === undefined) {
      return undefined;
    }
    return JSON.parse(JSON.stringify(value));
  }

  mergeSessionPayloads(leftPayload, rightPayload) {
    const conflicts = {};
    const mergeValues = (leftValue, rightValue, path) => {
      if (leftValue === undefined && rightValue !== undefined) {
        return this.cloneSessionValue(rightValue);
      }
      if (leftValue !== undefined && rightValue === undefined) {
        return this.cloneSessionValue(leftValue);
      }
      const leftIsObject = leftValue && typeof leftValue === "object";
      const rightIsObject = rightValue && typeof rightValue === "object";
      if (leftIsObject && rightIsObject && !Array.isArray(leftValue) && !Array.isArray(rightValue)) {
        const mergedObject = {};
        const keys = new Set([...Object.keys(leftValue), ...Object.keys(rightValue)]);
        Array.from(keys).sort((a, b) => a.localeCompare(b)).forEach((key) => {
          const childPath = path ? `${path}.${key}` : key;
          const mergedValue = mergeValues(leftValue[key], rightValue[key], childPath);
          if (mergedValue !== undefined) {
            mergedObject[key] = mergedValue;
          }
        });
        return mergedObject;
      }
      if (Array.isArray(leftValue) && Array.isArray(rightValue)) {
        if (JSON.stringify(leftValue) === JSON.stringify(rightValue)) {
          return this.cloneSessionValue(leftValue);
        }
        conflicts[path || "$"] = { a: this.cloneSessionValue(leftValue), b: this.cloneSessionValue(rightValue) };
        return undefined;
      }
      if (JSON.stringify(leftValue) === JSON.stringify(rightValue)) {
        return this.cloneSessionValue(leftValue);
      }
      conflicts[path || "$"] = { a: this.cloneSessionValue(leftValue), b: this.cloneSessionValue(rightValue) };
      return undefined;
    };

    const mergedPayload = mergeValues(leftPayload, rightPayload, "");
    return {
      mergedPayload: mergedPayload && typeof mergedPayload === "object" && !Array.isArray(mergedPayload) ? mergedPayload : {},
      conflicts
    };
  }

  computeSelectedSessionMerge() {
    if (!Array.isArray(this.mergeCandidates) || this.mergeCandidates.length < 2) {
      this.mergeOutputNode.textContent = "Create or reopen at least two Workspace V2 sessions before previewing a merge.";
      this.statusNode.textContent = "Create or reopen at least two Workspace V2 sessions before previewing a merge.";
      return;
    }
    if (!this.mergeLeftSelect.value && !this.mergeRightSelect.value) {
      this.mergeOutputNode.textContent = "Merge preview blocked. Session A and Session B selections are missing.";
      this.statusNode.textContent = "Merge preview blocked. Select Session A and Session B, then run Preview Merge (Dry Run).";
      return;
    }
    if (!this.mergeLeftSelect.value) {
      this.mergeOutputNode.textContent = "Merge preview blocked. Session A selection is missing.";
      this.statusNode.textContent = "Merge preview blocked. Select Session A, then run Preview Merge (Dry Run).";
      return;
    }
    if (!this.mergeRightSelect.value) {
      this.mergeOutputNode.textContent = "Merge preview blocked. Session B selection is missing.";
      this.statusNode.textContent = "Merge preview blocked. Select Session B, then run Preview Merge (Dry Run).";
      return;
    }
    if (this.mergeLeftSelect.value === this.mergeRightSelect.value) {
      this.mergeOutputNode.textContent = "Merge preview blocked. Session A and Session B must be different sessions.";
      this.statusNode.textContent = "Merge preview blocked. Choose two different sessions, then run Preview Merge (Dry Run).";
      return;
    }
    const left = this.mergeCandidates.find((entry) => entry.id === this.mergeLeftSelect.value);
    const right = this.mergeCandidates.find((entry) => entry.id === this.mergeRightSelect.value);
    if (!left || !right) {
      this.mergeOutputNode.textContent = !left
        ? "Merge preview blocked. Session A selection is no longer available."
        : "Merge preview blocked. Session B selection is no longer available.";
      this.statusNode.textContent = "Merge preview blocked. Refresh or re-select sessions, then run Preview Merge (Dry Run).";
      return;
    }
    if (!this.isValidSessionPayload(left.payload) || !this.isValidSessionPayload(right.payload)) {
      this.mergeOutputNode.textContent = "Selected merge payload is invalid.";
      return;
    }

    const result = this.mergeSessionPayloads(left.payload, right.payload);
    const selectedToolId = this.selectedToolId();
    if (!selectedToolId) {
      this.mergeOutputNode.textContent = "Select a V2 tool before computing merge.";
      return;
    }
    const versionedPayload = this.withSessionVersion(result.mergedPayload);
    const sizeValidation = this.validateSessionPayloadSize(versionedPayload);
    if (!sizeValidation.ok) {
      this.mergeOutputNode.textContent = sizeValidation.message;
      return;
    }

    const previewChanges = this.computeMergePreviewChanges(left.payload, right.payload, versionedPayload);
    this.pendingMergePreview = {
      source: {
        id: left.id,
        label: left.label,
        payload: this.cloneSessionValue(left.payload),
        hash: JSON.stringify(left.payload)
      },
      target: {
        id: right.id,
        label: right.label,
        payload: this.cloneSessionValue(right.payload),
        hash: JSON.stringify(right.payload)
      },
      selectedToolId,
      mergedPayload: versionedPayload,
      conflicts: result.conflicts,
      changes: previewChanges,
      confirmed: false
    };
    this.updateMergeSelectionFeedbackAndState();

    this.mergeOutputNode.textContent = JSON.stringify({
      source: this.pendingMergePreview.source,
      target: this.pendingMergePreview.target,
      changes: this.pendingMergePreview.changes,
      conflicts: this.pendingMergePreview.conflicts,
      confirmed: this.pendingMergePreview.confirmed,
      canApply: Object.keys(this.pendingMergePreview.conflicts).length === 0
    }, null, 2);
    this.statusNode.textContent = Object.keys(this.pendingMergePreview.conflicts).length > 0
      ? "Merge preview computed. Conflicts detected; apply is blocked."
      : "Merge preview computed. Confirm preview to enable apply.";
  }

  computeMergePreviewChanges(sourcePayload, targetPayload, mergedPayload) {
    const added = {};
    const updated = {};
    const unchanged = {};
    const walk = (sourceValue, targetValue, mergedValue, path) => {
      if (mergedValue === undefined) {
        return;
      }
      const sourceObject = sourceValue && typeof sourceValue === "object";
      const targetObject = targetValue && typeof targetValue === "object";
      const mergedObject = mergedValue && typeof mergedValue === "object";
      if (sourceObject && targetObject && mergedObject && !Array.isArray(sourceValue) && !Array.isArray(targetValue) && !Array.isArray(mergedValue)) {
        const keys = new Set([...Object.keys(sourceValue), ...Object.keys(targetValue), ...Object.keys(mergedValue)]);
        Array.from(keys).sort((a, b) => a.localeCompare(b)).forEach((key) => {
          walk(sourceValue[key], targetValue[key], mergedValue[key], path ? `${path}.${key}` : key);
        });
        return;
      }
      if (targetValue === undefined) {
        added[path || "$"] = this.cloneSessionValue(mergedValue);
        return;
      }
      if (JSON.stringify(mergedValue) === JSON.stringify(targetValue)) {
        unchanged[path || "$"] = this.cloneSessionValue(mergedValue);
        return;
      }
      updated[path || "$"] = {
        from: this.cloneSessionValue(targetValue),
        to: this.cloneSessionValue(mergedValue)
      };
    };
    walk(sourcePayload, targetPayload, mergedPayload, "");
    return { added, updated, unchanged };
  }

  confirmSelectedSessionMergePreview() {
    if (!this.pendingMergePreview) {
      this.statusNode.textContent = "No merge preview available. Run Preview Merge (Dry Run) first.";
      return;
    }
    this.pendingMergePreview.confirmed = true;
    this.updateMergeSelectionFeedbackAndState();
    this.mergeOutputNode.textContent = JSON.stringify({
      source: this.pendingMergePreview.source,
      target: this.pendingMergePreview.target,
      changes: this.pendingMergePreview.changes,
      conflicts: this.pendingMergePreview.conflicts,
      confirmed: true,
      canApply: Object.keys(this.pendingMergePreview.conflicts).length === 0
    }, null, 2);
    this.statusNode.textContent = "Merge preview confirmed. Apply remains blocked if conflicts exist or preview becomes stale.";
  }

  recordMergeAuditEntry(preview) {
    const rawAudit = localStorage.getItem(this.mergeAuditStorageKey);
    let auditEntries = [];
    if (rawAudit) {
      try {
        const parsed = JSON.parse(rawAudit);
        if (Array.isArray(parsed)) {
          auditEntries = parsed;
        }
      } catch {
        auditEntries = [];
      }
    }
    auditEntries.push({
      sourceSessionContextId: preview.source.id,
      targetSessionContextId: preview.target.id,
      timestamp: new Date().toISOString(),
      addedCount: Object.keys(preview.changes.added).length,
      updatedCount: Object.keys(preview.changes.updated).length,
      unchangedCount: Object.keys(preview.changes.unchanged).length,
      conflictCount: Object.keys(preview.conflicts).length
    });
    localStorage.setItem(this.mergeAuditStorageKey, JSON.stringify(auditEntries));
  }

  applySelectedSessionMerge() {
    if (!this.pendingMergePreview) {
      this.statusNode.textContent = "Merge apply blocked. Run Preview Merge (Dry Run), then Confirm Preview.";
      return;
    }
    if (!this.pendingMergePreview.confirmed) {
      this.statusNode.textContent = "Merge apply blocked. Confirm preview before apply.";
      return;
    }
    const currentMergeCandidates = this.buildSessionMergeCandidates();
    const liveSource = currentMergeCandidates.find((entry) => entry.id === this.pendingMergePreview.source.id);
    const liveTarget = currentMergeCandidates.find((entry) => entry.id === this.pendingMergePreview.target.id);
    if (!liveSource || !liveTarget) {
      this.statusNode.textContent = "Merge apply blocked. Preview is stale because source or target session is no longer available.";
      return;
    }
    if (JSON.stringify(liveSource.payload) !== this.pendingMergePreview.source.hash || JSON.stringify(liveTarget.payload) !== this.pendingMergePreview.target.hash) {
      this.statusNode.textContent = "Merge apply blocked. Preview is stale because source or target session changed.";
      return;
    }
    const conflictKeys = Object.keys(this.pendingMergePreview.conflicts);
    if (conflictKeys.length > 0) {
      this.statusNode.textContent = `Merge apply blocked by ${conflictKeys.length} conflict${conflictKeys.length === 1 ? "" : "s"}.`;
      return;
    }
    const sizeValidation = this.validateSessionPayloadSize(this.pendingMergePreview.mergedPayload);
    if (!sizeValidation.ok) {
      this.statusNode.textContent = sizeValidation.message;
      return;
    }
    const hostContextId = this.createHostContextId(this.pendingMergePreview.selectedToolId);
    sessionStorage.setItem(hostContextId, sizeValidation.metrics.serializedPayload);
    let appliedPayload = null;
    try {
      appliedPayload = JSON.parse(sessionStorage.getItem(hostContextId));
    } catch {
      appliedPayload = null;
    }
    const appliedChanges = this.computeMergePreviewChanges(this.pendingMergePreview.source.payload, this.pendingMergePreview.target.payload, appliedPayload);
    if (
      !appliedPayload ||
      JSON.stringify(appliedPayload) !== JSON.stringify(this.pendingMergePreview.mergedPayload) ||
      JSON.stringify(appliedChanges) !== JSON.stringify(this.pendingMergePreview.changes)
    ) {
      sessionStorage.removeItem(hostContextId);
      this.statusNode.textContent = "Merge apply blocked. Applied result verification failed against preview.";
      return;
    }
    this.currentHostContextId = hostContextId;
    this.setCurrentSessionPayload(this.pendingMergePreview.mergedPayload, "merge-apply");
    this.importJsonNode.value = JSON.stringify(this.pendingMergePreview.mergedPayload, null, 2);
    this.recordMergeAuditEntry(this.pendingMergePreview);
    this.renderDiagnosticsPanel();
    this.pendingMergePreview = null;
    this.updateMergeSelectionFeedbackAndState();
    this.mergeOutputNode.textContent = JSON.stringify({
      source: liveSource.id,
      target: liveTarget.id,
      changes: appliedChanges,
      conflicts: {},
      applied: {
        hostContextId,
        selectedToolId: this.selectedToolId(),
        mergedPayload: appliedPayload
      }
    }, null, 2);
    this.statusNode.textContent = `Session merge applied with no conflicts. New hostContextId: ${hostContextId}`;
  }

  isComparableObject(value) {
    return Boolean(value && typeof value === "object");
  }

  computeSessionDiff(leftPayload, rightPayload) {
    const added = {};
    const removed = {};
    const changed = {};
    const walk = (leftValue, rightValue, path) => {
      if (leftValue === undefined && rightValue !== undefined) {
        added[path] = rightValue;
        return;
      }
      if (leftValue !== undefined && rightValue === undefined) {
        removed[path] = leftValue;
        return;
      }
      const leftComparable = this.isComparableObject(leftValue);
      const rightComparable = this.isComparableObject(rightValue);
      if (leftComparable && rightComparable) {
        if (Array.isArray(leftValue) && Array.isArray(rightValue)) {
          const maxLength = Math.max(leftValue.length, rightValue.length);
          for (let index = 0; index < maxLength; index += 1) {
            walk(leftValue[index], rightValue[index], `${path}[${index}]`);
          }
          return;
        }
        if (!Array.isArray(leftValue) && !Array.isArray(rightValue)) {
          const keys = new Set([...Object.keys(leftValue), ...Object.keys(rightValue)]);
          Array.from(keys).sort((a, b) => a.localeCompare(b)).forEach((key) => {
            walk(leftValue[key], rightValue[key], path ? `${path}.${key}` : key);
          });
          return;
        }
      }
      if (JSON.stringify(leftValue) !== JSON.stringify(rightValue)) {
        changed[path || "$"] = { from: leftValue, to: rightValue };
      }
    };
    walk(leftPayload, rightPayload, "");
    return { added, removed, changed };
  }

  computeSelectedSessionDiff() {
    if (!Array.isArray(this.diffCandidates) || this.diffCandidates.length < 2) {
      this.diffOutputNode.textContent = "Create or reopen at least two Workspace V2 sessions before comparing.";
      this.statusNode.textContent = "Create or reopen at least two Workspace V2 sessions before comparing.";
      return;
    }
    if (!this.diffLeftSelect.value && !this.diffRightSelect.value) {
      this.diffOutputNode.textContent = "Diff blocked. Session A and Session B selections are missing.";
      this.statusNode.textContent = "Diff blocked. Select Session A and Session B, then compute diff.";
      return;
    }
    if (!this.diffLeftSelect.value) {
      this.diffOutputNode.textContent = "Diff blocked. Session A selection is missing.";
      this.statusNode.textContent = "Diff blocked. Select Session A, then compute diff.";
      return;
    }
    if (!this.diffRightSelect.value) {
      this.diffOutputNode.textContent = "Diff blocked. Session B selection is missing.";
      this.statusNode.textContent = "Diff blocked. Select Session B, then compute diff.";
      return;
    }
    if (this.diffLeftSelect.value === this.diffRightSelect.value) {
      this.diffOutputNode.textContent = "Diff blocked. Session A and Session B must be different sessions.";
      this.statusNode.textContent = "Diff blocked. Choose two different sessions, then compute diff.";
      return;
    }
    const left = this.diffCandidates.find((entry) => entry.id === this.diffLeftSelect.value);
    const right = this.diffCandidates.find((entry) => entry.id === this.diffRightSelect.value);
    if (!left || !right) {
      this.diffOutputNode.textContent = !left
        ? "Diff blocked. Session A selection is no longer available."
        : "Diff blocked. Session B selection is no longer available.";
      this.statusNode.textContent = "Diff blocked. Refresh or re-select sessions, then compute diff.";
      return;
    }
    if (!this.isValidSessionPayload(left.payload) || !this.isValidSessionPayload(right.payload)) {
      this.diffOutputNode.textContent = "Selected diff payload is invalid.";
      return;
    }
    const diff = this.computeSessionDiff(left.payload, right.payload);
    this.diffOutputNode.textContent = JSON.stringify(diff, null, 2);
    this.statusNode.textContent = "Session diff computed.";
  }

  reopenSessionHistoryEntry(hostContextId) {
    const history = this.readSessionHistory();
    const entry = history.find((row) => row.hostContextId === hostContextId);
    if (!entry) {
      this.statusNode.textContent = "Selected history entry was not found.";
      return;
    }
    if (!this.isValidSessionHistoryEntry(entry)) {
      this.statusNode.textContent = "Selected history entry is invalid.";
      return;
    }
    sessionStorage.setItem(entry.hostContextId, JSON.stringify(entry.payload));
    this.currentHostContextId = entry.hostContextId;
    this.setCurrentSessionPayload(entry.payload, `history:${entry.hostContextId}`);
    this.importJsonNode.value = JSON.stringify(entry.payload, null, 2);
    const launchUrl = this.buildToolLaunchUrl(entry.tool, entry.hostContextId);
    this.statusNode.textContent = `Reopening session.\nTool: ${entry.tool}\nHostContextId: ${entry.hostContextId}`;
    window.location.href = launchUrl;
  }

  isValidErrorLogEntry(errorLogEntry) {
    if (!errorLogEntry || typeof errorLogEntry !== "object" || Array.isArray(errorLogEntry)) {
      return false;
    }
    if (typeof errorLogEntry.tool !== "string" || !errorLogEntry.tool.trim()) {
      return false;
    }
    if (!["EMPTY", "INVALID", "RUNTIME"].includes(errorLogEntry.type)) {
      return false;
    }
    if (typeof errorLogEntry.message !== "string" || !errorLogEntry.message.trim()) {
      return false;
    }
    if (!errorLogEntry.details || typeof errorLogEntry.details !== "object" || Array.isArray(errorLogEntry.details)) {
      return false;
    }
    if (typeof errorLogEntry.timestamp !== "string" || !errorLogEntry.timestamp.trim()) {
      return false;
    }
    return true;
  }

  readErrorLogs() {
    const rawErrorLogs = localStorage.getItem(this.errorLogsStorageKey);
    if (!rawErrorLogs) {
      return [];
    }
    let parsedErrorLogs = null;
    try {
      parsedErrorLogs = JSON.parse(rawErrorLogs);
    } catch (error) {
      console.warn(`[WorkspaceV2ErrorViewer] Ignoring invalid v2-error-logs JSON: ${error instanceof Error ? error.message : "unknown error"}`);
      return [];
    }
    if (!Array.isArray(parsedErrorLogs)) {
      console.warn("[WorkspaceV2ErrorViewer] Ignoring invalid v2-error-logs value: expected array.");
      return [];
    }
    const validErrorLogs = [];
    let invalidCount = 0;
    parsedErrorLogs.forEach((errorLogEntry) => {
      if (this.isValidErrorLogEntry(errorLogEntry)) {
        validErrorLogs.push(errorLogEntry);
        return;
      }
      invalidCount += 1;
    });
    if (invalidCount > 0) {
      console.warn(`[WorkspaceV2ErrorViewer] Ignored ${invalidCount} invalid error log entr${invalidCount === 1 ? "y" : "ies"}.`);
    }
    return validErrorLogs;
  }

  groupErrorLogsByTool(errorLogs) {
    const grouped = {};
    errorLogs.forEach((errorLogEntry) => {
      if (!Object.prototype.hasOwnProperty.call(grouped, errorLogEntry.tool)) {
        grouped[errorLogEntry.tool] = [];
      }
      grouped[errorLogEntry.tool].push(errorLogEntry);
    });
    return grouped;
  }

  renderErrorLogsViewer() {
    const errorLogs = this.readErrorLogs();
    this.errorLogsListNode.replaceChildren();
    this.errorLogsEmptyState.hidden = errorLogs.length > 0;
    this.errorLogsEmptyState.textContent = "No error logs found.";
    if (errorLogs.length === 0) {
      return;
    }
    const groupedErrorLogs = this.groupErrorLogsByTool(errorLogs);
    const toolIds = Object.keys(groupedErrorLogs).sort((left, right) => left.localeCompare(right));
    toolIds.forEach((toolId) => {
      const groupSection = document.createElement("section");
      const heading = document.createElement("h3");
      const list = document.createElement("ul");
      heading.textContent = `${toolId} (${groupedErrorLogs[toolId].length})`;
      groupedErrorLogs[toolId].forEach((errorLogEntry) => {
        const listItem = document.createElement("li");
        const meta = document.createElement("strong");
        const message = document.createElement("div");
        const details = document.createElement("pre");
        meta.textContent = `${errorLogEntry.type} | ${errorLogEntry.timestamp}`;
        message.textContent = errorLogEntry.message;
        details.textContent = JSON.stringify(errorLogEntry.details, null, 2);
        listItem.append(meta, message, details);
        list.appendChild(listItem);
      });
      groupSection.append(heading, list);
      this.errorLogsListNode.appendChild(groupSection);
    });
  }

  clearSessionStorage(emitStatus = true) {
    sessionStorage.clear();
    this.clearPersistedSessionSelection();
    this.diffLeftSelect.value = "";
    this.diffRightSelect.value = "";
    this.mergeLeftSelect.value = "";
    this.mergeRightSelect.value = "";
    this.updateDiffSelectionFeedbackAndState();
    this.updateMergeSelectionFeedbackAndState();
    this.currentHostContextId = "";
    this.renderDiagnosticsPanel();
    if (emitStatus) {
      this.statusNode.textContent = "Session storage cleared and session selections reset.";
    }
  }

  clearSavedSessions(emitStatus = true) {
    localStorage.removeItem(this.libraryStorageKey);
    this.renderSessionLibrary();
    this.renderDiagnosticsPanel();
    if (emitStatus) {
      this.statusNode.textContent = "Saved sessions cleared from localStorage key v2-session-library.";
    }
  }

  clearErrorLogs(emitStatus = true) {
    localStorage.removeItem(this.errorLogsStorageKey);
    this.renderErrorLogsViewer();
    this.renderDiagnosticsPanel();
    if (emitStatus) {
      this.statusNode.textContent = "Error logs cleared from localStorage key v2-error-logs.";
    }
  }

  resetUrlState(emitStatus = true) {
    const currentUrl = new URL(window.location.href);
    const nextPath = `${currentUrl.pathname}${currentUrl.hash || ""}`;
    if (window.history && typeof window.history.replaceState === "function") {
      window.history.replaceState({}, "", nextPath);
    }
    this.currentHostContextId = "";
    this.renderDiagnosticsPanel();
    if (emitStatus) {
      this.statusNode.textContent = "URL state reset to baseline path.";
    }
  }

  fullReset() {
    this.clearSessionStorage(false);
    this.clearSavedSessions(false);
    this.clearErrorLogs(false);
    this.resetUrlState(false);
    this.currentHostContextId = "";
    this.setCurrentSessionPayload(null, "");
    this.importJsonNode.value = "";
    this.shareUrlNode.value = "";
    this.sessionNameNode.value = "";
    this.renderSessionLibrary();
    this.renderErrorLogsViewer();
    this.renderDiagnosticsPanel();
    this.statusNode.textContent = "Workspace V2 full reset complete. EMPTY baseline restored.";
  }

  safeParseJson(rawValue) {
    if (typeof rawValue !== "string") {
      return { ok: false, value: null, error: "value is not a string" };
    }
    try {
      return { ok: true, value: JSON.parse(rawValue), error: "" };
    } catch (error) {
      return { ok: false, value: null, error: error instanceof Error ? error.message : "unknown error" };
    }
  }

  truncatePreview(value, maxLength) {
    const text = typeof value === "string" ? value : String(value);
    if (text.length <= maxLength) {
      return text;
    }
    return `${text.slice(0, maxLength)} ...truncated (${text.length - maxLength} more chars)`;
  }

  diagnosticsActiveHostContextId() {
    const params = new URL(window.location.href).searchParams;
    const urlHostContextId = typeof params.get("hostContextId") === "string" ? params.get("hostContextId").trim() : "";
    if (urlHostContextId) {
      return urlHostContextId;
    }
    if (typeof this.currentHostContextId === "string" && this.currentHostContextId.trim()) {
      return this.currentHostContextId.trim();
    }
    return "";
  }

  diagnosticsActiveState(activeHostContextId) {
    if (activeHostContextId) {
      const stored = sessionStorage.getItem(activeHostContextId);
      if (!stored) {
        return "EMPTY";
      }
      const parsed = this.safeParseJson(stored);
      if (!parsed.ok || !this.isValidSessionPayload(parsed.value)) {
        return "INVALID";
      }
      return "VALID";
    }
    if (this.isValidSessionPayload(this.currentSessionPayload)) {
      return "VALID";
    }
    return "EMPTY";
  }

  readDiagnosticsSnapshot() {
    const params = new URL(window.location.href).searchParams;
    const urlParams = {};
    params.forEach((value, key) => {
      urlParams[key] = value;
    });

    const activeHostContextId = this.diagnosticsActiveHostContextId();
    const sessionMatches = [];
    if (activeHostContextId) {
      const rawSessionValue = sessionStorage.getItem(activeHostContextId);
      if (typeof rawSessionValue === "string") {
        const parsedSession = this.safeParseJson(rawSessionValue);
        sessionMatches.push({
          key: activeHostContextId,
          parseOk: parsedSession.ok,
          error: parsedSession.ok ? "" : parsedSession.error,
          preview: this.truncatePreview(rawSessionValue, 500)
        });
      }
    }

    const sessionLibraryRaw = localStorage.getItem(this.libraryStorageKey);
    const sessionLibraryParsed = this.safeParseJson(typeof sessionLibraryRaw === "string" ? sessionLibraryRaw : "");
    const errorLogsRaw = localStorage.getItem(this.errorLogsStorageKey);
    const errorLogsParsed = this.safeParseJson(typeof errorLogsRaw === "string" ? errorLogsRaw : "");
    const payloadPreview = this.isValidSessionPayload(this.currentSessionPayload)
      ? this.truncatePreview(JSON.stringify(this.currentSessionPayload, null, 2), 800)
      : "No payload loaded.";

    return {
      urlParams,
      activeHostContextId,
      activeState: this.diagnosticsActiveState(activeHostContextId),
      sessionMatches,
      localStorage: {
        sessionLibrary: {
          exists: typeof sessionLibraryRaw === "string",
          parseOk: typeof sessionLibraryRaw === "string" ? sessionLibraryParsed.ok : false,
          error: typeof sessionLibraryRaw === "string" && !sessionLibraryParsed.ok ? sessionLibraryParsed.error : "",
          preview: typeof sessionLibraryRaw === "string" ? this.truncatePreview(sessionLibraryRaw, 800) : "missing"
        },
        errorLogs: {
          exists: typeof errorLogsRaw === "string",
          parseOk: typeof errorLogsRaw === "string" ? errorLogsParsed.ok : false,
          error: typeof errorLogsRaw === "string" && !errorLogsParsed.ok ? errorLogsParsed.error : "",
          preview: typeof errorLogsRaw === "string" ? this.truncatePreview(errorLogsRaw, 800) : "missing"
        }
      },
      payloadPreview
    };
  }

  buildRuntimeSnapshot() {
    const snapshot = this.readDiagnosticsSnapshot();
    let sessionPayload = null;
    if (snapshot.sessionMatches.length > 0 && snapshot.sessionMatches[0].parseOk) {
      try {
        sessionPayload = JSON.parse(sessionStorage.getItem(snapshot.activeHostContextId));
      } catch {
        sessionPayload = null;
      }
    }
    return {
      tool: "workspace-v2",
      url: window.location.href,
      hostContextId: snapshot.activeHostContextId,
      session: sessionPayload
    };
  }

  registerSnapshotHook() {
    window.__v2RuntimeSnapshot = () => this.buildRuntimeSnapshot();
  }

  exportRuntimeSnapshot() {
    const snapshot = this.buildRuntimeSnapshot();
    this.snapshotOutputNode.textContent = JSON.stringify(snapshot, null, 2);
    this.statusNode.textContent = "Runtime snapshot exported to Workspace V2 diagnostics.";
  }

  renderDiagnosticsPanel() {
    const snapshot = this.readDiagnosticsSnapshot();
    this.diagnosticsActiveStateNode.textContent = snapshot.activeState;
    this.diagnosticsHostContextIdNode.textContent = snapshot.activeHostContextId || "none";
    this.diagnosticsUrlParamsNode.textContent = JSON.stringify(snapshot.urlParams, null, 2);
    this.diagnosticsSessionStorageNode.textContent = JSON.stringify(snapshot.sessionMatches, null, 2);
    this.diagnosticsSessionLibraryNode.textContent = JSON.stringify(snapshot.localStorage.sessionLibrary, null, 2);
    this.diagnosticsErrorLogsNode.textContent = JSON.stringify(snapshot.localStorage.errorLogs, null, 2);
    this.diagnosticsPayloadNode.textContent = snapshot.payloadPreview;
  }

  async loadSelectedFixture() {
    const toolId = this.selectedToolId();
    if (!toolId) {
      this.statusNode.textContent = "Select a V2 tool before loading a fixture.";
      return;
    }
    try {
      const response = await fetch(this.fixturePathForTool(toolId), { cache: "no-store" });
      if (!response.ok) {
        this.statusNode.textContent = `Fixture read failed (${response.status}). Expected ${this.fixturePathForTool(toolId)}.`;
        this.setCurrentSessionPayload(null, "");
        return;
      }
      const fixture = await response.json();
      if (!fixture || typeof fixture !== "object" || Array.isArray(fixture)) {
        this.statusNode.textContent = "Fixture is invalid. Expected a JSON object with hostContextId and sessionContext.";
        this.setCurrentSessionPayload(null, "");
        return;
      }
      if (!this.isValidSessionPayload(fixture.sessionContext)) {
        this.statusNode.textContent = "Fixture is invalid. Missing sessionContext object.";
        this.setCurrentSessionPayload(null, "");
        return;
      }
      this.setCurrentSessionPayload(fixture.sessionContext, `fixture:${toolId}`);
      this.currentHostContextId = "";
      this.renderDiagnosticsPanel();
      this.importJsonNode.value = JSON.stringify(fixture.sessionContext, null, 2);
      this.statusNode.textContent = `Fixture loaded for ${toolId}.\nSession payload is ready for launch, export, share, or library save.`;
    } catch (error) {
      this.setCurrentSessionPayload(null, "");
      this.currentHostContextId = "";
      this.renderDiagnosticsPanel();
      this.statusNode.textContent = `Fixture read failed: ${error instanceof Error ? error.message : "unknown error"}`;
    }
  }

  readImportFile() {
    if (!this.importFileNode.files || this.importFileNode.files.length === 0) {
      return;
    }
    const file = this.importFileNode.files[0];
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      this.importJsonNode.value = typeof reader.result === "string" ? reader.result : "";
      this.statusNode.textContent = `Import file loaded: ${file.name}. Click Import Session JSON to validate and create session.`;
    });
    reader.addEventListener("error", () => {
      this.statusNode.textContent = `Import file read failed: ${file.name}.`;
    });
    reader.readAsText(file);
  }

  createHostContextId(toolId) {
    const randomPart = Math.random().toString(36).slice(2, 10);
    return `${toolId}-${Date.now()}-${randomPart}`;
  }

  buildToolLaunchUrl(toolId, hostContextId) {
    const toolUrl = new URL(`../${toolId}/index.html`, window.location.href);
    toolUrl.searchParams.set("hostContextId", hostContextId);
    toolUrl.searchParams.set("fromTool", "workspace-v2");
    return toolUrl.toString();
  }

  importSessionJson() {
    const toolId = this.selectedToolId();
    const rawJson = typeof this.importJsonNode.value === "string" ? this.importJsonNode.value.trim() : "";
    if (!toolId) {
      this.statusNode.textContent = "Select a V2 tool before importing session JSON.";
      return;
    }
    if (!rawJson) {
      this.statusNode.textContent = "Session JSON is required for import.";
      return;
    }
    try {
      const parsed = JSON.parse(rawJson);
      if (!this.applySessionPayload(parsed, "import")) {
        return;
      }
      this.statusNode.textContent = `Session imported.\nTool: ${toolId}\nHostContextId: ${this.currentHostContextId}\nReady to launch.`;
    } catch (error) {
      this.statusNode.textContent = `Imported JSON is invalid: ${error instanceof Error ? error.message : "unknown error"}`;
    }
  }

  exportCurrentSessionJson() {
    if (!this.isValidSessionPayload(this.currentSessionPayload)) {
      this.statusNode.textContent = "No current session payload to export. Load fixture or import JSON first.";
      return;
    }
    const serialized = JSON.stringify(this.currentSessionPayload, null, 2);
    this.importJsonNode.value = serialized;
    this.statusNode.textContent = `Session JSON exported from ${this.currentSessionSource || "session"} payload.`;
  }

  createShareLink() {
    if (!this.isValidSessionPayload(this.currentSessionPayload)) {
      this.statusNode.textContent = "No current session payload to share. Load fixture, import JSON, or load library session first.";
      return;
    }
    try {
      const encoded = this.encodeSessionPayload(this.currentSessionPayload);
      const shareUrl = new URL(window.location.href);
      shareUrl.searchParams.set("session", encoded);
      if (shareUrl.toString().length > this.urlLengthLimit) {
        this.statusNode.textContent = `Session size exceeds allowed limit for URL payload. URL length is ${shareUrl.toString().length} and limit is ${this.urlLengthLimit}.`;
        return;
      }
      this.shareUrlNode.value = shareUrl.toString();
      this.statusNode.textContent = "Share link created from current session payload.";
    } catch (error) {
      this.statusNode.textContent = `Share link creation failed: ${error instanceof Error ? error.message : "unknown error"}`;
    }
  }

  applyShareLink() {
    const rawShareValue = typeof this.shareUrlNode.value === "string" ? this.shareUrlNode.value.trim() : "";
    if (!rawShareValue) {
      this.statusNode.textContent = "Share URL is required to apply.";
      return;
    }
    try {
      const parsedUrl = new URL(rawShareValue, window.location.href);
      if (!parsedUrl.searchParams.has("session")) {
        this.statusNode.textContent = "Share URL is invalid. Missing session query parameter.";
        return;
      }
      const decoded = this.decodeSessionPayload(parsedUrl.searchParams.get("session"));
      if (!this.applySessionPayload(decoded, "share-link")) {
        return;
      }
      this.statusNode.textContent = `Share session link applied.\nTool: ${this.selectedToolId()}\nHostContextId: ${this.currentHostContextId}\nReady to launch.`;
    } catch (error) {
      this.statusNode.textContent = `Share session decode failed: ${error instanceof Error ? error.message : "unknown error"}`;
    }
  }

  saveNamedSession(overwriteExisting) {
    const sessionName = this.selectedSessionName();
    if (!sessionName) {
      this.setLibraryStatus(overwriteExisting ? "Enter a session ID before overwriting." : "Enter a session ID before saving.");
      return;
    }
    const library = this.readSessionLibrary();
    if (library === null) {
      return;
    }
    const exists = Object.prototype.hasOwnProperty.call(library, sessionName);
    if (!overwriteExisting && exists) {
      this.setLibraryStatus("Saved session already exists. Use Overwrite Session.");
      return;
    }
    const payloadForWrite = this.readSessionPayloadForLibraryWrite(sessionName);
    if (!this.isValidSessionPayload(payloadForWrite)) {
      this.setLibraryStatus("Session ID does not resolve to a valid Workspace V2 session.");
      return;
    }
    if (overwriteExisting && !exists) {
      this.setLibraryStatus("Saved session not found. Use Save Session to create it first.");
      return;
    }
    library[sessionName] = payloadForWrite;
    this.writeSessionLibrary(library);
    this.renderSessionLibrary();
    this.setLibraryStatus(overwriteExisting ? "Saved session overwritten." : "Saved session created.");
  }

  loadNamedSession() {
    const sessionName = this.selectedSessionName();
    if (!sessionName) {
      this.setLibraryStatus("Enter a saved session ID before loading.");
      return;
    }
    const library = this.readSessionLibrary();
    if (library === null) {
      return;
    }
    if (!Object.prototype.hasOwnProperty.call(library, sessionName)) {
      this.setLibraryStatus("Saved session not found.");
      return;
    }
    const payload = library[sessionName];
    if (!this.applySessionPayload(payload, `library:${sessionName}`)) {
      this.setLibraryStatus("Saved session not found.");
      return;
    }
    this.setLibraryStatus("Saved session loaded.");
  }

  deleteNamedSession() {
    const sessionName = this.selectedSessionName();
    if (!sessionName) {
      this.setLibraryStatus("Enter a saved session ID before deleting.");
      return;
    }
    const library = this.readSessionLibrary();
    if (library === null) {
      return;
    }
    const history = this.readSessionHistory();
    const recentMatch = history.some((entry) => entry.hostContextId === sessionName);
    const librarySessionNames = Object.keys(library);
    if (librarySessionNames.length === 0) {
      this.setLibraryStatus(recentMatch
        ? "Session ID is not saved in Session Library. Use Delete on Recent Sessions to remove temporary sessions."
        : "No saved sessions exist. Use Delete on Recent Sessions to remove temporary sessions.");
      return;
    }
    if (!Object.prototype.hasOwnProperty.call(library, sessionName)) {
      this.setLibraryStatus(recentMatch
        ? "Session ID is not saved in Session Library. Use Delete on Recent Sessions to remove temporary sessions."
        : "Saved session not found.");
      return;
    }
    delete library[sessionName];
    this.writeSessionLibrary(library);
    this.renderSessionLibrary();
    this.setLibraryStatus("Saved session deleted.");
  }

  createSessionAndLaunch() {
    const toolId = this.selectedToolId();
    if (!toolId) {
      this.statusNode.textContent = "Select a V2 tool before launch.";
      return;
    }
    if (!this.isValidSessionPayload(this.currentSessionPayload)) {
      this.statusNode.textContent = "No session payload is available. Load a fixture, import JSON, apply share link, or load library session first.";
      return;
    }
    const versionedPayload = this.withSessionVersion(this.currentSessionPayload);
    const sizeValidation = this.validateSessionPayloadSize(versionedPayload);
    if (!sizeValidation.ok) {
      this.statusNode.textContent = sizeValidation.message;
      return;
    }
    const hostContextId = this.createHostContextId(toolId);
    sessionStorage.setItem(hostContextId, sizeValidation.metrics.serializedPayload);
    this.currentHostContextId = hostContextId;
    this.setCurrentSessionPayload(versionedPayload, this.currentSessionSource || "workspace-v2");
    this.addRecentSessionEntry(hostContextId, toolId, versionedPayload);
    this.renderDiagnosticsPanel();
    const launchUrl = this.buildToolLaunchUrl(toolId, hostContextId);
    this.statusNode.textContent = `Session created.\nTool: ${toolId}\nHostContextId: ${hostContextId}\nURL: tools/${toolId}/index.html?hostContextId=${hostContextId}`;
    window.location.href = launchUrl;
  }
}

new WorkspaceV2SessionProducer();
