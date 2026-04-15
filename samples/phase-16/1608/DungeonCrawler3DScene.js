/*
Toolbox Aid
David Quesenberry
04/15/2026
DungeonCrawler3DScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';
import { World } from '/src/engine/ecs/index.js';
import { isAabbColliding3D } from '/src/engine/physics/index.js';
import { stepWorldPhysics3D } from '/src/engine/systems/index.js';
import { createProjectionViewport, drawGroundGrid, drawWireBox } from '../shared/threeDWireframe.js';

const theme = new Theme(ThemeTokens);

export default class DungeonCrawler3DScene extends Scene {
  constructor() {
    super();
    this.world = new World();
    this.moveSpeed = 6.2;
    this.playerSpawn = { x: -8.2, y: 0, z: 4.2 };
    this.viewport = {
      x: 40,
      y: 170,
      width: 860,
      height: 320,
      focalLength: 460,
    };
    this.worldBounds = {
      x: -10,
      y: -1,
      z: 2,
      width: 20,
      height: 4,
      depth: 30,
    };
    this.relic = {
      x: -6.3,
      y: 0.0,
      z: 22.2,
      width: 1.0,
      height: 1.0,
      depth: 1.0,
    };
    this.exitGoal = {
      x: 7.2,
      y: 0.0,
      z: 30.2,
      width: 1.2,
      height: 1.2,
      depth: 1.2,
    };
    this.relicCollected = false;
    this.escaped = false;
    this.runState = 'seek-relic';
    this.runElapsedSeconds = 0;
    this.lastCompletionSeconds = 0;
    this.runCount = 1;
    this.lastResetReason = 'spawn';
    this.interactionFlashSeconds = 0;
    this.resetLatch = false;
    this.lastPhysicsSummary = { movedEntities: 0, collisionCount: 0 };

    this.playerId = this.world.createEntity();
    this.world.addComponent(this.playerId, 'transform3D', {
      x: this.playerSpawn.x,
      y: this.playerSpawn.y,
      z: this.playerSpawn.z,
      previousX: this.playerSpawn.x,
      previousY: this.playerSpawn.y,
      previousZ: this.playerSpawn.z,
    });
    this.world.addComponent(this.playerId, 'size3D', { width: 1.0, height: 1.4, depth: 1.0 });
    this.world.addComponent(this.playerId, 'velocity3D', { x: 0, y: 0, z: 0 });
    this.world.addComponent(this.playerId, 'collider3D', { enabled: true, solid: false });
    this.world.addComponent(this.playerId, 'renderable3D', { color: '#7dd3fc' });

    this.gateId = null;
    this.buildDungeon();
  }

  setCamera3D(camera3D) {
    this.camera3D = camera3D;
    this.syncCamera();
  }

  addSolid(transform3D, size3D, color = '#fca5a5') {
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
    return id;
  }

  buildDungeon() {
    this.addSolid({ x: -9.8, y: -0.1, z: 2.2 }, { width: 0.8, height: 2.6, depth: 29.6 });
    this.addSolid({ x: 9.0, y: -0.1, z: 2.2 }, { width: 0.8, height: 2.6, depth: 29.6 });
    this.addSolid({ x: -9.8, y: -0.1, z: 2.0 }, { width: 19.6, height: 2.6, depth: 0.8 });
    this.addSolid({ x: -9.8, y: -0.1, z: 31.0 }, { width: 19.6, height: 2.6, depth: 0.8 });

    this.addSolid({ x: -4.8, y: -0.1, z: 5.4 }, { width: 0.8, height: 2.2, depth: 8.8 });
    this.addSolid({ x: -4.8, y: -0.1, z: 17.4 }, { width: 0.8, height: 2.2, depth: 5.2 });
    this.addSolid({ x: -0.2, y: -0.1, z: 8.8 }, { width: 0.8, height: 2.2, depth: 11.6 });
    this.addSolid({ x: 3.8, y: -0.1, z: 4.2 }, { width: 0.8, height: 2.2, depth: 10.8 });
    this.addSolid({ x: 3.8, y: -0.1, z: 19.0 }, { width: 0.8, height: 2.2, depth: 9.2 });
    this.addSolid({ x: -8.6, y: -0.1, z: 14.0 }, { width: 4.2, height: 2.2, depth: 0.8 });
    this.addSolid({ x: -3.9, y: -0.1, z: 24.8 }, { width: 4.2, height: 2.2, depth: 0.8 });
    this.addSolid({ x: 0.8, y: -0.1, z: 14.4 }, { width: 4.0, height: 2.2, depth: 0.8 });

    this.gateId = this.addSolid({ x: 6.2, y: -0.1, z: 26.8 }, { width: 0.8, height: 2.2, depth: 3.0 }, '#f87171');
  }

  syncCamera() {
    if (!this.camera3D) {
      return;
    }

    const player = this.world.requireComponent(this.playerId, 'transform3D');
    this.camera3D.setPosition({
      x: player.x,
      y: 9.8,
      z: player.z - 8.8,
    });
    this.camera3D.setRotation({
      x: -0.5,
      y: 0,
      z: 0,
    });
  }

  resetRun(reason = 'manual-reset') {
    const player = this.world.requireComponent(this.playerId, 'transform3D');
    const velocity = this.world.requireComponent(this.playerId, 'velocity3D');
    player.x = this.playerSpawn.x;
    player.y = this.playerSpawn.y;
    player.z = this.playerSpawn.z;
    player.previousX = this.playerSpawn.x;
    player.previousY = this.playerSpawn.y;
    player.previousZ = this.playerSpawn.z;
    velocity.x = 0;
    velocity.y = 0;
    velocity.z = 0;

    this.relicCollected = false;
    this.escaped = false;
    this.runState = 'seek-relic';
    this.runElapsedSeconds = 0;
    this.interactionFlashSeconds = 0;
    this.lastResetReason = reason;
    this.runCount += 1;

    const gateSolid = this.world.requireComponent(this.gateId, 'solid3D');
    gateSolid.enabled = true;
    const gateRenderable = this.world.requireComponent(this.gateId, 'renderable3D');
    gateRenderable.color = '#f87171';
  }

  step3DPhysics(dt, engine) {
    const input = engine.input;
    const resetPressed = input?.isDown('KeyR') === true;
    if (resetPressed && !this.resetLatch) {
      this.resetRun('manual-reset');
    }
    this.resetLatch = resetPressed;

    this.interactionFlashSeconds = Math.max(0, this.interactionFlashSeconds - dt);

    const velocity = this.world.requireComponent(this.playerId, 'velocity3D');
    if (!this.escaped) {
      const axisX = (input?.isDown('KeyD') ? 1 : 0) - (input?.isDown('KeyA') ? 1 : 0);
      const axisZ = (input?.isDown('KeyW') ? 1 : 0) - (input?.isDown('KeyS') ? 1 : 0);
      const length = Math.hypot(axisX, axisZ) || 1;

      velocity.x = (axisX / length) * this.moveSpeed;
      velocity.z = (axisZ / length) * this.moveSpeed;
      velocity.y = 0;

      this.lastPhysicsSummary = stepWorldPhysics3D(this.world, dt, {
        worldBounds: this.worldBounds,
      });
      this.runElapsedSeconds += dt;
    } else {
      velocity.x = 0;
      velocity.y = 0;
      velocity.z = 0;
      this.lastPhysicsSummary = { movedEntities: 0, collisionCount: 0 };
    }

    const player = this.world.requireComponent(this.playerId, 'transform3D');
    const playerSize = this.world.requireComponent(this.playerId, 'size3D');
    const playerAabb = {
      x: player.x,
      y: player.y,
      z: player.z,
      width: playerSize.width,
      height: playerSize.height,
      depth: playerSize.depth,
    };

    if (!this.relicCollected && isAabbColliding3D(playerAabb, this.relic)) {
      this.relicCollected = true;
      this.runState = 'escape';
      this.interactionFlashSeconds = 1.1;
      const gateSolid = this.world.requireComponent(this.gateId, 'solid3D');
      gateSolid.enabled = false;
      const gateRenderable = this.world.requireComponent(this.gateId, 'renderable3D');
      gateRenderable.color = '#86efac';
    }

    if (this.relicCollected && isAabbColliding3D(playerAabb, this.exitGoal)) {
      this.escaped = true;
      this.runState = 'complete';
      this.lastCompletionSeconds = this.runElapsedSeconds;
      this.interactionFlashSeconds = 1.6;
    }

    this.syncCamera();
  }

  render(renderer) {
    const objectiveLine =
      this.runState === 'seek-relic'
        ? 'Objective: collect the relic to unlock the gate.'
        : this.runState === 'escape'
          ? 'Objective: pass the unlocked gate and reach the exit.'
          : `Run complete in ${this.lastCompletionSeconds.toFixed(1)} s. Press R to restart.`;

    drawFrame(renderer, theme, [
      'Sample 1608 - 3D Dungeon Crawler',
      'Explore rooms, collect the relic, then escape through the unlocked route.',
      'Move: W A S D | Restart run: R',
      objectiveLine,
    ]);

    renderer.strokeRect(this.viewport.x, this.viewport.y, this.viewport.width, this.viewport.height, '#d8d5ff', 2);

    const cameraState = this.camera3D?.getState?.() ?? {
      position: { x: -8.2, y: 9.8, z: -4.6 },
      rotation: { x: -0.5, y: 0, z: 0 },
    };
    const projectionViewport = createProjectionViewport(this.viewport);

    drawGroundGrid(
      renderer,
      {
        minX: -10,
        maxX: 10,
        minZ: 2,
        maxZ: 32,
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
      drawWireBox(renderer, transform3D, size3D, cameraState, projectionViewport, renderable3D.color, 2);
    });

    if (!this.relicCollected) {
      drawWireBox(
        renderer,
        this.relic,
        { width: this.relic.width, height: this.relic.height, depth: this.relic.depth },
        cameraState,
        projectionViewport,
        '#fde68a',
        2,
      );
    }

    const exitColor = this.relicCollected ? '#4ade80' : '#475569';
    drawWireBox(renderer, this.exitGoal, { width: this.exitGoal.width, height: this.exitGoal.height, depth: this.exitGoal.depth }, cameraState, projectionViewport, exitColor, 2);

    const player = this.world.requireComponent(this.playerId, 'transform3D');
    const statusLine =
      this.runState === 'seek-relic'
        ? 'Seek relic'
        : this.runState === 'escape'
          ? 'Exit route open'
          : 'Escaped';
    const flashLine = this.interactionFlashSeconds > 0 ? 'Interaction: event pulse active' : 'Interaction: idle';

    drawPanel(renderer, 620, 34, 300, 236, 'Dungeon Runtime', [
      `Explorer: x=${player.x.toFixed(2)} y=${player.y.toFixed(2)} z=${player.z.toFixed(2)}`,
      `Run: ${this.runCount} | State: ${statusLine}`,
      `Relic: ${this.relicCollected ? 'collected' : 'missing'}`,
      `Gate: ${this.relicCollected ? 'unlocked' : 'locked'}`,
      `Escaped: ${this.escaped ? 'yes' : 'no'}`,
      `Resolved collisions: ${this.lastPhysicsSummary.collisionCount}`,
      `Run time: ${this.runElapsedSeconds.toFixed(1)} s | Last clear: ${this.lastCompletionSeconds.toFixed(1)} s`,
      flashLine,
      `Last reset: ${this.lastResetReason}`,
    ]);
  }
}
