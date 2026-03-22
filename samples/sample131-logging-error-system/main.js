/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import Engine from '../../engine/core/Engine.js';
import LoggingErrorSystemScene from './LoggingErrorSystemScene.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();
const canvas = document.getElementById('game');
const engine = new Engine({ canvas, width: 960, height: 540 });
const scene = new LoggingErrorSystemScene();
engine.setScene(scene);
engine.start();

document.getElementById('log-info')?.addEventListener('click', () => {
  scene.logInfo(engine);
});
document.getElementById('trigger-safe-error')?.addEventListener('click', () => {
  scene.triggerHandledError(engine);
});
