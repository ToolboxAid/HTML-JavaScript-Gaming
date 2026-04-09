import { attractFlow } from "./flow/attract.js";
import { introFlow } from "./flow/intro.js";
import { createAsteroidsShowcaseDebugPlugin } from "./debug/asteroidsShowcaseDebug.js";
import Engine from "../../src/engine/core/Engine.js";
import { InputService } from "../../src/engine/input/index.js";
import { Theme, ThemeTokens } from "../../src/engine/theme/index.js";
import { resolveDebugConfig } from "../../src/shared/utils/debugConfigUtils.js";
import AsteroidsGameScene from "./game/AsteroidsGameScene.js";

export const asteroidFlow = Object.freeze({
  attract: attractFlow,
  intro: introFlow
});
const theme = new Theme(ThemeTokens);

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
  createDevConsoleIntegration = null
} = {}) {
  if (!documentRef) {
    return null;
  }

  if (documentRef === globalThis.document && documentRef.documentElement && documentRef.body) {
    theme.applyDocumentTheme();
  }

  const canvas = documentRef.getElementById?.("game") ?? null;
  if (!canvas) {
    return null;
  }

  const input = new InputServiceClass();
  const engine = new EngineClass({
    canvas,
    width: 960,
    height: 720,
    fixedStepMs: 1000 / 60,
    input
  });

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

  const runtime = devConsoleIntegration?.getRuntime?.();
  runtime?.hideOverlay?.();
  runtime?.hideConsole?.();

  engine.setScene(new SceneClass({
    devConsoleIntegration,
    debugConfig
  }));
  engine.start();

  canvas.addEventListener?.("click", async () => {
    const fullscreenState = engine.fullscreen?.getState?.();
    if (!fullscreenState?.available || fullscreenState.active) {
      return;
    }

    await engine.fullscreen.request();
  });

  return engine;
}

if (typeof document !== "undefined") {
  void bootAsteroidsNew();
}

export default asteroidFlow;
