/*
Toolbox Aid
David Quesenberry
04/16/2026
main.js
*/
import Engine from '/src/engine/core/Engine.js';
import InputService from '/src/engine/input/InputService.js';
import { Theme } from '/src/engine/theme/Theme.js';
import { ThemeTokens } from '/src/engine/theme/ThemeTokens.js';
import createPhase19IntegrationFlow from '/old_samples/phase-19/shared/integration/createPhase19IntegrationFlow.js';
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

const phase19Flow = createPhase19IntegrationFlow();
engine.setScene(new Phase19FoundationScene({ phase19Flow }));
engine.start();
