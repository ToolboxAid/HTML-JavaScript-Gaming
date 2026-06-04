/*
Toolbox Aid
David Quesenberry
03/31/2026
main.js
*/
import Engine from '/src/engine/core/Engine.js';
import InputService from '/src/engine/input/InputService.js';
import { Theme } from '/src/engine/theme/Theme.js';
import { ThemeTokens } from '/src/engine/theme/ThemeTokens.js';
import { resolveDebugConfig } from '/src/shared/debug/config.js';
import { createSampleGameDevConsoleIntegration } from '../../../tools/dev/devConsoleIntegration.js';
import MultiSystemDemoScene from './MultiSystemDemoScene.js';

const BUILD_DEBUG_MODE = 'dev';
const BUILD_DEBUG_ENABLED = true;

function sanitizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

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

const debugConfig = resolveDebugConfig();
const devConsoleIntegration = debugConfig.debugEnabled
  ? createSampleGameDevConsoleIntegration({
      sampleId: 'demo-1205-multi-system',
      debugMode: debugConfig.debugMode
    })
  : null;

engine.setScene(new MultiSystemDemoScene({
  devConsoleIntegration,
  debugConfig
}));
engine.start();
// Keep explicit palette JSON discoverable by audit tooling.
const SAMPLE_1205_PALETTE_PATH = './sample.1205.palette.json';
void SAMPLE_1205_PALETTE_PATH;
