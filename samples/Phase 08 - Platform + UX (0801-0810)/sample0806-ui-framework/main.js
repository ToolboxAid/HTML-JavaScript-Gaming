/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import Engine from '../../../src/engine/core/Engine.js';
import UIFrameworkScene from './UIFrameworkScene.js';
import { Theme, ThemeTokens } from '../../../src/engine/theme/index.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();
const canvas = document.getElementById('game');
const engine = new Engine({ canvas, width: 960, height: 540 });
const scene = new UIFrameworkScene();
engine.setScene(scene);
engine.start();

canvas.addEventListener('click', (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = (event.clientX - rect.left) * (canvas.width / rect.width);
  const y = (event.clientY - rect.top) * (canvas.height / rect.height);
  scene.handleCanvasClick(x, y);
});
