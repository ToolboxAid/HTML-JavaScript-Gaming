/*
Toolbox Aid
David Quesenberry
04/16/2026
RealGameplayMiniGameScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import {
  createBottomRightDebugPanelStack,
  drawFrame,
  drawStackedDebugPanel,
} from '/src/engine/debug/index.js';
import {
  applyPhase16CameraMode,
  createPhase16ViewState,
  createProjectionViewport,
  drawDepthBackdrop,
  drawGroundGrid,
  drawWireBox,
  stepPhase16ViewToggles,
} from '/samples/phase-16/shared/threeDWireframe.js';
import {
  createTabDebugOverlayController,
  getTabDebugOverlayActiveId,
  getTabDebugOverlayStatusLabel,
  isTabDebugOverlayActive,
  setTabDebugOverlayCycleKey,
  setTabDebugOverlayMap,
  setTabDebugOverlayPersistenceKey,
  stepTabDebugOverlayController,
} from '/samples/phase-17/shared/tabDebugOverlayCycle.js';
import {
  MINI_GAME_DEBUG_CYCLE_KEY,
  OVERLAY_MINI_GAME_RUNTIME,
  OVERLAY_MISSION_FEED,
  OVERLAY_MISSION_READY,
  OVERLAY_UI_LAYER,
} from '/samples/phase-17/shared/miniGameOverlayStack.js';
import { getRequiredLevel17OverlayStackConfig } from '/samples/phase-17/shared/overlayStackBySampleConfig.js';
import {
  createOverlayGameplayRuntime,
  renderOverlayGameplayRuntime,
  stepOverlayGameplayRuntimeControls,
  setOverlayGameplayRuntimeExtensions,
  stepOverlayGameplayRuntime,
} from '/samples/phase-17/shared/overlayGameplayRuntime.js';

const theme = new Theme(ThemeTokens);

const READY_STATE = 'ready';
const RUNNING_STATE = 'running';
const WON_STATE = 'won';
const LOST_STATE = 'lost';
const DEBUG_OVERLAY_CONFIG = getRequiredLevel17OverlayStackConfig('1708');

function formatMissionStatusLabel(gameState) {
  return gameState === RUNNING_STATE
    ? 'Status: mission active.'
    : gameState === READY_STATE
      ? 'Status: waiting for deploy.'
      : `Status: ${gameState}.`;
}

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
    this.startLatch = false;
    this.restartLatch = false;
    this.viewState = createPhase16ViewState({ defaultCameraMode: 'follow', debugOverlayEnabled: true });
    this.debugCollisionRows = [];
    this.eventFeed = [];
    this.pickupBursts = [];
    this.hitFlash = 0;
    this.pickupFlash = 0;
    this.missionFeedState = null;

    this.resetMatch({ toReady: true });

    this.tabDebugOverlays = createTabDebugOverlayController();
    setTabDebugOverlayCycleKey(this.tabDebugOverlays, DEBUG_OVERLAY_CONFIG.cycleKey || MINI_GAME_DEBUG_CYCLE_KEY);
    setTabDebugOverlayPersistenceKey(this.tabDebugOverlays, DEBUG_OVERLAY_CONFIG.persistenceKey);
    this.setDebugOverlayCycleMap(DEBUG_OVERLAY_CONFIG.overlays, DEBUG_OVERLAY_CONFIG.initialOverlayId);
    this.overlayGameplayRuntime = createOverlayGameplayRuntime({
      runtimeExtensions: DEBUG_OVERLAY_CONFIG.runtimeExtensions,
    });
  }

  addEvent(text) {
    const normalized = String(text || '').trim();
    if (!normalized) return;
    this.eventFeed.unshift(normalized);
    if (this.eventFeed.length > 5) {
      this.eventFeed.length = 5;
    }
  }

  resetMatch({ toReady = true } = {}) {
    this.gameState = toReady ? READY_STATE : RUNNING_STATE;
    this.resultMessage = toReady
      ? 'Press Space or Enter to deploy.'
      : 'Collect all data cores and avoid sentries.';
    this.timeLeft = this.roundSeconds;
    this.score = 0;
    this.health = this.maxHealth;
    this.hitCooldown = 0;
    this.debugCollisionRows = [];
    this.lastCollisionCount = 0;
    this.pickupBursts = [];
    this.hitFlash = 0;
    this.pickupFlash = 0;

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

    this.eventFeed = [];
    this.addEvent(`Objective: secure ${this.targetScore} cores.`);
    this.addEvent('Avoid sentries and preserve hull integrity.');
    if (toReady) {
      this.addEvent('Ready: press Space/Enter to deploy.');
    }

    this.refreshMissionFeedState();
    this.syncCamera();
  }

  startMatch() {
    if (this.gameState !== READY_STATE) return;
    this.gameState = RUNNING_STATE;
    this.resultMessage = 'Mission active. Collect cores and avoid sentries.';
    this.addEvent('Mission started.');
    this.refreshMissionFeedState();
  }

  setCamera3D(camera3D) {
    this.camera3D = camera3D;
    this.syncCamera();
  }

  setDebugOverlayCycleMap(overlays, initialOverlayId) {
    setTabDebugOverlayMap(this.tabDebugOverlays, {
      overlays,
      initialOverlayId,
    });
  }

  setDebugOverlayCycleKey(cycleKey) {
    setTabDebugOverlayCycleKey(this.tabDebugOverlays, cycleKey);
  }

  setDebugOverlayPersistenceKey(persistenceKey) {
    setTabDebugOverlayPersistenceKey(this.tabDebugOverlays, persistenceKey);
  }

  setOverlayGameplayRuntimeExtensions(runtimeExtensions) {
    return setOverlayGameplayRuntimeExtensions(this.overlayGameplayRuntime, runtimeExtensions);
  }

  isDebugOverlayActive(overlayId) {
    return isTabDebugOverlayActive(this.tabDebugOverlays, overlayId);
  }

  getDebugOverlayStatusLabel() {
    return getTabDebugOverlayStatusLabel(this.tabDebugOverlays);
  }

  getActiveDebugOverlayId() {
    return getTabDebugOverlayActiveId(this.tabDebugOverlays);
  }

  buildMissionFeedLiveLine() {
    return `live=objective ${this.score}/${this.targetScore} hull=${this.health}/${this.maxHealth} t=${this.timeLeft.toFixed(1)}s`;
  }

  refreshMissionFeedState() {
    this.missionFeedState = {
      statusLabel: formatMissionStatusLabel(this.gameState),
      liveLine: this.buildMissionFeedLiveLine(),
    };
    return this.missionFeedState;
  }

  getMissionFeedStateSnapshot() {
    const state = this.missionFeedState || this.refreshMissionFeedState();
    return {
      statusLabel: state.statusLabel,
      liveLine: state.liveLine,
    };
  }

  getOverlayLayoutSafeZones() {
    const insetX = 96;
    const insetY = 66;
    return [
      {
        id: 'critical-gameplay-area',
        x: this.viewport.x + insetX,
        y: this.viewport.y + insetY,
        width: Math.max(240, this.viewport.width - insetX * 2),
        height: Math.max(160, this.viewport.height - insetY * 2),
      },
    ];
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
        this.pickupFlash = 0.2;
        this.pickupBursts.push({
          x: core.x - core.width * 0.5,
          y: core.y,
          z: core.z - core.depth * 0.5,
          age: 0,
          ttl: 0.45,
        });
        if (this.pickupBursts.length > 8) {
          this.pickupBursts.shift();
        }
        this.addEvent(`Core secured (${this.score}/${this.targetScore}).`);
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
      this.hitFlash = 0.28;
      this.health = Math.max(0, this.health - 1);
      this.addEvent(`Sentry impact! Hull: ${this.health}/${this.maxHealth}`);
      this.player.x = clamp(this.player.x, this.bounds.minX, this.bounds.maxX - this.player.width);
      this.player.z = clamp(this.player.z + 1.35, this.bounds.minZ, this.bounds.maxZ - this.player.depth);
      break;
    }
  }

  evaluateRoundState() {
    if (this.gameState !== RUNNING_STATE) {
      this.refreshMissionFeedState();
      return;
    }
    if (this.score >= this.targetScore) {
      this.gameState = WON_STATE;
      this.resultMessage = `Objective complete: ${this.score}/${this.targetScore} cores captured.`;
      this.addEvent('Mission complete.');
      this.refreshMissionFeedState();
      return;
    }
    if (this.health <= 0) {
      this.gameState = LOST_STATE;
      this.resultMessage = 'Mission failed: hull integrity depleted.';
      this.addEvent('Mission failed: hull integrity depleted.');
      this.refreshMissionFeedState();
      return;
    }
    if (this.timeLeft <= 0) {
      this.gameState = LOST_STATE;
      this.resultMessage = 'Mission failed: timer expired before objective completion.';
      this.addEvent('Mission failed: timer expired.');
    }
    this.refreshMissionFeedState();
  }

  updateFeedback(dtSeconds) {
    this.hitFlash = Math.max(0, this.hitFlash - dtSeconds * 1.8);
    this.pickupFlash = Math.max(0, this.pickupFlash - dtSeconds * 2.3);
    for (let i = this.pickupBursts.length - 1; i >= 0; i -= 1) {
      const burst = this.pickupBursts[i];
      burst.age += dtSeconds;
      if (burst.age >= burst.ttl) {
        this.pickupBursts.splice(i, 1);
      }
    }
  }

  step3DPhysics(dtSeconds, engine) {
    const dt = Math.max(0, Math.min(0.05, Number(dtSeconds) || 0));
    this.elapsed += dt;
    const input = engine?.input;
    stepTabDebugOverlayController(this.tabDebugOverlays, input);

    stepPhase16ViewToggles(this.viewState, input);

    const startDown = input?.isDown('Space') === true || input?.isDown('Enter') === true;
    if (startDown && this.startLatch === false) {
      this.startMatch();
    }
    this.startLatch = startDown;

    const restartDown = input?.isDown('KeyR') === true;
    if (restartDown && this.restartLatch === false && this.gameState !== RUNNING_STATE) {
      this.resetMatch({ toReady: true });
    }
    this.restartLatch = restartDown;

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
    this.updateFeedback(dt);
    this.refreshMissionFeedState();
    stepOverlayGameplayRuntimeControls(this.overlayGameplayRuntime, input, { dtSeconds: dt });
    stepOverlayGameplayRuntime(this.overlayGameplayRuntime, {
      scene: this,
      engine,
      input,
      dtSeconds: dt,
      gameState: this.gameState,
      activeOverlayId: this.getActiveDebugOverlayId(),
    });
    this.syncCamera();
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Sample 1708 - Real Gameplay Mini-Game (Polished)',
      'Deploy, collect data cores, survive sentry patrols, and complete mission objectives.',
      `Start: Space/Enter | Move: W A S D | Camera yaw: Q/E or Left/Right | Restart: R | Overlay: G/Shift+G (${this.getDebugOverlayStatusLabel()})`,
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
      const pulseScale = 1 + Math.sin(this.elapsed * 6 + i) * 0.12;
      const width = core.width * pulseScale;
      const height = core.height * pulseScale;
      const depth = core.depth * pulseScale;
      drawWireBox(
        renderer,
        { x: core.x - width * 0.5, y: core.y, z: core.z - depth * 0.5 },
        { width, height, depth },
        cameraState,
        projectionViewport,
        '#fde047',
        { lineWidth: 2.1, depthCueEnabled: false }
      );
    }

    for (let i = 0; i < this.pickupBursts.length; i += 1) {
      const burst = this.pickupBursts[i];
      const t = clamp(burst.age / burst.ttl, 0, 1);
      const size = 0.32 + t * 1.08;
      drawWireBox(
        renderer,
        { x: burst.x - size * 0.5, y: burst.y + t * 0.5, z: burst.z - size * 0.5 },
        { width: size, height: size, depth: size },
        cameraState,
        projectionViewport,
        t < 0.55 ? '#67e8f9' : '#22d3ee',
        { lineWidth: 2.2 - t * 1.2, depthCueEnabled: false }
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

    if (this.hitFlash > 0) {
      const alpha = (this.hitFlash * 0.26).toFixed(3);
      renderer.drawRect(viewport.x, viewport.y, viewport.width, viewport.height, `rgba(248, 113, 113, ${alpha})`);
    }
    if (this.pickupFlash > 0) {
      const alpha = (this.pickupFlash * 0.18).toFixed(3);
      renderer.drawRect(viewport.x, viewport.y, viewport.width, viewport.height, `rgba(34, 211, 238, ${alpha})`);
    }

    const missionFeedState = this.getMissionFeedStateSnapshot();

    const debugStack = createBottomRightDebugPanelStack(renderer);
    this.debugOverlayStack = debugStack;
    const activeOverlayId = this.getActiveDebugOverlayId();
    if (activeOverlayId === OVERLAY_UI_LAYER) {
      drawStackedDebugPanel(renderer, debugStack, 326, 174, 'UI Layer', [
        `state=${this.gameState.toUpperCase()}`,
        `objective=${this.score}/${this.targetScore} cores`,
        `health=${this.health}/${this.maxHealth}`,
        `time=${this.timeLeft.toFixed(1)}s`,
        `cameraMode=${this.viewState.cameraMode}`,
        `overlayCycle=G/Shift+G`,
        'controls=W/A/S/D move | Q/E yaw',
      ]);
    } else if (activeOverlayId === OVERLAY_MISSION_FEED) {
      drawStackedDebugPanel(renderer, debugStack, 326, 160, 'Mission Feed', [
        ...this.eventFeed,
        missionFeedState.liveLine,
        missionFeedState.statusLabel,
      ]);
    } else if (activeOverlayId === OVERLAY_MISSION_READY) {
      const isWin = this.gameState === WON_STATE;
      const outcomeLabel = this.gameState === READY_STATE
        ? 'Press Space or Enter to deploy.'
        : this.gameState === RUNNING_STATE
          ? 'Mission is active. Complete the objective.'
          : this.resultMessage;
      drawStackedDebugPanel(renderer, debugStack, 408, 122, 'MISSION READY', [
        outcomeLabel,
        `state=${this.gameState}`,
        isWin ? 'result=mission complete' : this.gameState === LOST_STATE ? 'result=mission failed' : 'result=pending',
        'restart=R after mission outcome',
      ]);
    } else if (activeOverlayId === OVERLAY_MINI_GAME_RUNTIME) {
      drawStackedDebugPanel(renderer, debugStack, 300, 120, 'Mini-Game Runtime', [
        `Entities: obstacles=${this.obstacles.length} sentries=${this.enemies.length}`,
        `Remaining cores: ${this.cores.filter((core) => !core.collected).length}`,
        `Player: x=${this.player.x.toFixed(2)} z=${this.player.z.toFixed(2)}`,
        `Collision overlays: ${this.lastCollisionCount}`,
        `Camera mode: ${this.viewState.cameraMode}`,
      ]);
    }
    renderOverlayGameplayRuntime(this.overlayGameplayRuntime, {
      scene: this,
      renderer,
      gameState: this.gameState,
      activeOverlayId,
    });
  }
}
