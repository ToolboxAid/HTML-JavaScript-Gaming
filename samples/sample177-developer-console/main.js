/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import Engine from '../../engine/core/Engine.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import DeveloperConsoleScene from './DeveloperConsoleScene.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();

const canvas = document.getElementById('game');
const engine = new Engine({ canvas, width: 960, height: 540 });
const scene = new DeveloperConsoleScene();
engine.setScene(scene);
engine.start();

document.getElementById('console-help')?.addEventListener('click', () => scene.run('help'));
document.getElementById('console-heal')?.addEventListener('click', () => scene.run('heal 3'));
document.getElementById('console-unknown')?.addEventListener('click', () => scene.run('teleport'));
