/*
Toolbox Aid
David Quesenberry
04/15/2026
FirstPersonWalkthroughScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';
import { World } from '/src/engine/ecs/index.js';
import { stepWorldPhysics3D } from '/src/engine/systems/index.js';
import { createProjectionViewport, drawGroundGrid, drawWireBox } from '../shared/threeDWireframe.js';

const theme = new Theme(ThemeTokens);

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export default class FirstPersonWalkthroughScene extends Scene {
  constructor() {
    super();
    this.world = new World();
    this.moveSpeed = 6.6;
    this.turnSpeed = 1.8;
    this.lookSpeed = 1.25;
    this.yaw = 0;
    this.pitch = 0;
    this.viewport = {
      x: 40,
      y: 170,
      width: 860,
      height: 320,
      focalLength: 460,
    };
    this.worldBounds = {
      x: -9,
      y: -1,
      z: 1.5,
      width: 18,
      height: 4,
      depth: 26,
    };
    this.lastPhysicsSummary = { movedEntities: 0, collisionCount: 0 };

    this.playerId = this.world.createEntity();
    this.world.addComponent(this.playerId, 'transform3D', {
      x: 0,
      y: 0,
      z: 3.2,
      previousX: 0,
      previousY: 0,
      previousZ: 3.2,
    });
    this.world.addComponent(this.playerId, 'size3D', { width: 0.9, height: 1.8, depth: 0.9 });
    this.world.addComponent(this.playerId, 'velocity3D', { x: 0, y: 0, z: 0 });
    this.world.addComponent(this.playerId, 'collider3D', { enabled: true, solid: false });

    this.buildWalkthroughWalls();
  }

  setCamera3D(camera3D) {
    this.camera3D = camera3D;
    this.syncCamera();
  }

  buildWalkthroughWalls() {
    const structures = [
      { x: -8.8, y: -0.1, z: 1.6, width: 0.6, height: 2.8, depth: 25.8 },
      { x: 8.2, y: -0.1, z: 1.6, width: 0.6, height: 2.8, depth: 25.8 },
      { x: -8.8, y: -0.1, z: 1.6, width: 17.6, height: 2.8, depth: 0.6 },
      { x: -8.8, y: -0.1, z: 26.8, width: 17.6, height: 2.8, depth: 0.6 },
      { x: -5.5, y: -0.1, z: 6.0, width: 11.0, height: 2.0, depth: 0.8 },
      { x: -6.8, y: -0.1, z: 10.8, width: 0.8, height: 2.0, depth: 6.0 },
      { x: -1.0, y: -0.1, z: 10.8, width: 0.8, height: 2.0, depth: 6.0 },
      { x: 3.8, y: -0.1, z: 10.8, width: 0.8, height: 2.0, depth: 10.0 },
      { x: -4.2, y: -0.1, z: 16.8, width: 6.8, height: 2.0, depth: 0.8 },
      { x: -7.5, y: -0.1, z: 21.4, width: 4.0, height: 2.0, depth: 0.8 },
      { x: 0.6, y: -0.1, z: 22.6, width: 7.2, height: 2.0, depth: 0.8 },
      { x: -2.0, y: -0.1, z: 23.2, width: 1.2, height: 2.0, depth: 3.0 },
    ];

    structures.forEach((entry) => {
      const id = this.world.createEntity();
      this.world.addComponent(id, 'transform3D', {
        x: entry.x,
        y: entry.y,
        z: entry.z,
        previousX: entry.x,
        previousY: entry.y,
        previousZ: entry.z,
      });
      this.world.addComponent(id, 'size3D', {
        width: entry.width,
        height: entry.height,
        depth: entry.depth,
      });
      this.world.addComponent(id, 'solid3D', { enabled: true });
      this.world.addComponent(id, 'renderable3D', { color: '#fca5a5' });
    });
  }

  syncCamera() {
    if (!this.camera3D) {
      return;
    }

    const player = this.world.requireComponent(this.playerId, 'transform3D');
    this.camera3D.setPosition({
      x: player.x + 0.45,
      y: player.y + 1.2,
      z: player.z + 0.45,
    });
    this.camera3D.setRotation({
      x: this.pitch,
      y: this.yaw,
      z: 0,
    });
  }

  step3DPhysics(dt, engine) {
    const input = engine.input;
    const velocity = this.world.requireComponent(this.playerId, 'velocity3D');

    const lookX = (input?.isDown('ArrowRight') ? 1 : 0) - (input?.isDown('ArrowLeft') ? 1 : 0);
    const lookY = (input?.isDown('ArrowUp') ? 1 : 0) - (input?.isDown('ArrowDown') ? 1 : 0);
    this.yaw += lookX * this.turnSpeed * dt;
    this.pitch = clamp(this.pitch + lookY * this.lookSpeed * dt, -0.55, 0.5);

    const axisForward = (input?.isDown('KeyW') ? 1 : 0) - (input?.isDown('KeyS') ? 1 : 0);
    const axisStrafe = (input?.isDown('KeyD') ? 1 : 0) - (input?.isDown('KeyA') ? 1 : 0);
    const length = Math.hypot(axisForward, axisStrafe) || 1;
    const forward = axisForward / length;
    const strafe = axisStrafe / length;

    const forwardX = Math.sin(this.yaw);
    const forwardZ = Math.cos(this.yaw);
    const rightX = Math.cos(this.yaw);
    const rightZ = -Math.sin(this.yaw);

    velocity.x = (forwardX * forward + rightX * strafe) * this.moveSpeed;
    velocity.z = (forwardZ * forward + rightZ * strafe) * this.moveSpeed;
    velocity.y = 0;

    this.lastPhysicsSummary = stepWorldPhysics3D(this.world, dt, {
      worldBounds: this.worldBounds,
    });
    this.syncCamera();
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Sample 1603 - First Person Walkthrough',
      'Navigate from a first-person camera while AABB collisions keep movement grounded.',
      'Move: W A S D | Look: Arrow Keys',
      'Stay centered in the lane and navigate around interior blockers.',
    ]);

    renderer.strokeRect(this.viewport.x, this.viewport.y, this.viewport.width, this.viewport.height, '#d8d5ff', 2);

    const cameraState = this.camera3D?.getState?.() ?? {
      position: { x: 0, y: 1.2, z: 2.5 },
      rotation: { x: 0, y: 0, z: 0 },
    };
    const projectionViewport = createProjectionViewport(this.viewport);

    drawGroundGrid(
      renderer,
      {
        minX: -9,
        maxX: 9,
        minZ: 1.5,
        maxZ: 27,
        y: -0.1,
        step: 2,
      },
      cameraState,
      projectionViewport,
    );

    const solids = this.world.getEntitiesWith('transform3D', 'size3D', 'solid3D').map((entityId) => ({
      transform3D: this.world.requireComponent(entityId, 'transform3D'),
      size3D: this.world.requireComponent(entityId, 'size3D'),
    }));
    solids.sort((left, right) => right.transform3D.z - left.transform3D.z);

    solids.forEach(({ transform3D, size3D }) => {
      drawWireBox(renderer, transform3D, size3D, cameraState, projectionViewport, '#fca5a5', 2);
    });

    const centerX = this.viewport.x + this.viewport.width * 0.5;
    const centerY = this.viewport.y + this.viewport.height * 0.5;
    renderer.drawLine(centerX - 8, centerY, centerX + 8, centerY, '#7dd3fc', 1);
    renderer.drawLine(centerX, centerY - 8, centerX, centerY + 8, '#7dd3fc', 1);

    const player = this.world.requireComponent(this.playerId, 'transform3D');
    drawPanel(renderer, 620, 34, 300, 126, 'Walkthrough Runtime', [
      `Position: x=${player.x.toFixed(2)} y=${player.y.toFixed(2)} z=${player.z.toFixed(2)}`,
      `View: yaw=${this.yaw.toFixed(2)} pitch=${this.pitch.toFixed(2)}`,
      `Moved entities: ${this.lastPhysicsSummary.movedEntities}`,
      `Resolved collisions: ${this.lastPhysicsSummary.collisionCount}`,
      'View mode: first person + collision-aware movement',
    ]);
  }
}
