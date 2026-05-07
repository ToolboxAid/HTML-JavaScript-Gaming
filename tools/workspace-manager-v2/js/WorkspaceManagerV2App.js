export class WorkspaceManagerV2App {
  constructor({
    accordions,
    contextService,
    gameSelector,
    launchControl,
    statusLog,
    summary
  }) {
    this.accordions = accordions;
    this.contextService = contextService;
    this.gameSelector = gameSelector;
    this.launchControl = launchControl;
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
    this.summary.clear();
    this.launchControl.setEnabled(false);
    this.statusLog.ok("Workspace Manager V2 ready. Select a game workspace to create a schema-valid manifest.");
  }

  async selectGame(gameId) {
    this.activeContext = null;
    this.activeGame = null;
    this.launchControl.setEnabled(false);
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

    this.activeContext = result.context;
    this.activeGame = result.game;
    this.gameSelector.setSummary(`${result.game.name} context uses ${result.game.gameRoot} and ${result.game.assetsPath}.`);
    this.summary.render({
      context: result.context,
      game: result.game,
      paletteSwatches: result.paletteSwatches
    });
    this.launchControl.setEnabled(true);
    this.statusLog.ok(`Loaded ${result.game.name} with ${result.paletteSwatches.length} active palette colors.`);
    this.statusLog.ok("Asset Manager V2 production launch context is session/state based only.");
  }

  launchAssetManager() {
    if (!this.activeContext || !this.activeGame || !this.activeContext.tools?.["palette-browser"]?.swatches?.length) {
      this.statusLog.fail("Launch blocked: active game context and palette are required.");
      return;
    }
    const hostContextId = this.contextService.persistContext(this.activeContext);
    this.statusLog.ok(`Stored Workspace Manager V2 schema-valid manifest ${hostContextId}.`);
    this.contextService.launchAssetManager(hostContextId);
  }
}
