/*
Toolbox Aid
David Quesenberry
03/31/2026
main.js
*/
import Engine from '../../../engine/core/Engine.js';
import { InputService } from '../../../engine/input/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import SwitchCheckpointDemoScene from './SwitchCheckpointDemoScene.js';

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

engine.setScene(new SwitchCheckpointDemoScene());
engine.start();
