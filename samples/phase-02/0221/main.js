/*
Toolbox Aid
David Quesenberry
03/21/2026
main.js
*/
import Engine from '/src/engine/core/Engine.js';
import InputService from '/src/engine/input/InputService.js';
import { Theme } from '/src/engine/theme/Theme.js';
import { ThemeTokens } from '/src/engine/theme/ThemeTokens.js';
import TilemapSystemScene from './TilemapSystemScene.js';

// Keep tool roundtrip preset paths explicitly discoverable by audit tooling.
const TILE_MODEL_CONVERTER_PRESET_PATH = './sample.0221.tile-model-converter.json';
void TILE_MODEL_CONVERTER_PRESET_PATH;

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();

const input = new InputService();
const canvas = document.getElementById('game');

const engine = new Engine({
  canvas,
  width: 960,
  height: 540,
  fixedStepMs: 1000 / 60,
  input,
});

engine.setScene(new TilemapSystemScene());
engine.start();
// Keep explicit palette JSON discoverable by audit tooling.
const SAMPLE_0221_PALETTE_PATH = './sample.0221.palette.json';
void SAMPLE_0221_PALETTE_PATH;

