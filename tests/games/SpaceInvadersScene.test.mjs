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

function createPressedInput(codes = []) {
  const set = new Set(codes);
  return {
    isPressed(code) {
      return set.has(code);
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

function testAttractModeIdleEnterAndInputExit() {
  const scene = new SpaceInvadersScene();
  scene.audio = createAudioSpy();
  scene.world.status = 'menu';
  scene.inputController = {
    getFrameState: () => createFrame(),
  };

  const idleSeconds = scene.attractController.idleTimeoutMs / 1000;
  scene.update(Math.max(0, idleSeconds - 0.001));
  assert.equal(scene.attractController.active, false);

  scene.update(0.001);
  assert.equal(scene.attractController.active, true);

  scene.inputController = {
    getFrameState: () => createFrame({ startPressed: true }),
  };
  scene.update(0.016);
  assert.equal(scene.attractController.active, false);
}

function testQualifyingGameOverStartsInitialsEntry() {
  const scene = new SpaceInvadersScene();
  scene.audio = createAudioSpy();
  scene.world.status = 'game-over';
  scene.world.players = [{ score: 2100, lives: 0 }, { score: 0, lives: 0 }];
  scene.inputController = {
    input: createPressedInput([]),
    getFrameState: () => createFrame(),
  };

  scene.update(1 / 60);
  assert.equal(scene.initialsEntry.active, true);

  scene.inputController = {
    input: createPressedInput(['KeyD']),
    getFrameState: () => createFrame(),
  };
  scene.update(1 / 60);
  scene.inputController = {
    input: createPressedInput(['KeyQ']),
    getFrameState: () => createFrame(),
  };
  scene.update(1 / 60);
  scene.inputController = {
    input: createPressedInput(['KeyZ']),
    getFrameState: () => createFrame(),
  };
  scene.update(1 / 60);
  scene.inputController = {
    input: createPressedInput(['Enter']),
    getFrameState: () => createFrame(),
  };
  scene.update(1 / 60);

  assert.equal(scene.initialsEntry.active, false);
  assert.equal(scene.world.status, 'menu');
  assert.equal(scene.highScoreRows[0].initials, 'DQZ');
}

export function run() {
  testUfoLoopStopsOnGameOverEvenIfUfoSpriteRemains();
  testPauseStopsUfoLoopImmediately();
  testAttractModeIdleEnterAndInputExit();
  testQualifyingGameOverStartsInitialsEntry();
}
