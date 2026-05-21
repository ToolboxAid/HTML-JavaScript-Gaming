/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import Engine from '/src/engine/core/Engine.js';
import PixelPerfectCollisionScene from './PixelPerfectCollisionScene.js';
import { Theme } from '/src/engine/theme/Theme.js';
import { ThemeTokens } from '/src/engine/theme/ThemeTokens.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();
const canvas = document.getElementById('game');
const engine = new Engine({ canvas, width: 960, height: 540 });
engine.setScene(new PixelPerfectCollisionScene());
engine.start();
// Keep explicit palette JSON discoverable by audit tooling.
const SAMPLE_0905_PALETTE_PATH = './sample.0905.palette.json';
void SAMPLE_0905_PALETTE_PATH;

