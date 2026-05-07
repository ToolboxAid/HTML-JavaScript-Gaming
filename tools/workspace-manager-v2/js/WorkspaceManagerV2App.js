export class WorkspaceManagerV2App {
  constructor({
    accordions,
    contextService,
    gameSelector,
    menu,
    statusLog,
    summary,
    toolTiles
  }) {
    this.accordions = accordions;
    this.contextService = contextService;
    this.gameSelector = gameSelector;
    this.menu = menu;
    this.statusLog = statusLog;
    this.summary = summary;
    this.toolTiles = toolTiles;
    this.activeContext = null;
    this.activeGame = null;
    this.activeHostContextId = null;
    this.activeWorkspaceMode = this.contextService.isUatMode() ? "uat" : "";
  }

  start() {
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
      onLoadAsteroids: () => {
        void this.selectGame("Asteroids");
      },
      onSeedUat: () => {
        void this.seedTemporaryUatManifest();
      }
    });
    this.toolTiles.mount({
      onLaunchTool: (toolId) => {
        void this.launchTool(toolId);
      },
      tools: this.contextService.workspaceLaunchableTools()
    });
    this.summary.clear();
    this.menu.setExportEnabled(false);
    this.toolTiles.renderEmpty();
    this.statusLog.ok("Workspace Manager V2 ready. Select, import, or seed a game workspace to create a schema-valid manifest.");
    void this.restoreWorkspaceFromSession();
  }

  async selectGame(gameId) {
    this.activeContext = null;
    this.activeGame = null;
    this.activeHostContextId = null;
    this.activeWorkspaceMode = this.contextService.isUatMode() ? "uat" : "";
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
    this.statusLog.ok(`Loaded ${result.game.name} from ${result.game.manifestPath} with ${result.paletteSwatches.length} active palette colors and ${result.assetCount} managed assets.`);
    this.statusLog.ok("Asset Manager V2 production launch context is session/state based only.");
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
    this.gameSelector.setValue(result.game.id);
    this.applyContextResult(result);
    if (result.assetWarning) {
      this.statusLog.info(`Warning: ${result.assetWarning}`);
    }
    this.statusLog.ok(`Restored ${result.game.name} workspace from session context ${result.hostContextId}.`);
  }

  applyContextResult(result) {
    this.activeContext = result.context;
    this.activeGame = result.game;
    this.activeHostContextId = result.hostContextId || null;
    this.activeWorkspaceMode = this.contextService.isUatMode() ? "uat" : "";
    this.gameSelector.setSummary(`${result.game.name} context uses ${result.game.gameRoot} and ${result.game.assetsPath}.`);
    this.summary.render({
      assetCount: result.assetCount,
      context: result.context,
      game: result.game,
      paletteSwatches: result.paletteSwatches
    });
    this.toolTiles.render({
      assetCount: result.assetCount,
      canLaunch: true,
      manifestStatus: "Schema-valid manifest",
      paletteSwatchCount: result.paletteSwatches.length
    });
    this.menu.setExportEnabled(true);
  }

  hasLaunchReadyContext() {
    return Boolean(this.activeContext
      && this.activeGame
      && this.activeContext.tools?.["palette-manager-v2"]?.swatches?.length);
  }

  async launchTool(toolId) {
    if (!this.hasLaunchReadyContext()) {
      this.statusLog.fail("Launch blocked: active game context and palette are required.");
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
      this.gameSelector.setValue(result.game.id);
      this.applyContextResult({ ...result, hostContextId });
      if (result.assetWarning) {
        this.statusLog.info(`Warning: ${result.assetWarning}`);
      }
      this.statusLog.ok(`Imported schema-valid Workspace Manager V2 manifest ${result.context.id}.`);
    } catch (error) {
      this.statusLog.fail(`Import Manifest failed: ${error.message}`);
    }
  }

  async seedTemporaryUatManifest() {
    const result = await this.contextService.buildTemporaryUatContext();
    if (!result.ok) {
      this.statusLog.fail(`UAT seed failed: ${result.message}`);
      return;
    }
    const hostContextId = this.contextService.persistContext(result.context);
    this.gameSelector.setValue(result.game.id);
    this.applyContextResult({ ...result, hostContextId });
    if (result.assetWarning) {
      this.statusLog.info(`Warning: ${result.assetWarning}`);
    }
    this.statusLog.ok(`Loaded UAT Workspace Manager V2 manifest ${result.context.id} from /games/_template/workspace-manager-v2-UAT.manifest.json.`);
  }
}
