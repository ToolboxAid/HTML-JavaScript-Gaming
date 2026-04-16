/*
Toolbox Aid
David Quesenberry
04/16/2026
CameraModesLab3DScene.js
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

export default class CameraModesLab3DScene extends Scene {
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
    this.pathTime = 0;
    this.pathSpeed = 0.8;
    this.pauseMotion = false;
    this.manualYawOffset = 0;
    this.target = { x: 0, y: 0, z: 12, width: 1.4, height: 1.4, depth: 1.4 };
    this.pathMarkers = this.createPathMarkers();
    this.pauseLatch = false;
  }

  createPathMarkers() {
    const markers = [];
    for (let i = 0; i < 16; i += 1) {
      const t = (i / 16) * Math.PI * 2;
      markers.push({
        x: Math.cos(t) * 7,
        y: -0.1,
        z: 13 + Math.sin(t) * 5,
      });
    }
    return markers;
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
      x: this.target.x + this.target.width * 0.5,
      y: this.target.y + this.target.height * 0.5,
      z: this.target.z + this.target.depth * 0.5,
    };
    const basePose = {
      position: {
        x: focusPoint.x + Math.sin(0.8 + this.manualYawOffset) * 10,
        y: 8.6,
        z: focusPoint.z - Math.cos(0.8 + this.manualYawOffset) * 10,
      },
      rotation: {
        x: -0.5,
        y: 0.8 + this.manualYawOffset,
        z: 0,
      },
    };
    applyPhase16CameraMode(this.camera3D, this.viewState, basePose, focusPoint);
  }

  step3DPhysics(dt, engine) {
    const input = engine.input;
    stepPhase16ViewToggles(this.viewState, input);

    const pausePressed = input?.isDown('Space') === true;
    if (pausePressed && !this.pauseLatch) {
      this.pauseMotion = !this.pauseMotion;
    }
    this.pauseLatch = pausePressed;

    if (input?.isDown('ArrowLeft')) this.manualYawOffset -= 0.9 * dt;
    if (input?.isDown('ArrowRight')) this.manualYawOffset += 0.9 * dt;
    if (input?.isDown('KeyR')) {
      this.pathTime = 0;
      this.manualYawOffset = 0;
      this.pauseMotion = false;
    }

    if (!this.pauseMotion) {
      this.pathTime += dt * this.pathSpeed;
    }

    const orbit = this.pathTime;
    this.target.x = Math.cos(orbit) * 7;
    this.target.z = 13 + Math.sin(orbit) * 5;
    this.target.y = Math.max(0, Math.sin(this.pathTime * 2.2) * 0.6);
    this.syncCamera();
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Sample 1614 - 3D Camera Modes Lab',
      'Observe follow, wide, and overhead camera behavior around one moving target.',
      'Toggle camera mode: C | Orbit offset: Left/Right | Pause target: Space | Reset: R | Debug: V',
    ]);

    renderer.strokeRect(this.viewport.x, this.viewport.y, this.viewport.width, this.viewport.height, '#d8d5ff', 2);
    drawDepthBackdrop(renderer, this.viewport);

    const cameraState = this.camera3D?.getState?.() ?? {
      position: { x: 6, y: 8, z: 2 },
      rotation: { x: -0.5, y: 0.8, z: 0 },
    };
    const projectionViewport = createProjectionViewport(this.viewport);
    drawGroundGrid(renderer, { minX: -10, maxX: 10, minZ: 6, maxZ: 20, y: -0.1, step: 2 }, cameraState, projectionViewport);

    this.pathMarkers.forEach((marker) => {
      drawWireBox(
        renderer,
        { x: marker.x - 0.15, y: marker.y, z: marker.z - 0.15 },
        { width: 0.3, height: 0.3, depth: 0.3 },
        cameraState,
        projectionViewport,
        '#475569',
        1.1
      );
    });

    drawWireBox(
      renderer,
      { x: this.target.x, y: this.target.y, z: this.target.z },
      { width: this.target.width, height: this.target.height, depth: this.target.depth },
      cameraState,
      projectionViewport,
      '#38bdf8',
      2.4
    );

    drawPanel(renderer, 620, 34, 300, 188, 'Camera Lab Runtime', [
      `Target: x=${this.target.x.toFixed(2)} y=${this.target.y.toFixed(2)} z=${this.target.z.toFixed(2)}`,
      `Camera mode: ${this.viewState.cameraMode}`,
      `Path time: ${this.pathTime.toFixed(2)} s`,
      `Path paused: ${this.pauseMotion ? 'yes' : 'no'}`,
      `Manual yaw offset: ${this.manualYawOffset.toFixed(2)}`,
      'Modes cycle: follow -> wide -> overhead',
    ]);

    drawPhase16DebugOverlay(renderer, this.viewport, this.viewState, [
      'Track marker ring visualizes shared focus path',
      `Orbit speed: ${this.pathSpeed.toFixed(2)}`,
    ]);
  }
}
