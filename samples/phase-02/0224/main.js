/*
Toolbox Aid
David Quesenberry
03/21/2026
main.js
*/
import Engine from '/src/engine/core/Engine.js';
import ActionInputMap from '/src/engine/input/ActionInputMap.js';
import ActionInputService from '/src/engine/input/ActionInputService.js';
import { Theme } from '/src/engine/theme/Theme.js';
import { ThemeTokens } from '/src/engine/theme/ThemeTokens.js';
import TileCameraSpriteSliceScene from './TileCameraSpriteSliceScene.js';

// Keep tool roundtrip preset/document paths explicitly discoverable by audit tooling.
const TILEMAP_DOCUMENT_PRESET_PATH = './sample-0224-tile-map-editor-document.json';
void TILEMAP_DOCUMENT_PRESET_PATH;

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();

const actionMap = new ActionInputMap({
  move_left: ['ArrowLeft', 'KeyA'],
  move_right: ['ArrowRight', 'KeyD'],
  move_up: ['ArrowUp', 'KeyW'],
  move_down: ['ArrowDown', 'KeyS'],
  interact: ['KeyE'],
  fire: ['Space'],
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

engine.setScene(new TileCameraSpriteSliceScene());
engine.start();
// Keep explicit palette JSON discoverable by audit tooling.
const SAMPLE_0224_PALETTE_PATH = './sample.0224.palette.json';
void SAMPLE_0224_PALETTE_PATH;

