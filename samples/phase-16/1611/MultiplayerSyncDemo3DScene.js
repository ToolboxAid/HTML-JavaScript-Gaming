/*
Toolbox Aid
David Quesenberry
04/16/2026
MultiplayerSyncDemo3DScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';
import {
  applyPhase16CameraMode,
  createPhase16ViewState,
  createProjectionViewport,
  drawDepthBackdrop,
  drawGroundGrid,
  drawPhase16DebugOverlay,
  drawWireBox,
  stepPhase16ViewToggles,
} from '../shared/threeDWireframe.js';

const theme = new Theme(ThemeTokens);

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
  return a + (b - a) * clamp(t, 0, 1);
}

function copyState(state) {
  return { x: state.x, y: state.y, z: state.z };
}

export default class MultiplayerSyncDemo3DScene extends Scene {
  constructor() {
    super();
    this.viewState = createPhase16ViewState();
    this.viewport = {
      x: 40,
      y: 170,
      width: 860,
      height: 320,
      focalLength: 460,
    };
    this.worldBounds = { minX: -10, maxX: 10, minZ: 4, maxZ: 26 };
    this.entitySize = { width: 1.2, height: 1.2, depth: 1.2 };
    this.moveSpeed = 5.8;
    this.reconcileSpeed = 9.0;
    this.latencySeconds = 0.16;
    this.snapshotLatencySeconds = 0.16;

    this.authoritativeState = { x: -2, y: 0, z: 10 };
    this.predictedState = { x: -2, y: 0, z: 10 };
    this.replicaState = { x: -2, y: 0, z: 10 };
    this.lastInputVector = { x: 0, z: 0 };
    this.inputQueue = [];
    this.snapshotQueue = [];
    this.simulationTime = 0;
    this.sentInputCount = 0;
    this.receivedSnapshotCount = 0;
    this.lastErrorMagnitude = 0;
  }

  setCamera3D(camera3D) {
    this.camera3D = camera3D;
    this.syncCamera();
  }

  syncCamera() {
    if (!this.camera3D) {
      return;
    }
    const focusPoint = {
      x: (this.authoritativeState.x + this.predictedState.x + this.replicaState.x) / 3,
      y: 0.6,
      z: (this.authoritativeState.z + this.predictedState.z + this.replicaState.z) / 3,
    };
    const basePose = {
      position: {
        x: focusPoint.x + 8.6,
        y: 8.2,
        z: focusPoint.z - 10.4,
      },
      rotation: {
        x: -0.48,
        y: 0.42,
        z: 0,
      },
    };
    applyPhase16CameraMode(this.camera3D, this.viewState, basePose, focusPoint);
  }

  buildInputVector(input) {
    const axisX = (input?.isDown('KeyD') ? 1 : 0) - (input?.isDown('KeyA') ? 1 : 0);
    const axisZ = (input?.isDown('KeyW') ? 1 : 0) - (input?.isDown('KeyS') ? 1 : 0);
    const length = Math.hypot(axisX, axisZ) || 1;
    return {
      x: axisX / length,
      z: axisZ / length,
    };
  }

  clampState(state) {
    state.x = clamp(state.x, this.worldBounds.minX, this.worldBounds.maxX - this.entitySize.width);
    state.z = clamp(state.z, this.worldBounds.minZ, this.worldBounds.maxZ - this.entitySize.depth);
  }

  enqueueInput(vector, dt) {
    const deliverAt = this.simulationTime + this.latencySeconds;
    this.inputQueue.push({
      deliverAt,
      vector: { x: vector.x, z: vector.z },
      dt,
    });
    this.sentInputCount += 1;
  }

  processServerInputs() {
    while (this.inputQueue.length > 0 && this.inputQueue[0].deliverAt <= this.simulationTime) {
      const packet = this.inputQueue.shift();
      this.authoritativeState.x += packet.vector.x * this.moveSpeed * packet.dt;
      this.authoritativeState.z += packet.vector.z * this.moveSpeed * packet.dt;
      this.clampState(this.authoritativeState);

      this.snapshotQueue.push({
        deliverAt: this.simulationTime + this.snapshotLatencySeconds,
        state: copyState(this.authoritativeState),
      });
    }
  }

  processSnapshots() {
    while (this.snapshotQueue.length > 0 && this.snapshotQueue[0].deliverAt <= this.simulationTime) {
      const snapshot = this.snapshotQueue.shift();
      this.replicaState = copyState(snapshot.state);
      this.receivedSnapshotCount += 1;
    }
  }

  reconcilePredicted(dt) {
    this.predictedState.x = lerp(this.predictedState.x, this.authoritativeState.x, this.reconcileSpeed * dt);
    this.predictedState.z = lerp(this.predictedState.z, this.authoritativeState.z, this.reconcileSpeed * dt);
    this.clampState(this.predictedState);
    const dx = this.predictedState.x - this.authoritativeState.x;
    const dz = this.predictedState.z - this.authoritativeState.z;
    this.lastErrorMagnitude = Math.hypot(dx, dz);
  }

  step3DPhysics(dt, engine) {
    const input = engine.input;
    stepPhase16ViewToggles(this.viewState, input);
    this.simulationTime += dt;

    const inputVector = this.buildInputVector(input);
    this.lastInputVector = inputVector;
    this.predictedState.x += inputVector.x * this.moveSpeed * dt;
    this.predictedState.z += inputVector.z * this.moveSpeed * dt;
    this.clampState(this.predictedState);

    this.enqueueInput(inputVector, dt);
    this.processServerInputs();
    this.processSnapshots();
    this.reconcilePredicted(dt);
    this.syncCamera();
  }

  renderEntity(renderer, cameraState, projectionViewport, state, color) {
    drawWireBox(
      renderer,
      { x: state.x, y: state.y, z: state.z },
      this.entitySize,
      cameraState,
      projectionViewport,
      color,
      2
    );
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Sample 1611 - Multiplayer Sync Demo',
      'Client prediction, server authority, and delayed replica updates in a 3D lane.',
      'Move: W A S D | Camera mode: C | Debug overlay: V',
    ]);

    renderer.strokeRect(this.viewport.x, this.viewport.y, this.viewport.width, this.viewport.height, '#d8d5ff', 2);
    drawDepthBackdrop(renderer, this.viewport);

    const cameraState = this.camera3D?.getState?.() ?? {
      position: { x: 6.8, y: 8.2, z: 0.8 },
      rotation: { x: -0.48, y: 0.42, z: 0 },
    };
    const projectionViewport = createProjectionViewport(this.viewport);
    drawGroundGrid(renderer, { minX: -10, maxX: 10, minZ: 4, maxZ: 26, y: -0.1, step: 2 }, cameraState, projectionViewport);

    this.renderEntity(renderer, cameraState, projectionViewport, this.authoritativeState, '#22c55e');
    this.renderEntity(renderer, cameraState, projectionViewport, this.predictedState, '#38bdf8');
    this.renderEntity(renderer, cameraState, projectionViewport, this.replicaState, '#facc15');

    drawPanel(renderer, 620, 34, 300, 196, 'Sync Runtime', [
      `Authoritative: x=${this.authoritativeState.x.toFixed(2)} z=${this.authoritativeState.z.toFixed(2)}`,
      `Predicted: x=${this.predictedState.x.toFixed(2)} z=${this.predictedState.z.toFixed(2)}`,
      `Replica: x=${this.replicaState.x.toFixed(2)} z=${this.replicaState.z.toFixed(2)}`,
      `Latency (one-way): ${(this.latencySeconds * 1000).toFixed(0)} ms`,
      `Snapshot delay: ${(this.snapshotLatencySeconds * 1000).toFixed(0)} ms`,
      `Input packets sent: ${this.sentInputCount}`,
      `Snapshots applied: ${this.receivedSnapshotCount}`,
      `Prediction error: ${this.lastErrorMagnitude.toFixed(3)}`,
      `Input vector: (${this.lastInputVector.x.toFixed(2)}, ${this.lastInputVector.z.toFixed(2)})`,
    ]);

    drawPhase16DebugOverlay(renderer, this.viewport, this.viewState, [
      `Queued inputs: ${this.inputQueue.length}`,
      `Queued snapshots: ${this.snapshotQueue.length}`,
      'Green=authoritative, Blue=predicted, Yellow=replica',
    ]);
  }
}
