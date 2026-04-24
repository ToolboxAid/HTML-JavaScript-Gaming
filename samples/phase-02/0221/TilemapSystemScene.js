/*
Toolbox Aid
David Quesenberry
03/21/2026
TilemapSystemScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { clamp } from '/src/engine/utils/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';
import { Tilemap, renderTilemap, resolveRectVsTilemap } from '/src/engine/tilemap/index.js';

const theme = new Theme(ThemeTokens);
const TILEMAP_PRESET_PATH = '/samples/phase-02/0221/sample-0221-tile-map-editor.json';

export default class TilemapSystemScene extends Scene {
  constructor() {
    super();
    this.offset = { x: 160, y: 180 };
    this.sampleStatus = 'Loading shared tilemap preset...';
    this.sampleError = '';
    this.tilemap = new Tilemap({
      tileSize: 48,
      tiles: [
        [1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,0,0,1,1,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1,0,1],
        [1,0,0,1,1,0,0,1,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1],
      ],
      palette: {
        0: '#1f2937',
        1: '#6366f1',
      },
    });
    this.player = {
      x: this.offset.x + 60,
      y: this.offset.y + 60,
      width: 34,
      height: 34,
      speed: 220,
    };
    this.lastCollision = 'none';
    void this.loadTilemapPreset();
  }

  extractTileMapDocumentFromSamplePreset(rawPreset) {
    if (!rawPreset || typeof rawPreset !== 'object') {
      return null;
    }

    const payload = rawPreset.payload;
    if (payload && typeof payload === 'object') {
      if (payload.tilemapDocument && typeof payload.tilemapDocument === 'object') {
        return payload.tilemapDocument;
      }
      if (payload.tileMapDocument && typeof payload.tileMapDocument === 'object') {
        return payload.tileMapDocument;
      }
      if (payload.tilemap && typeof payload.tilemap === 'object') {
        return payload.tilemap;
      }
      if (payload.tileMap && typeof payload.tileMap === 'object') {
        return payload.tileMap;
      }
      if (typeof payload.tilemapDocumentPath === 'string' && payload.tilemapDocumentPath.trim()) {
        return payload.tilemapDocumentPath.trim();
      }
      if (typeof payload.tileMapDocumentPath === 'string' && payload.tileMapDocumentPath.trim()) {
        return payload.tileMapDocumentPath.trim();
      }
    }
    return null;
  }

  applyTilemapDocument(documentModel) {
    if (!documentModel || typeof documentModel !== 'object') {
      throw new Error('Tilemap document is missing.');
    }

    const map = documentModel.map || {};
    const tileSize = Number(map.tileSize) > 0 ? Number(map.tileSize) : 48;
    const layers = Array.isArray(documentModel.layers) ? documentModel.layers : [];
    const renderLayer = layers.find((layer) => layer && layer.kind === 'tile') || layers[0] || null;
    const collisionLayer = layers.find((layer) => layer && layer.kind === 'collision') || null;

    if (!renderLayer || !Array.isArray(renderLayer.data) || renderLayer.data.length === 0) {
      throw new Error('Tilemap document did not include a render layer.');
    }

    const rows = renderLayer.data.map((row) => Array.isArray(row) ? row.map((value) => Number.parseInt(value, 10) || 0) : []);
    const tilesetEntries = Array.isArray(documentModel.tileset) ? documentModel.tileset : [];
    const palette = {};
    tilesetEntries.forEach((entry) => {
      const id = Number.parseInt(entry?.id, 10);
      const color = typeof entry?.color === 'string' ? entry.color : '';
      if (Number.isInteger(id) && color) {
        palette[id] = color;
      }
    });
    if (!palette[0]) {
      palette[0] = '#1f2937';
    }

    const definitions = {};
    if (collisionLayer && Array.isArray(collisionLayer.data)) {
      collisionLayer.data.forEach((row, rowIndex) => {
        if (!Array.isArray(row)) {
          return;
        }
        row.forEach((cell, colIndex) => {
          if (Number(cell) === 1) {
            const tileId = Number(rows[rowIndex]?.[colIndex]) || 0;
            if (!definitions[tileId]) {
              definitions[tileId] = {
                solid: true,
                color: palette[tileId] || '#6366f1',
                label: `tile-${tileId}`
              };
            } else {
              definitions[tileId].solid = true;
            }
          }
        });
      });
    }

    this.tilemap = new Tilemap({
      tileSize,
      tiles: rows,
      palette,
      definitions
    });

    this.player.x = this.offset.x + 60;
    this.player.y = this.offset.y + 60;
  }

  async loadTilemapPreset() {
    try {
      const presetResponse = await fetch(TILEMAP_PRESET_PATH, { cache: 'no-store' });
      if (!presetResponse.ok) {
        throw new Error(`Preset request failed (${presetResponse.status}).`);
      }

      const samplePreset = await presetResponse.json();
      const extracted = this.extractTileMapDocumentFromSamplePreset(samplePreset);
      let documentModel = null;

      if (typeof extracted === 'string' && extracted.trim()) {
        const documentResponse = await fetch(extracted.trim(), { cache: 'no-store' });
        if (!documentResponse.ok) {
          throw new Error(`Tilemap document request failed (${documentResponse.status}).`);
        }
        documentModel = await documentResponse.json();
      } else if (extracted && typeof extracted === 'object') {
        documentModel = extracted;
      }

      if (!documentModel) {
        throw new Error('Preset payload did not include a tilemap document.');
      }

      this.applyTilemapDocument(documentModel);
      this.sampleStatus = 'Loaded tilemap preset from sample-0221-tile-map-editor.json';
      this.sampleError = '';
    } catch (error) {
      this.sampleStatus = 'Using fallback in-scene tilemap.';
      this.sampleError = error instanceof Error ? error.message : String(error);
    }
  }

  update(dt, engine) {
    const prev = { x: this.player.x, y: this.player.y };
    const move = this.player.speed * dt;

    if (engine.input.isDown('ArrowLeft')) this.player.x -= move;
    if (engine.input.isDown('ArrowRight')) this.player.x += move;
    if (engine.input.isDown('ArrowUp')) this.player.y -= move;
    if (engine.input.isDown('ArrowDown')) this.player.y += move;

    this.player.x = clamp(this.player.x, this.offset.x, this.offset.x + this.tilemap.width * this.tilemap.tileSize - this.player.width);
    this.player.y = clamp(this.player.y, this.offset.y, this.offset.y + this.tilemap.height * this.tilemap.tileSize - this.player.height);

    const hit = resolveRectVsTilemap(this.player, this.tilemap, this.offset);
    if (hit) {
      this.player.x = prev.x
      this.player.y = prev.y
      this.lastCollision = `tile @ ${hit.x},${hit.y}`
    } else {
      this.lastCollision = 'none'
    }
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Sample 0221',
      'Demonstrates tilemap rendering and tile-based collision',
      'This sample and Tilemap Studio load the same sample-0221-tile-map-editor.json source',
      'Use Arrow keys to move through the open tiles',
      `Collision: ${this.lastCollision}`,
      this.sampleError ? `${this.sampleStatus} (${this.sampleError})` : this.sampleStatus,
    ]);

    renderTilemap(renderer, this.tilemap, this.offset);
    renderer.drawRect(this.player.x, this.player.y, this.player.width, this.player.height, theme.getColor('actorFill'));
    renderer.strokeRect(this.player.x, this.player.y, this.player.width, this.player.height, '#ffffff', 1);

    drawPanel(renderer, 620, 34, 300, 126, 'Tilemap', [
      `Size: ${this.tilemap.width}x${this.tilemap.height}`,
      `Tile size: ${this.tilemap.tileSize}`,
      `Collision: ${this.lastCollision}`,
      'Map drives collision and rendering',
    ]);
  }
}
