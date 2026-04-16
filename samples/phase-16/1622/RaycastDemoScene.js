/*
Toolbox Aid
David Quesenberry
04/16/2026
RaycastDemoScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';

const theme = new Theme(ThemeTokens);

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export default class RaycastDemoScene extends Scene {
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
      x: 1.6,
      y: 1.7,
      angle: 0.2,
      moveSpeed: 2.5,
      turnSpeed: 1.85,
    };
    this.fov = Math.PI / 3;
    this.maxDepth = 18;
    this.rayStep = 0.025;
    this.lastFilledColumns = 0;
    this.lastHitDistance = 0;
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
    if (input?.isDown('KeyA')) this.player.angle -= this.player.turnSpeed * dt;
    if (input?.isDown('KeyD')) this.player.angle += this.player.turnSpeed * dt;

    const forwardX = Math.cos(this.player.angle);
    const forwardY = Math.sin(this.player.angle);
    if (input?.isDown('KeyW')) {
      this.tryMove(this.player.x + forwardX * this.player.moveSpeed * dt, this.player.y + forwardY * this.player.moveSpeed * dt);
    }
    if (input?.isDown('KeyS')) {
      this.tryMove(this.player.x - forwardX * this.player.moveSpeed * dt, this.player.y - forwardY * this.player.moveSpeed * dt);
    }
  }

  drawMiniMap(renderer) {
    const panel = { x: 52, y: 44, width: 214, height: 108 };
    const rows = this.map.length;
    const cols = this.map[0].length;
    const cellW = panel.width / cols;
    const cellH = panel.height / rows;

    renderer.drawRect(panel.x, panel.y, panel.width, panel.height, 'rgba(15, 23, 42, 0.74)');
    renderer.strokeRect(panel.x, panel.y, panel.width, panel.height, '#67e8f9', 1);
    renderer.drawText('2D Map (Raycast Grid)', panel.x + 10, panel.y + 16, { color: '#a5f3fc', font: '11px monospace' });

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const color = this.map[row][col] === '1' ? '#334155' : '#0b1220';
        renderer.drawRect(panel.x + col * cellW, panel.y + row * cellH, cellW - 0.4, cellH - 0.4, color);
      }
    }

    const playerX = panel.x + this.player.x * cellW;
    const playerY = panel.y + this.player.y * cellH;
    renderer.drawRect(playerX - 2, playerY - 2, 4, 4, '#f8fafc');
    renderer.drawLine(playerX, playerY, playerX + Math.cos(this.player.angle) * 12, playerY + Math.sin(this.player.angle) * 12, '#f8fafc', 1.5);
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Sample 1622 - Basic Raycast Walls',
      'DOOM-style basic corridor raycasting with filled wall strips and depth shading.',
      'Move: W/S | Turn: A/D',
    ]);

    const viewport = this.viewport;
    renderer.strokeRect(viewport.x, viewport.y, viewport.width, viewport.height, '#d8d5ff', 2);
    renderer.drawRect(viewport.x, viewport.y, viewport.width, viewport.height * 0.48, '#1e293b');
    renderer.drawRect(viewport.x, viewport.y + viewport.height * 0.48, viewport.width, viewport.height * 0.52, '#0f172a');

    const columnWidth = 2;
    const columns = Math.floor(viewport.width / columnWidth);
    this.lastFilledColumns = 0;
    this.lastHitDistance = 0;

    for (let i = 0; i < columns; i += 1) {
      const t = i / Math.max(1, columns - 1);
      const rayAngle = this.player.angle - this.fov * 0.5 + t * this.fov;
      const hit = this.castRay(rayAngle);
      const corrected = hit.distance * Math.cos(rayAngle - this.player.angle);
      const safeDistance = Math.max(0.001, corrected);
      const wallHeight = clamp((viewport.height * 0.95) / safeDistance, 6, viewport.height * 0.92);
      const wallTop = viewport.y + viewport.height * 0.5 - wallHeight * 0.5;
      let shade = clamp(255 - safeDistance * 14, 35, 235);
      if (hit.hitSide === 'y') shade *= 0.82;
      const wallColor = `rgb(${Math.round(shade)}, ${Math.round(shade * 0.68)}, ${Math.round(shade * 0.52)})`;
      renderer.drawRect(viewport.x + i * columnWidth, wallTop, columnWidth + 1, wallHeight, wallColor);
      this.lastFilledColumns += 1;
      this.lastHitDistance = safeDistance;
    }

    this.drawMiniMap(renderer);
    drawPanel(renderer, 620, 34, 300, 170, 'Raycast Runtime', [
      `Player: x=${this.player.x.toFixed(2)} y=${this.player.y.toFixed(2)}`,
      `Angle: ${this.player.angle.toFixed(2)} rad`,
      `FOV: ${(this.fov * 180 / Math.PI).toFixed(0)} deg`,
      `Filled columns: ${this.lastFilledColumns}`,
      `Last hit distance: ${this.lastHitDistance.toFixed(2)}`,
    ]);
  }
}
