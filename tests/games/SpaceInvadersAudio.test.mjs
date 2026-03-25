/*
Toolbox Aid
David Quesenberry
03/24/2026
SpaceInvadersAudio.test.mjs
*/
import assert from 'node:assert/strict';
import SpaceInvadersAudio from '../../games/SpaceInvaders/game/SpaceInvadersAudio.js';

class MockAudio {
  static instances = [];
  static playCount = 0;
  static pauseCount = 0;

  constructor(src) {
    this.src = src;
    this.loop = false;
    this.volume = 1;
    this.playCalled = 0;
    this.pauseCalled = 0;
    this.paused = false;
    this.ended = false;
    MockAudio.instances.push(this);
  }

  play() {
    this.playCalled += 1;
    MockAudio.playCount += 1;
    this.paused = false;
    this.ended = false;
    return Promise.resolve();
  }

  pause() {
    this.pauseCalled += 1;
    MockAudio.pauseCount += 1;
    this.paused = true;
  }
}

function withMockAudio(testFn) {
  return () => {
    const original = global.Audio;
    MockAudio.instances = [];
    MockAudio.playCount = 0;
    MockAudio.pauseCount = 0;
    global.Audio = MockAudio;
    try {
      testFn();
    } finally {
      global.Audio = original;
    }
  };
}

const testUfoLoopStartsAndStops = withMockAudio(() => {
  const audio = new SpaceInvadersAudio();
  audio.startUfoLoop(1);
  assert.equal(MockAudio.instances.length, 1);
  assert.equal(MockAudio.instances[0].loop, true);
  audio.stopUfoLoop();
  assert.equal(MockAudio.pauseCount, 1);
  assert.equal(audio.ufoLoop, null);
});

const testUfoLoopDoesNotDuplicate = withMockAudio(() => {
  const audio = new SpaceInvadersAudio();
  audio.startUfoLoop(1);
  audio.startUfoLoop(1);
  assert.equal(MockAudio.instances.length, 1);
});

const testUfoLoopSwitchesDirection = withMockAudio(() => {
  const audio = new SpaceInvadersAudio();
  audio.startUfoLoop(1);
  audio.startUfoLoop(-1);
  assert.equal(MockAudio.instances.length, 2);
  assert.equal(MockAudio.pauseCount, 1);
  assert.equal(audio.ufoLoopId, 'ufo_highpitch');
});

const testUfoLoopStopsWhenMuted = withMockAudio(() => {
  const audio = new SpaceInvadersAudio();
  audio.startUfoLoop(1);
  audio.setMuted(true);
  assert.equal(audio.ufoLoop, null);
  assert.equal(MockAudio.pauseCount, 1);
  audio.setMuted(false);
  audio.startUfoLoop(1);
  assert.equal(MockAudio.instances.length, 2);
});

const testPlayHonorsMute = withMockAudio(() => {
  const audio = new SpaceInvadersAudio();
  audio.setMuted(true);
  const result = audio.play('shoot');
  assert.equal(result, null);
  assert.equal(MockAudio.playCount, 0);
});

const testUfoLoopResumesIfEnded = withMockAudio(() => {
  const audio = new SpaceInvadersAudio();
  audio.startUfoLoop(1);
  const loop = audio.ufoLoop;
  loop.ended = true;
  loop.paused = false;
  audio.startUfoLoop(1);
  assert.equal(loop.playCalled >= 2, true);
});

const testUfoLoopNudgesIfPlaying = withMockAudio(() => {
  const audio = new SpaceInvadersAudio();
  audio.startUfoLoop(1);
  const loop = audio.ufoLoop;
  const before = loop.playCalled;
  audio.startUfoLoop(1);
  assert.equal(loop.playCalled > before, true);
});

export function run() {
  testUfoLoopStartsAndStops();
  testUfoLoopDoesNotDuplicate();
  testUfoLoopSwitchesDirection();
  testUfoLoopStopsWhenMuted();
  testPlayHonorsMute();
  testUfoLoopResumesIfEnded();
  testUfoLoopNudgesIfPlaying();
}
