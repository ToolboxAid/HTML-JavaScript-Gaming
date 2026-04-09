/*
Toolbox Aid
David Quesenberry
04/06/2026
main.js
*/
import Engine from "/src/engine/core/Engine.js";
import { InputService } from "/src/engine/input/index.js";
import { Theme, ThemeTokens } from "/src/engine/theme/index.js";
import { resolveDebugConfig } from "../../src/shared/utils/debugConfigUtils.js";
import { createSampleGameDevConsoleIntegration } from "../../tools/dev/devConsoleIntegration.js";
import { createNetworkSampleADebugPlugin } from "./debug/networkSampleADebug.js";
import NetworkSampleAScene from "./game/NetworkSampleAScene.js";

const theme = new Theme(ThemeTokens);

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function updateDebugUi(documentRef, integration, enabled) {
  const badge = documentRef?.getElementById?.("debugStateBadge") ?? null;
  const button = documentRef?.getElementById?.("openDebugPanelButton") ?? null;

  if (badge) {
    badge.textContent = enabled ? "Debug: ON" : "Debug: OFF";
    badge.classList.remove("is-on", "is-off");
    badge.classList.add(enabled ? "is-on" : "is-off");
  }

  if (button) {
    button.disabled = !integration;
    button.addEventListener("click", () => {
      const runtime = integration?.getRuntime?.();
      runtime?.showOverlay?.();
      runtime?.showConsole?.();
    });
  }
}

export function bootNetworkSampleA({
  documentRef = globalThis.document ?? null,
  EngineClass = Engine,
  InputServiceClass = InputService,
  SceneClass = NetworkSampleAScene,
  createDevConsoleIntegration = createSampleGameDevConsoleIntegration
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
  const devConsoleIntegration = debugConfig.debugEnabled
    ? createDevConsoleIntegration({
        sampleId: "network-sample-a",
        debugMode: debugConfig.debugMode,
        activatePluginsOnInit: true,
        pluginFeatureFlags: {
          networkSampleADebug: true
        },
        plugins: [
          createNetworkSampleADebugPlugin()
        ]
      })
    : null;

  const runtime = devConsoleIntegration?.getRuntime?.();
  runtime?.hideOverlay?.();
  runtime?.hideConsole?.();

  updateDebugUi(documentRef, devConsoleIntegration, debugConfig.debugEnabled);

  engine.setScene(new SceneClass({
    devConsoleIntegration,
    debugConfig
  }));
  engine.start();

  return engine;
}

if (typeof document !== "undefined") {
  bootNetworkSampleA();
}
