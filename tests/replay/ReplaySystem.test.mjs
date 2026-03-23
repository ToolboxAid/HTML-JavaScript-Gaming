/*
 Toolbox Aid
 David Quesenberry
 03/23/2026
 ReplaySystem.test.mjs
*/
import assert from 'node:assert/strict';
import { ReplaySystem } from '../../engine/replay/index.js';

export function run() {
  const replay = new ReplaySystem();
  const initialState = {
    ship: { x: 1, y: 2 },
  };

  replay.startRecording({
    metadata: { game: 'GravityWell' },
    initialState,
  });

  const recordedFrame = {
    dtSeconds: 1 / 60,
    input: { thrust: true, left: false, right: false, brake: false },
    events: { status: 'running', collectedBeacon: false },
  };
  replay.recordFrame(recordedFrame);
  recordedFrame.input.thrust = false;
  replay.stopRecording({
    finalState: {
      ship: { x: 10, y: 20 },
      status: 'won',
    },
  });

  const savedReplay = replay.getReplay();
  assert.equal(savedReplay.metadata.game, 'GravityWell');
  assert.equal(savedReplay.initialState.ship.x, 1);
  assert.equal(savedReplay.frames.length, 1);
  assert.equal(savedReplay.frames[0].input.thrust, true);
  assert.equal(savedReplay.finalState.status, 'won');

  const loadedReplay = replay.loadReplay(savedReplay);
  assert.equal(loadedReplay.frames.length, 1);
  assert.equal(replay.startPlayback(), true);
  assert.deepEqual(replay.nextFrame(), savedReplay.frames[0]);
  assert.equal(replay.nextFrame(), null);
  assert.equal(replay.playing, false);
}
