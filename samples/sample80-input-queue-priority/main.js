/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import Engine from '../../engine/core/Engine.js';
import { ActionInputMap, ActionInputService } from '../../engine/input/index.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import InputQueuePriorityScene from './InputQueuePriorityScene.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();

const input = new ActionInputService({
  actionMap: new ActionInputMap({
    light: ['KeyJ'],
    guard: ['KeyK'],
    heavy: ['KeyL'],
    reset: ['KeyR'],
  }),
  actionQueueDurations: {
    light: 1.6,
    guard: 1.6,
    heavy: 1.6,
  },
  actionPriorities: {
    light: 1,
    guard: 2,
    heavy: 3,
  },
});

const canvas = document.getElementById('game');

const engine = new Engine({
  canvas,
  width: 960,
  height: 540,
  fixedStepMs: 1000 / 60,
  input,
});

engine.setScene(new InputQueuePriorityScene());
engine.start();
