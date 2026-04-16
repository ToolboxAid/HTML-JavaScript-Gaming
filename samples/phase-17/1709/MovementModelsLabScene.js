/*
Toolbox Aid
David Quesenberry
04/16/2026
MovementModelsLabScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { createBottomRightDebugPanelStack, drawFrame, drawStackedDebugPanel } from '/src/engine/debug/index.js';
import {
  createTabDebugOverlayController,
  getTabDebugOverlayActiveId,
  getTabDebugOverlayStatusLabel,
  setTabDebugOverlayCycleKey,
  setTabDebugOverlayPersistenceKey,
  stepTabDebugOverlayController,
} from '/samples/phase-17/shared/tabDebugOverlayCycle.js';
import {
  createMovementOverlayCycleMap,
  MOVEMENT_DEBUG_CYCLE_KEY,
  OVERLAY_MOVEMENT_HUD,
  OVERLAY_MOVEMENT_RUNTIME,
} from '/samples/phase-17/shared/movementOverlayStack.js';
import {
  applyPhase16CameraMode,
  createPhase16ViewState,
  createProjectionViewport,
  drawDepthBackdrop,
  drawGroundGrid,
  drawWireBox,
  projectPoint,
  stepPhase16ViewToggles,
} from '/samples/phase-16/shared/threeDWireframe.js';

const theme = new Theme(ThemeTokens);

const MOVEMENT_MODES = Object.freeze({
  DIRECT: 'direct',
  TANK: 'tank',
  WEIGHTED: 'weighted',
});

const MODE_ORDER = Object.freeze([
  MOVEMENT_MODES.DIRECT,
  MOVEMENT_MODES.TANK,
  MOVEMENT_MODES.WEIGHTED,
]);
const DEBUG_OVERLAY_PERSISTENCE_KEY = 'phase17:1709:overlay-index';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalize2d(x, z) {
  const length = Math.hypot(x, z);
  if (length <= 0.00001) {
    return { x: 0, z: 0, length: 0 };
  }
  return { x: x / length, z: z / length, length };
}

function formatMode(mode) {
  if (mode === MOVEMENT_MODES.DIRECT) return 'Direct XY';
  if (mode === MOVEMENT_MODES.TANK) return 'Tank Rotation';
  return 'Weighted';
}

export default class MovementModelsLabScene extends Scene {
  constructor() {
    super();
    this.viewState = createPhase16ViewState();
    this.viewport = {
      x: 40,
      y: 166,
      width: 860,
      height: 324,
      focalLength: 468,
    };
    this.bounds = { minX: -10, maxX: 10, minZ: 6, maxZ: 30 };
    this.actor = {
      x: -0.6,
      y: 0,
      z: 22.5,
      width: 1.2,
      height: 1.2,
      depth: 1.2,
      heading: 0,
    };

    this.movementMode = MOVEMENT_MODES.DIRECT;
    this.modeCycleLatch = false;
    this.directSpeed = 8.2;
    this.tankMoveSpeed = 7.1;
    this.tankTurnSpeed = 2.6;
    this.weightedAcceleration = 26;
    this.weightedDrag = 3.7;
    this.weightedMaxSpeed = 10.5;
    this.weightedVelocity = { x: 0, z: 0 };
    this.cameraYawOffset = 0;
    this.tankCameraSwingPhase = 0;
    this.elapsed = 0;
    this.lastModeSummary = '';
    this.lastInputSummary = '';
    this.lastSpeed = 0;
    this.tabDebugOverlays = createTabDebugOverlayController({
      overlays: createMovementOverlayCycleMap(),
      initialOverlayId: OVERLAY_MOVEMENT_RUNTIME,
    });
    setTabDebugOverlayCycleKey(this.tabDebugOverlays, MOVEMENT_DEBUG_CYCLE_KEY);
    setTabDebugOverlayPersistenceKey(this.tabDebugOverlays, DEBUG_OVERLAY_PERSISTENCE_KEY);
  }

  setCamera3D(camera3D) {
    this.camera3D = camera3D;
    this.syncCamera();
  }

  setMovementMode(mode) {
    if (!MODE_ORDER.includes(mode)) {
      return;
    }
    this.movementMode = mode;
    if (mode !== MOVEMENT_MODES.WEIGHTED) {
      this.weightedVelocity.x = 0;
      this.weightedVelocity.z = 0;
    }
  }

  cycleMovementMode() {
    const currentIndex = MODE_ORDER.indexOf(this.movementMode);
    const nextIndex = (currentIndex + 1) % MODE_ORDER.length;
    this.setMovementMode(MODE_ORDER[nextIndex]);
  }

  syncCamera() {
    if (!this.camera3D) {
      return;
    }
    const focusPoint = {
      x: this.actor.x + this.actor.width * 0.5,
      y: this.actor.y + 0.6,
      z: this.actor.z + this.actor.depth * 0.5,
    };

    const tankSwingOffset = this.movementMode === MOVEMENT_MODES.TANK
      ? Math.sin(this.tankCameraSwingPhase) * 0.42
      : 0;
    const yaw = this.actor.heading + 0.68 + this.cameraYawOffset + tankSwingOffset;
    const basePose = {
      position: {
        x: focusPoint.x + Math.sin(yaw) * 8.6,
        y: 8.3,
        z: focusPoint.z - Math.cos(yaw) * 9.2,
      },
      rotation: {
        x: -0.52,
        y: yaw,
        z: 0,
      },
    };
    applyPhase16CameraMode(this.camera3D, this.viewState, basePose, focusPoint);
  }

  applyDirectMovement(dtSeconds, input) {
    const axisX = (input?.isDown('KeyD') ? 1 : 0) - (input?.isDown('KeyA') ? 1 : 0);
    const axisY = (input?.isDown('KeyW') ? 1 : 0) - (input?.isDown('KeyS') ? 1 : 0);
    const normalized = normalize2d(axisX, axisY);
    this.actor.x += normalized.x * this.directSpeed * dtSeconds;
    this.actor.z += normalized.z * this.directSpeed * dtSeconds;
    if (normalized.length > 0) {
      this.actor.heading = Math.atan2(normalized.x, normalized.z);
    }
    this.lastInputSummary = `axisX=${axisX} axisY=${axisY}`;
    this.lastSpeed = normalized.length * this.directSpeed;
    this.lastModeSummary = 'Direct axis movement applies immediate position deltas.';
  }

  applyTankMovement(dtSeconds, input) {
    const turnAxis = (input?.isDown('KeyD') || input?.isDown('ArrowRight') ? 1 : 0) - (input?.isDown('KeyA') || input?.isDown('ArrowLeft') ? 1 : 0);
    const throttle = (input?.isDown('KeyW') || input?.isDown('ArrowUp') ? 1 : 0) - (input?.isDown('KeyS') || input?.isDown('ArrowDown') ? 1 : 0);

    this.actor.heading += turnAxis * this.tankTurnSpeed * dtSeconds;
    const moveSpeed = throttle * this.tankMoveSpeed;
    this.actor.x += Math.sin(this.actor.heading) * moveSpeed * dtSeconds;
    this.actor.z += Math.cos(this.actor.heading) * moveSpeed * dtSeconds;
    this.lastInputSummary = `turn=${turnAxis} throttle=${throttle}`;
    this.lastSpeed = Math.abs(moveSpeed);
    this.lastModeSummary = 'Tank mode decouples turning from forward/backward motion.';
  }

  applyWeightedMovement(dtSeconds, input) {
    const axisX = (input?.isDown('KeyD') ? 1 : 0) - (input?.isDown('KeyA') ? 1 : 0);
    const axisY = (input?.isDown('KeyW') ? 1 : 0) - (input?.isDown('KeyS') ? 1 : 0);
    const normalized = normalize2d(axisX, axisY);
    const accelerationX = normalized.x * this.weightedAcceleration;
    const accelerationZ = normalized.z * this.weightedAcceleration;

    this.weightedVelocity.x += accelerationX * dtSeconds;
    this.weightedVelocity.z += accelerationZ * dtSeconds;

    const dragFactor = Math.exp(-this.weightedDrag * dtSeconds);
    this.weightedVelocity.x *= dragFactor;
    this.weightedVelocity.z *= dragFactor;

    const speed = Math.hypot(this.weightedVelocity.x, this.weightedVelocity.z);
    if (speed > this.weightedMaxSpeed) {
      const scale = this.weightedMaxSpeed / speed;
      this.weightedVelocity.x *= scale;
      this.weightedVelocity.z *= scale;
    }

    this.actor.x += this.weightedVelocity.x * dtSeconds;
    this.actor.z += this.weightedVelocity.z * dtSeconds;

    if (speed > 0.08) {
      this.actor.heading = Math.atan2(this.weightedVelocity.x, this.weightedVelocity.z);
    }
    this.lastInputSummary = `axisX=${axisX} axisY=${axisY}`;
    this.lastSpeed = Math.hypot(this.weightedVelocity.x, this.weightedVelocity.z);
    this.lastModeSummary = 'Weighted mode uses acceleration + drag for inertial response.';
  }

  clampActorToBounds() {
    this.actor.x = clamp(this.actor.x, this.bounds.minX, this.bounds.maxX - this.actor.width);
    this.actor.z = clamp(this.actor.z, this.bounds.minZ, this.bounds.maxZ - this.actor.depth);
  }

  step3DPhysics(dtSeconds, engine) {
    const dt = Math.max(0, Math.min(0.05, Number(dtSeconds) || 0));
    this.elapsed += dt;
    const input = engine?.input;
    stepTabDebugOverlayController(this.tabDebugOverlays, input);
    stepPhase16ViewToggles(this.viewState, input);

    if (input?.isDown('Digit1')) this.setMovementMode(MOVEMENT_MODES.DIRECT);
    if (input?.isDown('Digit2')) this.setMovementMode(MOVEMENT_MODES.TANK);
    if (input?.isDown('Digit3')) this.setMovementMode(MOVEMENT_MODES.WEIGHTED);

    const cyclePressed = input?.isDown('KeyM') === true;
    if (cyclePressed && !this.modeCycleLatch) {
      this.cycleMovementMode();
    }
    this.modeCycleLatch = cyclePressed;

    if (input?.isDown('KeyQ')) this.cameraYawOffset -= 0.82 * dt;
    if (input?.isDown('KeyE')) this.cameraYawOffset += 0.82 * dt;
    this.cameraYawOffset = clamp(this.cameraYawOffset, -1.2, 1.2);

    if (this.movementMode === MOVEMENT_MODES.TANK) {
      this.tankCameraSwingPhase += dt * 2.2;
    } else {
      this.tankCameraSwingPhase = 0;
    }

    if (this.movementMode === MOVEMENT_MODES.DIRECT) {
      this.applyDirectMovement(dt, input);
    } else if (this.movementMode === MOVEMENT_MODES.TANK) {
      this.applyTankMovement(dt, input);
    } else {
      this.applyWeightedMovement(dt, input);
    }

    this.clampActorToBounds();
    this.syncCamera();
  }

  drawFacingIndicator(renderer, cameraState, projectionViewport) {
    const start = projectPoint(
      {
        x: this.actor.x + this.actor.width * 0.5,
        y: this.actor.y + this.actor.height * 0.65,
        z: this.actor.z + this.actor.depth * 0.5,
      },
      cameraState,
      projectionViewport
    );
    const end = projectPoint(
      {
        x: this.actor.x + this.actor.width * 0.5 + Math.sin(this.actor.heading) * 2.1,
        y: this.actor.y + this.actor.height * 0.65,
        z: this.actor.z + this.actor.depth * 0.5 + Math.cos(this.actor.heading) * 2.1,
      },
      cameraState,
      projectionViewport
    );
    if (start && end) {
      renderer.drawLine(start.x, start.y, end.x, end.y, '#facc15', 2.2);
    }
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Sample 1709 - Movement Models Lab',
      'Compare direct axis movement, tank controls, and weighted movement in one controlled arena.',
      `Mode: 1 Direct | 2 Tank | 3 Weighted | Cycle: M | Move: W A S D | Camera yaw: Q/E | Debug: G/Shift+G (${getTabDebugOverlayStatusLabel(this.tabDebugOverlays)})`,
    ]);

    const viewport = this.viewport;
    renderer.strokeRect(viewport.x, viewport.y, viewport.width, viewport.height, '#d8d5ff', 2);
    drawDepthBackdrop(renderer, viewport);
    renderer.drawRect(viewport.x + 10, viewport.y + 8, 244, 20, 'rgba(34, 197, 94, 0.22)');
    renderer.drawText('3D World - Movement Models Lab', viewport.x + 16, viewport.y + 22, {
      color: '#bbf7d0',
      font: '12px monospace',
    });

    const cameraState = this.camera3D?.getState?.() || {
      position: { x: 8, y: 8, z: 2 },
      rotation: { x: -0.52, y: 0.68 + this.cameraYawOffset, z: 0 },
    };
    const projectionViewport = createProjectionViewport(viewport);

    drawGroundGrid(renderer, { minX: -10, maxX: 10, minZ: 6, maxZ: 30, y: -0.1, step: 2 }, cameraState, projectionViewport);
    drawWireBox(renderer, { x: -8.3, y: -0.1, z: 10.8 }, { width: 2.2, height: 1.9, depth: 2.2 }, cameraState, projectionViewport, '#64748b', 2);
    drawWireBox(renderer, { x: 5.8, y: -0.1, z: 13.8 }, { width: 2.2, height: 1.9, depth: 2.2 }, cameraState, projectionViewport, '#64748b', 2);
    drawWireBox(renderer, { x: -1.8, y: -0.1, z: 24.0 }, { width: 2.2, height: 1.9, depth: 2.2 }, cameraState, projectionViewport, '#64748b', 2);

    drawWireBox(
      renderer,
      { x: this.actor.x, y: this.actor.y, z: this.actor.z },
      { width: this.actor.width, height: this.actor.height, depth: this.actor.depth },
      cameraState,
      projectionViewport,
      this.movementMode === MOVEMENT_MODES.WEIGHTED ? '#22d3ee' : '#f8fafc',
      { lineWidth: 2.4, depthCueEnabled: true }
    );
    this.drawFacingIndicator(renderer, cameraState, projectionViewport);

    const hudWidth = 360;
    const hudHeight = 138;
    const runtimeWidth = hudWidth;
    const runtimeHeight = 212;
    const debugStack = createBottomRightDebugPanelStack(renderer);
    const activeOverlayId = getTabDebugOverlayActiveId(this.tabDebugOverlays);
    if (activeOverlayId === OVERLAY_MOVEMENT_RUNTIME) {
      drawStackedDebugPanel(renderer, debugStack, runtimeWidth, runtimeHeight, 'Movement Runtime', [
        `Mode: ${formatMode(this.movementMode)}`,
        `Actor: x=${this.actor.x.toFixed(2)} z=${this.actor.z.toFixed(2)}`,
        `Velocity (weighted): x=${this.weightedVelocity.x.toFixed(2)} z=${this.weightedVelocity.z.toFixed(2)}`,
        `Camera yaw offset: ${this.cameraYawOffset.toFixed(2)}`,
        this.lastModeSummary,
        'Direct: immediate axis response',
        'Tank: rotate + throttle',
        'Weighted: acceleration + drag',
      ]);
    } else if (activeOverlayId === OVERLAY_MOVEMENT_HUD) {
      drawStackedDebugPanel(renderer, debugStack, hudWidth, hudHeight, 'Movement Lab HUD', [
        `Movement Mode: ${formatMode(this.movementMode)}`,
        `Input: ${this.lastInputSummary}`,
        `Speed: ${this.lastSpeed.toFixed(2)} units/s`,
        `Heading: ${this.actor.heading.toFixed(2)} rad`,
        `Camera follow mode: ${this.viewState.cameraMode}`,
      ]);
    }
  }
}
