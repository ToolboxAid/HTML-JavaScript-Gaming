/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import Engine from '/src/engine/core/Engine.js';
import AudioSystemScene from './AudioSystemScene.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();

const canvas = document.getElementById('game');
const engine = new Engine({ canvas, width: 960, height: 540 });
const scene = new AudioSystemScene();
engine.setScene(scene);
engine.start();

document.getElementById('resume-audio')?.addEventListener('click', async () => {
  await scene.resumeAudio(engine);
});
document.getElementById('toggle-music')?.addEventListener('click', () => {
  scene.toggleMusic(engine);
});
document.getElementById('play-sfx')?.addEventListener('click', async () => {
  await scene.playSfx(engine);
});
