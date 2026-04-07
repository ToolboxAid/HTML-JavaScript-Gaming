/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import Engine from '../../../src/engine/core/Engine.js';
import { Theme, ThemeTokens } from '../../../src/engine/theme/index.js';
import ClientPredictionReconciliationScene from './ClientPredictionReconciliationScene.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();

const canvas = document.getElementById('game');
const engine = new Engine({ canvas, width: 960, height: 540 });
const scene = new ClientPredictionReconciliationScene();
engine.setScene(scene);
engine.start();

document.getElementById('prediction-step')?.addEventListener('click', () => scene.predictMove());
document.getElementById('prediction-authority')?.addEventListener('click', () => scene.applyAuthority());
document.getElementById('prediction-reset')?.addEventListener('click', () => scene.reset());
