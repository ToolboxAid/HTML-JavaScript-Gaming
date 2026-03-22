/*
Toolbox Aid
David Quesenberry
03/22/2026
PlatformUxSystems.test.mjs
*/
import assert from 'node:assert/strict';
import { AudioService, MidiPlayer, FrequencyPlayer, Synthesizer, MediaTrackService, PlaylistManager } from '../../engine/audio/index.js';
import { ParticleSystem } from '../../engine/fx/index.js';
import { UIFramework } from '../../engine/ui/index.js';
import { InputContextService } from '../../engine/input/index.js';
import { SceneTransitionController } from '../../engine/scenes/index.js';
import { SaveSlotManager, StorageService, CookieStorageService } from '../../engine/persistence/index.js';
import { Logger, ErrorBoundary } from '../../engine/logging/index.js';

class MemoryStorage {
  constructor() {
    this.values = new Map();
  }

  setItem(key, value) {
    this.values.set(key, value);
  }

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null;
  }

  removeItem(key) {
    this.values.delete(key);
  }
}

export async function run() {
  const backendCalls = [];
  const backend = {
    isSupported: () => true,
    resume: async () => true,
    playTone: async (payload) => {
      backendCalls.push(payload);
      return true;
    },
  };

  const audio = new AudioService({ backend });
  await audio.resume();
  audio.playMusic('bgm', {
    loop: true,
    notes: [
      { frequency: 220, durationSeconds: 0.1 },
      { frequency: 330, durationSeconds: 0.1 },
    ],
  });
  audio.update(0.11);
  assert.equal(audio.getTrackState('bgm').triggeredCount >= 2, true);

  const midi = new MidiPlayer(audio);
  midi.play('midi', [{ noteNumber: 69, durationSeconds: 0.1 }]);
  assert.equal(audio.getTrackState('midi').category, 'midi');

  const synth = new Synthesizer(audio);
  await synth.playNote('lead', { frequency: 550, waveform: 'triangle' });
  assert.equal(audio.getTrackState('lead').lastNote.frequency, 550);

  const frequencyPlayer = new FrequencyPlayer(audio);
  frequencyPlayer.play('freq', [{ frequency: 440, durationSeconds: 0.1 }]);
  assert.equal(audio.getTrackState('freq').category, 'frequency');

  const particles = new ParticleSystem();
  particles.spawnExplosion({ x: 10, y: 10, count: 8 });
  particles.update(0.2);
  assert.equal(particles.getSnapshot().length > 0, true);

  const fakeAudioFactory = (src) => ({
    src,
    currentTime: 0,
    duration: 12,
    loop: false,
    volume: 1,
    paused: true,
    async play() {
      this.paused = false;
    },
    pause() {
      this.paused = true;
    },
  });
  const mediaTracks = new MediaTrackService({
    backend: {
      isSupported: () => true,
      createTrack: fakeAudioFactory,
    },
  });
  mediaTracks.register('track-a', { src: '/audio/a.mp3', loop: true, volume: 0.4 });
  await mediaTracks.play('track-a');
  mediaTracks.seek('track-a', 3);
  assert.equal(mediaTracks.getState('track-a').paused, false);
  assert.equal(mediaTracks.getState('track-a').currentTime, 3);

  mediaTracks.register('track-b', { src: '/audio/b.mp3' });
  const playlist = new PlaylistManager(mediaTracks);
  playlist.registerPlaylist('mix', ['track-a', 'track-b']);
  assert.equal(playlist.getState('mix').currentTrackId, 'track-a');
  playlist.next('mix');
  assert.equal(playlist.getState('mix').currentTrackId, 'track-b');

  const ui = new UIFramework();
  let clicked = null;
  ui.addButton({
    id: 'confirm',
    x: 10,
    y: 10,
    width: 120,
    height: 40,
    text: 'Confirm',
    onClick: () => {
      clicked = 'confirm';
    },
  });
  assert.equal(ui.click(20, 20), 'confirm');
  assert.equal(clicked, 'confirm');

  const input = new InputContextService({
    contexts: {
      gameplay: { jump: ['Space'] },
      menu: { confirm: ['Enter'] },
    },
    initialContext: 'gameplay',
  });
  assert.equal(input.getContext(), 'gameplay');
  assert.equal(input.setContext('menu'), true);
  assert.deepEqual(input.actionMap.getActions(), ['confirm']);

  const transitions = new SceneTransitionController();
  const transitionScene = transitions.create({ fromScene: {}, toScene: {}, durationSeconds: 0.5 });
  assert.equal(typeof transitionScene.update, 'function');

  const storage = new StorageService(new MemoryStorage());
  const slots = new SaveSlotManager({ storage, namespace: 'test:saves' });
  slots.saveSlot('slot-1', { label: 'Slot 1', hp: 3 });
  slots.saveSlot('slot-2', { label: 'Slot 2', hp: 5 });
  assert.equal(slots.listSlots().length, 2);
  assert.equal(slots.loadSlot('slot-2').hp, 5);

  const cookieDocument = { cookie: '' };
  const cookies = new CookieStorageService({ documentRef: cookieDocument });
  cookies.set('theme', 'mint');
  assert.equal(cookies.get('theme'), 'mint');
  cookies.remove('theme');
  assert.equal(cookies.get('theme'), null);

  const logger = new Logger({ channel: 'test', level: 'debug' });
  logger.info('hello', { ok: true });
  const boundary = new ErrorBoundary({ logger });
  const fallback = boundary.run(() => {
    throw new Error('boom');
  }, 'safe');
  assert.equal(fallback, 'safe');
  assert.equal(logger.getEntries().length >= 2, true);
  assert.equal(backendCalls.length >= 3, true);
}
