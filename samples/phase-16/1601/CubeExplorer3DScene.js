/*
Toolbox Aid
David Quesenberry
04/15/2026
CubeExplorer3DScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';
import { World } from '/src/engine/ecs/index.js';
import { stepWorldPhysics3D } from '/src/engine/systems/index.js';

const theme = new Theme(ThemeTokens);
const BOX_EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 0],
  [4, 5], [5, 6], [6, 7], [7, 4],
  [0, 4], [1, 5], [2, 6], [3, 7],
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function createBoxVertices(transform3D, size3D) {
  const x = transform3D.x;
  const y = transform3D.y;
  const z = transform3D.z;
  const w = size3D.width;
  const h = size3D.height;
  const d = size3D.depth;
  return [
    { x, y, z },
    { x: x + w, y, z },
    { x: x + w, y: y + h, z },
    { x, y: y + h, z },
    { x, y, z: z + d },
    { x: x + w, y, z: z + d },
    { x: x + w, y: y + h, z: z + d },
    { x, y: y + h, z: z + d },
  ];
}

function rotateToCameraSpace(point, cameraState) {
  const yaw = -(cameraState.rotation.y ?? 0);
  const pitch = -(cameraState.rotation.x ?? 0);

  let x = point.x - cameraState.position.x;
  let y = point.y - cameraState.position.y;
  let z = point.z - cameraState.position.z;

  const cosYaw = Math.cos(yaw);
  const sinYaw = Math.sin(yaw);
  const yawX = x * cosYaw - z * sinYaw;
  const yawZ = x * sinYaw + z * cosYaw;
  x = yawX;
  z = yawZ;

  const cosPitch = Math.cos(pitch);
  const sinPitch = Math.sin(pitch);
  const pitchY = y * cosPitch - z * sinPitch;
  const pitchZ = y * sinPitch + z * cosPitch;

  return {
    x,
    y: pitchY,
    z: pitchZ,
  };
}

function projectPoint(point, cameraState, viewport) {
  const localPoint = rotateToCameraSpace(point, cameraState);
  if (localPoint.z <= 0.2) {
    return null;
  }

  const scale = viewport.focalLength / localPoint.z;
  return {
    x: viewport.centerX + localPoint.x * scale,
    y: viewport.centerY - localPoint.y * scale,
    depth: localPoint.z,
  };
}

function drawWireBox(renderer, transform3D, size3D, cameraState, viewport, color) {
  const vertices = createBoxVertices(transform3D, size3D);
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

export default class CubeExplorer3DScene extends Scene {
  constructor() {
    super();
    this.world = new World();
    this.moveSpeed = 7.5;
    this.cameraYaw = 0;
    this.cameraPitch = -0.25;
    this.turnSpeed = 1.8;
    this.pitchSpeed = 1.1;
    this.viewport = {
      x: 40,
      y: 170,
      width: 860,
      height: 320,
      focalLength: 460,
    };
    this.worldBounds = {
      x: -8,
      y: -2,
      z: 2,
      width: 16,
      height: 8,
      depth: 22,
    };
    this.lastPhysicsSummary = { movedEntities: 0, collisionCount: 0 };

    this.playerId = this.world.createEntity();
    this.world.addComponent(this.playerId, 'transform3D', {
      x: 0,
      y: 0,
      z: 8,
      previousX: 0,
      previousY: 0,
      previousZ: 8,
    });
    this.world.addComponent(this.playerId, 'size3D', { width: 1.6, height: 1.6, depth: 1.6 });
    this.world.addComponent(this.playerId, 'velocity3D', { x: 0, y: 0, z: 0 });
    this.world.addComponent(this.playerId, 'collider3D', { enabled: true, solid: false });
    this.world.addComponent(this.playerId, 'renderable3D', { color: '#7dd3fc' });

    this.addSolidBox({ x: -3.5, y: -0.2, z: 10.5 }, { width: 2.2, height: 2.2, depth: 2.2 }, '#f87171');
    this.addSolidBox({ x: 2.3, y: -0.2, z: 14.0 }, { width: 2.0, height: 3.0, depth: 2.0 }, '#fbbf24');
    this.addSolidBox({ x: -1.0, y: -0.2, z: 18.0 }, { width: 3.0, height: 1.8, depth: 2.2 }, '#86efac');
  }

  setCamera3D(camera3D) {
    this.camera3D = camera3D;
    this.syncCameraToPlayer();
  }

  addSolidBox(transform3D, size3D, color = '#fca5a5') {
    const id = this.world.createEntity();
    this.world.addComponent(id, 'transform3D', {
      x: transform3D.x,
      y: transform3D.y,
      z: transform3D.z,
      previousX: transform3D.x,
      previousY: transform3D.y,
      previousZ: transform3D.z,
    });
    this.world.addComponent(id, 'size3D', {
      width: size3D.width,
      height: size3D.height,
      depth: size3D.depth,
    });
    this.world.addComponent(id, 'solid3D', { enabled: true });
    this.world.addComponent(id, 'renderable3D', { color });
  }

  syncCameraToPlayer() {
    if (!this.camera3D) {
      return;
    }

    const playerTransform = this.world.requireComponent(this.playerId, 'transform3D');
    const orbitDistance = 10;
    const cameraX = playerTransform.x + Math.sin(this.cameraYaw) * orbitDistance;
    const cameraZ = playerTransform.z - Math.cos(this.cameraYaw) * orbitDistance;
    const cameraY = playerTransform.y + 4.8;

    this.camera3D.setPosition({
      x: cameraX,
      y: cameraY,
      z: cameraZ,
    });
    this.camera3D.setRotation({
      x: this.cameraPitch,
      y: this.cameraYaw,
      z: 0,
    });
  }

  step3DPhysics(dt, engine) {
    const velocity = this.world.requireComponent(this.playerId, 'velocity3D');
    const input = engine.input;

    velocity.x = 0;
    velocity.y = 0;
    velocity.z = 0;

    if (input?.isDown('KeyA')) velocity.x -= this.moveSpeed;
    if (input?.isDown('KeyD')) velocity.x += this.moveSpeed;
    if (input?.isDown('KeyR')) velocity.y += this.moveSpeed;
    if (input?.isDown('KeyF')) velocity.y -= this.moveSpeed;
    if (input?.isDown('KeyW')) velocity.z += this.moveSpeed;
    if (input?.isDown('KeyS')) velocity.z -= this.moveSpeed;

    const yawInput = (input?.isDown('ArrowRight') ? 1 : 0) - (input?.isDown('ArrowLeft') ? 1 : 0);
    const pitchInput = (input?.isDown('ArrowUp') ? 1 : 0) - (input?.isDown('ArrowDown') ? 1 : 0);
    this.cameraYaw += yawInput * this.turnSpeed * dt;
    this.cameraPitch = clamp(this.cameraPitch + pitchInput * this.pitchSpeed * dt, -0.85, 0.6);

    this.lastPhysicsSummary = stepWorldPhysics3D(this.world, dt, {
      worldBounds: this.worldBounds,
    });
    this.syncCameraToPlayer();
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Sample 1601 - 3D Cube Explorer',
      'Minimal 3D movement + AABB collision using an isolated physics loop',
      'Move: W A S D | Vertical: R/F | Camera orbit: Arrow keys',
      'Goal: navigate around blocking boxes while remaining inside world bounds',
    ]);

    renderer.strokeRect(
      this.viewport.x,
      this.viewport.y,
      this.viewport.width,
      this.viewport.height,
      '#d8d5ff',
      2,
    );

    const cameraState = this.camera3D?.getState?.() ?? {
      position: { x: 0, y: 3, z: -8 },
      rotation: { x: -0.25, y: 0, z: 0 },
    };

    const projectionViewport = {
      centerX: this.viewport.x + this.viewport.width * 0.5,
      centerY: this.viewport.y + this.viewport.height * 0.5,
      focalLength: this.viewport.focalLength,
    };

    for (let lineZ = 4; lineZ <= 24; lineZ += 2) {
      const start = projectPoint({ x: -8, y: -1, z: lineZ }, cameraState, projectionViewport);
      const end = projectPoint({ x: 8, y: -1, z: lineZ }, cameraState, projectionViewport);
      if (start && end) {
        renderer.drawLine(start.x, start.y, end.x, end.y, '#334155', 1);
      }
    }

    for (let lineX = -8; lineX <= 8; lineX += 2) {
      const start = projectPoint({ x: lineX, y: -1, z: 2 }, cameraState, projectionViewport);
      const end = projectPoint({ x: lineX, y: -1, z: 24 }, cameraState, projectionViewport);
      if (start && end) {
        renderer.drawLine(start.x, start.y, end.x, end.y, '#1f334d', 1);
      }
    }

    const entities = this.world.getEntitiesWith('transform3D', 'size3D', 'renderable3D').map((entityId) => ({
      entityId,
      transform3D: this.world.requireComponent(entityId, 'transform3D'),
      size3D: this.world.requireComponent(entityId, 'size3D'),
      renderable3D: this.world.requireComponent(entityId, 'renderable3D'),
    }));

    entities.sort((left, right) => right.transform3D.z - left.transform3D.z);
    entities.forEach(({ transform3D, size3D, renderable3D }) => {
      drawWireBox(
        renderer,
        transform3D,
        size3D,
        cameraState,
        projectionViewport,
        renderable3D.color,
      );
    });

    const player = this.world.requireComponent(this.playerId, 'transform3D');
    drawPanel(renderer, 620, 34, 300, 126, '3D Runtime', [
      `Cube: x=${player.x.toFixed(2)} y=${player.y.toFixed(2)} z=${player.z.toFixed(2)}`,
      `Camera yaw: ${this.cameraYaw.toFixed(2)} pitch: ${this.cameraPitch.toFixed(2)}`,
      `Moved entities: ${this.lastPhysicsSummary.movedEntities}`,
      `Resolved collisions: ${this.lastPhysicsSummary.collisionCount}`,
      'Physics loop: stepWorldPhysics3D (MovementSystem + AABB)',
    ]);
  }
}
