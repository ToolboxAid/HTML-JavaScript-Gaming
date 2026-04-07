/*
Toolbox Aid
David Quesenberry
03/21/2026
main.js
*/
import Engine from '../../../src/engine/core/Engine.js';
import { ActionInputMap, ActionInputService } from '../../../src/engine/input/index.js';
import { Theme, ThemeTokens } from '../../../src/engine/theme/index.js';
import SceneClass from './SwitchesButtonsScene.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();

const actionMap = new ActionInputMap({
  move_left: ['ArrowLeft', 'KeyA'],
  move_right: ['ArrowRight', 'KeyD'],
  jump: ['Space'],
  interact: ['KeyE'],
});
const input = new ActionInputService({ actionMap });
const canvas = document.getElementById('game');

const engine = new Engine({
  canvas,
  width: 960,
  height: 540,
  fixedStepMs: 1000 / 60,
  input,
});

engine.setScene(new SceneClass());
engine.start();
