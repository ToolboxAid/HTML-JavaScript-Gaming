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

export function run() {
  assertSceneRendersVisibleWireframe(CubeExplorer3DScene, 'Sample 1601');
  assertSceneRendersVisibleWireframe(MazeRunner3DScene, 'Sample 1602');
  assertSceneRendersVisibleWireframe(Platformer3DBasicsScene, 'Sample 1604');
  assertMazeRunnerVisibilityAndMovement();
  assertPlatformerVisibilityAndInput();
}
