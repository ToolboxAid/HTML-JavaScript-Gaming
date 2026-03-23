/*
 Toolbox Aid
 David Quesenberry
 03/23/2026
 StorageService.test.mjs
*/
import assert from 'node:assert/strict';
import { StorageService } from '../../engine/persistence/index.js';
import { SettingsSystem } from '../../engine/release/index.js';

function withBlockedLocalStorage(run) {
  const originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');

  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    get() {
      throw new Error('localStorage unavailable');
    },
  });

  try {
    run();
  } finally {
    if (originalDescriptor) {
      Object.defineProperty(globalThis, 'localStorage', originalDescriptor);
    } else {
      delete globalThis.localStorage;
    }
  }
}

export function run() {
  withBlockedLocalStorage(() => {
    const storage = new StorageService();
    const settings = new SettingsSystem({
      namespace: 'test:blocked-storage',
      defaults: {
        audio: { musicVolume: 0.8 },
        video: { fullscreenPreferred: false },
      },
    });

    assert.equal(storage.storage, null);
    assert.equal(storage.saveJson('settings', { ok: true }), false);
    assert.deepEqual(storage.loadJson('settings', { ok: false }), { ok: false });

    assert.deepEqual(settings.load(), {
      audio: { musicVolume: 0.8 },
      video: { fullscreenPreferred: false },
    });
    assert.deepEqual(settings.save(), {
      audio: { musicVolume: 0.8 },
      video: { fullscreenPreferred: false },
    });
  });

  const throwingStorage = {
    setItem() {
      throw new Error('quota exceeded');
    },
    getItem() {
      throw new Error('blocked');
    },
  };

  const storage = new StorageService(throwingStorage);
  assert.equal(storage.saveJson('settings', { ok: true }), false);
  assert.deepEqual(storage.loadJson('settings', { ok: false }), { ok: false });
}
