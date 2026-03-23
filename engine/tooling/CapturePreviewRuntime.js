/*
Toolbox Aid
David Quesenberry
03/22/2026
CapturePreviewRuntime.js
*/
import Engine from '../core/Engine.js';
import { InputService } from '../input/index.js';
import { Theme, ThemeTokens } from '../theme/index.js';

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

  const theme = new Theme(ThemeTokens);
  theme.applyDocumentTheme();

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
