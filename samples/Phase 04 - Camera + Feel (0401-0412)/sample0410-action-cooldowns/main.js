/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import Engine from '../../../engine/core/Engine.js';
import { ActionInputMap, ActionInputService } from '../../../engine/input/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import ActionCooldownsScene from './ActionCooldownsScene.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();

const input = new ActionInputService({
  actionMap: new ActionInputMap({
    cast: ['Space', 'KeyJ'],
    reset: ['KeyR'],
  }),
  actionCooldownDurations: {
    cast: 1.1,
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

engine.setScene(new ActionCooldownsScene());
engine.start();
