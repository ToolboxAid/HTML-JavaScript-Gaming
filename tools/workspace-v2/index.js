class WorkspaceV2ToolStateProducer {
  static TOOL_STATE_PRODUCER_TOOL_IDS = Object.freeze([
    "asset-manager-v2",
    "svg-asset-studio-v2",
    "tilemap-studio-v2",
    "vector-map-editor-v2"
  ]);

  constructor() {
    document.title = "Workspace V2";
    document.body.dataset.toolId = "workspace-v2";
    this.libraryStorageKey = "v2-tool-state-library";
    this.historyStorageKey = "v2-tool-state-history";
    this.errorLogsStorageKey = "v2-error-logs";
    this.mergeAuditStorageKey = "v2-merge-audit-log";
    this.toolStateSelectionStorageKey = "v2-tool-state-selection";
    this.lastMergedToolStateStorageKey = "v2-last-merged-tool-state";
    this.historyMaxEntries = 10;
    this.urlLengthLimit = 2000;
    this.toolStatePayloadBytesLimit = 1024 * 1024;
    this.toolSelect = document.getElementById("workspaceV2ToolSelect");
    this.backButton = document.getElementById("workspaceV2BackButton");
    this.loadFixtureButton = document.getElementById("workspaceV2LoadFixtureButton");
    this.launchButton = document.getElementById("workspaceV2LaunchButton");
    this.openAssetManagerButton = document.getElementById("workspaceV2OpenAssetManagerButton");
    this.importJsonNode = document.getElementById("workspaceV2ImportJson");
    this.importFileNode = document.getElementById("workspaceV2ImportFile");
    this.importButton = document.getElementById("workspaceV2ImportButton");
    this.exportButton = document.getElementById("workspaceV2ExportButton");
    this.workspaceJsonNode = this.importJsonNode;
    this.shareUrlNode = document.getElementById("workspaceV2ShareUrl");
    this.createShareLinkButton = document.getElementById("workspaceV2CreateShareLinkButton");
    this.applyShareLinkButton = document.getElementById("workspaceV2ApplyShareLinkButton");
    this.toolStateNameNode = document.getElementById("workspaceV2ToolStateName");
    this.saveToolStateButton = document.getElementById("workspaceV2SaveToolStateButton");
    this.overwriteToolStateButton = document.getElementById("workspaceV2OverwriteToolStateButton");
    this.loadToolStateButton = document.getElementById("workspaceV2LoadToolStateButton");
    this.deleteToolStateButton = document.getElementById("workspaceV2DeleteToolStateButton");
    this.libraryStatusNode = document.getElementById("workspaceV2LibraryStatus");
    this.libraryEmptyState = document.getElementById("workspaceV2LibraryEmptyState");
    this.toolStateListNode = document.getElementById("workspaceV2ToolStateList");
    this.refreshToolStateHistoryButton = document.getElementById("workspaceV2RefreshToolStateHistoryButton");
    this.toolStateHistoryEmptyState = document.getElementById("workspaceV2ToolStateHistoryEmptyState");
    this.toolStateHistoryListNode = document.getElementById("workspaceV2ToolStateHistoryList");
    this.diffLeftSelect = document.getElementById("workspaceV2DiffLeftSelect");
    this.diffRightSelect = document.getElementById("workspaceV2DiffRightSelect");
    this.diffLeftSelectedLabelNode = document.getElementById("workspaceV2DiffLeftSelectedLabel");
    this.diffRightSelectedLabelNode = document.getElementById("workspaceV2DiffRightSelectedLabel");
    this.diffSelectionStateNode = document.getElementById("workspaceV2DiffSelectionState");
    this.computeDiffButton = document.getElementById("workspaceV2ComputeDiffButton");
    this.diffEnableStateNode = document.getElementById("workspaceV2DiffEnableState");
    this.diffEmptyState = document.getElementById("workspaceV2DiffEmptyState");
    this.diffSummaryNode = document.getElementById("workspaceV2DiffSummary");
    this.diffOutputNode = document.getElementById("workspaceV2DiffOutput");
    this.mergeLeftSelect = document.getElementById("workspaceV2MergeLeftSelect");
    this.mergeRightSelect = document.getElementById("workspaceV2MergeRightSelect");
    this.mergeLeftSelectedLabelNode = document.getElementById("workspaceV2MergeLeftSelectedLabel");
    this.mergeRightSelectedLabelNode = document.getElementById("workspaceV2MergeRightSelectedLabel");
    this.mergeSelectionStateNode = document.getElementById("workspaceV2MergeSelectionState");
    this.computeMergeButton = document.getElementById("workspaceV2ComputeMergeButton");
    this.confirmMergeButton = document.getElementById("workspaceV2ConfirmMergeButton");
    this.applyMergeButton = document.getElementById("workspaceV2ApplyMergeButton");
    this.mergeEnableStateNode = document.getElementById("workspaceV2MergeEnableState");
    this.mergeResultSummaryNode = document.getElementById("workspaceV2MergeResultSummary");
    this.mergeEmptyState = document.getElementById("workspaceV2MergeEmptyState");
    this.mergedToolStateIdNode = document.getElementById("workspaceV2MergedToolStateId");
    this.saveMergedToolStateButton = document.getElementById("workspaceV2SaveMergedToolStateButton");
    this.useMergedInDiffMergeButton = document.getElementById("workspaceV2UseMergedInDiffMergeButton");
    this.undoLastMergeButton = document.getElementById("workspaceV2UndoLastMergeButton");
    this.mergedToolStateStatusNode = document.getElementById("workspaceV2MergedToolStateStatus");
    this.mergeConflictSummaryNode = document.getElementById("workspaceV2MergeConflictSummary");
    this.mergeOutputNode = document.getElementById("workspaceV2MergeOutput");
    this.refreshErrorLogsButton = document.getElementById("workspaceV2RefreshErrorLogsButton");
    this.clearErrorLogsButton = document.getElementById("workspaceV2ClearErrorLogsButton");
    this.errorLogsEmptyState = document.getElementById("workspaceV2ErrorLogsEmptyState");
    this.errorLogsListNode = document.getElementById("workspaceV2ErrorLogsList");
    this.clearToolStateStorageButton = document.getElementById("workspaceV2ClearSessionStorageButton");
    this.clearSavedToolStatesButton = document.getElementById("workspaceV2ClearSavedToolStatesButton");
    this.resetClearErrorLogsButton = document.getElementById("workspaceV2ResetClearErrorLogsButton");
    this.fullResetButton = document.getElementById("workspaceV2FullResetButton");
    this.statusNode = document.getElementById("workspaceV2Status");
    this.importExportStatusNode = null;
    this.importFileDialogPending = false;
    this.currentToolStatePayload = null;
    this.currentToolStateSource = "";
    this.currentHostContextId = "";
    this.lastWorkspaceExportBuildErrorMessage = "";
    this.workspaceActivePalette = null;
    this.workspaceTransitionState = "idle";
    this.pendingMergePreview = null;
    this.lastMergedToolStateResult = null;
    this.mergeOutputToolStateKey = "";
    this.diffOutputToolStateKey = "";
    this.recentToolStateInventory = [];
    this.workspaceManifestGame = null;
    this.workspaceImportedToolEntries = {};
    this.workspaceToolsSummaryNode = null;
    this.loadFixtureButton.addEventListener("click", () => {
      this.loadSelectedToolState();
    });
    this.launchButton.addEventListener("click", () => {
      this.createToolStateAndLaunch();
    });
    this.openAssetManagerButton.addEventListener("click", () => {
      this.openAssetManagerFromWorkspace();
    });
    this.importButton.addEventListener("click", () => {
      this.handleImportWorkspaceToolStateJsonClick();
    });
    this.exportButton.addEventListener("click", () => {
      this.exportWorkspaceToolStateJson();
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
    window.addEventListener("focus", () => {
      this.handleImportFileDialogFocus();
    });
    this.saveToolStateButton.addEventListener("click", () => {
      this.saveNamedToolState(false);
    });
    this.overwriteToolStateButton.addEventListener("click", () => {
      this.saveNamedToolState(true);
    });
    this.loadToolStateButton.addEventListener("click", () => {
      this.loadNamedToolState();
    });
    this.deleteToolStateButton.addEventListener("click", () => {
      this.deleteNamedToolState();
    });
    this.toolStateNameNode.addEventListener("input", () => {
      this.updateToolStateLibraryActionState();
    });
    this.toolSelect.addEventListener("change", () => {
      this.refreshPaletteOwnershipStateAndUi();
    });
    this.refreshToolStateHistoryButton.addEventListener("click", () => {
      this.renderToolStateLibrary();
      this.renderToolStateHistory();
      this.updateToolStateLibraryActionState();
      this.clearDiffOutputForStateChange("", "No diff computed.");
      this.statusNode.textContent = "Workspace V2 tool state views refreshed. Compute Diff or Preview Merge for current selections.";
    });
    this.computeDiffButton.addEventListener("click", () => {
      this.computeSelectedToolStateDiff();
    });
    this.diffLeftSelect.addEventListener("change", () => {
      this.handleDiffSelectionChange();
    });
    this.diffRightSelect.addEventListener("change", () => {
      this.handleDiffSelectionChange();
    });
    this.computeMergeButton.addEventListener("click", () => {
      this.computeSelectedToolStateMerge();
    });
    this.mergeLeftSelect.addEventListener("change", () => {
      this.handleMergeSelectionChange();
    });
    this.mergeRightSelect.addEventListener("change", () => {
      this.handleMergeSelectionChange();
    });
    this.confirmMergeButton.addEventListener("click", () => {
      this.confirmSelectedToolStateMergePreview();
    });
    this.applyMergeButton.addEventListener("click", () => {
      this.applySelectedToolStateMerge();
    });
    this.saveMergedToolStateButton.addEventListener("click", () => {
      this.saveMergedToolStateResult();
    });
    this.useMergedInDiffMergeButton.addEventListener("click", () => {
      this.useMergedToolStateInDiffMerge();
    });
    this.undoLastMergeButton.addEventListener("click", () => {
      this.undoLastMerge();
    });
    this.refreshErrorLogsButton.addEventListener("click", () => {
      this.renderErrorLogsViewer();
    });
    this.clearErrorLogsButton.addEventListener("click", () => {
      this.clearErrorLogs();
    });
    this.clearToolStateStorageButton.addEventListener("click", () => {
      this.clearToolStateStorage();
    });
    this.clearSavedToolStatesButton.addEventListener("click", () => {
      this.clearSavedToolStates();
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
      if (event.key === this.historyStorageKey) {
        this.renderToolStateHistory();
      }
    });
    this.removePaletteManagerProducerOption();
    this.removeDiagnosticsPanelUi();
    this.applyDefaultWorkspaceToolSelection();
    this.registerScrollTextColorRule();
    this.initializeImportExportSectionStatusNode();
    this.initializeWorkspaceToolsSummaryNode();
    this.initializeHiddenImportFileInput();
    this.decodeToolStateParamFromUrl();
    this.restoreActiveToolStateFromHostContextIdUrl();
    this.ensureWorkspaceActivePaletteBaseline();
    this.initializeWorkspaceProducerToolState();
    this.refreshPaletteOwnershipStateAndUi();
    this.renderToolStateLibrary();
    this.renderToolStateHistory();
    this.renderToolStateDiffInputs();
    this.renderToolStateMergeInputs();
    this.updateToolStateLibraryActionState();
    this.renderErrorLogsViewer();
  }

  selectedToolId() {
    const selectedToolId = typeof this.toolSelect.value === "string" ? this.toolSelect.value.trim() : "";
    return this.isToolStateProducerToolId(selectedToolId) ? selectedToolId : "";
  }

  selectedToolStateName() {
    return typeof this.toolStateNameNode.value === "string" ? this.toolStateNameNode.value : "";
  }

  initializeImportExportSectionStatusNode() {
    const heading = Array.from(document.querySelectorAll("h2")).find((node) => {
      return node.textContent && node.textContent.trim() === "Import / Export Tool State JSON";
    });
    if (!heading) {
      return;
    }
    const section = heading.closest("section");
    if (!section) {
      return;
    }
    const existingStatusNode = document.getElementById("workspaceV2ImportExportStatus");
    if (existingStatusNode) {
      this.importExportStatusNode = existingStatusNode;
      return;
    }
    const statusNode = document.createElement("p");
    statusNode.id = "workspaceV2ImportExportStatus";
    statusNode.textContent = "Import/Export ready.";
    section.appendChild(statusNode);
    this.importExportStatusNode = statusNode;
  }

  initializeWorkspaceToolsSummaryNode() {
    const heading = Array.from(document.querySelectorAll("h2")).find((node) => {
      return node.textContent && node.textContent.trim() === "Import / Export Tool State JSON";
    });
    if (!heading) {
      return;
    }
    const section = heading.closest("section");
    if (!section) {
      return;
    }
    const existingNode = document.getElementById("workspaceV2WorkspaceToolsSummary");
    if (existingNode) {
      this.workspaceToolsSummaryNode = existingNode;
      this.renderWorkspaceToolsSummary();
      return;
    }
    const summaryNode = document.createElement("p");
    summaryNode.id = "workspaceV2WorkspaceToolsSummary";
    section.appendChild(summaryNode);
    this.workspaceToolsSummaryNode = summaryNode;
    this.renderWorkspaceToolsSummary();
  }

  readWorkspaceToolsFromTextarea() {
    const rawJson = typeof this.workspaceJsonNode.value === "string" ? this.workspaceJsonNode.value.trim() : "";
    if (!rawJson) {
      return [];
    }
    const parsed = this.safeParseJson(rawJson);
    if (!parsed.ok || !parsed.value || typeof parsed.value !== "object" || Array.isArray(parsed.value)) {
      return [];
    }
    if (!parsed.value.tools || typeof parsed.value.tools !== "object" || Array.isArray(parsed.value.tools)) {
      return [];
    }
    return Object.keys(parsed.value.tools).sort((left, right) => left.localeCompare(right));
  }

  workspaceToolSummaryEntries() {
    const fromTextarea = this.readWorkspaceToolsFromTextarea();
    if (fromTextarea.length > 0) {
      return fromTextarea;
    }
    const entries = ["palette-browser", "workspace-v2"];
    const importedToolIds = Object.keys(this.workspaceImportedToolEntries || {}).sort((left, right) => left.localeCompare(right));
    importedToolIds.forEach((toolId) => {
      if (!entries.includes(toolId)) {
        entries.push(toolId);
      }
    });
    return entries;
  }

  renderWorkspaceToolsSummary() {
    if (!this.workspaceToolsSummaryNode) {
      return;
    }
    const entries = this.workspaceToolSummaryEntries();
    this.workspaceToolsSummaryNode.textContent = entries.length > 0
      ? `Workspace Tools: ${entries.join(", ")}`
      : "Workspace Tools: none";
  }

  setImportExportStatus(message) {
    if (this.importExportStatusNode) {
      this.importExportStatusNode.textContent = message;
    }
    this.renderWorkspaceToolsSummary();
    this.statusNode.textContent = message;
  }

  initializeHiddenImportFileInput() {
    if (!this.importFileNode) {
      return;
    }
    const importFileLabel = document.querySelector('label[for="workspaceV2ImportFile"]');
    if (importFileLabel instanceof HTMLElement) {
      importFileLabel.hidden = true;
      importFileLabel.style.display = "none";
    }
    this.importFileNode.type = "file";
    this.importFileNode.hidden = true;
    this.importFileNode.setAttribute("aria-hidden", "true");
    this.importFileNode.tabIndex = -1;
    this.importFileNode.style.display = "none";
  }

  handleImportWorkspaceToolStateJsonClick() {
    if (!this.importFileNode) {
      if (this.importJsonNode && this.importJsonNode.value.trim()) {
        this.setImportExportStatus("File picker unavailable. Importing from Workspace Tool State JSON.");
        this.importWorkspaceToolStateJson();
        return;
      }
      this.setImportExportStatus("Import error: file picker is unavailable.");
      return;
    }
    this.setImportExportStatus("Select a workspace tool state file to import.");
    this.importFileDialogPending = true;
    this.importFileNode.value = "";
    this.importFileNode.click();
  }

  handleImportFileDialogFocus() {
    if (!this.importFileDialogPending) {
      return;
    }
    window.setTimeout(() => {
      if (!this.importFileDialogPending) {
        return;
      }
      if (!this.importFileNode.files || this.importFileNode.files.length === 0) {
        this.importFileDialogPending = false;
        this.setImportExportStatus("Import cancelled.");
      }
    }, 0);
  }

  removePaletteManagerProducerOption() {
    if (!this.toolSelect) {
      return;
    }
    Array.from(this.toolSelect.options).forEach((option) => {
      if (option.value === "palette-manager-v2") {
        option.remove();
      }
    });
    const validToolIds = new Set(WorkspaceV2ToolStateProducer.TOOL_STATE_PRODUCER_TOOL_IDS);
    Array.from(this.toolSelect.options).forEach((option) => {
      if (!validToolIds.has(option.value)) {
        option.remove();
      }
    });
  }

  removeDiagnosticsPanelUi() {
    const diagnosticsHeading = Array.from(document.querySelectorAll("h2")).find((node) => {
      return node.textContent && node.textContent.trim() === "Diagnostics";
    });
    if (!diagnosticsHeading) {
      return;
    }
    const diagnosticsSection = diagnosticsHeading.closest("section");
    if (diagnosticsSection) {
      diagnosticsSection.remove();
    }
  }

  applyDefaultWorkspaceToolSelection() {
    if (!this.toolSelect) {
      return;
    }
    const defaultToolId = "asset-manager-v2";
    const hasDefaultOption = Array.from(this.toolSelect.options).some((option) => option.value === defaultToolId);
    if (hasDefaultOption) {
      this.toolSelect.value = defaultToolId;
      return;
    }
    if (this.toolSelect.options.length > 0) {
      this.toolSelect.selectedIndex = 0;
    }
  }

  isToolStateProducerToolId(toolId) {
    return (
      typeof toolId === "string" &&
      WorkspaceV2ToolStateProducer.TOOL_STATE_PRODUCER_TOOL_IDS.includes(toolId.trim())
    );
  }

  firstToolStateProducerToolId() {
    if (!this.toolSelect) {
      return "";
    }
    const availableOptionValues = Array.from(this.toolSelect.options)
      .map((option) => option.value)
      .filter((value) => this.isToolStateProducerToolId(value));
    if (availableOptionValues.includes("asset-manager-v2")) {
      return "asset-manager-v2";
    }
    return availableOptionValues.length > 0 ? availableOptionValues[0] : "";
  }

  registerScrollTextColorRule() {
    let textLightActive = false;
    let scheduled = false;
    const activateAt = 52;
    const deactivateAt = 48;
    const applyColors = () => {
      document.body.classList.toggle("text-light", textLightActive);
      const textColor = textLightActive ? "#ffffff" : "#000000";
      document.body.style.transition = "color 180ms ease";
      document.body.style.color = textColor;
      const contentTextNodes = document.querySelectorAll(
        "main h1, main h2, main h3, main h4, main h5, main h6, main p, main span, main div, main li, main strong, main code, main pre, main a, main small, section h1, section h2, section h3, section h4, section h5, section h6, section p, section span, section div, section li, section strong, section code, section pre, section a, section small, article h1, article h2, article h3, article h4, article h5, article h6, article p, article span, article div, article li, article strong, article code, article pre, article a, article small, .hub-panel h1, .hub-panel h2, .hub-panel h3, .hub-panel h4, .hub-panel h5, .hub-panel h6, .hub-panel p, .hub-panel span, .hub-panel div, .hub-panel li, .hub-panel strong, .hub-panel code, .hub-panel pre, .hub-panel a, .hub-panel small"
      );
      contentTextNodes.forEach((node) => {
        if (
          node instanceof HTMLElement &&
          !node.closest("button, input, select, textarea, label, option") &&
          window.getComputedStyle(node).display !== "none" &&
          window.getComputedStyle(node).visibility !== "hidden"
        ) {
          node.style.transition = "color 180ms ease";
          node.style.color = textColor;
        }
      });
      const controls = document.querySelectorAll("button, input, select, textarea, label, option");
      controls.forEach((control) => {
        if (control instanceof HTMLElement) {
          control.style.setProperty("color", "#000000", "important");
          control.style.transition = "color 180ms ease";
        }
      });
    };
    const updateColors = () => {
      scheduled = false;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolledPercent = scrollHeight > 0 ? (window.scrollY / scrollHeight) * 100 : 0;
      if (textLightActive) {
        if (scrolledPercent <= deactivateAt) {
          textLightActive = false;
        }
      } else if (scrolledPercent >= activateAt) {
        textLightActive = true;
      }
      applyColors();
    };
    const scheduleUpdate = () => {
      if (scheduled) {
        return;
      }
      scheduled = true;
      window.requestAnimationFrame(updateColors);
    };
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    const observer = new MutationObserver(() => {
      scheduleUpdate();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    scheduleUpdate();
  }

  isPaletteManagerToolId(toolId) {
    return typeof toolId === "string" && toolId.trim() === "palette-manager-v2";
  }

  isPaletteToolStatePayload(toolStatePayload) {
    return Boolean(
      toolStatePayload &&
      typeof toolStatePayload === "object" &&
      !Array.isArray(toolStatePayload) &&
      this.isPaletteManagerToolId(toolStatePayload.toolId) &&
      toolStatePayload.payloadJson &&
      typeof toolStatePayload.payloadJson === "object" &&
      !Array.isArray(toolStatePayload.payloadJson) &&
      toolStatePayload.payloadJson.paletteDocument &&
      typeof toolStatePayload.payloadJson.paletteDocument === "object" &&
      !Array.isArray(toolStatePayload.payloadJson.paletteDocument) &&
      Array.isArray(toolStatePayload.payloadJson.paletteDocument.swatches)
    );
  }

  ensureWorkspaceActivePaletteBaseline() {
    if (this.hasWorkspaceActivePalette()) {
      return;
    }
    this.workspaceActivePalette = {
      hostContextId: "workspace-active-palette",
      palette: {
        swatches: []
      }
    };
  }

  hasWorkspaceActivePalette() {
    return Boolean(
      this.workspaceActivePalette &&
      typeof this.workspaceActivePalette === "object" &&
      !Array.isArray(this.workspaceActivePalette) &&
      typeof this.workspaceActivePalette.hostContextId === "string" &&
      this.workspaceActivePalette.hostContextId.trim() &&
      this.workspaceActivePalette.palette &&
      typeof this.workspaceActivePalette.palette === "object" &&
      !Array.isArray(this.workspaceActivePalette.palette) &&
      Array.isArray(this.workspaceActivePalette.palette.swatches)
    );
  }

  activePaletteHostContextId() {
    if (!this.hasWorkspaceActivePalette()) {
      return "";
    }
    return this.workspaceActivePalette.hostContextId.trim();
  }

  singleActivePaletteBlockedMessage() {
    return "Workspace already has an active palette. Only one active palette is allowed.";
  }

  singleActivePaletteLibraryMessage() {
    return "Palette is already the active workspace palette at tools.palette-browser. It is not saved as a Tool State Library entry.";
  }

  isBlockedAlternatePaletteToolState(toolStateId, toolStatePayload) {
    if (!this.hasWorkspaceActivePalette()) {
      return false;
    }
    if (!this.isPaletteToolStatePayload(toolStatePayload)) {
      return false;
    }
    if (typeof toolStateId !== "string" || !toolStateId.trim()) {
      return true;
    }
    return toolStateId.trim() !== this.activePaletteHostContextId();
  }

  updateWorkspaceActivePaletteFromCurrentToolState() {
    if (!this.isPaletteToolStatePayload(this.currentToolStatePayload)) {
      return;
    }
    if (typeof this.currentHostContextId !== "string" || !this.currentHostContextId.trim()) {
      return;
    }
    this.workspaceActivePalette = {
      hostContextId: this.currentHostContextId.trim(),
      palette: {
        swatches: this.cloneToolStateValue(this.currentToolStatePayload.payloadJson.paletteDocument.swatches)
      }
    };
  }

  updateWorkspaceActivePaletteFromManifest(workspaceDocument) {
    if (
      !workspaceDocument ||
      typeof workspaceDocument !== "object" ||
      Array.isArray(workspaceDocument) ||
      !workspaceDocument.tools ||
      typeof workspaceDocument.tools !== "object" ||
      Array.isArray(workspaceDocument.tools) ||
      !workspaceDocument.tools["palette-browser"] ||
      typeof workspaceDocument.tools["palette-browser"] !== "object" ||
      Array.isArray(workspaceDocument.tools["palette-browser"])
    ) {
      return;
    }
    const paletteBrowserPayload = workspaceDocument.tools["palette-browser"];
    const paletteValidation = this.validatePaletteSwatchesForWorkspaceExport(
      paletteBrowserPayload.swatches,
      "tools.palette-browser.swatches"
    );
    if (!paletteValidation.ok) {
      return;
    }
    const nextHostContextId = typeof this.currentHostContextId === "string" && this.currentHostContextId.trim()
      ? this.currentHostContextId.trim()
      : "workspace-active-palette";
    this.workspaceActivePalette = {
      hostContextId: nextHostContextId,
      palette: {
        swatches: this.cloneToolStateValue(paletteBrowserPayload.swatches)
      }
    };
  }

  pruneCompetingPaletteRecentToolStates() {
    if (!this.hasWorkspaceActivePalette()) {
      return false;
    }
    const activePaletteHostContextId = this.activePaletteHostContextId();
    const history = this.readToolStateHistory();
    const nextHistory = [];
    const removedPaletteToolStateIds = [];
    history.forEach((entry) => {
      if (!this.isValidToolStateHistoryEntry(entry)) {
        return;
      }
      if (this.isPaletteManagerToolId(entry.tool) && entry.hostContextId !== activePaletteHostContextId) {
        removedPaletteToolStateIds.push(entry.hostContextId);
        return;
      }
      nextHistory.push(entry);
    });
    if (removedPaletteToolStateIds.length === 0) {
      return false;
    }
    removedPaletteToolStateIds.forEach((toolStateId) => {
      sessionStorage.removeItem(toolStateId);
      if (this.currentHostContextId === toolStateId) {
        this.currentHostContextId = "";
        this.setCurrentToolStatePayload(null, "");
      }
    });
    localStorage.setItem(this.historyStorageKey, JSON.stringify(nextHistory));
    return true;
  }

  refreshPaletteOwnershipUiState() {
    if (!this.toolSelect) {
      return;
    }
    this.loadFixtureButton.disabled = false;
    this.launchButton.disabled = false;
  }

  refreshPaletteOwnershipStateAndUi() {
    this.updateWorkspaceActivePaletteFromCurrentToolState();
    const removedCompetingPaletteToolStates = this.pruneCompetingPaletteRecentToolStates();
    this.refreshPaletteOwnershipUiState();
    if (removedCompetingPaletteToolStates) {
      this.renderToolStateHistory();
      this.renderToolStateDiffInputs();
      this.renderToolStateMergeInputs();
    }
    this.refreshWorkspaceToolStateUiStateModel("refresh_load");
  }

  createProducerPayloadForTool(toolId) {
    return this.withToolStateVersion({
      toolId,
      payloadJson: {}
    });
  }

  initializeWorkspaceProducerToolState() {
    this.ensureWorkspaceActivePaletteBaseline();
    if (this.isValidToolStatePayload(this.currentToolStatePayload) && this.currentHostContextId) {
      return;
    }
    const selectedToolId = this.selectedToolId();
    const fallbackToolId = this.firstToolStateProducerToolId();
    const toolId = selectedToolId || fallbackToolId;
    if (!toolId) {
      this.statusNode.textContent = "Workspace V2 initialization blocked: no toolState-capable producer tool is available.";
      return;
    }
    this.toolSelect.value = toolId;
    const initialPayload = this.createProducerPayloadForTool(toolId);
    this.setCurrentToolStatePayload(initialPayload, "workspace-v2-init");
    const hostContextId = this.createHostContextToolStateId(toolId);
    const activation = this.activateWorkspaceToolState(hostContextId, initialPayload, "workspace-v2-init");
    if (!activation.ok) {
      this.statusNode.textContent = activation.message;
      return;
    }
    this.syncWorkspaceManifestTextarea();
    this.statusNode.textContent = `Workspace V2 initialized.\nTool: ${toolId}\nHostContextId: ${hostContextId}\nTool state is active for Save Tool State.`;
  }

  hasActiveWorkspaceToolStateForSave() {
    return Boolean(
      typeof this.currentHostContextId === "string" &&
      this.currentHostContextId.trim() &&
      this.isValidToolStatePayload(this.currentToolStatePayload)
    );
  }

  isValidNewToolStateId(toolStateId) {
    if (typeof toolStateId !== "string") {
      return false;
    }
    if (!toolStateId) {
      return false;
    }
    return /^[A-Za-z0-9_-]+$/.test(toolStateId);
  }

  savedToolStateIdExists(toolStateId) {
    if (typeof toolStateId !== "string" || !toolStateId) {
      return false;
    }
    const library = this.readToolStateLibrary();
    if (library === null) {
      return false;
    }
    return Object.prototype.hasOwnProperty.call(library, toolStateId);
  }

  updateToolStateLibraryActionState() {
    const model = this.refreshWorkspaceToolStateUiStateModel("refresh_load");
    if (model.libraryPaletteLocked) {
      this.libraryStatusNode.textContent = this.singleActivePaletteLibraryMessage();
      return;
    }
    if (!model.libraryHasToolStateInput) {
      this.libraryStatusNode.textContent = "Enter a new tool state ID to save.";
      return;
    }
    if (!model.libraryIdValid) {
      this.libraryStatusNode.textContent = "Invalid tool state ID. Use letters, numbers, hyphen, or underscore only.";
      return;
    }
    if (model.librarySavedToolStateExists) {
      this.libraryStatusNode.textContent = "That tool state ID already exists. Use the saved tool state card to Load or Overwrite it.";
      return;
    }
    if (!model.libraryHasActiveToolState) {
      this.libraryStatusNode.textContent = "No active Workspace V2 tool state is available to save.";
      return;
    }
    this.libraryStatusNode.textContent = "Ready to save a new tool state copy from the active Workspace V2 tool state.";
  }

  computeWorkspaceTransitionStateFromModel(model) {
    if (model.undoEnabled) {
      return "undo_available";
    }
    if (this.lastMergedToolStateResult && this.isValidToolStatePayload(this.lastMergedToolStateResult.payload)) {
      return "merge_applied";
    }
    if (this.pendingMergePreview && (model.mergeCanConfirm || model.mergeCanApply)) {
      return "preview_ready";
    }
    if (this.pendingMergePreview) {
      return "preview_active";
    }
    if (model.mergeCanPreview) {
      return "valid_selection";
    }
    return "idle";
  }

  isWorkspaceTransitionAllowed(actionName, model) {
    if (actionName === "refresh_load") {
      return true;
    }
    if (actionName === "selection_change") {
      return true;
    }
    if (actionName === "delete_tool_state") {
      return true;
    }
    if (actionName === "preview_merge") {
      return model.mergeCanPreview;
    }
    if (actionName === "confirm_preview") {
      return model.mergeCanConfirm;
    }
    if (actionName === "apply_merge") {
      return model.mergeCanApply;
    }
    if (actionName === "undo_merge") {
      return model.undoEnabled;
    }
    return false;
  }

  computeNextWorkspaceTransitionState(actionName, model) {
    if (actionName === "preview_merge") {
      return "preview_active";
    }
    if (actionName === "confirm_preview") {
      return "preview_ready";
    }
    if (actionName === "apply_merge") {
      return model.undoEnabled ? "undo_available" : "merge_applied";
    }
    if (actionName === "undo_merge") {
      return this.computeWorkspaceTransitionStateFromModel(model);
    }
    if (actionName === "selection_change") {
      return this.computeWorkspaceTransitionStateFromModel(model);
    }
    if (actionName === "delete_tool_state") {
      return this.computeWorkspaceTransitionStateFromModel(model);
    }
    return this.computeWorkspaceTransitionStateFromModel(model);
  }

  requestWorkspaceTransition(actionName, model) {
    const uiModel = model || this.computeWorkspaceToolStateUiStateModel();
    if (!this.isWorkspaceTransitionAllowed(actionName, uiModel)) {
      return false;
    }
    this.workspaceTransitionState = this.computeNextWorkspaceTransitionState(actionName, uiModel);
    return true;
  }

  computeWorkspaceToolStateUiStateModel() {
    const selectedToolStateName = this.selectedToolStateName();
    const libraryHasToolStateInput = Boolean(selectedToolStateName);
    const libraryIdValid = this.isValidNewToolStateId(selectedToolStateName);
    const librarySavedToolStateExists = this.savedToolStateIdExists(selectedToolStateName);
    const libraryHasActiveToolState = this.hasActiveWorkspaceToolStateForSave();
    const libraryActivePayload = this.resolveActiveToolStatePayloadForWorkspaceManifest();
    const libraryPaletteLocked = Boolean(this.hasWorkspaceActivePalette() && this.isPaletteToolStatePayload(libraryActivePayload));
    const libraryCanSave = Boolean(
      !libraryPaletteLocked &&
      libraryHasToolStateInput &&
      libraryIdValid &&
      !librarySavedToolStateExists &&
      libraryHasActiveToolState
    );
    const diffLeftEntry = this.findToolStateEntryById(this.diffCandidates, this.diffLeftSelect.value);
    const diffRightEntry = this.findToolStateEntryById(this.diffCandidates, this.diffRightSelect.value);
    const diffSameTool = Boolean(
      diffLeftEntry &&
      diffRightEntry &&
      typeof diffLeftEntry.toolId === "string" &&
      typeof diffRightEntry.toolId === "string" &&
      diffLeftEntry.toolId.trim() &&
      diffRightEntry.toolId.trim() &&
      diffLeftEntry.toolId.trim() === diffRightEntry.toolId.trim()
    );
    const diffCanCompute = Boolean(diffLeftEntry && diffRightEntry && diffLeftEntry.id !== diffRightEntry.id && diffSameTool);
    const mergeLeftEntry = this.findToolStateEntryById(this.mergeCandidates, this.mergeLeftSelect.value);
    const mergeRightEntry = this.findToolStateEntryById(this.mergeCandidates, this.mergeRightSelect.value);
    const mergeCanPreview = Boolean(mergeLeftEntry && mergeRightEntry && mergeLeftEntry.id !== mergeRightEntry.id);
    const mergePreviewFresh = this.hasFreshMergePreviewContext(this.pendingMergePreview);
    const mergePreviewConflictCount = this.pendingMergePreview
      ? (typeof this.pendingMergePreview.conflictCount === "number"
        ? this.pendingMergePreview.conflictCount
        : Object.keys(this.pendingMergePreview.conflicts || {}).length)
      : 0;
    const mergePreviewHasConflicts = Boolean(this.pendingMergePreview && mergePreviewConflictCount > 0);
    const mergeCanConfirm = Boolean(this.pendingMergePreview && !this.pendingMergePreview.confirmed && mergePreviewFresh && !mergePreviewHasConflicts);
    const mergeCanApply = Boolean(this.pendingMergePreview && this.pendingMergePreview.confirmed && mergePreviewFresh && !mergePreviewHasConflicts);
    let mergeEnableText = "Preview Merge is enabled.";
    if (!mergeCanPreview) {
      mergeEnableText = "Select two different tool states to enable Preview Merge.";
    } else if (this.pendingMergePreview && !mergePreviewFresh) {
      mergeEnableText = "Preview is stale. Run Preview Merge again.";
    } else if (mergePreviewHasConflicts && mergePreviewFresh) {
      mergeEnableText = "Preview has conflicts. Resolve conflicts before applying.";
    } else if (mergeCanApply) {
      mergeEnableText = "Apply Merge is enabled.";
    } else if (mergeCanConfirm) {
      mergeEnableText = "Confirm Preview is enabled.";
    }
    const mergeSelectionText = mergeLeftEntry && mergeRightEntry && mergeLeftEntry.id === mergeRightEntry.id
      ? "Choose two different tool states."
      : (mergeCanPreview ? "Selections are valid." : "Select two different tool states to preview merge.");
    const diffSelectionText = diffLeftEntry && diffRightEntry && diffLeftEntry.id === diffRightEntry.id
      ? "Choose two different tool states."
      : (
        diffLeftEntry &&
        diffRightEntry &&
        diffLeftEntry.id !== diffRightEntry.id &&
        !diffSameTool
          ? "Diff requires tool states from the same tool."
          : (diffCanCompute ? "Selections are valid." : "Select two different tool states to compute diff.")
      );
    const authoritativeLastMergedHostContextId = this.resolveAuthoritativeLastMergedHostContextId();
    const assetManagerLaunchReady = Boolean(
      this.isValidToolStatePayload(this.currentToolStatePayload) &&
      this.currentToolStatePayload.payloadJson &&
      typeof this.currentToolStatePayload.payloadJson === "object" &&
      !Array.isArray(this.currentToolStatePayload.payloadJson)
    );
    const mergePreviewVisible = Boolean(
      this.pendingMergePreview ||
      this.mergeOutputToolStateKey ||
      this.mergeOutputNode.textContent !== "No merge preview available."
    );
    return {
      libraryHasToolStateInput,
      libraryIdValid,
      librarySavedToolStateExists,
      libraryHasActiveToolState,
      libraryPaletteLocked,
      libraryCanSave,
      diffLeftEntry,
      diffRightEntry,
      diffCanCompute,
      diffEnableText: diffCanCompute
        ? "Compute Diff is enabled."
        : (
          diffLeftEntry &&
          diffRightEntry &&
          diffLeftEntry.id !== diffRightEntry.id &&
          !diffSameTool
            ? "Diff requires tool states from the same tool."
            : "Select two different tool states to enable Compute Diff."
        ),
      diffSelectionText,
      mergeLeftEntry,
      mergeRightEntry,
      mergeCanPreview,
      mergeCanConfirm,
      mergeCanApply,
      mergeEnableText,
      mergeSelectionText,
      mergePreviewStale: Boolean(this.pendingMergePreview && !mergePreviewFresh),
      mergePreviewVisible,
      undoEnabled: Boolean(authoritativeLastMergedHostContextId),
      assetManagerLaunchReady,
      assetManagerLaunchLabel: assetManagerLaunchReady
        ? "Open Asset Manager V2 (active tool state)"
        : "Open Asset Manager V2 (no tool state)"
    };
  }

  renderWorkspaceToolStateUiStateModel(model) {
    this.saveToolStateButton.disabled = !model.libraryCanSave;
    this.overwriteToolStateButton.disabled = true;
    this.loadToolStateButton.disabled = true;
    this.deleteToolStateButton.disabled = true;
    if (model.mergeLeftEntry || model.mergeRightEntry) {
      this.writePersistedToolStateSelection(model.mergeLeftEntry, model.mergeRightEntry);
    } else {
      this.writePersistedToolStateSelection(model.diffLeftEntry, model.diffRightEntry);
    }
    this.diffLeftSelectedLabelNode.textContent = this.formatSelectionLabel(model.diffLeftEntry);
    this.diffRightSelectedLabelNode.textContent = this.formatSelectionLabel(model.diffRightEntry);
    this.computeDiffButton.disabled = !model.diffCanCompute;
    this.diffEnableStateNode.textContent = model.diffEnableText;
    this.diffSelectionStateNode.textContent = model.diffSelectionText;
    this.mergeLeftSelectedLabelNode.textContent = this.formatSelectionLabel(model.mergeLeftEntry);
    this.mergeRightSelectedLabelNode.textContent = this.formatSelectionLabel(model.mergeRightEntry);
    this.computeMergeButton.disabled = !model.mergeCanPreview;
    this.confirmMergeButton.disabled = !model.mergeCanConfirm;
    this.applyMergeButton.disabled = !model.mergeCanApply;
    this.mergeEnableStateNode.textContent = model.mergeEnableText;
    this.mergeSelectionStateNode.textContent = model.mergeSelectionText;
    if (model.mergePreviewStale) {
      this.setMergeResultSummary("Preview summary is stale because Tool State A or Tool State B changed. Run Preview Merge again.");
    }
    this.undoLastMergeButton.disabled = !model.undoEnabled;
    this.mergeOutputNode.hidden = !model.mergePreviewVisible;
    this.renderMergeConflictSummary();
    this.openAssetManagerButton.disabled = !model.assetManagerLaunchReady;
    this.openAssetManagerButton.textContent = model.assetManagerLaunchLabel;
  }

  refreshWorkspaceToolStateUiStateModel(actionName = "refresh_load") {
    const model = this.computeWorkspaceToolStateUiStateModel();
    if (actionName === "refresh_load") {
      this.workspaceTransitionState = this.computeWorkspaceTransitionStateFromModel(model);
    } else if (!this.requestWorkspaceTransition(actionName, model)) {
      return model;
    }
    this.renderWorkspaceToolStateUiStateModel(model);
    return model;
  }

  setLibraryStatus(message) {
    this.libraryStatusNode.textContent = message;
    this.statusNode.textContent = message;
  }

  setMergedToolStateStatus(message) {
    this.mergedToolStateStatusNode.textContent = message;
    this.statusNode.textContent = message;
  }

  setMergeResultSummary(message) {
    if (!this.mergeResultSummaryNode) {
      return;
    }
    this.mergeResultSummaryNode.textContent = message;
  }

  setMergePreviewSummary(preview) {
    if (!preview || typeof preview !== "object") {
      this.setMergeResultSummary("No merge summary yet.");
      return;
    }
    const addedCount = preview.changes && preview.changes.added ? Object.keys(preview.changes.added).length : 0;
    const updatedCount = preview.changes && preview.changes.updated ? Object.keys(preview.changes.updated).length : 0;
    const unchangedCount = preview.changes && preview.changes.unchanged ? Object.keys(preview.changes.unchanged).length : 0;
    const conflictCount = typeof preview.conflictCount === "number"
      ? preview.conflictCount
      : Object.keys(preview.conflicts || {}).length;
    this.setMergeResultSummary([
      "Merge Preview Summary",
      `Source Tool State ID: ${preview.source && preview.source.id ? preview.source.id : "unknown"}`,
      `Target Tool State ID: ${preview.target && preview.target.id ? preview.target.id : "unknown"}`,
      `Tool ID: ${preview.selectedToolId || "unknown"}`,
      `Added: ${addedCount}`,
      `Updated: ${updatedCount}`,
      `Unchanged: ${unchangedCount}`,
      `Conflicts: ${conflictCount}`
    ].join("\n"));
  }

  setMergeApplySummary(hostContextId, toolId, timestamp, changes) {
    const addedCount = changes && changes.added ? Object.keys(changes.added).length : 0;
    const updatedCount = changes && changes.updated ? Object.keys(changes.updated).length : 0;
    const unchangedCount = changes && changes.unchanged ? Object.keys(changes.unchanged).length : 0;
    this.setMergeResultSummary([
      "Merge Apply Summary",
      `Merged Tool State ID: ${hostContextId}`,
      `Tool ID: ${toolId || "unknown"}`,
      `Timestamp: ${timestamp || "unknown"}`,
      `Added: ${addedCount}`,
      `Updated: ${updatedCount}`,
      `Unchanged: ${unchangedCount}`
    ].join("\n"));
  }

  buildMergeSelectionKey(leftId, rightId) {
    return `${typeof leftId === "string" ? leftId : ""}|${typeof rightId === "string" ? rightId : ""}`;
  }

  currentMergeSelectionKey() {
    return this.buildMergeSelectionKey(this.mergeLeftSelect.value, this.mergeRightSelect.value);
  }

  currentDiffSelectionKey() {
    return this.buildMergeSelectionKey(this.diffLeftSelect.value, this.diffRightSelect.value);
  }

  clearDiffOutputForStateChange(statusMessage, outputMessage) {
    this.diffOutputToolStateKey = "";
    this.diffSummaryNode.textContent = "";
    this.diffOutputNode.textContent = typeof outputMessage === "string" && outputMessage.trim()
      ? outputMessage
      : "No diff computed.";
    if (typeof statusMessage === "string" && statusMessage.trim()) {
      this.statusNode.textContent = statusMessage;
    }
  }

  handleDiffSelectionChange() {
    const currentSelectionKey = this.currentDiffSelectionKey();
    const model = this.refreshWorkspaceToolStateUiStateModel("selection_change");
    if (this.diffOutputToolStateKey && this.diffOutputToolStateKey !== currentSelectionKey) {
      this.clearDiffOutputForStateChange("Selections changed. Compute Diff again.", "Selections changed. Compute Diff again.");
      return;
    }
    if (!model.diffCanCompute && this.diffOutputToolStateKey) {
      this.clearDiffOutputForStateChange(
        "Diff selection is no longer valid. Select Tool State A and Tool State B, then compute diff.",
        "Diff selection is no longer valid for current tool states."
      );
      return;
    }
    if (model.diffCanCompute) {
      this.statusNode.textContent = "Diff selections are valid. Compute Diff is ready.";
      return;
    }
    if (!Array.isArray(this.diffCandidates) || this.diffCandidates.length < 2) {
      this.statusNode.textContent = "Create or reopen at least two Workspace V2 tool states before comparing.";
      return;
    }
    if (!this.diffLeftSelect.value && !this.diffRightSelect.value) {
      this.statusNode.textContent = "Select Tool State A and Tool State B to enable Compute Diff.";
      return;
    }
    if (!this.diffLeftSelect.value) {
      this.statusNode.textContent = "Select Tool State A to enable Compute Diff.";
      return;
    }
    if (!this.diffRightSelect.value) {
      this.statusNode.textContent = "Select Tool State B to enable Compute Diff.";
      return;
    }
    if (this.diffLeftSelect.value === this.diffRightSelect.value) {
      this.statusNode.textContent = "Choose two different tool states to enable Compute Diff.";
      return;
    }
    const diffLeftEntry = this.findToolStateEntryById(this.diffCandidates, this.diffLeftSelect.value);
    const diffRightEntry = this.findToolStateEntryById(this.diffCandidates, this.diffRightSelect.value);
    if (
      diffLeftEntry &&
      diffRightEntry &&
      diffLeftEntry.id !== diffRightEntry.id &&
      diffLeftEntry.toolId !== diffRightEntry.toolId
    ) {
      this.statusNode.textContent = "Diff requires tool states from the same tool.";
      return;
    }
    this.statusNode.textContent = "Select two different tool states to enable Compute Diff.";
  }

  clearMergePanelTransientState(summaryMessage, outputMessage, statusMessage) {
    this.pendingMergePreview = null;
    this.mergeOutputToolStateKey = "";
    this.lastMergedToolStateResult = null;
    this.mergedToolStateIdNode.value = "";
    this.mergedToolStateStatusNode.textContent = "No merged tool state result to save.";
    this.setMergeResultSummary(summaryMessage);
    this.mergeOutputNode.textContent = outputMessage;
    this.mergeConflictSummaryNode.hidden = true;
    this.mergeConflictSummaryNode.textContent = "";
    if (typeof statusMessage === "string" && statusMessage.trim()) {
      this.statusNode.textContent = statusMessage;
    }
    this.refreshWorkspaceToolStateUiStateModel("refresh_load");
  }

  clearMergeOutputForSelectionChange() {
    this.clearMergePanelTransientState(
      "Selections changed. Run Preview Merge again.",
      "No merge preview available.",
      "Selections changed. Run Preview Merge again."
    );
  }

  handleMergeSelectionChange() {
    const currentSelectionKey = this.currentMergeSelectionKey();
    if (this.mergeOutputToolStateKey && this.mergeOutputToolStateKey !== currentSelectionKey) {
      this.clearMergeOutputForSelectionChange();
    }
    const model = this.refreshWorkspaceToolStateUiStateModel("selection_change");
    if (!Array.isArray(this.mergeCandidates) || this.mergeCandidates.length < 2) {
      this.statusNode.textContent = "Create or reopen at least two Workspace V2 tool states before previewing a merge.";
      return;
    }
    if (!this.mergeLeftSelect.value && !this.mergeRightSelect.value) {
      this.statusNode.textContent = "Select Tool State A and Tool State B to enable Preview Merge.";
      return;
    }
    if (!this.mergeLeftSelect.value) {
      this.statusNode.textContent = "Select Tool State A to enable Preview Merge.";
      return;
    }
    if (!this.mergeRightSelect.value) {
      this.statusNode.textContent = "Select Tool State B to enable Preview Merge.";
      return;
    }
    if (this.mergeLeftSelect.value === this.mergeRightSelect.value) {
      this.statusNode.textContent = "Choose two different tool states to enable Preview Merge.";
      return;
    }
    if (model.mergeCanApply) {
      this.statusNode.textContent = "Preview confirmed. Apply Merge is enabled.";
      return;
    }
    if (model.mergeCanConfirm) {
      this.statusNode.textContent = "Preview ready. Confirm Preview is enabled.";
      return;
    }
    if (model.mergeCanPreview) {
      this.statusNode.textContent = "Merge selections are valid. Run Preview Merge (Dry Run).";
    }
  }

  readLastMergedHostContextId() {
    const raw = sessionStorage.getItem(this.lastMergedToolStateStorageKey);
    return typeof raw === "string" ? raw.trim() : "";
  }

  writeLastMergedHostContextId(hostContextId) {
    if (typeof hostContextId !== "string" || !hostContextId.trim()) {
      sessionStorage.removeItem(this.lastMergedToolStateStorageKey);
      return;
    }
    sessionStorage.setItem(this.lastMergedToolStateStorageKey, hostContextId.trim());
  }

  resolveAuthoritativeLastMergedHostContextId() {
    const mergedHostContextId = this.readLastMergedHostContextId();
    if (!mergedHostContextId) {
      return "";
    }
    const history = this.readToolStateHistory();
    const mergedRecentEntry = history.find((entry) => entry.hostContextId === mergedHostContextId);
    const existsInRecent = Boolean(mergedRecentEntry);
    const existsInSessionStorage = typeof sessionStorage.getItem(mergedHostContextId) === "string";
    const existsAsMergedRecent = Boolean(
      mergedRecentEntry &&
      mergedRecentEntry.payload &&
      typeof mergedRecentEntry.payload === "object" &&
      !Array.isArray(mergedRecentEntry.payload) &&
      mergedRecentEntry.payload.mergeResultMeta &&
      typeof mergedRecentEntry.payload.mergeResultMeta === "object" &&
      mergedRecentEntry.payload.mergeResultMeta.isMergedResult === true
    );
    if (!existsInRecent || !existsInSessionStorage || !existsAsMergedRecent) {
      console.debug("[WorkspaceV2UndoLastMerge] stale_authoritative_merge_record", {
        lastMergedHostContextId: mergedHostContextId,
        existsInRecent,
        existsInSessionStorage,
        existsAsMergedRecent
      });
      this.writeLastMergedHostContextId("");
      return "";
    }
    return mergedHostContextId;
  }

  updateUndoLastMergeState() {
    this.refreshWorkspaceToolStateUiStateModel("refresh_load");
  }

  readActiveToolStatePayloadForLibraryActions() {
    if (!this.currentHostContextId || typeof this.currentHostContextId !== "string" || !this.currentHostContextId.trim()) {
      return null;
    }
    const raw = sessionStorage.getItem(this.currentHostContextId.trim());
    if (typeof raw !== "string") {
      return null;
    }
    const parsed = this.safeParseJson(raw);
    if (!parsed.ok || !this.isValidToolStatePayload(parsed.value)) {
      return null;
    }
    const payloadValidation = this.validateWorkspaceToolStatePayload(parsed.value, "activeToolState");
    if (!payloadValidation.ok) {
      return null;
    }
    return parsed.value;
  }

  resolveActiveToolStatePayloadForWorkspaceManifest() {
    return this.readActiveToolStatePayloadForLibraryActions();
  }

  readToolStatePayloadFromRecentToolStateId(toolStateId) {
    if (typeof toolStateId !== "string" || !toolStateId.trim()) {
      return null;
    }
    const history = this.readToolStateHistory();
    const recentEntry = history.find((entry) => entry.hostContextId === toolStateId.trim());
    if (!recentEntry) {
      return null;
    }
    return this.resolveToolStatePayloadFromContextId(toolStateId.trim());
  }

  readToolStatePayloadForLibraryWrite(toolStateId) {
    if (typeof toolStateId !== "string" || !toolStateId.trim()) {
      return null;
    }
    const raw = sessionStorage.getItem(toolStateId.trim());
    if (typeof raw !== "string") {
      return null;
    }
    const parsed = this.safeParseJson(raw);
    if (!parsed.ok || !this.isValidToolStatePayload(parsed.value)) {
      return null;
    }
    const payloadValidation = this.validateWorkspaceToolStatePayload(parsed.value, `sessionStorage.${toolStateId.trim()}`);
    if (!payloadValidation.ok) {
      return null;
    }
    return parsed.value;
  }

  readToolStatePayloadForSaveAction(toolStateId) {
    const activePayload = this.readActiveToolStatePayloadForLibraryActions();
    if (this.isValidToolStatePayload(activePayload)) {
      return activePayload;
    }
    return null;
  }

  readInvalidPaletteSavedToolStateId(library) {
    if (!library || typeof library !== "object" || Array.isArray(library)) {
      return "";
    }
    for (const toolStateId of Object.keys(library)) {
      const payload = library[toolStateId];
      if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        continue;
      }
      if (typeof payload.toolId !== "string" || payload.toolId.trim() !== "palette-manager-v2") {
        continue;
      }
      if (Object.prototype.hasOwnProperty.call(payload, "paletteJson")) {
        return toolStateId;
      }
      if (!payload.payloadJson || typeof payload.payloadJson !== "object" || Array.isArray(payload.payloadJson)) {
        return toolStateId;
      }
      if (!payload.payloadJson.paletteDocument || typeof payload.payloadJson.paletteDocument !== "object" || Array.isArray(payload.payloadJson.paletteDocument)) {
        return toolStateId;
      }
    }
    return "";
  }

  validatePaletteSwatchesForWorkspaceExport(swatches, swatchesPath) {
    if (!Array.isArray(swatches)) {
      return { ok: false, message: `${swatchesPath} must be an array.` };
    }
    for (let index = 0; index < swatches.length; index += 1) {
      const swatchPath = `${swatchesPath}[${index}]`;
      const swatch = swatches[index];
      if (!swatch || typeof swatch !== "object" || Array.isArray(swatch)) {
        return { ok: false, message: `${swatchPath} must be an object.` };
      }
      const swatchKeys = Object.keys(swatch);
      const allowedSwatchKeys = new Set(["symbol", "hex", "name"]);
      for (const swatchKey of swatchKeys) {
        if (!allowedSwatchKeys.has(swatchKey)) {
          return { ok: false, message: `${swatchPath}.${swatchKey} is not allowed.` };
        }
      }
      if (typeof swatch.symbol !== "string" || swatch.symbol.length !== 1) {
        return { ok: false, message: `${swatchPath}.symbol must be exactly one character.` };
      }
      if (typeof swatch.hex !== "string" || !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(swatch.hex)) {
        return { ok: false, message: `${swatchPath}.hex must be #RRGGBB or #RRGGBBAA.` };
      }
      if (typeof swatch.name !== "string" || !swatch.name.trim()) {
        return { ok: false, message: `${swatchPath}.name is required.` };
      }
    }
    return { ok: true, message: "" };
  }

  resolveActivePaletteForWorkspaceExport(activePayload, library) {
    let knownPaletteCount = 0;
    if (library && typeof library === "object" && !Array.isArray(library)) {
      for (const toolStateId of Object.keys(library)) {
        const savedPayload = library[toolStateId];
        if (!this.isPaletteToolStatePayload(savedPayload)) {
          continue;
        }
        knownPaletteCount += 1;
      }
    }
    if (this.hasWorkspaceActivePalette()) {
      const swatchValidation = this.validatePaletteSwatchesForWorkspaceExport(
        this.workspaceActivePalette.palette.swatches,
        "tools.palette-browser.swatches"
      );
      if (!swatchValidation.ok) {
        return { ok: false, message: swatchValidation.message };
      }
      return {
        ok: true,
        paletteBrowserPayload: {
          schema: "html-js-gaming.palette",
          version: 1,
          name: "Workspace Active Palette",
          swatches: this.cloneToolStateValue(this.workspaceActivePalette.palette.swatches)
        }
      };
    }
    if (this.isPaletteToolStatePayload(activePayload)) {
      const swatchValidation = this.validatePaletteSwatchesForWorkspaceExport(
        activePayload.payloadJson.paletteDocument.swatches,
        "tools.workspace-v2.activeToolState.payloadJson.paletteDocument.swatches"
      );
      if (!swatchValidation.ok) {
        return { ok: false, message: swatchValidation.message };
      }
      return {
        ok: true,
        paletteBrowserPayload: {
          schema: "html-js-gaming.palette",
          version: 1,
          name: "Workspace Active Palette",
          swatches: this.cloneToolStateValue(activePayload.payloadJson.paletteDocument.swatches)
        }
      };
    }
    if (knownPaletteCount > 1) {
      return {
        ok: false,
        message: "Multiple palettes are present. Select one active palette tool state before export."
      };
    }
    return {
      ok: false,
      message: "Workspace export requires one active palette. Only one active palette is allowed."
    };
  }

  selectedMergedToolStateId() {
    return typeof this.mergedToolStateIdNode.value === "string" ? this.mergedToolStateIdNode.value.trim() : "";
  }

  looksLikeWorkspaceHostContextId(toolStateId) {
    if (typeof toolStateId !== "string" || !toolStateId.trim()) {
      return false;
    }
    return /-v2-\d{13}-[a-z0-9]{8}$/i.test(toolStateId.trim());
  }

  cleanupStaleInvalidSavedEntries(library) {
    if (!library || typeof library !== "object" || Array.isArray(library)) {
      return false;
    }
    let removedAny = false;
    Object.keys(library).forEach((toolStateId) => {
      const payload = library[toolStateId];
      if (!this.isValidToolStatePayload(payload)) {
        return;
      }
      if (!this.looksLikeWorkspaceHostContextId(toolStateId)) {
        return;
      }
      const storagePayload = this.readToolStatePayloadForLibraryWrite(toolStateId);
      const hasMatchingStorage = this.isValidToolStatePayload(storagePayload);
      const payloadHostContextId = typeof payload.hostContextId === "string" ? payload.hostContextId.trim() : "";
      const payloadToolId = typeof payload.toolId === "string" ? payload.toolId.trim() : "";
      const idMatchesPayloadHostContext = payloadHostContextId && payloadHostContextId === toolStateId;
      const idMatchesToolMetadata = payloadToolId && toolStateId.startsWith(`${payloadToolId}-`);
      if (!hasMatchingStorage && !idMatchesPayloadHostContext && !idMatchesToolMetadata) {
        delete library[toolStateId];
        removedAny = true;
      }
    });
    return removedAny;
  }

  fixturePathForTool(toolId) {
    return `../../tests/fixtures/v2-tools/${toolId}.json`;
  }

  setCurrentToolStatePayload(toolStatePayload, sourceLabel) {
    this.currentToolStatePayload = toolStatePayload;
    this.currentToolStateSource = sourceLabel;
    this.updateWorkspaceActivePaletteFromCurrentToolState();
    this.refreshPaletteOwnershipUiState();
  }

  isValidToolStatePayload(toolStatePayload) {
    return Boolean(toolStatePayload && typeof toolStatePayload === "object" && !Array.isArray(toolStatePayload));
  }

  toolStatePayloadMetrics(toolStatePayload) {
    const serializedPayload = JSON.stringify(toolStatePayload);
    return {
      serializedPayload,
      bytes: new TextEncoder().encode(serializedPayload).length
    };
  }

  validateToolStatePayloadSize(toolStatePayload) {
    const metrics = this.toolStatePayloadMetrics(toolStatePayload);
    if (metrics.bytes > this.toolStatePayloadBytesLimit) {
      return {
        ok: false,
        message: `Tool state size exceeds allowed limit. Payload is ${metrics.bytes} bytes and limit is ${this.toolStatePayloadBytesLimit} bytes.`,
        metrics
      };
    }
    return { ok: true, message: "", metrics };
  }

  withToolStateVersion(toolStatePayload) {
    return {
      ...toolStatePayload,
      version: "v2"
    };
  }

  activateWorkspaceToolState(hostContextId, toolStatePayload, sourceLabel) {
    if (typeof hostContextId !== "string" || !hostContextId.trim()) {
      return { ok: false, message: "Tool state activation failed: hostContextId is required." };
    }
    if (!this.isValidToolStatePayload(toolStatePayload)) {
      return { ok: false, message: "Tool state activation failed: payload is invalid." };
    }
    const payloadValidation = this.validateWorkspaceToolStatePayload(toolStatePayload, "toolStateActivation");
    if (!payloadValidation.ok) {
      return { ok: false, message: payloadValidation.message };
    }
    const sizeValidation = this.validateToolStatePayloadSize(toolStatePayload);
    if (!sizeValidation.ok) {
      return { ok: false, message: sizeValidation.message };
    }
    sessionStorage.setItem(hostContextId.trim(), sizeValidation.metrics.serializedPayload);
    this.currentHostContextId = hostContextId.trim();
    this.setCurrentToolStatePayload(toolStatePayload, sourceLabel);
    return { ok: true, message: "", payload: toolStatePayload };
  }

  applyToolStatePayload(toolStatePayload, sourceLabel) {
    if (!this.isValidToolStatePayload(toolStatePayload)) {
      this.statusNode.textContent = "Tool state payload is invalid. Expected a JSON object payload.";
      return false;
    }
    const payloadValidation = this.validateWorkspaceToolStatePayload(toolStatePayload, "toolStatePayload");
    if (!payloadValidation.ok) {
      this.statusNode.textContent = payloadValidation.message;
      return false;
    }
    const toolId = this.selectedToolId();
    if (!toolId) {
      this.statusNode.textContent = "Select a V2 tool before applying tool state payload.";
      return false;
    }
    if (toolStatePayload.toolId.trim() !== toolId) {
      this.statusNode.textContent = `Tool state payload toolId '${toolStatePayload.toolId.trim()}' does not match selected tool '${toolId}'.`;
      return false;
    }
    const activation = this.activateWorkspaceToolState(this.createHostContextToolStateId(toolId), toolStatePayload, sourceLabel);
    if (!activation.ok) {
      this.statusNode.textContent = activation.message;
      return false;
    }
    this.syncWorkspaceManifestTextarea();
    return true;
  }

  encodeToolStatePayload(toolStatePayload) {
    const json = JSON.stringify(toolStatePayload);
    const bytes = new TextEncoder().encode(json);
    let binary = "";
    for (let index = 0; index < bytes.length; index += 1) {
      binary += String.fromCharCode(bytes[index]);
    }
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  decodeToolStatePayload(encodedPayload) {
    if (typeof encodedPayload !== "string" || !encodedPayload.trim()) {
      throw new Error("Missing encoded tool state payload.");
    }
    if (encodedPayload.trim().length > this.urlLengthLimit) {
      throw new Error(`Tool state size exceeds allowed limit for URL payload. Encoded payload length is ${encodedPayload.trim().length} and limit is ${this.urlLengthLimit}.`);
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
    if (!this.isValidToolStatePayload(parsed)) {
      throw new Error("Decoded tool state payload is invalid. Expected an object payload.");
    }
    return parsed;
  }

  decodeToolStateParamFromUrl() {
    const params = new URL(window.location.href).searchParams;
    if (!params.has("toolState")) {
      return;
    }
    try {
      const decoded = this.decodeToolStatePayload(params.get("toolState"));
      if (!this.applyToolStatePayload(decoded, "share-link")) {
        return;
      }
      this.statusNode.textContent = `Share tool state link decoded.\nTool: ${this.selectedToolId()}\nHostContextId: ${this.currentHostContextId}\nReady to launch.`;
      this.shareUrlNode.value = window.location.href;
    } catch (error) {
      this.statusNode.textContent = `Share tool state decode failed: ${error instanceof Error ? error.message : "unknown error"}`;
    }
  }

  restoreActiveToolStateFromHostContextIdUrl() {
    const params = new URL(window.location.href).searchParams;
    const hostContextId = typeof params.get("hostContextId") === "string" ? params.get("hostContextId").trim() : "";
    if (!hostContextId) {
      return;
    }
    const serializedPayload = sessionStorage.getItem(hostContextId);
    if (typeof serializedPayload !== "string") {
      return;
    }
    const parsed = this.safeParseJson(serializedPayload);
    if (!parsed.ok || !this.isValidToolStatePayload(parsed.value)) {
      return;
    }
    const payloadValidation = this.validateWorkspaceToolStatePayload(parsed.value, `sessionStorage.${hostContextId}`);
    if (!payloadValidation.ok) {
      return;
    }
    if (parsed.value.toolId !== "asset-manager-v2") {
      return;
    }
    const activation = this.activateWorkspaceToolState(hostContextId, parsed.value, "workspace-host-context-url");
    if (!activation.ok) {
      return;
    }
    if (Array.from(this.toolSelect.options).some((option) => option.value === parsed.value.toolId)) {
      this.toolSelect.value = parsed.value.toolId;
    }
    this.syncWorkspaceManifestTextarea();
    this.statusNode.textContent = `Workspace V2 restored active tool state from hostContextId: ${hostContextId}`;
  }

  readToolStateLibrary() {
    const rawLibrary = localStorage.getItem(this.libraryStorageKey);
    if (!rawLibrary) {
      return {};
    }
    try {
      const parsed = JSON.parse(rawLibrary);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        this.statusNode.textContent = "Tool state library is invalid. Expected object map under localStorage key v2-tool-state-library.";
        return null;
      }
      for (const toolStateName of Object.keys(parsed)) {
        if (!this.isValidToolStatePayload(parsed[toolStateName])) {
          this.statusNode.textContent = `Tool state library entry '${toolStateName}' is invalid.`;
          return null;
        }
        const payloadValidation = this.validateWorkspaceToolStatePayload(parsed[toolStateName], `tools.workspace-v2.savedToolStates.${toolStateName}`);
        if (!payloadValidation.ok) {
          this.statusNode.textContent = `Tool state library entry '${toolStateName}' is invalid: ${payloadValidation.message}`;
          return null;
        }
      }
      return parsed;
    } catch (error) {
      this.statusNode.textContent = `Tool state library parse failed: ${error instanceof Error ? error.message : "unknown error"}`;
      return null;
    }
  }

  writeToolStateLibrary(library) {
    localStorage.setItem(this.libraryStorageKey, JSON.stringify(library));
    this.renderToolStateDiffInputs();
    this.renderToolStateMergeInputs();
  }

  renderToolStateLibrary() {
    const library = this.readToolStateLibrary();
    if (library === null) {
      this.toolStateListNode.replaceChildren();
      this.libraryEmptyState.hidden = false;
      this.libraryEmptyState.textContent = "Tool state library is invalid. Fix stored JSON or clear v2-tool-state-library.";
      return;
    }
    if (this.cleanupStaleInvalidSavedEntries(library)) {
      localStorage.setItem(this.libraryStorageKey, JSON.stringify(library));
    }
    const toolStateNames = Object.keys(library).sort((left, right) => left.localeCompare(right));
    this.toolStateListNode.replaceChildren();
    this.libraryEmptyState.hidden = toolStateNames.length > 0;
    this.libraryEmptyState.textContent = "No saved tool states in library.";
    const canOverwriteFromActiveToolState = this.hasActiveWorkspaceToolStateForSave();
    const hasActivePalette = this.hasWorkspaceActivePalette();
    const activePaletteHostContextId = this.activePaletteHostContextId();
    toolStateNames.forEach((toolStateName) => {
      const item = document.createElement("li");
      const payload = library[toolStateName];
      const label = document.createElement("strong");
      const idLine = document.createElement("div");
      const idLabel = document.createElement("span");
      const idCode = document.createElement("code");
      const copyIdButton = document.createElement("button");
      const useInLibraryButton = document.createElement("button");
      const loadButton = document.createElement("button");
      const overwriteButton = document.createElement("button");
      const deleteSavedButton = document.createElement("button");
      const readableLabel = payload && typeof payload.toolId === "string" && payload.toolId.trim()
        ? payload.toolId.trim()
        : "saved-tool-state";
      const paletteRowLocked = Boolean(
        hasActivePalette &&
        this.isPaletteToolStatePayload(payload) &&
        toolStateName !== activePaletteHostContextId
      );
      label.textContent = `${readableLabel} (${toolStateName})`;
      idLabel.textContent = "Tool State ID: ";
      idCode.textContent = toolStateName;
      idCode.title = toolStateName;
      idLine.append(idLabel, idCode);
      copyIdButton.type = "button";
      copyIdButton.textContent = "Copy ID";
      copyIdButton.addEventListener("click", () => {
        this.copySavedToolStateIdToClipboard(toolStateName);
      });
      useInLibraryButton.type = "button";
      useInLibraryButton.textContent = "Use in Diff/Merge";
      useInLibraryButton.addEventListener("click", () => {
        this.useSavedToolStateIdInLibraryInput(toolStateName);
      });
      loadButton.type = "button";
      loadButton.textContent = "Load";
      loadButton.disabled = paletteRowLocked;
      loadButton.addEventListener("click", () => {
        this.loadSavedToolStateById(toolStateName);
      });
      overwriteButton.type = "button";
      overwriteButton.textContent = "Overwrite";
      overwriteButton.disabled = !canOverwriteFromActiveToolState || paletteRowLocked;
      overwriteButton.addEventListener("click", () => {
        this.overwriteSavedToolStateById(toolStateName);
      });
      deleteSavedButton.type = "button";
      deleteSavedButton.textContent = "Delete Saved";
      deleteSavedButton.addEventListener("click", () => {
        this.deleteSavedToolStateById(toolStateName);
      });
      item.append(label, idLine, copyIdButton, useInLibraryButton, loadButton, overwriteButton, deleteSavedButton);
      this.toolStateListNode.appendChild(item);
    });
    this.renderToolStateDiffInputs();
    this.renderToolStateMergeInputs();
    this.updateToolStateLibraryActionState();
  }

  async copySavedToolStateIdToClipboard(toolStateId) {
    if (typeof toolStateId !== "string" || !toolStateId.trim()) {
      this.setLibraryStatus("Copy ID failed: saved tool state ID is missing.");
      return;
    }
    try {
      if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
        this.setLibraryStatus("Copy ID is unavailable in this browser context.");
        return;
      }
      await navigator.clipboard.writeText(toolStateId.trim());
      this.setLibraryStatus(`Saved tool state ID copied: ${toolStateId.trim()}`);
    } catch (error) {
      this.setLibraryStatus(`Copy ID failed: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  }

  useSavedToolStateIdInLibraryInput(toolStateId) {
    if (typeof toolStateId !== "string" || !toolStateId.trim()) {
      this.setLibraryStatus("Use in Library failed: saved tool state ID is missing.");
      return;
    }
    this.toolStateNameNode.value = toolStateId.trim();
    this.updateToolStateLibraryActionState();
    this.syncDiffAndMergeSelectionSlotsFromToolStateId(toolStateId.trim());
    this.setLibraryStatus(`Saved tool state ID ready for Diff/Merge and Library actions: ${toolStateId.trim()}`);
  }

  loadSavedToolStateById(toolStateId) {
    if (typeof toolStateId !== "string" || !toolStateId.trim()) {
      this.setLibraryStatus("Enter a saved tool state ID before loading.");
      return;
    }
    const library = this.readToolStateLibrary();
    if (library === null) {
      return;
    }
    if (!Object.prototype.hasOwnProperty.call(library, toolStateId.trim())) {
      this.setLibraryStatus("Saved tool state not found.");
      return;
    }
    if (this.isBlockedAlternatePaletteToolState(toolStateId.trim(), library[toolStateId.trim()])) {
      this.setLibraryStatus(this.singleActivePaletteLibraryMessage());
      return;
    }
    this.toolStateNameNode.value = toolStateId.trim();
    this.updateToolStateLibraryActionState();
    this.loadNamedToolState();
    this.syncDiffAndMergeSelectionSlotsFromToolStateId(toolStateId.trim());
    this.renderToolStateLibrary();
  }

  overwriteSavedToolStateById(toolStateId) {
    if (typeof toolStateId !== "string" || !toolStateId.trim()) {
      this.setLibraryStatus("Enter a saved tool state ID before overwriting.");
      return;
    }
    const activePayload = this.readActiveToolStatePayloadForLibraryActions();
    if (!this.isValidToolStatePayload(activePayload)) {
      this.setLibraryStatus("No active Workspace V2 tool state is available to overwrite from.");
      return;
    }
    const library = this.readToolStateLibrary();
    if (library === null) {
      return;
    }
    if (!Object.prototype.hasOwnProperty.call(library, toolStateId.trim())) {
      this.setLibraryStatus("Saved tool state not found. Use Save Tool State to create it first.");
      return;
    }
    if (this.isBlockedAlternatePaletteToolState(toolStateId.trim(), library[toolStateId.trim()])) {
      this.setLibraryStatus(this.singleActivePaletteLibraryMessage());
      return;
    }
    if (this.isBlockedAlternatePaletteToolState(toolStateId.trim(), activePayload)) {
      this.setLibraryStatus(this.singleActivePaletteLibraryMessage());
      return;
    }
    library[toolStateId.trim()] = activePayload;
    this.writeToolStateLibrary(library);
    this.renderToolStateLibrary();
    this.setLibraryStatus(`Saved tool state '${toolStateId.trim()}' overwritten with current workspace state.`);
  }

  deleteSavedToolStateById(toolStateId) {
    if (typeof toolStateId !== "string" || !toolStateId.trim()) {
      this.setLibraryStatus("Enter a saved tool state ID before deleting.");
      return;
    }
    this.toolStateNameNode.value = toolStateId.trim();
    this.updateToolStateLibraryActionState();
    this.deleteNamedToolState();
  }

  isValidToolStateHistoryEntry(entry) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return false;
    if (typeof entry.hostContextId !== "string" || !entry.hostContextId.trim()) return false;
    if (typeof entry.tool !== "string" || !entry.tool.trim()) return false;
    if (typeof entry.timestamp !== "string" || !entry.timestamp.trim()) return false;
    if (!this.isValidToolStatePayload(entry.payload)) return false;
    const payloadValidation = this.validateWorkspaceToolStatePayload(entry.payload, `history.${entry.hostContextId.trim()}.payload`);
    if (!payloadValidation.ok) return false;
    if (entry.payload.toolId.trim() !== entry.tool.trim()) return false;
    return true;
  }

  readToolStateHistory() {
    const rawHistory = localStorage.getItem(this.historyStorageKey);
    if (!rawHistory) {
      return [];
    }
    let parsedHistory = null;
    try {
      parsedHistory = JSON.parse(rawHistory);
    } catch (error) {
      console.warn(`[WorkspaceV2ToolStateHistory] Ignoring invalid v2-tool-state-history JSON: ${error instanceof Error ? error.message : "unknown error"}`);
      return [];
    }
    if (!Array.isArray(parsedHistory)) {
      console.warn("[WorkspaceV2ToolStateHistory] Ignoring invalid v2-tool-state-history value: expected array.");
      return [];
    }
    const validEntries = [];
    let invalidCount = 0;
    parsedHistory.forEach((entry) => {
      if (this.isValidToolStateHistoryEntry(entry)) {
        validEntries.push(entry);
        return;
      }
      invalidCount += 1;
    });
    if (invalidCount > 0) {
      console.warn(`[WorkspaceV2ToolStateHistory] Ignored ${invalidCount} invalid history entr${invalidCount === 1 ? "y" : "ies"}.`);
      this.statusNode.textContent = `Tool state history contains ${invalidCount} invalid entr${invalidCount === 1 ? "y" : "ies"}. Remove invalid entries before loading tool states.`;
    }
    return validEntries;
  }

  writeToolStateHistory(entries) {
    localStorage.setItem(this.historyStorageKey, JSON.stringify(entries));
    this.renderToolStateDiffInputs();
    this.renderToolStateMergeInputs();
  }

  addRecentToolStateEntry(hostContextId, toolId, payload) {
    if (typeof hostContextId !== "string" || !hostContextId.trim()) return;
    if (typeof toolId !== "string" || !toolId.trim()) return;
    if (!this.isValidToolStatePayload(payload)) return;

    const history = this.readToolStateHistory();
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
    this.writeToolStateHistory(deduped);
    this.renderToolStateHistory();
  }

  renderToolStateHistory() {
    let history = this.readToolStateHistory();
    if (this.pruneCompetingPaletteRecentToolStates()) {
      history = this.readToolStateHistory();
    }
    this.recentToolStateInventory = this.buildRecentToolStateInventory(history);
    this.updateUndoLastMergeState();
    this.toolStateHistoryListNode.replaceChildren();
    this.toolStateHistoryEmptyState.hidden = history.length > 0;
    this.toolStateHistoryEmptyState.textContent = "No recent tool states.";
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
      const isMergedResult = Boolean(
        entry.payload &&
        typeof entry.payload === "object" &&
        !Array.isArray(entry.payload) &&
        entry.payload.mergeResultMeta &&
        typeof entry.payload.mergeResultMeta === "object" &&
        entry.payload.mergeResultMeta.isMergedResult === true
      );
      const titleToolLabel = isMergedResult ? `${entry.tool} (merged)` : entry.tool;
      title.textContent = `${titleToolLabel} (${entry.hostContextId})`;
      idLabel.textContent = "Tool State ID: ";
      idCode.textContent = entry.hostContextId;
      idCode.title = entry.hostContextId;
      idLine.append(idLabel, idCode);
      meta.textContent = entry.timestamp;
      reopenButton.type = "button";
      reopenButton.textContent = "Reopen";
      reopenButton.addEventListener("click", () => {
        this.reopenToolStateHistoryEntry(entry.hostContextId);
      });
      copyIdButton.type = "button";
      copyIdButton.textContent = "Copy ID";
      copyIdButton.addEventListener("click", () => {
        this.copyToolStateIdToClipboard(entry.hostContextId);
      });
      useInLibraryButton.type = "button";
      useInLibraryButton.textContent = "Use in Library";
      useInLibraryButton.addEventListener("click", () => {
        this.useToolStateIdInLibraryInput(entry.hostContextId);
      });
      deleteRecentButton.type = "button";
      deleteRecentButton.textContent = "Delete";
      deleteRecentButton.addEventListener("click", () => {
        this.deleteRecentToolStateEntry(entry.hostContextId);
      });
      item.append(title, idLine, meta, reopenButton, copyIdButton, useInLibraryButton, deleteRecentButton);
      this.toolStateHistoryListNode.appendChild(item);
    });
    this.renderToolStateDiffInputs();
    this.renderToolStateMergeInputs();
  }

  async copyToolStateIdToClipboard(hostContextId) {
    if (typeof hostContextId !== "string" || !hostContextId.trim()) {
      this.statusNode.textContent = "Copy ID failed: tool state ID is missing.";
      return;
    }
    try {
      if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
        this.statusNode.textContent = "Copy ID is unavailable in this browser context.";
        return;
      }
      await navigator.clipboard.writeText(hostContextId.trim());
      this.statusNode.textContent = `Tool State ID copied: ${hostContextId.trim()}`;
    } catch (error) {
      this.statusNode.textContent = `Copy ID failed: ${error instanceof Error ? error.message : "unknown error"}`;
    }
  }

  useToolStateIdInLibraryInput(hostContextId) {
    if (typeof hostContextId !== "string" || !hostContextId.trim()) {
      this.statusNode.textContent = "Use in Library failed: tool state ID is missing.";
      return;
    }
    this.toolStateNameNode.value = hostContextId.trim();
    this.updateToolStateLibraryActionState();
    this.statusNode.textContent = `Tool State ID ready for Library actions: ${hostContextId.trim()}`;
  }

  deleteRecentToolStateEntry(hostContextId) {
    if (typeof hostContextId !== "string" || !hostContextId.trim()) {
      this.statusNode.textContent = "Delete Recent failed: tool state ID is missing.";
      return;
    }
    const toolStateId = hostContextId.trim();
    const toolStateSelectionId = `history:${toolStateId}`;
    const history = this.readToolStateHistory();
    const deletedEntry = history.find((entry) => entry.hostContextId === toolStateId);
    const exists = history.some((entry) => entry.hostContextId === toolStateId);
    if (!exists) {
      this.statusNode.textContent = `Recent tool state '${toolStateId}' was not found.`;
      return;
    }
    const nextHistory = history.filter((entry) => entry.hostContextId !== toolStateId);
    this.writeToolStateHistory(nextHistory);
    sessionStorage.removeItem(toolStateId);
    if (
      this.diffLeftSelect.value === toolStateSelectionId ||
      this.diffRightSelect.value === toolStateSelectionId ||
      this.diffOutputToolStateKey.split("|").includes(toolStateSelectionId)
    ) {
      this.clearDiffOutputForStateChange("", "Selections changed. Compute Diff again.");
    }
    if (
      this.mergeLeftSelect.value === toolStateSelectionId ||
      this.mergeRightSelect.value === toolStateSelectionId ||
      this.mergeOutputToolStateKey.split("|").includes(toolStateSelectionId) ||
      Boolean(
        deletedEntry &&
        deletedEntry.payload &&
        typeof deletedEntry.payload === "object" &&
        !Array.isArray(deletedEntry.payload) &&
        deletedEntry.payload.mergeResultMeta &&
        typeof deletedEntry.payload.mergeResultMeta === "object" &&
        deletedEntry.payload.mergeResultMeta.isMergedResult === true
      )
    ) {
      this.clearMergePanelTransientState(
        "Selections changed. Run Preview Merge again.",
        "No merge preview available.",
        "Selections changed. Run Preview Merge again."
      );
    }
    if (this.currentHostContextId === toolStateId) {
      this.currentHostContextId = "";
      this.setCurrentToolStatePayload(null, "");
    }
    if (this.activePaletteHostContextId() === toolStateId) {
      this.workspaceActivePalette = null;
      this.refreshPaletteOwnershipUiState();
    }
    this.renderToolStateHistory();
    this.refreshWorkspaceToolStateUiStateModel("delete_tool_state");
    this.statusNode.textContent = `Recent tool state '${toolStateId}' deleted.`;
  }

  undoLastMerge() {
    if (!this.requestWorkspaceTransition("undo_merge", this.computeWorkspaceToolStateUiStateModel())) {
      this.updateUndoLastMergeState();
      this.clearMergePanelTransientState(
        "No recent merge to undo.",
        "No merge preview available.",
        "No recent merge to undo."
      );
      return;
    }
    const lastMergedId = this.resolveAuthoritativeLastMergedHostContextId();
    if (!lastMergedId) {
      this.updateUndoLastMergeState();
      this.clearMergePanelTransientState(
        "No recent merge to undo.",
        "No merge preview available.",
        "No recent merge to undo."
      );
      return;
    }
    const history = this.readToolStateHistory();
    const exists = history.some((entry) => entry.hostContextId === lastMergedId);
    if (!exists) {
      this.writeLastMergedHostContextId("");
      this.updateUndoLastMergeState();
      this.clearMergePanelTransientState(
        "No recent merge to undo.",
        "No merge preview available.",
        "No recent merge to undo."
      );
      return;
    }
    const nextHistory = history.filter((entry) => entry.hostContextId !== lastMergedId);
    this.writeToolStateHistory(nextHistory);
    sessionStorage.removeItem(lastMergedId);
    if (this.currentHostContextId === lastMergedId) {
      this.currentHostContextId = "";
      this.setCurrentToolStatePayload(null, "");
    }
    if (this.activePaletteHostContextId() === lastMergedId) {
      this.workspaceActivePalette = null;
      this.refreshPaletteOwnershipUiState();
    }
    if (this.diffLeftSelect.value === `history:${lastMergedId}`) {
      this.diffLeftSelect.value = "";
    }
    if (this.diffRightSelect.value === `history:${lastMergedId}`) {
      this.diffRightSelect.value = "";
    }
    if (this.mergeLeftSelect.value === `history:${lastMergedId}`) {
      this.mergeLeftSelect.value = "";
    }
    if (this.mergeRightSelect.value === `history:${lastMergedId}`) {
      this.mergeRightSelect.value = "";
    }
    this.updateDiffSelectionFeedbackAndState();
    this.updateMergeSelectionFeedbackAndState();
    this.writeLastMergedHostContextId("");
    this.renderToolStateHistory();
    this.refreshWorkspaceToolStateUiStateModel("refresh_load");
    this.clearMergePanelTransientState(
      `Last merged tool state removed.\nRemoved Tool State ID: ${lastMergedId}`,
      "No merge preview available.",
      "Last merged tool state removed."
    );
  }

  resolveToolStatePayloadFromContextId(contextId) {
    if (typeof contextId === "string" && contextId.trim()) {
      const raw = sessionStorage.getItem(contextId.trim());
      if (typeof raw === "string") {
        const parsed = this.safeParseJson(raw);
        if (parsed.ok && this.isValidToolStatePayload(parsed.value)) {
          const payloadValidation = this.validateWorkspaceToolStatePayload(parsed.value, `sessionStorage.${contextId.trim()}`);
          if (!payloadValidation.ok) {
            return null;
          }
          return parsed.value;
        }
      }
    }
    return null;
  }

  buildRecentToolStateInventory(history) {
    const inventory = [];
    if (!Array.isArray(history)) {
      return inventory;
    }
    history.forEach((entry) => {
      if (!this.isValidToolStateHistoryEntry(entry)) {
        return;
      }
      const resolvedPayload = this.resolveToolStatePayloadFromContextId(entry.hostContextId);
      if (!this.isValidToolStatePayload(resolvedPayload)) {
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

  resolveWorkspaceToolStateInventory() {
    const inventory = [];
    if (Array.isArray(this.recentToolStateInventory)) {
      this.recentToolStateInventory.forEach((entry) => {
        if (!entry || typeof entry !== "object") {
          return;
        }
        if (!this.isValidToolStatePayload(entry.payload)) {
          return;
        }
        inventory.push(entry);
      });
    }
    const library = this.readToolStateLibrary();
    if (library && typeof library === "object" && !Array.isArray(library)) {
      Object.keys(library)
        .sort((left, right) => left.localeCompare(right))
        .forEach((toolStateName) => {
          if (!this.isValidToolStatePayload(library[toolStateName])) {
            return;
          }
          inventory.push({
            id: `library:${toolStateName}`,
            label: `Library | ${toolStateName}`,
            payload: library[toolStateName],
            contextId: toolStateName,
            toolId: typeof library[toolStateName].toolId === "string" ? library[toolStateName].toolId : "",
            version: typeof library[toolStateName].version === "string" ? library[toolStateName].version : "",
            payloadSource: "library"
          });
        });
    }
    return inventory;
  }

  readPersistedToolStateSelection() {
    const raw = localStorage.getItem(this.toolStateSelectionStorageKey);
    if (!raw) {
      return { toolStateA: "", toolStateB: "" };
    }
    const parsed = this.safeParseJson(raw);
    if (!parsed.ok || !parsed.value || typeof parsed.value !== "object" || Array.isArray(parsed.value)) {
      return { toolStateA: "", toolStateB: "" };
    }
    const toolStateA = typeof parsed.value.toolStateA === "string" ? parsed.value.toolStateA.trim() : "";
    const toolStateB = typeof parsed.value.toolStateB === "string" ? parsed.value.toolStateB.trim() : "";
    return { toolStateA, toolStateB };
  }

  writePersistedToolStateSelection(leftEntry, rightEntry) {
    const toolStateA = leftEntry && typeof leftEntry.contextId === "string" ? leftEntry.contextId : "";
    const toolStateB = rightEntry && typeof rightEntry.contextId === "string" ? rightEntry.contextId : "";
    localStorage.setItem(this.toolStateSelectionStorageKey, JSON.stringify({ toolStateA, toolStateB }));
  }

  clearPersistedToolStateSelection() {
    localStorage.removeItem(this.toolStateSelectionStorageKey);
  }

  findToolStateEntryByContextId(entries, contextId) {
    if (!Array.isArray(entries) || typeof contextId !== "string" || !contextId.trim()) {
      return null;
    }
    return entries.find((entry) => entry.contextId === contextId.trim()) || null;
  }

  resolvePersistedSelectionIds(entries) {
    if (!Array.isArray(entries) || entries.length < 2) {
      return { leftId: "", rightId: "" };
    }
    const persisted = this.readPersistedToolStateSelection();
    if (!persisted.toolStateA || !persisted.toolStateB || persisted.toolStateA === persisted.toolStateB) {
      return { leftId: "", rightId: "" };
    }
    const leftEntry = this.findToolStateEntryByContextId(entries, persisted.toolStateA);
    const rightEntry = this.findToolStateEntryByContextId(entries, persisted.toolStateB);
    if (!leftEntry || !rightEntry || leftEntry.id === rightEntry.id) {
      return { leftId: "", rightId: "" };
    }
    return { leftId: leftEntry.id, rightId: rightEntry.id };
  }

  findToolStateEntryById(entries, selectedId) {
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
    const selectedEntry = this.findToolStateEntryByContextId(candidates, contextId.trim());
    if (!selectedEntry) {
      return false;
    }
    const leftEntry = this.findToolStateEntryById(candidates, leftSelectNode.value);
    const rightEntry = this.findToolStateEntryById(candidates, rightSelectNode.value);
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

  syncDiffAndMergeSelectionSlotsFromToolStateId(contextId) {
    this.syncSelectionSlotsFromContextId(this.diffLeftSelect, this.diffRightSelect, this.diffCandidates, contextId);
    this.syncSelectionSlotsFromContextId(this.mergeLeftSelect, this.mergeRightSelect, this.mergeCandidates, contextId);
    this.updateDiffSelectionFeedbackAndState();
    this.updateMergeSelectionFeedbackAndState();
  }

  formatSelectionLabel(entry) {
    if (!entry || typeof entry !== "object") {
      return "No tool state selected";
    }
    const toolId = typeof entry.toolId === "string" && entry.toolId.trim()
      ? entry.toolId.trim()
      : (entry.payload && typeof entry.payload.toolId === "string" ? entry.payload.toolId : "toolState");
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
    const source = this.findToolStateEntryById(this.mergeCandidates, preview.source && preview.source.id ? preview.source.id : "");
    const target = this.findToolStateEntryById(this.mergeCandidates, preview.target && preview.target.id ? preview.target.id : "");
    if (!source || !target) {
      return false;
    }
    return JSON.stringify(source.payload) === preview.source.hash && JSON.stringify(target.payload) === preview.target.hash;
  }

  updateDiffSelectionFeedbackAndState() {
    this.refreshWorkspaceToolStateUiStateModel("refresh_load");
  }

  updateMergeSelectionFeedbackAndState() {
    this.refreshWorkspaceToolStateUiStateModel("refresh_load");
  }

  conflictValuePreview(value) {
    if (value === undefined) {
      return "undefined";
    }
    const json = JSON.stringify(value);
    return this.truncatePreview(json === undefined ? String(value) : json, 140);
  }

  renderMergeConflictSummary() {
    if (!this.mergeConflictSummaryNode) {
      return;
    }
    if (!this.pendingMergePreview || !this.pendingMergePreview.conflicts || typeof this.pendingMergePreview.conflicts !== "object") {
      this.mergeConflictSummaryNode.hidden = true;
      this.mergeConflictSummaryNode.textContent = "";
      return;
    }
    const conflictEntries = Object.entries(this.pendingMergePreview.conflicts);
    if (conflictEntries.length === 0) {
      this.mergeConflictSummaryNode.hidden = true;
      this.mergeConflictSummaryNode.textContent = "";
      return;
    }
    const lines = [
      "Conflict preview only. Apply is blocked until conflicts are resolved.",
      `Total conflicts: ${conflictEntries.length}`
    ];
    conflictEntries
      .sort((left, right) => left[0].localeCompare(right[0]))
      .forEach(([path, values]) => {
        lines.push(`- ${path}`);
        lines.push(`  source: ${this.conflictValuePreview(values && Object.prototype.hasOwnProperty.call(values, "a") ? values.a : undefined)}`);
        lines.push(`  target: ${this.conflictValuePreview(values && Object.prototype.hasOwnProperty.call(values, "b") ? values.b : undefined)}`);
      });
    this.mergeConflictSummaryNode.textContent = lines.join("\n");
    this.mergeConflictSummaryNode.hidden = false;
  }

  renderToolStateDiffInputs() {
    this.diffCandidates = this.resolveWorkspaceToolStateInventory();
    const currentLeft = this.diffLeftSelect.value;
    const currentRight = this.diffRightSelect.value;
    const persistedSelections = this.resolvePersistedSelectionIds(this.diffCandidates);
    this.diffLeftSelect.replaceChildren();
    this.diffRightSelect.replaceChildren();

    const leftPlaceholder = document.createElement("option");
    leftPlaceholder.value = "";
    leftPlaceholder.textContent = "No tool state selected";
    leftPlaceholder.disabled = true;
    this.diffLeftSelect.appendChild(leftPlaceholder);
    const rightPlaceholder = document.createElement("option");
    rightPlaceholder.value = "";
    rightPlaceholder.textContent = "No tool state selected";
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
    this.diffEmptyState.textContent = "Create or reopen at least two Workspace V2 tool states before comparing.";
    if (this.diffCandidates.length < 2) {
      this.diffOutputToolStateKey = "";
      this.diffOutputNode.textContent = "Create or reopen at least two Workspace V2 tool states before comparing.";
    } else if (!this.diffOutputToolStateKey) {
      this.diffOutputNode.textContent = "No diff computed.";
    }
    this.updateDiffSelectionFeedbackAndState();
  }

  buildToolStateMergeCandidates() {
    return this.resolveWorkspaceToolStateInventory();
  }

  renderToolStateMergeInputs() {
    const previousPreview = this.pendingMergePreview;
    this.mergeCandidates = this.buildToolStateMergeCandidates();
    this.pendingMergePreview = null;
    const currentLeft = this.mergeLeftSelect.value;
    const currentRight = this.mergeRightSelect.value;
    const persistedSelections = this.resolvePersistedSelectionIds(this.mergeCandidates);
    this.mergeLeftSelect.replaceChildren();
    this.mergeRightSelect.replaceChildren();

    const leftPlaceholder = document.createElement("option");
    leftPlaceholder.value = "";
    leftPlaceholder.textContent = "No tool state selected";
    leftPlaceholder.disabled = true;
    this.mergeLeftSelect.appendChild(leftPlaceholder);
    const rightPlaceholder = document.createElement("option");
    rightPlaceholder.value = "";
    rightPlaceholder.textContent = "No tool state selected";
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
    this.mergeEmptyState.textContent = "Create or reopen at least two Workspace V2 tool states before previewing a merge.";
    if (previousPreview) {
      const refreshedSource = this.mergeCandidates.find((entry) => entry.id === previousPreview.source.id);
      const refreshedTarget = this.mergeCandidates.find((entry) => entry.id === previousPreview.target.id);
      if (refreshedSource && refreshedTarget) {
        const sourceMatches = JSON.stringify(refreshedSource.payload) === previousPreview.source.hash;
        const targetMatches = JSON.stringify(refreshedTarget.payload) === previousPreview.target.hash;
        if (sourceMatches && targetMatches) {
          this.pendingMergePreview = previousPreview;
          this.mergeOutputToolStateKey = this.buildMergeSelectionKey(previousPreview.source.id, previousPreview.target.id);
          this.mergeLeftSelect.value = previousPreview.source.id;
          this.mergeRightSelect.value = previousPreview.target.id;
          this.setMergePreviewSummary(previousPreview);
          this.updateMergeSelectionFeedbackAndState();
          return;
        }
      }
      this.statusNode.textContent = "Merge preview cleared because source or target tool state changed. Run Preview Merge (Dry Run) again.";
      this.clearMergePanelTransientState(
        "Preview summary is stale because Tool State A or Tool State B changed. Run Preview Merge again.",
        "No merge preview available.",
        "Merge preview cleared because source or target tool state changed. Run Preview Merge (Dry Run) again."
      );
      return;
    }
    if (this.mergeCandidates.length < 2) {
      this.clearMergePanelTransientState(
        "Create or reopen at least two Workspace V2 tool states before previewing a merge.",
        "Create or reopen at least two Workspace V2 tool states before previewing a merge.",
        ""
      );
    } else if (!this.mergeOutputToolStateKey) {
      this.clearMergePanelTransientState(
        "No merge summary yet.",
        "No merge preview available.",
        ""
      );
    }
    this.updateMergeSelectionFeedbackAndState();
  }

  cloneToolStateValue(value) {
    if (value === undefined) {
      return undefined;
    }
    return JSON.parse(JSON.stringify(value));
  }

  mergeToolStatePayloads(leftPayload, rightPayload) {
    const conflicts = {};
    const mergeValues = (leftValue, rightValue, path) => {
      if (leftValue === undefined && rightValue !== undefined) {
        return this.cloneToolStateValue(rightValue);
      }
      if (leftValue !== undefined && rightValue === undefined) {
        return this.cloneToolStateValue(leftValue);
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
          return this.cloneToolStateValue(leftValue);
        }
        conflicts[path || "$"] = { a: this.cloneToolStateValue(leftValue), b: this.cloneToolStateValue(rightValue) };
        return undefined;
      }
      if (JSON.stringify(leftValue) === JSON.stringify(rightValue)) {
        return this.cloneToolStateValue(leftValue);
      }
      conflicts[path || "$"] = { a: this.cloneToolStateValue(leftValue), b: this.cloneToolStateValue(rightValue) };
      return undefined;
    };

    const mergedPayload = mergeValues(leftPayload, rightPayload, "");
    return {
      mergedPayload: mergedPayload && typeof mergedPayload === "object" && !Array.isArray(mergedPayload) ? mergedPayload : {},
      conflicts
    };
  }

  computeSelectedToolStateMerge() {
    if (!Array.isArray(this.mergeCandidates) || this.mergeCandidates.length < 2) {
      this.clearMergePanelTransientState(
        "Create or reopen at least two Workspace V2 tool states before previewing a merge.",
        "Create or reopen at least two Workspace V2 tool states before previewing a merge.",
        "Create or reopen at least two Workspace V2 tool states before previewing a merge."
      );
      return;
    }
    if (!this.mergeLeftSelect.value && !this.mergeRightSelect.value) {
      this.clearMergePanelTransientState(
        "Merge preview blocked. Tool State A and Tool State B selections are missing.",
        "Merge preview blocked. Tool State A and Tool State B selections are missing.",
        "Merge preview blocked. Select Tool State A and Tool State B, then run Preview Merge (Dry Run)."
      );
      return;
    }
    if (!this.mergeLeftSelect.value) {
      this.clearMergePanelTransientState(
        "Merge preview blocked. Tool State A selection is missing.",
        "Merge preview blocked. Tool State A selection is missing.",
        "Merge preview blocked. Select Tool State A, then run Preview Merge (Dry Run)."
      );
      return;
    }
    if (!this.mergeRightSelect.value) {
      this.clearMergePanelTransientState(
        "Merge preview blocked. Tool State B selection is missing.",
        "Merge preview blocked. Tool State B selection is missing.",
        "Merge preview blocked. Select Tool State B, then run Preview Merge (Dry Run)."
      );
      return;
    }
    if (this.mergeLeftSelect.value === this.mergeRightSelect.value) {
      this.clearMergePanelTransientState(
        "Merge preview blocked. Tool State A and Tool State B must be different tool states.",
        "Merge preview blocked. Tool State A and Tool State B must be different tool states.",
        "Merge preview blocked. Choose two different tool states, then run Preview Merge (Dry Run)."
      );
      return;
    }
    const left = this.mergeCandidates.find((entry) => entry.id === this.mergeLeftSelect.value);
    const right = this.mergeCandidates.find((entry) => entry.id === this.mergeRightSelect.value);
    if (!left || !right) {
      this.clearMergePanelTransientState(
        !left
          ? "Merge preview blocked. Tool State A selection is no longer available."
          : "Merge preview blocked. Tool State B selection is no longer available.",
        !left
          ? "Merge preview blocked. Tool State A selection is no longer available."
          : "Merge preview blocked. Tool State B selection is no longer available.",
        "Merge preview blocked. Refresh or re-select tool states, then run Preview Merge (Dry Run)."
      );
      return;
    }
    if (!this.isValidToolStatePayload(left.payload) || !this.isValidToolStatePayload(right.payload)) {
      this.clearMergePanelTransientState(
        "Selected merge payload is invalid.",
        "Selected merge payload is invalid.",
        "Selected merge payload is invalid."
      );
      return;
    }
    const leftToolId = typeof left.payload.toolId === "string" ? left.payload.toolId.trim() : "";
    const rightToolId = typeof right.payload.toolId === "string" ? right.payload.toolId.trim() : "";
    if (leftToolId && rightToolId && leftToolId !== rightToolId) {
      this.clearMergePanelTransientState(
        [
          "Cross-tool merge is not supported. Select two tool states with the same toolId.",
          `Tool State A toolId: ${leftToolId}`,
          `Tool State B toolId: ${rightToolId}`
        ].join("\n"),
        [
          "Cross-tool merge is not supported. Select two tool states with the same toolId.",
          `Tool State A toolId: ${leftToolId}`,
          `Tool State B toolId: ${rightToolId}`
        ].join("\n"),
        "Cross-tool merge is not supported. Select two tool states with the same toolId."
      );
      this.updateMergeSelectionFeedbackAndState();
      return;
    }
    if (!this.requestWorkspaceTransition("preview_merge", this.computeWorkspaceToolStateUiStateModel())) {
      this.setMergeResultSummary("Merge preview blocked. Select two different tool states, then run Preview Merge (Dry Run).");
      this.statusNode.textContent = "Merge preview blocked. Select two different tool states, then run Preview Merge (Dry Run).";
      return;
    }

    const result = this.mergeToolStatePayloads(left.payload, right.payload);
    const selectedToolId = this.selectedToolId();
    if (!selectedToolId) {
      this.clearMergePanelTransientState(
        "Select a V2 tool before computing merge.",
        "Select a V2 tool before computing merge.",
        "Select a V2 tool before computing merge."
      );
      return;
    }
    const versionedPayload = this.withToolStateVersion(result.mergedPayload);
    const sizeValidation = this.validateToolStatePayloadSize(versionedPayload);
    if (!sizeValidation.ok) {
      this.clearMergePanelTransientState(sizeValidation.message, sizeValidation.message, sizeValidation.message);
      return;
    }

    const previewChanges = this.computeMergePreviewChanges(left.payload, right.payload, versionedPayload);
    this.pendingMergePreview = {
      source: {
        id: left.id,
        label: left.label,
        payload: this.cloneToolStateValue(left.payload),
        hash: JSON.stringify(left.payload)
      },
      target: {
        id: right.id,
        label: right.label,
        payload: this.cloneToolStateValue(right.payload),
        hash: JSON.stringify(right.payload)
      },
      selectedToolId,
      mergedPayload: versionedPayload,
      conflicts: result.conflicts,
      conflictCount: Object.keys(result.conflicts).length,
      previewFingerprint: `${left.id}|${right.id}|${JSON.stringify(left.payload)}|${JSON.stringify(right.payload)}`,
      changes: previewChanges,
      confirmed: false
    };
    this.mergeOutputToolStateKey = this.buildMergeSelectionKey(left.id, right.id);
    this.setMergePreviewSummary(this.pendingMergePreview);
    this.refreshWorkspaceToolStateUiStateModel("refresh_load");

    this.mergeOutputNode.textContent = JSON.stringify({
      source: this.pendingMergePreview.source,
      target: this.pendingMergePreview.target,
      changes: this.pendingMergePreview.changes,
      conflicts: this.pendingMergePreview.conflicts,
      conflictCount: this.pendingMergePreview.conflictCount,
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
        added[path || "$"] = this.cloneToolStateValue(mergedValue);
        return;
      }
      if (JSON.stringify(mergedValue) === JSON.stringify(targetValue)) {
        unchanged[path || "$"] = this.cloneToolStateValue(mergedValue);
        return;
      }
      updated[path || "$"] = {
        from: this.cloneToolStateValue(targetValue),
        to: this.cloneToolStateValue(mergedValue)
      };
    };
    walk(sourcePayload, targetPayload, mergedPayload, "");
    return { added, updated, unchanged };
  }

  defaultMergedToolStateId(toolId) {
    const safeToolId = typeof toolId === "string" && toolId.trim() ? toolId.trim() : this.selectedToolId();
    return `${safeToolId}-merged-${Date.now()}`;
  }

  setLastMergedToolStateResult(payload, toolId) {
    if (!this.isValidToolStatePayload(payload)) {
      this.lastMergedToolStateResult = null;
      this.mergedToolStateStatusNode.textContent = "No merged tool state result to save.";
      return;
    }
    this.lastMergedToolStateResult = {
      payload: this.cloneToolStateValue(payload),
      toolId: typeof toolId === "string" && toolId.trim() ? toolId.trim() : this.selectedToolId(),
      createdAt: new Date().toISOString()
    };
    this.mergedToolStateIdNode.value = this.defaultMergedToolStateId(this.lastMergedToolStateResult.toolId);
    this.mergedToolStateStatusNode.textContent = "Merged tool state is available for save.";
  }

  saveMergedToolStateResult() {
    if (!this.lastMergedToolStateResult || !this.isValidToolStatePayload(this.lastMergedToolStateResult.payload)) {
      this.setMergedToolStateStatus("No merged tool state result available to save.");
      return;
    }
    const mergedToolStateId = this.selectedMergedToolStateId();
    if (!mergedToolStateId) {
      this.setMergedToolStateStatus("Enter a merged tool state ID before saving.");
      return;
    }
    const library = this.readToolStateLibrary();
    if (library === null) {
      return;
    }
    if (Object.prototype.hasOwnProperty.call(library, mergedToolStateId)) {
      this.setMergedToolStateStatus("Tool State ID already exists. Choose a different ID.");
      return;
    }
    library[mergedToolStateId] = this.cloneToolStateValue(this.lastMergedToolStateResult.payload);
    this.writeToolStateLibrary(library);
    this.renderToolStateLibrary();
    this.setMergedToolStateStatus("Merged tool state saved.");
  }

  useMergedToolStateInDiffMerge() {
    if (!this.lastMergedToolStateResult || !this.isValidToolStatePayload(this.lastMergedToolStateResult.payload)) {
      this.setMergedToolStateStatus("No merged tool state result available to use.");
      return;
    }
    const mergedToolStateId = this.selectedMergedToolStateId();
    if (!mergedToolStateId) {
      this.setMergedToolStateStatus("Enter a merged tool state ID before using in Diff/Merge.");
      return;
    }
    const payloadValidation = this.validateWorkspaceToolStatePayload(this.lastMergedToolStateResult.payload, "mergedToolStateResult");
    if (!payloadValidation.ok) {
      this.setMergedToolStateStatus(payloadValidation.message);
      return;
    }
    const serialized = JSON.stringify(this.lastMergedToolStateResult.payload);
    sessionStorage.setItem(mergedToolStateId, serialized);
    this.addRecentToolStateEntry(mergedToolStateId, this.lastMergedToolStateResult.toolId, this.lastMergedToolStateResult.payload);
    this.syncDiffAndMergeSelectionSlotsFromToolStateId(mergedToolStateId);
    this.setMergedToolStateStatus("Merged tool state ready in Diff/Merge selections.");
  }

  confirmSelectedToolStateMergePreview() {
    if (!this.pendingMergePreview) {
      this.setMergeResultSummary("No merge preview available. Run Preview Merge (Dry Run) first.");
      this.statusNode.textContent = "No merge preview available. Run Preview Merge (Dry Run) first.";
      return;
    }
    const previewIsFresh = this.hasFreshMergePreviewContext(this.pendingMergePreview);
    if (!previewIsFresh) {
      this.updateMergeSelectionFeedbackAndState();
      this.setMergeResultSummary("Preview is stale. Run Preview Merge again.");
      this.statusNode.textContent = "Merge preview is stale. Run Preview Merge (Dry Run) again.";
      return;
    }
    const conflictCount = typeof this.pendingMergePreview.conflictCount === "number"
      ? this.pendingMergePreview.conflictCount
      : Object.keys(this.pendingMergePreview.conflicts || {}).length;
    if (conflictCount > 0) {
      this.updateMergeSelectionFeedbackAndState();
      this.setMergePreviewSummary(this.pendingMergePreview);
      this.statusNode.textContent = "Merge preview has conflicts. Resolve conflicts before confirming.";
      return;
    }
    if (!this.requestWorkspaceTransition("confirm_preview", this.computeWorkspaceToolStateUiStateModel())) {
      this.setMergeResultSummary("Merge preview confirmation blocked. Run Preview Merge (Dry Run) again.");
      this.statusNode.textContent = "Merge preview confirmation blocked. Run Preview Merge (Dry Run) again.";
      return;
    }
    this.pendingMergePreview.confirmed = true;
    this.refreshWorkspaceToolStateUiStateModel("refresh_load");
    this.setMergeResultSummary("Preview confirmed. Apply Merge is enabled.");
    this.mergeOutputNode.textContent = JSON.stringify({
      source: this.pendingMergePreview.source,
      target: this.pendingMergePreview.target,
      changes: this.pendingMergePreview.changes,
      conflicts: this.pendingMergePreview.conflicts,
      conflictCount: this.pendingMergePreview.conflictCount,
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
      sourceToolStateContextId: preview.source.id,
      targetToolStateContextId: preview.target.id,
      timestamp: new Date().toISOString(),
      addedCount: Object.keys(preview.changes.added).length,
      updatedCount: Object.keys(preview.changes.updated).length,
      unchangedCount: Object.keys(preview.changes.unchanged).length,
      conflictCount: Object.keys(preview.conflicts).length
    });
    localStorage.setItem(this.mergeAuditStorageKey, JSON.stringify(auditEntries));
  }

  applySelectedToolStateMerge() {
    if (!this.pendingMergePreview) {
      this.setMergeResultSummary("Merge apply blocked. Run Preview Merge (Dry Run), then Confirm Preview.");
      this.statusNode.textContent = "Merge apply blocked. Run Preview Merge (Dry Run), then Confirm Preview.";
      return;
    }
    if (!this.pendingMergePreview.confirmed) {
      this.setMergeResultSummary("Merge apply blocked. Confirm preview before apply.");
      this.statusNode.textContent = "Merge apply blocked. Confirm preview before apply.";
      return;
    }
    if (!this.requestWorkspaceTransition("apply_merge", this.computeWorkspaceToolStateUiStateModel())) {
      this.setMergeResultSummary("Merge apply blocked. Preview must be confirmed, fresh, and conflict-free.");
      this.statusNode.textContent = "Merge apply blocked. Preview must be confirmed, fresh, and conflict-free.";
      return;
    }
    const currentMergeCandidates = this.buildToolStateMergeCandidates();
    const liveSource = currentMergeCandidates.find((entry) => entry.id === this.pendingMergePreview.source.id);
    const liveTarget = currentMergeCandidates.find((entry) => entry.id === this.pendingMergePreview.target.id);
    if (!liveSource || !liveTarget) {
      this.setMergeResultSummary("Merge apply blocked. Preview is stale because source or target tool state is no longer available.");
      this.statusNode.textContent = "Merge apply blocked. Preview is stale because source or target tool state is no longer available.";
      return;
    }
    if (JSON.stringify(liveSource.payload) !== this.pendingMergePreview.source.hash || JSON.stringify(liveTarget.payload) !== this.pendingMergePreview.target.hash) {
      this.setMergeResultSummary("Merge apply blocked. Preview is stale because source or target tool state changed.");
      this.statusNode.textContent = "Merge apply blocked. Preview is stale because source or target tool state changed.";
      return;
    }
    const conflictKeys = Object.keys(this.pendingMergePreview.conflicts);
    if (conflictKeys.length > 0) {
      this.setMergePreviewSummary(this.pendingMergePreview);
      this.statusNode.textContent = `Merge apply blocked by ${conflictKeys.length} conflict${conflictKeys.length === 1 ? "" : "s"}.`;
      return;
    }
    const sizeValidation = this.validateToolStatePayloadSize(this.pendingMergePreview.mergedPayload);
    if (!sizeValidation.ok) {
      this.setMergeResultSummary(sizeValidation.message);
      this.statusNode.textContent = sizeValidation.message;
      return;
    }
    const hostContextId = this.createMergedHostContextId(this.pendingMergePreview.selectedToolId);
    const mergedResultPayload = {
      ...this.pendingMergePreview.mergedPayload,
      version: "v2",
      toolId: this.pendingMergePreview.selectedToolId,
      mergeResultMeta: {
        isMergedResult: true,
        sourceToolStateContextId: this.pendingMergePreview.source.id,
        targetToolStateContextId: this.pendingMergePreview.target.id,
        mergedAt: new Date().toISOString()
      }
    };
    const mergedResultSizeValidation = this.validateToolStatePayloadSize(mergedResultPayload);
    if (!mergedResultSizeValidation.ok) {
      this.setMergeResultSummary(mergedResultSizeValidation.message);
      this.statusNode.textContent = mergedResultSizeValidation.message;
      return;
    }
    const activation = this.activateWorkspaceToolState(hostContextId, mergedResultPayload, "merge-apply");
    if (!activation.ok) {
      this.setMergeResultSummary(activation.message);
      this.statusNode.textContent = activation.message;
      return;
    }
    let appliedPayload = null;
    try {
      appliedPayload = JSON.parse(sessionStorage.getItem(hostContextId));
    } catch {
      appliedPayload = null;
    }
    const appliedChanges = this.computeMergePreviewChanges(this.pendingMergePreview.source.payload, this.pendingMergePreview.target.payload, appliedPayload);
    if (
      !appliedPayload ||
      JSON.stringify(appliedPayload) !== JSON.stringify(mergedResultPayload) ||
      JSON.stringify(appliedChanges) !== JSON.stringify(this.computeMergePreviewChanges(this.pendingMergePreview.source.payload, this.pendingMergePreview.target.payload, mergedResultPayload))
    ) {
      sessionStorage.removeItem(hostContextId);
      this.setMergeResultSummary("Merge apply blocked. Applied result verification failed against preview.");
      this.statusNode.textContent = "Merge apply blocked. Applied result verification failed against preview.";
      return;
    }
    this.importJsonNode.value = JSON.stringify(appliedPayload, null, 2);
    this.setLastMergedToolStateResult(appliedPayload, this.pendingMergePreview.selectedToolId);
    this.writeLastMergedHostContextId(hostContextId);
    this.addRecentToolStateEntry(hostContextId, this.pendingMergePreview.selectedToolId, appliedPayload);
    const mergedRecentRegistered = this.readToolStateHistory().some((entry) => entry.hostContextId === hostContextId);
    if (!mergedRecentRegistered) {
      this.writeLastMergedHostContextId("");
      this.updateUndoLastMergeState();
      this.mergeOutputToolStateKey = "";
      this.setMergeResultSummary("Merge apply failed to register merged tool state in Recent Tool States. Undo remains disabled.");
      this.statusNode.textContent = "Merge apply failed to register merged tool state in Recent Tool States. Undo remains disabled.";
      return;
    }
    this.setMergeApplySummary(
      hostContextId,
      this.pendingMergePreview.selectedToolId,
      mergedResultPayload.mergeResultMeta.mergedAt,
      appliedChanges
    );
    this.mergeOutputToolStateKey = this.buildMergeSelectionKey(this.pendingMergePreview.source.id, this.pendingMergePreview.target.id);
    this.renderToolStateHistory();
    this.renderToolStateDiffInputs();
    this.renderToolStateMergeInputs();
    this.refreshWorkspaceToolStateUiStateModel("refresh_load");
    this.recordMergeAuditEntry(this.pendingMergePreview);
    this.pendingMergePreview = null;
    this.refreshWorkspaceToolStateUiStateModel("refresh_load");
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
    this.statusNode.textContent = `Tool state merge applied with no conflicts. New hostContextId: ${hostContextId}`;
  }

  isComparableObject(value) {
    return Boolean(value && typeof value === "object");
  }

  computeToolStateDiff(leftPayload, rightPayload) {
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

  setDiffSummaryFromCounts(addedCount, removedCount, changedCount) {
    if (addedCount === 0 && removedCount === 0 && changedCount === 0) {
      this.diffSummaryNode.textContent = "No differences (added: 0, removed: 0, changed: 0)";
      return;
    }
    this.diffSummaryNode.textContent = `Differences detected (added: ${addedCount}, removed: ${removedCount}, changed: ${changedCount})`;
  }

  computeSelectedToolStateDiff() {
    this.diffSummaryNode.textContent = "";
    if (!Array.isArray(this.diffCandidates) || this.diffCandidates.length < 2) {
      this.diffOutputToolStateKey = "";
      this.diffOutputNode.textContent = "Create or reopen at least two Workspace V2 tool states before comparing.";
      this.statusNode.textContent = "Create or reopen at least two Workspace V2 tool states before comparing.";
      return;
    }
    if (!this.diffLeftSelect.value && !this.diffRightSelect.value) {
      this.diffOutputToolStateKey = "";
      this.diffOutputNode.textContent = "Diff blocked. Tool State A and Tool State B selections are missing.";
      this.statusNode.textContent = "Diff blocked. Select Tool State A and Tool State B, then compute diff.";
      return;
    }
    if (!this.diffLeftSelect.value) {
      this.diffOutputToolStateKey = "";
      this.diffOutputNode.textContent = "Diff blocked. Tool State A selection is missing.";
      this.statusNode.textContent = "Diff blocked. Select Tool State A, then compute diff.";
      return;
    }
    if (!this.diffRightSelect.value) {
      this.diffOutputToolStateKey = "";
      this.diffOutputNode.textContent = "Diff blocked. Tool State B selection is missing.";
      this.statusNode.textContent = "Diff blocked. Select Tool State B, then compute diff.";
      return;
    }
    if (this.diffLeftSelect.value === this.diffRightSelect.value) {
      this.diffOutputToolStateKey = "";
      this.diffOutputNode.textContent = "Diff blocked. Tool State A and Tool State B must be different tool states.";
      this.statusNode.textContent = "Diff blocked. Choose two different tool states, then compute diff.";
      return;
    }
    const left = this.diffCandidates.find((entry) => entry.id === this.diffLeftSelect.value);
    const right = this.diffCandidates.find((entry) => entry.id === this.diffRightSelect.value);
    if (!left || !right) {
      this.diffOutputToolStateKey = "";
      this.diffOutputNode.textContent = !left
        ? "Diff blocked. Tool State A selection is no longer available."
        : "Diff blocked. Tool State B selection is no longer available.";
      this.statusNode.textContent = "Diff blocked. Refresh or re-select tool states, then compute diff.";
      return;
    }
    if (!this.isValidToolStatePayload(left.payload) || !this.isValidToolStatePayload(right.payload)) {
      this.diffOutputToolStateKey = "";
      this.diffOutputNode.textContent = "Selected diff payload is invalid.";
      this.statusNode.textContent = "Selected diff payload is invalid.";
      return;
    }
    if (left.toolId !== right.toolId) {
      this.diffOutputToolStateKey = "";
      this.diffOutputNode.textContent = "Diff requires tool states from the same tool.";
      this.statusNode.textContent = "Diff requires tool states from the same tool.";
      return;
    }
    const diff = this.computeToolStateDiff(left.payload, right.payload);
    const addedCount = Object.keys(diff.added).length;
    const removedCount = Object.keys(diff.removed).length;
    const changedCount = Object.keys(diff.changed).length;
    this.diffOutputToolStateKey = this.buildMergeSelectionKey(left.id, right.id);
    this.setDiffSummaryFromCounts(addedCount, removedCount, changedCount);
    this.diffOutputNode.textContent = JSON.stringify(diff, null, 2);
    if (addedCount === 0 && removedCount === 0 && changedCount === 0) {
      this.statusNode.textContent = "No differences. The selected tool states are identical.";
      return;
    }
    this.statusNode.textContent = "Differences detected between selected tool states.";
  }

  reopenToolStateHistoryEntry(hostContextId) {
    const history = this.readToolStateHistory();
    const entry = history.find((row) => row.hostContextId === hostContextId);
    if (!entry) {
      this.statusNode.textContent = "Selected history entry was not found.";
      return;
    }
    if (!this.isValidToolStateHistoryEntry(entry)) {
      this.statusNode.textContent = "Selected history entry is invalid.";
      return;
    }
    if (this.isBlockedAlternatePaletteToolState(entry.hostContextId, entry.payload)) {
      this.statusNode.textContent = this.singleActivePaletteBlockedMessage();
      return;
    }
    const activation = this.activateWorkspaceToolState(entry.hostContextId, entry.payload, `history:${entry.hostContextId}`);
    if (!activation.ok) {
      this.statusNode.textContent = activation.message;
      return;
    }
    this.importJsonNode.value = JSON.stringify(entry.payload, null, 2);
    const launchUrl = this.buildToolLaunchUrl(entry.tool, entry.hostContextId);
    this.statusNode.textContent = `Reopening tool state.\nTool: ${entry.tool}\nHostContextId: ${entry.hostContextId}`;
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

  clearToolStateStorage(emitStatus = true) {
    sessionStorage.clear();
    this.workspaceActivePalette = null;
    this.clearPersistedToolStateSelection();
    this.toolStateNameNode.value = "";
    this.updateToolStateLibraryActionState();
    this.diffLeftSelect.value = "";
    this.diffRightSelect.value = "";
    this.mergeLeftSelect.value = "";
    this.mergeRightSelect.value = "";
    this.updateDiffSelectionFeedbackAndState();
    this.updateMergeSelectionFeedbackAndState();
    this.clearDiffOutputForStateChange("", "No diff computed.");
    this.currentHostContextId = "";
    this.updateUndoLastMergeState();
    this.refreshPaletteOwnershipUiState();
    if (emitStatus) {
      this.statusNode.textContent = "Session storage cleared and tool state selections reset.";
    }
  }

  clearSavedToolStates(emitStatus = true) {
    localStorage.removeItem(this.libraryStorageKey);
    this.renderToolStateLibrary();
    if (emitStatus) {
      this.statusNode.textContent = "Saved tool states cleared from localStorage key v2-tool-state-library.";
    }
  }

  clearErrorLogs(emitStatus = true) {
    localStorage.removeItem(this.errorLogsStorageKey);
    this.renderErrorLogsViewer();
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
    if (emitStatus) {
      this.statusNode.textContent = "URL state reset to baseline path.";
    }
  }

  fullReset() {
    this.clearToolStateStorage(false);
    this.clearSavedToolStates(false);
    this.clearErrorLogs(false);
    this.resetUrlState(false);
    this.currentHostContextId = "";
    this.workspaceActivePalette = null;
    this.ensureWorkspaceActivePaletteBaseline();
    this.workspaceImportedToolEntries = {};
    this.workspaceManifestGame = null;
    this.setCurrentToolStatePayload(null, "");
    this.initializeWorkspaceProducerToolState();
    this.refreshPaletteOwnershipStateAndUi();
    this.syncWorkspaceManifestTextarea();
    this.shareUrlNode.value = "";
    this.toolStateNameNode.value = "";
    this.updateToolStateLibraryActionState();
    this.lastMergedToolStateResult = null;
    this.mergeOutputToolStateKey = "";
    this.diffOutputToolStateKey = "";
    this.mergedToolStateIdNode.value = "";
    this.mergedToolStateStatusNode.textContent = "No merged tool state result to save.";
    this.setMergeResultSummary("No merge summary yet.");
    this.diffOutputNode.textContent = "No diff computed.";
    this.updateUndoLastMergeState();
    this.renderToolStateLibrary();
    this.renderErrorLogsViewer();
    this.renderWorkspaceToolsSummary();
    this.statusNode.textContent = "Workspace V2 full reset complete. Workspace manifest baseline restored.";
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

  normalizePaletteFixtureSwatches(paletteDocument) {
    if (!paletteDocument || typeof paletteDocument !== "object" || Array.isArray(paletteDocument)) {
      return { ok: false, message: "Fixture is invalid. payloadJson.paletteDocument must be an object for palette-manager-v2.", value: null };
    }
    if (Object.prototype.hasOwnProperty.call(paletteDocument, "colors")) {
      return { ok: false, message: "Fixture is invalid. payloadJson.paletteDocument.colors is not supported; use payloadJson.paletteDocument.swatches.", value: null };
    }
    if (typeof paletteDocument.name !== "string" || !paletteDocument.name.trim()) {
      return { ok: false, message: "Fixture is invalid. payloadJson.paletteDocument.name is required for palette-manager-v2.", value: null };
    }
    if (!Array.isArray(paletteDocument.swatches)) {
      return { ok: false, message: "Fixture is invalid. payloadJson.paletteDocument.swatches must be an array for palette-manager-v2.", value: null };
    }
    const swatchValidation = this.validatePaletteSwatchesForWorkspaceExport(paletteDocument.swatches, "fixture.toolStateContext.payloadJson.paletteDocument.swatches");
    if (!swatchValidation.ok) {
      return { ok: false, message: swatchValidation.message, value: null };
    }
    return { ok: true, message: "", value: paletteDocument };
  }

  normalizeFixtureToolStateContext(toolId, toolStateContext) {
    if (!this.isValidToolStatePayload(toolStateContext)) {
      return { ok: false, message: "Fixture is invalid. Missing toolStateContext object.", value: null };
    }
    const normalizedToolState = this.cloneToolStateValue(toolStateContext);
    const payloadValidation = this.validateWorkspaceToolStatePayload(normalizedToolState, "fixture.toolStateContext");
    if (!payloadValidation.ok) {
      return { ok: false, message: payloadValidation.message, value: null };
    }
    if (typeof normalizedToolState.toolId !== "string" || normalizedToolState.toolId.trim() !== toolId) {
      return { ok: false, message: `Fixture is invalid. toolStateContext.toolId must be '${toolId}'.`, value: null };
    }
    if (toolId === "palette-manager-v2") {
      if (Object.prototype.hasOwnProperty.call(normalizedToolState, "paletteJson")) {
        return { ok: false, message: "Fixture is invalid. paletteJson is not supported for palette-manager-v2.", value: null };
      }
      if (!Object.prototype.hasOwnProperty.call(normalizedToolState, "payloadJson")) {
        return { ok: false, message: "Fixture is invalid. payloadJson is required for palette-manager-v2.", value: null };
      }
      if (!normalizedToolState.payloadJson || typeof normalizedToolState.payloadJson !== "object" || Array.isArray(normalizedToolState.payloadJson)) {
        return { ok: false, message: "Fixture is invalid. payloadJson must be an object for palette-manager-v2.", value: null };
      }
      if (!Object.prototype.hasOwnProperty.call(normalizedToolState.payloadJson, "paletteDocument")) {
        return { ok: false, message: "Fixture is invalid. payloadJson.paletteDocument is required for palette-manager-v2.", value: null };
      }
      const normalizedPalette = this.normalizePaletteFixtureSwatches(normalizedToolState.payloadJson.paletteDocument);
      if (!normalizedPalette.ok) {
        return { ok: false, message: normalizedPalette.message, value: null };
      }
      normalizedToolState.payloadJson.paletteDocument = normalizedPalette.value;
    }
    return { ok: true, message: "", value: normalizedToolState };
  }

  async loadSelectedToolState() {
    const toolId = this.selectedToolId();
    if (!toolId) {
      this.statusNode.textContent = "Select a toolState-capable V2 tool before loading tool state.";
      return;
    }
    try {
      const response = await fetch(this.fixturePathForTool(toolId), { cache: "no-store" });
      if (!response.ok) {
        this.statusNode.textContent = `Fixture read failed (${response.status}). Expected ${this.fixturePathForTool(toolId)}.`;
        this.setCurrentToolStatePayload(null, "");
        return;
      }
      const fixture = await response.json();
      if (!fixture || typeof fixture !== "object" || Array.isArray(fixture)) {
        this.statusNode.textContent = "Fixture is invalid. Expected a JSON object with hostContextId and toolStateContext.";
        this.setCurrentToolStatePayload(null, "");
        return;
      }
      const normalizedFixtureToolState = this.normalizeFixtureToolStateContext(toolId, fixture.toolStateContext);
      if (!normalizedFixtureToolState.ok) {
        this.statusNode.textContent = normalizedFixtureToolState.message;
        this.setCurrentToolStatePayload(null, "");
        return;
      }
      const fixtureHostContextId = typeof fixture.hostContextId === "string" && fixture.hostContextId.trim()
        ? fixture.hostContextId.trim()
        : this.createHostContextToolStateId(toolId);
      const sizeValidation = this.validateToolStatePayloadSize(normalizedFixtureToolState.value);
      if (!sizeValidation.ok) {
        this.statusNode.textContent = sizeValidation.message;
        this.setCurrentToolStatePayload(null, "");
        return;
      }
      const activation = this.activateWorkspaceToolState(fixtureHostContextId, normalizedFixtureToolState.value, `fixture:${toolId}`);
      if (!activation.ok) {
        this.statusNode.textContent = activation.message;
        return;
      }
      if (!this.syncWorkspaceManifestTextarea()) {
        this.statusNode.textContent = "Fixture loaded but workspace manifest sync failed.";
        return;
      }
      this.statusNode.textContent = `Fixture loaded for ${toolId}.\nTool state payload is ready for launch, export, share, or library save.`;
    } catch (error) {
      this.setCurrentToolStatePayload(null, "");
      this.currentHostContextId = "";
      this.statusNode.textContent = `Fixture read failed: ${error instanceof Error ? error.message : "unknown error"}`;
    }
  }

  readImportFile() {
    if (!this.importFileNode.files || this.importFileNode.files.length === 0) {
      if (this.importFileDialogPending) {
        this.importFileDialogPending = false;
        this.setImportExportStatus("Import cancelled.");
      }
      return;
    }
    this.importFileDialogPending = false;
    const file = this.importFileNode.files[0];
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      this.importJsonNode.value = typeof reader.result === "string" ? reader.result : "";
      this.importWorkspaceToolStateJson();
    });
    reader.addEventListener("error", () => {
      this.importFileDialogPending = false;
      this.setImportExportStatus(`Import error: ${file.name} could not be read.`);
    });
    reader.readAsText(file);
  }

  createHostContextToolStateId(toolId) {
    const randomPart = Math.random().toString(36).slice(2, 10);
    return `${toolId}-${Date.now()}-${randomPart}`;
  }

  createMergedHostContextId(toolId) {
    const shortId = Math.random().toString(36).slice(2, 10);
    return `${toolId}-merged-${Date.now()}-${shortId}`;
  }

  buildToolLaunchUrl(toolId, hostContextId) {
    const toolUrl = new URL(`../${toolId}/index.html`, window.location.href);
    toolUrl.searchParams.set("hostContextId", hostContextId);
    toolUrl.searchParams.set("fromTool", "workspace-v2");
    return toolUrl.toString();
  }

  syncWorkspaceManifestTextarea() {
    const workspaceSchemaDocument = this.buildWorkspaceSchemaDocument();
    if (!workspaceSchemaDocument) {
      return false;
    }
    const validation = this.validateWorkspaceSchemaDocument(workspaceSchemaDocument);
    if (!validation.ok) {
      return false;
    }
    this.workspaceJsonNode.value = JSON.stringify(workspaceSchemaDocument, null, 2);
    this.renderWorkspaceToolsSummary();
    return true;
  }

  buildWorkspaceSchemaDocument() {
    this.lastWorkspaceExportBuildErrorMessage = "";
    const activePayload = this.resolveActiveToolStatePayloadForWorkspaceManifest();
    if (!this.isValidToolStatePayload(activePayload)) {
      this.lastWorkspaceExportBuildErrorMessage = "Export error: No active Workspace V2 tool state is available to export.";
      return null;
    }
    const library = this.readToolStateLibrary();
    if (library === null) {
      this.lastWorkspaceExportBuildErrorMessage = "Export error: Tool state library could not be read.";
      return null;
    }
    const activePaletteResolution = this.resolveActivePaletteForWorkspaceExport(activePayload, library);
    if (!activePaletteResolution.ok) {
      this.lastWorkspaceExportBuildErrorMessage = `Export error: ${activePaletteResolution.message}`;
      return null;
    }
    const activeToolId = typeof activePayload.toolId === "string" && activePayload.toolId.trim() ? activePayload.toolId.trim() : "";
    if (!activeToolId) {
      this.lastWorkspaceExportBuildErrorMessage = "Export error: Active tool state toolId is missing.";
      return null;
    }
    let activeHostContextId = typeof this.currentHostContextId === "string" ? this.currentHostContextId.trim() : "";
    if (!activeHostContextId) {
      activeHostContextId = this.createHostContextToolStateId(activeToolId);
      const activation = this.activateWorkspaceToolState(activeHostContextId, activePayload, this.currentToolStateSource || "workspace-export");
      if (!activation.ok) {
        this.lastWorkspaceExportBuildErrorMessage = `Export error: ${activation.message}`;
        return null;
      }
    }
    let workspaceGame = null;
    if (this.workspaceManifestGame && typeof this.workspaceManifestGame === "object" && !Array.isArray(this.workspaceManifestGame)) {
      workspaceGame = this.cloneToolStateValue(this.workspaceManifestGame);
    }
    if (!workspaceGame) {
      workspaceGame = {
        id: `workspace-${activeHostContextId}`,
        name: "Workspace V2 Tool State"
      };
    }
    const manifestTools = {};
    const importedToolIds = Object.keys(this.workspaceImportedToolEntries || {}).sort((left, right) => left.localeCompare(right));
    importedToolIds.forEach((toolId) => {
      manifestTools[toolId] = this.cloneToolStateValue(this.workspaceImportedToolEntries[toolId]);
    });
    manifestTools["palette-browser"] = this.cloneToolStateValue(activePaletteResolution.paletteBrowserPayload);
    const exportDefaultToolId = this.firstToolStateProducerToolId() || activeToolId;
    manifestTools["workspace-v2"] = {
      schema: "html-js-gaming.workspace-v2-tool-state/1",
      game: workspaceGame,
      defaultToolId: exportDefaultToolId,
      activeToolId,
      activeHostContextId,
      activeToolState: this.cloneToolStateValue(activePayload),
      savedToolStates: this.cloneToolStateValue(library)
    };
    const workspaceDocument = {
      documentKind: "workspace-manifest",
      schema: "html-js-gaming.project",
      version: 1,
      id: `workspace-v2-${activeHostContextId}`,
      name: `Workspace V2 Tool State ${activeToolId}`,
      tools: manifestTools
    };
    return workspaceDocument;
  }

  exportWorkspaceToolStateJson() {
    this.setImportExportStatus("Export clicked");
    const workspaceSchemaDocument = this.buildWorkspaceSchemaDocument();
    if (!workspaceSchemaDocument) {
      this.setImportExportStatus(this.lastWorkspaceExportBuildErrorMessage || "Export error: No active Workspace V2 tool state is available to export.");
      return;
    }
    const invalidSavedToolStateId = this.readInvalidPaletteSavedToolStateId(workspaceSchemaDocument.tools["workspace-v2"].savedToolStates);
    if (invalidSavedToolStateId) {
      this.setImportExportStatus(`Export error: Saved tool state '${invalidSavedToolStateId}' is invalid for palette-manager-v2. Load a valid tool state and overwrite it, or delete it.`);
      return;
    }
    try {
      const validation = this.validateWorkspaceSchemaDocument(workspaceSchemaDocument);
      if (!validation.ok) {
        this.setImportExportStatus(`Export error: ${validation.message}`);
        return;
      }
      const serialized = JSON.stringify(workspaceSchemaDocument, null, 2);
      const activeToolId = workspaceSchemaDocument.tools["workspace-v2"].activeToolId || "workspace-v2";
      const activeHostContextId = workspaceSchemaDocument.tools["workspace-v2"].activeHostContextId || "toolState";
      const downloadFileName = `workspace-v2-${activeToolId}-${activeHostContextId}.json`;
      const fileBlob = new Blob([serialized], { type: "application/json" });
      const fileUrl = URL.createObjectURL(fileBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = fileUrl;
      downloadLink.download = downloadFileName;
      downloadLink.style.display = "none";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      URL.revokeObjectURL(fileUrl);
      this.workspaceJsonNode.value = serialized;
      this.setImportExportStatus("Export success");
    } catch (error) {
      this.setImportExportStatus(`Export error: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  }

  validateWorkspaceToolStatePayload(toolStatePayload, toolStatePath) {
    if (!toolStatePayload || typeof toolStatePayload !== "object" || Array.isArray(toolStatePayload)) {
      return { ok: false, message: `${toolStatePath} must be an object.` };
    }
    if (toolStatePayload.version !== "v2") {
      return { ok: false, message: `${toolStatePath}.version must be 'v2'.` };
    }
    if (typeof toolStatePayload.toolId !== "string" || !toolStatePayload.toolId.trim()) {
      return { ok: false, message: `${toolStatePath}.toolId is required.` };
    }
    const toolId = toolStatePayload.toolId.trim();
    const allowedToolIds = new Set([
      "asset-manager-v2",
      "palette-manager-v2",
      "svg-asset-studio-v2",
      "tilemap-studio-v2",
      "vector-map-editor-v2"
    ]);
    if (!allowedToolIds.has(toolId)) {
      return { ok: false, message: `${toolStatePath}.toolId '${toolId}' is not supported.` };
    }
    if (toolId === "palette-manager-v2") {
      if (Object.prototype.hasOwnProperty.call(toolStatePayload, "paletteJson")) {
        return { ok: false, message: `${toolStatePath}.paletteJson is not supported for palette-manager-v2. Use payloadJson.paletteDocument.` };
      }
      if (!toolStatePayload.payloadJson || typeof toolStatePayload.payloadJson !== "object" || Array.isArray(toolStatePayload.payloadJson)) {
        return { ok: false, message: `${toolStatePath}.payloadJson is required for palette-manager-v2.` };
      }
      if (!toolStatePayload.payloadJson.paletteDocument || typeof toolStatePayload.payloadJson.paletteDocument !== "object" || Array.isArray(toolStatePayload.payloadJson.paletteDocument)) {
        return { ok: false, message: `${toolStatePath}.payloadJson.paletteDocument is required for palette-manager-v2.` };
      }
      if (typeof toolStatePayload.payloadJson.paletteDocument.name !== "string" || !toolStatePayload.payloadJson.paletteDocument.name.trim()) {
        return { ok: false, message: `${toolStatePath}.payloadJson.paletteDocument.name is required.` };
      }
      if (!Array.isArray(toolStatePayload.payloadJson.paletteDocument.swatches)) {
        return { ok: false, message: `${toolStatePath}.payloadJson.paletteDocument.swatches must be an array.` };
      }
      const swatchValidation = this.validatePaletteSwatchesForWorkspaceExport(
        toolStatePayload.payloadJson.paletteDocument.swatches,
        `${toolStatePath}.payloadJson.paletteDocument.swatches`
      );
      if (!swatchValidation.ok) {
        return swatchValidation;
      }
      if (Object.prototype.hasOwnProperty.call(toolStatePayload.payloadJson.paletteDocument, "colors")) {
        return { ok: false, message: `${toolStatePath}.payloadJson.paletteDocument.colors is not supported. Use payloadJson.paletteDocument.swatches.` };
      }
      return { ok: true, message: "" };
    }
    if (!Object.prototype.hasOwnProperty.call(toolStatePayload, "payloadJson")) {
      return { ok: false, message: `${toolStatePath}.payloadJson is required for ${toolId}.` };
    }
    if (!toolStatePayload.payloadJson || typeof toolStatePayload.payloadJson !== "object" || Array.isArray(toolStatePayload.payloadJson)) {
      return { ok: false, message: `${toolStatePath}.payloadJson must be an object for ${toolId}.` };
    }
    if (Object.prototype.hasOwnProperty.call(toolStatePayload, "paletteJson")) {
      return { ok: false, message: `${toolStatePath}.paletteJson is not supported for ${toolId}.` };
    }
    return { ok: true, message: "" };
  }

  validateWorkspaceSchemaDocument(workspaceDocument) {
    if (!workspaceDocument || typeof workspaceDocument !== "object" || Array.isArray(workspaceDocument)) {
      return { ok: false, message: "expected a JSON object." };
    }
    const topLevelKeys = Object.keys(workspaceDocument);
    const allowedTopLevelKeys = new Set(["$schema", "documentKind", "schema", "version", "id", "name", "tools"]);
    for (const key of topLevelKeys) {
      if (!allowedTopLevelKeys.has(key)) {
        return { ok: false, message: `root.${key} is not allowed.` };
      }
    }
    if (workspaceDocument.documentKind !== "workspace-manifest") {
      return { ok: false, message: "documentKind must be workspace-manifest." };
    }
    if (typeof workspaceDocument.schema !== "string" || !workspaceDocument.schema.trim()) {
      return { ok: false, message: "schema is required." };
    }
    if (!Number.isInteger(workspaceDocument.version) || workspaceDocument.version < 1) {
      return { ok: false, message: "version must be a positive integer." };
    }
    if (typeof workspaceDocument.id !== "string" || !workspaceDocument.id.trim()) {
      return { ok: false, message: "id is required." };
    }
    if (typeof workspaceDocument.name !== "string" || !workspaceDocument.name.trim()) {
      return { ok: false, message: "name is required." };
    }
    if (!workspaceDocument.tools || typeof workspaceDocument.tools !== "object" || Array.isArray(workspaceDocument.tools)) {
      return { ok: false, message: "tools must be an object." };
    }
    if (Object.prototype.hasOwnProperty.call(workspaceDocument.tools, "palettes")) {
      return { ok: false, message: "Use tools.palette-browser. Workspace supports one active palette tool entry." };
    }
    if (Object.prototype.hasOwnProperty.call(workspaceDocument.tools, "palette")) {
      return { ok: false, message: "Use tools.palette-browser. Workspace supports one active palette tool entry." };
    }
    if (!Object.prototype.hasOwnProperty.call(workspaceDocument.tools, "palette-browser")) {
      return { ok: false, message: "tools.palette-browser is required." };
    }
    const paletteBrowserTool = workspaceDocument.tools["palette-browser"];
    if (!paletteBrowserTool || typeof paletteBrowserTool !== "object" || Array.isArray(paletteBrowserTool)) {
      return { ok: false, message: "tools.palette-browser must be an object." };
    }
    const paletteBrowserToolKeys = Object.keys(paletteBrowserTool);
    const allowedPaletteBrowserToolKeys = new Set(["$schema", "schema", "version", "id", "name", "source", "sourceId", "locked", "swatches"]);
    for (const key of paletteBrowserToolKeys) {
      if (!allowedPaletteBrowserToolKeys.has(key)) {
        return { ok: false, message: `tools.palette-browser.${key} is not allowed.` };
      }
    }
    if (paletteBrowserTool.schema !== "html-js-gaming.palette") {
      return { ok: false, message: "tools.palette-browser.schema is unsupported." };
    }
    if (!Number.isInteger(paletteBrowserTool.version) || paletteBrowserTool.version < 1) {
      return { ok: false, message: "tools.palette-browser.version must be a positive integer." };
    }
    if (typeof paletteBrowserTool.name !== "string" || !paletteBrowserTool.name.trim()) {
      return { ok: false, message: "tools.palette-browser.name is required." };
    }
    const activePaletteSwatchValidation = this.validatePaletteSwatchesForWorkspaceExport(
      paletteBrowserTool.swatches,
      "tools.palette-browser.swatches"
    );
    if (!activePaletteSwatchValidation.ok) {
      return activePaletteSwatchValidation;
    }
    if (!Object.prototype.hasOwnProperty.call(workspaceDocument.tools, "workspace-v2")) {
      return { ok: false, message: "tools.workspace-v2 is required." };
    }
    const workspaceV2Tool = workspaceDocument.tools["workspace-v2"];
    if (!workspaceV2Tool || typeof workspaceV2Tool !== "object" || Array.isArray(workspaceV2Tool)) {
      return { ok: false, message: "tools.workspace-v2 must be an object." };
    }
    const workspaceV2Keys = Object.keys(workspaceV2Tool);
    const allowedWorkspaceV2Keys = new Set(["schema", "game", "defaultToolId", "activeToolId", "activeHostContextId", "activeToolState", "savedToolStates"]);
    for (const key of workspaceV2Keys) {
      if (!allowedWorkspaceV2Keys.has(key)) {
        return { ok: false, message: `tools.workspace-v2.${key} is not allowed.` };
      }
    }
    const requiredWorkspaceV2Keys = ["schema", "game", "defaultToolId", "activeToolId", "activeHostContextId", "activeToolState", "savedToolStates"];
    for (const key of requiredWorkspaceV2Keys) {
      if (!Object.prototype.hasOwnProperty.call(workspaceV2Tool, key)) {
        return { ok: false, message: `tools.workspace-v2.${key} is required.` };
      }
    }
    if (workspaceV2Tool.schema !== "html-js-gaming.workspace-v2-tool-state/1") {
      return { ok: false, message: "tools.workspace-v2.schema is unsupported." };
    }
    if (typeof workspaceV2Tool.defaultToolId !== "string" || !workspaceV2Tool.defaultToolId.trim()) {
      return { ok: false, message: "tools.workspace-v2.defaultToolId is required." };
    }
    if (typeof workspaceV2Tool.activeToolId !== "string" || !workspaceV2Tool.activeToolId.trim()) {
      return { ok: false, message: "tools.workspace-v2.activeToolId is required." };
    }
    if (typeof workspaceV2Tool.activeHostContextId !== "string" || !workspaceV2Tool.activeHostContextId.trim()) {
      return { ok: false, message: "tools.workspace-v2.activeHostContextId is required." };
    }
    if (!workspaceV2Tool.game || typeof workspaceV2Tool.game !== "object" || Array.isArray(workspaceV2Tool.game)) {
      return { ok: false, message: "tools.workspace-v2.game must be an object." };
    }
    if (typeof workspaceV2Tool.game.id !== "string" || !workspaceV2Tool.game.id.trim()) {
      return { ok: false, message: "tools.workspace-v2.game.id is required." };
    }
    if (typeof workspaceV2Tool.game.name !== "string" || !workspaceV2Tool.game.name.trim()) {
      return { ok: false, message: "tools.workspace-v2.game.name is required." };
    }
    const activeToolStateValidation = this.validateWorkspaceToolStatePayload(workspaceV2Tool.activeToolState, "tools.workspace-v2.activeToolState");
    if (!activeToolStateValidation.ok) {
      return { ok: false, message: activeToolStateValidation.message };
    }
    if (!workspaceV2Tool.savedToolStates || typeof workspaceV2Tool.savedToolStates !== "object" || Array.isArray(workspaceV2Tool.savedToolStates)) {
      return { ok: false, message: "tools.workspace-v2.savedToolStates must be an object map." };
    }
    for (const toolStateId of Object.keys(workspaceV2Tool.savedToolStates)) {
      const savedPayloadValidation = this.validateWorkspaceToolStatePayload(
        workspaceV2Tool.savedToolStates[toolStateId],
        `tools.workspace-v2.savedToolStates.${toolStateId}`
      );
      if (!savedPayloadValidation.ok) {
        return { ok: false, message: savedPayloadValidation.message };
      }
    }
    return { ok: true, message: "" };
  }

  importWorkspaceToolStateJson() {
    this.setImportExportStatus("Import clicked");
    const rawJson = typeof this.workspaceJsonNode.value === "string" ? this.workspaceJsonNode.value.trim() : "";
    if (!rawJson) {
      this.setImportExportStatus("Import error: Workspace tool state JSON is required for import.");
      return;
    }
    try {
      const parsed = JSON.parse(rawJson);
      if (
        parsed &&
        typeof parsed === "object" &&
        !Array.isArray(parsed) &&
        parsed.tools &&
        typeof parsed.tools === "object" &&
        !Array.isArray(parsed.tools) &&
        Object.prototype.hasOwnProperty.call(parsed.tools, "palettes")
      ) {
        this.setImportExportStatus("Use tools.palette-browser. Workspace supports one active palette tool entry.");
        return;
      }
      if (
        parsed &&
        typeof parsed === "object" &&
        !Array.isArray(parsed) &&
        parsed.tools &&
        typeof parsed.tools === "object" &&
        !Array.isArray(parsed.tools) &&
        Object.prototype.hasOwnProperty.call(parsed.tools, "palette")
      ) {
        this.setImportExportStatus("Use tools.palette-browser. Workspace supports one active palette tool entry.");
        return;
      }
      if (
        Object.prototype.hasOwnProperty.call(parsed, "toolId") &&
        Object.prototype.hasOwnProperty.call(parsed, "version") &&
        !Object.prototype.hasOwnProperty.call(parsed, "documentKind") &&
        !Object.prototype.hasOwnProperty.call(parsed, "tools")
      ) {
        this.setImportExportStatus("Workspace import requires a workspace manifest JSON");
        return;
      }
      const validation = this.validateWorkspaceSchemaDocument(parsed);
      if (!validation.ok) {
        this.setImportExportStatus(`Import error: ${validation.message}`);
        return;
      }
      const nextWorkspaceImportedToolEntries = {};
      const importedToolIds = Object.keys(parsed.tools).sort((left, right) => left.localeCompare(right));
      importedToolIds.forEach((toolId) => {
        if (toolId === "palette-browser" || toolId === "workspace-v2") {
          return;
        }
        nextWorkspaceImportedToolEntries[toolId] = this.cloneToolStateValue(parsed.tools[toolId]);
      });
      const workspaceV2Tool = parsed.tools["workspace-v2"];
      const activeHostContextId = workspaceV2Tool.activeHostContextId.trim();
      const activeToolId = workspaceV2Tool.activeToolId.trim();
      const activePayload = workspaceV2Tool.activeToolState;
      const activation = this.activateWorkspaceToolState(activeHostContextId, activePayload, "workspace-import");
      if (!activation.ok) {
        this.setImportExportStatus(`Import error: ${activation.message}`);
        return;
      }
      this.workspaceManifestGame = this.cloneToolStateValue(workspaceV2Tool.game);
      this.workspaceImportedToolEntries = nextWorkspaceImportedToolEntries;
      localStorage.setItem(this.libraryStorageKey, JSON.stringify(workspaceV2Tool.savedToolStates));
      this.updateWorkspaceActivePaletteFromManifest(parsed);
      this.workspaceJsonNode.value = JSON.stringify(parsed, null, 2);
      const hasToolOption = Array.from(this.toolSelect.options).some((option) => option.value === activeToolId);
      if (hasToolOption) {
        this.toolSelect.value = activeToolId;
      }
      this.renderToolStateLibrary();
      this.renderToolStateHistory();
      this.renderToolStateDiffInputs();
      this.renderToolStateMergeInputs();
      this.refreshPaletteOwnershipStateAndUi();
      this.refreshWorkspaceToolStateUiStateModel("refresh_load");
      this.renderWorkspaceToolsSummary();
      this.setImportExportStatus("Workspace tool state imported.");
    } catch (error) {
      this.setImportExportStatus(`Import error: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  }

  createShareLink() {
    if (!this.isValidToolStatePayload(this.currentToolStatePayload)) {
      this.statusNode.textContent = "No current tool state payload to share. Load tool state, import JSON, or load library tool state first.";
      return;
    }
    try {
      const encoded = this.encodeToolStatePayload(this.currentToolStatePayload);
      const shareUrl = new URL(window.location.href);
      shareUrl.searchParams.set("toolState", encoded);
      if (shareUrl.toString().length > this.urlLengthLimit) {
        this.statusNode.textContent = `Tool state size exceeds allowed limit for URL payload. URL length is ${shareUrl.toString().length} and limit is ${this.urlLengthLimit}.`;
        return;
      }
      this.shareUrlNode.value = shareUrl.toString();
      this.statusNode.textContent = "Share link created from current tool state payload.";
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
      if (!parsedUrl.searchParams.has("toolState")) {
        this.statusNode.textContent = "Share URL is invalid. Missing toolState query parameter.";
        return;
      }
      const decoded = this.decodeToolStatePayload(parsedUrl.searchParams.get("toolState"));
      if (!this.applyToolStatePayload(decoded, "share-link")) {
        return;
      }
      this.statusNode.textContent = `Share tool state link applied.\nTool: ${this.selectedToolId()}\nHostContextId: ${this.currentHostContextId}\nReady to launch.`;
    } catch (error) {
      this.statusNode.textContent = `Share tool state decode failed: ${error instanceof Error ? error.message : "unknown error"}`;
    }
  }

  saveNamedToolState(overwriteExisting) {
    const toolStateName = this.selectedToolStateName();
    if (!toolStateName) {
      this.setLibraryStatus(overwriteExisting ? "Enter a tool state ID before overwriting." : "Enter a tool state ID before saving.");
      return;
    }
    if (!overwriteExisting && !this.isValidNewToolStateId(toolStateName)) {
      this.setLibraryStatus("Invalid tool state ID. Use letters, numbers, hyphen, or underscore only.");
      return;
    }
    const library = this.readToolStateLibrary();
    if (library === null) {
      return;
    }
    const exists = Object.prototype.hasOwnProperty.call(library, toolStateName);
    if (overwriteExisting && !exists) {
      this.setLibraryStatus("Saved tool state not found. Use Save Tool State to create it first.");
      return;
    }
    if (!overwriteExisting && exists) {
      this.setLibraryStatus("That tool state ID already exists. Use the saved tool state card to Load or Overwrite it.");
      return;
    }
    const payloadForWrite = this.readToolStatePayloadForSaveAction(toolStateName);
    if (!this.isValidToolStatePayload(payloadForWrite)) {
      this.setLibraryStatus(overwriteExisting
        ? "No active Workspace V2 tool state is available to overwrite from."
        : "No active Workspace V2 tool state is available to save.");
      return;
    }
    const payloadValidation = this.validateWorkspaceToolStatePayload(payloadForWrite, `tools.workspace-v2.savedToolStates.${toolStateName}`);
    if (!payloadValidation.ok) {
      this.setLibraryStatus(payloadValidation.message);
      return;
    }
    if (this.isBlockedAlternatePaletteToolState(toolStateName, payloadForWrite)) {
      this.setLibraryStatus(this.singleActivePaletteLibraryMessage());
      return;
    }
    library[toolStateName] = payloadForWrite;
    this.writeToolStateLibrary(library);
    this.renderToolStateLibrary();
    this.setLibraryStatus(overwriteExisting
      ? `Saved tool state '${toolStateName}' overwritten with current workspace state.`
      : `Saved tool state '${toolStateName}' created.`);
  }

  loadNamedToolState() {
    const toolStateName = this.selectedToolStateName();
    if (!toolStateName) {
      this.setLibraryStatus("Enter a saved tool state ID before loading.");
      return;
    }
    const library = this.readToolStateLibrary();
    if (library === null) {
      return;
    }
    if (!Object.prototype.hasOwnProperty.call(library, toolStateName)) {
      this.setLibraryStatus("Saved tool state not found.");
      return;
    }
    const payload = library[toolStateName];
    if (this.isBlockedAlternatePaletteToolState(toolStateName, payload)) {
      this.setLibraryStatus(this.singleActivePaletteLibraryMessage());
      return;
    }
    if (!this.applyToolStatePayload(payload, `library:${toolStateName}`)) {
      this.setLibraryStatus("Saved tool state not found.");
      return;
    }
    this.setLibraryStatus(`Loaded '${toolStateName}' into the current workspace.`);
    this.refreshWorkspaceToolStateUiStateModel("refresh_load");
  }

  deleteNamedToolState() {
    const toolStateName = this.selectedToolStateName();
    if (!toolStateName) {
      this.setLibraryStatus("Enter a saved tool state ID before deleting.");
      return;
    }
    const library = this.readToolStateLibrary();
    if (library === null) {
      return;
    }
    const history = this.readToolStateHistory();
    const recentMatch = history.some((entry) => entry.hostContextId === toolStateName);
    const libraryToolStateNames = Object.keys(library);
    if (libraryToolStateNames.length === 0) {
      this.setLibraryStatus(recentMatch
        ? "Tool State ID is not saved in Tool State Library. Use Delete on Recent Tool States to remove temporary tool states."
        : "No saved tool states exist. Use Delete on Recent Tool States to remove temporary tool states.");
      return;
    }
    if (!Object.prototype.hasOwnProperty.call(library, toolStateName)) {
      this.setLibraryStatus(recentMatch
        ? "Tool State ID is not saved in Tool State Library. Use Delete on Recent Tool States to remove temporary tool states."
        : "Saved tool state not found.");
      return;
    }
    delete library[toolStateName];
    this.writeToolStateLibrary(library);
    this.renderToolStateLibrary();
    this.setLibraryStatus("Saved tool state deleted.");
  }

  createToolStateAndLaunch() {
    const toolId = this.selectedToolId();
    if (!toolId) {
      this.statusNode.textContent = "Select a toolState-capable V2 tool before opening tool state.";
      return;
    }
    if (!this.isValidToolStatePayload(this.currentToolStatePayload)) {
      this.statusNode.textContent = "No tool state payload is available. Load a tool state, import JSON, apply share link, or load a library tool state first.";
      return;
    }
    if (typeof this.currentToolStatePayload.toolId !== "string" || this.currentToolStatePayload.toolId.trim() !== toolId) {
      this.statusNode.textContent = `Launch blocked. Active tool state toolId '${typeof this.currentToolStatePayload.toolId === "string" ? this.currentToolStatePayload.toolId.trim() : ""}' does not match selected tool '${toolId}'. Load a fixture or import a matching tool state first.`;
      return;
    }
    const activation = this.activateWorkspaceToolState(this.createHostContextToolStateId(toolId), this.currentToolStatePayload, this.currentToolStateSource || "workspace-v2");
    if (!activation.ok) {
      this.statusNode.textContent = activation.message;
      return;
    }
    const hostContextId = this.currentHostContextId;
    this.addRecentToolStateEntry(hostContextId, toolId, activation.payload);
    const launchUrl = this.buildToolLaunchUrl(toolId, hostContextId);
    this.statusNode.textContent = `Tool state created.\nTool: ${toolId}\nHostContextId: ${hostContextId}\nURL: tools/${toolId}/index.html?hostContextId=${hostContextId}`;
    window.location.href = launchUrl;
  }

  openAssetManagerFromWorkspace() {
    if (!this.isValidToolStatePayload(this.currentToolStatePayload)) {
      this.statusNode.textContent = "No active Workspace V2 tool state is available. Load tool state, import workspace tool state, or load a saved tool state first.";
      return;
    }
    if (!this.currentToolStatePayload.payloadJson || typeof this.currentToolStatePayload.payloadJson !== "object" || Array.isArray(this.currentToolStatePayload.payloadJson)) {
      this.statusNode.textContent = "Active tool state payloadJson is missing. Open Asset Manager V2 from a tool state that provides payloadJson.";
      return;
    }
    const assetManagerPayload = this.withToolStateVersion({
      toolId: "asset-manager-v2",
      payloadJson: this.cloneToolStateValue(this.currentToolStatePayload.payloadJson)
    });
    const payloadValidation = this.validateWorkspaceToolStatePayload(assetManagerPayload, "assetManagerLaunch");
    if (!payloadValidation.ok) {
      this.statusNode.textContent = payloadValidation.message;
      return;
    }
    const activation = this.activateWorkspaceToolState(
      this.createHostContextToolStateId("asset-manager-v2"),
      assetManagerPayload,
      "workspace-v2-asset-manager-launch"
    );
    if (!activation.ok) {
      this.statusNode.textContent = activation.message;
      return;
    }
    const hostContextId = this.currentHostContextId;
    this.addRecentToolStateEntry(hostContextId, "asset-manager-v2", activation.payload);
    const launchUrl = this.buildToolLaunchUrl("asset-manager-v2", hostContextId);
    this.statusNode.textContent = `Tool state created.\nTool: asset-manager-v2\nHostContextId: ${hostContextId}\nURL: tools/asset-manager-v2/index.html?hostContextId=${hostContextId}`;
    window.location.href = launchUrl;
  }
}

new WorkspaceV2ToolStateProducer();
