/*
Toolbox Aid
David Quesenberry
03/24/2026
main.js
*/
import Engine from '../../engine/core/Engine.js';
import { InputService } from '../../engine/input/index.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import MultiBallChaosScene from './game/MultiBallChaosScene.js';

const theme = new Theme(ThemeTokens);

export function bootMultiBallChaos({
  documentRef = globalThis.document ?? null,
  EngineClass = Engine,
  InputServiceClass = InputService,
  SceneClass = MultiBallChaosScene,
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

  canvas.addEventListener?.('click', async () => {
    const fullscreenState = engine.fullscreen?.getState?.();
    if (!fullscreenState?.available || fullscreenState.active) {
      return;
    }

    await engine.fullscreen.request();
  });

  return engine;
}

if (typeof document !== 'undefined') {
  bootMultiBallChaos();
}
