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
import ToolFormattedTilesParallaxScene from './ToolFormattedTilesParallaxScene.js';
import { createLivePreviewSyncBridge } from '/tools/shared/livePreviewSyncChannel.js';

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

const scene = new ToolFormattedTilesParallaxScene();
const livePreviewSync = createLivePreviewSyncBridge({ sourceId: 'sample-1208-live-preview' });
livePreviewSync.subscribe((payload) => {
  scene.applyLivePreviewUpdate(payload);
});
scene.setRuntimeBindingPublisher((payload) => {
  livePreviewSync.publish(payload, 'runtime-state-binding');
});
engine.setScene(scene);
engine.start();
// Keep explicit palette JSON discoverable by audit tooling.
const SAMPLE_1208_PALETTE_PATH = './sample.1208.palette.json';
void SAMPLE_1208_PALETTE_PATH;

