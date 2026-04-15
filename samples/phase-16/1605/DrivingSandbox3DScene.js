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

function projectVehiclePoint(localPoint, center, yaw, cameraState, viewport) {
  const rotated = rotateYaw(localPoint.x, localPoint.z, yaw);
  return projectPoint(
    {
      x: center.x + rotated.x,
      y: center.y + localPoint.y,
      z: center.z + rotated.z,
    },
    cameraState,
    viewport,
  );
}

function drawAsymmetricVehicle(renderer, transform3D, size3D, yaw, cameraState, viewport, color) {
  const halfWidth = size3D.width * 0.5;
  const halfHeight = size3D.height * 0.5;
  const halfDepth = size3D.depth * 0.5;
  const center = {
    x: transform3D.x + halfWidth,
    y: transform3D.y + halfHeight,
    z: transform3D.z + halfDepth,
  };

  const localVertices = [
    { x: -halfWidth, y: -halfHeight, z: -halfDepth }, // 0 rear-left-bottom
    { x: halfWidth, y: -halfHeight, z: -halfDepth }, // 1 rear-right-bottom
    { x: -halfWidth, y: -halfHeight, z: halfDepth * 0.64 }, // 2 front-left-bottom
    { x: halfWidth, y: -halfHeight, z: halfDepth * 0.64 }, // 3 front-right-bottom
    { x: 0, y: -halfHeight, z: halfDepth + 0.95 }, // 4 nose-bottom
    { x: -halfWidth, y: halfHeight * 0.55, z: -halfDepth }, // 5 rear-left-top
    { x: halfWidth, y: halfHeight * 0.55, z: -halfDepth }, // 6 rear-right-top
    { x: -halfWidth * 0.76, y: halfHeight * 0.44, z: halfDepth * 0.52 }, // 7 front-left-top
    { x: halfWidth * 0.76, y: halfHeight * 0.44, z: halfDepth * 0.52 }, // 8 front-right-top
    { x: 0, y: halfHeight * 0.34, z: halfDepth + 0.72 }, // 9 nose-top
    { x: -halfWidth * 0.92, y: halfHeight * 0.8, z: -halfDepth * 0.08 }, // 10 left fin-base
    { x: -halfWidth * 1.35, y: halfHeight * 1.34, z: halfDepth * 0.24 }, // 11 left fin-tip (asymmetric)
  ];

  const edges = [
    [0, 1], [1, 3], [3, 2], [2, 0], // chassis
    [2, 4], [3, 4], // nose wedge
    [5, 6], [6, 8], [8, 7], [7, 5], // roof
    [7, 9], [8, 9], // roof nose
    [0, 5], [1, 6], [2, 7], [3, 8], [4, 9], // uprights
    [10, 11], [5, 10], // asymmetric fin
  ];

  const projected = localVertices.map((vertex) => projectVehiclePoint(vertex, center, yaw, cameraState, viewport));
  edges.forEach(([startIndex, endIndex]) => {
    const start = projected[startIndex];
    const end = projected[endIndex];
    if (!start || !end) {
      return;
    }
    renderer.drawLine(start.x, start.y, end.x, end.y, color, 2);
  });
}

function drawVehicleHeadingMarker(renderer, markerWorldPoints, cameraState, viewport) {
  const tail = projectPoint(markerWorldPoints.tail, cameraState, viewport);
  const tip = projectPoint(markerWorldPoints.tip, cameraState, viewport);
  const wingLeft = projectPoint(markerWorldPoints.wingLeft, cameraState, viewport);
  const wingRight = projectPoint(markerWorldPoints.wingRight, cameraState, viewport);
  const mast = projectPoint(markerWorldPoints.mast, cameraState, viewport);

  if (tail && tip) renderer.drawLine(tail.x, tail.y, tip.x, tip.y, '#fef08a', 3);
  if (tip && wingLeft) renderer.drawLine(tip.x, tip.y, wingLeft.x, wingLeft.y, '#fde68a', 2);
  if (tip && wingRight) renderer.drawLine(tip.x, tip.y, wingRight.x, wingRight.y, '#fde68a', 2);
  if (tail && mast) renderer.drawLine(tail.x, tail.y, mast.x, mast.y, '#f59e0b', 2);
}

