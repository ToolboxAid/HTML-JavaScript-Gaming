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

export default class WolfOptimizedRaycastScene extends Scene {
  constructor() {
    super();
    this.viewport = { x: 40, y: 162, width: 860, height: 330 };
    this.map = [
      '111111111111111',
      '100000000010001',
      '101111110010101',
      '101000010000101',
      '101011010111101',
      '100010010100001',
      '111010010101111',
      '100010000100001',
      '101111011111101',
      '100000000000001',
      '111111111111111',
    ];
    this.player = { x: 1.8, y: 1.8, angle: 0.12, moveSpeed: 2.75, turnSpeed: 2.0 };
    this.fov = Math.PI / 3.05;
    this.maxDepth = 24;
    this.lastFilledColumns = 0;
    this.lastDdaSteps = 0;
  }

  isWallCell(col, row) {
    if (row < 0 || row >= this.map.length || col < 0 || col >= this.map[0].length) {
      return true;
    }
    return this.map[row][col] === '1';
  }

  isWall(x, y) {
    return this.isWallCell(Math.floor(x), Math.floor(y));
  }

  tryMove(nextX, nextY) {
    if (!this.isWall(nextX, this.player.y)) {
      this.player.x = nextX;
    }
    if (!this.isWall(this.player.x, nextY)) {
      this.player.y = nextY;
    }
  }

  castRayDda(angle) {
    const rayDirX = Math.cos(angle);
    const rayDirY = Math.sin(angle);
    let mapX = Math.floor(this.player.x);
    let mapY = Math.floor(this.player.y);

    const deltaDistX = Math.abs(1 / Math.max(0.00001, rayDirX));
    const deltaDistY = Math.abs(1 / Math.max(0.00001, rayDirY));
    let stepX = 0;
    let stepY = 0;
    let sideDistX = 0;
    let sideDistY = 0;

    if (rayDirX < 0) {
      stepX = -1;
      sideDistX = (this.player.x - mapX) * deltaDistX;
    } else {
      stepX = 1;
      sideDistX = (mapX + 1.0 - this.player.x) * deltaDistX;
    }
    if (rayDirY < 0) {
      stepY = -1;
      sideDistY = (this.player.y - mapY) * deltaDistY;
    } else {
      stepY = 1;
      sideDistY = (mapY + 1.0 - this.player.y) * deltaDistY;
    }

    let side = 0;
    let steps = 0;
    while (steps < 128) {
      steps += 1;
      if (sideDistX < sideDistY) {
        sideDistX += deltaDistX;
        mapX += stepX;
        side = 0;
      } else {
        sideDistY += deltaDistY;
        mapY += stepY;
        side = 1;
      }
      if (this.isWallCell(mapX, mapY)) {
        const rawDistance = side === 0 ? (sideDistX - deltaDistX) : (sideDistY - deltaDistY);
        return { distance: rawDistance, side, steps };
      }
      if (Math.min(sideDistX, sideDistY) > this.maxDepth) {
        break;
      }
    }

    return { distance: this.maxDepth, side, steps };
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
    if (moveForward) this.tryMove(this.player.x + forwardX * this.player.moveSpeed * step, this.player.y + forwardY * this.player.moveSpeed * step);
    if (moveBackward) this.tryMove(this.player.x - forwardX * this.player.moveSpeed * step, this.player.y - forwardY * this.player.moveSpeed * step);
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Sample 1703 - Wolf Optimized Raycast',
      'DDA traversal for ray steps, preserving classic filled corridor rendering.',
      'Controls: W/S or Up/Down move | A/D or Left/Right turn',
    ]);

    const viewport = this.viewport;
    renderer.strokeRect(viewport.x, viewport.y, viewport.width, viewport.height, '#d8d5ff', 2);
    renderer.drawRect(viewport.x, viewport.y, viewport.width, viewport.height * 0.5, '#0f766e');
    renderer.drawRect(viewport.x, viewport.y + viewport.height * 0.5, viewport.width, viewport.height * 0.5, '#111827');
    renderer.drawRect(viewport.x + 10, viewport.y + 8, 188, 20, 'rgba(20, 184, 166, 0.22)');
    renderer.drawText('Wolf | DDA Raycast', viewport.x + 16, viewport.y + 22, { color: '#99f6e4', font: '12px monospace' });

    const columnWidth = 2;
    const columns = Math.floor(viewport.width / columnWidth);
    this.lastFilledColumns = 0;
    this.lastDdaSteps = 0;

    for (let i = 0; i < columns; i += 1) {
      const t = i / Math.max(1, columns - 1);
      const rayAngle = this.player.angle - this.fov * 0.5 + t * this.fov;
      const hit = this.castRayDda(rayAngle);
      this.lastDdaSteps += hit.steps;

      const corrected = hit.distance * Math.cos(rayAngle - this.player.angle);
      const safeDistance = Math.max(0.001, corrected);
      const wallHeight = clamp((viewport.height * 0.98) / safeDistance, 7, viewport.height * 0.92);
      const wallTop = viewport.y + viewport.height * 0.5 - wallHeight * 0.5;
      let shade = clamp(240 - safeDistance * 13.5, 32, 230);
      if (hit.side === 1) shade *= 0.76;
      const color = `rgb(${Math.round(shade * 0.48)}, ${Math.round(shade)}, ${Math.round(shade * 0.82)})`;
      renderer.drawRect(viewport.x + i * columnWidth, wallTop, columnWidth + 1, wallHeight, color);
      this.lastFilledColumns += 1;
    }

    const debugStack = createBottomRightDebugPanelStack(renderer);
    drawStackedDebugPanel(renderer, debugStack, 300, 182, 'Wolf Runtime', [
      `Player: x=${this.player.x.toFixed(2)} y=${this.player.y.toFixed(2)}`,
      `Angle: ${this.player.angle.toFixed(2)} rad`,
      `Filled columns: ${this.lastFilledColumns}`,
      `Total DDA steps: ${this.lastDdaSteps}`,
      `Avg steps/column: ${(this.lastDdaSteps / Math.max(1, this.lastFilledColumns)).toFixed(1)}`,
      'Technique: grid DDA ray traversal',
    ]);
  }
}
