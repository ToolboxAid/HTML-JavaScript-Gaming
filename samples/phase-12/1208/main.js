/*
Toolbox Aid
David Quesenberry
03/31/2026
main.js
*/
import Engine from '/src/engine/core/Engine.js';
import { InputService } from '/src/engine/input/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import ToolFormattedTilesParallaxScene from './ToolFormattedTilesParallaxScene.js';
import { createLivePreviewSyncBridge } from '/tools/shared/livePreviewSyncChannel.js';

async function loadSamplePreset() {
  try {
    const response = await fetch('./sample-1208-parallax-editor.json', { cache: 'no-store' });
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch {
    return null;
  }
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

const samplePreset = await loadSamplePreset();
const scene = new ToolFormattedTilesParallaxScene({ samplePreset });
const livePreviewSync = createLivePreviewSyncBridge({ sourceId: 'sample-1208-live-preview' });
livePreviewSync.subscribe((payload) => {
  scene.applyLivePreviewUpdate(payload);
});
scene.setRuntimeBindingPublisher((payload) => {
  livePreviewSync.publish(payload, 'runtime-state-binding');
});
engine.setScene(scene);
engine.start();
