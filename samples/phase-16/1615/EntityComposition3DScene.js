/*
Toolbox Aid
David Quesenberry
04/16/2026
EntityComposition3DScene.js
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

function rotateY(point, yaw) {
  const cos = Math.cos(yaw);
  const sin = Math.sin(yaw);
  return {
    x: point.x * cos - point.z * sin,
    y: point.y,
    z: point.x * sin + point.z * cos,
  };
}

export default class EntityComposition3DScene extends Scene {
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
    this.root = { x: 0, y: 0, z: 13 };
    this.assemblyYaw = 0.4;
    this.autoSpinSpeed = 0.45;
    this.partSpacing = 1;
    this.spinPaused = false;
    this.pauseLatch = false;
    this.parts = this.createParts();
  }

  createParts() {
    return [
      { name: 'core', offset: { x: 0, y: 0.9, z: 0 }, size: { width: 1.8, height: 1.5, depth: 1.8 }, color: '#38bdf8' },
      { name: 'head', offset: { x: 0.2, y: 2.7, z: 0 }, size: { width: 1.2, height: 1.1, depth: 1.2 }, color: '#a78bfa' },
      { name: 'arm-left', offset: { x: -1.7, y: 1.2, z: 0 }, size: { width: 0.65, height: 1.5, depth: 0.65 }, color: '#34d399' },
      { name: 'arm-right', offset: { x: 2.2, y: 1.2, z: 0 }, size: { width: 0.65, height: 1.5, depth: 0.65 }, color: '#34d399' },
      { name: 'pod-front', offset: { x: 0.25, y: 0.2, z: -1.55 }, size: { width: 1.3, height: 0.7, depth: 0.7 }, color: '#f59e0b' },
      { name: 'leg-left', offset: { x: -0.65, y: -1.05, z: 0.1 }, size: { width: 0.65, height: 1.2, depth: 0.65 }, color: '#93c5fd' },
      { name: 'leg-right', offset: { x: 1.1, y: -1.05, z: 0.1 }, size: { width: 0.65, height: 1.2, depth: 0.65 }, color: '#93c5fd' },
    ];
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
      x: this.root.x + 0.4,
      y: this.root.y + 1.45,
      z: this.root.z + 0.2,
    };
    const basePose = {
      position: {
        x: focusPoint.x + Math.sin(this.assemblyYaw) * 10.8,
        y: focusPoint.y + 6.5,
        z: focusPoint.z - Math.cos(this.assemblyYaw) * 10.8,
      },
      rotation: {
        x: -0.52,
        y: this.assemblyYaw,
        z: 0,
      },
    };
    applyPhase16CameraMode(this.camera3D, this.viewState, basePose, focusPoint);
  }

  step3DPhysics(dt, engine) {
    const input = engine.input;
    stepPhase16ViewToggles(this.viewState, input);

    if (input?.isDown('KeyQ')) this.assemblyYaw -= 0.95 * dt;
    if (input?.isDown('KeyE')) this.assemblyYaw += 0.95 * dt;
    if (input?.isDown('ArrowUp')) this.partSpacing = Math.min(1.65, this.partSpacing + 0.95 * dt);
    if (input?.isDown('ArrowDown')) this.partSpacing = Math.max(0.7, this.partSpacing - 0.95 * dt);

    const pausePressed = input?.isDown('Space') === true;
    if (pausePressed && !this.pauseLatch) {
      this.spinPaused = !this.spinPaused;
    }
    this.pauseLatch = pausePressed;

    if (!this.spinPaused) {
      this.assemblyYaw += this.autoSpinSpeed * dt;
    }

    this.syncCamera();
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Sample 1615 - 3D Entity Composition',
      'Builds one actor from modular parts with controllable spacing and orbit view.',
      'Orbit: Q/E | Part spacing: Up/Down | Pause spin: Space | Camera: C | Debug: V',
    ]);

    renderer.strokeRect(this.viewport.x, this.viewport.y, this.viewport.width, this.viewport.height, '#d8d5ff', 2);
    drawDepthBackdrop(renderer, this.viewport);

    const cameraState = this.camera3D?.getState?.() ?? {
      position: { x: 7, y: 8, z: 1 },
      rotation: { x: -0.52, y: this.assemblyYaw, z: 0 },
    };
    const projectionViewport = createProjectionViewport(this.viewport);
    drawGroundGrid(renderer, { minX: -9, maxX: 9, minZ: 7, maxZ: 21, y: -1.4, step: 2 }, cameraState, projectionViewport);

    for (let i = 0; i < this.parts.length; i += 1) {
      const part = this.parts[i];
      const rotated = rotateY(
        {
          x: part.offset.x * this.partSpacing,
          y: part.offset.y,
          z: part.offset.z * this.partSpacing,
        },
        this.assemblyYaw
      );
      drawWireBox(
        renderer,
        {
          x: this.root.x + rotated.x,
          y: this.root.y + rotated.y,
          z: this.root.z + rotated.z,
        },
        part.size,
        cameraState,
        projectionViewport,
        part.color,
        { lineWidth: 2, depthCueEnabled: true }
      );
    }

    drawPanel(renderer, 620, 34, 300, 188, 'Composition Runtime', [
      `Parts: ${this.parts.length}`,
      `Part spacing: ${this.partSpacing.toFixed(2)}`,
      `Assembly yaw: ${this.assemblyYaw.toFixed(2)}`,
      `Auto spin: ${this.spinPaused ? 'paused' : `${this.autoSpinSpeed.toFixed(2)} rad/s`}`,
      `Camera mode: ${this.viewState.cameraMode}`,
      'Composition: root + head + limbs + pods',
    ]);

    drawPhase16DebugOverlay(renderer, this.viewport, this.viewState, [
      'Hierarchy demo: local offsets transformed around one root',
      'Spacing control applies to lateral and depth offsets',
    ]);
  }
}
