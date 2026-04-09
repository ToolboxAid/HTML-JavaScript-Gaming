/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import Engine from '/src/engine/core/Engine.js';
import FrequencyPlayerScene from './FrequencyPlayerScene.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();
const canvas = document.getElementById('game');
const engine = new Engine({ canvas, width: 960, height: 540 });
const scene = new FrequencyPlayerScene();
engine.setScene(scene);
engine.start();

document.getElementById('play-frequencies')?.addEventListener('click', async () => {
  await scene.play(engine);
});
