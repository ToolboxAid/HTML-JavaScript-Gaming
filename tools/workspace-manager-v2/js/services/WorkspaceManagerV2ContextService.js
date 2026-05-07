const ASSET_MANAGER_TOOL_ID = "asset-manager-v2";
const HOST_CONTEXT_STORAGE_KEY = "workspace-manager-v2-active-host-context-id";

const GAME_OPTIONS = Object.freeze([
  Object.freeze({
    id: "Asteroids",
    name: "Asteroids",
    manifestPath: "/games/Asteroids/game.manifest.json"
  }),
  Object.freeze({
    id: "GravityWell",
    name: "Gravity Well",
    manifestPath: "/games/GravityWell/game.manifest.json"
  }),
  Object.freeze({
    id: "Pong",
    name: "Pong",
    manifestPath: "/games/Pong/game.manifest.json"
  })
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeGameRoot(gameId) {
  const safeGameId = String(gameId || "").trim().replace(/[\\/]+/g, "-");
  return safeGameId ? `games/${safeGameId}/` : "";
}

function makeHostContextId() {
  return `workspace-manager-v2-${Date.now().toString(36)}`;
}

function readPaletteFromManifest(manifest) {
  const palettePayload = manifest?.tools?.["palette-browser"];
  const palette = isPlainObject(palettePayload?.palette) ? palettePayload.palette : palettePayload;
  const swatches = Array.isArray(palette?.swatches) ? palette.swatches : [];
  return {
    name: String(palette?.name || palettePayload?.name || "Workspace Palette").trim(),
    swatches: clone(swatches)
  };
}

export class WorkspaceManagerV2ContextService {
  constructor({
    fetchRef = window.fetch?.bind(window),
    locationRef = window.location,
    sessionStorageRef = window.sessionStorage,
    windowRef = window
  } = {}) {
    this.fetchRef = fetchRef;
    this.location = locationRef;
    this.sessionStorage = sessionStorageRef;
    this.window = windowRef;
  }

  games() {
    return GAME_OPTIONS.map((game) => ({ ...game }));
  }

  async buildContextForGame(gameId) {
    const game = this.games().find((entry) => entry.id === gameId);
    if (!game) {
      return { ok: false, message: "Select a valid game workspace." };
    }
    const manifestResult = await this.fetchGameManifest(game);
    if (!manifestResult.ok) {
      return manifestResult;
    }
    const palette = readPaletteFromManifest(manifestResult.manifest);
    if (!palette.swatches.length) {
      return { ok: false, message: `${game.name} does not expose an active palette in its game manifest.` };
    }
    const gameRoot = normalizeGameRoot(game.id);
    const assetsPath = `${gameRoot}assets`;
    const workspaceManifest = this.buildWorkspaceManifest({
      assetsPath,
      game,
      gameRoot,
      palette
    });
    const context = {
      version: "workspace-manager-v2",
      toolId: ASSET_MANAGER_TOOL_ID,
      gameId: game.id,
      gameRoot,
      assetsPath,
      activePalette: {
        name: palette.name,
        source: "workspace-manager-v2",
        swatches: clone(palette.swatches)
      },
      workspaceManifest
    };
    return {
      ok: true,
      context,
      game: {
        ...game,
        assetsPath,
        gameRoot,
        paletteName: palette.name
      },
      paletteSwatches: clone(palette.swatches)
    };
  }

  async fetchGameManifest(game) {
    if (typeof this.fetchRef !== "function") {
      return { ok: false, message: "Fetch API is unavailable; Workspace Manager V2 cannot load game manifests." };
    }
    try {
      const response = await this.fetchRef(game.manifestPath, { cache: "no-store" });
      if (!response.ok) {
        return { ok: false, message: `Unable to load ${game.manifestPath}: ${response.status}` };
      }
      const manifest = await response.json();
      if (!isPlainObject(manifest)) {
        return { ok: false, message: `${game.manifestPath} did not return a manifest object.` };
      }
      return { ok: true, manifest };
    } catch (error) {
      return { ok: false, message: `Unable to load ${game.manifestPath}: ${error.message}` };
    }
  }

  buildWorkspaceManifest({ assetsPath, game, gameRoot, palette }) {
    return {
      documentKind: "workspace-manifest",
      schema: "html-js-gaming.project",
      version: 1,
      id: `workspace-manager-v2-${game.id}`,
      name: `${game.name} Workspace Manager V2 Context`,
      gameId: game.id,
      workspaceMetadata: {
        gameId: game.id,
        gameRoot,
        assetsPath,
        owner: "workspace-manager-v2"
      },
      tools: {
        "palette-browser": {
          schema: "html-js-gaming.palette",
          version: 1,
          name: palette.name,
          source: "workspace-manager-v2",
          swatches: clone(palette.swatches)
        },
        "asset-browser": {
          schema: "html-js-gaming.tool.asset-browser",
          version: 1,
          name: "Asset Browser",
          source: "workspace-manager-v2",
          assets: {}
        }
      }
    };
  }

  persistContext(context) {
    const hostContextId = makeHostContextId();
    this.sessionStorage.setItem(hostContextId, JSON.stringify(context));
    this.sessionStorage.setItem(HOST_CONTEXT_STORAGE_KEY, hostContextId);
    return hostContextId;
  }

  assetManagerLaunchUrl(hostContextId) {
    const url = new URL("../asset-manager-v2/index.html", this.location.href);
    url.searchParams.set("launch", "workspace");
    url.searchParams.set("fromTool", "workspace-manager-v2");
    url.searchParams.set("hostContextId", hostContextId);
    return url.href;
  }

  launchAssetManager(hostContextId) {
    this.window.location.href = this.assetManagerLaunchUrl(hostContextId);
  }
}
