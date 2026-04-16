/*
Toolbox Aid
David Quesenberry
04/16/2026
MiniGame3DReferenceScene.js
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

export default class MiniGame3DReferenceScene extends Scene {
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
    this.bounds = { minX: -9, maxX: 9, minZ: 6, maxZ: 28 };
    this.player = { x: -1, y: 0, z: 9, width: 1.1, height: 1.1, depth: 1.1 };
    this.playerSpeed = 7.4;
    this.cameraYawOffset = 0;
    this.gameTime = 45;
    this.score = 0;
    this.pickups = [
      { x: -6.5, z: 9.5, collected: false },
      { x: -2.8, z: 14.5, collected: false },
      { x: 1.8, z: 10.2, collected: false },
      { x: 5.4, z: 16.7, collected: false },
      { x: -4.0, z: 22.0, collected: false },
      { x: 3.8, z: 24.2, collected: false },
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
      x: this.player.x + this.player.width * 0.5,
      y: 0.6,
      z: this.player.z + this.player.depth * 0.5,
    };
    const yaw = 0.52 + this.cameraYawOffset;
    const basePose = {
      position: {
        x: focusPoint.x + Math.sin(yaw) * 8.8,
        y: 8.2,
        z: focusPoint.z - Math.cos(yaw) * 9.2,
      },
      rotation: {
        x: -0.5,
        y: yaw,
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
    this.player.x = clamp(this.player.x, this.bounds.minX, this.bounds.maxX - this.player.width);
    this.player.z = clamp(this.player.z, this.bounds.minZ, this.bounds.maxZ - this.player.depth);

    if (input?.isDown('ArrowLeft')) this.cameraYawOffset -= 0.95 * dt;
    if (input?.isDown('ArrowRight')) this.cameraYawOffset += 0.95 * dt;
    if (input?.isDown('KeyR')) {
      this.gameTime = 45;
      this.score = 0;
      this.pickups.forEach((pickup) => {
        pickup.collected = false;
      });
    }

    this.gameTime = Math.max(0, this.gameTime - dt);
    this.collectPickups();
    this.syncCamera();
  }

  collectPickups() {
    const playerCenter = {
      x: this.player.x + this.player.width * 0.5,
      z: this.player.z + this.player.depth * 0.5,
    };
    for (let i = 0; i < this.pickups.length; i += 1) {
      const pickup = this.pickups[i];
      if (pickup.collected) {
        continue;
      }
      const distance = Math.hypot(playerCenter.x - pickup.x, playerCenter.z - pickup.z);
      if (distance <= 1.25) {
        pickup.collected = true;
        this.score += 1;
      }
    }
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Sample 1620 - 3D Mini Game Reference',
      'Collect pickups in a compact 3D lane with a readable HUD and follow-camera framing.',
      'Move: W A S D | Camera yaw offset: Left/Right | Reset run: R | Camera mode: C | Debug: V',
    ]);

    const viewport = this.viewport;
    renderer.strokeRect(viewport.x, viewport.y, viewport.width, viewport.height, '#d8d5ff', 2);
    drawDepthBackdrop(renderer, viewport);
    renderer.drawRect(viewport.x + 10, viewport.y + 8, 168, 20, 'rgba(34, 197, 94, 0.22)');
    renderer.drawText('3D World - Mini Game Lane', viewport.x + 16, viewport.y + 22, { color: '#bbf7d0', font: '12px monospace' });

    const cameraState = this.camera3D?.getState?.() ?? {
      position: { x: 8, y: 8, z: 0 },
      rotation: { x: -0.5, y: 0.52 + this.cameraYawOffset, z: 0 },
    };
    const projectionViewport = createProjectionViewport(viewport);
    drawGroundGrid(renderer, { minX: -10, maxX: 10, minZ: 4, maxZ: 30, y: -0.2, step: 2 }, cameraState, projectionViewport);

    drawWireBox(renderer, { x: -7.4, y: -0.2, z: 12.2 }, { width: 2.8, height: 2.0, depth: 2.8 }, cameraState, projectionViewport, '#60a5fa', 2);
    drawWireBox(renderer, { x: 4.2, y: -0.2, z: 19.2 }, { width: 3.4, height: 2.6, depth: 2.2 }, cameraState, projectionViewport, '#f97316', 2);

    for (let i = 0; i < this.pickups.length; i += 1) {
      const pickup = this.pickups[i];
      if (pickup.collected) {
        continue;
      }
      drawWireBox(
        renderer,
        { x: pickup.x - 0.22, y: 0.25, z: pickup.z - 0.22 },
        { width: 0.44, height: 0.44, depth: 0.44 },
        cameraState,
        projectionViewport,
        '#fde047',
        { lineWidth: 2.1, depthCueEnabled: false }
      );
    }

    drawWireBox(
      renderer,
      { x: this.player.x, y: this.player.y, z: this.player.z },
      { width: this.player.width, height: this.player.height, depth: this.player.depth },
      cameraState,
      projectionViewport,
      '#f8fafc',
      { lineWidth: 2.4, depthCueEnabled: true }
    );

    renderer.drawRect(52, 34, 292, 120, 'rgba(15, 23, 42, 0.74)');
    renderer.strokeRect(52, 34, 292, 120, '#4ade80', 1);
    renderer.drawText('UI Layer - Mini Game HUD', 64, 52, { color: '#86efac', font: '12px monospace' });
    renderer.drawText(`Score: ${this.score}/${this.pickups.length}`, 64, 72, { color: '#e2e8f0', font: '12px monospace' });
    renderer.drawText(`Time: ${this.gameTime.toFixed(1)} s`, 64, 90, { color: '#e2e8f0', font: '12px monospace' });
    renderer.drawText(`Camera offset: ${this.cameraYawOffset.toFixed(2)}`, 64, 108, { color: '#e2e8f0', font: '12px monospace' });
    renderer.drawText(`Mode: ${this.viewState.cameraMode}`, 64, 126, { color: '#e2e8f0', font: '12px monospace' });

    const remaining = this.pickups.filter((pickup) => !pickup.collected).length;
    drawPanel(renderer, 620, 34, 300, 188, 'Mini Game Runtime', [
      `Remaining pickups: ${remaining}`,
      `Collected: ${this.score}`,
      `Time left: ${this.gameTime.toFixed(1)} s`,
      `Player: x=${this.player.x.toFixed(2)} z=${this.player.z.toFixed(2)}`,
      `Camera yaw offset: ${this.cameraYawOffset.toFixed(2)}`,
      `UI clarity: lane label + HUD card + runtime panel`,
    ]);

    drawPhase16DebugOverlay(renderer, viewport, this.viewState, [
      'Follow camera keeps player centered with adjustable yaw',
      'HUD metrics remain readable while moving in world',
    ]);
  }
}
