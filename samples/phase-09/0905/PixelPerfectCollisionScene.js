/*
Toolbox Aid
David Quesenberry
03/22/2026
PixelPerfectCollisionScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';
import { createRasterMask, areMasksColliding, isColliding, getMaskBounds } from '/src/engine/collision/index.js';
import { loadSpriteProjectPreset } from '/samples/shared/spritePresetRuntime.js';

const theme = new Theme(ThemeTokens);
const SPRITE_PRESET_PATH = '/samples/phase-09/0905/sample-0905-sprite-editor.json';
const MASK_CELL_SIZE = 18;

const DEFAULT_RING_ROWS = [
  [0, 1, 1, 1, 0],
  [1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1],
  [0, 1, 1, 1, 0],
];

const DEFAULT_FILL_ROWS = [
  [1, 1, 1],
  [1, 1, 1],
  [1, 1, 1],
];

function buildMaskRowsFromSpriteFrame(spriteProject, frameIndex) {
  const width = Number.parseInt(spriteProject?.width, 10);
  const height = Number.parseInt(spriteProject?.height, 10);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return null;
  }
  const frame = Array.isArray(spriteProject?.frames) ? spriteProject.frames[frameIndex] : null;
  const sourcePixels = Array.isArray(frame?.pixels) ? frame.pixels : [];
  if (sourcePixels.length === 0) {
    return null;
  }

  const rows = [];
  let occupied = 0;
  for (let row = 0; row < height; row += 1) {
    const nextRow = [];
    for (let column = 0; column < width; column += 1) {
      const index = (row * width) + column;
      const color = sourcePixels[index];
      const filled = typeof color === 'string' && color.trim() && !String(color).toUpperCase().endsWith('00') ? 1 : 0;
      occupied += filled;
      nextRow.push(filled);
    }
    rows.push(nextRow);
  }
  return occupied > 0 ? rows : null;
}

function createMaskFromRows(rows) {
  return createRasterMask(rows, { cellSize: MASK_CELL_SIZE });
}

function drawMask(renderer, mask, originX, originY, color) {
  const cellSize = Number.isFinite(Number(mask?.cellSize)) ? Number(mask.cellSize) : MASK_CELL_SIZE;
  const drawSize = Math.max(2, cellSize - 2);
  for (let row = 0; row < mask.height; row += 1) {
    for (let col = 0; col < mask.width; col += 1) {
      if (mask.rows[row][col] !== 1) {
        continue;
      }
      renderer.drawRect(originX + col * cellSize, originY + row * cellSize, drawSize, drawSize, color);
    }
  }
}

export default class PixelPerfectCollisionScene extends Scene {
  constructor() {
    super();
    this.offsetX = -80;
    this.ringMask = createMaskFromRows(DEFAULT_RING_ROWS);
    this.fillMask = createMaskFromRows(DEFAULT_FILL_ROWS);
    this.spriteStatus = 'loading';
    this.spriteError = '';
    void this.loadSpriteProject();
  }

  async loadSpriteProject() {
    try {
      const spriteProject = await loadSpriteProjectPreset(SPRITE_PRESET_PATH);
      const ringRows = buildMaskRowsFromSpriteFrame(spriteProject, 0);
      const fillRows = buildMaskRowsFromSpriteFrame(spriteProject, 1);
      if (ringRows) {
        this.ringMask = createMaskFromRows(ringRows);
      }
      if (fillRows) {
        this.fillMask = createMaskFromRows(fillRows);
      }
      this.spriteStatus = 'loaded';
      this.spriteError = '';
    } catch (error) {
      this.ringMask = createMaskFromRows(DEFAULT_RING_ROWS);
      this.fillMask = createMaskFromRows(DEFAULT_FILL_ROWS);
      this.spriteStatus = 'fallback';
      this.spriteError = error instanceof Error ? error.message : 'unknown preset error';
    }
  }

  update(dtSeconds) {
    this.offsetX += 80 * dtSeconds;
    if (this.offsetX > 110) {
      this.offsetX = -80;
    }
  }

  render(renderer) {
    const ax = 240;
    const ay = 250;
    const bx = 258 + this.offsetX;
    const by = 268;
    const boundsHit = isColliding(getMaskBounds(this.ringMask, ax, ay), getMaskBounds(this.fillMask, bx, by));
    const pixelHit = areMasksColliding(this.ringMask, ax, ay, this.fillMask, bx, by);
    const presetStatus = this.spriteStatus === 'loaded'
      ? 'Sprite masks loaded from sample-0905-sprite-editor.json'
      : this.spriteStatus === 'loading'
        ? 'Loading shared sprite preset...'
        : `Sprite preset unavailable (${this.spriteError || 'using fallback masks'})`;

    drawFrame(renderer, theme, [
      'Engine sample 0905',
      'Pixel-perfect overlap resolves at occupied-cell precision.',
      'This sample and Sprite Editor load the same sample-0905-sprite-editor.json source',
      pixelHit ? 'Pixel overlap: true' : 'Pixel overlap: false',
      presetStatus
    ]);

    renderer.drawRect(90, 220, 480, 180, '#0f172a');
    drawMask(renderer, this.ringMask, ax, ay, '#a78bfa');
    drawMask(renderer, this.fillMask, bx, by, pixelHit ? '#ef4444' : '#22c55e');

    drawPanel(renderer, 620, 34, 300, 170, 'Pixel Perfect Collision', [
      `Bounds Hit: ${boundsHit}`,
      `Pixel Hit: ${pixelHit}`,
      `Mask size: ${this.ringMask.width}x${this.ringMask.height}`,
      'The small block can enter the ring bounds without touching filled cells.',
    ]);
  }
}
