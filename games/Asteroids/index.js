import { attractFlow } from "./flow/attract.js";
import { introFlow } from "./flow/intro.js";
import { highscoreFlow } from "./flow/highscore.js";
import { createAsteroidsShowcaseDebugPlugin } from "./debug/asteroidsShowcaseDebug.js";
import Engine from "/src/engine/core/Engine.js";
import { InputService } from "/src/engine/input/index.js";
import { Theme, ThemeTokens } from "/src/engine/theme/index.js";
import { resolveDebugConfig } from "../../src/shared/utils/debugConfigUtils.js";
import { createSampleGameDevConsoleIntegration } from "../../tools/dev/devConsoleIntegration.js";
import AsteroidsGameScene from "./game/AsteroidsGameScene.js";

export const asteroidFlow = Object.freeze({
  attract: attractFlow,
  intro: introFlow,
  highscore: highscoreFlow
});
const theme = new Theme(ThemeTokens);
const BOOT_TRACE_PREFIX = "Asteroids";

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

export function bootAsteroidsNew({
  documentRef = globalThis.document ?? null,
  EngineClass = Engine,
  InputServiceClass = InputService,
  SceneClass = AsteroidsGameScene,
  createDevConsoleIntegration = createSampleGameDevConsoleIntegration
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

    stage = "create-input";
    traceBoot(stage);
    const input = new InputServiceClass();

    stage = "create-engine";
    traceBoot(stage);
    const engine = new EngineClass({
      canvas,
      width: 960,
      height: 720,
      fixedStepMs: 1000 / 60,
      input
    });

    stage = "resolve-debug-config";
    traceBoot(stage);
    const debugConfig = resolveDebugConfig(documentRef);
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
      debugConfig
    }));

    stage = "start-engine";
    traceBoot(stage);
    engine.start();

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
  try {
    void bootAsteroidsNew();
  } catch (error) {
    traceBootFailure("auto-boot", error);
  }
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tryAutoBoot, { once: true });
  } else {
    tryAutoBoot();
  }
}

export default asteroidFlow;
