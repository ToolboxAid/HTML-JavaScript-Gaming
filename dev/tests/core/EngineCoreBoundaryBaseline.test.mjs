/*
Toolbox Aid
David Quesenberry
04/14/2026
EngineCoreBoundaryBaseline.test.mjs
*/
import assert from 'node:assert/strict';
import Engine from '../../../www/src/engine/core/Engine.js';
import FrameClock from '../../../www/src/engine/core/FrameClock.js';
import FixedTicker from '../../../www/src/engine/core/FixedTicker.js';
import RuntimeMetrics from '../../../www/src/engine/core/RuntimeMetrics.js';
import EventBus from '../../../www/src/engine/events/EventBus.js';
import Camera2D from '../../../www/src/engine/camera/Camera2D.js';
import Camera3D from '../../../www/src/engine/camera/Camera3D.js';
import { followCameraTarget, worldRectToScreen } from '../../../www/src/engine/camera/CameraSystem.js';
import Scene from '../../../www/src/engine/scene/Scene.js';
import SceneManager from '../../../www/src/engine/scene/SceneManager.js';
import CanvasRenderer from '../../../www/src/engine/rendering/CanvasRenderer.js';
import { renderByLayers } from '../../../www/src/engine/rendering/LayeredRenderSystem.js';
import InputService from '../../../www/src/engine/input/InputService.js';
import ActionInputService from '../../../www/src/engine/input/ActionInputService.js';
import { stepArcadeBody } from '../../../www/src/engine/physics/arcadeBody.js';
import { applyDrag } from '../../../www/src/engine/physics/drag.js';
import { integrateVelocity3D } from '../../../www/src/engine/physics/integration3d.js';
import { isAabbColliding3D, resolveAabbCollision3D } from '../../../www/src/engine/physics/collision3d.js';
import { stepSceneBodies3D } from '../../../www/src/engine/physics/scene3d.js';
import AudioService from '../../../www/src/engine/audio/AudioService.js';
import { moveEntities, moveEntities3D } from '../../../www/src/engine/systems/MovementSystem.js';
import { stepWorldPhysics3D } from '../../../www/src/engine/systems/PhysicsSystem.js';

