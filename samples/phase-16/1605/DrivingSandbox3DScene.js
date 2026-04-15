/*
Toolbox Aid
David Quesenberry
04/15/2026
DrivingSandbox3DScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';
import { World } from '/src/engine/ecs/index.js';
import { stepWorldPhysics3D } from '/src/engine/systems/index.js';
import { createProjectionViewport, drawGroundGrid, drawWireBox, projectPoint } from '../shared/threeDWireframe.js';

const theme = new Theme(ThemeTokens);
const BOX_EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 0],
  [4, 5], [5, 6], [6, 7], [7, 4],
  [0, 4], [1, 5], [2, 6], [3, 7],
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeAngle(angle) {
  let value = angle;
  const fullTurn = Math.PI * 2;
  while (value > Math.PI) value -= fullTurn;
  while (value < -Math.PI) value += fullTurn;
  return value;
}

function rotateYaw(localX, localZ, yaw) {
  const cos = Math.cos(yaw);
  const sin = Math.sin(yaw);
  return {
    x: localX * cos + localZ * sin,
    z: -localX * sin + localZ * cos,
  };
}

function createOrientedBoxVertices(transform3D, size3D, yaw) {
  const halfWidth = size3D.width * 0.5;
  const halfHeight = size3D.height * 0.5;
  const halfDepth = size3D.depth * 0.5;
  const centerX = transform3D.x + halfWidth;
  const centerY = transform3D.y + halfHeight;
  const centerZ = transform3D.z + halfDepth;

  const localVertices = [
    { x: -halfWidth, y: -halfHeight, z: -halfDepth },
    { x: halfWidth, y: -halfHeight, z: -halfDepth },
    { x: halfWidth, y: halfHeight, z: -halfDepth },
    { x: -halfWidth, y: halfHeight, z: -halfDepth },
    { x: -halfWidth, y: -halfHeight, z: halfDepth },
    { x: halfWidth, y: -halfHeight, z: halfDepth },
    { x: halfWidth, y: halfHeight, z: halfDepth },
    { x: -halfWidth, y: halfHeight, z: halfDepth },
  ];

  return localVertices.map((localVertex) => {
    const rotated = rotateYaw(localVertex.x, localVertex.z, yaw);
    return {
      x: centerX + rotated.x,
      y: centerY + localVertex.y,
      z: centerZ + rotated.z,
    };
  });
}

function drawOrientedWireBox(renderer, transform3D, size3D, yaw, cameraState, viewport, color) {
  const vertices = createOrientedBoxVertices(transform3D, size3D, yaw);
  const projected = vertices.map((vertex) => projectPoint(vertex, cameraState, viewport));

  for (const [startIndex, endIndex] of BOX_EDGES) {
    const start = projected[startIndex];
    const end = projected[endIndex];
    if (!start || !end) {
      continue;
    }
    renderer.drawLine(start.x, start.y, end.x, end.y, color, 2);
  }
}

function drawVehicleHeadingMarker(renderer, transform3D, size3D, yaw, cameraState, viewport) {
  const halfWidth = size3D.width * 0.5;
  const halfHeight = size3D.height * 0.5;
  const halfDepth = size3D.depth * 0.5;
  const centerX = transform3D.x + halfWidth;
  const centerY = transform3D.y + halfHeight;
  const centerZ = transform3D.z + halfDepth;

  const roofLocal = { x: 0, y: halfHeight * 0.55, z: 0 };
  const frontLocal = { x: 0, y: halfHeight * 0.45, z: halfDepth + 0.15 };
  const noseLocal = { x: 0, y: halfHeight * 0.45, z: halfDepth + 0.95 };

  const toWorld = (local) => {
    const rotated = rotateYaw(local.x, local.z, yaw);
    return {
      x: centerX + rotated.x,
      y: centerY + local.y,
      z: centerZ + rotated.z,
    };
  };

  const roof = projectPoint(toWorld(roofLocal), cameraState, viewport);
  const front = projectPoint(toWorld(frontLocal), cameraState, viewport);
  const nose = projectPoint(toWorld(noseLocal), cameraState, viewport);

  if (roof && front) {
    renderer.drawLine(roof.x, roof.y, front.x, front.y, '#fde68a', 2);
  }
  if (front && nose) {
    renderer.drawLine(front.x, front.y, nose.x, nose.y, '#fde68a', 3);
  }
}

export default class DrivingSandbox3DScene extends Scene {
  constructor() {
    super();
    this.world = new World();
    this.speed = 0;
    this.heading = 0;
    this.maxForwardSpeed = 12.5;
    this.maxReverseSpeed = 4.8;
    this.accel = 20;
    this.drag = 10;
    this.turnRate = 1.8;
    this.chaseDistance = 9.4;
    this.chaseHeight = 5.4;
    this.chaseLookAhead = 2.8;
    this.chaseYawLerp = 0.2;
    this.cameraPitch = -0.38;
    this.cameraYaw = 0;
    this.cameraInitialized = false;
    this.distance = 0;
    this.viewport = {
      x: 40,
      y: 170,
      width: 860,
      height: 320,
      focalLength: 460,
    };
    this.worldBounds = {
      x: -14,
      y: -1,
      z: 2,
      width: 28,
      height: 5,
      depth: 36,
    };
    this.lastPhysicsSummary = { movedEntities: 0, collisionCount: 0 };

    this.carId = this.world.createEntity();
    this.world.addComponent(this.carId, 'transform3D', {
      x: 0,
      y: 0,
      z: 8.5,
      previousX: 0,
      previousY: 0,
      previousZ: 8.5,
    });
    this.world.addComponent(this.carId, 'size3D', { width: 1.3, height: 0.9, depth: 2.2 });
    this.world.addComponent(this.carId, 'velocity3D', { x: 0, y: 0, z: 0 });
    this.world.addComponent(this.carId, 'collider3D', { enabled: true, solid: false });
    this.world.addComponent(this.carId, 'renderable3D', { color: '#7dd3fc' });

    this.buildTrack();
  }

  buildTrack() {
    const blockers = [
      { x: -13.8, y: -0.1, z: 2.2, width: 0.8, height: 1.6, depth: 35.2, color: '#fca5a5' },
      { x: 13.0, y: -0.1, z: 2.2, width: 0.8, height: 1.6, depth: 35.2, color: '#fca5a5' },
      { x: -13.8, y: -0.1, z: 2.0, width: 27.6, height: 1.6, depth: 0.8, color: '#fca5a5' },
      { x: -13.8, y: -0.1, z: 37.2, width: 27.6, height: 1.6, depth: 0.8, color: '#fca5a5' },
      { x: -7.8, y: -0.1, z: 14.5, width: 1.2, height: 1.4, depth: 1.2, color: '#fbbf24' },
      { x: -1.8, y: -0.1, z: 20.5, width: 1.2, height: 1.4, depth: 1.2, color: '#fbbf24' },
      { x: 4.2, y: -0.1, z: 12.5, width: 1.2, height: 1.4, depth: 1.2, color: '#fbbf24' },
      { x: 8.2, y: -0.1, z: 27.5, width: 1.2, height: 1.4, depth: 1.2, color: '#fbbf24' },
      { x: -5.5, y: -0.1, z: 30.0, width: 11.0, height: 1.2, depth: 0.7, color: '#fb7185' },
    ];

    blockers.forEach((blocker) => {
      const id = this.world.createEntity();
      this.world.addComponent(id, 'transform3D', {
        x: blocker.x,
        y: blocker.y,
        z: blocker.z,
        previousX: blocker.x,
        previousY: blocker.y,
        previousZ: blocker.z,
      });
      this.world.addComponent(id, 'size3D', {
        width: blocker.width,
        height: blocker.height,
        depth: blocker.depth,
      });
      this.world.addComponent(id, 'solid3D', { enabled: true });
      this.world.addComponent(id, 'renderable3D', { color: blocker.color });
    });
  }

  setCamera3D(camera3D) {
    this.camera3D = camera3D;
    this.syncCamera();
  }

  syncCamera() {
    if (!this.camera3D) {
      return;
    }

    const car = this.world.requireComponent(this.carId, 'transform3D');
    const forwardX = Math.sin(this.heading);
    const forwardZ = Math.cos(this.heading);
    const lookTargetX = car.x + forwardX * this.chaseLookAhead;
    const lookTargetZ = car.z + forwardZ * this.chaseLookAhead;
    const cameraX = car.x - forwardX * this.chaseDistance;
    const cameraZ = car.z - forwardZ * this.chaseDistance;
    const targetYaw = Math.atan2(lookTargetX - cameraX, lookTargetZ - cameraZ);

    if (!this.cameraInitialized) {
      this.cameraYaw = targetYaw;
      this.cameraInitialized = true;
    } else {
      this.cameraYaw += normalizeAngle(targetYaw - this.cameraYaw) * this.chaseYawLerp;
    }

    this.camera3D.setPosition({
      x: cameraX,
      y: car.y + this.chaseHeight,
      z: cameraZ,
    });
    this.camera3D.setRotation({
      x: this.cameraPitch,
      y: this.cameraYaw,
      z: 0,
    });
  }

  step3DPhysics(dt, engine) {
    const input = engine.input;
    const velocity = this.world.requireComponent(this.carId, 'velocity3D');
    const throttle = (input?.isDown('KeyW') ? 1 : 0) - (input?.isDown('KeyS') ? 1 : 0);
    const steer = (input?.isDown('KeyD') ? 1 : 0) - (input?.isDown('KeyA') ? 1 : 0);

    if (throttle !== 0) {
      this.speed += throttle * this.accel * dt;
    } else if (this.speed !== 0) {
      const dragStep = this.drag * dt;
      if (Math.abs(this.speed) <= dragStep) {
        this.speed = 0;
      } else {
        this.speed += this.speed > 0 ? -dragStep : dragStep;
      }
    }

    this.speed = clamp(this.speed, -this.maxReverseSpeed, this.maxForwardSpeed);
    if (Math.abs(this.speed) > 0.1) {
      this.heading += steer * this.turnRate * dt;
    }

    velocity.x = Math.sin(this.heading) * this.speed;
    velocity.z = Math.cos(this.heading) * this.speed;
    velocity.y = 0;

    this.lastPhysicsSummary = stepWorldPhysics3D(this.world, dt, {
      worldBounds: this.worldBounds,
    });
    this.distance += Math.abs(this.speed) * dt;
    this.syncCamera();
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Sample 1605 - 3D Driving Sandbox',
      'Drive a simple 3D test track with throttle, steering, and AABB barriers.',
      'Throttle: W/S | Steer: A/D',
      'Practice lane control around cones and blockers.',
    ]);

    renderer.strokeRect(this.viewport.x, this.viewport.y, this.viewport.width, this.viewport.height, '#d8d5ff', 2);

    const cameraState = this.camera3D?.getState?.() ?? {
      position: { x: 0, y: 5.4, z: -0.9 },
      rotation: { x: this.cameraPitch, y: this.cameraYaw, z: 0 },
    };
    const projectionViewport = createProjectionViewport(this.viewport);

    drawGroundGrid(
      renderer,
      {
        minX: -14,
        maxX: 14,
        minZ: 2,
        maxZ: 38,
        y: -0.1,
        step: 2,
        xColor: '#1f2937',
        zColor: '#334155',
      },
      cameraState,
      projectionViewport,
    );

    const car = this.world.requireComponent(this.carId, 'transform3D');
    const carSize = this.world.requireComponent(this.carId, 'size3D');
    const staticEntities = this.world
      .getEntitiesWith('transform3D', 'size3D', 'renderable3D')
      .filter((entityId) => entityId !== this.carId)
      .map((entityId) => ({
        transform3D: this.world.requireComponent(entityId, 'transform3D'),
        size3D: this.world.requireComponent(entityId, 'size3D'),
        renderable3D: this.world.requireComponent(entityId, 'renderable3D'),
      }));

    staticEntities.sort((left, right) => right.transform3D.z - left.transform3D.z);
    staticEntities.forEach(({ transform3D, size3D, renderable3D }) => {
      drawWireBox(renderer, transform3D, size3D, cameraState, projectionViewport, renderable3D.color, 2);
    });

    drawOrientedWireBox(renderer, car, carSize, this.heading, cameraState, projectionViewport, '#38bdf8');
    drawVehicleHeadingMarker(renderer, car, carSize, this.heading, cameraState, projectionViewport);

    drawPanel(renderer, 620, 34, 300, 126, 'Driving Runtime', [
      `Car: x=${car.x.toFixed(2)} y=${car.y.toFixed(2)} z=${car.z.toFixed(2)}`,
      `Speed: ${this.speed.toFixed(2)} u/s | Heading: ${this.heading.toFixed(2)} rad`,
      `Chase yaw: ${this.cameraYaw.toFixed(2)} rad`,
      `Track distance: ${this.distance.toFixed(1)} u`,
      `Moved entities: ${this.lastPhysicsSummary.movedEntities}`,
      `Resolved collisions: ${this.lastPhysicsSummary.collisionCount}`,
    ]);
  }
}
