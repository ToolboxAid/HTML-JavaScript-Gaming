/*
Toolbox Aid
David Quesenberry
04/16/2026
InputLab3DScene.js
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

export default class InputLab3DScene extends Scene {
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
    this.worldBounds = { minX: -10, maxX: 10, minZ: 4, maxZ: 28 };
    this.player = {
      x: -1.6,
      y: 0,
      z: 9,
      width: 1.2,
      height: 1.2,
      depth: 1.2,
      velocityY: 0,
    };
    this.baseSpeed = 5.8;
    this.sprintMultiplier = 1.7;
    this.gravity = 16;
    this.jumpImpulse = 7.4;
    this.isGrounded = true;
    this.lastInputSnapshot = {
      axisX: 0,
      axisZ: 0,
      sprint: false,
      jump: false,
      crouch: false,
    };
    this.jumpLatch = false;
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
      y: this.player.y + 0.6,
      z: this.player.z + this.player.depth * 0.5,
    };
    const basePose = {
      position: {
        x: focusPoint.x + 8.5,
        y: focusPoint.y + 8.2,
        z: focusPoint.z - 10.2,
      },
      rotation: {
        x: -0.5,
        y: 0.44,
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
    const sprint = input?.isDown('ShiftLeft') || input?.isDown('ShiftRight');
    const crouch = input?.isDown('ControlLeft') || input?.isDown('ControlRight');
    const jumpHeld = input?.isDown('Space') === true;
    const moveLength = Math.hypot(axisX, axisZ) || 1;
    const speed = this.baseSpeed * (sprint ? this.sprintMultiplier : 1) * (crouch ? 0.55 : 1);

    this.player.x += (axisX / moveLength) * speed * dt;
    this.player.z += (axisZ / moveLength) * speed * dt;

    if (jumpHeld && !this.jumpLatch && this.isGrounded) {
      this.player.velocityY = this.jumpImpulse;
      this.isGrounded = false;
    }
    this.jumpLatch = jumpHeld;

    this.player.velocityY -= this.gravity * dt;
    this.player.y += this.player.velocityY * dt;
    if (this.player.y <= 0) {
      this.player.y = 0;
      this.player.velocityY = 0;
      this.isGrounded = true;
    }

    this.player.x = clamp(this.player.x, this.worldBounds.minX, this.worldBounds.maxX - this.player.width);
    this.player.z = clamp(this.player.z, this.worldBounds.minZ, this.worldBounds.maxZ - this.player.depth);

    this.lastInputSnapshot = {
      axisX,
      axisZ,
      sprint: sprint === true,
      jump: jumpHeld === true,
      crouch: crouch === true,
    };
    this.syncCamera();
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Sample 1613 - 3D Input Lab',
      'Demonstrates movement axes, sprint/crouch modifiers, and jump impulse diagnostics.',
      'Move: W A S D | Sprint: Shift | Jump: Space | Crouch: Ctrl | Camera: C | Debug: V',
    ]);

    renderer.strokeRect(this.viewport.x, this.viewport.y, this.viewport.width, this.viewport.height, '#d8d5ff', 2);
    drawDepthBackdrop(renderer, this.viewport);

    const cameraState = this.camera3D?.getState?.() ?? {
      position: { x: 8, y: 8, z: -1 },
      rotation: { x: -0.5, y: 0.44, z: 0 },
    };
    const projectionViewport = createProjectionViewport(this.viewport);
    drawGroundGrid(renderer, { minX: -10, maxX: 10, minZ: 4, maxZ: 28, y: -0.1, step: 2 }, cameraState, projectionViewport);

    drawWireBox(
      renderer,
      { x: this.player.x, y: this.player.y, z: this.player.z },
      { width: this.player.width, height: this.player.height, depth: this.player.depth },
      cameraState,
      projectionViewport,
      '#38bdf8',
      2.2
    );
    drawWireBox(renderer, { x: -7, y: -0.1, z: 14 }, { width: 3.4, height: 1.8, depth: 3.4 }, cameraState, projectionViewport, '#a78bfa', 2);
    drawWireBox(renderer, { x: 4.2, y: -0.1, z: 20 }, { width: 4.0, height: 2.2, depth: 2.4 }, cameraState, projectionViewport, '#34d399', 2);

    drawPanel(renderer, 620, 34, 300, 208, 'Input Runtime', [
      `Axis X: ${this.lastInputSnapshot.axisX.toFixed(0)} | Axis Z: ${this.lastInputSnapshot.axisZ.toFixed(0)}`,
      `Sprint: ${this.lastInputSnapshot.sprint ? 'on' : 'off'}`,
      `Crouch: ${this.lastInputSnapshot.crouch ? 'on' : 'off'}`,
      `Jump held: ${this.lastInputSnapshot.jump ? 'yes' : 'no'}`,
      `Grounded: ${this.isGrounded ? 'yes' : 'no'}`,
      `VelocityY: ${this.player.velocityY.toFixed(2)}`,
      `Player: x=${this.player.x.toFixed(2)} y=${this.player.y.toFixed(2)} z=${this.player.z.toFixed(2)}`,
      `Camera mode: ${this.viewState.cameraMode}`,
    ]);

    drawPhase16DebugOverlay(renderer, this.viewport, this.viewState, [
      'Input profile: digital keyboard -> movement vector',
      `Speed multiplier: ${this.lastInputSnapshot.sprint ? this.sprintMultiplier.toFixed(2) : '1.00'}`,
    ]);
  }
}
