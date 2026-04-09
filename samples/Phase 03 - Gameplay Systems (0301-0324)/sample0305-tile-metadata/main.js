/*
Toolbox Aid
David Quesenberry
03/21/2026
main.js
*/
import Engine from '/src/engine/core/Engine.js';
import { ActionInputMap, ActionInputService } from '/src/engine/input/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import TileMetadataScene from './TileMetadataScene.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();

const actionMap = new ActionInputMap({
  move_left: ['ArrowLeft', 'KeyA'],
  move_right: ['ArrowRight', 'KeyD'],
  move_up: ['ArrowUp', 'KeyW'],
  move_down: ['ArrowDown', 'KeyS'],
});
const input = new ActionInputService({ actionMap });
const canvas = document.getElementById('game');

const engine = new Engine({
  canvas,
  width: 960,
  height: 590,
  fixedStepMs: 1000 / 60,
  input,
});

engine.setScene(new TileMetadataScene());
engine.start();
