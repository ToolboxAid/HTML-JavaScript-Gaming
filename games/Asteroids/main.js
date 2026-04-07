/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import Engine from '../../src/engine/core/Engine.js';
import { InputService } from '../../src/engine/input/index.js';
import { Theme, ThemeTokens } from '../../src/engine/theme/index.js';
import { createSampleGameDevConsoleIntegration } from '../../tools/dev/devConsoleIntegration.js';
import { createAsteroidsShowcaseDebugPlugin } from './debug/asteroidsShowcaseDebug.js';
import AsteroidsGameScene from './game/AsteroidsGameScene.js';

const theme = new Theme(ThemeTokens);
const BUILD_DEBUG_MODE = 'prod';
const BUILD_DEBUG_ENABLED = false;
const DEBUG_STATE_STORAGE_KEY = 'toolbox.sample.asteroids.debug.enabled';

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

function readStoredBoolean(key) {
  if (!key || typeof globalThis.localStorage === 'undefined') {
    return null;
  }

  try {
    const value = globalThis.localStorage.getItem(key);
    if (value === '1') {
      return true;
    }
    if (value === '0') {
      return false;
    }
  } catch {
    return null;
  }

  return null;
}

function writeStoredBoolean(key, value) {
  if (!key || typeof globalThis.localStorage === 'undefined') {
    return;
  }

  try {
    globalThis.localStorage.setItem(key, value ? '1' : '0');
  } catch {
    // Ignore storage failures to keep startup resilient.
  }
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
  const queryRemember = searchParams.get('rememberDebug');
  const queryDemo = searchParams.get('debugDemo');
  const localDebugEnvironment = isLocalDebugEnvironment(documentRef);
  const rememberDebugState = parseBooleanFlag(queryRemember, false);
  const demoMode = parseBooleanFlag(queryDemo, false);
  const defaultMode = localDebugEnvironment
    ? 'dev'
    : normalizeDebugMode(BUILD_DEBUG_MODE, 'prod');
  const debugMode = normalizeDebugMode(queryMode, demoMode ? 'qa' : defaultMode);
  const fallbackEnabled = (BUILD_DEBUG_ENABLED === true || localDebugEnvironment) && debugMode !== 'prod';
  const storedDebugEnabled = rememberDebugState && queryEnabled === null
    ? readStoredBoolean(DEBUG_STATE_STORAGE_KEY)
    : null;
  const debugEnabled = demoMode
    ? true
    : parseBooleanFlag(queryEnabled, storedDebugEnabled ?? fallbackEnabled);

  if (rememberDebugState) {
    writeStoredBoolean(DEBUG_STATE_STORAGE_KEY, debugEnabled);
  }

  return {
    debugMode,
    debugEnabled,
    rememberDebugState,
    demoMode
  };
}

function applyDefaultDebugPreset(devConsoleIntegration, presetCommands) {
  if (!devConsoleIntegration || typeof devConsoleIntegration.executeCommand !== 'function') {
    return '';
  }

  const commands = Array.isArray(presetCommands) ? presetCommands : [];
  for (const command of commands) {
    const normalized = sanitizeText(command);
    if (!normalized) {
      continue;
    }
    const execution = devConsoleIntegration.executeCommand(normalized);
    if (execution?.status === 'ready') {
      return normalized;
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
  const demoMode = debugConfig?.demoMode === true;
  const rememberDebugState = debugConfig?.rememberDebugState === true;

  if (badge) {
    badge.textContent = debugEnabled ? 'Debug: ON' : 'Debug: OFF';
    badge.classList.remove('is-on', 'is-off');
    badge.classList.add(debugEnabled ? 'is-on' : 'is-off');
  }

  if (button) {
    button.disabled = !debugEnabled || !devConsoleIntegration;
    button.addEventListener('click', () => {
      const runtime = devConsoleIntegration?.getRuntime?.();
      runtime?.showOverlay?.();
    });
  }

  if (miniHelp) {
    miniHelp.innerHTML = debugEnabled
      ? 'Debug is active. Use <code>Shift+`</code> for console and <code>Ctrl+Shift+`</code> for overlay, or click <strong>Open Debug Panel</strong>.'
      : 'Debug is disabled by default. Add <code>?debug=1</code> to enable it, or <code>?debugDemo=1</code> for one-click demo mode.';
  }

  if (presetHelp) {
    const presetLabel = sanitizeText(appliedPresetCommand) || 'none';
    const rememberLabel = rememberDebugState ? 'remember=on' : 'remember=off';
    const demoLabel = demoMode ? 'demo=on' : 'demo=off';
    presetHelp.innerHTML = debugEnabled
      ? `Default preset loaded: <code>${presetLabel}</code>. Overlay stays hidden until opened. <code>${rememberLabel}</code>, <code>${demoLabel}</code>.`
      : 'Add <code>&amp;rememberDebug=1</code> to persist debug ON/OFF in this browser. Demo mode auto-opens debug surfaces.';
  }
}

export async function bootAsteroids({
  documentRef = globalThis.document ?? null,
  EngineClass = Engine,
  InputServiceClass = InputService,
  SceneClass = AsteroidsGameScene,
  createDevConsoleIntegration = createSampleGameDevConsoleIntegration
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

  if (documentRef.fonts?.load) {
    try {
      await documentRef.fonts.load('24px "Vector Battle"');
    } catch {
      // Keep booting if the custom font fails to load.
    }
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
        sampleId: 'asteroids-showcase',
        debugMode: debugConfig.debugMode,
        activatePluginsOnInit: true,
        pluginFeatureFlags: {
          asteroidsShowcaseDebug: true
        },
        plugins: [
          createAsteroidsShowcaseDebugPlugin()
        ]
      })
    : null;

  const appliedPresetCommand = applyDefaultDebugPreset(devConsoleIntegration, [
    'asteroidsshowcase.preset.default',
    'preset.apply preset.gameplay',
    'preset.apply preset.minimal'
  ]);

  if (devConsoleIntegration) {
    const runtime = devConsoleIntegration.getRuntime?.();
    runtime?.hideOverlay?.();
    runtime?.hideConsole?.();
    if (debugConfig.demoMode) {
      runtime?.showOverlay?.();
      runtime?.showConsole?.();
    }
  }

  updateDebugShowcaseUi(documentRef, debugConfig, devConsoleIntegration, appliedPresetCommand);

  engine.setScene(new SceneClass({
    devConsoleIntegration,
    debugConfig
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
  void bootAsteroids();
}
