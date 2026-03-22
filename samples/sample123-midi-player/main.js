/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import Engine from '../../engine/core/Engine.js';
import MidiPlayerScene from './MidiPlayerScene.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();

const canvas = document.getElementById('game');
const engine = new Engine({ canvas, width: 960, height: 540 });
const scene = new MidiPlayerScene();
engine.setScene(scene);
engine.start();

document.getElementById('play-midi')?.addEventListener('click', async () => {
  await scene.play(engine);
});
document.getElementById('stop-midi')?.addEventListener('click', () => {
  scene.stop(engine);
});
