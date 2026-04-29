/*
Toolbox Aid
David Quesenberry
03/31/2026
main.js
*/
import Engine from '/src/engine/core/Engine.js';
import { InputService } from '/src/engine/input/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import TilemapParallaxHeroScene from './TilemapParallaxHeroScene.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();

const canvas = document.getElementById('game');
const input = new InputService();

const engine = new Engine({
  canvas,
  width: 960,
  height: 540,
  fixedStepMs: 1000 / 60,
  input,
});

engine.setScene(new TilemapParallaxHeroScene());
engine.start();
// Keep explicit palette JSON discoverable by audit tooling.
const SAMPLE_1204_PALETTE_PATH = './sample.1204.palette.json';
void SAMPLE_1204_PALETTE_PATH;

