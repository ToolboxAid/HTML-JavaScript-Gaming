export class WorkspaceManagerV2App {
  constructor({
    accordions,
    contextService,
    gameSelector,
    menu,
    repoDestination,
    statusLog,
    summary,
    toolTiles
  }) {
    this.accordions = accordions;
    this.contextService = contextService;
    this.gameSelector = gameSelector;
    this.menu = menu;
    this.repoDestination = repoDestination;
    this.statusLog = statusLog;
    this.summary = summary;
    this.toolTiles = toolTiles;
    this.activeContext = null;
    this.activeGame = null;
    this.activeHostContextId = null;
    this.activeWorkspaceMode = this.contextService.isUatMode() ? "uat" : "";
    this.activeRepoHandle = null;
    this.activeToolStateHydration = null;
    this.activeToolStateRefresh = null;
  }

  start() {
    if (!this.contextService.hasExplicitHostContextId()) {
      this.contextService.clearWorkspaceToolStateHydration();
    }
    this.accordions.forEach((accordion) => accordion.mount());
    this.statusLog.mount();
    this.gameSelector.mount({
      games: this.contextService.games(),
      onGameSelected: (gameId) => {
        void this.selectGame(gameId);
      }
    });
    this.menu.mount({
      isUatMode: this.contextService.isUatMode(),
      onCancelToolState: () => {
        this.cancelActiveToolState();
      },
      onCloseWorkspace: () => {
        this.closeWorkspace();
      },
      onSaveWorkspace: () => {
        void this.saveWorkspaceSession();
      },
      onSeedUat: () => {
        void this.seedTemporaryUatManifest();
      }
    });
    this.repoDestination.mount({
      onPickRepo: () => {
        void this.pickRepoDestination();
      }
    });
    this.toolTiles.mount({
      onLaunchTool: (toolId) => {
        void this.launchTool(toolId);
      },
      tools: this.contextService.workspaceLaunchableTools()
    });
    this.summary.mount({
      onCopy: () => {
        void this.copyWorkspaceJson();
      }
    });
    this.summary.clear();
    this.menu.setSaveEnabled(false);
    this.menu.setCloseEnabled(false);
    this.menu.setCancelEnabled(false);
    this.repoDestination.setPickRepoEnabled(true);
    this.gameSelector.clear();
    this.toolTiles.renderEmpty();
    this.statusLog.ok("Workspace Manager V2 ready. Pick a repo folder to discover schema-valid game manifests.");
    void this.restoreWorkspaceFromSession();
  }

  clearActiveWorkspace(summaryText = "Pick a repo folder to discover schema-valid game manifests.") {
    this.activeContext = null;
    this.activeGame = null;
    this.activeHostContextId = null;
    this.activeWorkspaceMode = this.contextService.isUatMode() ? "uat" : "";
    this.activeToolStateHydration = null;
    this.activeToolStateRefresh = null;
    this.contextService.clearWorkspaceToolStateHydration();
    this.contextService.clearDiscoveredGames();
    this.repoDestination.setPickRepoEnabled(true);
    this.gameSelector.clear();
    this.gameSelector.setSummary(summaryText);
    this.menu.setSaveEnabled(false);
    this.menu.setCloseEnabled(false);
    this.menu.setCancelEnabled(false);
    this.toolTiles.renderEmpty();
    this.summary.clear();
  }

  activeToolStateDirtyStatus() {
    if (!this.activeContext || !this.activeToolStateHydration?.ok || !this.activeToolStateRefresh) {
      return "none";
    }
    const dirtyCheck = this.contextService.dirtyWorkspaceToolStates();
    if (dirtyCheck.dirty.length) {
      return "true";
    }
    if (dirtyCheck.unknown.length) {
      return "unknown";
    }
    return "false";
  }

  syncLifecycleControls() {
    const hasActiveToolState = Boolean(this.activeContext && this.activeGame && this.activeToolStateHydration?.ok);
    const dirtyStatus = this.activeToolStateDirtyStatus();
    this.menu.setSaveEnabled(hasActiveToolState && dirtyStatus === "true");
    this.menu.setCloseEnabled(hasActiveToolState && dirtyStatus === "false");
    this.menu.setCancelEnabled(hasActiveToolState);
    this.repoDestination.setPickRepoEnabled(!hasActiveToolState);
    this.gameSelector.setSelectionLocked(hasActiveToolState);
  }

  async pickRepoDestination() {
    this.activeRepoHandle = null;
    this.repoDestination.setRepoDestinationDisplayName("not selected");
    this.clearActiveWorkspace("Loading repo game manifests.");
    if (typeof window.showDirectoryPicker !== "function") {
      this.gameSelector.setSummary("Repo folder picker is unavailable in this browser.");
      this.statusLog.fail("Repo load failed: Repo folder picker is unavailable in this browser.");
      return;
    }
    try {
      const selectedRepoHandle = await window.showDirectoryPicker({ mode: "read" });
      const displayName = selectedRepoHandle?.name || "selected";
      const discovery = await this.contextService.discoverGameManifests(selectedRepoHandle);
      if (!discovery.ok) {
        this.gameSelector.setSummary(discovery.message);
        this.statusLog.fail(`Repo load failed: ${discovery.message}`);
        return;
      }
      discovery.skips.forEach((skip) => {
        this.statusLog.info(`SKIP ${skip.path}: ${skip.reason}`);
      });
      this.activeRepoHandle = selectedRepoHandle;
      this.repoDestination.setRepoDestinationDisplayName(displayName);
      const repoHydration = this.contextService.hydrateRepoReference(selectedRepoHandle, displayName);
      if (!repoHydration.ok) {
        this.clearActiveWorkspace(repoHydration.message);
        this.statusLog.fail(`Repo load failed: ${repoHydration.message}`);
        return;
      }
      this.contextService.setDiscoveredGames(discovery.games);
      this.gameSelector.setGames(discovery.games);
      this.syncLifecycleControls();
      if (discovery.games.length) {
        this.gameSelector.setSummary(`Discovered ${discovery.games.length} schema-valid game manifest${discovery.games.length === 1 ? "" : "s"} from ${displayName}.`);
        this.statusLog.ok(`Repo destination selected: ${displayName}.`);
        this.statusLog.ok(`Discovered ${discovery.games.length} schema-valid game manifest${discovery.games.length === 1 ? "" : "s"}.`);
      } else {
        this.gameSelector.clear();
        this.gameSelector.setSummary(`No schema-valid game manifests were found in ${displayName}.`);
        this.statusLog.fail(`Repo load failed: No schema-valid game.manifest.json files were found in ${displayName}.`);
      }
    } catch (error) {
      this.gameSelector.setSummary("Pick a repo folder to discover schema-valid game manifests.");
      this.statusLog.info(`Repo folder selection canceled or failed: ${error.message}`);
    }
  }

  async selectGame(gameId) {
    this.activeContext = null;
    this.activeGame = null;
    this.activeHostContextId = null;
    this.activeWorkspaceMode = this.contextService.isUatMode() ? "uat" : "";
    this.activeToolStateHydration = null;
    this.activeToolStateRefresh = null;
    this.contextService.clearToolStateHydration();
    this.toolTiles.renderEmpty();
    this.summary.clear();
    this.syncLifecycleControls();
    this.gameSelector.setValue(gameId || "");

    if (!gameId) {
      this.gameSelector.setSummary("Select a game workspace.");
      this.statusLog.info("Game selection cleared.");
      return;
    }

    this.gameSelector.setSummary(`Loading ${gameId} game manifest.`);
    const result = await this.contextService.buildContextForGame(gameId);
    if (!result.ok) {
      this.gameSelector.setSummary(result.message);
      this.statusLog.fail(result.message);
      return;
    }

    this.applyContextResult(result);
    if (result.assetWarning) {
      this.statusLog.info(`Warning: ${result.assetWarning}`);
    }
    if (result.boundaryContract) {
      this.statusLog.ok(result.boundaryContract);
    }
    this.reportToolStateHydration();
    this.statusLog.ok(`Loaded ${result.game.name} from ${result.game.manifestPath} with ${result.paletteSwatches.length} active palette colors and ${result.assetCount} managed assets.`);
    this.statusLog.ok("Asset Manager V2 production launch context is session/state based only.");
  }

  async copyWorkspaceJson() {
    const result = await this.summary.copyToClipboard();
    if (result.ok) {
      this.statusLog.ok(`Copied Workspace JSON to clipboard (${result.copiedLength} characters).`);
      return;
    }
    this.statusLog.fail(`Workspace JSON copy failed: ${result.message}`);
  }

  async restoreWorkspaceFromSession() {
    const result = await this.contextService.restorePersistedContext();
    if (!result.hasContext) {
      return;
    }
    if (!result.ok) {
      this.statusLog.fail(`Workspace restore failed: ${result.message}`);
      return;
    }
    const repoReferenceResult = this.contextService.readWorkspaceRepoReference({
      expectedRepoRoot: result.context.repoRoot || result.game.repoRoot || ""
    });
    if (!repoReferenceResult.ok) {
      const message = `${repoReferenceResult.message} Pick Repo Folder to reselect repo before launching tools.`;
      this.repoDestination.setRepoDestinationDisplayName("not selected");
      this.clearActiveWorkspace(message);
      this.statusLog.fail(`Workspace restore failed: ${message}`);
      return;
    }
    this.repoDestination.setRepoDestinationDisplayName(repoReferenceResult.reference.displayName);
    this.gameSelector.setValue(result.game.id, result.game.name);
    this.applyContextResult(result);
    if (result.assetWarning) {
      this.statusLog.info(`Warning: ${result.assetWarning}`);
    }
    this.reportToolStateHydration();
    this.statusLog.ok(`Restored repo destination from workspace.repo.reference for ${repoReferenceResult.reference.displayName}.`);
    this.statusLog.ok(`Restored ${result.game.name} workspace from session context ${result.hostContextId}.`);
  }

  applyContextResult(result) {
    const tools = this.contextService.workspaceLaunchableTools();
    const hydration = this.contextService.hydrateEnabledToolSessions({
      context: result.context,
      game: result.game,
      tools
    });
    const sessionRefresh = hydration.ok
      ? this.contextService.refreshContextFromToolSessions({ context: result.context, tools })
      : { context: result.context, toolSummaries: {} };
    const paletteSummary = sessionRefresh.toolSummaries["palette-manager-v2"] || {};
    const assetSummary = sessionRefresh.toolSummaries["asset-manager-v2"] || {};
    const dirtyByToolId = Object.fromEntries(Object.entries(sessionRefresh.toolSummaries)
      .map(([toolId, summary]) => [toolId, summary.dirtyStatus || "unknown"]));
    const paletteSwatchCount = Number.isInteger(paletteSummary.paletteSwatchCount)
      ? paletteSummary.paletteSwatchCount
      : result.paletteSwatches.length;
    const assetCount = Number.isInteger(assetSummary.assetCount)
      ? assetSummary.assetCount
      : result.assetCount;
    this.activeContext = sessionRefresh.context;
    this.activeGame = result.game;
    this.activeHostContextId = result.hostContextId || null;
    this.activeWorkspaceMode = this.contextService.isUatMode() ? "uat" : "";
    this.activeToolStateHydration = hydration;
    this.activeToolStateRefresh = sessionRefresh;
    this.gameSelector.setSummary(`${result.game.name} context uses ${result.game.gameRoot} and ${result.game.assetsPath}.`);
    this.summary.render({ context: this.activeContext });
    this.toolTiles.render({
      assetCount,
      canLaunch: hydration.ok,
      dirtyByToolId,
      enabledToolIds: hydration.ok ? hydration.hydratedToolIds : [],
      manifestStatus: "Schema-valid manifest",
      paletteSwatchCount
    });
    this.syncLifecycleControls();
  }

  reportToolStateHydration() {
    if (!this.activeToolStateHydration) {
      return;
    }
    if (!this.activeToolStateHydration.ok) {
      this.statusLog.fail(`Session hydration failed: ${this.activeToolStateHydration.message}`);
      return;
    }
    this.statusLog.ok(`Hydrated workspace session for ${this.activeToolStateHydration.hydratedToolIds.join(", ")}.`);
    (this.activeToolStateHydration.skippedTools || []).forEach((tool) => {
      this.statusLog.info(`Skipped workspace session hydration for ${tool.toolId}: ${tool.reason}.`);
    });
    const paletteSummary = this.activeToolStateRefresh?.toolSummaries?.["palette-manager-v2"];
    if (paletteSummary) {
      this.statusLog.info(`Refreshed palette-manager-v2 from workspace.tools.palette-manager-v2.data: ${paletteSummary.paletteSwatchCount} palette swatches; Dirty: ${paletteSummary.dirtyStatus}.`);
    }
    const assetSummary = this.activeToolStateRefresh?.toolSummaries?.["asset-manager-v2"];
    if (assetSummary) {
      this.statusLog.info(`Refreshed asset-manager-v2 from workspace.tools.asset-manager-v2.data: ${assetSummary.assetCount} managed assets; Dirty: ${assetSummary.dirtyStatus}.`);
    }
  }

  hasLaunchReadyContext() {
    return Boolean(this.activeContext
      && this.activeGame
      && this.activeToolStateHydration?.ok
      && this.activeContext.tools?.["palette-manager-v2"]?.swatches?.length);
  }

  async launchTool(toolId) {
    if (!this.hasLaunchReadyContext()) {
      this.statusLog.fail("Launch blocked: active game context and palette are required.");
      return;
    }
    if (!this.activeToolStateHydration.hydratedToolIds.includes(toolId)) {
      this.statusLog.fail(`Launch blocked: ${toolId} is not enabled for ${this.activeGame.name}.`);
      return;
    }
    const validation = await this.contextService.validateGeneratedManifest(this.activeContext);
    if (!validation.ok) {
      this.statusLog.fail(`Launch blocked: ${validation.message}`);
      return;
    }
    const hostContextId = this.activeHostContextId
      ? this.contextService.writePersistedContext(this.activeHostContextId, this.activeContext)
      : this.contextService.persistContext(this.activeContext);
    this.activeHostContextId = hostContextId;
    this.statusLog.ok(`Stored Workspace Manager V2 schema-valid manifest ${hostContextId} for ${toolId}.`);
    this.contextService.launchTool(toolId, hostContextId, { workspaceMode: this.activeWorkspaceMode });
  }

  async contextForSave() {
    let baseContext = this.activeContext;
    if (this.activeHostContextId) {
      const result = await this.contextService.restorePersistedContextById(this.activeHostContextId);
      if (!result.ok) {
        return { ok: false, message: `Unable to refresh Workspace Manager V2 session manifest ${this.activeHostContextId}: ${result.message}` };
      }
      if (result.game.id !== this.activeGame.id) {
        return { ok: false, message: `Stored session context is for ${result.game.id}, not ${this.activeGame.id}.` };
      }
      const sourceBinding = await this.contextService.bindGameManifestSourceForSave({
        context: result.context,
        game: result.game,
        repoHandle: this.activeRepoHandle
      });
      if (!sourceBinding.ok) {
        return sourceBinding;
      }
      this.statusLog.info(`Save source rebound to ${sourceBinding.source} for ${result.game.id}.`);
      this.applyContextResult({ ...result, game: sourceBinding.game });
      if (result.assetWarning) {
        this.statusLog.info(`Warning: ${result.assetWarning}`);
      }
      baseContext = this.activeContext;
    }
    const sessionRefresh = this.contextService.refreshContextFromToolSessions({
      context: baseContext,
      tools: this.contextService.workspaceLaunchableTools()
    });
    const metrics = this.contextSummaryMetrics(sessionRefresh.context);
    this.applyContextResult({
      assetCount: metrics.assetCount,
      context: sessionRefresh.context,
      game: this.activeGame,
      hostContextId: this.activeHostContextId,
      paletteSwatches: metrics.paletteSwatches
    });
    return { ok: true, context: this.activeContext };
  }

  contextSummaryMetrics(context) {
    const paletteSwatches = Array.isArray(context?.tools?.["palette-manager-v2"]?.swatches)
      ? context.tools["palette-manager-v2"].swatches
      : [];
    const assets = context?.tools?.["asset-manager-v2"]?.assets;
    return {
      assetCount: assets && typeof assets === "object" && !Array.isArray(assets)
        ? Object.keys(assets).length
        : 0,
      paletteSwatches
    };
  }

  async saveWorkspaceSession() {
    if (!this.hasLaunchReadyContext()) {
      this.statusLog.fail("Save blocked: active game context and palette are required.");
      return;
    }
    const dirtyStatus = this.activeToolStateDirtyStatus();
    const dirtyCheck = this.contextService.dirtyWorkspaceToolStates();
    if (dirtyStatus === "false") {
      this.syncLifecycleControls();
      this.statusLog.info("Save skipped: active toolState is already clean.");
      return;
    }
    if (dirtyStatus === "unknown") {
      this.syncLifecycleControls();
      this.statusLog.fail("Save blocked: active toolState dirty status could not be verified.");
      return;
    }
    const saveContextResult = await this.contextForSave();
    if (!saveContextResult.ok) {
      this.statusLog.fail(`Save blocked: ${saveContextResult.message}`);
      return;
    }
    const context = saveContextResult.context;
    const validation = await this.contextService.validateGeneratedManifest(context);
    if (!validation.ok) {
      this.statusLog.fail(`Save blocked: ${validation.message}`);
      return;
    }
    const writeResult = await this.contextService.writeActiveGameToolStateFile({
      context,
      game: this.activeGame,
      repoHandle: this.activeRepoHandle
    });
    if (!writeResult.ok) {
      this.statusLog.fail(`Save blocked: ${writeResult.message}`);
      return;
    }
    this.activeGame = writeResult.game;
    this.activeHostContextId = this.contextService.writePersistedContext(this.activeHostContextId, context);
    const cleanResult = this.contextService.markEnabledToolSessionsClean({
      context,
      tools: this.contextService.workspaceLaunchableTools()
    });
    const cleanValidation = this.contextService.validateCleanToolStateKeys(cleanResult.cleanedKeys);
    if (!cleanValidation.ok) {
      this.statusLog.fail(`Save clean-state validation failed: ${cleanValidation.message}`);
      return;
    }
    const metrics = this.contextSummaryMetrics(context);
    this.applyContextResult({
      assetCount: metrics.assetCount,
      context,
      game: this.activeGame,
      hostContextId: this.activeHostContextId,
      paletteSwatches: metrics.paletteSwatches
    });
    cleanResult.cleanedKeys.forEach((key) => {
      this.statusLog.ok(`Saved and marked clean: ${key}.`);
    });
    this.statusLog.ok(`Save source binding: ${writeResult.source}.`);
    this.statusLog.ok(`Saved path: ${writeResult.path}.`);
    this.statusLog.ok(`Save write validation: ${writeResult.changeValidation}.`);
    this.statusLog.info(`Saved file size: ${writeResult.fileSize} bytes.`);
    this.statusLog.info(`Saved toolState items: ${writeResult.toolStateItemCount} (${writeResult.toolStateDetails.join("; ")}).`);
    this.statusLog.ok(`Save validation result: ${writeResult.validationResult}.`);
    this.statusLog.ok(`Save dirty/clean validation: ${dirtyCheck.dirty.length} dirty toolState payload${dirtyCheck.dirty.length === 1 ? "" : "s"} persisted; ${cleanResult.cleanedKeys.length} toolState key${cleanResult.cleanedKeys.length === 1 ? "" : "s"} marked clean.`);
    this.statusLog.ok(`Saved Workspace Manager V2 toolState context ${context.id}.`);
  }

  closeWorkspace() {
    if (!this.activeContext) {
      this.syncLifecycleControls();
      this.statusLog.warn("Close Workspace blocked: no active toolState is open.");
      return;
    }
    const dirtyCheck = this.contextService.dirtyWorkspaceToolStates();
    if (dirtyCheck.dirty.length) {
      this.syncLifecycleControls();
      this.statusLog.warn(`Close Workspace blocked: dirty toolStates require Save first: ${dirtyCheck.dirty.map((entry) => `${entry.key}(${entry.reason})`).join(", ")}.`);
      return;
    }
    if (dirtyCheck.unknown.length) {
      this.syncLifecycleControls();
      this.statusLog.warn(`Close Workspace blocked: dirty status could not be verified for ${dirtyCheck.unknown.map((entry) => entry.key).join(", ")}.`);
      return;
    }
    const closeResult = this.contextService.closeWorkspaceToolStateData({
      hostContextId: this.activeHostContextId || ""
    });
    closeResult.removed.forEach((key) => {
      this.statusLog.ok(`Close Workspace removed toolState key: ${key}.`);
    });
    closeResult.failed.forEach(({ key, message }) => {
      this.statusLog.fail(`Close Workspace failed to remove ${key}: ${message}`);
    });
    if (!closeResult.ok) {
      return;
    }
    this.activeRepoHandle = null;
    this.repoDestination.setRepoDestinationDisplayName("not selected");
    this.clearActiveWorkspace();
    this.statusLog.ok(`Closed Workspace Manager V2 toolState. Removed ${closeResult.removed.length} workspace toolState key${closeResult.removed.length === 1 ? "" : "s"}.`);
  }

  cancelActiveToolState() {
    if (!this.activeContext) {
      this.syncLifecycleControls();
      this.statusLog.warn("Cancel Workspace blocked: no active toolState is open.");
      return;
    }
    const dirtyCheck = this.contextService.dirtyWorkspaceToolStates();
    const dirtyDetails = dirtyCheck.dirty.map((entry) => `${entry.key}(${entry.reason})`);
    const unknownDetails = dirtyCheck.unknown.map((entry) => `${entry.key}(unknown)`);
    const shouldConfirm = dirtyDetails.length > 0 || unknownDetails.length > 0;
    if (shouldConfirm) {
      const details = [...dirtyDetails, ...unknownDetails].join(", ");
      this.statusLog.warn(`Cancel Workspace warning: active toolState information will be lost: ${details}.`);
      const confirmed = window.confirm("Active toolState information will be lost. Cancel active game?");
      if (!confirmed) {
        this.syncLifecycleControls();
        this.statusLog.info("Cancel Workspace kept the active toolState.");
        return;
      }
    }
    const cancelResult = this.contextService.closeWorkspaceToolStateData({
      hostContextId: this.activeHostContextId || ""
    });
    cancelResult.removed.forEach((key) => {
      this.statusLog.ok(`Cancel Workspace removed toolState key: ${key}.`);
    });
    cancelResult.failed.forEach(({ key, message }) => {
      this.statusLog.fail(`Cancel Workspace failed to remove ${key}: ${message}`);
    });
    if (!cancelResult.ok) {
      return;
    }
    this.activeRepoHandle = null;
    this.repoDestination.setRepoDestinationDisplayName("not selected");
    this.clearActiveWorkspace();
    this.statusLog.ok(`Canceled Workspace Manager V2 toolState. Removed ${cancelResult.removed.length} workspace toolState key${cancelResult.removed.length === 1 ? "" : "s"}.`);
  }

  async seedTemporaryUatManifest() {
    this.activeRepoHandle = null;
    this.contextService.clearWorkspaceToolStateHydration();
    const result = await this.contextService.buildTemporaryUatContext();
    if (!result.ok) {
      this.statusLog.fail(`UAT seed failed: ${result.message}`);
      return;
    }
    const hostContextId = this.contextService.persistContext(result.context);
    this.gameSelector.setValue(result.game.id, result.game.name);
    this.applyContextResult({ ...result, hostContextId });
    if (result.assetWarning) {
      this.statusLog.info(`Warning: ${result.assetWarning}`);
    }
    this.reportToolStateHydration();
    this.statusLog.ok(`Loaded UAT Workspace Manager V2 manifest ${result.context.id} from /games/_template/workspace-manager-v2-UAT.manifest.json.`);
  }
}
