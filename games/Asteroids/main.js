/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import Engine from '../../engine/core/Engine.js';
import { InputService } from '../../engine/input/index.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import { createSampleGameDevConsoleIntegration } from '../../tools/dev/devConsoleIntegration.js';
import { createAsteroidsShowcaseDebugPlugin } from './debug/asteroidsShowcaseDebug.js';
import AsteroidsGameScene from './game/AsteroidsGameScene.js';

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
    debugEnabled
  };
}

export async function bootAsteroids({
  documentRef = globalThis.document ?? null,
  EngineClass = Engine,
  InputServiceClass = InputService,
  SceneClass = AsteroidsGameScene,
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
    ? createSampleGameDevConsoleIntegration({
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

  if (devConsoleIntegration) {
    devConsoleIntegration.executeCommand('asteroidsshowcase.preset.default');
    devConsoleIntegration.getRuntime?.().hideOverlay?.();
  }

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
