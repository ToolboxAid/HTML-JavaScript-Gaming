/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import Engine from '/src/engine/core/Engine.js';
import ActionInputMap from '/src/engine/input/ActionInputMap.js';
import ActionInputService from '/src/engine/input/ActionInputService.js';
import { Theme } from '/src/engine/theme/Theme.js';
import { ThemeTokens } from '/src/engine/theme/ThemeTokens.js';
import ReplaySystemScene from './ReplaySystemScene.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();
const input = new ActionInputService({
  actionMap: new ActionInputMap({
    record: ['KeyR'],
  }),
});
const canvas = document.getElementById('game');
const engine = new Engine({ canvas, width: 960, height: 540, fixedStepMs: 1000 / 60, input });
engine.setScene(new ReplaySystemScene());
engine.start();
