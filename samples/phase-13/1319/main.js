/*
Toolbox Aid
David Quesenberry
04/15/2026
main.js
*/
import Engine from "/src/engine/core/Engine.js";
import { InputService } from "/src/engine/input/index.js";
import { Theme, ThemeTokens } from "/src/engine/theme/index.js";
import RealNetworkLaunchScene from "./game/RealNetworkLaunchScene.js";

const theme = new Theme(ThemeTokens);

function readServerUrl(documentRef) {
  const input = documentRef?.getElementById?.("server-url");
  if (!input) {
    return "ws://127.0.0.1:4320/ws";
  }
  const value = typeof input.value === "string" ? input.value.trim() : "";
  return value || "ws://127.0.0.1:4320/ws";
}

export function bootRealNetworkSample({
  documentRef = globalThis.document ?? null,
  EngineClass = Engine,
  InputServiceClass = InputService,
  SceneClass = RealNetworkLaunchScene
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
  const scene = new SceneClass({
    serverUrl: readServerUrl(documentRef)
  });

  const engine = new EngineClass({
    canvas,
    width: 960,
    height: 540,
    input
  });
  engine.setScene(scene);
  engine.start();

  documentRef.getElementById?.("network-connect")?.addEventListener("click", () => {
    scene.setServerUrl(readServerUrl(documentRef));
    scene.connect();
  });

  documentRef.getElementById?.("network-disconnect")?.addEventListener("click", () => {
    scene.disconnect("manual");
  });

  documentRef.getElementById?.("network-reconnect")?.addEventListener("click", () => {
    scene.setServerUrl(readServerUrl(documentRef));
    scene.reconnect();
  });

  documentRef.getElementById?.("network-pulse")?.addEventListener("click", () => {
    scene.sendInput(4, 0);
  });

  return { engine, scene };
}

if (typeof document !== "undefined") {
  bootRealNetworkSample();
}
