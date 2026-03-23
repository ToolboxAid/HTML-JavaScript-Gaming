/*
 Toolbox Aid
 David Quesenberry
 03/23/2026
 GravityWellReplay.test.mjs
*/
import assert from 'node:assert/strict';
import GravityWellScene from '../../games/GravityWell/game/GravityWellScene.js';
import GravityWellWorld from '../../games/GravityWell/game/GravityWellWorld.js';

function createInput(activeKeys = []) {
  const keys = new Set(activeKeys);
  return {
    isDown(code) {
      return keys.has(code);
    },
  };
}

function createSceneEngine(activeKeys = []) {
  return {
    canvas: {
      style: {},
    },
    input: createInput(activeKeys),
  };
}

function assertClose(actual, expected, tolerance = 1e-9) {
  assert.equal(Math.abs(actual - expected) <= tolerance, true);
}

function snapshotWorld(world) {
  return {
    x: world.ship.x,
    y: world.ship.y,
    vx: world.ship.vx,
    vy: world.ship.vy,
    angle: world.ship.angle,
    elapsedSeconds: world.elapsedSeconds,
    status: world.status,
    statusMessage: world.statusMessage,
    collectedCount: world.collectedCount,
    remainingBeacons: world.remainingBeacons,
  };
}

export function run() {
  const recordingScene = new GravityWellScene();
  recordingScene.update(0.016, createSceneEngine(['KeyR']));
  assert.equal(recordingScene.phase, 'playing');
  assert.equal(recordingScene.replay.recording, true);
  assert.equal(recordingScene.replay.getReplay().initialState.status, 'running');

  const script = [
    { dtSeconds: 0.2, keys: ['ArrowUp'] },
    { dtSeconds: 0.2, keys: ['ArrowRight', 'ArrowUp'] },
    { dtSeconds: 0.15, keys: [] },
    { dtSeconds: 0.1, keys: ['Space'] },
    { dtSeconds: 0.2, keys: ['ArrowLeft', 'ArrowUp'] },
  ];

  for (const step of script) {
    recordingScene.update(step.dtSeconds, createSceneEngine(step.keys));
  }

  recordingScene.phase = 'won';
  recordingScene.replay.stopRecording({ finalState: recordingScene.world.getState() });
  const replay = recordingScene.replay.getReplay();
  assert.equal(replay.frames.length, script.length);
  assert.equal(replay.frames[0].input.thrust, true);
  assert.equal(replay.frames[1].input.right, true);
  assert.equal(typeof replay.frames[0].events.status, 'string');

  const liveWorld = new GravityWellWorld({ width: 960, height: 720 });
  const replayWorld = new GravityWellWorld({ width: 960, height: 720 });
  replayWorld.loadState(replay.initialState);

  for (const frame of replay.frames) {
    liveWorld.update(frame.dtSeconds, createInput([
      ...(frame.input.left ? ['ArrowLeft'] : []),
      ...(frame.input.right ? ['ArrowRight'] : []),
      ...(frame.input.thrust ? ['ArrowUp'] : []),
      ...(frame.input.brake ? ['Space'] : []),
    ]));
    replayWorld.update(frame.dtSeconds, createInput([
      ...(frame.input.left ? ['ArrowLeft'] : []),
      ...(frame.input.right ? ['ArrowRight'] : []),
      ...(frame.input.thrust ? ['ArrowUp'] : []),
      ...(frame.input.brake ? ['Space'] : []),
    ]));
  }

  const liveSnapshot = snapshotWorld(liveWorld);
  const replaySnapshot = snapshotWorld(replayWorld);
  assertClose(liveSnapshot.x, replaySnapshot.x);
  assertClose(liveSnapshot.y, replaySnapshot.y);
  assertClose(liveSnapshot.vx, replaySnapshot.vx);
  assertClose(liveSnapshot.vy, replaySnapshot.vy);
  assertClose(liveSnapshot.angle, replaySnapshot.angle);
  assertClose(liveSnapshot.elapsedSeconds, replaySnapshot.elapsedSeconds);
  assert.equal(liveSnapshot.status, replaySnapshot.status);
  assert.equal(liveSnapshot.collectedCount, replaySnapshot.collectedCount);

  const playbackScene = new GravityWellScene();
  playbackScene.replay.loadReplay(replay);
  playbackScene.phase = 'menu';
  playbackScene.update(0.016, createSceneEngine(['KeyP']));
  assert.equal(playbackScene.replay.playing, true);
  assert.equal(playbackScene.phase, 'playing');

  for (const step of script) {
    playbackScene.update(step.dtSeconds, createSceneEngine());
  }

  const playbackSnapshot = snapshotWorld(playbackScene.world);
  assertClose(playbackSnapshot.x, replaySnapshot.x);
  assertClose(playbackSnapshot.y, replaySnapshot.y);
  assertClose(playbackSnapshot.vx, replaySnapshot.vx);
  assertClose(playbackSnapshot.vy, replaySnapshot.vy);
  assertClose(playbackSnapshot.angle, replaySnapshot.angle);
  assertClose(playbackSnapshot.elapsedSeconds, replaySnapshot.elapsedSeconds);
  assert.equal(playbackSnapshot.status, replaySnapshot.status);
  assert.equal(playbackSnapshot.collectedCount, replaySnapshot.collectedCount);
}
