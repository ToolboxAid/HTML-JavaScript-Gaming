/*
Toolbox Aid
David Quesenberry
04/16/2026
LightingDemo3DScene.js
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

function parseHexColor(color) {
  if (typeof color !== 'string' || !color.startsWith('#') || color.length !== 7) {
    return null;
  }
  const r = Number.parseInt(color.slice(1, 3), 16);
  const g = Number.parseInt(color.slice(3, 5), 16);
  const b = Number.parseInt(color.slice(5, 7), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return null;
  }
  return { r, g, b };
}

function shadeColor(color, brightness) {
  const rgb = parseHexColor(color);
  if (!rgb) {
    return color;
  }
  const scale = clamp(brightness, 0.2, 1.2);
  const r = Math.round(clamp(rgb.r * scale, 0, 255));
  const g = Math.round(clamp(rgb.g * scale, 0, 255));
  const b = Math.round(clamp(rgb.b * scale, 0, 255));
  return `rgb(${r}, ${g}, ${b})`;
}

export default class LightingDemo3DScene extends Scene {
  constructor() {
    super();
    this.viewport = {
      x: 40,
      y: 170,
      width: 860,
      height: 320,
      focalLength: 460,
    };
    this.viewState = createPhase16ViewState();
    this.lightAngle = 0;
    this.lightHeight = 1.6;
    this.lightSpeed = 1.8;
    this.lightPulse = 0;
    this.lastInputLabel = 'idle';
    this.cameraYaw = 0;
    this.cameraPitch = -0.36;
    this.cameraDistance = 16;
    this.cameraHeight = 7;

    this.cubes = [
      { transform3D: { x: -6.8, y: -0.2, z: 8.0 }, size3D: { width: 3.2, height: 3.2, depth: 3.2 }, color: '#60a5fa' },
      { transform3D: { x: -1.6, y: -0.2, z: 12.8 }, size3D: { width: 3.0, height: 4.2, depth: 3.0 }, color: '#f59e0b' },
      { transform3D: { x: 3.0, y: -0.2, z: 9.8 }, size3D: { width: 4.0, height: 2.5, depth: 4.0 }, color: '#22c55e' },
      { transform3D: { x: 6.6, y: -0.2, z: 15.0 }, size3D: { width: 2.6, height: 3.6, depth: 2.6 }, color: '#f472b6' },
    ];
  }

  setCamera3D(camera3D) {
    this.camera3D = camera3D;
    this.syncCamera();
  }

  getLightPosition() {
    return {
      x: Math.cos(this.lightAngle) * 8.5,
      y: this.lightHeight + Math.sin(this.lightPulse) * 0.5 + 4.0,
      z: 11 + Math.sin(this.lightAngle) * 7.5,
    };
  }

  syncCamera() {
    if (!this.camera3D) {
      return;
    }
    const focusPoint = { x: 0, y: 1.5, z: 12 };
    const basePose = {
      position: {
        x: focusPoint.x + Math.sin(this.cameraYaw) * this.cameraDistance,
        y: this.cameraHeight + Math.sin(this.cameraPitch) * 1.4,
        z: focusPoint.z - Math.cos(this.cameraYaw) * this.cameraDistance,
      },
      rotation: {
        x: this.cameraPitch,
        y: this.cameraYaw,
        z: 0,
      },
    };
    applyPhase16CameraMode(this.camera3D, this.viewState, basePose, focusPoint);
  }

  step3DPhysics(dt, engine) {
    const input = engine.input;
    stepPhase16ViewToggles(this.viewState, input);

    const left = input?.isDown('ArrowLeft') || input?.isDown('KeyA');
    const right = input?.isDown('ArrowRight') || input?.isDown('KeyD');
    const up = input?.isDown('ArrowUp') || input?.isDown('KeyW');
    const down = input?.isDown('ArrowDown') || input?.isDown('KeyS');

    if (left) this.lightAngle -= this.lightSpeed * dt;
    if (right) this.lightAngle += this.lightSpeed * dt;
    if (up) this.lightHeight = clamp(this.lightHeight + 3.4 * dt, 0.5, 4.8);
    if (down) this.lightHeight = clamp(this.lightHeight - 3.4 * dt, 0.5, 4.8);
    if (input?.isDown('KeyQ')) this.cameraYaw -= 1.1 * dt;
    if (input?.isDown('KeyE')) this.cameraYaw += 1.1 * dt;

    this.lastInputLabel = [left ? 'left' : '', right ? 'right' : '', up ? 'up' : '', down ? 'down' : '']
      .filter(Boolean)
      .join('+') || 'idle';

    this.lightPulse += dt * 1.8;
    this.syncCamera();
  }

  getLightBrightness(target, lightPosition) {
    const center = {
      x: target.transform3D.x + target.size3D.width * 0.5,
      y: target.transform3D.y + target.size3D.height * 0.5,
      z: target.transform3D.z + target.size3D.depth * 0.5,
    };
    const dx = center.x - lightPosition.x;
    const dy = center.y - lightPosition.y;
    const dz = center.z - lightPosition.z;
    const distance = Math.hypot(dx, dy, dz);
    const attenuation = clamp(1 - distance / 26, 0.2, 1);
    const verticalBias = clamp((lightPosition.y - center.y + 2.5) / 6, 0.35, 1.05);
    return attenuation * verticalBias;
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Sample 1609 - 3D Lighting Demo',
      'Demonstrates dynamic light position affecting wireframe shading.',
      'Light angle: Left/Right | Light height: Up/Down | Orbit camera: Q/E | Camera: C | Debug: V',
    ]);

    renderer.strokeRect(this.viewport.x, this.viewport.y, this.viewport.width, this.viewport.height, '#d8d5ff', 2);
    drawDepthBackdrop(renderer, this.viewport);

    const cameraState = this.camera3D?.getState?.() ?? {
      position: { x: 0, y: 7, z: -4 },
      rotation: { x: -0.36, y: 0, z: 0 },
    };
    const projectionViewport = createProjectionViewport(this.viewport);
    drawGroundGrid(renderer, { minX: -10, maxX: 10, minZ: 4, maxZ: 20, y: -0.2, step: 2 }, cameraState, projectionViewport);

    const lightPosition = this.getLightPosition();
    const sortedCubes = [...this.cubes].sort((left, right) => right.transform3D.z - left.transform3D.z);
    sortedCubes.forEach((cube) => {
      const brightness = this.getLightBrightness(cube, lightPosition);
      drawWireBox(
        renderer,
        cube.transform3D,
        cube.size3D,
        cameraState,
        projectionViewport,
        shadeColor(cube.color, brightness + 0.25),
        { lineWidth: 2.1, depthCueEnabled: true }
      );
    });
    drawWireBox(
      renderer,
      {
        x: lightPosition.x - 0.35,
        y: lightPosition.y - 0.35,
        z: lightPosition.z - 0.35,
      },
      { width: 0.7, height: 0.7, depth: 0.7 },
      cameraState,
      projectionViewport,
      '#fef08a',
      { lineWidth: 2.5, depthCueEnabled: false }
    );

    drawPanel(renderer, 620, 34, 300, 170, 'Lighting Runtime', [
      `Light position: x=${lightPosition.x.toFixed(2)} y=${lightPosition.y.toFixed(2)} z=${lightPosition.z.toFixed(2)}`,
      `Light angle: ${this.lightAngle.toFixed(2)} rad`,
      `Light height offset: ${this.lightHeight.toFixed(2)}`,
      `Light input: ${this.lastInputLabel}`,
      `Camera yaw: ${this.cameraYaw.toFixed(2)}`,
      `Camera mode: ${this.viewState.cameraMode}`,
    ]);

    drawPhase16DebugOverlay(renderer, this.viewport, this.viewState, [
      `Light pulse: ${Math.sin(this.lightPulse).toFixed(2)}`,
      'Shading model: distance attenuation + vertical bias',
    ]);
  }
}
