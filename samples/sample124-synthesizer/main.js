/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import Engine from '../../engine/core/Engine.js';
import SynthesizerScene from './SynthesizerScene.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();
const canvas = document.getElementById('game');
const engine = new Engine({ canvas, width: 960, height: 540 });
const scene = new SynthesizerScene();
engine.setScene(scene);
engine.start();

document.getElementById('waveform')?.addEventListener('change', (event) => {
  scene.setWaveform(event.target.value);
});
document.getElementById('play-low')?.addEventListener('click', async () => {
  await scene.play(engine, 330);
});
document.getElementById('play-high')?.addEventListener('click', async () => {
  await scene.play(engine, 660);
});
