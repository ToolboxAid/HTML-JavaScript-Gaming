/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import Engine from '../../../src/engine/core/Engine.js';
import { ActionInputMap, ActionInputService } from '../../../src/engine/input/index.js';
import { Theme, ThemeTokens } from '../../../src/engine/theme/index.js';
import ControllerSupportScene from './ControllerSupportScene.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();
const input = new ActionInputService({
  actionMap: new ActionInputMap({
    move_left: ['KeyA', 'Pad0:Button0'],
    move_right: ['KeyD', 'Pad0:Button1'],
  }),
});
const canvas = document.getElementById('game');
const engine = new Engine({ canvas, width: 960, height: 540, fixedStepMs: 1000 / 60, input });
engine.setScene(new ControllerSupportScene());
engine.start();
