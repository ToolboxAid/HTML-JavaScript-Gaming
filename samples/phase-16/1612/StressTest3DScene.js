/*
Toolbox Aid
David Quesenberry
04/16/2026
StressTest3DScene.js
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
const GRID_COLUMNS = 25;
const GRID_ROWS = 40;
const OBJECT_COUNT = GRID_COLUMNS * GRID_ROWS;

export default class StressTest3DScene extends Scene {
  constructor() {
    super();
    this.viewState = createPhase16ViewState();
    this.viewport = {
      x: 40,
      y: 170,
      width: 860,
      height: 320,
      focalLength: 440,
    };
    this.simTime = 0;
    this.cameraYaw = 0.48;
    this.waveSpeed = 1.5;
    this.waveAmplitude = 0.35;
    this.boxes = this.buildBoxes();
    this.lastDrawCount = 0;
  }

  buildBoxes() {
    const boxes = [];
    const spacingX = 0.9;
    const spacingZ = 0.95;
    const startX = -((GRID_COLUMNS - 1) * spacingX) * 0.5;
    const startZ = 6;

    for (let row = 0; row < GRID_ROWS; row += 1) {
      for (let col = 0; col < GRID_COLUMNS; col += 1) {
        const index = row * GRID_COLUMNS + col;
        boxes.push({
          x: startX + col * spacingX,
          y: -0.2,
          z: startZ + row * spacingZ,
          width: 0.55,
          height: 0.55,
          depth: 0.55,
          phase: index * 0.03,
          color: (row + col) % 3 === 0 ? '#38bdf8' : ((row + col) % 3 === 1 ? '#a78bfa' : '#34d399'),
        });
      }
    }

    return boxes;
  }

  setCamera3D(camera3D) {
    this.camera3D = camera3D;
    this.syncCamera();
  }

  syncCamera() {
    if (!this.camera3D) {
      return;
    }
    const focusPoint = { x: 0, y: 0.6, z: 24 };
    const basePose = {
      position: {
        x: Math.sin(this.cameraYaw) * 22,
        y: 12.5,
        z: focusPoint.z - Math.cos(this.cameraYaw) * 23,
      },
      rotation: {
        x: -0.52,
        y: this.cameraYaw,
        z: 0,
      },
    };
    applyPhase16CameraMode(this.camera3D, this.viewState, basePose, focusPoint);
  }

  step3DPhysics(dt, engine) {
    const input = engine.input;
    stepPhase16ViewToggles(this.viewState, input);
    if (input?.isDown('KeyQ')) this.cameraYaw -= 0.9 * dt;
    if (input?.isDown('KeyE')) this.cameraYaw += 0.9 * dt;
    if (input?.isDown('ArrowUp')) this.waveAmplitude = Math.min(0.8, this.waveAmplitude + 0.6 * dt);
    if (input?.isDown('ArrowDown')) this.waveAmplitude = Math.max(0.1, this.waveAmplitude - 0.6 * dt);

    this.simTime += dt;
    this.syncCamera();
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Sample 1612 - 3D Stress Test',
      'Renders 1,000 animated wireframe objects to pressure 3D visibility throughput.',
      'Wave amplitude: Up/Down | Orbit camera: Q/E | Camera mode: C | Debug: V',
    ]);

    renderer.strokeRect(this.viewport.x, this.viewport.y, this.viewport.width, this.viewport.height, '#d8d5ff', 2);
    drawDepthBackdrop(renderer, this.viewport);

    const cameraState = this.camera3D?.getState?.() ?? {
      position: { x: 10, y: 12, z: -4 },
      rotation: { x: -0.52, y: this.cameraYaw, z: 0 },
    };
    const projectionViewport = createProjectionViewport(this.viewport);
    drawGroundGrid(renderer, { minX: -12, maxX: 12, minZ: 6, maxZ: 46, y: -0.2, step: 2 }, cameraState, projectionViewport);

    this.lastDrawCount = 0;
    for (let i = 0; i < this.boxes.length; i += 1) {
      const box = this.boxes[i];
      const wave = Math.sin(this.simTime * this.waveSpeed + box.phase) * this.waveAmplitude;
      drawWireBox(
        renderer,
        { x: box.x, y: box.y + wave, z: box.z },
        { width: box.width, height: box.height, depth: box.depth },
        cameraState,
        projectionViewport,
        box.color,
        { lineWidth: 1.35, depthCueEnabled: true }
      );
      this.lastDrawCount += 1;
    }

    drawPanel(renderer, 620, 34, 300, 176, 'Stress Runtime', [
      `Objects configured: ${OBJECT_COUNT}`,
      `Objects drawn: ${this.lastDrawCount}`,
      `Grid: ${GRID_COLUMNS} x ${GRID_ROWS}`,
      `Wave speed: ${this.waveSpeed.toFixed(2)}`,
      `Wave amplitude: ${this.waveAmplitude.toFixed(2)}`,
      `Camera yaw: ${this.cameraYaw.toFixed(2)}`,
    ]);

    drawPhase16DebugOverlay(renderer, this.viewport, this.viewState, [
      `Sim time: ${this.simTime.toFixed(2)} s`,
      'Density profile: full-grid render each frame',
    ]);
  }
}
