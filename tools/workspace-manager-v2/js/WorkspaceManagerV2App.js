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
    this.activeToolStateRequiresRepoHandle = false;
    this.activeToolStateHydration = null;
    this.activeToolStateRefresh = null;
    this.lastLaunchedToolId = "";
  }

  static returnHistoryContextKey() {
    return "workspace-manager-v2-return-history-context-id";
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
    window.addEventListener("pageshow", (event) => {
      if (event.persisted && this.lastLaunchedToolId) {
        void this.restoreReturnFromToolState();
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
    this.activeToolStateRequiresRepoHandle = false;
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

  runtimeBindingMetadata({
    bindingSource = "",
    boundManifestPath = "",
    hasLiveRepoHandle,
    sourceBindingState = ""
  } = {}) {
    const liveRepoHandle = typeof hasLiveRepoHandle === "boolean"
      ? hasLiveRepoHandle
      : Boolean(this.activeRepoHandle && !this.activeToolStateRequiresRepoHandle);
    const manifestPath = boundManifestPath || this.activeGame?.manifestPath || "";
    const state = sourceBindingState || (liveRepoHandle && manifestPath && !manifestPath.startsWith("sessionStorage:")
      ? "bound"
      : (liveRepoHandle ? "repo-handle-acquired" : "missing-live-repo-handle"));
    const source = bindingSource || (manifestPath.startsWith("sessionStorage:")
      ? "sessionStorage restore"
      : (manifestPath ? "game.manifest.json" : "runtime state"));
    return this.contextService.runtimeBindingMetadata({
      bindingSource: source,
      boundManifestPath: manifestPath,
      hasLiveRepoHandle: liveRepoHandle,
      sourceBindingState: state
    });
  }

  runtimeBindingDetails(runtimeBinding) {
    return `hasLiveRepoHandle=${runtimeBinding.hasLiveRepoHandle}; sourceBindingState=${runtimeBinding.sourceBindingState}; boundManifestPath=${runtimeBinding.boundManifestPath || "(none)"}; bindingSource=${runtimeBinding.bindingSource || "(none)"}`;
  }

  updateRepoRuntimeBinding(runtimeBinding) {
    const result = this.contextService.writeWorkspaceRepoRuntimeBinding(runtimeBinding);
    if (!result.ok && this.contextService.sessionStorage.getItem("workspace.repo.reference") !== null) {
      this.statusLog.warn(`Runtime binding metadata update failed: ${result.message}`);
    }
    return result;
  }

  syncLifecycleControls() {
    const hasActiveToolState = Boolean(this.activeContext && this.activeGame && this.activeToolStateHydration?.ok);
    const dirtyStatus = this.activeToolStateDirtyStatus();
    const hasSaveSource = Boolean(this.activeRepoHandle && !this.activeToolStateRequiresRepoHandle);
    this.menu.setSaveEnabled(hasActiveToolState && hasSaveSource && dirtyStatus === "true");
    this.menu.setCloseEnabled(hasActiveToolState && dirtyStatus === "false");
    this.menu.setCancelEnabled(hasActiveToolState);
    this.repoDestination.setPickRepoEnabled(!hasActiveToolState || this.activeToolStateRequiresRepoHandle);
    this.gameSelector.setSelectionLocked(hasActiveToolState);
  }

  async pickRepoDestination() {
    const restoredToolState = this.activeToolStateRequiresRepoHandle && this.activeContext && this.activeGame
      ? {
        context: this.activeContext,
        game: this.activeGame,
        hostContextId: this.activeHostContextId
      }
      : null;
    if (restoredToolState) {
      this.gameSelector.setSummary(`Loading repo game manifests to rebind ${restoredToolState.game.name} toolState.`);
    } else {
      this.activeRepoHandle = null;
      this.repoDestination.setRepoDestinationDisplayName("not selected");
      this.clearActiveWorkspace("Loading repo game manifests.");
    }
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
      const acquiredBinding = this.runtimeBindingMetadata({
        bindingSource: "showDirectoryPicker",
        boundManifestPath: "",
        hasLiveRepoHandle: true,
        sourceBindingState: "repo-handle-acquired"
      });
      const repoHydration = this.contextService.hydrateRepoReference(selectedRepoHandle, displayName, acquiredBinding);
      if (!repoHydration.ok) {
        this.clearActiveWorkspace(repoHydration.message);
        this.statusLog.fail(`Repo load failed: ${repoHydration.message}`);
        return;
      }
      this.statusLog.ok(`Runtime handle acquired: ${this.runtimeBindingDetails(acquiredBinding)}.`);
      const cacheResult = await this.contextService.cacheRepoHandle(selectedRepoHandle, repoHydration.reference);
      if (!cacheResult.ok) {
        this.statusLog.warn(`Repo handle cache unavailable: ${cacheResult.message}`);
      }
      this.contextService.setDiscoveredGames(discovery.games);
      this.gameSelector.setGames(discovery.games);
      if (restoredToolState) {
        const sourceBinding = await this.contextService.bindGameManifestSourceForSave({
          context: restoredToolState.context,
          game: restoredToolState.game,
          repoHandle: selectedRepoHandle
        });
        const metrics = this.contextSummaryMetrics(restoredToolState.context);
        if (!sourceBinding.ok) {
          const invalidBinding = this.runtimeBindingMetadata({
            bindingSource: "repo-folder-rebind",
            boundManifestPath: restoredToolState.game.manifestPath,
            hasLiveRepoHandle: true,
            sourceBindingState: "invalid"
          });
          this.updateRepoRuntimeBinding(invalidBinding);
          this.applyContextResult({
            assetCount: metrics.assetCount,
            context: restoredToolState.context,
            game: restoredToolState.game,
            hostContextId: restoredToolState.hostContextId,
            paletteSwatches: metrics.paletteSwatches
          }, { requiresRepoHandle: true });
          this.gameSelector.setValue(restoredToolState.game.id, restoredToolState.game.name);
          this.statusLog.warn(`Runtime handle invalidated: ${this.runtimeBindingDetails(invalidBinding)}; reason=${sourceBinding.message}.`);
          this.statusLog.fail(`Repo rebind failed: ${sourceBinding.message}`);
          return;
        }
        const reboundBinding = this.runtimeBindingMetadata({
          bindingSource: "repo-folder-rebind",
          boundManifestPath: sourceBinding.source,
          hasLiveRepoHandle: true,
          sourceBindingState: "bound"
        });
        this.updateRepoRuntimeBinding(reboundBinding);
        this.applyContextResult({
          assetCount: metrics.assetCount,
          context: restoredToolState.context,
          game: sourceBinding.game,
          hostContextId: restoredToolState.hostContextId,
          paletteSwatches: metrics.paletteSwatches
        });
        this.gameSelector.setValue(sourceBinding.game.id, sourceBinding.game.name);
        this.statusLog.ok(`Repo destination selected: ${displayName}.`);
        this.statusLog.ok(`Discovered ${discovery.games.length} schema-valid game manifest${discovery.games.length === 1 ? "" : "s"}.`);
        this.statusLog.ok(`Rebound restored ${sourceBinding.game.name} toolState to ${sourceBinding.source} after repo folder selection.`);
        this.statusLog.ok(`Runtime handle rebound: ${this.runtimeBindingDetails(reboundBinding)}.`);
        return;
      }
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
    this.activeToolStateRequiresRepoHandle = false;
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
    this.statusLog.ok(`Runtime handle rebound: ${this.runtimeBindingDetails(this.runtimeBindingMetadata())}.`);
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
      const invalidBinding = this.runtimeBindingMetadata({
        bindingSource: "workspace.repo.reference",
        boundManifestPath: result.game.manifestPath,
        hasLiveRepoHandle: false,
        sourceBindingState: "invalid"
      });
      this.repoDestination.setRepoDestinationDisplayName("not selected");
      this.clearActiveWorkspace(message);
      this.statusLog.warn(`Runtime handle invalidated: ${this.runtimeBindingDetails(invalidBinding)}; reason=${repoReferenceResult.message}.`);
      this.statusLog.fail(`Workspace restore failed: ${message}`);
      return;
    }
    let restoredResult = result;
    let restoredSourceBinding = null;
    const returnHistoryContextId = this.contextService.sessionStorage.getItem(WorkspaceManagerV2App.returnHistoryContextKey()) || "";
    if (!this.activeRepoHandle && returnHistoryContextId === result.hostContextId) {
      const handleResult = await this.contextService.restoreCachedRepoHandle(repoReferenceResult.reference);
      if (handleResult.ok) {
        const acquiredBinding = this.runtimeBindingMetadata({
          bindingSource: handleResult.source,
          boundManifestPath: "",
          hasLiveRepoHandle: true,
          sourceBindingState: "repo-handle-acquired"
        });
        this.updateRepoRuntimeBinding(acquiredBinding);
        this.statusLog.ok(`Runtime handle acquired: ${this.runtimeBindingDetails(acquiredBinding)}.`);
        const discovery = await this.contextService.discoverGameManifests(handleResult.repoHandle);
        if (discovery.ok) {
          this.activeRepoHandle = handleResult.repoHandle;
          this.contextService.setDiscoveredGames(discovery.games);
          this.gameSelector.setGames(discovery.games);
          const sourceBinding = await this.contextService.bindGameManifestSourceForSave({
            context: result.context,
            game: result.game,
            repoHandle: this.activeRepoHandle
          });
          if (sourceBinding.ok) {
            restoredResult = { ...result, game: sourceBinding.game };
            restoredSourceBinding = sourceBinding;
          } else {
            const invalidBinding = this.runtimeBindingMetadata({
              bindingSource: "return-history-cache",
              boundManifestPath: result.game.manifestPath,
              hasLiveRepoHandle: true,
              sourceBindingState: "invalid"
            });
            this.updateRepoRuntimeBinding(invalidBinding);
            this.statusLog.warn(`Runtime handle invalidated: ${this.runtimeBindingDetails(invalidBinding)}; reason=${sourceBinding.message}.`);
            this.statusLog.warn(`Return from tool restore: source binding missing: ${sourceBinding.message}`);
          }
        } else {
          const invalidBinding = this.runtimeBindingMetadata({
            bindingSource: handleResult.source,
            boundManifestPath: result.game.manifestPath,
            hasLiveRepoHandle: true,
            sourceBindingState: "invalid"
          });
          this.updateRepoRuntimeBinding(invalidBinding);
          this.statusLog.warn(`Runtime handle invalidated: ${this.runtimeBindingDetails(invalidBinding)}; reason=${discovery.message}.`);
          this.statusLog.warn(`Return from tool restore: repo handle cache discovery failed: ${discovery.message}`);
        }
      } else {
        const lostBinding = this.runtimeBindingMetadata({
          bindingSource: "return-history-cache",
          boundManifestPath: result.game.manifestPath,
          hasLiveRepoHandle: false,
          sourceBindingState: "missing-live-repo-handle"
        });
        this.updateRepoRuntimeBinding(lostBinding);
        this.statusLog.warn(`Runtime handle lost: ${this.runtimeBindingDetails(lostBinding)}; reason=${handleResult.message}.`);
        this.statusLog.warn(`Return from tool restore: repo handle cache unavailable: ${handleResult.message}`);
      }
      this.contextService.sessionStorage.removeItem(WorkspaceManagerV2App.returnHistoryContextKey());
    }
    this.repoDestination.setRepoDestinationDisplayName(repoReferenceResult.reference.displayName);
    this.gameSelector.setValue(restoredResult.game.id, restoredResult.game.name);
    const requiresRepoHandle = !this.activeRepoHandle;
    this.applyContextResult(restoredResult, { requiresRepoHandle });
    if (restoredResult.assetWarning) {
      this.statusLog.info(`Warning: ${restoredResult.assetWarning}`);
    }
    this.reportToolStateHydration();
    this.statusLog.ok(`Restored repo destination from workspace.repo.reference for ${repoReferenceResult.reference.displayName}.`);
    if (requiresRepoHandle) {
      const lostBinding = this.runtimeBindingMetadata({
        bindingSource: "sessionStorage restore",
        boundManifestPath: restoredResult.game.manifestPath,
        hasLiveRepoHandle: false,
        sourceBindingState: "missing-live-repo-handle"
      });
      this.updateRepoRuntimeBinding(lostBinding);
      this.statusLog.warn(`Runtime handle lost: ${this.runtimeBindingDetails(lostBinding)}. Required action: Pick Repo Folder to rebind game.manifest.json before Save or tool launch.`);
      this.statusLog.warn(`Restored ${restoredResult.game.name} workspace from session context ${restoredResult.hostContextId} as read-only toolState context: missing live repo folder handle. Required action: Pick Repo Folder to rebind ${restoredResult.context.gameRoot}game.manifest.json before Save or tool launch.`);
    } else if (restoredSourceBinding) {
      const reboundBinding = this.runtimeBindingMetadata({
        bindingSource: "return-history-cache",
        boundManifestPath: restoredSourceBinding.source,
        hasLiveRepoHandle: true,
        sourceBindingState: "bound"
      });
      this.updateRepoRuntimeBinding(reboundBinding);
      this.statusLog.ok(`Runtime handle rebound: ${this.runtimeBindingDetails(reboundBinding)}.`);
      this.statusLog.ok(`Return from tool restore: repo selected: ${repoReferenceResult.reference.displayName}.`);
      this.statusLog.ok(`Return from tool restore: game selected: ${this.activeGame.name} (${this.activeGame.id}).`);
      this.statusLog.ok(`Return from tool restore: source binding active: ${restoredSourceBinding.source}.`);
      this.statusLog.ok(`Return from tool restore: enabled tool count: ${this.activeToolStateHydration?.hydratedToolIds?.length || 0}.`);
    }
    this.statusLog.ok(`Restored ${restoredResult.game.name} workspace from session context ${restoredResult.hostContextId}.`);
  }

  applyContextResult(result, { requiresRepoHandle = false } = {}) {
    const tools = this.contextService.workspaceLaunchableTools();
    const runtimeBinding = this.runtimeBindingMetadata({
      bindingSource: requiresRepoHandle
        ? "sessionStorage restore"
        : (this.activeRepoHandle ? "game.manifest.json" : "runtime state"),
      boundManifestPath: result.game?.manifestPath || "",
      hasLiveRepoHandle: Boolean(this.activeRepoHandle && !requiresRepoHandle),
      sourceBindingState: requiresRepoHandle
        ? "missing-live-repo-handle"
        : (this.activeRepoHandle ? "bound" : "no-live-repo-handle")
    });
    const hydration = this.contextService.hydrateEnabledToolSessions({
      context: result.context,
      game: result.game,
      runtimeBinding,
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
    this.activeToolStateRequiresRepoHandle = Boolean(requiresRepoHandle);
    this.activeToolStateHydration = hydration;
    this.activeToolStateRefresh = sessionRefresh;
    this.updateRepoRuntimeBinding(runtimeBinding);
    this.gameSelector.setSummary(this.activeToolStateRequiresRepoHandle
      ? `${result.game.name} context uses ${result.game.gameRoot} and ${result.game.assetsPath}. Pick Repo Folder to rebind game.manifest.json before Save or tool launch.`
      : `${result.game.name} context uses ${result.game.gameRoot} and ${result.game.assetsPath}.`);
    this.summary.render({ context: this.activeContext });
    this.toolTiles.render({
      assetCount,
      canLaunch: hydration.ok && !this.activeToolStateRequiresRepoHandle,
      dirtyByToolId,
      enabledToolIds: hydration.ok ? hydration.hydratedToolIds : [],
      manifestStatus: this.activeToolStateRequiresRepoHandle ? "Repo folder required" : "Schema-valid manifest",
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

  async restoreReturnFromToolState() {
    const toolId = this.lastLaunchedToolId;
    this.lastLaunchedToolId = "";
    window.sessionStorage.removeItem(WorkspaceManagerV2App.returnHistoryContextKey());
    if (!this.activeContext || !this.activeGame) {
      this.syncLifecycleControls();
      this.statusLog.warn(`Return from tool restore: ${toolId || "workspace tool"} returned without an active game/toolState context.`);
      return;
    }
    const repoReferenceResult = this.contextService.readWorkspaceRepoReference({
      expectedRepoRoot: this.activeContext.repoRoot || this.activeGame.repoRoot || ""
    });
    const repoName = this.activeRepoHandle?.name || repoReferenceResult.reference?.displayName || "not selected";
    let game = this.activeGame;
    let requiresRepoHandle = this.activeToolStateRequiresRepoHandle || !this.activeRepoHandle;
    let sourceBindingMessage = "missing live repo folder handle";
    let bindingSource = "return-navigation";
    if (this.activeRepoHandle) {
      const sourceBinding = await this.contextService.bindGameManifestSourceForSave({
        context: this.activeContext,
        game: this.activeGame,
        repoHandle: this.activeRepoHandle
      });
      if (sourceBinding.ok) {
        game = sourceBinding.game;
        requiresRepoHandle = false;
        sourceBindingMessage = sourceBinding.source;
        bindingSource = "return-navigation";
      } else {
        requiresRepoHandle = true;
        sourceBindingMessage = sourceBinding.message;
        bindingSource = "return-navigation-invalid";
      }
    }
    const metrics = this.contextSummaryMetrics(this.activeContext);
    this.applyContextResult({
      assetCount: metrics.assetCount,
      context: this.activeContext,
      game,
      hostContextId: this.activeHostContextId,
      paletteSwatches: metrics.paletteSwatches
    }, { requiresRepoHandle });
    const enabledToolCount = this.activeToolStateHydration?.hydratedToolIds?.length || 0;
    this.statusLog.ok(`Return from tool restore: repo selected: ${repoName}.`);
    this.statusLog.ok(`Return from tool restore: game selected: ${this.activeGame.name} (${this.activeGame.id}).`);
    if (requiresRepoHandle) {
      const invalidBinding = this.runtimeBindingMetadata({
        bindingSource,
        boundManifestPath: this.activeGame.manifestPath,
        hasLiveRepoHandle: Boolean(this.activeRepoHandle),
        sourceBindingState: this.activeRepoHandle ? "invalid" : "missing-live-repo-handle"
      });
      this.updateRepoRuntimeBinding(invalidBinding);
      this.statusLog.warn(`Runtime handle ${this.activeRepoHandle ? "invalidated" : "lost"}: ${this.runtimeBindingDetails(invalidBinding)}; reason=${sourceBindingMessage}.`);
      this.statusLog.warn(`Return from tool restore: source binding missing: ${sourceBindingMessage}.`);
    } else {
      const reboundBinding = this.runtimeBindingMetadata({
        bindingSource,
        boundManifestPath: sourceBindingMessage,
        hasLiveRepoHandle: true,
        sourceBindingState: "bound"
      });
      this.updateRepoRuntimeBinding(reboundBinding);
      this.statusLog.ok(`Runtime handle rebound: ${this.runtimeBindingDetails(reboundBinding)}.`);
      this.statusLog.ok(`Return from tool restore: source binding active: ${sourceBindingMessage}.`);
    }
    this.statusLog.ok(`Return from tool restore: enabled tool count: ${enabledToolCount}.`);
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
    if (this.activeToolStateRequiresRepoHandle) {
      const lostBinding = this.runtimeBindingMetadata({
        bindingSource: "launch-blocked",
        boundManifestPath: this.activeGame?.manifestPath || "",
        hasLiveRepoHandle: false,
        sourceBindingState: "missing-live-repo-handle"
      });
      this.updateRepoRuntimeBinding(lostBinding);
      this.statusLog.warn(`Runtime handle lost: ${this.runtimeBindingDetails(lostBinding)}; reason=tool launch requires a live repo folder handle.`);
      this.statusLog.fail(`Launch blocked: missing live repo folder handle for active toolState; active game source=${this.activeGame?.manifestPath || "(missing manifestPath)"}. Required action: Pick Repo Folder to rebind game.manifest.json before tool launch.`);
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
    this.lastLaunchedToolId = toolId;
    this.replaceWorkspaceHistoryEntry(hostContextId);
    window.sessionStorage.setItem(WorkspaceManagerV2App.returnHistoryContextKey(), hostContextId);
    this.statusLog.ok(`Stored Workspace Manager V2 schema-valid manifest ${hostContextId} for ${toolId}.`);
    this.contextService.launchTool(toolId, hostContextId, { workspaceMode: this.activeWorkspaceMode });
  }

  replaceWorkspaceHistoryEntry(hostContextId) {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("hostContextId", hostContextId);
      if (this.activeWorkspaceMode === "uat") {
        url.searchParams.set("workspace", "uat");
      }
      window.history.replaceState({ workspaceManagerV2HostContextId: hostContextId }, "", url.href);
    } catch (error) {
      this.statusLog.warn(`Return from tool restore: unable to persist workspace history entry: ${error.message}`);
    }
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
        const invalidBinding = this.runtimeBindingMetadata({
          bindingSource: "save-source-rebind",
          boundManifestPath: result.game.manifestPath,
          hasLiveRepoHandle: Boolean(this.activeRepoHandle),
          sourceBindingState: "invalid"
        });
        this.updateRepoRuntimeBinding(invalidBinding);
        this.statusLog.warn(`Runtime handle invalidated: ${this.runtimeBindingDetails(invalidBinding)}; reason=${sourceBinding.message}.`);
        return sourceBinding;
      }
      const reboundBinding = this.runtimeBindingMetadata({
        bindingSource: "save-source-rebind",
        boundManifestPath: sourceBinding.source,
        hasLiveRepoHandle: true,
        sourceBindingState: "bound"
      });
      this.updateRepoRuntimeBinding(reboundBinding);
      this.statusLog.info(`Save source rebound to ${sourceBinding.source} for ${result.game.id}.`);
      this.statusLog.ok(`Runtime handle rebound: ${this.runtimeBindingDetails(reboundBinding)}.`);
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
    if (this.activeToolStateRequiresRepoHandle || !this.activeRepoHandle) {
      this.syncLifecycleControls();
      const lostBinding = this.runtimeBindingMetadata({
        bindingSource: "save-blocked",
        boundManifestPath: this.activeGame?.manifestPath || "",
        hasLiveRepoHandle: false,
        sourceBindingState: "missing-live-repo-handle"
      });
      this.updateRepoRuntimeBinding(lostBinding);
      this.statusLog.warn(`Runtime handle lost: ${this.runtimeBindingDetails(lostBinding)}; reason=Save requires a live repo folder handle.`);
      this.statusLog.fail(`Save blocked: missing live repo folder handle for active toolState; active game source=${this.activeGame?.manifestPath || "(missing manifestPath)"}; context.gameId=${this.activeContext?.gameId || "(missing gameId)"}; context.gameRoot=${this.activeContext?.gameRoot || "(missing gameRoot)"}. Required action: Pick Repo Folder to rebind game.manifest.json before Save.`);
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
      const invalidBinding = this.runtimeBindingMetadata({
        bindingSource: "save-write",
        boundManifestPath: this.activeGame?.manifestPath || "",
        hasLiveRepoHandle: Boolean(this.activeRepoHandle),
        sourceBindingState: "invalid"
      });
      this.updateRepoRuntimeBinding(invalidBinding);
      this.statusLog.warn(`Runtime handle invalidated: ${this.runtimeBindingDetails(invalidBinding)}; reason=${writeResult.message}.`);
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
    this.statusLog.ok(`Runtime handle rebound: ${this.runtimeBindingDetails(this.runtimeBindingMetadata({
      bindingSource: "save-write",
      boundManifestPath: writeResult.source,
      hasLiveRepoHandle: true,
      sourceBindingState: "bound"
    }))}.`);
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
    const lostBinding = this.runtimeBindingMetadata({
      bindingSource: "close-workspace",
      boundManifestPath: this.activeGame?.manifestPath || "",
      hasLiveRepoHandle: false,
      sourceBindingState: "closed"
    });
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
    this.activeToolStateRequiresRepoHandle = false;
    this.repoDestination.setRepoDestinationDisplayName("not selected");
    this.clearActiveWorkspace();
    this.statusLog.info(`Runtime handle lost: ${this.runtimeBindingDetails(lostBinding)}.`);
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
    const lostBinding = this.runtimeBindingMetadata({
      bindingSource: "cancel-workspace",
      boundManifestPath: this.activeGame?.manifestPath || "",
      hasLiveRepoHandle: false,
      sourceBindingState: "canceled"
    });
    this.activeRepoHandle = null;
    this.activeToolStateRequiresRepoHandle = false;
    this.repoDestination.setRepoDestinationDisplayName("not selected");
    this.clearActiveWorkspace();
    this.statusLog.info(`Runtime handle lost: ${this.runtimeBindingDetails(lostBinding)}.`);
    this.statusLog.ok(`Canceled Workspace Manager V2 toolState. Removed ${cancelResult.removed.length} workspace toolState key${cancelResult.removed.length === 1 ? "" : "s"}.`);
  }

  async seedTemporaryUatManifest() {
    this.activeRepoHandle = null;
    this.activeToolStateRequiresRepoHandle = false;
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
