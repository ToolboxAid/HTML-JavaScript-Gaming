/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import Engine from '/src/engine/core/Engine.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { AccessibilityOptions } from '/src/engine/release/index.js';
import AccessibilityOptionsScene from './AccessibilityOptionsScene.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();

const canvas = document.getElementById('game');
const engine = new Engine({ canvas, width: 960, height: 540 });
const accessibility = new AccessibilityOptions({
  namespace: 'toolboxaid:sample1102',
});
accessibility.load();

const scene = new AccessibilityOptionsScene(accessibility);
engine.setScene(scene);
engine.start();

document.getElementById('accessibility-scale')?.addEventListener('click', () => scene.cycleScale());
document.getElementById('accessibility-contrast')?.addEventListener('click', () => scene.toggleContrast());
document.getElementById('accessibility-motion')?.addEventListener('click', () => scene.toggleMotion());
document.getElementById('accessibility-comfort')?.addEventListener('click', () => scene.cycleComfort());
document.getElementById('accessibility-save')?.addEventListener('click', () => scene.save());