function computeLookRotation(cameraPosition, targetPosition) {
  const dx = targetPosition.x - cameraPosition.x;
  const dy = targetPosition.y - cameraPosition.y;
  const dz = targetPosition.z - cameraPosition.z;
  const yaw = Math.atan2(dx, dz);
  const horizontal = Math.hypot(dx, dz) || 1;
  const pitch = Math.atan2(dy, horizontal);
  return { yaw, pitch };
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
    this.chaseDistance = 8.9;
    this.chaseHeight = 5.3;
    this.chaseLookAhead = 2.2;
    this.cameraYaw = 0;
    this.cameraPitch = -0.35;
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

  getVehicleCenter() {
    const car = this.world.requireComponent(this.carId, 'transform3D');
    const carSize = this.world.requireComponent(this.carId, 'size3D');
    return {
      x: car.x + carSize.width * 0.5,
      y: car.y + carSize.height * 0.5,
      z: car.z + carSize.depth * 0.5,
    };
  }

  getVehicleMarkerWorldPoints() {
    const carSize = this.world.requireComponent(this.carId, 'size3D');
    const center = this.getVehicleCenter();
    const halfHeight = carSize.height * 0.5;
    const halfDepth = carSize.depth * 0.5;
    const vehicleYaw = this.getVehicleYaw();

    const toWorld = (localX, localY, localZ) => {
      const rotated = rotateYaw(localX, localZ, vehicleYaw);
      return {
        x: center.x + rotated.x,
        y: center.y + localY,
        z: center.z + rotated.z,
      };
    };

    return {
      tail: toWorld(0, halfHeight * 0.32, 0.02),
      tip: toWorld(0, halfHeight * 0.32, halfDepth + 1.12),
      wingLeft: toWorld(-0.36, halfHeight * 0.32, halfDepth + 0.56),
      wingRight: toWorld(0.36, halfHeight * 0.32, halfDepth + 0.56),
      mast: toWorld(0, halfHeight * 1.0, halfDepth + 0.2),
    };
  }

  getVehicleYaw() {
    return this.heading;
  }

  syncCamera() {
    if (!this.camera3D) {
      return;
    }

    const center = this.getVehicleCenter();
    const vehicleYaw = this.getVehicleYaw();
    const forwardX = Math.sin(vehicleYaw);
    const forwardZ = Math.cos(vehicleYaw);

    const cameraPosition = {
      x: center.x - forwardX * this.chaseDistance,
      y: center.y + this.chaseHeight,
      z: center.z - forwardZ * this.chaseDistance,
    };
    const targetPosition = {
      x: center.x + forwardX * this.chaseLookAhead,
      y: center.y + 0.35,
      z: center.z + forwardZ * this.chaseLookAhead,
    };
    const lookRotation = computeLookRotation(cameraPosition, targetPosition);
    this.cameraYaw = normalizeAngle(-lookRotation.yaw);
    this.cameraPitch = clamp(lookRotation.pitch, -0.8, -0.08);

    this.camera3D.setPosition(cameraPosition);
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
      this.heading = normalizeAngle(this.heading + steer * this.turnRate * dt);
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
      'Chase camera hard-locks behind the vehicle for stable readability.',
    ]);

    renderer.strokeRect(this.viewport.x, this.viewport.y, this.viewport.width, this.viewport.height, '#d8d5ff', 2);

    const cameraState = this.camera3D?.getState?.() ?? {
      position: { x: 0, y: 5.3, z: -0.5 },
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

    const vehicleYaw = this.getVehicleYaw();
    drawAsymmetricVehicle(renderer, car, carSize, vehicleYaw, cameraState, projectionViewport, '#38bdf8');
    drawVehicleHeadingMarker(renderer, this.getVehicleMarkerWorldPoints(), cameraState, projectionViewport);

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
