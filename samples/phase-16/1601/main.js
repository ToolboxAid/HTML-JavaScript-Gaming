/*
Toolbox Aid
David Quesenberry
04/15/2026
main.js
*/
import Engine from '/src/engine/core/Engine.js';
import InputService from '/src/engine/input/InputService.js';
import { Theme } from '/src/engine/theme/Theme.js';
import { ThemeTokens } from '/src/engine/theme/ThemeTokens.js';
import CubeExplorer3DScene from './CubeExplorer3DScene.js';

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

engine.setScene(new CubeExplorer3DScene());
engine.start();
