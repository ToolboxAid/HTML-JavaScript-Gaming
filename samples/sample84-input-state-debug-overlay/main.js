/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import Engine from '../../engine/core/Engine.js';
import { ActionInputMap, ActionInputService } from '../../engine/input/index.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import InputStateDebugOverlayScene from './InputStateDebugOverlayScene.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();

const input = new ActionInputService({
  actionMap: new ActionInputMap({
    light: ['KeyJ'],
    guard: ['KeyK'],
    special: ['KeyL', 'Space'],
    fire: ['KeyF'],
    reset: ['KeyR'],
  }),
  actionBufferDurations: {
    special: 0.2,
  },
  actionQueueDurations: {
    light: 1.2,
    guard: 1.2,
    special: 1.2,
  },
  actionPriorities: {
    light: 1,
    guard: 2,
    special: 3,
  },
  actionCooldownDurations: {
    fire: 1.0,
  },
  actionChains: [
    {
      name: 'light_guard_special',
      sequence: ['light', 'guard', 'special'],
      windowSeconds: 1.0,
    },
  ],
});

const canvas = document.getElementById('game');
const engine = new Engine({
  canvas,
  width: 960,
  height: 540,
  fixedStepMs: 1000 / 60,
  input,
});

engine.setScene(new InputStateDebugOverlayScene());
engine.start();
