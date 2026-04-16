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

export default class WolfGridRaycastScene extends Scene {
  constructor() {
    super();
    this.viewport = { x: 40, y: 162, width: 860, height: 330 };
    this.map = [
      '1111111111111',
      '1000000000001',
      '1011110111101',
      '1000010000101',
      '1111011110101',
      '1000010000101',
      '1011110111101',
      '1000000000001',
      '1111111111111',
    ];
    this.player = { x: 1.5, y: 1.5, angle: 0.2, moveSpeed: 2.6, turnSpeed: 2.0 };
    this.fov = Math.PI / 3.2;
    this.maxDepth = 16;
    this.rayStep = 0.02;
    this.lastFilledColumns = 0;
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
    const dirX = Math.cos(angle);
    const dirY = Math.sin(angle);
    let distance = 0;
    let hitSide = 0;

    while (distance < this.maxDepth) {
      const x = this.player.x + dirX * distance;
      const y = this.player.y + dirY * distance;
      if (this.isWall(x, y)) {
        const nx = this.player.x + dirX * (distance + this.rayStep);
        const ny = this.player.y + dirY * (distance + this.rayStep);
        hitSide = Math.abs(nx - x) > Math.abs(ny - y) ? 0 : 1;
        return { distance, hitSide };
      }
      distance += this.rayStep;
    }

    return { distance: this.maxDepth, hitSide };
  }

  drawMiniMap(renderer) {
    const canvas = renderer.getCanvasSize?.() || { width: 960, height: 540 };
    const margin = 24;
    const panelWidth = 228;
    const panelHeight = 108;
    const panel = {
      x: Math.max(margin, canvas.width - panelWidth - margin),
      y: Math.max(margin, canvas.height - panelHeight - margin),
      width: panelWidth,
      height: panelHeight,
    };
    const rows = this.map.length;
    const cols = this.map[0].length;
    const cellW = panel.width / cols;
    const cellH = panel.height / rows;

    renderer.drawRect(panel.x, panel.y, panel.width, panel.height, 'rgba(2, 6, 23, 0.74)');
    renderer.strokeRect(panel.x, panel.y, panel.width, panel.height, '#93c5fd', 1);
    renderer.drawText('2D Grid Map', panel.x + 10, panel.y + 16, { color: '#bfdbfe', font: '11px monospace' });

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const wall = this.map[row][col] === '1';
        renderer.drawRect(panel.x + col * cellW, panel.y + row * cellH, cellW - 0.5, cellH - 0.5, wall ? '#1d4ed8' : '#0f172a');
      }
    }

    const playerX = panel.x + this.player.x * cellW;
    const playerY = panel.y + this.player.y * cellH;
    renderer.drawRect(playerX - 2, playerY - 2, 4, 4, '#f8fafc');
    renderer.drawLine(playerX, playerY, playerX + Math.cos(this.player.angle) * 12, playerY + Math.sin(this.player.angle) * 12, '#f8fafc', 1.5);
  }

  step3DPhysics(dt, engine) {
    const input = engine.input;
    if (input?.isDown('KeyA')) this.player.angle -= this.player.turnSpeed * dt;
    if (input?.isDown('KeyD')) this.player.angle += this.player.turnSpeed * dt;

    const forwardX = Math.cos(this.player.angle);
    const forwardY = Math.sin(this.player.angle);
    if (input?.isDown('KeyW')) this.tryMove(this.player.x + forwardX * this.player.moveSpeed * dt, this.player.y + forwardY * this.player.moveSpeed * dt);
    if (input?.isDown('KeyS')) this.tryMove(this.player.x - forwardX * this.player.moveSpeed * dt, this.player.y - forwardY * this.player.moveSpeed * dt);
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Sample 1702 - Wolf Grid Raycast',
      'Pure grid raycasting and flat filled walls with classic corridor readability.',
      'Move: W/S | Turn: A/D',
    ]);

    const viewport = this.viewport;
    renderer.strokeRect(viewport.x, viewport.y, viewport.width, viewport.height, '#d8d5ff', 2);
    renderer.drawRect(viewport.x, viewport.y, viewport.width, viewport.height * 0.5, '#1e3a8a');
    renderer.drawRect(viewport.x, viewport.y + viewport.height * 0.5, viewport.width, viewport.height * 0.5, '#0f172a');

    const columnWidth = 2;
    const columns = Math.floor(viewport.width / columnWidth);
    this.lastFilledColumns = 0;

    for (let i = 0; i < columns; i += 1) {
      const t = i / Math.max(1, columns - 1);
      const rayAngle = this.player.angle - this.fov * 0.5 + t * this.fov;
      const hit = this.castRay(rayAngle);
      const corrected = hit.distance * Math.cos(rayAngle - this.player.angle);
      const safeDistance = Math.max(0.001, corrected);
      const wallHeight = clamp((viewport.height * 0.9) / safeDistance, 8, viewport.height * 0.92);
      const wallTop = viewport.y + viewport.height * 0.5 - wallHeight * 0.5;
      let shade = clamp(235 - safeDistance * 15, 38, 224);
      if (hit.hitSide === 1) shade *= 0.78;
      const color = `rgb(${Math.round(shade * 0.35)}, ${Math.round(shade * 0.55)}, ${Math.round(shade)})`;
      renderer.drawRect(viewport.x + i * columnWidth, wallTop, columnWidth + 1, wallHeight, color);
      this.lastFilledColumns += 1;
    }

    this.drawMiniMap(renderer);
    drawPanel(renderer, 620, 34, 300, 170, 'Wolf Runtime', [
      `Player: x=${this.player.x.toFixed(2)} y=${this.player.y.toFixed(2)}`,
      `Angle: ${this.player.angle.toFixed(2)} rad`,
      `FOV: ${(this.fov * 180 / Math.PI).toFixed(0)} deg`,
      `Filled columns: ${this.lastFilledColumns}`,
      'Technique: pure grid raycast walls',
    ]);
  }
}
