/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import Engine from '/src/engine/core/Engine.js';
import ParticleFxScene from './ParticleFxScene.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();
const canvas = document.getElementById('game');
const engine = new Engine({ canvas, width: 960, height: 540 });
const scene = new ParticleFxScene();
engine.setScene(scene);
engine.start();

document.getElementById('trigger-explosion')?.addEventListener('click', () => {
  scene.explode('square');
});
document.getElementById('trigger-random-explosion')?.addEventListener('click', () => {
  scene.explodeRandomized('square');
});
document.getElementById('trigger-circle-explosion')?.addEventListener('click', () => {
  scene.explode('circle');
});
document.getElementById('trigger-random-circle-explosion')?.addEventListener('click', () => {
  scene.explodeRandomized('circle');
});
document.getElementById('trigger-diamond-explosion')?.addEventListener('click', () => {
  scene.explode('diamond');
});
document.getElementById('trigger-random-diamond-explosion')?.addEventListener('click', () => {
  scene.explodeRandomized('diamond');
});
