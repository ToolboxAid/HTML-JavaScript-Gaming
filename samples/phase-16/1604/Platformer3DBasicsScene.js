/*
Toolbox Aid
David Quesenberry
04/15/2026
Platformer3DBasicsScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';
import { World } from '/src/engine/ecs/index.js';
import { isAabbColliding3D } from '/src/engine/physics/index.js';
import { stepWorldPhysics3D } from '/src/engine/systems/index.js';
import { createProjectionViewport, drawGroundGrid, drawWireBox } from '../shared/threeDWireframe.js';

const theme = new Theme(ThemeTokens);

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export default class Platformer3DBasicsScene extends Scene {
  constructor() {
    super();
    this.world = new World();
    this.moveSpeed = 7.2;
    this.jumpSpeed = 8.8;
    this.gravity = -24;
    this.jumpLatch = false;
    this.isGrounded = false;
    this.goalReached = false;
    this.solidEntityIds = [];
    this.viewport = {
      x: 40,
      y: 170,
      width: 860,
      height: 320,
      focalLength: 460,
    };
    this.worldBounds = {
      x: -10,
      y: -2,
      z: 8,
      width: 20,
      height: 12,
      depth: 4,
    };
    this.goal = {
      x: 7.1,
      y: 5.0,
      z: 9.25,
      width: 1.2,
      height: 1.2,
      depth: 1.2,
    };
    this.lastPhysicsSummary = { movedEntities: 0, collisionCount: 0 };

    this.playerId = this.world.createEntity();
    this.world.addComponent(this.playerId, 'transform3D', {
      x: -8.2,
      y: 0,
      z: 9.45,
      previousX: -8.2,
      previousY: 0,
      previousZ: 9.45,
    });
    this.world.addComponent(this.playerId, 'size3D', { width: 1.0, height: 1.6, depth: 1.0 });
    this.world.addComponent(this.playerId, 'velocity3D', { x: 0, y: 0, z: 0 });
    this.world.addComponent(this.playerId, 'collider3D', { enabled: true, solid: false });
    this.world.addComponent(this.playerId, 'renderable3D', { color: '#7dd3fc' });

    this.addSolidBox({ x: -10, y: -1, z: 8.5 }, { width: 20, height: 1, depth: 3.0 }, '#fca5a5');
    this.addSolidBox({ x: -4.9, y: 0.8, z: 9.0 }, { width: 2.2, height: 0.8, depth: 2.0 }, '#fbbf24');
    this.addSolidBox({ x: -1.1, y: 2.0, z: 9.0 }, { width: 2.2, height: 0.8, depth: 2.0 }, '#f59e0b');
    this.addSolidBox({ x: 2.7, y: 3.2, z: 9.0 }, { width: 2.2, height: 0.8, depth: 2.0 }, '#84cc16');
    this.addSolidBox({ x: 6.5, y: 4.4, z: 9.0 }, { width: 2.2, height: 0.8, depth: 2.0 }, '#4ade80');
  }

  setCamera3D(camera3D) {
    this.camera3D = camera3D;
    this.syncCamera();
  }

  addSolidBox(transform3D, size3D, color) {
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
    this.solidEntityIds.push(id);
  }

  syncCamera() {
    if (!this.camera3D) {
      return;
    }

    const player = this.world.requireComponent(this.playerId, 'transform3D');
    this.camera3D.setPosition({
      x: player.x - 7.2,
      y: player.y + 5.2,
      z: player.z - 8.0,
    });
    this.camera3D.setRotation({
      x: -0.42,
      y: -0.72,
      z: 0,
    });
  }

  checkGrounded() {
    const transform = this.world.requireComponent(this.playerId, 'transform3D');
    const size = this.world.requireComponent(this.playerId, 'size3D');
    const footBox = {
      x: transform.x + 0.12,
      y: transform.y - 0.09,
      z: transform.z + 0.12,
      width: Math.max(0.2, size.width - 0.24),
      height: 0.1,
      depth: Math.max(0.2, size.depth - 0.24),
    };

    return this.solidEntityIds.some((entityId) => {
      const solidTransform = this.world.requireComponent(entityId, 'transform3D');
      const solidSize = this.world.requireComponent(entityId, 'size3D');
      return isAabbColliding3D(footBox, {
        x: solidTransform.x,
        y: solidTransform.y,
        z: solidTransform.z,
        width: solidSize.width,
        height: solidSize.height,
        depth: solidSize.depth,
      });
    });
  }

  step3DPhysics(dt, engine) {
    const input = engine.input;
    const velocity = this.world.requireComponent(this.playerId, 'velocity3D');

    const axisX = (input?.isDown('KeyD') ? 1 : 0) - (input?.isDown('KeyA') ? 1 : 0);
    velocity.x = axisX * this.moveSpeed;
    velocity.z = 0;

    this.isGrounded = this.checkGrounded();
    const jumpPressed = input?.isDown('Space') === true;
    if (jumpPressed && this.isGrounded && !this.jumpLatch) {
      velocity.y = this.jumpSpeed;
      this.isGrounded = false;
    }
    this.jumpLatch = jumpPressed;

    if (!this.isGrounded) {
      velocity.y += this.gravity * dt;
    } else if (velocity.y < 0) {
      velocity.y = 0;
    }
    velocity.y = clamp(velocity.y, -24, 18);

    this.lastPhysicsSummary = stepWorldPhysics3D(this.world, dt, {
      worldBounds: this.worldBounds,
    });

    this.isGrounded = this.checkGrounded();
    if (this.isGrounded && velocity.y < 0) {
      velocity.y = 0;
    }

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
      'Sample 1604 - 3D Platformer Basics',
      'Basic gravity + jump loop layered on top of 3D movement and AABB collision.',
      'Move: A/D | Jump: Space',
      this.goalReached ? 'Goal reached: platform run completed.' : 'Reach the green marker on the final platform.',
    ]);

    renderer.strokeRect(this.viewport.x, this.viewport.y, this.viewport.width, this.viewport.height, '#d8d5ff', 2);

    const cameraState = this.camera3D?.getState?.() ?? {
      position: { x: -10, y: 5, z: 2 },
      rotation: { x: -0.42, y: -0.72, z: 0 },
    };
    const projectionViewport = createProjectionViewport(this.viewport);

    drawGroundGrid(
      renderer,
      {
        minX: -10,
        maxX: 10,
        minZ: 8,
        maxZ: 12,
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

    drawWireBox(
      renderer,
      this.goal,
      { width: this.goal.width, height: this.goal.height, depth: this.goal.depth },
      cameraState,
      projectionViewport,
      '#4ade80',
      2,
    );

    const player = this.world.requireComponent(this.playerId, 'transform3D');
    const velocity = this.world.requireComponent(this.playerId, 'velocity3D');
    drawPanel(renderer, 620, 34, 300, 126, 'Platformer Runtime', [
      `Cube: x=${player.x.toFixed(2)} y=${player.y.toFixed(2)} z=${player.z.toFixed(2)}`,
      `VelocityY: ${velocity.y.toFixed(2)} | Grounded: ${this.isGrounded ? 'yes' : 'no'}`,
      `Moved entities: ${this.lastPhysicsSummary.movedEntities}`,
      `Resolved collisions: ${this.lastPhysicsSummary.collisionCount}`,
      'Physics: gravity + jump + stepWorldPhysics3D',
    ]);
  }
}
