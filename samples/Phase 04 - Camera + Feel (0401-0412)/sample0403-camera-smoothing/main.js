/*
Toolbox Aid
David Quesenberry
03/21/2026
main.js
*/
import Engine from '../../../src/engine/core/Engine.js';
import CameraSmoothingScene from './CameraSmoothingScene.js';
import { Theme, ThemeTokens } from '../../../src/engine/theme/index.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();

const canvas = document.getElementById('game');

const engine = new Engine({
  canvas,
  width: 960,
  height: 540,
});

engine.setScene(new CameraSmoothingScene());
engine.start();
