/*
Toolbox Aid
David Quesenberry
04/16/2026
DebugHud3DScene.js
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

export default class DebugHud3DScene extends Scene {
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
    this.worldBounds = { minX: -9, maxX: 9, minZ: 6, maxZ: 26 };
    this.player = { x: -2, y: 0, z: 10, width: 1.2, height: 1.2, depth: 1.2 };
    this.playerSpeed = 7.2;
    this.cameraYaw = 0.42;
    this.cameraPulse = 0;
    this.hudPulse = 0;
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
      x: this.player.x + this.player.width * 0.5,
      y: this.player.y + 0.55,
      z: this.player.z + this.player.depth * 0.5,
    };
    const basePose = {
      position: {
        x: focusPoint.x + Math.sin(this.cameraYaw) * 9.2,
        y: 8.2 + Math.sin(this.cameraPulse) * 0.6,
        z: focusPoint.z - Math.cos(this.cameraYaw) * 9.2,
      },
      rotation: {
        x: -0.5,
        y: this.cameraYaw,
        z: 0,
      },
    };
    applyPhase16CameraMode(this.camera3D, this.viewState, basePose, focusPoint);
  }

  step3DPhysics(dt, engine) {
    const input = engine.input;
    stepPhase16ViewToggles(this.viewState, input);

    const axisX = (input?.isDown('KeyD') ? 1 : 0) - (input?.isDown('KeyA') ? 1 : 0);
    const axisZ = (input?.isDown('KeyW') ? 1 : 0) - (input?.isDown('KeyS') ? 1 : 0);
    const length = Math.hypot(axisX, axisZ) || 1;
    this.player.x += (axisX / length) * this.playerSpeed * dt;
    this.player.z += (axisZ / length) * this.playerSpeed * dt;
    this.player.x = clamp(this.player.x, this.worldBounds.minX, this.worldBounds.maxX - this.player.width);
    this.player.z = clamp(this.player.z, this.worldBounds.minZ, this.worldBounds.maxZ - this.player.depth);

    this.cameraYaw += 0.42 * dt;
    if (input?.isDown('KeyQ')) this.cameraYaw -= 1.1 * dt;
    if (input?.isDown('KeyE')) this.cameraYaw += 1.1 * dt;

    this.cameraPulse += dt * 2.8;
    this.hudPulse += dt * 3.4;
    this.syncCamera();
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Sample 1619 - 3D Debug HUD Sample',
      'Shows a readable HUD layer over an active 3D lane with explicit sectioning and labels.',
      'Move: W A S D | Orbit camera: auto + Q/E | Camera mode: C | Debug: V',
    ]);

    const viewport = this.viewport;
    renderer.strokeRect(viewport.x, viewport.y, viewport.width, viewport.height, '#d8d5ff', 2);
    drawDepthBackdrop(renderer, viewport);
    renderer.drawRect(viewport.x + 10, viewport.y + 8, 126, 20, 'rgba(147, 51, 234, 0.22)');
    renderer.drawText('3D World Layer', viewport.x + 16, viewport.y + 22, { color: '#e9d5ff', font: '12px monospace' });

    const cameraState = this.camera3D?.getState?.() ?? {
      position: { x: 7, y: 8, z: 0 },
      rotation: { x: -0.5, y: this.cameraYaw, z: 0 },
    };
    const projectionViewport = createProjectionViewport(viewport);
    drawGroundGrid(renderer, { minX: -10, maxX: 10, minZ: 4, maxZ: 28, y: -0.2, step: 2 }, cameraState, projectionViewport);

    drawWireBox(renderer, { x: -7, y: -0.2, z: 12 }, { width: 2.4, height: 2.1, depth: 2.4 }, cameraState, projectionViewport, '#60a5fa', 2);
    drawWireBox(renderer, { x: 3, y: -0.2, z: 15 }, { width: 3.2, height: 2.8, depth: 2.4 }, cameraState, projectionViewport, '#f97316', 2);
    drawWireBox(
      renderer,
      { x: this.player.x, y: this.player.y, z: this.player.z },
      { width: this.player.width, height: this.player.height, depth: this.player.depth },
      cameraState,
      projectionViewport,
      '#f8fafc',
      { lineWidth: 2.4, depthCueEnabled: true }
    );

    renderer.drawRect(52, 40, 266, 110, 'rgba(2, 6, 23, 0.70)');
    renderer.strokeRect(52, 40, 266, 110, '#22d3ee', 1);
    renderer.drawText('HUD Layer - Debug Cards', 64, 58, { color: '#67e8f9', font: '12px monospace' });
    renderer.drawText(`Player x: ${this.player.x.toFixed(2)}`, 64, 78, { color: '#e2e8f0', font: '12px monospace' });
    renderer.drawText(`Player z: ${this.player.z.toFixed(2)}`, 64, 96, { color: '#e2e8f0', font: '12px monospace' });
    renderer.drawText(`Camera yaw: ${this.cameraYaw.toFixed(2)}`, 64, 114, { color: '#e2e8f0', font: '12px monospace' });
    renderer.drawText(`HUD pulse: ${Math.sin(this.hudPulse).toFixed(2)}`, 64, 132, { color: '#e2e8f0', font: '12px monospace' });

    drawPanel(renderer, 620, 34, 300, 188, 'HUD Runtime', [
      `Camera pulse: ${Math.sin(this.cameraPulse).toFixed(2)}`,
      `Camera yaw: ${this.cameraYaw.toFixed(2)}`,
      `Player speed: ${this.playerSpeed.toFixed(1)}`,
      `World bounds: x[${this.worldBounds.minX}, ${this.worldBounds.maxX}] z[${this.worldBounds.minZ}, ${this.worldBounds.maxZ}]`,
      `UI clarity: labels + cards + panel`,
      `Camera mode: ${this.viewState.cameraMode}`,
    ]);

    drawPhase16DebugOverlay(renderer, viewport, this.viewState, [
      'Both world and HUD sections are named in-frame',
      'Camera orbit changes perspective continuously',
    ]);
  }
}
