import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WorkspaceManagerV2ContextService } from "../../tools/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const objectVectorToolId = "object-vector-studio-v2";
const objectVectorSessionKey = "workspace.tools.object-vector-studio-v2";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readJson(repoRelativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, repoRelativePath), "utf8"));
}

function createJsonResponse(payload) {
  return {
    ok: true,
    status: 200,
    async json() {
      return payload;
    }
  };
}

function createLocalFetch() {
  return async (url) => {
    const rawPath = url instanceof URL && url.protocol === "file:"
      ? fileURLToPath(url)
      : path.join(repoRoot, String(url).replace(/^\/+/, ""));
    return createJsonResponse(JSON.parse(fs.readFileSync(rawPath, "utf8")));
  };
}

function createSessionStorage() {
  const entries = new Map();
  return {
    getItem(key) {
      return entries.has(key) ? entries.get(key) : null;
    },
    removeItem(key) {
      entries.delete(key);
    },
    setItem(key, value) {
      entries.set(key, String(value));
    }
  };
}

function createService(sessionStorage) {
  const locationRef = new URL("http://127.0.0.1/tools/workspace-manager-v2/index.html");
  return new WorkspaceManagerV2ContextService({
    fetchRef: createLocalFetch(),
    locationRef,
    sessionStorageRef: sessionStorage,
    windowRef: {
      indexedDB: null,
      location: locationRef,
      sessionStorage
    }
  });
}

function createGame(manifest) {
  return {
    assetsPath: "games/Asteroids/assets",
    folder: "Asteroids",
    gameRoot: "games/Asteroids/",
    id: "Asteroids",
    manifest,
    manifestKind: "game-manifest",
    manifestPath: "/games/Asteroids/game.manifest.json",
    name: "Asteroids",
    repoPath: repoRoot,
    repoRoot: "HTML-JavaScript-Gaming",
    tools: clone(manifest.tools)
  };
}

function addLegacyVectorMaps(payload) {
  payload.vectorMaps = {
    schema: "html-js-gaming.legacy-vector-maps",
    version: 1,
    name: "Deprecated Vector Maps",
    shapes: []
  };
  payload.unexpectedLegacyField = true;
}

function assertObjectVectorPayloadShape(payload) {
  assert.deepEqual(Object.keys(payload).sort(), ["name", "objects", "toolId", "version"]);
  assert.equal(Object.hasOwn(payload, "vectorMaps"), false);
  assert.equal(Object.hasOwn(payload, "unexpectedLegacyField"), false);
  assert.equal(Array.isArray(payload.objects), true);
}

export async function run() {
  const sessionStorage = createSessionStorage();
  const service = createService(sessionStorage);
  const asteroidsManifest = readJson("games/Asteroids/game.manifest.json");
  const legacyManifest = clone(asteroidsManifest);
  addLegacyVectorMaps(legacyManifest.tools[objectVectorToolId]);
  const game = createGame(legacyManifest);

  const generatedWorkspaceManifest = service.workspaceManifestFromGameManifest(game);
  assertObjectVectorPayloadShape(generatedWorkspaceManifest.tools[objectVectorToolId]);
  assert.equal(JSON.stringify(generatedWorkspaceManifest).includes("vectorMaps"), false);

  service.setDiscoveredGames([game]);
  const importedWorkspaceManifest = clone(generatedWorkspaceManifest);
  addLegacyVectorMaps(importedWorkspaceManifest.tools[objectVectorToolId]);
  const importedResult = await service.buildContextFromManifest(importedWorkspaceManifest, "legacy workspace import");
  assert.equal(importedResult.ok, true, importedResult.message);
  assertObjectVectorPayloadShape(importedResult.context.tools[objectVectorToolId]);

  const contextResult = await service.contextResultFromManifest(game, generatedWorkspaceManifest, "generated legacy workspace");
  assert.equal(contextResult.ok, true, contextResult.message);
  const tools = service.workspaceLaunchableTools();
  const hydration = service.hydrateEnabledToolSessions({ context: contextResult.context, game, tools });
  assert.equal(hydration.ok, true, hydration.message);

  const staleSession = JSON.parse(sessionStorage.getItem(objectVectorSessionKey));
  addLegacyVectorMaps(staleSession.data);
  sessionStorage.setItem(objectVectorSessionKey, JSON.stringify(staleSession));
  const hydratedStaleSession = service.hydrateEnabledToolSessions({ context: contextResult.context, game, tools });
  assert.equal(hydratedStaleSession.ok, true, hydratedStaleSession.message);
  assertObjectVectorPayloadShape(JSON.parse(sessionStorage.getItem(objectVectorSessionKey)).data);

  const refreshedContext = service.refreshContextFromToolSessions({ context: contextResult.context, tools }).context;
  assertObjectVectorPayloadShape(refreshedContext.tools[objectVectorToolId]);

  const launchContext = clone(contextResult.context);
  addLegacyVectorMaps(launchContext.tools[objectVectorToolId]);
  const hostContextId = service.persistContext(launchContext);
  assertObjectVectorPayloadShape(JSON.parse(sessionStorage.getItem(hostContextId)).tools[objectVectorToolId]);
}
