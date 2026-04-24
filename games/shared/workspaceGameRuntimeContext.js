function readContextFromWindow() {
  if (typeof window === "undefined") {
    return null;
  }
  const context = window.__WORKSPACE_GAME_CONTEXT__;
  return context && typeof context === "object" ? context : null;
}

function cloneAssetCatalogEntries(value) {
  const source = value && typeof value === "object" ? value : {};
  const cloned = {};
  Object.entries(source).forEach(([assetId, entry]) => {
    const safeAssetId = typeof assetId === "string" ? assetId.trim() : "";
    if (!safeAssetId || !entry || typeof entry !== "object") {
      return;
    }
    const path = typeof entry.path === "string" ? entry.path.trim() : "";
    if (!path) {
      return;
    }
    cloned[safeAssetId] = {
      path,
      kind: typeof entry.kind === "string" ? entry.kind.trim() : "",
      source: typeof entry.source === "string" ? entry.source.trim() : ""
    };
  });
  return cloned;
}

export function getWorkspaceGameRuntimeContext() {
  const context = readContextFromWindow();
  if (!context) {
    return null;
  }
  const game = context?.state?.game;
  if (!game || typeof game !== "object") {
    return null;
  }
  return {
    contextId: typeof context.contextId === "string" ? context.contextId : "",
    requestedAt: typeof context.requestedAt === "string" ? context.requestedAt : "",
    source: typeof context.source === "string" ? context.source : "",
    game: {
      id: typeof game.id === "string" ? game.id : "",
      title: typeof game.title === "string" ? game.title : "",
      href: typeof game.href === "string" ? game.href : "",
      level: typeof game.level === "string" ? game.level : "",
      status: typeof game.status === "string" ? game.status : "",
      description: typeof game.description === "string" ? game.description : "",
      classValues: Array.isArray(game.classValues) ? game.classValues.slice() : [],
      tags: Array.isArray(game.tags) ? game.tags.slice() : [],
      sampleTrack: game.sampleTrack === true,
      debugShowcase: game.debugShowcase === true,
      requiresService: game.requiresService === true,
      hostedAt: typeof game.hostedAt === "string" ? game.hostedAt : "",
      assetCatalogPath: typeof game.assetCatalogPath === "string" ? game.assetCatalogPath : "",
      assetCatalog: cloneAssetCatalogEntries(game.assetCatalog)
    }
  };
}
