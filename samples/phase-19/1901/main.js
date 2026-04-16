/*
Toolbox Aid
David Quesenberry
04/16/2026
main.js
*/
import Engine from '/src/engine/core/Engine.js';
import { InputService } from '/src/engine/input/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import createPhase19CoreServices from '/samples/phase-19/shared/coreServices/createPhase19CoreServices.js';
import createPhase19RuntimeLayer from '/samples/phase-19/shared/runtimeLayer/createPhase19RuntimeLayer.js';
import Phase19FoundationScene from './Phase19FoundationScene.js';

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

const coreServices = createPhase19CoreServices();
const runtimeLayer = createPhase19RuntimeLayer({ coreServices });
engine.setScene(new Phase19FoundationScene({ runtimeLayer }));
engine.start();
