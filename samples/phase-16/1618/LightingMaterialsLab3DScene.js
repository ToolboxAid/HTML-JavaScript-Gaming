/*
Toolbox Aid
David Quesenberry
04/16/2026
LightingMaterialsLab3DScene.js
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
    return { r: 255, g: 255, b: 255 };
  }
  return {
    r: Number.parseInt(color.slice(1, 3), 16),
    g: Number.parseInt(color.slice(3, 5), 16),
    b: Number.parseInt(color.slice(5, 7), 16),
  };
}

function shadeColor(color, factor) {
  const rgb = parseHexColor(color);
  const scale = clamp(factor, 0.25, 1.35);
  const r = clamp(Math.round(rgb.r * scale), 0, 255);
  const g = clamp(Math.round(rgb.g * scale), 0, 255);
  const b = clamp(Math.round(rgb.b * scale), 0, 255);
  return `rgb(${r}, ${g}, ${b})`;
}

export default class LightingMaterialsLab3DScene extends Scene {
  constructor() {
    super();
    this.viewState = createPhase16ViewState();
    this.viewport = {
      x: 40,
      y: 170,
      width: 860,
      height: 320,
      focalLength: 450,
    };
    this.cameraYaw = 0.52;
    this.autoOrbitSpeed = 0.36;
    this.lightYaw = 0.8;
    this.lightHeight = 3.2;
    this.lightDistance = 8.4;
    this.time = 0;
    this.materialBlocks = [
      { x: -6.8, z: 9.0, baseColor: '#f97316', label: 'warm-matte' },
      { x: -2.8, z: 11.5, baseColor: '#60a5fa', label: 'cool-gloss' },
      { x: 1.6, z: 8.5, baseColor: '#a78bfa', label: 'violet-diffuse' },
      { x: 5.2, z: 12.2, baseColor: '#34d399', label: 'emerald-semi' },
    ];
  }

  setCamera3D(camera3D) {
    this.camera3D = camera3D;
    this.syncCamera();
  }

  getLightPosition() {
    return {
      x: Math.cos(this.lightYaw) * this.lightDistance,
      y: this.lightHeight,
      z: 10 + Math.sin(this.lightYaw) * this.lightDistance,
    };
  }

  syncCamera() {
    if (!this.camera3D) {
      return;
    }
    const focusPoint = { x: 0.5, y: 1, z: 10.6 };
    const basePose = {
      position: {
        x: Math.sin(this.cameraYaw) * 12,
        y: 8.8,
        z: focusPoint.z - Math.cos(this.cameraYaw) * 12,
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

    this.time += dt;
    this.cameraYaw += this.autoOrbitSpeed * dt;
    if (input?.isDown('KeyQ')) this.cameraYaw -= 1.05 * dt;
    if (input?.isDown('KeyE')) this.cameraYaw += 1.05 * dt;
    if (input?.isDown('ArrowLeft')) this.lightYaw -= 1.15 * dt;
    if (input?.isDown('ArrowRight')) this.lightYaw += 1.15 * dt;
    if (input?.isDown('ArrowUp')) this.lightHeight = clamp(this.lightHeight + 3.6 * dt, 1.4, 6.8);
    if (input?.isDown('ArrowDown')) this.lightHeight = clamp(this.lightHeight - 3.6 * dt, 1.4, 6.8);

    this.syncCamera();
  }

  computeLightingFactor(blockPosition, lightPosition) {
    const dx = blockPosition.x - lightPosition.x;
    const dy = 0.8 - lightPosition.y;
    const dz = blockPosition.z - lightPosition.z;
    const distance = Math.hypot(dx, dy, dz);
    return 1.25 - distance * 0.08;
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Sample 1618 - 3D Lighting & Materials Lab',
      'Material swatches react to moving light while camera orbit keeps depth changes visible.',
      'Camera orbit: auto + Q/E | Light yaw: Left/Right | Light height: Up/Down | Camera mode: C | Debug: V',
    ]);

    const viewport = this.viewport;
    renderer.strokeRect(viewport.x, viewport.y, viewport.width, viewport.height, '#d8d5ff', 2);
    drawDepthBackdrop(renderer, viewport);
    renderer.drawRect(viewport.x + 10, viewport.y + 8, 160, 20, 'rgba(56, 189, 248, 0.20)');
    renderer.drawText('3D World - Lighting Stage', viewport.x + 16, viewport.y + 22, { color: '#bae6fd', font: '12px monospace' });

    const cameraState = this.camera3D?.getState?.() ?? {
      position: { x: 8, y: 9, z: 0 },
      rotation: { x: -0.52, y: this.cameraYaw, z: 0 },
    };
    const projectionViewport = createProjectionViewport(viewport);
    drawGroundGrid(renderer, { minX: -10, maxX: 10, minZ: 4, maxZ: 18, y: -0.3, step: 2 }, cameraState, projectionViewport);

    const lightPosition = this.getLightPosition();
    for (let i = 0; i < this.materialBlocks.length; i += 1) {
      const block = this.materialBlocks[i];
      const blockPosition = { x: block.x, y: 0, z: block.z };
      const lighting = this.computeLightingFactor(blockPosition, lightPosition);
      drawWireBox(
        renderer,
        { x: block.x, y: -0.2, z: block.z },
        { width: 2.2, height: 2.2, depth: 2.2 },
        cameraState,
        projectionViewport,
        shadeColor(block.baseColor, lighting),
        { lineWidth: 2.1, depthCueEnabled: true }
      );
    }

    drawWireBox(
      renderer,
      { x: lightPosition.x - 0.25, y: lightPosition.y - 0.25, z: lightPosition.z - 0.25 },
      { width: 0.5, height: 0.5, depth: 0.5 },
      cameraState,
      projectionViewport,
      '#fde047',
      { lineWidth: 2.5, depthCueEnabled: false }
    );

    renderer.drawRect(620, 30, 305, 194, 'rgba(8, 47, 73, 0.55)');
    renderer.drawText('UI Layer - Lighting HUD', 634, 48, { color: '#a5f3fc', font: '12px monospace' });
    drawPanel(renderer, 620, 34, 300, 188, 'Lighting Runtime', [
      `Camera yaw: ${this.cameraYaw.toFixed(2)}`,
      `Light yaw: ${this.lightYaw.toFixed(2)}`,
      `Light height: ${this.lightHeight.toFixed(2)}`,
      `Light distance: ${this.lightDistance.toFixed(2)}`,
      `Materials: ${this.materialBlocks.length}`,
      `Camera mode: ${this.viewState.cameraMode}`,
    ]);

    drawPhase16DebugOverlay(renderer, viewport, this.viewState, [
      'HUD and world labels indicate UI-vs-scene layering',
      'Light marker cube tracks active light source',
    ]);
  }
}
