/*
Toolbox Aid
David Quesenberry
04/16/2026
main.js
*/
import Engine from '/src/engine/core/Engine.js';
import { InputService } from '/src/engine/input/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import createPhase18CoreServices from '/samples/phase-18/shared/coreServices/createPhase18CoreServices.js';
import createPhase18RuntimeLayer from '/samples/phase-18/shared/runtimeLayer/createPhase18RuntimeLayer.js';
import Phase18FoundationScene from './Phase18FoundationScene.js';

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

const coreServices = createPhase18CoreServices();
const runtimeLayer = createPhase18RuntimeLayer({ coreServices });
engine.setScene(new Phase18FoundationScene({ runtimeLayer }));
engine.start();
