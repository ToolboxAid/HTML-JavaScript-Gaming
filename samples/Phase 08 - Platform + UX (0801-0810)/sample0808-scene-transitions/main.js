/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import Engine from '../../../src/engine/core/Engine.js';
import TransitionProofScene from './TransitionProofScene.js';
import { Theme, ThemeTokens } from '../../../src/engine/theme/index.js';
import { SceneTransitionController } from '../../../src/engine/scenes/index.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();
const canvas = document.getElementById('game');
const engine = new Engine({ canvas, width: 960, height: 540 });
const controller = new SceneTransitionController();

const createBlueScene = () => new TransitionProofScene({
  label: 'Blue Scene',
  color: '#1d4ed8',
  controller,
  createNextScene: createOrangeScene,
});

const createOrangeScene = () => new TransitionProofScene({
  label: 'Orange Scene',
  color: '#ea580c',
  controller,
  createNextScene: createBlueScene,
});

engine.setScene(createBlueScene());
engine.start();

document.getElementById('run-transition')?.addEventListener('click', () => {
  engine.scene?.transition?.(engine);
});
