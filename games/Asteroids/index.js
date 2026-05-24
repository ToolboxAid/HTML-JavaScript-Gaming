import { attractFlow } from "./flow/attract.js";
import { introFlow } from "./flow/intro.js";
import { highscoreFlow } from "./flow/highscore.js";
import { createAsteroidsShowcaseDebugPlugin } from "./debug/asteroidsShowcaseDebug.js";
import Engine from "/src/engine/core/Engine.js";
import InputService from "/src/engine/input/InputService.js";
import { inputMapFromManifest } from "/src/engine/input/InputMappingManifest.js";
import ObjectVectorRuntimeAssetService from '/src/engine/rendering/ObjectVectorRuntimeAssetService.js';
import { Theme } from "/src/engine/theme/Theme.js";
import { ThemeTokens } from "/src/engine/theme/ThemeTokens.js";
import { resolveDebugConfig } from "/src/shared/debug/config.js";
import { createNoopDevConsoleIntegration } from "/src/shared/debug/noopDevConsoleIntegration.js";
import { asPositiveInteger } from "/src/shared/number/numbers.js";
import AsteroidsGameScene from "./game/AsteroidsGameScene.js";
import { loadAsteroidsObjectGeometryFromManifest } from "./game/asteroidsObjectGeometryManifest.js";
import { preloadGameManifestAssets } from "../shared/gameManifestAssets.js";

export const asteroidFlow = Object.freeze({
  attract: attractFlow,
  intro: introFlow,
  highscore: highscoreFlow
});
const theme = new Theme(ThemeTokens);
const BOOT_TRACE_PREFIX = "Asteroids";
const ASTEROIDS_MANIFEST_PATH = "/games/Asteroids/game.manifest.json";
const ASTEROIDS_DEBUG_STORAGE_KEY = "toolbox.sample.asteroids.debug.enabled";

function traceBoot(stage, details = null) {
  if (details === null) {
    console.info(`${BOOT_TRACE_PREFIX} ${stage}`);
  } else {
    console.info(`${BOOT_TRACE_PREFIX} ${stage}`, details);
  }

  try {
    globalThis.__asteroidsNewBootStage = stage;
  } catch {
    // Ignore global assignment issues in restricted runtimes.
  }
}

function traceBootFailure(stage, error) {
  console.error(`${BOOT_TRACE_PREFIX} FAIL ${stage}`, error);
  try {
    globalThis.__asteroidsNewBootStage = `FAIL:${stage}`;
    globalThis.__asteroidsNewBootError = error;
  } catch {
    // Ignore global assignment issues in restricted runtimes.
  }
}

traceBoot("module-evaluated");

function publishObjectVectorRuntimeDiagnostics(runtime, extra = {}) {
  try {
    globalThis.__asteroidsObjectVectorRuntime = {
      ...(runtime?.getDiagnostics?.() || {}),
      ...extra
    };
  } catch {
    // Ignore diagnostics assignment in restricted runtimes.
  }
}

async function loadAsteroidsManifestPayload(manifestPath, manifestPayload = null) {
  if (manifestPayload && typeof manifestPayload === "object" && !Array.isArray(manifestPayload)) {
    return manifestPayload;
  }
  if (typeof fetch !== "function") {
    throw new Error("Fetch API is unavailable for Asteroids game.manifest.json.");
  }
  const response = await fetch(manifestPath, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`${manifestPath} returned ${response.status}.`);
  }
  return response.json();
}

export function resolveAsteroidsScreenDimensions(manifest) {
  const width = asPositiveInteger(manifest?.screen?.width, 0);
  const height = asPositiveInteger(manifest?.screen?.height, 0);
  if (!width || !height) {
    throw new Error("Asteroids game.manifest.json requires screen.width and screen.height.");
  }
  return { width, height };
}

export function loadAsteroidsWorldModule() {
  return import("./game/AsteroidsWorld.js");
}

export async function createAsteroidsWorld(...args) {
  const moduleRef = await loadAsteroidsWorldModule();
  const AsteroidsWorld = moduleRef.default;
  return new AsteroidsWorld(...args);
}

export function createAsteroidsNewDebugPlugins() {
  return [createAsteroidsShowcaseDebugPlugin()];
}

export function createAsteroidsTemplateBoot(initialFlow = "attract") {
  let currentFlowId = Object.prototype.hasOwnProperty.call(asteroidFlow, initialFlow)
    ? initialFlow
    : "attract";

  function getCurrentFlow() {
    return asteroidFlow[currentFlowId];
  }

  function setFlow(nextFlowId) {
    if (Object.prototype.hasOwnProperty.call(asteroidFlow, nextFlowId)) {
      currentFlowId = nextFlowId;
    }
    return getCurrentFlow();
  }

  function start() {
    return getCurrentFlow();
  }

  return Object.freeze({
    get currentFlowId() {
      return currentFlowId;
    },
    getCurrentFlow,
    setFlow,
    start
  });
}

