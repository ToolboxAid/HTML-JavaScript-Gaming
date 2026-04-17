/*
Toolbox Aid
David Quesenberry
03/25/2026
main.js
*/
import Engine from '/src/engine/core/Engine.js';
import { InputService } from '/src/engine/input/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import PacmanLiteScene from './game/PacmanLiteScene.js';

const theme = new Theme(ThemeTokens);

export function bootPacmanLite({
  documentRef = globalThis.document ?? null,
  EngineClass = Engine,
  InputServiceClass = InputService,
  SceneClass = PacmanLiteScene,
} = {}) {
  if (!documentRef) {
    return null;
  }
  if (documentRef === globalThis.document && documentRef.documentElement && documentRef.body) {
    theme.applyDocumentTheme();
  }
  const canvas = documentRef.getElementById?.('game') ?? null;
  if (!canvas) {
    return null;
  }

  const input = new InputServiceClass();
  const engine = new EngineClass({
    canvas,
    width: 960,
    height: 720,
    fixedStepMs: 1000 / 60,
    input,
  });
  engine.setScene(new SceneClass());
  engine.start();

  return engine;
}

if (typeof document !== 'undefined') {
  bootPacmanLite();
}
