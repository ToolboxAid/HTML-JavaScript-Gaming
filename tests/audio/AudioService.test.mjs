/*
Toolbox Aid
David Quesenberry
03/24/2026
AudioService.test.mjs
*/
import assert from 'node:assert/strict';
import { AudioService } from '/src/engine/audio/index.js';

function createTarget() {
  const listeners = new Map();
  return {
    listeners,
    addEventListener(type, handler) {
      listeners.set(type, handler);
    },
    removeEventListener(type) {
      listeners.delete(type);
    },
    async trigger(type) {
      return listeners.get(type)?.();
    },
  };
}

export async function run() {
  const calls = [];
  let resumeCount = 0;
  const backend = {
    isSupported: () => true,
    resume: async () => {
      resumeCount += 1;
      return true;
    },
    playTone: async (payload) => {
      calls.push(payload);
      return true;
    },
  };

  const target = createTarget();
  const audio = new AudioService({ backend, unlockTarget: target });
  audio.attach();
  assert.equal(target.listeners.has('pointerdown'), true);
  await target.trigger('pointerdown');
  assert.equal(resumeCount, 1);

  await audio.playOneShot('serve', { frequency: 440, durationSeconds: 0.05, volume: 0.1 });
  assert.equal(calls.length, 1);
  assert.equal(audio.getTrackState('serve').lastNote.frequency, 440);

  audio.setMuted(true);
  await audio.playOneShot('muted', { frequency: 220, durationSeconds: 0.05, volume: 0.1 });
  assert.equal(calls.length, 1);
  assert.equal(audio.getSnapshot().muted, true);

  audio.detach();
  assert.equal(target.listeners.size, 0);
}
