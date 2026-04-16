/*
Toolbox Aid
David Quesenberry
04/16/2026
RealGameplayMiniGameScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import {
  PANEL_3D_CAMERA,
  PANEL_3D_COLLISION,
  createStandard3dPanels,
  createStandard3dProviders,
  drawFrame,
  drawPanel,
} from '/src/engine/debug/index.js';
import {
  applyPhase16CameraMode,
  createPhase16ViewState,
  createProjectionViewport,
  drawDepthBackdrop,
  drawGroundGrid,
  drawPhase16DebugOverlay,
  drawWireBox,
  stepPhase16ViewToggles,
} from '/samples/phase-16/shared/threeDWireframe.js';

const theme = new Theme(ThemeTokens);

const CAMERA_ID = 'sample1708.follow.camera';
const RUNNING_STATE = 'running';
const WON_STATE = 'won';
const LOST_STATE = 'lost';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function createAabb2d(body) {
  return {
    x: Number(body.x) || 0,
    z: Number(body.z) || 0,
    width: Math.max(0.01, Number(body.width) || 0.01),
    depth: Math.max(0.01, Number(body.depth) || 0.01),
  };
}

function intersectsAabb2d(left, right) {
  return (
    left.x < right.x + right.width &&
    left.x + left.width > right.x &&
    left.z < right.z + right.depth &&
    left.z + left.depth > right.z
  );
}

export default class RealGameplayMiniGameScene extends Scene {
  constructor() {
    super();
    this.viewport = { x: 40, y: 166, width: 860, height: 324, focalLength: 468 };
    this.bounds = { minX: -10, maxX: 10, minZ: 6, maxZ: 30 };
    this.playerSpeed = 8.4;
    this.hitCooldownSeconds = 1.1;
    this.maxHealth = 3;
    this.targetScore = 6;
    this.roundSeconds = 55;
    this.cameraYawOffset = 0;
    this.elapsed = 0;
    this.resetLatch = false;
    this.viewState = createPhase16ViewState({ defaultCameraMode: 'follow', debugOverlayEnabled: true });
    this.debugCollisionRows = [];

    this.resetMatch();

    const { providerMap } = createStandard3dProviders({
      adapters: {
        cameraSummary: () => this.readCameraSummarySnapshot(),
        collisionOverlays: () => this.readCollisionOverlaySnapshot(),
      },
    });
    this.standardDebugPanels = createStandard3dPanels({
      providerMap,
      enabled: true,
    });
  }

  resetMatch() {
    this.gameState = RUNNING_STATE;
    this.resultMessage = 'Collect all data cores and avoid sentries.';
    this.timeLeft = this.roundSeconds;
    this.score = 0;
    this.health = this.maxHealth;
    this.hitCooldown = 0;
    this.debugCollisionRows = [];
    this.lastCollisionCount = 0;

    this.player = {
      x: -0.7,
      y: 0,
      z: 26.4,
      width: 1.1,
      height: 1.1,
      depth: 1.1,
    };

    this.obstacles = [
      { id: 'crate-1', x: -6.8, y: -0.1, z: 20.2, width: 2.3, height: 1.8, depth: 2.2 },
      { id: 'crate-2', x: -0.8, y: -0.1, z: 17.1, width: 2.1, height: 2.0, depth: 2.1 },
      { id: 'crate-3', x: 4.8, y: -0.1, z: 21.6, width: 2.5, height: 1.7, depth: 2.3 },
      { id: 'crate-4', x: -3.2, y: -0.1, z: 11.2, width: 2.4, height: 1.9, depth: 2.4 },
      { id: 'crate-5', x: 3.8, y: -0.1, z: 9.4, width: 2.2, height: 1.9, depth: 2.2 },
    ];

    this.enemies = [
      { id: 'sentry-1', x: -7.3, y: 0, z: 14.2, width: 1.2, height: 1.2, depth: 1.2, minX: -8.6, maxX: -2.1, dir: 1, speed: 2.9 },
      { id: 'sentry-2', x: 1.0, y: 0, z: 19.7, width: 1.2, height: 1.2, depth: 1.2, minX: -1.8, maxX: 6.8, dir: 1, speed: 3.2 },
      { id: 'sentry-3', x: -4.4, y: 0, z: 8.4, width: 1.2, height: 1.2, depth: 1.2, minX: -6.6, maxX: 5.8, dir: 1, speed: 2.7 },
    ];

    this.cores = [
      { id: 'core-1', x: -8.2, y: 0.32, z: 27.5, width: 0.44, height: 0.44, depth: 0.44, collected: false },
      { id: 'core-2', x: -4.2, y: 0.32, z: 23.2, width: 0.44, height: 0.44, depth: 0.44, collected: false },
      { id: 'core-3', x: 1.8, y: 0.32, z: 24.5, width: 0.44, height: 0.44, depth: 0.44, collected: false },
      { id: 'core-4', x: 7.2, y: 0.32, z: 19.9, width: 0.44, height: 0.44, depth: 0.44, collected: false },
      { id: 'core-5', x: -1.0, y: 0.32, z: 14.2, width: 0.44, height: 0.44, depth: 0.44, collected: false },
      { id: 'core-6', x: 5.6, y: 0.32, z: 10.4, width: 0.44, height: 0.44, depth: 0.44, collected: false },
    ];

    this.syncCamera();
  }

  setCamera3D(camera3D) {
    this.camera3D = camera3D;
    this.syncCamera();
  }

  pushCollisionRow(overlayId, kind, state, enabled = true) {
    this.debugCollisionRows.push({
      overlayId,
      kind,
      state,
      enabled,
      order: this.debugCollisionRows.length,
    });
  }

  readCameraSummarySnapshot() {
    const state = this.camera3D?.getState?.() || {
      position: { x: 0, y: 8, z: 16 },
      rotation: { x: -0.5, y: 0.55 + this.cameraYawOffset, z: 0 },
    };
    return {
      activeCameraId: CAMERA_ID,
      mode: this.viewState.cameraMode,
      position: state.position,
      rotation: state.rotation,
      fov: 65,
      zoom: 1,
      near: 0.1,
      far: 120,
    };
  }

  readCollisionOverlaySnapshot() {
    return {
      overlayRows: this.debugCollisionRows,
    };
  }

  syncCamera() {
    if (!this.camera3D) {
      return;
    }

    const focusPoint = {
      x: this.player.x + this.player.width * 0.5,
      y: 0.6,
      z: this.player.z + this.player.depth * 0.5,
    };
    const yaw = 0.56 + this.cameraYawOffset;
    const basePose = {
      position: {
        x: focusPoint.x + Math.sin(yaw) * 8.7,
        y: 8.3,
        z: focusPoint.z - Math.cos(yaw) * 9.1,
      },
      rotation: {
        x: -0.5,
        y: yaw,
        z: 0,
      },
    };
    applyPhase16CameraMode(this.camera3D, this.viewState, basePose, focusPoint);
  }

  asPlayerBody(x = this.player.x, z = this.player.z) {
    return createAabb2d({
      x,
      z,
      width: this.player.width,
      depth: this.player.depth,
    });
  }

  isBlockedAt(x, z) {
    const playerBody = this.asPlayerBody(x, z);
    for (let i = 0; i < this.obstacles.length; i += 1) {
      const obstacle = this.obstacles[i];
      if (intersectsAabb2d(playerBody, createAabb2d(obstacle))) {
        return obstacle;
      }
    }
    return null;
  }

  movePlayer(dtSeconds, input) {
    const axisX = (input?.isDown('KeyD') ? 1 : 0) - (input?.isDown('KeyA') ? 1 : 0);
    const axisZ = (input?.isDown('KeyW') ? 1 : 0) - (input?.isDown('KeyS') ? 1 : 0);
    if (axisX === 0 && axisZ === 0) {
      return;
    }

    const length = Math.hypot(axisX, axisZ) || 1;
    const velocityX = (axisX / length) * this.playerSpeed * dtSeconds;
    const velocityZ = (axisZ / length) * this.playerSpeed * dtSeconds;

    const minX = this.bounds.minX;
    const maxX = this.bounds.maxX - this.player.width;
    const minZ = this.bounds.minZ;
    const maxZ = this.bounds.maxZ - this.player.depth;

    const nextX = clamp(this.player.x + velocityX, minX, maxX);
    const nextZ = clamp(this.player.z + velocityZ, minZ, maxZ);

    const blockedBoth = this.isBlockedAt(nextX, nextZ);
    if (!blockedBoth) {
      this.player.x = nextX;
      this.player.z = nextZ;
      return;
    }

    const blockedX = this.isBlockedAt(nextX, this.player.z);
    const blockedZ = this.isBlockedAt(this.player.x, nextZ);
    if (!blockedX) {
      this.player.x = nextX;
    }
    if (!blockedZ) {
      this.player.z = nextZ;
    }

    this.pushCollisionRow(`block:${blockedBoth.id}`, 'obstacle', 'blocked', true);
  }

  updateEnemies(dtSeconds) {
    for (let i = 0; i < this.enemies.length; i += 1) {
      const enemy = this.enemies[i];
      enemy.x += enemy.dir * enemy.speed * dtSeconds;
      if (enemy.x <= enemy.minX) {
        enemy.x = enemy.minX;
        enemy.dir = 1;
      } else if (enemy.x >= enemy.maxX) {
        enemy.x = enemy.maxX;
        enemy.dir = -1;
      }
    }
  }

  collectCores() {
    const playerCenterX = this.player.x + this.player.width * 0.5;
    const playerCenterZ = this.player.z + this.player.depth * 0.5;
    for (let i = 0; i < this.cores.length; i += 1) {
      const core = this.cores[i];
      if (core.collected) {
        continue;
      }
      const distance = Math.hypot(playerCenterX - core.x, playerCenterZ - core.z);
      if (distance <= 1.2) {
        core.collected = true;
        this.score += 1;
        this.pushCollisionRow(`collect:${core.id}`, 'objective', 'collected', true);
      }
    }
  }

  checkEnemyHits(dtSeconds) {
    this.hitCooldown = Math.max(0, this.hitCooldown - dtSeconds);
    const playerBody = this.asPlayerBody();
    for (let i = 0; i < this.enemies.length; i += 1) {
      const enemy = this.enemies[i];
      if (!intersectsAabb2d(playerBody, createAabb2d(enemy))) {
        continue;
      }
      this.pushCollisionRow(`enemy:${enemy.id}`, 'enemy', this.hitCooldown > 0 ? 'contact' : 'hit', true);
      if (this.hitCooldown > 0) {
        continue;
      }
      this.hitCooldown = this.hitCooldownSeconds;
      this.health = Math.max(0, this.health - 1);
      this.player.x = clamp(this.player.x, this.bounds.minX, this.bounds.maxX - this.player.width);
      this.player.z = clamp(this.player.z + 1.35, this.bounds.minZ, this.bounds.maxZ - this.player.depth);
      break;
    }
  }

  evaluateRoundState() {
    if (this.score >= this.targetScore) {
      this.gameState = WON_STATE;
      this.resultMessage = `Objective complete: ${this.score}/${this.targetScore} cores captured.`;
      return;
    }
    if (this.health <= 0) {
      this.gameState = LOST_STATE;
      this.resultMessage = 'Mission failed: hull integrity depleted.';
      return;
    }
    if (this.timeLeft <= 0) {
      this.gameState = LOST_STATE;
      this.resultMessage = 'Mission failed: timer expired before objective completion.';
    }
  }

  step3DPhysics(dtSeconds, engine) {
    const dt = Math.max(0, Math.min(0.05, Number(dtSeconds) || 0));
    this.elapsed += dt;
    const input = engine?.input;

    stepPhase16ViewToggles(this.viewState, input);

    const resetDown = input?.isDown('KeyR') === true;
    if (resetDown && this.resetLatch === false) {
      this.resetMatch();
    }
    this.resetLatch = resetDown;

    if (input?.isDown('ArrowLeft') || input?.isDown('KeyQ')) {
      this.cameraYawOffset -= 0.85 * dt;
    }
    if (input?.isDown('ArrowRight') || input?.isDown('KeyE')) {
      this.cameraYawOffset += 0.85 * dt;
    }
    this.cameraYawOffset = clamp(this.cameraYawOffset, -1.15, 1.15);

    this.debugCollisionRows = [];
    if (this.gameState === RUNNING_STATE) {
      this.timeLeft = Math.max(0, this.timeLeft - dt);
      this.movePlayer(dt, input);
      this.updateEnemies(dt);
      this.collectCores();
      this.checkEnemyHits(dt);
      this.evaluateRoundState();
    }

    this.lastCollisionCount = this.debugCollisionRows.length;
    this.syncCamera();
  }

  renderStandardDebugPanel(renderer, panelId, x, y, width, height, maxLines = 8) {
    const panel = this.standardDebugPanels.find((candidate) => candidate.id === panelId);
    if (!panel || typeof panel.render !== 'function') {
      return;
    }
    const rendered = panel.render(panel, {});
    const lines = Array.isArray(rendered?.lines) ? rendered.lines.slice(0, maxLines) : [];
    drawPanel(renderer, x, y, width, height, rendered?.title || panelId, lines);
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Sample 1708 - Real Gameplay Mini-Game',
      'Move through a 3D arena, collect data cores, and avoid moving sentries.',
      'Move: W A S D | Camera yaw: Q/E or Left/Right | Restart: R | Camera mode: C | Debug: V',
    ]);

    const viewport = this.viewport;
    renderer.strokeRect(viewport.x, viewport.y, viewport.width, viewport.height, '#d8d5ff', 2);
    drawDepthBackdrop(renderer, viewport);
    renderer.drawRect(viewport.x + 10, viewport.y + 8, 212, 20, 'rgba(34, 197, 94, 0.22)');
    renderer.drawText('3D World - Outpost Arena', viewport.x + 16, viewport.y + 22, { color: '#bbf7d0', font: '12px monospace' });

    const cameraState = this.camera3D?.getState?.() || {
      position: { x: 8, y: 8, z: 0 },
      rotation: { x: -0.5, y: 0.56 + this.cameraYawOffset, z: 0 },
    };
    const projectionViewport = createProjectionViewport(viewport);

    drawGroundGrid(renderer, { minX: -11, maxX: 11, minZ: 4, maxZ: 31, y: -0.2, step: 2 }, cameraState, projectionViewport);

    for (let i = 0; i < this.obstacles.length; i += 1) {
      const obstacle = this.obstacles[i];
      drawWireBox(
        renderer,
        { x: obstacle.x, y: obstacle.y, z: obstacle.z },
        { width: obstacle.width, height: obstacle.height, depth: obstacle.depth },
        cameraState,
        projectionViewport,
        '#64748b',
        { lineWidth: 2.1, depthCueEnabled: true }
      );
    }

    for (let i = 0; i < this.enemies.length; i += 1) {
      const enemy = this.enemies[i];
      drawWireBox(
        renderer,
        { x: enemy.x, y: enemy.y, z: enemy.z },
        { width: enemy.width, height: enemy.height, depth: enemy.depth },
        cameraState,
        projectionViewport,
        '#f87171',
        { lineWidth: 2.4, depthCueEnabled: true }
      );
    }

    for (let i = 0; i < this.cores.length; i += 1) {
      const core = this.cores[i];
      if (core.collected) {
        continue;
      }
      drawWireBox(
        renderer,
        { x: core.x - core.width * 0.5, y: core.y, z: core.z - core.depth * 0.5 },
        { width: core.width, height: core.height, depth: core.depth },
        cameraState,
        projectionViewport,
        '#fde047',
        { lineWidth: 2.1, depthCueEnabled: false }
      );
    }

    const playerColor = this.hitCooldown > 0 ? '#fb7185' : '#f8fafc';
    drawWireBox(
      renderer,
      { x: this.player.x, y: this.player.y, z: this.player.z },
      { width: this.player.width, height: this.player.height, depth: this.player.depth },
      cameraState,
      projectionViewport,
      playerColor,
      { lineWidth: 2.6, depthCueEnabled: true }
    );

    renderer.drawRect(52, 34, 306, 124, 'rgba(15, 23, 42, 0.76)');
    renderer.strokeRect(52, 34, 306, 124, '#4ade80', 1);
    renderer.drawText('UI Layer - Mission HUD', 64, 52, { color: '#86efac', font: '12px monospace' });
    renderer.drawText(`Score: ${this.score}/${this.targetScore}`, 64, 72, { color: '#e2e8f0', font: '12px monospace' });
    renderer.drawText(`Health: ${this.health}/${this.maxHealth}`, 64, 90, { color: '#e2e8f0', font: '12px monospace' });
    renderer.drawText(`Time: ${this.timeLeft.toFixed(1)} s`, 64, 108, { color: '#e2e8f0', font: '12px monospace' });
    renderer.drawText(`State: ${this.gameState}`, 64, 126, { color: '#e2e8f0', font: '12px monospace' });
    renderer.drawText('Restart: R', 220, 126, { color: '#e2e8f0', font: '12px monospace' });

    if (this.gameState !== RUNNING_STATE) {
      renderer.drawRect(300, 238, 360, 82, 'rgba(15, 23, 42, 0.84)');
      renderer.strokeRect(300, 238, 360, 82, this.gameState === WON_STATE ? '#4ade80' : '#f87171', 2);
      renderer.drawText(this.gameState === WON_STATE ? 'MISSION COMPLETE' : 'MISSION FAILED', 318, 266, {
        color: this.gameState === WON_STATE ? '#86efac' : '#fecaca',
        font: '16px monospace',
      });
      renderer.drawText(this.resultMessage, 318, 288, {
        color: '#e2e8f0',
        font: '12px monospace',
      });
      renderer.drawText('Press R to restart.', 318, 306, {
        color: '#e2e8f0',
        font: '12px monospace',
      });
    }

    drawPanel(renderer, 620, 414, 300, 120, 'Mini-Game Runtime', [
      `Entities: obstacles=${this.obstacles.length} sentries=${this.enemies.length}`,
      `Remaining cores: ${this.cores.filter((core) => !core.collected).length}`,
      `Player: x=${this.player.x.toFixed(2)} z=${this.player.z.toFixed(2)}`,
      `Collision overlays: ${this.lastCollisionCount}`,
      `Camera mode: ${this.viewState.cameraMode}`,
    ]);

    this.renderStandardDebugPanel(renderer, PANEL_3D_CAMERA, 620, 34, 300, 150, 7);
    this.renderStandardDebugPanel(renderer, PANEL_3D_COLLISION, 620, 194, 300, 210, 9);

    drawPhase16DebugOverlay(renderer, viewport, this.viewState, [
      'Objective: collect all data cores while preserving hull integrity',
      'Standard 3D camera/collision debug panels rendered from provider snapshots',
    ]);
  }
}
