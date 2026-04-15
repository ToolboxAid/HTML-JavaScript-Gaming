/*
Toolbox Aid
David Quesenberry
04/15/2026
Phase16VisibilitySanity.test.mjs
*/
import assert from 'node:assert/strict';
import CubeExplorer3DScene from '../../samples/phase-16/1601/CubeExplorer3DScene.js';
import MazeRunner3DScene from '../../samples/phase-16/1602/MazeRunner3DScene.js';
import Platformer3DBasicsScene from '../../samples/phase-16/1604/Platformer3DBasicsScene.js';
import DrivingSandbox3DScene from '../../samples/phase-16/1605/DrivingSandbox3DScene.js';
import PhysicsPlayground3DScene from '../../samples/phase-16/1606/PhysicsPlayground3DScene.js';
import SpaceShooter3DScene from '../../samples/phase-16/1607/SpaceShooter3DScene.js';
import DungeonCrawler3DScene from '../../samples/phase-16/1608/DungeonCrawler3DScene.js';

function createCameraStub() {
  const state = {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
  };

  return {
    setPosition(position) {
      state.position = { ...position };
    },
    setRotation(rotation) {
      state.rotation = { ...rotation };
    },
    getState() {
      return {
        position: { ...state.position },
        rotation: { ...state.rotation },
      };
    },
  };
}

function makeInput(keys = []) {
  const down = new Set(keys);
  return {
    isDown(code) {
      return down.has(code);
    },
  };
}

function createRendererProbe(width = 960, height = 540) {
  const lines = [];
  return {
    lines,
    getCanvasSize() {
      return { width, height };
    },
    clear() {},
    strokeRect() {},
    drawText() {},
    drawRect() {},
    drawLine(x1, y1, x2, y2) {
      lines.push({ x1, y1, x2, y2 });
    },
  };
}

function countVisibleLinesInViewport(lines, viewport) {
  let visibleCount = 0;
  const xMin = viewport.x;
  const xMax = viewport.x + viewport.width;
  const yMin = viewport.y;
  const yMax = viewport.y + viewport.height;

  for (const line of lines) {
    const startVisible = line.x1 >= xMin && line.x1 <= xMax && line.y1 >= yMin && line.y1 <= yMax;
    const endVisible = line.x2 >= xMin && line.x2 <= xMax && line.y2 >= yMin && line.y2 <= yMax;
    const lineBoundsOverlapViewport =
      Math.max(line.x1, line.x2) >= xMin &&
      Math.min(line.x1, line.x2) <= xMax &&
      Math.max(line.y1, line.y2) >= yMin &&
      Math.min(line.y1, line.y2) <= yMax;

    if (startVisible || endVisible || lineBoundsOverlapViewport) {
      visibleCount += 1;
    }
  }

  return visibleCount;
}

function assertSceneRendersVisibleWireframe(SceneType, label) {
  const scene = new SceneType();
  const camera = createCameraStub();
  scene.setCamera3D(camera);
  const renderer = createRendererProbe();
  scene.render(renderer);

  const visibleLines = countVisibleLinesInViewport(renderer.lines, scene.viewport);
  assert.equal(visibleLines > 0, true, `${label} should render visible wireframe lines on initial frame.`);
}

function assertMazeRunnerVisibilityAndMovement() {
  const scene = new MazeRunner3DScene();
  scene.setCamera3D(createCameraStub());
  const transform = scene.world.requireComponent(scene.playerId, 'transform3D');
  const startZ = transform.z;
  scene.step3DPhysics(1 / 60, { input: makeInput(['KeyW']) });
  assert.equal(transform.z > startZ, true, 'Maze sample W input should move player forward.');
}

function assertPlatformerVisibilityAndInput() {
  const scene = new Platformer3DBasicsScene();
  scene.setCamera3D(createCameraStub());

  const transform = scene.world.requireComponent(scene.playerId, 'transform3D');
  const velocity = scene.world.requireComponent(scene.playerId, 'velocity3D');

  const startX = transform.x;
  scene.step3DPhysics(1 / 60, { input: makeInput(['KeyD']) });
  assert.equal(transform.x > startX, true, 'Platformer sample D input should move player right.');

  scene.step3DPhysics(1 / 60, { input: makeInput(['Space']) });
  assert.equal(velocity.y > 0, true, 'Platformer sample Space input should produce upward velocity.');
}

