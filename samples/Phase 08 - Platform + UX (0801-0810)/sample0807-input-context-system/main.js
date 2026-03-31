/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import Engine from '../../../engine/core/Engine.js';
import InputContextSystemScene from './InputContextSystemScene.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { InputContextService } from '../../../engine/input/index.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();
const canvas = document.getElementById('game');
const input = new InputContextService({
  contexts: {
    gameplay: { move_left: ['ArrowLeft'], move_right: ['ArrowRight'] },
    menu: { select_left: ['ArrowLeft'], select_right: ['ArrowRight'] },
  },
  initialContext: 'gameplay',
});

const engine = new Engine({ canvas, width: 960, height: 540, input });
const scene = new InputContextSystemScene();
scene.onContextChanged(input.getContext());
engine.setScene(scene);
engine.start();

document.getElementById('context-gameplay')?.addEventListener('click', () => {
  input.setContext('gameplay');
  scene.onContextChanged('gameplay');
});
document.getElementById('context-menu')?.addEventListener('click', () => {
  input.setContext('menu');
  scene.onContextChanged('menu');
});
