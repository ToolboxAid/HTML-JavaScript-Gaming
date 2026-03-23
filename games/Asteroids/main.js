/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import Engine from '/engine/core/Engine.js';
import { InputService } from '/engine/input/index.js';
import { Theme, ThemeTokens } from '/engine/theme/index.js';
import AsteroidsGameScene from '/games/Asteroids/game/AsteroidsGameScene.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();

const input = new InputService();
const canvas = document.getElementById('game');
async function boot() {
  if (document.fonts?.load) {
    try {
      await document.fonts.load('24px "Vector Battle"');
    } catch {
      // Keep booting if the custom font fails to load.
    }
  }

  const engine = new Engine({
    canvas,
    width: 960,
    height: 720,
    fixedStepMs: 1000 / 60,
    input,
  });

  engine.setScene(new AsteroidsGameScene());
  engine.start();

  canvas?.addEventListener('click', async () => {
    const fullscreenState = engine.fullscreen?.getState?.();
    if (!fullscreenState?.available || fullscreenState.active) {
      return;
    }

    await engine.fullscreen.request();
  });
}

boot();