function assertDrivingVisibilityAndInput() {
  const scene = new DrivingSandbox3DScene();
  scene.setCamera3D(createCameraStub());

  const car = scene.world.requireComponent(scene.carId, 'transform3D');
  const startZ = car.z;
  scene.step3DPhysics(1 / 60, { input: makeInput(['KeyW']) });
  assert.equal(car.z > startZ, true, 'Driving sample W input should advance car forward.');

  const startHeading = scene.heading;
  for (let i = 0; i < 4; i += 1) {
    scene.step3DPhysics(1 / 60, { input: makeInput(['KeyW', 'KeyA']) });
  }
  const afterLeftHeading = scene.heading;
  assert.equal(afterLeftHeading < startHeading, true, 'Driving sample A hold should turn left.');

  scene.step3DPhysics(1 / 60, { input: makeInput(['KeyW']) });
  const afterReleaseHeading = scene.heading;
  scene.step3DPhysics(1 / 60, { input: makeInput(['KeyW']) });
  assert.equal(scene.heading, afterReleaseHeading, 'Driving sample steering should stop when A/D is released.');

  scene.step3DPhysics(1 / 60, { input: makeInput(['KeyW', 'KeyD']) });
  assert.equal(scene.heading > afterReleaseHeading, true, 'Driving sample D should engage immediately after left release.');
  const afterImmediateRightHeading = scene.heading;

  for (let i = 0; i < 3; i += 1) {
    scene.step3DPhysics(1 / 60, { input: makeInput(['KeyW', 'KeyD']) });
  }
  assert.equal(scene.heading > afterImmediateRightHeading, true, 'Driving sample D hold should continue turning right.');

  const beforeReverseHeading = scene.heading;
  scene.step3DPhysics(1 / 60, { input: makeInput(['KeyS', 'KeyD']) });
  assert.equal(scene.heading > beforeReverseHeading, true, 'Driving sample D should still steer right while reversing.');

  for (let i = 0; i < 120; i += 1) {
    scene.step3DPhysics(1 / 60, { input: makeInput(['KeyS']) });
  }
  assert.equal(scene.speed < 0, true, 'Driving sample S input should produce reverse motion.');
}

function assertPhysicsPlaygroundVisibilityAndInput() {
  const scene = new PhysicsPlayground3DScene();
  scene.setCamera3D(createCameraStub());

  const startVy = scene.bodies[0].velocity.y;
  scene.step3DPhysics(1 / 60, { input: makeInput(['Space']) });
  assert.equal(scene.bodies[0].velocity.y > startVy, true, 'Physics sample Space input should add upward impulse.');
}

function assertShooterVisibilityAndInput() {
  const scene = new SpaceShooter3DScene();
  scene.setCamera3D(createCameraStub());

  const startX = scene.ship.transform3D.x;
  scene.step3DPhysics(1 / 60, { input: makeInput(['KeyD']) });
  assert.equal(scene.ship.transform3D.x > startX, true, 'Shooter sample D input should move ship right.');

  scene.step3DPhysics(1 / 60, { input: makeInput(['Space']) });
  assert.equal(scene.bullets.length > 0, true, 'Shooter sample Space input should spawn a projectile.');
}

function assertDungeonVisibilityAndInput() {
  const scene = new DungeonCrawler3DScene();
  scene.setCamera3D(createCameraStub());

  const player = scene.world.requireComponent(scene.playerId, 'transform3D');
  const startZ = player.z;
  scene.step3DPhysics(1 / 60, { input: makeInput(['KeyW']) });
  assert.equal(player.z > startZ, true, 'Dungeon sample W input should move explorer forward.');
}

export function run() {
  assertSceneRendersVisibleWireframe(CubeExplorer3DScene, 'Sample 1601');
  assertSceneRendersVisibleWireframe(MazeRunner3DScene, 'Sample 1602');
  assertSceneRendersVisibleWireframe(Platformer3DBasicsScene, 'Sample 1604');
  assertSceneRendersVisibleWireframe(DrivingSandbox3DScene, 'Sample 1605');
  assertSceneRendersVisibleWireframe(PhysicsPlayground3DScene, 'Sample 1606');
  assertSceneRendersVisibleWireframe(SpaceShooter3DScene, 'Sample 1607');
  assertSceneRendersVisibleWireframe(DungeonCrawler3DScene, 'Sample 1608');
  assertMazeRunnerVisibilityAndMovement();
  assertPlatformerVisibilityAndInput();
  assertDrivingVisibilityAndInput();
  assertPhysicsPlaygroundVisibilityAndInput();
  assertShooterVisibilityAndInput();
  assertDungeonVisibilityAndInput();
}
