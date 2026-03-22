/*
Toolbox Aid
David Quesenberry
03/22/2026
FullscreenService.test.mjs
*/
import assert from 'node:assert/strict';
import { FullscreenService } from '../../engine/runtime/index.js';

export async function run() {
  let fullscreenElement = null;
  const listeners = new Map();
  const documentRef = {
    get fullscreenElement() {
      return fullscreenElement;
    },
    addEventListener(type, handler) {
      listeners.set(type, handler);
    },
    removeEventListener(type) {
      listeners.delete(type);
    },
    async exitFullscreen() {
      fullscreenElement = null;
      listeners.get('fullscreenchange')?.();
    },
  };

  const target = {
    async requestFullscreen() {
      fullscreenElement = target;
      listeners.get('fullscreenchange')?.();
    },
  };

  const fullscreen = new FullscreenService({ documentRef, target });
  fullscreen.attach();

  assert.equal(fullscreen.getState().supported, true);
  assert.equal(fullscreen.getState().available, true);
  assert.equal(fullscreen.getState().active, false);

  assert.equal(await fullscreen.request(), true);
  assert.equal(fullscreen.getState().active, true);

  assert.equal(await fullscreen.exit(), true);
  assert.equal(fullscreen.getState().active, false);

  fullscreen.detach();
}
