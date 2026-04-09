/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import Engine from '/src/engine/core/Engine.js';
import { ActionInputMap, ActionInputService } from '/src/engine/input/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import InputBufferingScene from './InputBufferingScene.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();

const actionMap = new ActionInputMap({
  jump: ['Space', 'KeyJ'],
  reset: ['KeyR'],
});

const input = new ActionInputService({
  actionMap,
  actionBufferDurations: {
    jump: 0.18,
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

engine.setScene(new InputBufferingScene());
engine.start();
