/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import Engine from '../../../engine/core/Engine.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import LagPacketLossSimulationScene from './LagPacketLossSimulationScene.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();

const canvas = document.getElementById('game');
const engine = new Engine({ canvas, width: 960, height: 540 });
const scene = new LagPacketLossSimulationScene();
engine.setScene(scene);
engine.start();

document.getElementById('lag-clean')?.addEventListener('click', () => scene.setMode('clean'));
document.getElementById('lag-medium')?.addEventListener('click', () => scene.setMode('medium'));
document.getElementById('lag-lossy')?.addEventListener('click', () => scene.setMode('lossy'));
document.getElementById('lag-send')?.addEventListener('click', () => scene.sendBurst());
