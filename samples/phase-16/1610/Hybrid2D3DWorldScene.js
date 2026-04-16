/*
Toolbox Aid
David Quesenberry
04/16/2026
Hybrid2D3DWorldScene.js
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

export default class Hybrid2D3DWorldScene extends Scene {
  constructor() {
    super();
    this.viewState = createPhase16ViewState();
    this.playerSpeed = 6.8;
    this.player = {
      x: -6,
      y: 0,
      z: 8,
      width: 1.2,
      height: 1.2,
      depth: 1.2,
    };
    this.worldBounds = { minX: -10, maxX: 10, minZ: 4, maxZ: 28 };
    this.topdownViewport = { x: 40, y: 112, width: 280, height: 180 };
    this.viewport3d = { x: 340, y: 112, width: 560, height: 380, focalLength: 430 };
    this.syncPulse = 0;
    this.props = [
      { transform3D: { x: -8.4, y: -0.1, z: 6.5 }, size3D: { width: 4.0, height: 1.8, depth: 3.2 }, color: '#a78bfa' },
      { transform3D: { x: -2.2, y: -0.1, z: 13.0 }, size3D: { width: 2.8, height: 3.0, depth: 3.6 }, color: '#38bdf8' },
      { transform3D: { x: 2.4, y: -0.1, z: 9.8 }, size3D: { width: 4.2, height: 2.0, depth: 2.4 }, color: '#fb7185' },
      { transform3D: { x: 5.6, y: -0.1, z: 17.5 }, size3D: { width: 3.0, height: 3.3, depth: 3.8 }, color: '#34d399' },
      { transform3D: { x: -5.0, y: -0.1, z: 22.0 }, size3D: { width: 5.8, height: 1.8, depth: 2.8 }, color: '#f59e0b' },
      { transform3D: { x: 3.0, y: -0.1, z: 24.0 }, size3D: { width: 4.6, height: 2.4, depth: 2.0 }, color: '#f472b6' },
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
    const basePose = {
      position: {
        x: focusPoint.x + 8.5,
        y: 8.6,
        z: focusPoint.z - 10.5,
      },
      rotation: {
        x: -0.48,
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
    const length = Math.hypot(axisX, axisZ) || 1;
    this.player.x += (axisX / length) * this.playerSpeed * dt;
    this.player.z += (axisZ / length) * this.playerSpeed * dt;
    this.player.x = clamp(this.player.x, this.worldBounds.minX, this.worldBounds.maxX - this.player.width);
    this.player.z = clamp(this.player.z, this.worldBounds.minZ, this.worldBounds.maxZ - this.player.depth);

    this.syncPulse += dt * 3.1;
    this.syncCamera();
  }

  worldToMap(point, viewport) {
    const xRatio = (point.x - this.worldBounds.minX) / Math.max(0.0001, this.worldBounds.maxX - this.worldBounds.minX);
    const zRatio = (point.z - this.worldBounds.minZ) / Math.max(0.0001, this.worldBounds.maxZ - this.worldBounds.minZ);
    return {
      x: viewport.x + xRatio * viewport.width,
      y: viewport.y + zRatio * viewport.height,
    };
  }

  drawTopdown(renderer) {
    const map = this.topdownViewport;
    renderer.drawRect(map.x, map.y, map.width, map.height, 'rgba(15, 23, 42, 0.86)');
    renderer.strokeRect(map.x, map.y, map.width, map.height, '#60a5fa', 1.5);

    this.props.forEach((prop) => {
      const topLeft = this.worldToMap({ x: prop.transform3D.x, z: prop.transform3D.z }, map);
      const bottomRight = this.worldToMap({ x: prop.transform3D.x + prop.size3D.width, z: prop.transform3D.z + prop.size3D.depth }, map);
      renderer.drawRect(
        topLeft.x,
        topLeft.y,
        Math.max(2, bottomRight.x - topLeft.x),
        Math.max(2, bottomRight.y - topLeft.y),
        prop.color
      );
    });

    const playerTopLeft = this.worldToMap({ x: this.player.x, z: this.player.z }, map);
    const playerBottomRight = this.worldToMap({ x: this.player.x + this.player.width, z: this.player.z + this.player.depth }, map);
    renderer.drawRect(
      playerTopLeft.x,
      playerTopLeft.y,
      Math.max(3, playerBottomRight.x - playerTopLeft.x),
      Math.max(3, playerBottomRight.y - playerTopLeft.y),
      '#f8fafc'
    );
    renderer.drawText('2D Tactical View', map.x + 10, map.y + 18, { color: '#cbd5e1', font: '12px monospace' });
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Sample 1610 - Hybrid 2D/3D World',
      'One shared world rendered in a 2D tactical map and a 3D perspective lane.',
      'Move: W A S D | Camera mode: C | Debug overlay: V',
    ]);

    this.drawTopdown(renderer);

    const viewport = this.viewport3d;
    renderer.strokeRect(viewport.x, viewport.y, viewport.width, viewport.height, '#d8d5ff', 2);
    drawDepthBackdrop(renderer, viewport);

    const cameraState = this.camera3D?.getState?.() ?? {
      position: { x: 5, y: 8, z: -2 },
      rotation: { x: -0.48, y: 0.44, z: 0 },
    };
    const projectionViewport = createProjectionViewport(viewport);
    drawGroundGrid(renderer, { minX: -10, maxX: 10, minZ: 4, maxZ: 28, y: -0.1, step: 2 }, cameraState, projectionViewport);

    const sortedProps = [...this.props].sort((left, right) => right.transform3D.z - left.transform3D.z);
    sortedProps.forEach((prop) => {
      drawWireBox(renderer, prop.transform3D, prop.size3D, cameraState, projectionViewport, prop.color, 2);
    });
    drawWireBox(
      renderer,
      { x: this.player.x, y: this.player.y, z: this.player.z },
      { width: this.player.width, height: this.player.height, depth: this.player.depth },
      cameraState,
      projectionViewport,
      '#f8fafc',
      2.2
    );

    drawPanel(renderer, 620, 34, 300, 168, 'Hybrid Runtime', [
      `Player world: x=${this.player.x.toFixed(2)} z=${this.player.z.toFixed(2)}`,
      `World bounds: x[${this.worldBounds.minX}, ${this.worldBounds.maxX}] z[${this.worldBounds.minZ}, ${this.worldBounds.maxZ}]`,
      `Hybrid sync pulse: ${Math.sin(this.syncPulse).toFixed(2)}`,
      `2D + 3D are reading one shared state`,
      `Camera mode: ${this.viewState.cameraMode}`,
    ]);

    drawPhase16DebugOverlay(renderer, viewport, this.viewState, [
      `Topdown viewport: ${this.topdownViewport.width}x${this.topdownViewport.height}`,
      `3D viewport: ${viewport.width}x${viewport.height}`,
    ]);
  }
}
