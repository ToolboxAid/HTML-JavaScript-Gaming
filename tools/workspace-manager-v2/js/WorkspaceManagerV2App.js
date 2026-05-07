export class WorkspaceManagerV2App {
  constructor({
    accordions,
    contextService,
    gameSelector,
    launchControl,
    saveControl,
    statusLog,
    summary
  }) {
    this.accordions = accordions;
    this.contextService = contextService;
    this.gameSelector = gameSelector;
    this.launchControl = launchControl;
    this.saveControl = saveControl;
    this.statusLog = statusLog;
    this.summary = summary;
    this.activeContext = null;
    this.activeGame = null;
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
    this.launchControl.mount({
      onLaunch: () => this.launchAssetManager()
    });
    this.saveControl.mount({
      onLaunch: () => {
        void this.saveWorkspaceManifest();
      }
    });
    this.summary.clear();
    this.launchControl.setEnabled(false);
    this.saveControl.setEnabled(false);
    this.statusLog.ok("Workspace Manager V2 ready. Select a game workspace to create a schema-valid manifest.");
    void this.restoreWorkspaceFromSession();
  }

  async selectGame(gameId) {
    this.activeContext = null;
    this.activeGame = null;
    this.launchControl.setEnabled(false);
    this.saveControl.setEnabled(false);
    this.summary.clear();

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
    this.statusLog.ok(`Restored ${result.game.name} workspace from session context ${result.hostContextId}.`);
  }

  applyContextResult(result) {
    this.activeContext = result.context;
    this.activeGame = result.game;
    this.gameSelector.setSummary(`${result.game.name} context uses ${result.game.gameRoot} and ${result.game.assetsPath}.`);
    this.summary.render({
      assetCount: result.assetCount,
      context: result.context,
      game: result.game,
      paletteSwatches: result.paletteSwatches
    });
    this.launchControl.setEnabled(true);
    this.saveControl.setEnabled(true);
  }

  hasLaunchReadyContext() {
    return Boolean(this.activeContext
      && this.activeGame
      && this.activeContext.tools?.["palette-manager-v2"]?.swatches?.length);
  }

  async launchAssetManager() {
    if (!this.hasLaunchReadyContext()) {
      this.statusLog.fail("Launch blocked: active game context and palette are required.");
      return;
    }
    const validation = await this.contextService.validateGeneratedManifest(this.activeContext);
    if (!validation.ok) {
      this.statusLog.fail(`Launch blocked: ${validation.message}`);
      return;
    }
    const hostContextId = this.contextService.persistContext(this.activeContext);
    this.statusLog.ok(`Stored Workspace Manager V2 schema-valid manifest ${hostContextId}.`);
    this.contextService.launchAssetManager(hostContextId);
  }

  async saveWorkspaceManifest() {
    if (!this.hasLaunchReadyContext()) {
      this.statusLog.fail("Save blocked: active game context and palette are required.");
      return;
    }
    const validation = await this.contextService.validateGeneratedManifest(this.activeContext);
    if (!validation.ok) {
      this.statusLog.fail(`Save blocked: ${validation.message}`);
      return;
    }
    const json = JSON.stringify(this.activeContext, null, 2);
    const BlobCtor = window.Blob;
    const urlApi = window.URL || window.webkitURL;
    if (typeof BlobCtor !== "function" || !urlApi?.createObjectURL) {
      this.statusLog.fail("Save blocked: browser download APIs are unavailable.");
      return;
    }
    const blob = new BlobCtor([json], { type: "application/json" });
    const url = urlApi.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = `${this.activeContext.id}.workspace.manifest.json`;
    link.rel = "noopener";
    window.document.body.append(link);
    link.click();
    link.remove();
    urlApi.revokeObjectURL(url);
    this.statusLog.ok(`Saved schema-valid Workspace Manager V2 manifest ${this.activeContext.id}.`);
  }
}
