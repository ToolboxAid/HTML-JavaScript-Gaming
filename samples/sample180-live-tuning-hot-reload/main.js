/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import Engine from '../../engine/core/Engine.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import LiveTuningHotReloadScene from './LiveTuningHotReloadScene.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();

const canvas = document.getElementById('game');
const engine = new Engine({ canvas, width: 960, height: 540 });
const scene = new LiveTuningHotReloadScene();
engine.setScene(scene);
engine.start();

document.getElementById('tune-speed')?.addEventListener('click', () => scene.tune(4));
document.getElementById('tune-speed-fast')?.addEventListener('click', () => scene.tune(8));