export function run() {
  // Core boot/timing boundaries.
  assert.equal(typeof Engine, 'function');
  assert.equal(typeof FrameClock, 'function');
  assert.equal(typeof FixedTicker, 'function');
  assert.equal(typeof RuntimeMetrics, 'function');

  // Scene/render/input/physics/audio/systems public homes.
  assert.equal(typeof Scene, 'function');
  assert.equal(typeof SceneManager, 'function');
  assert.equal(typeof CanvasRenderer, 'function');
  assert.equal(typeof renderByLayers, 'function');
  assert.equal(typeof InputService, 'function');
  assert.equal(typeof ActionInputService, 'function');
  assert.equal(typeof stepArcadeBody, 'function');
  assert.equal(typeof applyDrag, 'function');
  assert.equal(typeof integrateVelocity3D, 'function');
  assert.equal(typeof isAabbColliding3D, 'function');
  assert.equal(typeof resolveAabbCollision3D, 'function');
  assert.equal(typeof stepSceneBodies3D, 'function');
  assert.equal(typeof AudioService, 'function');
  assert.equal(typeof moveEntities, 'function');
  assert.equal(typeof moveEntities3D, 'function');
  assert.equal(typeof stepArcadeBody, 'function');
  assert.equal(typeof stepWorldPhysics3D, 'function');

  // Combined service cluster contracts: timing/frame, event routing, camera.
  const frameClock = new FrameClock({ now: () => 100, maxDeltaMs: 100 });
  frameClock.reset(100);
  const tick = frameClock.tick(116);
  assert.equal(tick.deltaMs, 16);

  const ticker = new FixedTicker({ stepMs: 10, maxCatchUpSteps: 5 });
  const steps = [];
  const tickerResult = ticker.advance(25, (stepSeconds) => steps.push(stepSeconds));
  assert.equal(tickerResult.steps, 2);
  assert.deepEqual(steps, [0.01, 0.01]);

  const bus = new EventBus();
  let eventSeen = 0;
  bus.on('engine.core.boundary', () => {
    eventSeen += 1;
  });
  assert.equal(bus.emit('engine.core.boundary', { ok: true }), 1);
  assert.equal(eventSeen, 1);

  const camera = new Camera2D({
    x: 0,
    y: 0,
    viewportWidth: 100,
    viewportHeight: 100,
    worldWidth: 300,
    worldHeight: 300,
  });
  const target = { x: 80, y: 50, width: 20, height: 20 };
  followCameraTarget(camera, target, true);
  const rect = worldRectToScreen(camera, { x: 100, y: 100, width: 10, height: 10 });
  assert.equal(typeof rect.x, 'number');
  assert.equal(typeof rect.y, 'number');
  assert.equal(rect.width, 10);
  assert.equal(rect.height, 10);

  const camera3D = new Camera3D({
    position: { x: 1, y: 2, z: 3 },
    rotation: { x: 0.1, y: 0.2, z: 0.3 },
  });
  camera3D.translate({ x: 2, y: -1, z: 5 });
  camera3D.rotate({ y: 0.5 });
  const camera3DState = camera3D.getState();
  assert.equal(camera3DState.position.x, 3);
  assert.equal(camera3DState.position.y, 1);
  assert.equal(camera3DState.position.z, 8);
  assert.equal(camera3DState.rotation.x, 0.1);
  assert.equal(camera3DState.rotation.y, 0.7);
  assert.equal(camera3DState.rotation.z, 0.3);

  const movingBody = {
    x: 0,
    y: 0,
    z: 0,
    width: 2,
    height: 2,
    depth: 2,
    velocityX: 6,
    velocityY: 0,
    velocityZ: 0,
  };
  const wallBody = {
    x: 4,
    y: 0,
    z: 0,
    width: 2,
    height: 2,
    depth: 2,
  };

  integrateVelocity3D(movingBody, 0.5);
  assert.equal(movingBody.x, 3);
  assert.equal(isAabbColliding3D(movingBody, wallBody), true);

  const resolveResult = resolveAabbCollision3D(movingBody, wallBody);
  assert.equal(resolveResult.collided, true);
  assert.equal(resolveResult.axis, 'x');
  assert.equal(movingBody.x, 2);
  assert.equal(movingBody.velocityX, 0);

  const scene3D = {
    bodies3D: [
      {
        x: 0,
        y: 0,
        z: 0,
        width: 2,
        height: 2,
        depth: 2,
        velocityX: 2,
        velocityY: 0,
        velocityZ: 0,
      },
    ],
    staticColliders3D: [],
  };
  const stepSummary = stepSceneBodies3D(scene3D, 0.5);
  assert.equal(stepSummary.movedBodies, 1);
  assert.equal(stepSummary.resolvedCollisions, 0);
  assert.equal(scene3D.bodies3D[0].x, 1);

  const { world: world3D, movingEntity, blockingEntity } = worldFor3DSystem();
  const before3D = world3D.getComponent(movingEntity, 'transform3D');
  assert.equal(before3D.x, 0);
  assert.equal(before3D.z, 8);
  const physics3DSummary = stepWorldPhysics3D(world3D, 1);
  const after3D = world3D.getComponent(movingEntity, 'transform3D');
  const velocity3D = world3D.getComponent(movingEntity, 'velocity3D');
  assert.equal(physics3DSummary.movedEntities, 1);
  assert.equal(physics3DSummary.collisionCount >= 1, true);
  assert.equal(after3D.x >= 0, true);
  assert.equal(after3D.x <= 1.6, true);
  assert.equal(velocity3D.x, 0);
  assert.equal(world3D.getComponent(blockingEntity, 'transform3D').x, 2.5);
}

function worldFor3DSystem() {
  const world = {
    entities: new Set([1, 2]),
    components: new Map([
      ['transform3D', new Map([
        [1, { x: 0, y: 0, z: 8, previousX: 0, previousY: 0, previousZ: 8 }],
        [2, { x: 2.5, y: 0, z: 8, previousX: 2.5, previousY: 0, previousZ: 8 }],
      ])],
      ['size3D', new Map([
        [1, { width: 1.6, height: 1.6, depth: 1.6 }],
        [2, { width: 1.6, height: 1.6, depth: 1.6 }],
      ])],
      ['velocity3D', new Map([
        [1, { x: 2, y: 0, z: 0 }],
      ])],
      ['collider3D', new Map([
        [1, { enabled: true, solid: false }],
      ])],
      ['solid3D', new Map([
        [2, { enabled: true }],
      ])],
    ]),
    getEntitiesWith(...componentNames) {
      return Array.from(this.entities).filter((entityId) =>
        componentNames.every((name) => this.components.get(name)?.has(entityId))
      );
    },
    requireComponent(entityId, name) {
      const component = this.components.get(name)?.get(entityId);
      if (!component) {
        throw new Error(`Missing component ${name} on entity ${entityId}`);
      }
      return component;
    },
    getComponent(entityId, name) {
      return this.components.get(name)?.get(entityId);
    },
  };

  return {
    world,
    movingEntity: 1,
    blockingEntity: 2,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
