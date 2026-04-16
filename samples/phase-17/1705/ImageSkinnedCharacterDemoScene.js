/*
Toolbox Aid
David Quesenberry
04/16/2026
ImageSkinnedCharacterDemoScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { createBottomRightDebugPanelStack, drawFrame, drawStackedDebugPanel } from '/src/engine/debug/index.js';
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
const FRAME_WIDTH = 64;
const FRAME_HEIGHT = 64;
const FRAME_COUNT = 3;

function createImageAsset(svgText, width = FRAME_WIDTH * FRAME_COUNT, height = FRAME_HEIGHT) {
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

export default class ImageSkinnedCharacterDemoScene extends Scene {
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
    this.centerPath = { x: 0.4, z: 10.8 };
    this.pathRadius = 2.8;
    this.pathTime = 0;
    this.cameraYawOffset = 0;
    this.currentFrameIndex = 0;
    this.lastImageDraws = 0;
    this.characterSpriteSheet = createImageAsset(
      "<svg xmlns='http://www.w3.org/2000/svg' width='192' height='64'>" +
      "<rect x='0' y='0' width='64' height='64' fill='none'/>" +
      "<rect x='64' y='0' width='64' height='64' fill='none'/>" +
      "<rect x='128' y='0' width='64' height='64' fill='none'/>" +
      "<g transform='translate(0,0)'><ellipse cx='32' cy='50' rx='14' ry='8' fill='#1d4ed8'/><circle cx='32' cy='18' r='9' fill='#fde68a'/><rect x='24' y='26' width='16' height='20' rx='5' fill='#93c5fd'/><rect x='18' y='28' width='6' height='16' rx='3' fill='#fbbf24'/><rect x='40' y='28' width='6' height='16' rx='3' fill='#fbbf24'/></g>" +
      "<g transform='translate(64,0)'><ellipse cx='32' cy='50' rx='14' ry='8' fill='#1d4ed8'/><circle cx='32' cy='18' r='9' fill='#fde68a'/><rect x='24' y='26' width='16' height='20' rx='5' fill='#93c5fd'/><rect x='16' y='24' width='6' height='18' rx='3' fill='#fbbf24'/><rect x='42' y='32' width='6' height='18' rx='3' fill='#fbbf24'/></g>" +
      "<g transform='translate(128,0)'><ellipse cx='32' cy='50' rx='14' ry='8' fill='#1d4ed8'/><circle cx='32' cy='18' r='9' fill='#fde68a'/><rect x='24' y='26' width='16' height='20' rx='5' fill='#93c5fd'/><rect x='20' y='32' width='6' height='18' rx='3' fill='#fbbf24'/><rect x='38' y='24' width='6' height='18' rx='3' fill='#fbbf24'/></g>" +
      "</svg>"
    );
    this.character = { x: this.centerPath.x + this.pathRadius, y: 0, z: this.centerPath.z };
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
      x: this.character.x,
      y: 0.9,
      z: this.character.z,
    };
    const yaw = 0.5 + this.cameraYawOffset;
    const basePose = {
      position: {
        x: focusPoint.x + Math.sin(yaw) * 8.8,
        y: 7.8,
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
    const step = Math.min(dt, 1 / 30);
    stepPhase16ViewToggles(this.viewState, input);

    this.pathTime += dt;
    if (input?.isDown('ArrowLeft') || input?.isDown('KeyQ')) this.cameraYawOffset -= 0.9 * step;
    if (input?.isDown('ArrowRight') || input?.isDown('KeyE')) this.cameraYawOffset += 0.9 * step;
    if (input?.isDown('KeyR')) this.pathTime = 0;

    this.character.x = this.centerPath.x + Math.cos(this.pathTime * 0.85) * this.pathRadius;
    this.character.z = this.centerPath.z + Math.sin(this.pathTime * 0.85) * (this.pathRadius * 0.75);
    this.currentFrameIndex = Math.floor(this.pathTime * 6) % FRAME_COUNT;
    this.syncCamera();
  }

  drawCharacter(renderer, cameraState, projectionViewport) {
    const center = projectPoint({ x: this.character.x, y: 1.1, z: this.character.z }, cameraState, projectionViewport);
    const top = projectPoint({ x: this.character.x, y: 2.2, z: this.character.z }, cameraState, projectionViewport);
    const right = projectPoint({ x: this.character.x + 0.55, y: 1.1, z: this.character.z }, cameraState, projectionViewport);
    if (!center || !top || !right) {
      return;
    }

    const drawWidth = Math.max(16, Math.abs(right.x - center.x) * 3.0);
    const drawHeight = Math.max(20, Math.abs(top.y - center.y) * 2.55);
    const drawX = center.x - drawWidth * 0.5;
    const drawY = center.y - drawHeight * 0.9;
    const frameX = this.currentFrameIndex * FRAME_WIDTH;

    if (typeof renderer.drawImageFrame === 'function' && isImageReady(this.characterSpriteSheet)) {
      renderer.drawImageFrame(this.characterSpriteSheet, frameX, 0, FRAME_WIDTH, FRAME_HEIGHT, drawX, drawY, drawWidth, drawHeight);
      this.lastImageDraws += 1;
    } else {
      renderer.drawRect(drawX, drawY, drawWidth, drawHeight, '#60a5fa');
    }
    renderer.strokeRect(drawX, drawY, drawWidth, drawHeight, '#f8fafc', 1);

    const shadowCenter = projectPoint({ x: this.character.x, y: 0.02, z: this.character.z }, cameraState, projectionViewport);
    if (shadowCenter) {
      renderer.drawRect(shadowCenter.x - 9, shadowCenter.y - 3, 18, 6, 'rgba(2, 6, 23, 0.45)');
    }
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Sample 1705 - Unreal Skinned Mesh Demo',
      'Image sprite-sheet frames animate a skinned character moving along a looping path.',
      'Controls: Left/Right or Q/E orbit | R reset path | C camera mode | V debug',
    ]);

    const viewport = this.viewport;
    renderer.strokeRect(viewport.x, viewport.y, viewport.width, viewport.height, '#d8d5ff', 2);
    drawDepthBackdrop(renderer, viewport);
    renderer.drawRect(viewport.x + 10, viewport.y + 8, 250, 20, 'rgba(99, 102, 241, 0.20)');
    renderer.drawText('Unreal | Image-Skinned Character', viewport.x + 16, viewport.y + 22, { color: '#ddd6fe', font: '12px monospace' });

    const cameraState = this.camera3D?.getState?.() ?? {
      position: { x: 8, y: 8, z: 0 },
      rotation: { x: -0.5, y: 0.5 + this.cameraYawOffset, z: 0 },
    };
    const projectionViewport = createProjectionViewport(viewport);
    drawGroundGrid(renderer, { minX: -8, maxX: 8, minZ: 6, maxZ: 16, y: -0.1, step: 1.5 }, cameraState, projectionViewport);

    this.lastImageDraws = 0;
    this.drawCharacter(renderer, cameraState, projectionViewport);

    const debugStack = createBottomRightDebugPanelStack(renderer);
    drawStackedDebugPanel(renderer, debugStack, 300, 188, 'Character Runtime', [
      `Frame index: ${this.currentFrameIndex}`,
      `Image draws: ${this.lastImageDraws}`,
      `Character x: ${this.character.x.toFixed(2)}`,
      `Character z: ${this.character.z.toFixed(2)}`,
      `Path time: ${this.pathTime.toFixed(2)} s`,
      `Camera mode: ${this.viewState.cameraMode}`,
    ]);

    drawPhase16DebugOverlay(renderer, viewport, this.viewState, [
      'Sprite sheet frame advances with motion cycle',
      'Character remains image-backed across all frames',
    ], { stack: debugStack });
  }
}
