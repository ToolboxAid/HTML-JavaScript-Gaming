/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import Engine from '../../../src/engine/core/Engine.js';
import { ActionInputMap, ActionInputService } from '../../../src/engine/input/index.js';
import { Theme, ThemeTokens } from '../../../src/engine/theme/index.js';
import ResolutionScalingScene from './ResolutionScalingScene.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();
const input = new ActionInputService({
  actionMap: new ActionInputMap({
    scale_up: ['Equal'],
    scale_down: ['Minus'],
  }),
});
const canvas = document.getElementById('game');
const engine = new Engine({ canvas, width: 960, height: 540, fixedStepMs: 1000 / 60, input });
engine.setScene(new ResolutionScalingScene());
engine.start();
