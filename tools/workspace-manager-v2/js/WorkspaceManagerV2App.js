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
    this.activeSessionHydration = null;
  }

  start() {
    if (!this.contextService.hasExplicitHostContextId()) {
      this.contextService.clearWorkspaceSessionHydration();
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
      onExportManifest: () => {
        void this.exportWorkspaceManifest();
      },
      onImportManifest: (file) => {
        void this.importWorkspaceManifest(file);
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
    this.menu.setExportEnabled(false);
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
    this.activeSessionHydration = null;
    this.contextService.clearWorkspaceSessionHydration();
    this.contextService.clearDiscoveredGames();
    this.gameSelector.clear();
    this.gameSelector.setSummary(summaryText);
    this.menu.setExportEnabled(false);
    this.toolTiles.renderEmpty();
    this.summary.clear();
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
    this.activeSessionHydration = null;
    this.contextService.clearToolSessionHydration();
    this.menu.setExportEnabled(false);
    this.toolTiles.renderEmpty();
    this.summary.clear();
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
    this.reportSessionHydration();
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
    this.reportSessionHydration();
    this.statusLog.ok(`Restored repo destination from workspace.repo.reference for ${repoReferenceResult.reference.displayName}.`);
    this.statusLog.ok(`Restored ${result.game.name} workspace from session context ${result.hostContextId}.`);
  }

  applyContextResult(result) {
    const hydration = this.contextService.hydrateEnabledToolSessions({
      context: result.context,
      game: result.game,
      tools: this.contextService.workspaceLaunchableTools()
    });
    this.activeContext = result.context;
    this.activeGame = result.game;
    this.activeHostContextId = result.hostContextId || null;
    this.activeWorkspaceMode = this.contextService.isUatMode() ? "uat" : "";
    this.activeSessionHydration = hydration;
    this.gameSelector.setSummary(`${result.game.name} context uses ${result.game.gameRoot} and ${result.game.assetsPath}.`);
    this.summary.render({ context: result.context });
    this.toolTiles.render({
      assetCount: result.assetCount,
      canLaunch: hydration.ok,
      enabledToolIds: hydration.ok ? hydration.hydratedToolIds : [],
      manifestStatus: "Schema-valid manifest",
      paletteSwatchCount: result.paletteSwatches.length
    });
    this.menu.setExportEnabled(hydration.ok);
  }

  reportSessionHydration() {
    if (!this.activeSessionHydration) {
      return;
    }
    if (!this.activeSessionHydration.ok) {
      this.statusLog.fail(`Session hydration failed: ${this.activeSessionHydration.message}`);
      return;
    }
    this.statusLog.ok(`Hydrated workspace session for ${this.activeSessionHydration.hydratedToolIds.join(", ")}.`);
    (this.activeSessionHydration.skippedTools || []).forEach((tool) => {
      this.statusLog.info(`Skipped workspace session hydration for ${tool.toolId}: ${tool.reason}.`);
    });
  }

  hasLaunchReadyContext() {
    return Boolean(this.activeContext
      && this.activeGame
      && this.activeSessionHydration?.ok
      && this.activeContext.tools?.["palette-manager-v2"]?.swatches?.length);
  }

  async launchTool(toolId) {
    if (!this.hasLaunchReadyContext()) {
      this.statusLog.fail("Launch blocked: active game context and palette are required.");
      return;
    }
    if (!this.activeSessionHydration.hydratedToolIds.includes(toolId)) {
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
    if (!this.activeHostContextId) {
      return { ok: true, context: this.activeContext };
    }
    const result = await this.contextService.restorePersistedContextById(this.activeHostContextId);
    if (!result.ok) {
      return { ok: false, message: `Unable to refresh Workspace Manager V2 session manifest ${this.activeHostContextId}: ${result.message}` };
    }
    if (result.game.id !== this.activeGame.id) {
      return { ok: false, message: `Stored session context is for ${result.game.id}, not ${this.activeGame.id}.` };
    }
    this.applyContextResult(result);
    if (result.assetWarning) {
      this.statusLog.info(`Warning: ${result.assetWarning}`);
    }
    return { ok: true, context: result.context };
  }

  async exportWorkspaceManifest() {
    if (!this.hasLaunchReadyContext()) {
      this.statusLog.fail("Export blocked: active game context and palette are required.");
      return;
    }
    const saveContextResult = await this.contextForSave();
    if (!saveContextResult.ok) {
      this.statusLog.fail(`Export blocked: ${saveContextResult.message}`);
      return;
    }
    const context = saveContextResult.context;
    const validation = await this.contextService.validateGeneratedManifest(context);
    if (!validation.ok) {
      this.statusLog.fail(`Export blocked: ${validation.message}`);
      return;
    }
    const json = JSON.stringify(context, null, 2);
    const BlobCtor = window.Blob;
    const urlApi = window.URL || window.webkitURL;
    if (typeof BlobCtor !== "function" || !urlApi?.createObjectURL) {
      this.statusLog.fail("Export blocked: browser download APIs are unavailable.");
      return;
    }
    const blob = new BlobCtor([json], { type: "application/json" });
    const url = urlApi.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = `${context.id}.workspace.manifest.json`;
    link.rel = "noopener";
    window.document.body.append(link);
    link.click();
    link.remove();
    urlApi.revokeObjectURL(url);
    this.statusLog.ok(`Exported schema-valid Workspace Manager V2 manifest ${context.id}.`);
  }

  async importWorkspaceManifest(file) {
    if (!file) {
      this.statusLog.fail("Import Manifest failed: no manifest file was selected.");
      return;
    }
    try {
      const manifest = JSON.parse(await file.text());
      const result = await this.contextService.buildContextFromManifest(manifest, file.name || "imported manifest");
      if (!result.ok) {
        this.statusLog.fail(`Import Manifest failed: ${result.message}`);
        return;
      }
      const hostContextId = this.contextService.persistContext(result.context);
      this.gameSelector.setValue(result.game.id, result.game.name);
      this.applyContextResult({ ...result, hostContextId });
      if (result.assetWarning) {
        this.statusLog.info(`Warning: ${result.assetWarning}`);
      }
      if (result.boundaryContract) {
        this.statusLog.ok(result.boundaryContract);
      }
      this.reportSessionHydration();
      this.statusLog.ok(`Imported schema-valid Workspace Manager V2 manifest ${result.context.id}.`);
    } catch (error) {
      this.statusLog.fail(`Import Manifest failed: ${error.message}`);
    }
  }

  async seedTemporaryUatManifest() {
    this.activeRepoHandle = null;
    this.contextService.clearWorkspaceSessionHydration();
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
    this.reportSessionHydration();
    this.statusLog.ok(`Loaded UAT Workspace Manager V2 manifest ${result.context.id} from /games/_template/workspace-manager-v2-UAT.manifest.json.`);
  }
}
