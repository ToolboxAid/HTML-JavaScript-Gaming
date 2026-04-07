/*
Toolbox Aid
David Quesenberry
03/31/2026
main.js
*/
import Engine from '../../../src/engine/core/Engine.js';
import { InputService } from '../../../src/engine/input/index.js';
import { Theme, ThemeTokens } from '../../../src/engine/theme/index.js';
import { createSampleGameDevConsoleIntegration } from '../../../tools/dev/devConsoleIntegration.js';
import MultiSystemDemoScene from './MultiSystemDemoScene.js';

const BUILD_DEBUG_MODE = 'dev';
const BUILD_DEBUG_ENABLED = true;

function sanitizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function parseBooleanFlag(value, fallback) {
  const normalized = sanitizeText(value).toLowerCase();
  if (!normalized) {
    return fallback;
  }
  if (normalized === '1' || normalized === 'true' || normalized === 'on' || normalized === 'yes') {
    return true;
  }
  if (normalized === '0' || normalized === 'false' || normalized === 'off' || normalized === 'no') {
    return false;
  }
  return fallback;
}

function normalizeDebugMode(value, fallback = 'dev') {
  const normalized = sanitizeText(value).toLowerCase();
  if (normalized === 'dev' || normalized === 'qa' || normalized === 'prod') {
    return normalized;
  }
  return fallback;
}

function resolveDebugConfig() {
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const queryMode = searchParams.get('debugMode');
  const queryEnabled = searchParams.get('debug');

  const debugMode = normalizeDebugMode(queryMode, normalizeDebugMode(BUILD_DEBUG_MODE, 'dev'));
  const fallbackEnabled = BUILD_DEBUG_ENABLED === true && debugMode !== 'prod';
  const debugEnabled = parseBooleanFlag(queryEnabled, fallbackEnabled);

  return {
    debugMode,
    debugEnabled
  };
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
