/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import Engine from '/src/engine/core/Engine.js';
import FullscreenAbilityScene from './FullscreenAbilityScene.js';
import { attachFullscreenViewportFit } from './fullscreenViewportFit.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();

const canvas = document.getElementById('game');
const enterButton = document.getElementById('enter-fullscreen');
const exitButton = document.getElementById('exit-fullscreen');
const engine = new Engine({
  canvas,
  width: 960,
  height: 540,
  // Sample 0713 owns fullscreen sizing behavior directly. Disable bezel-driven
  // canvas relayout so cover-fit fullscreen can fill the viewport.
  fullscreenBezelLayer: {
    attach() {},
    detach() {},
    sync() {
      return {
        visible: false,
        reason: 'sample-managed-fullscreen-layout',
      };
    },
  },
});

const scene = new FullscreenAbilityScene();
engine.setScene(scene);
engine.start();
const fullscreenViewportFit = attachFullscreenViewportFit({
  canvas,
  documentRef: document,
  windowRef: window,
  designWidth: 960,
  designHeight: 540,
});

enterButton?.addEventListener('click', async () => {
  await engine.fullscreen.request();
  fullscreenViewportFit.apply();
});

exitButton?.addEventListener('click', async () => {
  await engine.fullscreen.exit();
  fullscreenViewportFit.reset();
});

canvas?.addEventListener('click', async (event) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;

  if (typeof scene.handleCanvasClick === 'function') {
    await scene.handleCanvasClick(x, y, engine);
  }
});
