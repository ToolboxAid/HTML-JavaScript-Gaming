/*
Toolbox Aid
David Quesenberry
03/24/2026
main.js
*/
import Engine from '../../engine/core/Engine.js';
import { InputService } from '../../engine/input/index.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import { createSampleGameDevConsoleIntegration } from '../../tools/dev/devConsoleIntegration.js';
import BreakoutScene from './game/BreakoutScene.js';

const theme = new Theme(ThemeTokens);
const BUILD_DEBUG_MODE = 'prod';
const BUILD_DEBUG_ENABLED = false;

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

function normalizeDebugMode(value, fallback = 'prod') {
  const normalized = sanitizeText(value).toLowerCase();
  if (normalized === 'dev' || normalized === 'qa' || normalized === 'prod') {
    return normalized;
  }
  return fallback;
}

function isLocalDebugEnvironment(documentRef) {
  const protocol = sanitizeText(documentRef?.location?.protocol) || sanitizeText(globalThis?.location?.protocol);
  const hostname = sanitizeText(documentRef?.location?.hostname) || sanitizeText(globalThis?.location?.hostname);

  if (protocol === 'file:') {
    return true;
  }

  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

function resolveDebugConfig(documentRef) {
  const search = sanitizeText(documentRef?.location?.search) || sanitizeText(globalThis?.location?.search);
  const searchParams = new URLSearchParams(search);
  const queryMode = searchParams.get('debugMode');
  const queryEnabled = searchParams.get('debug');
  const localDebugEnvironment = isLocalDebugEnvironment(documentRef);
  const defaultMode = localDebugEnvironment
    ? 'dev'
    : normalizeDebugMode(BUILD_DEBUG_MODE, 'prod');
  const debugMode = normalizeDebugMode(queryMode, defaultMode);
  const fallbackEnabled = (BUILD_DEBUG_ENABLED === true || localDebugEnvironment) && debugMode !== 'prod';
  const debugEnabled = parseBooleanFlag(queryEnabled, fallbackEnabled);

  return {
    debugMode,
    debugEnabled,
  };
}

function applyDefaultDebugPreset(devConsoleIntegration) {
  if (!devConsoleIntegration || typeof devConsoleIntegration.executeCommand !== 'function') {
    return '';
  }

  const defaultPresetCommands = [
    'preset.apply preset.gameplay',
    'preset.apply preset.minimal',
  ];
  for (const command of defaultPresetCommands) {
    const execution = devConsoleIntegration.executeCommand(command);
    if (execution?.status === 'ready') {
      return command;
    }
  }

  return '';
}

function updateDebugShowcaseUi(documentRef, debugConfig, devConsoleIntegration, appliedPresetCommand) {
  const badge = documentRef?.getElementById?.('debugStateBadge') ?? null;
  const button = documentRef?.getElementById?.('openDebugPanelButton') ?? null;
  const miniHelp = documentRef?.getElementById?.('debugMiniHelp') ?? null;
  const presetHelp = documentRef?.getElementById?.('debugPresetHelp') ?? null;
  const debugEnabled = debugConfig?.debugEnabled === true;

  if (badge) {
    badge.textContent = debugEnabled ? 'Debug: ON' : 'Debug: OFF';
    badge.classList.remove('is-on', 'is-off');
    badge.classList.add(debugEnabled ? 'is-on' : 'is-off');
  }

  if (button) {
    button.disabled = !debugEnabled || !devConsoleIntegration;
    button.addEventListener('click', () => {
      if (!devConsoleIntegration) {
        return;
      }
      const runtime = devConsoleIntegration.getRuntime?.();
      runtime?.showOverlay?.();
    });
  }

  if (miniHelp) {
    miniHelp.innerHTML = debugEnabled
      ? 'Debug is active. Use <code>Shift+`</code> for console and <code>Ctrl+Shift+`</code> for overlay, or click <strong>Open Debug Panel</strong>.'
      : 'Debug is disabled by default. Add <code>?debug=1</code> to the URL to enable the showcase tools.';
  }

  if (presetHelp) {
    presetHelp.innerHTML = debugEnabled
      ? `Default preset loaded: <code>${sanitizeText(appliedPresetCommand) || 'none'}</code>. Overlay stays hidden until opened.`
      : 'When debug is enabled, Breakout auto-loads <code>preset.gameplay</code> and keeps overlay hidden until you open it.';
  }
}

export function bootBreakout({
  documentRef = globalThis.document ?? null,
  EngineClass = Engine,
  InputServiceClass = InputService,
  SceneClass = BreakoutScene,
  createDevConsoleIntegration = createSampleGameDevConsoleIntegration,
} = {}) {
  if (!documentRef) {
    return null;
  }

  if (documentRef === globalThis.document && documentRef.documentElement && documentRef.body) {
    theme.applyDocumentTheme();
  }

  const canvas = documentRef.getElementById?.('game') ?? null;
  if (!canvas) {
    return null;
  }

  const input = new InputServiceClass();
  const engine = new EngineClass({
    canvas,
    width: 960,
    height: 720,
    fixedStepMs: 1000 / 60,
    input,
  });

  const debugConfig = resolveDebugConfig(documentRef);
  const devConsoleIntegration = debugConfig.debugEnabled
    ? createDevConsoleIntegration({
        sampleId: 'breakout-debug-showcase',
        debugMode: debugConfig.debugMode,
        activatePluginsOnInit: true,
      })
    : null;

  const appliedPresetCommand = applyDefaultDebugPreset(devConsoleIntegration);
  devConsoleIntegration?.getRuntime?.().hideOverlay?.();
  devConsoleIntegration?.getRuntime?.().hideConsole?.();

  updateDebugShowcaseUi(documentRef, debugConfig, devConsoleIntegration, appliedPresetCommand);

  engine.setScene(new SceneClass({
    devConsoleIntegration,
    debugConfig,
  }));
  engine.start();

  canvas.addEventListener?.('click', async () => {
    const fullscreenState = engine.fullscreen?.getState?.();
    if (!fullscreenState?.available || fullscreenState.active) {
      return;
    }

    await engine.fullscreen.request();
  });

  return engine;
}

if (typeof document !== 'undefined') {
  bootBreakout();
}
