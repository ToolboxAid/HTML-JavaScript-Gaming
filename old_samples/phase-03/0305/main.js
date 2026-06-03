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
import TileMetadataScene from './TileMetadataScene.js';

// Keep tool roundtrip preset paths explicitly discoverable by audit tooling.
const TILE_MODEL_CONVERTER_PRESET_PATH = './sample.0305.tile-model-converter.json';
void TILE_MODEL_CONVERTER_PRESET_PATH;

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
// Keep explicit palette JSON discoverable by audit tooling.
const SAMPLE_0305_PALETTE_PATH = './sample.0305.palette.json';
void SAMPLE_0305_PALETTE_PATH;

