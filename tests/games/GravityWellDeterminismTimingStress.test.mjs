/*
 Toolbox Aid
 David Quesenberry
 03/23/2026
 GravityWellDeterminismTimingStress.test.mjs
*/
import assert from 'node:assert/strict';
import GravityWellWorld from '../../games/GravityWell/game/GravityWellWorld.js';

function createInput(activeKeys = []) {
  const keys = new Set(activeKeys);
  return {
    isDown(code) {
      return keys.has(code);
    },
  };
}

function assertClose(actual, expected, tolerance, label) {
  assert.equal(
    Math.abs(actual - expected) <= tolerance,
    true,
    `${label}: expected ${expected}, received ${actual}, tolerance ${tolerance}`,
  );
}

function createSandboxWorld() {
  const world = new GravityWellWorld({ width: 1600, height: 1200 });
  world.planets = [
    { x: 900, y: 360, radius: 48, strength: 120000, color: '#38bdf8' },
  ];
  world.beacons = [
    { x: 1450, y: 1040, radius: 14, color: '#f8fafc', collected: false },
  ];
  world.beaconSeed = world.beacons.map((beacon) => ({
    x: beacon.x,
    y: beacon.y,
    radius: beacon.radius,
    color: beacon.color,
  }));
  world.ship.x = 220;
  world.ship.y = 860;
  world.ship.vx = 28;
  world.ship.vy = -18;
  world.ship.angle = 0.42;
  world.ship.thrusting = false;
  world.elapsedSeconds = 0;
  world.status = 'running';
  world.statusMessage = 'Collect every beacon.';
  world.collectedCount = 0;
  world.lastGravity = { x: 0, y: 0 };
  world.trail = [];
  return world;
}

function createTimedScript() {
  return [
    { dtSeconds: 0.35, keys: ['ArrowUp'] },
    { dtSeconds: 0.2, keys: ['ArrowRight', 'ArrowUp'] },
    { dtSeconds: 0.15, keys: [] },
    { dtSeconds: 0.25, keys: ['Space'] },
    { dtSeconds: 0.45, keys: ['ArrowLeft', 'ArrowUp'] },
    { dtSeconds: 0.2, keys: ['ArrowUp'] },
  ];
}

function runSegments(world, segments) {
  for (const segment of segments) {
    world.update(segment.dtSeconds, createInput(segment.keys));
  }
  return snapshotWorld(world);
}

function runSegmentsStepped(world, segments, stepSeconds = 1 / 60) {
  for (const segment of segments) {
    let remaining = segment.dtSeconds;
    while (remaining > 1e-9) {
      const dt = Math.min(stepSeconds, remaining);
      world.update(dt, createInput(segment.keys));
      remaining -= dt;
    }
  }
  return snapshotWorld(world);
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
    trailLength: world.trail.length,
    lastGravityX: world.lastGravity.x,
    lastGravityY: world.lastGravity.y,
  };
}

