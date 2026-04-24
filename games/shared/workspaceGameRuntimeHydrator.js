import { getWorkspaceGameRuntimeContext } from "/games/shared/workspaceGameRuntimeContext.js";

function normalizeGameId(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function hydrateWorkspaceGameRuntime(gameId) {
  const expectedGameId = normalizeGameId(gameId);
  if (typeof window === "undefined" || !expectedGameId) {
    return null;
  }

  const context = getWorkspaceGameRuntimeContext();
  if (!context || !context.game) {
    return null;
  }

  const contextGameId = normalizeGameId(context.game.id);
  if (!contextGameId || contextGameId.toLowerCase() !== expectedGameId.toLowerCase()) {
    return null;
  }

  const runtime = {
    schema: "games.workspace-runtime/1",
    contextId: context.contextId,
    requestedAt: context.requestedAt,
    source: context.source,
    game: {
      id: context.game.id,
      title: context.game.title,
      href: context.game.href,
      level: context.game.level,
      status: context.game.status,
      description: context.game.description,
      classValues: context.game.classValues.slice(),
      tags: context.game.tags.slice(),
      sampleTrack: context.game.sampleTrack === true,
      debugShowcase: context.game.debugShowcase === true,
      requiresService: context.game.requiresService === true,
      hostedAt: context.game.hostedAt
    }
  };

  Object.freeze(runtime.game.classValues);
  Object.freeze(runtime.game.tags);
  Object.freeze(runtime.game);
  Object.freeze(runtime);

  window.__WORKSPACE_GAME_RUNTIME__ = runtime;
  return runtime;
}
