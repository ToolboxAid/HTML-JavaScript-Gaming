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
const BREAKOUT_DEFAULT_SKIN_PATH = '/games/Breakout/assets/skins/default.json';
const BREAKOUT_FALLBACK_SKIN = Object.freeze({
  documentKind: 'game-skin',
  schema: 'games.breakout.skin/1',
  version: 1,
  gameId: 'Breakout',
  name: 'Breakout Classic Skin',
  colors: {
    background: '#000000',
    wall: '#f8f8f2',
    paddle: '#f8f8f2',
    ball: '#f8f8f2',
    text: '#04040A',
    muted: '#a0a0a0',
    panel: '#000000',
    brickRows: ['#ff595e', '#ff924c', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93']
  },
  sizing: {
    paddleWidth: 118,
    paddleHeight: 18,
    ballSize: 14,
    brickWidth: 78,
    brickHeight: 24,
    brickGap: 6
  }
});

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

  const scene = new SceneClass({
    devConsoleIntegration,
    debugConfig,
    skin: BREAKOUT_FALLBACK_SKIN
  });

  void loadGameSkin({
    gameId: 'Breakout',
    defaultSkinPath: BREAKOUT_DEFAULT_SKIN_PATH,
    fallbackSkin: BREAKOUT_FALLBACK_SKIN,
    fallbackSchema: 'games.breakout.skin/1'
  }).then(({ skin }) => {
    scene.applySkin?.(skin);
  });

  engine.setScene(scene);
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