export function run() {
  const replayScript = createTimedScript();
  const replayA = runSegments(createSandboxWorld(), replayScript);
  const replayB = runSegments(createSandboxWorld(), replayScript);
  assert.deepEqual(replayA, replayB);

  const coarseComparisonScript = [
    { dtSeconds: 0.75, keys: ['ArrowUp'] },
    { dtSeconds: 0.5, keys: ['ArrowRight', 'ArrowUp'] },
    { dtSeconds: 0.25, keys: ['Space'] },
  ];
  const coarseState = runSegments(createSandboxWorld(), coarseComparisonScript);
  const steppedState = runSegmentsStepped(createSandboxWorld(), coarseComparisonScript);
  assertClose(coarseState.x, steppedState.x, 0.01, 'coarse-vs-stepped x');
  assertClose(coarseState.y, steppedState.y, 0.01, 'coarse-vs-stepped y');
  assertClose(coarseState.vx, steppedState.vx, 0.01, 'coarse-vs-stepped vx');
  assertClose(coarseState.vy, steppedState.vy, 0.01, 'coarse-vs-stepped vy');
  assertClose(coarseState.angle, steppedState.angle, 1e-9, 'coarse-vs-stepped angle');
  assert.equal(coarseState.status, steppedState.status);
  assert.equal(coarseState.collectedCount, steppedState.collectedCount);

  const winCoarseWorld = new GravityWellWorld({ width: 960, height: 720 });
  winCoarseWorld.planets = [];
  winCoarseWorld.beacons = [
    { x: 118, y: 200, radius: 14, color: '#fff', collected: false },
  ];
  winCoarseWorld.beaconSeed = [
    { x: 118, y: 200, radius: 14, color: '#fff' },
  ];
  winCoarseWorld.ship.x = 100;
  winCoarseWorld.ship.y = 200;
  winCoarseWorld.ship.vx = 0;
  winCoarseWorld.ship.vy = 0;
  winCoarseWorld.ship.angle = Math.PI / 2;
  const winCoarseResult = winCoarseWorld.update(0.5, createInput(['ArrowUp']));

  const winSteppedWorld = new GravityWellWorld({ width: 960, height: 720 });
  winSteppedWorld.planets = [];
  winSteppedWorld.beacons = [
    { x: 118, y: 200, radius: 14, color: '#fff', collected: false },
  ];
  winSteppedWorld.beaconSeed = [
    { x: 118, y: 200, radius: 14, color: '#fff' },
  ];
  winSteppedWorld.ship.x = 100;
  winSteppedWorld.ship.y = 200;
  winSteppedWorld.ship.vx = 0;
  winSteppedWorld.ship.vy = 0;
  winSteppedWorld.ship.angle = Math.PI / 2;
  let winSteppedResult = null;
  for (let index = 0; index < 30; index += 1) {
    winSteppedResult = winSteppedWorld.update(1 / 60, createInput(['ArrowUp']));
  }

  assert.equal(winCoarseResult.status, 'won');
  assert.equal(winSteppedResult.status, 'won');
  assert.equal(winCoarseWorld.status, winSteppedWorld.status);
  assert.equal(winCoarseWorld.collectedCount, winSteppedWorld.collectedCount);

  const lossCoarseWorld = new GravityWellWorld({ width: 960, height: 720 });
  lossCoarseWorld.planets = [
    { x: 160, y: 220, radius: 30, strength: 0, color: '#fff' },
  ];
  lossCoarseWorld.beacons = [
    { x: 700, y: 600, radius: 14, color: '#fff', collected: false },
  ];
  lossCoarseWorld.beaconSeed = [
    { x: 700, y: 600, radius: 14, color: '#fff' },
  ];
  lossCoarseWorld.ship.x = 100;
  lossCoarseWorld.ship.y = 220;
  lossCoarseWorld.ship.vx = 90;
  lossCoarseWorld.ship.vy = 0;
  lossCoarseWorld.ship.angle = Math.PI / 2;
  const lossCoarseResult = lossCoarseWorld.update(0.5, createInput());

  const lossSteppedWorld = new GravityWellWorld({ width: 960, height: 720 });
  lossSteppedWorld.planets = [
    { x: 160, y: 220, radius: 30, strength: 0, color: '#fff' },
  ];
  lossSteppedWorld.beacons = [
    { x: 700, y: 600, radius: 14, color: '#fff', collected: false },
  ];
  lossSteppedWorld.beaconSeed = [
    { x: 700, y: 600, radius: 14, color: '#fff' },
  ];
  lossSteppedWorld.ship.x = 100;
  lossSteppedWorld.ship.y = 220;
  lossSteppedWorld.ship.vx = 90;
  lossSteppedWorld.ship.vy = 0;
  lossSteppedWorld.ship.angle = Math.PI / 2;
  let lossSteppedResult = null;
  for (let index = 0; index < 30; index += 1) {
    lossSteppedResult = lossSteppedWorld.update(1 / 60, createInput());
  }

  assert.equal(lossCoarseResult.status, 'lost');
  assert.equal(lossSteppedResult.status, 'lost');
  assert.equal(lossCoarseWorld.status, lossSteppedWorld.status);

  const longRunWorld = new GravityWellWorld({ width: 100000, height: 100000 });
  longRunWorld.planets = [];
  longRunWorld.beacons = [
    { x: 90000, y: 90000, radius: 14, color: '#fff', collected: false },
  ];
  longRunWorld.beaconSeed = [
    { x: 90000, y: 90000, radius: 14, color: '#fff' },
  ];
  longRunWorld.ship.x = 50000;
  longRunWorld.ship.y = 50000;
  longRunWorld.ship.vx = 10;
  longRunWorld.ship.vy = -5;
  longRunWorld.ship.angle = 0;
  longRunWorld.elapsedSeconds = 0;
  longRunWorld.status = 'running';
  longRunWorld.collectedCount = 0;
  longRunWorld.trail = [];
  for (let frame = 0; frame < 600; frame += 1) {
    const keys = [];
    if (frame % 12 < 6) {
      keys.push('ArrowUp');
    }
    if (frame % 90 >= 30 && frame % 90 < 60) {
      keys.push('ArrowRight');
    } else if (frame % 90 >= 60) {
      keys.push('ArrowLeft');
    }
    if (frame % 75 >= 50) {
      keys.push('Space');
    }
    longRunWorld.update(1 / 30, createInput(keys));
    assert.equal(Number.isFinite(longRunWorld.ship.x), true);
    assert.equal(Number.isFinite(longRunWorld.ship.y), true);
    assert.equal(Number.isFinite(longRunWorld.ship.vx), true);
    assert.equal(Number.isFinite(longRunWorld.ship.vy), true);
    assert.equal(Number.isFinite(longRunWorld.lastGravity.x), true);
    assert.equal(Number.isFinite(longRunWorld.lastGravity.y), true);
    assert.equal(longRunWorld.getShipSpeed() <= 450.000001, true);
  }

  assertClose(longRunWorld.elapsedSeconds, 20, 1e-9, 'long-run elapsedSeconds');
  assert.equal(longRunWorld.trail.length <= 120, true);
  assert.equal(longRunWorld.status, 'running');
}
