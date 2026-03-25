/*
Toolbox Aid
David Quesenberry
03/25/2026
SpaceInvadersScene.test.mjs
*/
import assert from 'node:assert/strict';
import SpaceInvadersScene from '../../games/SpaceInvaders/game/SpaceInvadersScene.js';

function createFrame(overrides = {}) {
  return {
    moveAxis: 0,
    firePressed: false,
    startPressed: false,
    pausePressed: false,
    menuPressed: false,
    debugPressed: false,
    select1Pressed: false,
    select2Pressed: false,
    ...overrides,
  };
}

function createAudioSpy() {
  return {
    played: [],
    startCalls: [],
    stopCalls: 0,
    play(effectId) {
      this.played.push(effectId);
    },
    startUfoLoop(direction) {
      this.startCalls.push(direction);
    },
    stopUfoLoop() {
      this.stopCalls += 1;
    },
  };
}

function testUfoLoopStopsOnGameOverEvenIfUfoSpriteRemains() {
  const scene = new SpaceInvadersScene();
  scene.audio = createAudioSpy();
  scene.inputController = {
    getFrameState: () => createFrame(),
  };
  scene.world.status = 'game-over';
  scene.world.gameOver = true;
  scene.world.ufo = { x: 100, y: 90, width: 48, height: 24, speed: 0 };

  scene.update(1 / 60);

  assert.equal(scene.audio.startCalls.length, 0);
  assert.equal(scene.audio.stopCalls, 1);
}

function testPauseStopsUfoLoopImmediately() {
  const scene = new SpaceInvadersScene();
  scene.audio = createAudioSpy();
  scene.inputController = {
    getFrameState: () => createFrame({ pausePressed: true }),
  };
  scene.world.status = 'playing';
  scene.world.ufo = { x: 100, y: 90, width: 48, height: 24, speed: 0 };

  scene.update(1 / 60);

  assert.equal(scene.isPaused, true);
  assert.equal(scene.audio.startCalls.length, 0);
  assert.equal(scene.audio.stopCalls, 1);
}

export function run() {
  testUfoLoopStopsOnGameOverEvenIfUfoSpriteRemains();
  testPauseStopsUfoLoopImmediately();
}
