/*
Toolbox Aid
David Quesenberry
03/22/2026
CapturePreviewRuntime.js
*/
import Engine from '../../../src/engine/core/Engine.js';
import InputService from '../../../src/engine/input/InputService.js';

const capturePreviewTheme = {
  color: {
    textPrimary: '#333333',
  },
  document: {
    background: 'linear-gradient(to bottom, #e2e0ff, #6259ab)',
    height: '100%',
  },
};

function applyCapturePreviewDocumentTheme() {
  const root = document.documentElement;
  const body = document.body;
  const doc = capturePreviewTheme.document;

  if (!root || !body || !doc) {
    return;
  }

  root.style.height = doc.height;
  body.style.height = doc.height;
  body.style.margin = '0';
  body.style.background = doc.background;

  if (capturePreviewTheme.color.textPrimary) {
    body.style.color = capturePreviewTheme.color.textPrimary;
  }
}

export async function bootCapturePreview({
  canvas,
  width,
  height,
  fontSpec = '',
  createScene,
  configureScene = null,
  readyDelayMs = 300,
} = {}) {
  if (!canvas || typeof createScene !== 'function') {
    throw new Error('Capture preview requires a canvas and createScene function.');
  }

  applyCapturePreviewDocumentTheme();

  if (fontSpec && document.fonts?.load) {
    try {
      await document.fonts.load(fontSpec);
    } catch {
      // Keep capture flow resilient if a custom font is unavailable.
    }
  }

  const engine = new Engine({
    canvas,
    width,
    height,
    fixedStepMs: 1000 / 60,
    input: new InputService(),
  });

  const scene = createScene();
  configureScene?.(scene, engine);
  engine.setScene(scene);
  engine.start();

  window.__captureReady = false;
  globalThis.setTimeout?.(() => {
    window.__captureReady = true;
  }, readyDelayMs);

  return { engine, scene };
}