export async function bootAsteroids({
  documentRef = globalThis.document ?? null,
  EngineClass = Engine,
  InputServiceClass = InputService,
  ObjectVectorRuntimeClass = ObjectVectorRuntimeAssetService,
  SceneClass = AsteroidsGameScene,
  createDevConsoleIntegration = createNoopDevConsoleIntegration,
  manifestPayload = null
} = {}) {
  let stage = "entered";
  traceBoot(stage);

  try {
    if (!documentRef) {
      stage = "missing-document";
      traceBootFailure(stage, new Error("No document reference available for boot"));
      return null;
    }

    if (documentRef === globalThis.document && documentRef.documentElement && documentRef.body) {
      stage = "apply-theme";
      traceBoot(stage);
      theme.applyDocumentTheme();
    }

    stage = "resolve-canvas";
    traceBoot(stage);
    const canvas = documentRef.getElementById?.("game") ?? null;
    if (!canvas) {
      stage = "missing-canvas";
      traceBootFailure(stage, new Error('Missing #game canvas element'));
      return null;
    }

    stage = "preload-manifest-assets";
    traceBoot(stage);
    await preloadGameManifestAssets("Asteroids", {
      manifestPath: ASTEROIDS_MANIFEST_PATH
    });

    stage = "load-game-manifest";
    traceBoot(stage);
    const asteroidsManifest = await loadAsteroidsManifestPayload(ASTEROIDS_MANIFEST_PATH, manifestPayload);
    const screenDimensions = resolveAsteroidsScreenDimensions(asteroidsManifest);
    const objectGeometryValidation = loadAsteroidsObjectGeometryFromManifest(asteroidsManifest, {
      sourceLabel: "Asteroids game.manifest.json"
    });
    if (!objectGeometryValidation.ok) {
      throw new Error(`Asteroids Object Vector manifest validation failed: ${objectGeometryValidation.errors.join(" ")}`);
    }

    stage = "preload-object-vector-runtime";
    traceBoot(stage);
    const objectVectorRuntime = new ObjectVectorRuntimeClass();
    const objectVectorAssets = await objectVectorRuntime.loadFromManifest(ASTEROIDS_MANIFEST_PATH, {
      sourceLabel: "Asteroids game.manifest.json"
    });
    publishObjectVectorRuntimeDiagnostics(objectVectorRuntime, {
      assetCount: objectVectorAssets?.objectsById?.size || 0,
      loaded: Boolean(objectVectorAssets),
      objectCount: objectVectorAssets?.objectsById?.size || 0
    });
    if (!objectVectorAssets) {
      throw new Error("Asteroids Object Vector runtime manifest validation failed: Object Vector Studio V2 payload could not be loaded from game.manifest.json.");
    }

    stage = "create-input";
    traceBoot(stage);
    const input = new InputServiceClass();
    input.setInputMap?.(inputMapFromManifest(asteroidsManifest));

    stage = "create-engine";
    traceBoot(stage);
    const engine = new EngineClass({
      canvas,
      width: screenDimensions.width,
      height: screenDimensions.height,
      fixedStepMs: 1000 / 60,
      input
    });

    stage = "resolve-debug-config";
    traceBoot(stage);
    const debugConfig = resolveDebugConfig(documentRef, {
      storageKey: ASTEROIDS_DEBUG_STORAGE_KEY
    });
    const devConsoleIntegration = debugConfig.debugEnabled && typeof createDevConsoleIntegration === "function"
      ? createDevConsoleIntegration({
          sampleId: "asteroids-new-showcase",
          debugMode: debugConfig.debugMode,
          activatePluginsOnInit: true,
          pluginFeatureFlags: {
            asteroidsShowcaseDebug: true
          },
          plugins: [
            createAsteroidsShowcaseDebugPlugin()
          ]
        })
      : null;

    stage = "configure-debug-runtime";
    traceBoot(stage);
    const runtime = devConsoleIntegration?.getRuntime?.();
    runtime?.hideOverlay?.();
    runtime?.hideConsole?.();

    stage = "set-scene";
    traceBoot(stage);
    engine.setScene(new SceneClass({
      devConsoleIntegration,
      debugConfig,
      objectGeometry: objectGeometryValidation.objectGeometry,
      objectVectorAssets,
      objectVectorRuntime,
      screenDimensions,
    }));

    stage = "start-engine";
    traceBoot(stage);
    engine.start();
    try {
      globalThis.__asteroidsNewEngine = engine;
    } catch {
      // Ignore global diagnostics assignment in restricted runtimes.
    }

    stage = "bind-fullscreen-click";
    traceBoot(stage);
    canvas.addEventListener?.("click", async () => {
      const fullscreenState = engine.fullscreen?.getState?.();
      if (!fullscreenState?.available || fullscreenState.active) {
        return;
      }

      await engine.fullscreen.request();
    });

    stage = "boot-complete";
    traceBoot(stage);
    return engine;
  } catch (error) {
    traceBootFailure(stage, error);
    throw error;
  }
}

function tryAutoBoot() {
  void bootAsteroids().catch((error) => {
    traceBootFailure("auto-boot", error);
  });
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tryAutoBoot, { once: true });
  } else {
    tryAutoBoot();
  }
}

export default asteroidFlow;
