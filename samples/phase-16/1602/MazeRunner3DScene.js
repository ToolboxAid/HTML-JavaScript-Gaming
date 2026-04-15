/*
Toolbox Aid
David Quesenberry
04/15/2026
MazeRunner3DScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';
import { World } from '/src/engine/ecs/index.js';
import { isAabbColliding3D } from '/src/engine/physics/index.js';
import { stepWorldPhysics3D } from '/src/engine/systems/index.js';
import { createProjectionViewport, drawGroundGrid, drawWireBox } from '../shared/threeDWireframe.js';

const theme = new Theme(ThemeTokens);

export default class MazeRunner3DScene extends Scene {
  constructor() {
    super();
    this.world = new World();
    this.moveSpeed = 7;
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
      z: 2,
      width: 18,
      height: 5,
      depth: 24,
    };
    this.goal = {
      x: 6.2,
      y: 0,
      z: 22.3,
      width: 1.4,
      height: 1.4,
      depth: 1.4,
    };
    this.goalReached = false;
    this.lastPhysicsSummary = { movedEntities: 0, collisionCount: 0 };

    this.playerId = this.world.createEntity();
    this.world.addComponent(this.playerId, 'transform3D', {
      x: -7.2,
      y: 0,
      z: 3.2,
      previousX: -7.2,
      previousY: 0,
      previousZ: 3.2,
    });
    this.world.addComponent(this.playerId, 'size3D', { width: 1.1, height: 1.1, depth: 1.1 });
    this.world.addComponent(this.playerId, 'velocity3D', { x: 0, y: 0, z: 0 });
    this.world.addComponent(this.playerId, 'collider3D', { enabled: true, solid: false });
    this.world.addComponent(this.playerId, 'renderable3D', { color: '#7dd3fc' });

    this.buildMazeWalls();
  }

  setCamera3D(camera3D) {
    this.camera3D = camera3D;
    this.syncCamera();
  }

  buildMazeWalls() {
    const walls = [
      { x: -8.8, y: -0.1, z: 2.1, width: 0.6, height: 2.8, depth: 23.6 },
      { x: 8.2, y: -0.1, z: 2.1, width: 0.6, height: 2.8, depth: 23.6 },
      { x: -8.8, y: -0.1, z: 2.0, width: 17.6, height: 2.8, depth: 0.6 },
      { x: -8.8, y: -0.1, z: 25.0, width: 17.6, height: 2.8, depth: 0.6 },
      { x: -6.0, y: -0.1, z: 4.0, width: 0.8, height: 2.4, depth: 10.0 },
      { x: -2.2, y: -0.1, z: 8.8, width: 0.8, height: 2.4, depth: 12.0 },
      { x: 1.6, y: -0.1, z: 4.0, width: 0.8, height: 2.4, depth: 12.0 },
      { x: 5.4, y: -0.1, z: 10.8, width: 0.8, height: 2.4, depth: 8.0 },
      { x: -8.0, y: -0.1, z: 13.8, width: 5.8, height: 2.4, depth: 0.8 },
      { x: -2.0, y: -0.1, z: 18.2, width: 4.0, height: 2.4, depth: 0.8 },
      { x: 2.6, y: -0.1, z: 7.6, width: 5.8, height: 2.4, depth: 0.8 },
      { x: 2.2, y: -0.1, z: 21.2, width: 6.0, height: 2.4, depth: 0.8 },
    ];

    walls.forEach((wall) => {
      const id = this.world.createEntity();
      this.world.addComponent(id, 'transform3D', {
        x: wall.x,
        y: wall.y,
        z: wall.z,
        previousX: wall.x,
        previousY: wall.y,
        previousZ: wall.z,
      });
      this.world.addComponent(id, 'size3D', {
        width: wall.width,
        height: wall.height,
        depth: wall.depth,
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
      x: player.x,
      y: 11.5,
      z: player.z - 9.6,
    });
    this.camera3D.setRotation({
      x: -0.62,
      y: 0,
      z: 0,
    });
  }

  step3DPhysics(dt, engine) {
    const input = engine.input;
    const velocity = this.world.requireComponent(this.playerId, 'velocity3D');

    const axisX = (input?.isDown('KeyD') ? 1 : 0) - (input?.isDown('KeyA') ? 1 : 0);
    const axisZ = (input?.isDown('KeyW') ? 1 : 0) - (input?.isDown('KeyS') ? 1 : 0);
    const length = Math.hypot(axisX, axisZ) || 1;
    velocity.x = (axisX / length) * this.moveSpeed;
    velocity.z = (axisZ / length) * this.moveSpeed;
    velocity.y = 0;

    this.lastPhysicsSummary = stepWorldPhysics3D(this.world, dt, {
      worldBounds: this.worldBounds,
    });

    const player = this.world.requireComponent(this.playerId, 'transform3D');
    const playerSize = this.world.requireComponent(this.playerId, 'size3D');
    this.goalReached = this.goalReached || isAabbColliding3D(
      {
        x: player.x,
        y: player.y,
        z: player.z,
        width: playerSize.width,
        height: playerSize.height,
        depth: playerSize.depth,
      },
      this.goal,
    );

    this.syncCamera();
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Sample 1602 - 3D Maze Runner',
      'Navigate through a 3D maze while physics keeps the cube outside wall bounds.',
      'Move: W A S D',
      this.goalReached ? 'Goal reached: route solved.' : 'Find the green goal cube near the far-right corner.',
    ]);

    renderer.strokeRect(this.viewport.x, this.viewport.y, this.viewport.width, this.viewport.height, '#d8d5ff', 2);

    const cameraState = this.camera3D?.getState?.() ?? {
      position: { x: 0, y: 10, z: -8 },
      rotation: { x: -0.6, y: 0, z: 0 },
    };
    const projectionViewport = createProjectionViewport(this.viewport);

    drawGroundGrid(
      renderer,
      {
        minX: -9,
        maxX: 9,
        minZ: 2,
        maxZ: 25,
        y: -0.1,
        step: 2,
      },
      cameraState,
      projectionViewport,
    );

    const entities = this.world.getEntitiesWith('transform3D', 'size3D', 'renderable3D').map((entityId) => ({
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

    drawWireBox(renderer, this.goal, { width: this.goal.width, height: this.goal.height, depth: this.goal.depth }, cameraState, projectionViewport, '#4ade80', 2);

    const player = this.world.requireComponent(this.playerId, 'transform3D');
    drawPanel(renderer, 620, 34, 300, 126, 'Maze Runtime', [
      `Cube: x=${player.x.toFixed(2)} y=${player.y.toFixed(2)} z=${player.z.toFixed(2)}`,
      `Moved entities: ${this.lastPhysicsSummary.movedEntities}`,
      `Resolved collisions: ${this.lastPhysicsSummary.collisionCount}`,
      `Goal: ${this.goalReached ? 'reached' : 'in progress'}`,
      'Pathing: stepWorldPhysics3D (AABB walls)',
    ]);
  }
}
