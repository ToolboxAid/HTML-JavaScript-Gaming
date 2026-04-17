/*
Toolbox Aid
David Quesenberry
04/16/2026
VoxelWorldDemoScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { createBottomRightDebugPanelStack, drawFrame, drawStackedDebugPanel } from '/src/engine/debug/index.js';
import {
  createTabDebugOverlayController,
  getTabDebugOverlayStatusLabel,
  isTabDebugOverlayActive,
  stepTabDebugOverlayController,
} from '/samples/phase-17/shared/tabDebugOverlayCycle.js';

const theme = new Theme(ThemeTokens);
const WORLD_SIZE = 16;
const CHUNK_SIZE = 4;
const OVERLAY_CHUNK_RUNTIME = 'chunk-runtime';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function shadeColor(rgb, scale) {
  const r = clamp(Math.round(rgb[0] * scale), 0, 255);
  const g = clamp(Math.round(rgb[1] * scale), 0, 255);
  const b = clamp(Math.round(rgb[2] * scale), 0, 255);
  return `rgb(${r}, ${g}, ${b})`;
}

export default class ChunkStreamingVoxelScene extends Scene {
  constructor() {
    super();
    this.viewport = { x: 40, y: 162, width: 860, height: 330 };
    this.camera = { x: 7.5, z: 6.5, y: 0.4 };
    this.tileW = 30;
    this.tileH = 16;
    this.blockH = 20;
    this.chunkRadius = 1;
    this.lastFilledFaces = 0;
    this.lastActiveChunks = 0;
    this.heights = this.buildHeights();
    this.tabDebugOverlays = createTabDebugOverlayController({
      overlays: [
        { id: OVERLAY_CHUNK_RUNTIME, label: 'Chunk Runtime' },
      ],
      initialOverlayId: OVERLAY_CHUNK_RUNTIME,
    });
  }

  buildHeights() {
    const heights = [];
    for (let z = 0; z < WORLD_SIZE; z += 1) {
      const row = [];
      for (let x = 0; x < WORLD_SIZE; x += 1) {
        const wave = Math.sin((x + 2) * 0.52) + Math.cos((z + 1) * 0.47);
        const ridge = Math.sin((x + z) * 0.35) * 0.8;
        row.push(clamp(Math.round(2.2 + wave + ridge), 0, 5));
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
      y: this.viewport.y + this.viewport.height * 0.74 + (relX + relZ) * this.tileH - (y - this.camera.y) * this.blockH,
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
      fillColor: shadeColor(baseRgb, 1.06),
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
      fillColor: shadeColor(baseRgb, 0.83),
      strokeColor: '#111827',
      lineWidth: 1,
    });
    this.lastFilledFaces += 3;
  }

  getChunkCoord(value) {
    return Math.floor(value / CHUNK_SIZE);
  }

  isChunkActive(chunkX, chunkZ) {
    const anchorChunkX = this.getChunkCoord(this.camera.x);
    const anchorChunkZ = this.getChunkCoord(this.camera.z);
    return Math.abs(chunkX - anchorChunkX) <= this.chunkRadius && Math.abs(chunkZ - anchorChunkZ) <= this.chunkRadius;
  }

  step3DPhysics(dt, engine) {
    const input = engine.input;
    stepTabDebugOverlayController(this.tabDebugOverlays, input);
    const step = Math.min(dt, 1 / 30);
    const panSpeed = 3;
    if (input?.isDown('KeyA')) this.camera.x -= panSpeed * step;
    if (input?.isDown('KeyD')) this.camera.x += panSpeed * step;
    if (input?.isDown('KeyW')) this.camera.z -= panSpeed * step;
    if (input?.isDown('KeyS')) this.camera.z += panSpeed * step;
    if (input?.isDown('ArrowUp') || input?.isDown('KeyE')) this.chunkRadius = clamp(this.chunkRadius + 1 * step * 8, 1, 2);
    if (input?.isDown('ArrowDown') || input?.isDown('KeyQ')) this.chunkRadius = clamp(this.chunkRadius - 1 * step * 8, 1, 2);
    this.chunkRadius = Math.round(this.chunkRadius);

    this.camera.y = clamp(this.camera.y, -0.2, 2.4);
    this.camera.x = clamp(this.camera.x, 0.2, WORLD_SIZE - 0.2);
    this.camera.z = clamp(this.camera.z, 0.2, WORLD_SIZE - 0.2);
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Sample 1707 - Minecraft Chunk Streaming',
      'Voxel chunk-window streaming keeps nearby terrain active around the camera anchor.',
      `Controls: W/A/S/D pan | Up/Down or Q/E chunk radius | Debug: Tab/Shift+Tab (${getTabDebugOverlayStatusLabel(this.tabDebugOverlays)})`,
    ]);

    const viewport = this.viewport;
    renderer.strokeRect(viewport.x, viewport.y, viewport.width, viewport.height, '#d8d5ff', 2);
    renderer.drawRect(viewport.x, viewport.y, viewport.width, viewport.height, '#0f172a');
    renderer.drawRect(viewport.x + 10, viewport.y + 8, 250, 20, 'rgba(34, 197, 94, 0.22)');
    renderer.drawText('Minecraft | Chunk Streaming Window', viewport.x + 16, viewport.y + 22, { color: '#bbf7d0', font: '12px monospace' });

    const blocks = [];
    const chunkSet = new Set();
    for (let z = 0; z < WORLD_SIZE; z += 1) {
      for (let x = 0; x < WORLD_SIZE; x += 1) {
        const chunkX = this.getChunkCoord(x);
        const chunkZ = this.getChunkCoord(z);
        if (!this.isChunkActive(chunkX, chunkZ)) {
          continue;
        }
        chunkSet.add(`${chunkX},${chunkZ}`);
        const height = this.heights[z][x];
        for (let y = 0; y < height; y += 1) {
          blocks.push({
            x,
            y,
            z,
            depth: x + z + y,
            baseRgb: y > 2 ? [163, 230, 53] : [34, 197, 94],
          });
        }
      }
    }
    blocks.sort((left, right) => left.depth - right.depth);
    this.lastActiveChunks = chunkSet.size;
    this.lastFilledFaces = 0;

    for (let i = 0; i < blocks.length; i += 1) {
      const block = blocks[i];
      this.drawBlock(renderer, block.x, block.y, block.z, block.baseRgb);
    }

    if (isTabDebugOverlayActive(this.tabDebugOverlays, OVERLAY_CHUNK_RUNTIME)) {
      const debugStack = createBottomRightDebugPanelStack(renderer);
      drawStackedDebugPanel(renderer, debugStack, 300, 188, 'Chunk Runtime', [
        `World cells: ${WORLD_SIZE}x${WORLD_SIZE}`,
        `Camera: x=${this.camera.x.toFixed(2)} z=${this.camera.z.toFixed(2)}`,
        `Chunk radius: ${this.chunkRadius}`,
        `Active chunks: ${this.lastActiveChunks}`,
        `Blocks drawn: ${blocks.length}`,
        `Filled faces: ${this.lastFilledFaces}`,
      ]);
    }
  }
}
