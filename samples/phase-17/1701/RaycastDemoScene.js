/*
Toolbox Aid
David Quesenberry
04/16/2026
RaycastDemoScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { createBottomRightDebugPanelStack, drawFrame, drawStackedDebugPanel } from '/src/engine/debug/index.js';

const theme = new Theme(ThemeTokens);

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeAngle(angle) {
  let result = angle;
  while (result > Math.PI) result -= Math.PI * 2;
  while (result < -Math.PI) result += Math.PI * 2;
  return result;
}

function createSpriteAsset() {
  if (typeof Image === 'function') {
    const image = new Image(64, 64);
    image.src = `data:image/svg+xml;utf8,${encodeURIComponent(
      "<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'>" +
      "<ellipse cx='32' cy='54' rx='14' ry='8' fill='#7f1d1d'/>" +
      "<circle cx='32' cy='20' r='10' fill='#fca5a5'/>" +
      "<rect x='23' y='30' width='18' height='20' rx='5' fill='#fecaca'/>" +
      "<circle cx='28' cy='18' r='2.3' fill='#111827'/><circle cx='36' cy='18' r='2.3' fill='#111827'/>" +
      "</svg>"
    )}`;
    return image;
  }
  return { width: 64, height: 64, complete: true, __synthetic: true };
}

function isImageReady(image) {
  if (!image) return false;
  if (image.__synthetic) return true;
  return image.complete === true && ((image.naturalWidth ?? 0) > 0 || (image.width ?? 0) > 0);
}

export default class DoomRaycastSpritesScene extends Scene {
  constructor() {
    super();
    this.viewport = { x: 40, y: 162, width: 860, height: 330 };
    this.map = [
      '111111111111',
      '100000000001',
      '101111011101',
      '101000010001',
      '101011110101',
      '100010000101',
      '111010111101',
      '100010100001',
      '101110101101',
      '100000100001',
      '111111111111',
    ];
    this.player = {
      x: 1.7,
      y: 1.7,
      angle: 0.3,
      moveSpeed: 2.45,
      turnSpeed: 1.9,
    };
    this.fov = Math.PI / 3;
    this.maxDepth = 18;
    this.rayStep = 0.028;
    this.sprites = [
      { x: 3.2, y: 1.8 },
      { x: 5.4, y: 1.8 },
      { x: 7.8, y: 2.6 },
      { x: 9.1, y: 1.8 },
    ];
    this.spriteImage = createSpriteAsset();
    this.depthBuffer = [];
    this.lastFilledColumns = 0;
    this.lastSpriteDraws = 0;
  }

  isWall(x, y) {
    const col = Math.floor(x);
    const row = Math.floor(y);
    if (row < 0 || row >= this.map.length || col < 0 || col >= this.map[0].length) {
      return true;
    }
    return this.map[row][col] === '1';
  }

  tryMove(nextX, nextY) {
    if (!this.isWall(nextX, this.player.y)) {
      this.player.x = nextX;
    }
    if (!this.isWall(this.player.x, nextY)) {
      this.player.y = nextY;
    }
  }

  castRay(angle) {
    const rayDirX = Math.cos(angle);
    const rayDirY = Math.sin(angle);
    let distance = 0;
    let hitSide = 'x';

    while (distance < this.maxDepth) {
      const sampleX = this.player.x + rayDirX * distance;
      const sampleY = this.player.y + rayDirY * distance;
      if (this.isWall(sampleX, sampleY)) {
        const nextX = this.player.x + rayDirX * (distance + this.rayStep);
        const nextY = this.player.y + rayDirY * (distance + this.rayStep);
        hitSide = Math.abs(nextX - sampleX) > Math.abs(nextY - sampleY) ? 'x' : 'y';
        return { distance, hitSide };
      }
      distance += this.rayStep;
    }

    return { distance: this.maxDepth, hitSide };
  }

  step3DPhysics(dt, engine) {
    const input = engine.input;
    const step = Math.min(dt, 1 / 30);
    const turnLeft = input?.isDown('KeyA') || input?.isDown('ArrowLeft');
    const turnRight = input?.isDown('KeyD') || input?.isDown('ArrowRight');
    if (turnLeft) this.player.angle -= this.player.turnSpeed * step;
    if (turnRight) this.player.angle += this.player.turnSpeed * step;
    this.player.angle = normalizeAngle(this.player.angle);

    const forwardX = Math.cos(this.player.angle);
    const forwardY = Math.sin(this.player.angle);
    const moveForward = input?.isDown('KeyW') || input?.isDown('ArrowUp');
    const moveBackward = input?.isDown('KeyS') || input?.isDown('ArrowDown');
    if (moveForward) {
      this.tryMove(this.player.x + forwardX * this.player.moveSpeed * step, this.player.y + forwardY * this.player.moveSpeed * step);
    }
    if (moveBackward) {
      this.tryMove(this.player.x - forwardX * this.player.moveSpeed * step, this.player.y - forwardY * this.player.moveSpeed * step);
    }
  }

  drawSprites(renderer, columnWidth) {
    this.lastSpriteDraws = 0;
    const sortedSprites = this.sprites
      .map((sprite) => {
        const dx = sprite.x - this.player.x;
        const dy = sprite.y - this.player.y;
        return { ...sprite, distance: Math.hypot(dx, dy), angle: Math.atan2(dy, dx) };
      })
      .sort((left, right) => right.distance - left.distance);

    for (let i = 0; i < sortedSprites.length; i += 1) {
      const sprite = sortedSprites[i];
      const angleDiff = normalizeAngle(sprite.angle - this.player.angle);
      if (Math.abs(angleDiff) > this.fov * 0.6) {
        continue;
      }
      const distance = Math.max(0.001, sprite.distance);
      const screenX = this.viewport.x + ((angleDiff + this.fov * 0.5) / this.fov) * this.viewport.width;
      const spriteHeight = clamp(this.viewport.height / distance, 16, this.viewport.height * 0.95);
      const spriteWidth = spriteHeight * 0.78;
      const drawX = screenX - spriteWidth * 0.5;
      const drawY = this.viewport.y + this.viewport.height * 0.5 - spriteHeight * 0.45;
      const columnIndex = clamp(Math.floor((screenX - this.viewport.x) / columnWidth), 0, this.depthBuffer.length - 1);
      if (distance >= this.depthBuffer[columnIndex] * 1.1) {
        continue;
      }

      if (typeof renderer.drawImageFrame === 'function' && isImageReady(this.spriteImage)) {
        renderer.drawImageFrame(this.spriteImage, 0, 0, this.spriteImage.width || 64, this.spriteImage.height || 64, drawX, drawY, spriteWidth, spriteHeight);
      } else {
        renderer.drawRect(drawX, drawY, spriteWidth, spriteHeight, '#fca5a5');
      }
      renderer.strokeRect(drawX, drawY, spriteWidth, spriteHeight, '#fef2f2', 1);
      this.lastSpriteDraws += 1;
    }
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Sample 1701 - DOOM Raycast + Sprites',
      'DOOM-style corridor raycasting with billboard sprites composited into depth-sorted space.',
      'Controls: W/S or Up/Down move | A/D or Left/Right turn',
    ]);

    const viewport = this.viewport;
    renderer.strokeRect(viewport.x, viewport.y, viewport.width, viewport.height, '#d8d5ff', 2);
    renderer.drawRect(viewport.x, viewport.y, viewport.width, viewport.height * 0.48, '#334155');
    renderer.drawRect(viewport.x, viewport.y + viewport.height * 0.48, viewport.width, viewport.height * 0.52, '#111827');
    renderer.drawRect(viewport.x + 10, viewport.y + 8, 230, 20, 'rgba(249, 115, 22, 0.20)');
    renderer.drawText('DOOM | Raycast + Sprites', viewport.x + 16, viewport.y + 22, { color: '#fed7aa', font: '12px monospace' });

    const columnWidth = 2;
    const columns = Math.floor(viewport.width / columnWidth);
    this.lastFilledColumns = 0;
    this.depthBuffer = new Array(columns).fill(this.maxDepth);

    for (let i = 0; i < columns; i += 1) {
      const t = i / Math.max(1, columns - 1);
      const rayAngle = this.player.angle - this.fov * 0.5 + t * this.fov;
      const hit = this.castRay(rayAngle);
      const corrected = hit.distance * Math.cos(rayAngle - this.player.angle);
      const safeDistance = Math.max(0.001, corrected);
      this.depthBuffer[i] = safeDistance;
      const wallHeight = clamp((viewport.height * 0.95) / safeDistance, 6, viewport.height * 0.92);
      const wallTop = viewport.y + viewport.height * 0.5 - wallHeight * 0.5;
      let shade = clamp(250 - safeDistance * 14, 35, 230);
      if (hit.hitSide === 'y') shade *= 0.82;
      const wallColor = `rgb(${Math.round(shade)}, ${Math.round(shade * 0.60)}, ${Math.round(shade * 0.45)})`;
      renderer.drawRect(viewport.x + i * columnWidth, wallTop, columnWidth + 1, wallHeight, wallColor);
      this.lastFilledColumns += 1;
    }

    this.drawSprites(renderer, columnWidth);
    const debugStack = createBottomRightDebugPanelStack(renderer);
    drawStackedDebugPanel(renderer, debugStack, 300, 170, 'DOOM Runtime', [
      `Player: x=${this.player.x.toFixed(2)} y=${this.player.y.toFixed(2)}`,
      `Angle: ${this.player.angle.toFixed(2)} rad`,
      `Filled columns: ${this.lastFilledColumns}`,
      `Sprite draws: ${this.lastSpriteDraws}`,
      `Corridor sprites: ${this.sprites.length}`,
    ]);
  }
}
