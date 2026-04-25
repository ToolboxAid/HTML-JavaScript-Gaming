/*
Toolbox Aid
David Quesenberry
03/24/2026
main.js
*/
import Engine from '/src/engine/core/Engine.js';
import { InputService } from '/src/engine/input/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import BouncingBallScene from './game/BouncingBallScene.js';
import { loadGameSkin } from '/games/shared/gameSkinLoader.js';

const theme = new Theme(ThemeTokens);
const BOUNCING_BALL_DEFAULT_SKIN_PATH = '/games/Bouncing-ball/assets/skins/default.json';
const BOUNCING_BALL_FALLBACK_SKIN = Object.freeze({
  documentKind: 'game-skin',
  schema: 'games.bouncing-ball.skin/1',
  version: 1,
  gameId: 'Bouncing-ball',
  name: 'Bouncing Ball Classic Skin',
  colors: {
    background: '#05070a',
    wall: '#f4f4ef',
    text: '#f4f4ef',
    muted: '#9ba3b3',
    panel: '#05070a',
    ball: '#f4f4ef'
  },
  sizing: {
    wallThickness: 18,
    ballSize: 22
  }
});

export function bootBouncingBall({
  documentRef = globalThis.document ?? null,
  EngineClass = Engine,
  InputServiceClass = InputService,
  SceneClass = BouncingBallScene,
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

  const scene = new SceneClass({ skin: BOUNCING_BALL_FALLBACK_SKIN });
  void loadGameSkin({
    gameId: 'Bouncing-ball',
    defaultSkinPath: BOUNCING_BALL_DEFAULT_SKIN_PATH,
    fallbackSkin: BOUNCING_BALL_FALLBACK_SKIN,
    fallbackSchema: 'games.bouncing-ball.skin/1'
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
  bootBouncingBall();
}
