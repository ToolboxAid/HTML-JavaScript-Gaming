/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import Engine from '../../engine/core/Engine.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import PropertyEditorScene from './PropertyEditorScene.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();

const canvas = document.getElementById('game');
const engine = new Engine({ canvas, width: 960, height: 540 });
const scene = new PropertyEditorScene();
engine.setScene(scene);
engine.start();

document.getElementById('prop-speed')?.addEventListener('click', () => scene.setSpeed());
document.getElementById('prop-color')?.addEventListener('click', () => scene.setColor());
