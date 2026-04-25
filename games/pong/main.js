/*
Toolbox Aid
David Quesenberry
03/24/2026
main.js
*/
import Engine from '/src/engine/core/Engine.js';
import { InputService } from '/src/engine/input/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import PongScene from './game/PongScene.js';
import { loadGameSkin } from '/games/shared/gameSkinLoader.js';

const theme = new Theme(ThemeTokens);
const PONG_DEFAULT_SKIN_PATH = '/games/Pong/assets/skins/default.json';
const PONG_FALLBACK_SKIN = Object.freeze({
  documentKind: 'game-skin',
  schema: 'games.pong.skin/1',
  version: 1,
  gameId: 'Pong',
  name: 'Pong Classic Skin',
  colors: {
    background: '#05070a',
    ink: '#f4f7fb',
    muted: '#a6b0bf',
    accent: '#7de2ff',
    good: '#8bf0c8',
    warn: '#ffd37d',
    danger: '#ff9a9a'
  },
  sizing: {
    paddleWidth: 14,
    ballRadius: 8
  }
});

export function bootPong({
  documentRef = globalThis.document ?? null,
  EngineClass = Engine,
  InputServiceClass = InputService,
  SceneClass = PongScene,
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

  const scene = new SceneClass({ skin: PONG_FALLBACK_SKIN });
  void loadGameSkin({
    gameId: 'Pong',
    defaultSkinPath: PONG_DEFAULT_SKIN_PATH,
    fallbackSkin: PONG_FALLBACK_SKIN,
    fallbackSchema: 'games.pong.skin/1'
  }).then(({ skin }) => {
    scene.applySkin?.(skin);
  });
  engine.setScene(scene);
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
  bootPong();
}
