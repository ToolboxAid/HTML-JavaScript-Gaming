/*
Toolbox Aid
David Quesenberry
04/16/2026
TextureMaterialDemoScene.js
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
  projectPoint,
  stepPhase16ViewToggles,
} from '/samples/phase-16/shared/threeDWireframe.js';

const theme = new Theme(ThemeTokens);

function createImageAsset(svgText, width = 64, height = 64) {
  if (typeof Image === 'function') {
    const image = new Image(width, height);
    image.src = `data:image/svg+xml;utf8,${encodeURIComponent(svgText)}`;
    return image;
  }
  return { width, height, complete: true, __synthetic: true };
}

function isImageReady(image) {
  if (!image) {
    return false;
  }
  if (image.__synthetic) {
    return true;
  }
  return image.complete === true && ((image.naturalWidth ?? 0) > 0 || (image.width ?? 0) > 0);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export default class TextureMaterialDemoScene extends Scene {
  constructor() {
    super();
    this.viewState = createPhase16ViewState();
    this.viewport = {
      x: 40,
      y: 170,
      width: 860,
      height: 320,
      focalLength: 455,
    };
    this.cameraYaw = 0.5;
    this.cameraOrbitSpeed = 0.34;
    this.lightPulse = 0;
    this.lastImageDraws = 0;
    this.textures = {
      brick: createImageAsset(
        "<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='64' height='64' fill='#9a3412'/><path d='M0 16h64M0 32h64M0 48h64M16 0v16M48 0v16M0 16v16M32 16v16M16 32v16M48 32v16M0 48v16M32 48v16' stroke='#f97316' stroke-width='2'/></svg>"
      ),
      panel: createImageAsset(
        "<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#64748b'/><stop offset='1' stop-color='#1e293b'/></linearGradient></defs><rect width='64' height='64' fill='url(#g)'/><path d='M0 12h64M0 24h64M0 36h64M0 48h64M0 60h64M12 0v64M24 0v64M36 0v64M48 0v64M60 0v64' stroke='#cbd5e1' stroke-opacity='0.28' stroke-width='1'/></svg>"
      ),
      tile: createImageAsset(
        "<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='64' height='64' fill='#0ea5e9'/><rect x='4' y='4' width='24' height='24' fill='#38bdf8'/><rect x='36' y='4' width='24' height='24' fill='#7dd3fc'/><rect x='4' y='36' width='24' height='24' fill='#7dd3fc'/><rect x='36' y='36' width='24' height='24' fill='#38bdf8'/></svg>"
      ),
    };
    this.surfaces = [
      { x: -4.4, y: 0.3, z: 8.2, width: 2.6, height: 2.6, texture: 'brick', label: 'brick wall' },
      { x: -0.2, y: 0.25, z: 10.3, width: 2.8, height: 2.2, texture: 'panel', label: 'metal panel' },
      { x: 4.0, y: 0.2, z: 9.1, width: 2.4, height: 2.4, texture: 'tile', label: 'tile facade' },
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
    const focusPoint = { x: 0.4, y: 1.0, z: 10.2 };
    const basePose = {
      position: {
        x: Math.sin(this.cameraYaw) * 11.2,
        y: 8.4,
        z: focusPoint.z - Math.cos(this.cameraYaw) * 11.2,
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

    this.cameraYaw += this.cameraOrbitSpeed * dt;
    if (input?.isDown('KeyQ')) this.cameraYaw -= 1.0 * dt;
    if (input?.isDown('KeyE')) this.cameraYaw += 1.0 * dt;
    this.lightPulse += dt * 2.7;
    this.syncCamera();
  }

  drawTexturedSurface(renderer, surface, cameraState, projectionViewport) {
    const center = projectPoint({ x: surface.x, y: surface.y + surface.height * 0.5, z: surface.z }, cameraState, projectionViewport);
    const top = projectPoint({ x: surface.x, y: surface.y + surface.height, z: surface.z }, cameraState, projectionViewport);
    const right = projectPoint({ x: surface.x + surface.width * 0.5, y: surface.y + surface.height * 0.5, z: surface.z }, cameraState, projectionViewport);
    if (!center || !top || !right) {
      return;
    }

    const drawWidth = Math.max(10, Math.abs(right.x - center.x) * 2.1);
    const drawHeight = Math.max(12, Math.abs(top.y - center.y) * 2.05);
    const drawX = center.x - drawWidth * 0.5;
    const drawY = center.y - drawHeight * 0.88;
    const texture = this.textures[surface.texture];
    const lightFactor = clamp(0.38 + (Math.sin(this.lightPulse + surface.x * 0.4) + 1) * 0.3, 0.24, 0.82);

    if (typeof renderer.drawImageFrame === 'function' && isImageReady(texture)) {
      renderer.drawImageFrame(texture, 0, 0, texture.width || 64, texture.height || 64, drawX, drawY, drawWidth, drawHeight);
      this.lastImageDraws += 1;
    } else {
      renderer.drawRect(drawX, drawY, drawWidth, drawHeight, '#374151');
    }

    renderer.drawRect(drawX, drawY, drawWidth, drawHeight, `rgba(2, 6, 23, ${lightFactor.toFixed(3)})`);
    renderer.strokeRect(drawX, drawY, drawWidth, drawHeight, '#e2e8f0', 1);
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Sample 1626 - Unreal Texture + Lighting',
      'Image-backed textures mapped to sample surfaces with simple light pulse response.',
      'Camera orbit: auto + Q/E | Camera mode: C | Debug: V',
    ]);

    const viewport = this.viewport;
    renderer.strokeRect(viewport.x, viewport.y, viewport.width, viewport.height, '#d8d5ff', 2);
    drawDepthBackdrop(renderer, viewport);
    renderer.drawRect(viewport.x + 10, viewport.y + 8, 188, 20, 'rgba(56, 189, 248, 0.18)');
    renderer.drawText('Image-Backed Material Surfaces', viewport.x + 16, viewport.y + 22, { color: '#bae6fd', font: '12px monospace' });

    const cameraState = this.camera3D?.getState?.() ?? {
      position: { x: 8, y: 8, z: 0 },
      rotation: { x: -0.52, y: this.cameraYaw, z: 0 },
    };
    const projectionViewport = createProjectionViewport(viewport);
    drawGroundGrid(renderer, { minX: -8, maxX: 8, minZ: 6, maxZ: 15, y: -0.2, step: 1.5 }, cameraState, projectionViewport);

    this.lastImageDraws = 0;
    const sorted = [...this.surfaces].sort((left, right) => right.z - left.z);
    for (let i = 0; i < sorted.length; i += 1) {
      this.drawTexturedSurface(renderer, sorted[i], cameraState, projectionViewport);
    }

    drawPanel(renderer, 620, 34, 300, 188, 'Material Runtime', [
      `Textured surfaces: ${this.surfaces.length}`,
      `Image draws: ${this.lastImageDraws}`,
      `Light pulse: ${Math.sin(this.lightPulse).toFixed(2)}`,
      `Camera yaw: ${this.cameraYaw.toFixed(2)}`,
      'Technique: image frame + tint overlay',
      `Camera mode: ${this.viewState.cameraMode}`,
    ]);

    drawPhase16DebugOverlay(renderer, viewport, this.viewState, [
      'Each panel uses a distinct image texture source',
      'Tint overlay simulates lightweight material response',
    ]);
  }
}
