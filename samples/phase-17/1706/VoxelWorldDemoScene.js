/*
Toolbox Aid
David Quesenberry
04/16/2026
VoxelWorldDemoScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { createBottomRightDebugPanelStack, drawFrame, drawStackedDebugPanel } from '/src/engine/debug/index.js';

const theme = new Theme(ThemeTokens);
const WORLD_SIZE = 10;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function shadeColor(rgb, scale) {
  const r = clamp(Math.round(rgb[0] * scale), 0, 255);
  const g = clamp(Math.round(rgb[1] * scale), 0, 255);
  const b = clamp(Math.round(rgb[2] * scale), 0, 255);
  return `rgb(${r}, ${g}, ${b})`;
}

export default class VoxelWorldDemoScene extends Scene {
  constructor() {
    super();
    this.viewport = { x: 40, y: 162, width: 860, height: 330 };
    this.camera = { x: 4.5, z: 3.8, y: 0.2 };
    this.tileW = 32;
    this.tileH = 17;
    this.blockH = 21;
    this.lastFilledFaces = 0;
    this.heights = this.buildHeights();
  }

  buildHeights() {
    const heights = [];
    for (let z = 0; z < WORLD_SIZE; z += 1) {
      const row = [];
      for (let x = 0; x < WORLD_SIZE; x += 1) {
        const ridge = Math.sin((x + 1) * 0.65) + Math.cos((z + 2) * 0.58);
        const basin = Math.hypot(x - 5, z - 4.5) * 0.22;
        const height = clamp(Math.round(2.6 + ridge - basin), 0, 4);
        row.push(height);
      }
      heights.push(row);
    }
    return heights;
  }

  worldToScreen(x, y, z) {
    const relX = x - this.camera.x;
    const relZ = z - this.camera.z;
    return {
      x: this.viewport.x + this.viewport.width * 0.5 + (relX - relZ) * this.tileW,
      y: this.viewport.y + this.viewport.height * 0.73 + (relX + relZ) * this.tileH - (y - this.camera.y) * this.blockH,
    };
  }

  drawBlock(renderer, x, y, z, baseRgb) {
    const p000 = this.worldToScreen(x, y, z);
    const p100 = this.worldToScreen(x + 1, y, z);
    const p110 = this.worldToScreen(x + 1, y, z + 1);
    const p010 = this.worldToScreen(x, y, z + 1);
    const p001 = this.worldToScreen(x, y + 1, z);
    const p101 = this.worldToScreen(x + 1, y + 1, z);
    const p111 = this.worldToScreen(x + 1, y + 1, z + 1);
    const p011 = this.worldToScreen(x, y + 1, z + 1);

    renderer.drawPolygon([p001, p101, p111, p011], {
      fillColor: shadeColor(baseRgb, 1.05),
      strokeColor: '#111827',
      lineWidth: 1,
    });
    // Draw the forward z+ side, not the opposite x- side.
    renderer.drawPolygon([p011, p111, p110, p010], {
      fillColor: shadeColor(baseRgb, 0.72),
      strokeColor: '#111827',
      lineWidth: 1,
    });
    // Draw the adjacent x+ side.
    renderer.drawPolygon([p100, p110, p111, p101], {
      fillColor: shadeColor(baseRgb, 0.84),
      strokeColor: '#111827',
      lineWidth: 1,
    });
    this.lastFilledFaces += 3;
  }

  step3DPhysics(dt, engine) {
    const input = engine.input;
    const step = Math.min(dt, 1 / 30);
    const panSpeed = 2.8;
    if (input?.isDown('KeyA')) this.camera.x -= panSpeed * step;
    if (input?.isDown('KeyD')) this.camera.x += panSpeed * step;
    if (input?.isDown('KeyW')) this.camera.z -= panSpeed * step;
    if (input?.isDown('KeyS')) this.camera.z += panSpeed * step;
    if (input?.isDown('ArrowUp') || input?.isDown('KeyE')) this.camera.y = clamp(this.camera.y + 1.6 * step, -0.5, 2.4);
    if (input?.isDown('ArrowDown') || input?.isDown('KeyQ')) this.camera.y = clamp(this.camera.y - 1.6 * step, -0.5, 2.4);
    this.camera.x = clamp(this.camera.x, -0.4, WORLD_SIZE - 0.6);
    this.camera.z = clamp(this.camera.z, -0.6, WORLD_SIZE - 0.4);
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Sample 1706 - Minecraft Voxel Terrain',
      'Filled voxel cubes with chunk-like terrain heights and panning camera controls.',
      'Controls: W/A/S/D pan | Up/Down or Q/E elevation',
    ]);

    const viewport = this.viewport;
    renderer.strokeRect(viewport.x, viewport.y, viewport.width, viewport.height, '#d8d5ff', 2);
    renderer.drawRect(viewport.x, viewport.y, viewport.width, viewport.height, '#0f172a');
    renderer.drawRect(viewport.x + 10, viewport.y + 8, 232, 20, 'rgba(34, 197, 94, 0.22)');
    renderer.drawText('Minecraft | Filled Voxel Terrain', viewport.x + 16, viewport.y + 22, { color: '#bbf7d0', font: '12px monospace' });

    const blocks = [];
    for (let z = 0; z < WORLD_SIZE; z += 1) {
      for (let x = 0; x < WORLD_SIZE; x += 1) {
        const height = this.heights[z][x];
        for (let y = 0; y < height; y += 1) {
          blocks.push({ x, y, z, depth: x + z + y, baseRgb: y > 2 ? [132, 204, 22] : [59, 130, 246] });
        }
      }
    }
    blocks.sort((left, right) => left.depth - right.depth);

    this.lastFilledFaces = 0;
    for (let i = 0; i < blocks.length; i += 1) {
      const block = blocks[i];
      this.drawBlock(renderer, block.x, block.y, block.z, block.baseRgb);
    }

    const debugStack = createBottomRightDebugPanelStack(renderer);
    drawStackedDebugPanel(renderer, debugStack, 300, 170, 'Voxel Runtime', [
      `World: ${WORLD_SIZE}x${WORLD_SIZE}`,
      `Camera: x=${this.camera.x.toFixed(2)} z=${this.camera.z.toFixed(2)} y=${this.camera.y.toFixed(2)}`,
      `Blocks drawn: ${blocks.length}`,
      `Filled faces: ${this.lastFilledFaces}`,
      'Technique: top/left/right filled cube faces',
    ]);
  }
}
