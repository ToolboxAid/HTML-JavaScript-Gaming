/*
Toolbox Aid
David Quesenberry
03/24/2026
main.js
*/
import Engine from '/src/engine/core/Engine.js';
import { InputService } from '/src/engine/input/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import {
  parseBooleanFlag,
  normalizeDebugMode,
  readStoredBoolean,
  writeStoredBoolean,
  isLocalDebugEnvironment,
  resolveDebugConfig,
} from '../../src/shared/utils/debugConfigUtils.js';
import { createNoopDevConsoleIntegration } from '../../src/shared/utils/createNoopDevConsoleIntegration.js';
import BreakoutScene from './game/BreakoutScene.js';
import { loadGameSkin } from '/games/shared/gameSkinLoader.js';

const theme = new Theme(ThemeTokens);
const BUILD_DEBUG_MODE = 'prod';
const BUILD_DEBUG_ENABLED = false;
const DEBUG_STATE_STORAGE_KEY = 'toolbox.sample.breakout.debug.enabled';

function sanitizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
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
      : 'Debug is disabled by default. Add <code>?debug=1</code> to enable it, or <code>?debugDemo=1</code> for one-click demo mode.';
  }

  if (presetHelp) {
    const rememberLabel = rememberDebugState ? 'remember=on' : 'remember=off';
    const demoLabel = demoMode ? 'demo=on' : 'demo=off';
    presetHelp.innerHTML = debugEnabled
      ? `Default preset loaded: <code>${sanitizeText(appliedPresetCommand) || 'none'}</code>. Overlay stays hidden until opened. <code>${rememberLabel}</code>, <code>${demoLabel}</code>.`
      : 'Add <code>&amp;rememberDebug=1</code> to persist debug ON/OFF in this browser. Demo mode auto-opens debug surfaces.';
  }
}

export function bootBreakout({
  documentRef = globalThis.document ?? null,
  EngineClass = Engine,
  InputServiceClass = InputService,
  SceneClass = BreakoutScene,
  createDevConsoleIntegration = createNoopDevConsoleIntegration,
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
  const runtime = devConsoleIntegration?.getRuntime?.();
  runtime?.hideOverlay?.();
  runtime?.hideConsole?.();
  if (debugConfig.demoMode) {
    runtime?.showOverlay?.();
    runtime?.showConsole?.();
  }

  updateDebugShowcaseUi(documentRef, debugConfig, devConsoleIntegration, appliedPresetCommand);

  void loadGameSkin({
    gameId: 'Breakout',
    fallbackSchema: 'games.breakout.skin/1'
  }).then(({ skin }) => {
    const scene = new SceneClass({
      devConsoleIntegration,
      debugConfig,
      skin
    });
    engine.setScene(scene);
    engine.start();
  }).catch((error) => {
    console.error('[Breakout] Skin load failed. Game startup stopped.', error);
  });

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
