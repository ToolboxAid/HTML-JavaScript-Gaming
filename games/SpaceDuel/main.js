/*
Toolbox Aid
David Quesenberry
03/25/2026
main.js
*/
import Engine from '../../src/engine/core/Engine.js';
import { ActionInputMap, ActionInputService } from '../../src/engine/input/index.js';
import { Theme, ThemeTokens } from '../../src/engine/theme/index.js';
import SpaceDuelScene from './game/SpaceDuelScene.js';

const theme = new Theme(ThemeTokens);

const ACTION_BINDINGS = {
  startOnePlayer: ['Digit1', 'Numpad1', 'Enter', 'Pad0:Button0'],
  startTwoPlayer: ['Digit2', 'Numpad2', 'Pad1:Button0'],
  pause: ['KeyP', 'Escape', 'Pad0:Button9', 'Pad1:Button9'],
  menuBack: ['KeyX'],
  p1Left: ['ArrowLeft', 'KeyJ', 'Pad0:Button14'],
  p1Right: ['ArrowRight', 'KeyL', 'Pad0:Button15'],
  p1Thrust: ['ArrowUp', 'KeyI', 'Pad0:Button12'],
  p1Fire: ['Space', 'Pad0:Button0'],
  p2Left: ['KeyA', 'Pad1:Button14'],
  p2Right: ['KeyD', 'Pad1:Button15'],
  p2Thrust: ['KeyW', 'Pad1:Button12'],
  p2Fire: ['ShiftLeft', 'Pad1:Button0'],
};

export function bootSpaceDuel({
  documentRef = globalThis.document ?? null,
  EngineClass = Engine,
  InputServiceClass = ActionInputService,
  ActionMapClass = ActionInputMap,
  SceneClass = SpaceDuelScene,
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

  const actionMap = new ActionMapClass(ACTION_BINDINGS);
  const input = new InputServiceClass({ actionMap });

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
  bootSpaceDuel();
}
