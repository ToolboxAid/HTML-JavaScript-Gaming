/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import Engine from '../../engine/core/Engine.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import InEngineInspectorScene from './InEngineInspectorScene.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();

const canvas = document.getElementById('game');
const engine = new Engine({ canvas, width: 960, height: 540 });
const scene = new InEngineInspectorScene();
engine.setScene(scene);
engine.start();

document.getElementById('inspect-player')?.addEventListener('click', () => scene.inspectPlayer());
document.getElementById('inspect-system')?.addEventListener('click', () => scene.inspectSystem());
